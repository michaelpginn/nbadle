import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const name = process.argv[2];
if (!name) {
  console.error("Usage: npm run get-hash <player name>");
  process.exit(1);
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const players = await prisma.player.findMany({
    where: { name: { contains: name, mode: "insensitive" } },
    select: { name: true, team: true, nbaIdHash: true },
  });

  if (players.length === 0) {
    console.log("No players found.");
  } else {
    for (const p of players) {
      console.log(`${p.name} (${p.team}): ${p.nbaIdHash ?? "no hash yet"}`);
    }
  }

  await prisma.$disconnect();
  await pool.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
