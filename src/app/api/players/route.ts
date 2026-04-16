import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const p1Hash = searchParams.get("p1");
  const p2Hash = searchParams.get("p2");
  if (!p1Hash || !p2Hash) {
    return NextResponse.json({ error: "No player IDs" }, { status: 500 });
  }
  try {
    const prisma = getPrisma();

    const [player1, player2] = await Promise.all([
      prisma.player.findFirst({ where: { nbaIdHash: p1Hash } }),
      prisma.player.findFirst({ where: { nbaIdHash: p2Hash } }),
    ]);

    if (!player1 || !player2) {
      return NextResponse.json(
        { error: "Failed to fetch players" },
        { status: 500 },
      );
    }

    return NextResponse.json({ player1, player2 });
  } catch (e) {
    console.error("[/api/players]", e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
