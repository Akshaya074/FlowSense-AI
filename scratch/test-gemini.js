const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require("dotenv");
const path = require("path");

// Load .env from root
dotenv.config({ path: path.join(__dirname, "../.env") });

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error("GEMINI_API_KEY is not defined in .env file.");
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);

async function run() {
  const models = [
    "gemini-3.5-flash",
    "gemini-flash-latest",
    "gemini-2.0-flash-lite",
    "gemini-2.5-flash-lite",
    "gemini-pro-latest"
  ];
  
  console.log("Starting model checks for available models...");
  
  for (const modelName of models) {
    try {
      console.log(`\nTesting model: "${modelName}"...`);
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent("Hello!");
      console.log(`✓ SUCCESS! Model "${modelName}" works. Response: "${result.response.text().trim()}"`);
    } catch (e) {
      console.log(`✗ FAILED for model "${modelName}": ${e.message}`);
    }
  }
}

run();
