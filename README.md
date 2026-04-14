# NBAdle — Who Is Hotter?

A hot-or-not style ELO rating game for NBA players. Two players are shown side by side and the user picks the one they find more attractive. The site tracks win streaks, uses chess-style ELO ratings, and backs off the K-value as more votes come in.

---

## How It Works

1. **Two random NBA players** are fetched from the server and displayed as large side-by-side cards.
2. Each card shows:
   - The player's official NBA league headshot (via the NBA CDN)
   - Their name (bold, centered)
   - Their current team
3. A **"Who is hotter???"** heading sits centered above the two cards.
4. A **"vs"** label separates the two cards.
5. When the user **clicks a card**, the site:
   - Fetches the current ELO for each player from the database
   - Converts ELO scores to **expected win probabilities** using the standard formula:
     `E = 1 / (1 + 10^((Rb - Ra) / 400))`
   - Displays these probabilities as percentages above each image
   - Updates both players' ELO scores using the outcome
   - Updates the vote count for each player (used to calculate the K-value)
6. **Result feedback:**
   - If the user picked the **higher-rated player** (before the vote), the card highlights **green** for 1 second then fades out to the next round.
   - If the user picked the **lower-rated player**, the card highlights **red** and a **Game Over** dialog appears.
7. The **Game Over dialog** shows:
   - The current winning streak (now 0)
   - The player's **best streak** (stored in a browser cookie)
8. **Winning streak** is displayed prominently at the top of the page and resets on a wrong answer.

---

## ELO System

- Starting ELO: **1500** for all players
- **K-value** is adaptive based on the number of votes a player has received:
  | Votes | K value |
  |-------|---------|
  | 0–9   | 64      |
  | 10–29 | 48      |
  | 30–99 | 32      |
  | 100+  | 16      |
- The K used for a given match is the **average K** of the two players involved.
- ELO update formula (standard):
  - Winner: `new_elo = old_elo + K * (1 - expected)`
  - Loser:  `new_elo = old_elo + K * (0 - expected)`

---

## Tech Stack

| Layer      | Technology                          |
|------------|-------------------------------------|
| Framework  | Next.js (App Router, TypeScript)    |
| Styling    | Tailwind CSS                        |
| ORM        | Prisma 7                            |
| Database   | PostgreSQL (Prisma Postgres managed)|
| State      | React hooks + cookies               |

---

## Database Schema

```prisma
model Player {
  id        Int      @id @default(autoincrement())
  nbaId     String   @unique   // NBA CDN player ID
  name      String
  team      String
  elo       Float    @default(1500)
  voteCount Int      @default(0)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

---

## NBA Headshots

Player headshots are served directly from the NBA CDN:
```
https://cdn.nba.com/headshots/nba/latest/1040x760/{nbaId}.png
```

---

## Project Structure

```
nbadle/
├── prisma/
│   ├── schema.prisma          # Prisma schema
│   └── seed.ts                # Seed script — loads active NBA roster
├── src/
│   ├── app/
│   │   ├── layout.tsx         # Root layout with font + metadata
│   │   ├── page.tsx           # Main game page
│   │   └── api/
│   │       ├── players/
│   │       │   └── random/
│   │       │       └── route.ts   # GET two random players
│   │       └── vote/
│   │           └── route.ts       # POST vote outcome → update ELO
│   ├── components/
│   │   ├── PlayerCard.tsx     # Card component (image, name, team, probability)
│   │   ├── GameOver.tsx       # Game over dialog
│   │   └── StreakCounter.tsx  # Top-of-page streak display
│   └── lib/
│       ├── prisma.ts          # Singleton Prisma client
│       └── elo.ts             # ELO calculation utilities
├── .env                       # DATABASE_URL (not committed)
├── .env.example               # Template
└── README.md
```

---

## Setup

### 1. Clone & install

```bash
git clone <repo>
cd nbadle
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

From [console.prisma.io](https://console.prisma.io) → your project → **Connect**, copy both connection strings into `.env`:

| Variable | Format | Used by |
|---|---|---|
| `DIRECT_DATABASE_URL` | `postgresql://...` | Prisma CLI (migrate / db push), seed script |
| `ACCELERATE_URL` | `prisma+postgres://...` | Next.js app at runtime |

### 3. Push schema & seed

```bash
npx prisma migrate deploy   # or: npx prisma db push (for quick setup)
npm run seed
```

The seed script fetches the current active NBA roster from the NBA stats API and inserts every player with a default ELO of 1500.

### 4. Run locally

```bash
npm run dev
```

---

## Deployment

This app is designed to run on **Vercel** (or any Node.js host). The database is **Prisma Postgres** (managed), accessed via Prisma Accelerate — no IP allowlisting or SSL wrangling required. Set `DATABASE_URL` to your Prisma Postgres connection string in your hosting environment's secrets.

---

## Cookie Behaviour

- `best_streak` — integer, persisted across sessions; updated whenever the current streak exceeds it.
- No user account or auth is needed; the streak is purely client-side.
