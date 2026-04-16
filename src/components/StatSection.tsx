import Image from "next/image";
import { RankedPlayer, RankedTeam } from "@/lib/stats";
import { teamLogoUrl } from "@/lib/teams";
import { UserSearch } from "lucide-react";

export type { RankedPlayer, RankedTeam };

const headshotUrl = (nbaId: string) =>
  `https://cdn.nba.com/headshots/nba/latest/1040x760/${nbaId}.png`;

function medal(rank: number) {
  if (rank === 1) return "🥇";
  if (rank === 2) return "🥈";
  if (rank === 3) return "🥉";
  return null;
}

interface StatSectionProps {
  players?: RankedPlayer[];
  teams?: RankedTeam[];
  smallImages?: boolean;
  showDetails?: boolean;
}

export default function StatSection({
  players,
  teams,
  showDetails,
  smallImages,
}: StatSectionProps) {
  if (!players && !teams) {
    return <div className="w-full h-full px-4 py-8" />;
  }
  return (
    <div className="w-full h-full px-4 py-8">
      {players && (
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
              <div
                className={`${smallImages ? "w-12 h-9" : "w-24 h-18"} relative shrink-0 rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-800`}
              >
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
      )}
      {teams && (
        <ol className="flex flex-col gap-2">
          {teams.map((team) => (
            <li
              key={team.team}
              className="flex items-center gap-4 bg-white dark:bg-gray-900 rounded-xl px-4 py-3 border border-gray-100 dark:border-white/5"
            >
              {/* Rank */}
              <div className="w-10 shrink-0 text-right">
                {medal(team.rank) ?? (
                  <span className="text-gray-400 dark:text-gray-500 text-sm font-mono">
                    {team.rank}
                  </span>
                )}
              </div>

              {/* Photo */}

              <div
                className={`${smallImages ? "w-12 h-12" : "w-24 h-24"} relative shrink-0 rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-800`}
              >
                {team.team == "Free Agent" ? (
                  <UserSearch className="text-gray-400 w-full h-full p-4" />
                ) : (
                  <Image
                    src={teamLogoUrl(team.team) ?? ""}
                    alt={team.team}
                    fill
                    className="object-cover object-top"
                    unoptimized
                    loading="lazy"
                    sizes="48px"
                  />
                )}
              </div>

              {/* Name + team */}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 dark:text-white truncate">
                  {team.team}
                </p>
              </div>

              {/* ELO */}
              {showDetails && (
                <div className="shrink-0 text-right">
                  <p className="text-gray-900 dark:text-white font-mono font-bold">
                    {Math.round(team._avg.elo!)}
                  </p>
                </div>
              )}
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
