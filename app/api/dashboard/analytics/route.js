import { auth, currentUser } from "@clerk/nextjs/server";
import { getOrCreateUserAndSeed } from "@/lib/services/user";
import { getUserAnalytics } from "@/lib/services/analytics";
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
        console.error("[FlowSense AI] Clerk user fetch failed in analytics, running fallback seed:", clerkError);
        dbUser = await getOrCreateUserAndSeed(userId, "fallback-user@flowsense.ai");
      }
    }

    // 3. Trigger analytics calculation & fetch cached/fresh stats
    const analyticsData = await getUserAnalytics(dbUser.id);

    return new Response(JSON.stringify(analyticsData), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Dashboard analytics query error:", error);
    return new Response(
      JSON.stringify({ error: "Internal Server Error", message: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
