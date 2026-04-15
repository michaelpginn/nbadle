import Image from "next/image";
import { getPrisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const headshotUrl = (nbaId: string) =>
  `https://cdn.nba.com/headshots/nba/latest/1040x760/${nbaId}.png`;

function medal(rank: number) {
  if (rank === 1) return "🥇";
  if (rank === 2) return "🥈";
  if (rank === 3) return "🥉";
  return null;
}

export async function getPlayersRanked() {
  const prisma = getPrisma();
  const players = await prisma.player.findMany({
    orderBy: [{ elo: "desc" }, { name: "asc" }],
  });
  const ranked = players.map((player, i) => {
    const rank =
      i === 0 || player.elo < players[i - 1].elo
        ? i + 1
        : players.slice(0, i).findLastIndex((p) => p.elo > player.elo) + 2;
    return { ...player, rank };
  });
  return ranked;
}
export type RankedPlayer = Awaited<ReturnType<typeof getPlayersRanked>>[number];

interface LeaderboardSectionProps {
  players: RankedPlayer[];
  title: string;
  showDetails?: boolean;
}

export default function LeaderboardSection({
  players,
  title,
  showDetails,
}: LeaderboardSectionProps) {
  return (
    <div className="w-full h-full px-4 py-8">
      <p className="text-lg text-white mb-4 font-bold text-center">{title}</p>
      <ol className="flex flex-col gap-2">
        {players.map((player) => (
          <li
            key={player.id}
            className="flex items-center gap-4 bg-white dark:bg-gray-900 rounded-xl px-4 py-3 border border-gray-100 dark:border-white/5"
          >
            {/* Rank */}
            <div className="w-10 shrink-0 text-right">
              {medal(player.rank) ?? (
                <span className="text-gray-400 dark:text-gray-500 text-sm font-mono">
                  {player.rank}
                </span>
              )}
            </div>

            {/* Photo */}
            <div className="relative w-12 h-9 shrink-0 rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-800">
              <Image
                src={headshotUrl(player.nbaId)}
                alt={player.name}
                fill
                className="object-cover object-top"
                unoptimized
                loading="lazy"
                sizes="48px"
              />
            </div>

            {/* Name + team */}
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900 dark:text-white truncate">
                {player.name}
              </p>
              <p className="text-xs text-gray-500 truncate">{player.team}</p>
            </div>

            {/* ELO */}
            {showDetails && (
              <div className="shrink-0 text-right">
                <p className="text-gray-900 dark:text-white font-mono font-bold">
                  {Math.round(player.elo)}
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-600">
                  {player.voteCount} vote{player.voteCount !== 1 ? "s" : ""}
                </p>
              </div>
            )}
          </li>
        ))}
      </ol>
    </div>
  );
}
