import { NextRequest, NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";

interface RefTrackBody {
  refId: string;
}

export async function POST(req: NextRequest) {
  const prisma = getPrisma();

  let body: RefTrackBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  try {
    const { refId } = body;

    if (!refId) {
      return NextResponse.json({ error: "Missing ref ID" }, { status: 400 });
    }
    const referralSource = await prisma.referral.findUnique({
      where: { id: refId },
    });
    if (!referralSource) {
      // Create new record
      await prisma.referral.create({
        data: {
          id: refId,
          hits: 1,
        },
      });
    } else {
      await prisma.referral.update({
        where: {
          id: refId,
        },
        data: {
          hits: { increment: 1 },
        },
      });
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[/api/ref]", e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
