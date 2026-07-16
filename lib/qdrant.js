import { QdrantClient } from "@qdrant/js-client-rest";

const url = process.env.QDRANT_URL;
const apiKey = process.env.QDRANT_API_KEY;

if (!url) {
  console.warn("[FlowSense AI] Warning: QDRANT_URL is not defined in environment variables.");
}

export const qdrant = new QdrantClient({
  url: url || "http://localhost:6333",
  apiKey: apiKey || undefined,
});
