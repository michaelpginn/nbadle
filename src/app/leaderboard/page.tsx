import Link from "next/link";
import { getPrisma } from "@/lib/prisma";
import { BarChart2, Trophy } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "NBAdle — Leaderboard",
};

function getWeekOf(): Date {
  const now = new Date();
  const day = now.getUTCDay();
  const daysToMonday = day === 0 ? 6 : day - 1;
  const monday = new Date(now);
  monday.setUTCDate(now.getUTCDate() - daysToMonday);
  monday.setUTCHours(0, 0, 0, 0);
  return monday;
}

function formatWeekRange(monday: Date): string {
  const sunday = new Date(monday);
  sunday.setUTCDate(monday.getUTCDate() + 6);
  const fmt = (d: Date) =>
    d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      timeZone: "UTC",
    });
  return `${fmt(monday)} – ${fmt(sunday)}`;
}

export default async function LeaderboardPage() {
  const prisma = getPrisma();
  const weekOf = getWeekOf();
  const entries = await prisma.leaderboardEntry.findMany({
    where: { weekOf },
    orderBy: { streak: "desc" },
    take: 5,
    select: { id: true, username: true, streak: true },
  });

  const slots = Array.from({ length: 5 }, (_, i) => entries[i] ?? null);

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white">
      <header
        className="flex items-center px-8 py-5 border-b border-gray-200 dark:border-white/10"
        style={{ minHeight: 81 }}
      >
        <div className="flex-1 flex items-center gap-3">
          <Link href="/" className="text-2xl font-black tracking-tight">
            NBA<span className="text-orange-400">dle</span>
          </Link>
          <Link
            href="/leaderboard"
            className="md:hidden text-orange-500 dark:text-orange-300 text-xs font-bold flex items-center justify-center hover:text-orange-400 transition-colors"
            aria-label="Leaderboard"
          >
            <Trophy size={20} />
          </Link>
          <Link
            href="/stats"
            className="md:hidden text-gray-400 dark:text-gray-500 text-xs font-bold flex items-center justify-center hover:text-orange-400 transition-colors"
            aria-label="Stats"
          >
            <BarChart2 size={20} />
          </Link>
        </div>
        <div className="gap-5 items-center hidden md:flex">
          <Link
            href="/"
            className="text-gray-400 dark:text-gray-500 text-sm font-bold flex items-center justify-center hover:border-orange-400 hover:text-orange-400 transition-colors"
          >
            &larr; Back
          </Link>
          <Link
            href="/leaderboard"
            className="text-orange-500 dark:text-orange-300 text-sm font-bold flex items-center justify-center hover:border-orange-400 hover:text-orange-400 transition-colors"
          >
            <Trophy size={15} className="mr-1" /> Leaderboard
          </Link>
          <Link
            href="/stats"
            className="text-gray-400 dark:text-gray-500 text-sm font-bold flex items-center justify-center hover:border-orange-400 hover:text-orange-400 transition-colors"
          >
            <BarChart2 size={15} className="mr-1" /> Stats
          </Link>
        </div>
        <div className="flex-1" />
      </header>

      <div className="flex flex-col items-center px-4 py-12">
        <div className="w-full max-w-sm">
          {/* Header */}
          <div className="text-center mb-8">
            <p className="text-xs font-bold tracking-[0.3em] uppercase text-orange-400 mb-1">
              Weekly
            </p>
            <h1 className="text-4xl font-black tracking-tight">High Scores</h1>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-2 font-mono">
              {formatWeekRange(weekOf)}
            </p>
          </div>

          {/* Board */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-white/10 shadow-xl overflow-hidden">
            {/* Column headers */}
            <div className="flex items-center px-5 py-2 border-b border-gray-100 dark:border-white/5">
              <span className="w-8 text-xs font-bold text-gray-400 dark:text-gray-600 font-mono">
                #
              </span>
              <span className="flex-1 text-xs font-bold text-gray-400 dark:text-gray-600 tracking-widest uppercase">
                Name
              </span>
              <span className="text-xs font-bold text-gray-400 dark:text-gray-600 tracking-widest uppercase">
                Streak
              </span>
            </div>

            {slots.map((entry, i) => (
              <div
                key={i}
                className="flex items-center px-5 py-4 border-b border-gray-100 dark:border-white/5 last:border-0"
              >
                {/* Rank */}
                <span className="w-8 font-mono text-sm font-bold text-gray-400 dark:text-gray-500">
                  {i + 1}
                </span>

                {/* Username */}
                <span
                  className={`flex-1 font-mono text-lg tracking-[0.2em] font-bold ${
                    entry
                      ? "text-gray-900 dark:text-white"
                      : "text-gray-200 dark:text-gray-800"
                  }`}
                >
                  {entry ? entry.username.padEnd(5, "\u00a0") : "· · · · ·"}
                </span>

                {/* Streak */}
                <span
                  className={`font-mono text-xl font-black tabular-nums ${
                    entry
                      ? "text-orange-400"
                      : "text-gray-200 dark:text-gray-800"
                  }`}
                >
                  {entry ? entry.streak : "—"}
                </span>
              </div>
            ))}
          </div>

          <p className="text-center text-xs text-gray-400 dark:text-gray-600 mt-6">
            Leaderboard resets every Monday
          </p>
        </div>
      </div>
    </main>
  );
}
