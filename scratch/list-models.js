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
    console.log("Fetching supported models list from Google AI Studio...");
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${await res.text()}`);
    }
    const data = await res.json();
    console.log("\n--- Available Models supporting generateContent ---");
    if (!data.models || data.models.length === 0) {
      console.log("No models returned. Your API Key might have zero permissions.");
      return;
    }
    data.models.forEach(m => {
      const supportsContent = m.supportedGenerationMethods && m.supportedGenerationMethods.includes("generateContent");
      if (supportsContent) {
        console.log(`- Name: ${m.name}`);
        console.log(`  Display Name: ${m.displayName}`);
      }
    });
  } catch (error) {
    console.error("Failed to list models:", error.message);
  }
}

run();
