import { NextRequest, NextResponse } from "next/server";
import { getDayOf, getDayOfToday } from "./lib/dates";

export function proxy(req: NextRequest) {
  if (req.nextUrl.pathname == "/secret_elo") {
    // Make sure we have password
    const stored = req.cookies.get("lb_auth")?.value;
    const password = process.env.LEADERBOARD_PASSWORD;
    if (!password || stored !== password) {
      const loginUrl = new URL("/secret_elo/login", req.url);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  } else if (req.nextUrl.pathname == "/daily") {
    // If we already have daily results, go to results
    const stored = req.cookies.get("daily_results");
    if (stored == undefined) {
      return NextResponse.next();
    }
    try {
      const results = JSON.parse(stored.value);
      if (results.day === getDayOfToday()) {
        const resultsUrl = new URL("/daily/results", req.url);
        return NextResponse.redirect(resultsUrl);
      }
      return NextResponse.next();
    } catch {
      return NextResponse.next();
    }
  } else if (req.nextUrl.pathname == "/daily/results") {
    // If we don't have results, go to game
    const gameUrl = new URL("/daily", req.url);
    const stored = req.cookies.get("daily_results");
    if (stored == undefined) {
      return NextResponse.redirect(gameUrl);
    }
    try {
      const results = JSON.parse(stored.value);
      if (results.day == getDayOfToday()) {
        return NextResponse.next();
      }
      return NextResponse.redirect(gameUrl);
    } catch {
      return NextResponse.redirect(gameUrl);
    }
  }
}

export const config = {
  matcher: ["/secret_elo", "/daily", "/daily/results"],
};
