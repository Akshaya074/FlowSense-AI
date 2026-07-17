import { auth, currentUser } from "@clerk/nextjs/server";
import { getOrCreateUserAndSeed } from "@/lib/services/user";
import db from "@/lib/db";

export async function GET(req) {
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
        console.error("[FlowSense AI] Clerk user fetch failed in timeline, running fallback seed:", clerkError);
        dbUser = await getOrCreateUserAndSeed(userId, "fallback-user@flowsense.ai");
      }
    }

    // 3. Parse pagination search parameters and filter query
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "5", 10); // Standardize on limit 5 matching client requests
    const skip = (page - 1) * limit;
    const type = searchParams.get("type") || "all";

    // Build Prisma query condition based on category filter selection
    const queryCondition = { userId: dbUser.id };
    if (type === "code") {
      queryCondition.eventType = { in: ["FILE_OPEN", "FILE_SAVE"] };
    } else if (type === "docs") {
      queryCondition.eventType = "DOC_VISIT";
    }

    // 4. Fetch telemetry events matching condition (take limit + 1 to check if there is another page)
    const events = await db.telemetryEvent.findMany({
      where: queryCondition,
      orderBy: { timestamp: "desc" },
      skip: skip,
      take: limit + 1,
    });

    // 5. Calculate pagination states
    const hasNextPage = events.length > limit;
    const paginatedEvents = hasNextPage ? events.slice(0, limit) : events;
    const nextPage = hasNextPage ? page + 1 : null;

    // 6. Return paginated event list
    return new Response(
      JSON.stringify({
        events: paginatedEvents,
        nextPage: nextPage,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Timeline query error:", error);
    return new Response(
      JSON.stringify({ error: "Internal Server Error", details: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
