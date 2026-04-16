import Link from "next/link";
import StatsContainer from "./stats_container";
import { getStats } from "@/lib/stats";
import { BarChart2, Trophy } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "NBAdle — Stats",
};

export default async function StatsPage() {
  const stats = await getStats();

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
            className="md:hidden text-gray-400 dark:text-gray-500 text-xs font-bold flex items-center justify-center hover:text-orange-400 transition-colors"
            aria-label="Leaderboard"
          >
            <Trophy size={20} />
          </Link>
          <Link
            href="/stats"
            className="md:hidden text-gray-600 dark:text-gray-300 text-xs font-bold flex items-center justify-center hover:text-orange-400 transition-colors"
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
            className="text-gray-400 dark:text-gray-500 text-sm font-bold flex items-center justify-center hover:border-orange-400 hover:text-orange-400 transition-colors"
          >
            <Trophy size={15} className="mr-1" /> Leaderboard
          </Link>
          <Link
            href="/stats"
            className="text-gray-500 dark:text-gray-400 text-sm font-bold flex items-center justify-center hover:border-orange-400 hover:text-orange-400 transition-colors"
          >
            <BarChart2 size={15} className="mr-1" /> Stats
          </Link>
        </div>
        <div className="flex-1" />
      </header>

      <StatsContainer stats={stats} />
    </main>
  );
}
