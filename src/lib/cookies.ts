import Cookies from "js-cookie";
import { getDayOf } from "@/lib/dates";

const YEAR = { expires: 365 } as const;

export function getBestStreak(): number {
  return parseInt(Cookies.get("best_streak") ?? "0", 10);
}

export function saveBestStreak(value: number) {
  Cookies.set("best_streak", String(value), YEAR);
}

export function getLeaderboardName(): string | undefined {
  return Cookies.get("lb_name");
}

export function saveLeaderboardName(name: string) {
  Cookies.set("lb_name", name, YEAR);
}

export function hasCookieConsent(): boolean {
  return Cookies.get("cookie_consent") !== undefined;
}

export function saveCookieConsent() {
  Cookies.set("cookie_consent", "1", YEAR);
}

export function getDailyResults():
  | { results: boolean[]; day: Date }
  | undefined {
  const raw = Cookies.get("daily_results");
  if (!raw) return undefined;
  return JSON.parse(raw);
}

export function hasDismissedDailyNudge(): boolean {
  const raw = Cookies.get("daily_nudge_dismissed");
  if (!raw) return false;
  return new Date(raw).toISOString() === getDayOf(new Date()).toISOString();
}

export function saveDismissedDailyNudge() {
  Cookies.set("daily_nudge_dismissed", getDayOf(new Date()).toISOString(), YEAR);
}

export function saveDailyResults(correctByTurn: boolean[]) {
  Cookies.set(
    "daily_results",
    JSON.stringify({ results: correctByTurn, day: getDayOf(new Date()) }),
    YEAR,
  );
}
