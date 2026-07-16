const { QdrantClient } = require("@qdrant/js-client-rest");
const dotenv = require("dotenv");
const path = require("path");

// Load .env from root
dotenv.config({ path: path.join(__dirname, "../.env") });

const qdrant = new QdrantClient({
  url: process.env.QDRANT_URL,
  apiKey: process.env.QDRANT_API_KEY
});

async function main() {
  console.log("Initializing index creation on Qdrant Cloud...");
  try {
    await qdrant.createPayloadIndex("flowsense_summaries", {
      field_name: "userId",
      field_schema: "keyword",
      wait: true
    });
    console.log("✓ Success! Payload index for 'userId' created successfully.");
  } catch (error) {
    console.error("Failed to create index:", error.message);
  }
}

main();
