import db from "../db";
import { redis } from "../redis";

// Helper to extract file extension name from file resource name
function getLanguageFromFilename(filename) {
  if (!filename) return "Unknown";
  const ext = filename.split(".").pop().toLowerCase();
  
  const map = {
    js: "JavaScript",
    jsx: "React (JSX)",
    ts: "TypeScript",
    tsx: "React (TSX)",
    py: "Python",
    go: "Go",
    rs: "Rust",
    html: "HTML",
    css: "CSS",
    json: "JSON",
    md: "Markdown",
    sh: "Shell Script",
    prisma: "Prisma Schema"
  };

  return map[ext] || "Other";
}

// Helper to extract clean domain/hostname from documentation visit URL
function getDomainFromUrl(urlStr) {
  if (!urlStr) return "Unknown Reference";
  try {
    const url = new URL(urlStr);
    return url.hostname.replace("www.", "");
  } catch (e) {
    // If not a valid URL, return a fallback substring
    const match = urlStr.match(/https?:\/\/([^/]+)/);
    return match ? match[1].replace("www.", "") : urlStr.slice(0, 20);
  }
}

// Compile daily coding sessions time using telemetry timestamp gaps
function computeCodingMinutes(events) {
  const codingEvents = events.filter(e => e.eventType.startsWith("FILE_"));
  if (codingEvents.length === 0) return 0;
  if (codingEvents.length === 1) return 15; // 15 mins default for single event

  const sorted = [...codingEvents].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  
  let totalMinutes = 0;
  let sessionStart = new Date(sorted[0].timestamp);
  let lastTime = new Date(sorted[0].timestamp);

  for (let i = 1; i < sorted.length; i++) {
    const current = new Date(sorted[i].timestamp);
    const diffMinutes = (current - lastTime) / (1000 * 60);

    if (diffMinutes > 30) {
      const sessionLength = Math.max(15, (lastTime - sessionStart) / (1000 * 60) + 15);
      totalMinutes += sessionLength;
      sessionStart = current;
    }
    lastTime = current;
  }
  
  const sessionLength = Math.max(15, (lastTime - sessionStart) / (1000 * 60) + 15);
  totalMinutes += sessionLength;
  return totalMinutes;
}

// Core database aggregation pipeline
async function compileAnalyticsData(userId) {
  // Define time bounds (Past 7 days)
  const now = new Date();
  const startOfPeriod = new Date();
  startOfPeriod.setUTCDate(now.getUTCDate() - 6);
  startOfPeriod.setUTCHours(0, 0, 0, 0);

  // 1. Fetch telemetry events from PostgreSQL for the past 7 days
  const events = await db.telemetryEvent.findMany({
    where: {
      userId,
      timestamp: { gte: startOfPeriod }
    },
    orderBy: { timestamp: "asc" }
  });

  // 2. Generate 7-day calendar array (Mon, Tue, Wed, etc.)
  const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const activityMap = {};

  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setUTCDate(now.getUTCDate() - i);
    const dateStr = d.toISOString().split("T")[0]; // YYYY-MM-DD
    const label = weekdays[d.getUTCDay()];
    activityMap[dateStr] = { date: label, dateKey: dateStr, saves: 0, visits: 0, minutes: 0, events: [] };
  }

  // Distribute database events into their daily buckets
  events.forEach((e) => {
    const dateStr = new Date(e.timestamp).toISOString().split("T")[0];
    if (activityMap[dateStr]) {
      activityMap[dateStr].events.push(e);
      if (e.eventType === "FILE_SAVE") {
        activityMap[dateStr].saves += 1;
      } else if (e.eventType === "DOC_VISIT") {
        activityMap[dateStr].visits += 1;
      }
    }
  });

  // Calculate coding session time per day
  Object.keys(activityMap).forEach((dateStr) => {
    const bucket = activityMap[dateStr];
    bucket.minutes = Math.round(computeCodingMinutes(bucket.events));
    delete bucket.events; // Strip raw events to keep payloads light
  });

  const dailyActivityTrends = Object.values(activityMap);

  // 3. Aggregate Programming Languages Distribution
  const languageCounts = {};
  let totalSaves = 0;

  events
    .filter((e) => e.eventType === "FILE_SAVE")
    .forEach((e) => {
      const lang = getLanguageFromFilename(e.resourceName);
      languageCounts[lang] = (languageCounts[lang] || 0) + 1;
      totalSaves += 1;
    });

  const languages = Object.entries(languageCounts).map(([name, count]) => ({
    name,
    count,
    value: totalSaves > 0 ? Math.round((count / totalSaves) * 100) : 0
  })).sort((a, b) => b.count - a.count);

  // 4. Aggregate Top Visited Documentation Domains
  const domainCounts = {};

  events
    .filter((e) => e.eventType === "DOC_VISIT")
    .forEach((e) => {
      const domain = getDomainFromUrl(e.resourceName);
      domainCounts[domain] = (domainCounts[domain] || 0) + 1;
    });

  const topDocumentationDomains = Object.entries(domainCounts)
    .map(([domain, visits]) => ({ domain, visits }))
    .sort((a, b) => b.visits - a.visits)
    .slice(0, 5); // Take top 5

  // 5. Aggregate General Summary Metrics
  const totalEventsCount = events.length;
  const uniqueFilesModified = new Set(
    events.filter((e) => e.eventType === "FILE_SAVE").map((e) => e.resourceName)
  ).size;
  const totalDocVisits = events.filter((e) => e.eventType === "DOC_VISIT").length;
  const totalCodingMinutes = dailyActivityTrends.reduce((sum, d) => sum + d.minutes, 0);
  const totalHours = Math.floor(totalCodingMinutes / 60);
  const totalMins = Math.round(totalCodingMinutes % 60);

  return {
    dailyActivityTrends,
    languages,
    topDocumentationDomains,
    metrics: {
      totalEventsCount,
      uniqueFilesModified,
      totalDocVisits,
      totalCodingTimeFormatted: `${totalHours}h ${totalMins}m`,
      totalCodingMinutes
    }
  };
}

// Exportable service handling Redis caches
export async function getUserAnalytics(userId) {
  const cacheKey = `analytics:${userId}`;
  
  try {
    const cachedData = await redis.get(cacheKey);
    if (cachedData) {
      console.log(`[FlowSense AI] Serving Analytics Cache for user: ${userId}`);
      // Parse if string (Upstash sometimes returns parsed JSON automatically depending on client configurations)
      return typeof cachedData === "string" ? JSON.parse(cachedData) : cachedData;
    }
  } catch (err) {
    console.error("[FlowSense AI] Redis Analytics cache read failed:", err);
  }

  // Recalculate fresh telemetry statistics
  const analytics = await compileAnalyticsData(userId);

  try {
    // Cache for 5 minutes (300 seconds)
    await redis.set(cacheKey, JSON.stringify(analytics), { ex: 300 });
    console.log(`[FlowSense AI] Saved fresh Analytics to Redis for user: ${userId}`);
  } catch (err) {
    console.error("[FlowSense AI] Redis Analytics cache write failed:", err);
  }

  return analytics;
}
