import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

interface NBAPlayer {
  personId: string;
  playerName: string;
  team: string;
}

interface NBAApiResponse {
  resultSets: Array<{
    headers: string[];
    rowSet: string[][];
  }>;
}

/** NBA season string, e.g. "2025-26". Rolls over on October 1. */
function currentSeason(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1; // 1-based
  const startYear = month >= 10 ? year : year - 1;
  return `${startYear}-${String(startYear + 1).slice(-2)}`;
}

const HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
  Referer: "https://www.nba.com/",
  Accept: "application/json",
};

async function fetchCommonAllPlayers(season: string): Promise<NBAPlayer[]> {
  const url = `https://stats.nba.com/stats/commonallplayers?LeagueID=00&Season=${season}&IsOnlyCurrentSeason=1`;
  const res = await fetch(url, { headers: HEADERS });
  if (!res.ok) throw new Error(`commonallplayers responded with ${res.status}`);

  const json: NBAApiResponse = await res.json();
  const rs = json.resultSets[0];
  const h = rs.headers;
  const idx = (col: string) => h.indexOf(col);

  return rs.rowSet
    .filter((row) => row[idx("TEAM_ID")] !== 0) // skip unrostered / G-League
    .map((row) => {
      const city = String(row[idx("TEAM_CITY")] ?? "");
      const name = String(row[idx("TEAM_NAME")] ?? "");
      const abbr = String(row[idx("TEAM_ABBREVIATION")] ?? "");
      return {
        personId: String(row[idx("PERSON_ID")]),
        playerName: String(row[idx("DISPLAY_FIRST_LAST")]),
        team: city && name ? `${city} ${name}` : abbr || "Free Agent",
      };
    });
}

// NBA team IDs for all 30 teams
const TEAM_IDS = [
  1610612737, 1610612738, 1610612739, 1610612740, 1610612741, 1610612742,
  1610612743, 1610612744, 1610612745, 1610612746, 1610612747, 1610612748,
  1610612749, 1610612750, 1610612751, 1610612752, 1610612753, 1610612754,
  1610612755, 1610612756, 1610612757, 1610612758, 1610612759, 1610612760,
  1610612761, 1610612762, 1610612763, 1610612764, 1610612765, 1610612766,
];

interface RosterApiResponse {
  resultSets: Array<{
    name: string;
    headers: string[];
    rowSet: string[][];
  }>;
}

async function fetchTeamRosters(season: string): Promise<NBAPlayer[]> {
  const players = new Map<string, NBAPlayer>();

  for (const teamId of TEAM_IDS) {
    try {
      const url = `https://stats.nba.com/stats/commonteamroster?TeamID=${teamId}&Season=${season}`;
      const res = await fetch(url, { headers: HEADERS });
      if (!res.ok) continue;

      const json: RosterApiResponse = await res.json();
      const rs = json.resultSets.find((r) => r.name === "CommonTeamRoster");
      if (!rs) continue;

      const h = rs.headers;
      const idx = (col: string) => h.indexOf(col);

      for (const row of rs.rowSet) {
        const personId = String(row[idx("PLAYER_ID")]);
        if (!players.has(personId)) {
          players.set(personId, {
            personId,
            playerName: String(row[idx("PLAYER")]),
            team: String(row[idx("TEAM_CITY")] ?? "") + " " + String(row[idx("TEAM_NAME")] ?? ""),
          });
        }
      }

      // polite delay to avoid rate-limiting
      await new Promise((r) => setTimeout(r, 150));
    } catch {
      // skip teams that fail
    }
  }

  return [...players.values()];
}

async function fetchAllPlayers(): Promise<NBAPlayer[]> {
  const season = currentSeason();
  console.log(`Using season ${season}`);

  // Try the bulk endpoint first
  try {
    const bulk = await fetchCommonAllPlayers(season);
    if (bulk.length >= 300) return bulk;
    console.log(`Bulk endpoint only returned ${bulk.length} — falling back to team rosters...`);
  } catch (e) {
    console.warn("Bulk endpoint failed, falling back to team rosters:", e);
  }

  // Fall back to per-team roster scrape
  return fetchTeamRosters(season);
}

async function main() {
  console.log("Fetching current NBA roster...");
  const players = await fetchAllPlayers();
  console.log(`Found ${players.length} players`);

  let created = 0;
  let updated = 0;

  for (const player of players) {
    const existing = await prisma.player.findUnique({
      where: { nbaId: player.personId },
    });

    if (existing) {
      await prisma.player.update({
        where: { nbaId: player.personId },
        data: { name: player.playerName, team: player.team },
      });
      updated++;
    } else {
      await prisma.player.create({
        data: {
          nbaId: player.personId,
          name: player.playerName,
          team: player.team,
          elo: 1500,
          voteCount: 0,
        },
      });
      created++;
    }
  }

  console.log(`Done. Created: ${created}, Updated: ${updated}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
