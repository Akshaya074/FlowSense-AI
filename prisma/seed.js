require("dotenv").config();
const { Pool } = require("pg");
const { PrismaPg } = require("@prisma/adapter-pg");
const { PrismaClient } = require("@prisma/client");
const crypto = require("crypto");

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding database with mock telemetry data...");

  // Clean existing tables to ensure repeat runs do not duplicate or error out
  await prisma.dailySummary.deleteMany();
  await prisma.telemetryEvent.deleteMany();
  await prisma.user.deleteMany();

  // Hash the mock token to match the API route hashing validation logic (SHA-256)
  const rawToken = "fs_pat_mock_token_key_abc123";
  const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");

  // Create a mock developer profile
  const user = await prisma.user.create({
    data: {
      email: "developer@flowsense.ai",
      clerkId: "user_mock_clerk_12345",
      token: hashedToken, // Stores hashed version in database
    },
  });

  console.log(`✓ Created User: ${user.email} (ID: ${user.id})`);

  const now = new Date();
  const oneDay = 24 * 60 * 60 * 1000;

  // Compile realistic telemetry logs across the past three days
  const events = [
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

  await prisma.telemetryEvent.createMany({
    data: events,
  });

  console.log(`✓ Created ${events.length} Telemetry Events`);
  console.log("Database successfully seeded!");
}

main()
  .catch((e) => {
    console.error("Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
