import "dotenv/config";
import { createHmac } from "crypto";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

function hashNbaId(nbaId: string, key: string): string {
  return createHmac("sha256", key).update(nbaId).digest("base64url").slice(0, 8);
}

async function main() {
  const key = process.env.HASH_KEY;
  if (!key) throw new Error("HASH_KEY env var not set");

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  // Add nullable column (schema already declares it nullable)
  await prisma.$executeRawUnsafe(
    `ALTER TABLE "Player" ADD COLUMN IF NOT EXISTS "nbaIdHash" TEXT`
  );

  // Hash all players that don't have one yet (safe to re-run after seed)
  const players = await prisma.$queryRaw<{ id: number; nbaId: string }[]>`
    SELECT id, "nbaId" FROM "Player" WHERE "nbaIdHash" IS NULL
  `;
  console.log(`Computing hashes for ${players.length} players...`);

  for (const player of players) {
    const hash = hashNbaId(player.nbaId, key);
    await prisma.$executeRaw`UPDATE "Player" SET "nbaIdHash" = ${hash} WHERE id = ${player.id}`;
  }

  // Add unique index (Prisma's convention for @unique)
  await prisma.$executeRawUnsafe(
    `CREATE UNIQUE INDEX IF NOT EXISTS "Player_nbaIdHash_key" ON "Player"("nbaIdHash")`
  );

  console.log(`Done. Hashed ${players.length} players.`);
  await prisma.$disconnect();
  await pool.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
