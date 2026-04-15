import LeaderboardSection, {
  getPlayersRanked,
} from "../../components/LeaderboardSection";
import Link from "next/link";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "NBAdle — Leaderboard",
};

export default async function LeaderboardPage() {
  const players = await getPlayersRanked();

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
          <p className="text-gray-400 dark:text-gray-500 text-sm font-bold">
            •
          </p>
          <Link
            href="/leaderboard"
            className="text-gray-600 dark:text-gray-300 text-sm font-bold flex items-center justify-center transition-colors"
          >
            Leaderboard
          </Link>
        </div>
        <div className="flex-1" />
      </header>

      <div className="mx-auto">
        <div className="flex justify-center flex-col md:flex-row">
          <div style={{ maxWidth: 450 }}>
            <LeaderboardSection players={players.slice(0, 10)} title="Top 10" />
          </div>
          <div style={{ maxWidth: 450 }}>
            <LeaderboardSection
              players={players.slice(-10)}
              title="Bottom 10"
            />
          </div>
        </div>
      </div>
    </main>
  );
}
