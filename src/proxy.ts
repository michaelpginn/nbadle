import { NextRequest, NextResponse } from "next/server";

export function proxy(req: NextRequest) {
  const stored = req.cookies.get("lb_auth")?.value;
  const password = process.env.LEADERBOARD_PASSWORD;

  if (!password || stored !== password) {
    const loginUrl = new URL("/full_leaderboard/login", req.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/full_leaderboard",
};
