import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const p1Id = searchParams.get("p1");
  const p2Id = searchParams.get("p2");
  if (!p1Id || !p2Id) {
    return NextResponse.json({ error: "No player IDs" }, { status: 500 });
  }
  try {
    const prisma = getPrisma();

    const [player1, player2] = await Promise.all([
      prisma.player.findFirst({ where: { nbaId: p1Id } }),
      prisma.player.findFirst({ where: { nbaId: p2Id } }),
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
