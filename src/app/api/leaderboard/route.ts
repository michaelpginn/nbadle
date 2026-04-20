import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";
import { LEADERBOARD_SIZE } from "@/lib/constants";
import { getWeekOf } from "@/lib/dates";

export async function GET() {
  try {
    const prisma = getPrisma();
    const entries = await prisma.leaderboardEntry.findMany({
      where: { weekOf: getWeekOf() },
      orderBy: { streak: "desc" },
      take: 5,
      select: { id: true, username: true, streak: true },
    });
    return NextResponse.json({ entries });
  } catch (e) {
    console.error("[GET /api/leaderboard]", e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { username, streak } = await req.json();

    if (
      typeof username !== "string" ||
      username.trim().length === 0 ||
      username.length > 5
    ) {
      return NextResponse.json({ error: "Invalid username" }, { status: 400 });
    }
    if (
      typeof streak !== "number" ||
      streak <= 0 ||
      !Number.isInteger(streak)
    ) {
      return NextResponse.json({ error: "Invalid streak" }, { status: 400 });
    }

    const prisma = getPrisma();
    const weekOf = getWeekOf();

    const entries = await prisma.leaderboardEntry.findMany({
      where: { weekOf },
      orderBy: { streak: "desc" },
      take: LEADERBOARD_SIZE,
    });

    const full = entries.length >= LEADERBOARD_SIZE;
    const beatsLowest = !full || streak > entries[entries.length - 1].streak;

    if (!beatsLowest) {
      return NextResponse.json({ made: false });
    }

    await prisma.leaderboardEntry.create({
      data: { username: username.toUpperCase().slice(0, 5), streak, weekOf },
    });

    // If we now have more than 5, drop the lowest
    if (full) {
      const allEntries = await prisma.leaderboardEntry.findMany({
        where: { weekOf },
        orderBy: { streak: "desc" },
      });
      const toDrop = allEntries.slice(LEADERBOARD_SIZE);
      if (toDrop.length > 0) {
        await prisma.leaderboardEntry.deleteMany({
          where: { id: { in: toDrop.map((e) => e.id) } },
        });
      }
    }

    return NextResponse.json({ made: true });
  } catch (e) {
    console.error("[POST /api/leaderboard]", e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
