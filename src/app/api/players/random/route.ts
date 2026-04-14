import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";

export async function GET() {
  try {
    const prisma = getPrisma();

    const count = await prisma.player.count();

    if (count < 2) {
      return NextResponse.json(
        { error: "Not enough players in database. Run the seed script." },
        { status: 500 }
      );
    }

    const offset1 = Math.floor(Math.random() * count);
    let offset2 = Math.floor(Math.random() * (count - 1));
    if (offset2 >= offset1) offset2++;

    const [player1, player2] = await Promise.all([
      prisma.player.findFirst({ skip: offset1 }),
      prisma.player.findFirst({ skip: offset2 }),
    ]);

    if (!player1 || !player2) {
      return NextResponse.json(
        { error: "Failed to fetch players" },
        { status: 500 }
      );
    }

    return NextResponse.json({ player1, player2 });
  } catch (e) {
    console.error("[/api/players/random]", e);
    return NextResponse.json(
      { error: String(e) },
      { status: 500 }
    );
  }
}
