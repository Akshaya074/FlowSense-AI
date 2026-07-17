import { genAI } from "../gemini";
import { qdrant } from "../qdrant";

const COLLECTION_NAME = "flowsense_summaries";

export async function queryRagSystem(userId, queryText) {
  if (!queryText || queryText.trim() === "") {
    throw new Error("Query text cannot be empty.");
  }

  // 1. Generate Query Vector Embedding using gemini-embedding-2 (must match 3072 dimensions)
  const embeddingModel = genAI.getGenerativeModel({ model: "gemini-embedding-2" });
  const embedResult = await embeddingModel.embedContent(queryText);
  const queryVector = embedResult.embedding.values;

  if (!queryVector || queryVector.length !== 3072) {
    throw new Error("Failed to generate correct query embeddings.");
  }

  // 2. Perform semantic search inside Qdrant collection, enforcing a strict tenant filter on userId
  const searchResults = await qdrant.search(COLLECTION_NAME, {
    vector: queryVector,
    filter: {
      must: [
        {
          key: "userId",
          match: {
            value: userId
          }
        }
      ]
    },
    limit: 3, // Retrieve top 3 most relevant matching summaries
    with_payload: true
  });

  // 3. If no summaries are indexed, return a helpful system message
  if (!searchResults || searchResults.length === 0) {
    return {
      answer: "I couldn't find any historical developer summaries related to your question. Make sure you compile summaries from your activity dashboard first!",
      references: []
    };
  }

  // 4. Construct prompt context from the matching summaries
  const contextText = searchResults
    .map((match) => {
      const payload = match.payload || {};
      return `### Summary Date: ${payload.date}\n${payload.content}`;
    })
    .join("\n\n---\n\n");

  const references = searchResults.map((match) => {
    const payload = match.payload || {};
    return {
      id: match.id,
      date: payload.date,
      score: match.score
    };
  });

  // 5. Invoke conversational pipeline with multi-model fallback resiliency
  const systemInstruction = `You are FlowSense AI, an intelligent RAG search assistant.
Your job is to answer user questions about their past coding sessions, research topics, and development activity.
Answer the user's question using ONLY the provided Daily Focus Summaries context logs.
If the context doesn't contain the answer, state that you don't have recorded logs regarding that topic.
Format your answer in professional Markdown, utilizing bold styling, lists, and headers where appropriate. Do not make up facts.`;

  const prompt = `Here are the relevant Daily Focus Summaries for context:\n\n${contextText}\n\nUser Question: ${queryText}\n\nProvide the answer based on the summaries:`;

  const modelsToTry = ["gemini-1.5-flash", "gemini-2.5-flash", "gemini-1.5-pro"];
  let answerContent = "";

  for (const modelName of modelsToTry) {
    try {
      console.log(`[FlowSense AI] Attempting RAG generation with: ${modelName}`);
      const model = genAI.getGenerativeModel({ 
        model: modelName,
        systemInstruction: systemInstruction
      });
      
      const result = await model.generateContent(prompt);
      answerContent = result.response.text();
      if (answerContent) {
        console.log(`[FlowSense AI] RAG search success with model: ${modelName}`);
        break; // Stop trying fallbacks once we get a successful answer
      }
    } catch (err) {
      console.error(`[FlowSense AI] Model "${modelName}" failed:`, err);
      // Loop continues to next model fallback
    }
  }

  if (!answerContent) {
    throw new Error("All AI model channels are experiencing temporary overloads. Please try again in a few seconds.");
  }

  return {
    answer: answerContent,
    references
  };
}
