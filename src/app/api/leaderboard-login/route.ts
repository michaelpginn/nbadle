import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const password = form.get("password");
  const correct = process.env.LEADERBOARD_PASSWORD;

  if (!correct || password !== correct) {
    return NextResponse.redirect(
      new URL("/leaderboard/login?error=1", req.url),
      { status: 303 }
    );
  }

  const res = NextResponse.redirect(new URL("/leaderboard", req.url), {
    status: 303,
  });

  res.cookies.set("lb_auth", correct, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    // No explicit maxAge = session cookie; add maxAge: 60 * 60 * 24 * 30 for 30-day persistence
  });

  return res;
}
