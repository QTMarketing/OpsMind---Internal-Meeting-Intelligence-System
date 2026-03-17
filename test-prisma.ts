import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool as unknown as ConstructorParameters<typeof PrismaPg>[0]);
const prisma = new PrismaClient({ adapter });

async function main() {
  try {
    console.log("Checking Prisma Client instantiation...");
    const meetingCount = await prisma.meeting.count();
    console.log(`Connection successful! Meeting count: ${meetingCount}`);
  } catch (error) {
    console.error("Prisma Client test failed:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
