import "dotenv/config";
import { createHash } from "crypto";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const TARGET_HASH = "FILL_IN_HERE";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function hashImageUrl(url: string): Promise<string | null> {
  const res = await fetch(url);
  if (!res.ok) return null;
  const buf = await res.arrayBuffer();
  return createHash("sha256").update(Buffer.from(buf)).digest("hex");
}

async function main() {
  const players = await prisma.player.findMany({
    select: { name: true, nbaId: true },
  });

  console.log(`Checking ${players.length} players...`);

  for (const player of players) {
    const url = `https://cdn.nba.com/headshots/nba/latest/1040x760/${player.nbaId}.png`;
    const hash = await hashImageUrl(url);
    if (hash === TARGET_HASH) {
      console.log(`Match: ${player.name}`);
    }
  }

  await prisma.$disconnect();
  await pool.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
