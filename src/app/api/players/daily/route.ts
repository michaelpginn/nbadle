import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";
import { getDayOf } from "@/lib/dates";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const turnIndex = searchParams.get("turn");
  if (turnIndex == null || isNaN(parseInt(turnIndex))) {
    return NextResponse.json({ error: "No turn index" }, { status: 500 });
  }
  try {
    const prisma = getPrisma();
    const date = getDayOf(new Date());

    const dailyGame = await prisma.dailyGame.findFirst({
      where: {
        gameDate: date,
      },
    });
    const matchup = await prisma.playerMatchup.findFirst({
      where: {
        dailyGameId: dailyGame?.id,
        turnIndex: parseInt(turnIndex),
      },
      include: { player1: true, player2: true },
    });

    if (!matchup) {
      return NextResponse.json(
        { error: "Failed to fetch players" },
        { status: 500 },
      );
    }
    const { player1, player2 } = matchup;

    return NextResponse.json({ player1, player2 });
  } catch (e) {
    console.error("[/api/players/daily]", e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
