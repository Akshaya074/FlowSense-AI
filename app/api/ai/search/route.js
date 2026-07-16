import { auth, currentUser } from "@clerk/nextjs/server";
import { getOrCreateUserAndSeed } from "@/lib/services/user";
import { queryRagSystem } from "@/lib/services/rag";
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

    // 2. Query local database first by clerkId to bypass Clerk API Rate Limits
    let dbUser = await db.user.findUnique({
      where: { clerkId: userId }
    });

    if (!dbUser) {
      try {
        const clerkUser = await currentUser();
        const email = clerkUser?.emailAddresses?.[0]?.emailAddress || "no-email@flowsense.ai";
        dbUser = await getOrCreateUserAndSeed(userId, email);
      } catch (clerkError) {
        console.error("[FlowSense AI] Clerk user fetch failed in RAG search, running fallback seed:", clerkError);
        dbUser = await getOrCreateUserAndSeed(userId, "fallback-user@flowsense.ai");
      }
    }

    // 3. Apply Rate Limiting (5 queries per 60 seconds) to avoid LLM quota depletion
    const limitResult = await rateLimit(`search:${dbUser.id}`, 5, 60);
    if (!limitResult.success) {
      return new Response(
        JSON.stringify({ 
          error: "Too Many Requests", 
          message: "Ask FlowSense rate limit exceeded. Max 5 queries per minute." 
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

    // 4. Parse request body for the user search query
    let body = {};
    try {
      body = await req.json();
    } catch (e) {
      // Body can be empty
    }

    const { query } = body;
    if (!query || query.trim() === "") {
      return new Response(
        JSON.stringify({ error: "Bad Request", message: "Search query is required." }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // 5. Trigger the RAG pipeline search and formulate answer
    const ragResult = await queryRagSystem(dbUser.id, query);

    return new Response(JSON.stringify(ragResult), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("RAG search query error:", error);
    return new Response(
      JSON.stringify({ error: "Internal Server Error", message: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
