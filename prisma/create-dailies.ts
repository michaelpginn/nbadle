import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { DAILY_LENGTH } from "@/lib/constants";
import { getDayOf } from "@/lib/dates";

const num_days = parseInt(process.argv[2]);
if (!num_days) {
  console.error("Usage: npm run create-dailies <num days>");
  process.exit(1);
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const today = new Date();
  const existingDailies = await prisma.dailyGame.findMany({
    select: { id: true },
    where: { gameDate: { gte: getDayOf(today) } },
    take: num_days,
    orderBy: { gameDate: "asc" },
  });
  const playerCount = await prisma.player.count();
  const playerIds = await prisma.player.findMany({
    select: { id: true },
    orderBy: { id: "asc" },
  });
  console.log(
    `Found ${existingDailies.length} existing dailies to be rewritten. Adding ${num_days - existingDailies.length} new entries.`,
  );

  for (let dateIndex = 0; dateIndex < num_days; dateIndex++) {
    const dayOf = new Date(
      getDayOf(today).getTime() + dateIndex * 24 * 60 * 60 * 1000,
    );
    const dayOfString = dayOf.toISOString().slice(0, 10);

    // Generate 10 matchups according to this random seed
    const matchups: {
      player1Id: number;
      player2Id: number;
      turnIndex: number;
    }[] = [];
    for (let matchupIndex = 0; matchupIndex < DAILY_LENGTH; matchupIndex++) {
      const offset1 = Math.floor(Math.random() * playerCount);
      let offset2 = Math.floor(Math.random() * (playerCount - 1));
      if (offset2 >= offset1) offset2++;
      matchups.push({
        player1Id: playerIds[offset1].id,
        player2Id: playerIds[offset2].id,
        turnIndex: matchupIndex,
      });
    }

    if (dateIndex < existingDailies.length) {
      await prisma.dailyGame.update({
        where: { id: existingDailies[dateIndex].id },
        data: { matchups: { deleteMany: {}, create: matchups } },
      });
      console.log(`Updating existing for ${dayOfString}`);
    } else {
      await prisma.dailyGame.create({
        data: {
          matchups: { create: matchups },
          gameDate: dayOf,
          correctPerTurn: Array(DAILY_LENGTH).fill(0),
          numUsersPerScore: Array(DAILY_LENGTH).fill(0),
        },
      });
      console.log(`Creating new game for ${dayOfString}`);
    }
  }

  await prisma.$disconnect();
  await pool.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
