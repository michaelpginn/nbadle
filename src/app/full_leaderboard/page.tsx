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
      <header className="flex items-center justify-between px-8 py-5 border-b border-gray-200 dark:border-white/10">
        <Link href="/" className="text-2xl font-black tracking-tight">
          NBA<span className="text-orange-400">dle</span>
        </Link>
        <h1 className="text-lg font-bold text-gray-600 dark:text-gray-300">
          Leaderboard
        </h1>
      </header>

      <div className="max-w-2xl mx-auto">
        <LeaderboardSection
          players={players}
          title={`${players.length} players`}
          showDetails
          smallImages
        />
      </div>
    </main>
  );
}
