const dotenv = require("dotenv");
const path = require("path");

// Load .env from root
dotenv.config({ path: path.join(__dirname, "../.env") });

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error("GEMINI_API_KEY is not defined in .env file.");
  process.exit(1);
}

async function run() {
  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
  try {
    console.log("Fetching models that support embedContent from Google AI Studio...");
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${await res.text()}`);
    }
    const data = await res.json();
    console.log("\n--- Available Models supporting embedContent ---");
    if (!data.models || data.models.length === 0) {
      console.log("No models returned.");
      return;
    }
    data.models.forEach(m => {
      const supportsEmbedding = m.supportedGenerationMethods && m.supportedGenerationMethods.includes("embedContent");
      if (supportsEmbedding) {
        console.log(`- Name: ${m.name}`);
        console.log(`  Display Name: ${m.displayName}`);
      }
    });
  } catch (error) {
    console.error("Failed to list embedding models:", error.message);
  }
}

run();
