import db from "@/lib/db";

/**
 * Ensures a user exists in PostgreSQL when logging in.
 * If the user does not exist, creates their profile and seeds 8 default telemetry events.
 * @param {string} clerkId - The Clerk user ID
 * @param {string} email - The user's email address
 * @returns {Promise<object>} The existing or newly created User record
 */
export async function getOrCreateUserAndSeed(clerkId, email) {
  // Check if user exists in PostgreSQL
  let user = await db.user.findUnique({
    where: { clerkId },
  });

  if (!user) {
    console.log(`User ${email} (${clerkId}) not found in PostgreSQL. Creating profile and seeding default events...`);
    
    // Create the user
    user = await db.user.create({
      data: {
        email,
        clerkId,
        token: null, // Token generated on settings page later
      },
    });
  } else {
    // If user exists but has absolutely zero logged events, seed the default set
    const eventCount = await db.telemetryEvent.count({
      where: { userId: user.id }
    });
    if (eventCount > 0) {
      return user; // User has real logs, skip mock seeding
    }
    console.log(`User ${email} (${clerkId}) has no events. Seeding default mock timeline...`);
  }

    const now = new Date();
    const oneDay = 24 * 60 * 60 * 1000;

    // Create 8 default mock events linked to this specific user ID
    const mockEvents = [
      // Today
      {
        userId: user.id,
        eventType: "FILE_OPEN",
        resourceName: "app/page.js",
        workspace: "FlowSense-AI",
        timestamp: new Date(now.getTime() - 2 * 60 * 60 * 1000), // 2 hours ago
        metadata: { language: "javascript" },
      },
      {
        userId: user.id,
        eventType: "FILE_SAVE",
        resourceName: "app/page.js",
        workspace: "FlowSense-AI",
        timestamp: new Date(now.getTime() - 1.5 * 60 * 60 * 1000), // 1.5 hours ago
        metadata: { language: "javascript", linesCount: 142 },
      },
      {
        userId: user.id,
        eventType: "DOC_VISIT",
        resourceName: "https://react.dev/reference/react/useState",
        workspace: "react.dev",
        timestamp: new Date(now.getTime() - 1 * 60 * 60 * 1000), // 1 hour ago
        metadata: { title: "useState - React Docs" },
      },
      {
        userId: user.id,
        eventType: "FILE_SAVE",
        resourceName: "components/dashboard-sidebar.jsx",
        workspace: "FlowSense-AI",
        timestamp: new Date(now.getTime() - 30 * 60 * 1000), // 30 mins ago
        metadata: { language: "javascript", linesCount: 88 },
      },

      // Yesterday
      {
        userId: user.id,
        eventType: "FILE_OPEN",
        resourceName: "package.json",
        workspace: "FlowSense-AI",
        timestamp: new Date(now.getTime() - oneDay - 4 * 60 * 60 * 1000),
        metadata: { language: "json" },
      },
      {
        userId: user.id,
        eventType: "DOC_VISIT",
        resourceName: "https://clerk.com/docs/references/nextjs/clerk-middleware",
        workspace: "clerk.com",
        timestamp: new Date(now.getTime() - oneDay - 3 * 60 * 60 * 1000),
        metadata: { title: "clerkMiddleware | Clerk Docs" },
      },
      {
        userId: user.id,
        eventType: "FILE_SAVE",
        resourceName: "middleware.js",
        workspace: "FlowSense-AI",
        timestamp: new Date(now.getTime() - oneDay - 2.5 * 60 * 60 * 1000),
        metadata: { language: "javascript", linesCount: 22 },
      },

      // 2 Days ago
      {
        userId: user.id,
        eventType: "FILE_SAVE",
        resourceName: "docs/SRS.md",
        workspace: "FlowSense-AI",
        timestamp: new Date(now.getTime() - 2 * oneDay - 6 * 60 * 60 * 1000),
        metadata: { language: "markdown", linesCount: 300 },
      },
    ];

    await db.telemetryEvent.createMany({
      data: mockEvents,
    });

    console.log(`✓ Seeded ${mockEvents.length} events for user: ${email}`);

  return user;
}
