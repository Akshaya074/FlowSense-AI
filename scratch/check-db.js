const { Pool } = require("pg");
const { PrismaPg } = require("@prisma/adapter-pg");
const { PrismaClient } = require("@prisma/client");

const pool = new Pool({ connectionString: "postgresql://postgres:myPcLrwMOifQukxj@db.mzgvcgbyalrirfojlkaq.supabase.co:5432/postgres" });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("--- Users in Database ---");
  const users = await prisma.user.findMany();
  console.log(JSON.stringify(users, null, 2));

  console.log("--- Telemetry Events (Last 10) ---");
  const events = await prisma.telemetryEvent.findMany({
    orderBy: { createdAt: 'desc' },
    take: 10,
    include: {
      user: {
        select: {
          email: true,
          clerkId: true
        }
      }
    }
  });
  
  events.forEach(e => {
    console.log(`Event ID: ${e.id}`);
    console.log(`Type: ${e.eventType}`);
    console.log(`Resource: ${e.resourceName}`);
    console.log(`Timestamp: ${e.timestamp}`);
    console.log(`Created At: ${e.createdAt}`);
    console.log(`User: ${e.user?.email} (Clerk ID: ${e.user?.clerkId})`);
    console.log("------------------------");
  });
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
