import { getPrisma } from "@/lib/prisma";

async function getPlayersRanked() {
  const prisma = getPrisma();
  const players = await prisma.player.findMany({
    orderBy: [{ elo: "desc" }, { name: "asc" }],
  });
  return players.map((player, i) => {
    const rank =
      i === 0 || player.elo < players[i - 1].elo
        ? i + 1
        : players.slice(0, i).findLastIndex((p) => p.elo > player.elo) + 2;
    return { ...player, rank };
  });
}
export type RankedPlayer = Awaited<ReturnType<typeof getPlayersRanked>>[number];

async function getTeamsRanked() {
  const prisma = getPrisma();
  const teams = await prisma.player.groupBy({
    by: ["team"],
    _avg: { elo: true },
    orderBy: { _avg: { elo: "desc" } },
  });
  return teams.map((team, i) => {
    const rank =
      i === 0 || team._avg!.elo! < teams[i - 1]._avg!.elo!
        ? i + 1
        : teams.slice(0, i).findLastIndex((p) => p._avg!.elo! > team._avg!.elo!) + 2;
    return { ...team, rank };
  });
}
export type RankedTeam = Awaited<ReturnType<typeof getTeamsRanked>>[number];

export async function getStats() {
  return {
    players: await getPlayersRanked(),
    teams: await getTeamsRanked(),
  };
}
export type Stats = Awaited<ReturnType<typeof getStats>>;
