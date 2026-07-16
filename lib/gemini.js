import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.warn("[FlowSense AI] Warning: GEMINI_API_KEY is not defined in environment variables.");
}

export const genAI = new GoogleGenerativeAI(apiKey || "placeholder-gemini-key");
