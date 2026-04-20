import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";
import { getDayOf } from "@/lib/dates";
import { DAILY_LENGTH } from "@/lib/constants";

export async function GET() {
  try {
    const prisma = getPrisma();
    const date = getDayOf(new Date());

    const dailyGame = await prisma.dailyGame.findFirst({
      where: { gameDate: date },
      include: {
        matchups: {
          include: { player1: true, player2: true },
          orderBy: { turnIndex: "asc" },
        },
      },
    });

    if (!dailyGame) {
      return NextResponse.json(
        { error: "No daily game today" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      totalPlays: dailyGame.totalPlays,
      correctPerTurn: dailyGame.correctPerTurn,
      numUsersPerScore: dailyGame.numUsersPerScore,
      matchups: dailyGame.matchups.map((m) => ({
        turnIndex: m.turnIndex,
        player1: m.player1,
        player2: m.player2,
      })),
    });
  } catch (e) {
    console.error("[GET /api/daily]", e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { correctByTurn } = await req.json();

    if (
      !Array.isArray(correctByTurn) ||
      correctByTurn.length !== DAILY_LENGTH ||
      !correctByTurn.every((v) => typeof v === "boolean")
    ) {
      return NextResponse.json(
        { error: "Invalid correctByTurn" },
        { status: 400 },
      );
    }

    const prisma = getPrisma();
    const date = getDayOf(new Date());

    const dailyGame = await prisma.dailyGame.findFirst({
      where: { gameDate: date },
    });

    if (!dailyGame) {
      return NextResponse.json(
        { error: "No daily game today" },
        { status: 404 },
      );
    }

    const newCorrectPerTurn = Array.from(
      { length: DAILY_LENGTH },
      (_, i) => (dailyGame.correctPerTurn[i] ?? 0) + (correctByTurn[i] ? 1 : 0),
    );

    const score = correctByTurn.filter(Boolean).length;
    const newNumUsersPerScore = Array.from(
      { length: DAILY_LENGTH + 1 },
      (_, i) => dailyGame.numUsersPerScore[i] ?? 0,
    );
    newNumUsersPerScore[score]++;

    await prisma.dailyGame.update({
      where: { id: dailyGame.id },
      data: {
        totalPlays: { increment: 1 },
        correctPerTurn: newCorrectPerTurn,
        numUsersPerScore: newNumUsersPerScore,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[POST /api/daily]", e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
