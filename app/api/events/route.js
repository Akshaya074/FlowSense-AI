import { validateToken } from "@/lib/services/telemetry";
import { rateLimit } from "@/lib/services/rate-limit";
import db from "@/lib/db";

export async function POST(req) {
  try {
    // 1. Extract and validate Bearer Token
    const authHeader = req.headers.get("authorization");
    const user = await validateToken(authHeader);
    
    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized: Invalid or missing token" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    // 2. Apply Rate Limiting (60 requests per 60 seconds) to prevent script spam
    const limitResult = await rateLimit(`events:${user.id}`, 60, 60);
    if (!limitResult.success) {
      return new Response(
        JSON.stringify({ 
          error: "Too Many Requests", 
          message: "Telemetry ingestion rate limit exceeded. Max 60 requests per minute." 
        }), 
        {
          status: 429,
          headers: { 
            "Content-Type": "application/json",
            "Retry-After": limitResult.reset.toString()
          },
        }
      );
    }

    // 3. Parse request JSON body
    const body = await req.json();
    const { eventType, resourceName, workspace, timestamp, metadata } = body;

    // 4. Request validation
    if (!eventType || !resourceName || !workspace || !timestamp) {
      return new Response(
        JSON.stringify({ error: "Bad Request: Missing required parameters (eventType, resourceName, workspace, timestamp)" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // 5. Write event to PostgreSQL via Prisma
    const event = await db.telemetryEvent.create({
      data: {
        userId: user.id,
        eventType,
        resourceName,
        workspace,
        timestamp: new Date(timestamp),
        metadata: metadata || {},
      },
    });

    // 6. Return 202 Accepted status (Common ingestion design pattern)
    return new Response(
      JSON.stringify({ success: true, message: "Event recorded", id: event.id }),
      {
        status: 202,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Telemetry ingestion error:", error);
    return new Response(
      JSON.stringify({ error: "Internal Server Error", details: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
