const { Pool } = require("pg");
const { PrismaPg } = require("@prisma/adapter-pg");
const { PrismaClient } = require("@prisma/client");

const pool = new Pool({ connectionString: "postgresql://postgres:myPcLrwMOifQukxj@db.mzgvcgbyalrirfojlkaq.supabase.co:5432/postgres" });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Cleaning database user tokens...");
  
  const users = await prisma.user.findMany();
  
  for (const user of users) {
    if (user.token) {
      const trimmed = user.token.trim();
      if (trimmed !== user.token) {
        await prisma.user.update({
          where: { id: user.id },
          data: { token: trimmed }
        });
        console.log(`✓ Trimmed trailing whitespace/newline from token for user: ${user.email}`);
      }
    }
  }
  
  console.log("Clean-up completed successfully!");
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
