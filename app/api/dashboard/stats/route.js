import { auth } from "@clerk/nextjs/server";
import db from "@/lib/db";

// Helper to calculate developer session times from event timestamps
function calculateCodingTime(events) {
  const codingEvents = events.filter(e => e.eventType.startsWith("FILE_"));
  if (codingEvents.length === 0) return "0h 0m";
  if (codingEvents.length === 1) return "0h 15m"; // 15 mins default for single save

  // Sort timestamps ascending
  const sorted = [...codingEvents].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  
  let totalMinutes = 0;
  let sessionStart = new Date(sorted[0].timestamp);
  let lastTime = new Date(sorted[0].timestamp);

  for (let i = 1; i < sorted.length; i++) {
    const current = new Date(sorted[i].timestamp);
    const diffMinutes = (current - lastTime) / (1000 * 60);

    // If gap between file saves is more than 30 minutes, treat as separate sessions
    if (diffMinutes > 30) {
      const sessionLength = Math.max(15, (lastTime - sessionStart) / (1000 * 60) + 15);
      totalMinutes += sessionLength;
      sessionStart = current;
    }
    lastTime = current;
  }
  
  // Close final active session
  const sessionLength = Math.max(15, (lastTime - sessionStart) / (1000 * 60) + 15);
  totalMinutes += sessionLength;

  const hours = Math.floor(totalMinutes / 60);
  const mins = Math.round(totalMinutes % 60);
  return `${hours}h ${mins}m`;
}

export async function GET(req) {
  try {
    // 1. Authenticate session
    const { userId } = await auth();
    if (!userId) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    // 2. Fetch database user
    const dbUser = await db.user.findUnique({
      where: { clerkId: userId },
    });

    if (!dbUser) {
      return new Response(
        JSON.stringify({
          codingTime: "0h 0m",
          filesModifiedCount: 0,
          docVisitsCount: 0,
          recentEvents: [],
          latestSummary: null,
          totalEventsCount: 0,
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // 3. Define timezone boundary for "Today" (Using UTC for consistency in portfolio project)
    const startOfToday = new Date();
    startOfToday.setUTCHours(0, 0, 0, 0);

    // 4. Query telemetry events recorded today
    const todayEvents = await db.telemetryEvent.findMany({
      where: {
        userId: dbUser.id,
        timestamp: { gte: startOfToday },
      },
    });

    // 5. Query total event count (to determine if any data exists)
    const totalEventsCount = await db.telemetryEvent.count({
      where: { userId: dbUser.id },
    });

    // 6. Compute metrics
    const filesModified = new Set(
      todayEvents
        .filter(e => e.eventType === "FILE_SAVE")
        .map(e => e.resourceName)
    );
    const docVisitsCount = todayEvents.filter(e => e.eventType === "DOC_VISIT").length;
    const codingTime = calculateCodingTime(todayEvents);

    // 7. Fetch recent 3 events overall
    const recentEvents = await db.telemetryEvent.findMany({
      where: { userId: dbUser.id },
      orderBy: { timestamp: "desc" },
      take: 3,
    });

    // 8. Fetch latest Daily Summary
    const todayStr = new Date().toISOString().split("T")[0]; // YYYY-MM-DD format
    const latestSummary = await db.dailySummary.findUnique({
      where: {
        userId_date: {
          userId: dbUser.id,
          date: todayStr,
        },
      },
    });

    return new Response(
      JSON.stringify({
        codingTime,
        filesModifiedCount: filesModified.size,
        docVisitsCount,
        recentEvents,
        latestSummary,
        totalEventsCount,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Dashboard stats query error:", error);
    return new Response(
      JSON.stringify({ error: "Internal Server Error", details: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
