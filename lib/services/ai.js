import { genAI } from "../gemini";
import { qdrant } from "../qdrant";
import db from "../db";

const COLLECTION_NAME = "flowsense_summaries";

// Ensure the Qdrant Collection exists with appropriate vector configuration (3072 dimensions for Gemini Embedding 2)
async function ensureQdrantCollection() {
  try {
    const collectionsResponse = await qdrant.getCollections();
    const exists = collectionsResponse.collections.some(
      (c) => c.name === COLLECTION_NAME
    );

    if (exists) {
      try {
        // Double check the existing collection's vector size config
        const info = await qdrant.getCollection(COLLECTION_NAME);
        const size = info.config?.params?.vectors?.size;
        
        if (size !== 3072) {
          console.log(`[Qdrant] Vector dimension mismatch (${size} vs 3072). Recreating collection...`);
          await qdrant.deleteCollection(COLLECTION_NAME);
          await createNewCollection();
        } else {
          // If size is correct, check and create payload index for userId
          const payloadSchema = info.payload_schema || {};
          if (!payloadSchema.userId) {
            console.log(`[Qdrant] Creating missing payload index for "userId" in existing collection...`);
            await qdrant.createPayloadIndex(COLLECTION_NAME, {
              field_name: "userId",
              field_schema: "keyword",
              wait: true
            });
            console.log("[Qdrant] Missing payload index created successfully.");
          }
        }
      } catch (configErr) {
        console.error("[Qdrant] Failed to verify collection info, recreation bypassed:", configErr);
      }
    } else {
      await createNewCollection();
    }
  } catch (error) {
    console.error("[Qdrant] Error initializing collection:", error);
    throw new Error("Failed to initialize vector database collection.");
  }
}

// Helper to create the Qdrant collection with 3072 dimensions and payload indexes
async function createNewCollection() {
  console.log(`[Qdrant] Creating collection: ${COLLECTION_NAME} (3072 dimensions)`);
  await qdrant.createCollection(COLLECTION_NAME, {
    vectors: {
      size: 3072, // Gemini Embedding 2 output size
      distance: "Cosine"
    }
  });
  console.log(`[Qdrant] Collection ${COLLECTION_NAME} created successfully.`);

  // Create payload index for userId to support Tenant Filtering
  console.log(`[Qdrant] Creating payload index for "userId"...`);
  await qdrant.createPayloadIndex(COLLECTION_NAME, {
    field_name: "userId",
    field_schema: "keyword",
    wait: true
  });
  console.log(`[Qdrant] Payload index for "userId" created successfully.`);
}

// Format raw events to clean string representations for LLM prompting
function formatEventsLog(events) {
  return events
    .map((e) => {
      const timeStr = new Date(e.timestamp).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit"
      });
      if (e.eventType === "FILE_SAVE") {
        const lines = e.metadata?.linesCount ? ` (${e.metadata.linesCount} lines)` : "";
        return `[${timeStr}] SAVED FILE: ${e.resourceName} in workspace: ${e.workspace}${lines}`;
      }
      if (e.eventType === "FILE_OPEN") {
        return `[${timeStr}] OPENED FILE: ${e.resourceName} in workspace: ${e.workspace}`;
      }
      if (e.eventType === "DOC_VISIT") {
        const title = e.metadata?.title || "Documentation Reference";
        return `[${timeStr}] VISITED DOCS: "${title}" at URL: ${e.resourceName}`;
      }
      return `[${timeStr}] EVENT: ${e.eventType} - ${e.resourceName}`;
    })
    .join("\n");
}

export async function generateDailySummary(userId, dateStr) {
  // 1. Query all events for the target date
  const startOfDay = new Date(`${dateStr}T00:00:00.000Z`);
  const endOfDay = new Date(`${dateStr}T23:59:59.999Z`);

  const events = await db.telemetryEvent.findMany({
    where: {
      userId,
      timestamp: {
        gte: startOfDay,
        lte: endOfDay
      }
    },
    orderBy: { timestamp: "asc" }
  });

  if (!events || events.length === 0) {
    throw new Error(`No telemetry activity logs found for ${dateStr}.`);
  }

  // 2. Format the logs into context text
  const formattedLogs = formatEventsLog(events);

  // 3. Invoke summarization with multi-model fallback resiliency
  const systemInstruction = `You are FlowSense AI, an intelligent developer tracking and summarization system.
Your job is to read raw timestamped log summaries of a developer's day and synthesize them into a professional, concise, and structured Daily Focus Summary.
Format your response in GitHub-style Markdown with these exact sections:
### 🚀 Key Focus Areas
- A bulleted list of 2-3 main tasks or topics the developer spent time on (e.g. file saves, library setups, debugging).
### 📚 Documentation Visited
- A bulleted list showing the primary reference documentation pages visited, including brief descriptions of what they researched.
### 💡 Summary & Insights
- A short, 3-4 sentence paragraph summarizing their workflow momentum, highlighting highlights, and providing a tip for tomorrow.

Keep the tone professional, encouraging, and focused strictly on the technical details in the logs. Avoid fluff.`;

  const prompt = `Here are the developer activity logs for ${dateStr}:\n\n${formattedLogs}\n\nGenerate their focus summary:`;

  const modelsToTry = ["gemini-1.5-flash", "gemini-2.5-flash", "gemini-1.5-pro"];
  let summaryContent = "";

  for (const modelName of modelsToTry) {
    try {
      console.log(`[FlowSense AI] Attempting daily summary generation with: ${modelName}`);
      const model = genAI.getGenerativeModel({ 
        model: modelName,
        systemInstruction: systemInstruction
      });
      
      // Try up to 2 attempts for the specific model before sliding to the next fallback
      let innerResult = null;
      for (let attempt = 1; attempt <= 2; attempt++) {
        try {
          const result = await model.generateContent(prompt);
          innerResult = result.response.text();
          if (innerResult) break;
        } catch (innerErr) {
          if (attempt >= 2) throw innerErr;
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      }

      if (innerResult) {
        summaryContent = innerResult;
        console.log(`[FlowSense AI] Daily summary success with model: ${modelName}`);
        break; // Stop fallbacks once successful
      }
    } catch (err) {
      console.warn(`[FlowSense AI] Model "${modelName}" failed during summary generation: ${err.message}`);
    }
  }

  if (!summaryContent) {
    throw new Error("All AI model channels are experiencing temporary overloads. Please try again in a few seconds.");
  }

  // 4. Save/Upsert markdown summary into PostgreSQL
  const dailySummary = await db.dailySummary.upsert({
    where: {
      userId_date: {
        userId,
        date: dateStr
      }
    },
    update: {
      content: summaryContent
    },
    create: {
      userId,
      date: dateStr,
      content: summaryContent
    }
  });

  // 5. Generate Vector Embeddings using Gemini gemini-embedding-2 model
  const embeddingModel = genAI.getGenerativeModel({ model: "gemini-embedding-2" });
  const embedResult = await embeddingModel.embedContent(summaryContent);
  const vector = embedResult.embedding.values;

  if (!vector || vector.length !== 3072) {
    throw new Error("Failed to generate correct 3072-dimension embeddings.");
  }

  // 6. Ensure Qdrant collection is ready (will auto-recreate to 3072 dimensions and add indexes if needed) and upsert vector payload
  await ensureQdrantCollection();
  
  await qdrant.upsert(COLLECTION_NAME, {
    wait: true,
    points: [
      {
        id: dailySummary.id, // Direct 1-to-1 UUID mapping between Postgres and Qdrant
        vector,
        payload: {
          userId,
          date: dateStr,
          content: summaryContent
        }
      }
    ]
  });

  console.log(`[FlowSense AI] Successfully generated and stored summary and embeddings for user ${userId} on ${dateStr}`);
  return dailySummary;
}
