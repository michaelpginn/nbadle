import { NextRequest, NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";
import { calculateNewElos, expectedScore } from "@/lib/elo";
import { getDayOf } from "@/lib/dates";

interface VoteRequestBody {
  winnerId: number;
  loserId: number;
}

export async function POST(req: NextRequest) {
  const prisma = getPrisma();

  let body: VoteRequestBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  try {

  const { winnerId, loserId } = body;

  if (!winnerId || !loserId || winnerId === loserId) {
    return NextResponse.json({ error: "Invalid player IDs" }, { status: 400 });
  }

  const [winner, loser, dailyGame] = await Promise.all([
    prisma.player.findUnique({ where: { id: winnerId } }),
    prisma.player.findUnique({ where: { id: loserId } }),
    prisma.dailyGame.findFirst({
      where: { gameDate: getDayOf(new Date()) },
      select: { matchups: { select: { player1Id: true, player2Id: true } } },
    }),
  ]);

  if (!winner || !loser) {
    return NextResponse.json(
      { error: "Player(s) not found" },
      { status: 404 }
    );
  }

  const dailyPlayerIds = new Set(
    dailyGame?.matchups.flatMap((m) => [m.player1Id, m.player2Id]) ?? [],
  );

  const winnerExpected = expectedScore(winner.elo, loser.elo);
  const loserExpected = 1 - winnerExpected;

  const { newWinnerElo, newLoserElo } = calculateNewElos(
    winner.elo,
    loser.elo,
    winner.voteCount,
    loser.voteCount
  );

  const updates = [];
  if (!dailyPlayerIds.has(winnerId)) {
    updates.push(prisma.player.update({
      where: { id: winnerId },
      data: { elo: newWinnerElo, voteCount: { increment: 1 } },
    }));
  }
  if (!dailyPlayerIds.has(loserId)) {
    updates.push(prisma.player.update({
      where: { id: loserId },
      data: { elo: newLoserElo, voteCount: { increment: 1 } },
    }));
  }
  if (updates.length > 0) await Promise.all(updates);

    return NextResponse.json({
      winnerProbability: winnerExpected,
      loserProbability: loserExpected,
      newWinnerElo,
      newLoserElo,
    });
  } catch (e) {
    console.error("[/api/vote]", e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
