import { auth, currentUser } from "@clerk/nextjs/server";
import { getOrCreateUserAndSeed } from "@/lib/services/user";
import { generateDailySummary } from "@/lib/services/ai";
import { rateLimit } from "@/lib/services/rate-limit";
import db from "@/lib/db";

export async function POST(req) {
  try {
    // 1. Authenticate user session via Clerk (local JWT decrypt)
    const { userId } = await auth();
    if (!userId) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    // 2. Query local database first by clerkId to bypass Clerk currentUser API Rate Limits
    let dbUser = await db.user.findUnique({
      where: { clerkId: userId }
    });

    if (!dbUser) {
      try {
        // Fetch Clerk email metadata *only* on the first-ever API access
        const clerkUser = await currentUser();
        const email = clerkUser?.emailAddresses?.[0]?.emailAddress || "no-email@flowsense.ai";
        dbUser = await getOrCreateUserAndSeed(userId, email);
      } catch (clerkError) {
        console.error("[FlowSense AI] Clerk user fetch failed, running fallback seed:", clerkError);
        dbUser = await getOrCreateUserAndSeed(userId, "fallback-user@flowsense.ai");
      }
    }

    // 3. Apply Rate Limiting (3 compiles per 60 seconds) to save LLM/vector billing quotas
    const limitResult = await rateLimit(`summary:${dbUser.id}`, 3, 60);
    if (!limitResult.success) {
      return new Response(
        JSON.stringify({ 
          error: "Too Many Requests", 
          message: "Focus Summary generation rate limit exceeded. Max 3 compiles per minute." 
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

    // 4. Parse request body for the target date (format: YYYY-MM-DD)
    let body = {};
    try {
      body = await req.json();
    } catch (e) {
      // Body can be empty
    }

    // Default to current calendar date (format: YYYY-MM-DD)
    const dateStr = body.date || new Date().toISOString().split('T')[0];

    // 5. Trigger AI Daily Focus Summary generation & Qdrant vector uploads
    const dailySummary = await generateDailySummary(dbUser.id, dateStr);

    return new Response(JSON.stringify(dailySummary), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("AI summarization error:", error);
    
    // Distinguish user errors (like no telemetry logs) from server errors
    const isUserError = error.message.includes("No telemetry activity logs found");
    const status = isUserError ? 400 : 500;
    
    return new Response(
      JSON.stringify({ 
        error: isUserError ? "Bad Request" : "Internal Server Error", 
        message: error.message 
      }), 
      {
        status: status,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
