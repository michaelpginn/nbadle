import Link from "next/link";
import StatsContainer from "./stats_container";
import { getStats } from "@/lib/stats";

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
        <div className="flex-1">
          <Link href="/" className="text-2xl font-black tracking-tight">
            NBA<span className="text-orange-400">dle</span>
          </Link>
        </div>
        <div className="gap-4 items-center hidden md:flex">
          <Link
            href="/"
            className="text-gray-400 dark:text-gray-500 text-sm font-bold flex items-center justify-center hover:border-orange-400 hover:text-orange-400 transition-colors"
          >
            &larr; Back
          </Link>
        </div>
        <div className="flex-1" />
      </header>

      <StatsContainer stats={stats} />
    </main>
  );
}
