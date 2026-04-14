import { NextRequest, NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";
import { calculateNewElos, expectedScore } from "@/lib/elo";

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

  const { winnerId, loserId } = body;

  if (!winnerId || !loserId || winnerId === loserId) {
    return NextResponse.json({ error: "Invalid player IDs" }, { status: 400 });
  }

  const [winner, loser] = await Promise.all([
    prisma.player.findUnique({ where: { id: winnerId } }),
    prisma.player.findUnique({ where: { id: loserId } }),
  ]);

  if (!winner || !loser) {
    return NextResponse.json(
      { error: "Player(s) not found" },
      { status: 404 }
    );
  }

  const winnerExpected = expectedScore(winner.elo, loser.elo);
  const loserExpected = 1 - winnerExpected;

  const { newWinnerElo, newLoserElo } = calculateNewElos(
    winner.elo,
    loser.elo,
    winner.voteCount,
    loser.voteCount
  );

  await Promise.all([
    prisma.player.update({
      where: { id: winnerId },
      data: {
        elo: newWinnerElo,
        voteCount: { increment: 1 },
      },
    }),
    prisma.player.update({
      where: { id: loserId },
      data: {
        elo: newLoserElo,
        voteCount: { increment: 1 },
      },
    }),
  ]);

  return NextResponse.json({
    winnerProbability: winnerExpected,
    loserProbability: loserExpected,
    newWinnerElo,
    newLoserElo,
  });
}
