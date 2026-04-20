"use client";

import { useEffect, useState } from "react";
import { getDailyResults } from "@/lib/cookies";
import { getDayOf } from "@/lib/dates";
import { MiniPlayerCard, Player } from "@/components/PlayerCard";
import { expectedScore } from "@/lib/elo";
import Link from "next/link";
import { BarChart2, Calendar, Trophy } from "lucide-react";
import { DAILY_LENGTH } from "@/lib/constants";

interface TurnMatchup {
  turnIndex: number;
  player1: Player;
  player2: Player;
}

interface DailyGameData {
  totalPlays: number;
  correctPerTurn: number[];
  numUsersPerScore: number[];
  matchups: TurnMatchup[];
}

export default function DailyResults() {
  const [gameData, setGameData] = useState<DailyGameData | null>(null);
  const [userResults, setUserResults] = useState<boolean[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cookie = getDailyResults();
    const today = getDayOf(new Date()).toISOString();

    if (!cookie || new Date(cookie.day).toISOString() !== today) {
      setLoading(false);
      return;
    }

    setUserResults(cookie.results);

    fetch("/api/daily")
      .then((r) => r.json())
      .then((data: DailyGameData) => {
        setGameData(data);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  const numCorrect = userResults?.filter(Boolean).length ?? 0;

  return (
    <main className="min-h-dvh bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white flex flex-col pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)]">
      <header className="flex items-center min-h-14 md:min-h-20 justify-between px-8 py-2 md:py-5 border-b border-gray-200 dark:border-white/10">
        <div className="flex-1 flex items-center gap-3">
          <Link href="/" className="text-2xl font-black tracking-tight">
            NBA<span className="text-orange-400">dle</span>
          </Link>
          <Link
            href="/daily"
            className="md:hidden text-gray-600 dark:text-gray-300 text-xs font-bold flex items-center justify-center hover:text-orange-400 transition-colors"
            aria-label="Daily"
          >
            <Calendar size={20} />
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
            className="md:hidden text-gray-400 dark:text-gray-500 text-xs font-bold flex items-center justify-center hover:text-orange-400 transition-colors"
            aria-label="Stats"
          >
            <BarChart2 size={20} />
          </Link>
        </div>
        <div className="gap-5 hidden md:flex">
          <Link
            href="/"
            className="text-gray-400 dark:text-gray-500 text-sm font-bold flex items-center justify-center hover:text-orange-400 transition-colors"
          >
            &larr; Back
          </Link>
          <Link
            href="/leaderboard"
            className="text-gray-600 dark:text-gray-300 text-sm font-bold flex items-center justify-center hover:border-orange-400 hover:text-orange-400 transition-colors"
          >
            <Calendar size={15} className="mr-1" />
            Daily
          </Link>
          <Link
            href="/leaderboard"
            className="text-gray-400 dark:text-gray-500 text-sm font-bold flex items-center justify-center hover:border-orange-400 hover:text-orange-400 transition-colors"
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
        <div className="flex-1 flex justify-end" />
      </header>

      <div className="flex-1 flex flex-col items-center px-4 py-6 gap-6 max-w-2xl mx-auto w-full">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-12 h-12 border-4 border-orange-400 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : !gameData ? (
          <div className="flex flex-col items-center gap-4 mt-16 text-center">
            <Link
              href="/daily"
              className="bg-orange-400 hover:bg-orange-500 text-white font-bold px-6 py-3 rounded-xl transition-colors"
            >
              Play Today&apos;s Challenge
            </Link>
          </div>
        ) : (
          <>
            <div className="flex items-end justify-between w-full gap-6">
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-xs uppercase tracking-widest font-semibold mb-1">
                  {getDayOf(new Date()).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                    timeZone: "UTC",
                  })}
                </p>
                <h2 className="text-2xl md:text-4xl font-black tracking-tight">
                  Daily Challenge
                </h2>
              </div>
              <div className="text-right">
                <p className="text-gray-500 dark:text-gray-400 text-xs uppercase tracking-widest font-semibold mb-1">
                  Your score
                </p>
                <p className="text-2xl md:text-4xl font-black tabular-nums">
                  {numCorrect}
                  <span className="text-xl md:text-2xl text-gray-400 dark:text-gray-500 font-bold">
                    /{DAILY_LENGTH}
                  </span>
                </p>
              </div>
            </div>

            {gameData!.totalPlays > 0 && (
              <div className="w-full">
                <p className="text-gray-500 dark:text-gray-400 text-sm uppercase tracking-widest font-semibold">
                  Overall distribution
                </p>
                <div className="flex items-end justify-between gap-2 h-32">
                  {Array.from({ length: DAILY_LENGTH + 1 }, (_, score) => {
                    const count = gameData!.numUsersPerScore[score] ?? 0;
                    const pct = Math.round(
                      (count / gameData!.totalPlays) * 100,
                    );
                    const isUser = numCorrect === score;
                    return (
                      <div
                        key={score}
                        className="flex-1 flex flex-col items-center gap-1"
                      >
                        <span className="text-xs font-semibold tabular-nums text-gray-500 dark:text-gray-400">
                          {pct > 0 ? `${pct}%` : ""}
                        </span>
                        <div
                          className="w-full bg-gray-200 dark:bg-gray-800 rounded-t overflow-hidden flex items-end"
                          style={{ height: "80px" }}
                        >
                          <div
                            className={`w-full rounded-t transition-all ${isUser ? "bg-orange-400" : "bg-gray-400 dark:bg-gray-600"}`}
                            style={{ height: pct > 0 ? `${pct}%` : "2px" }}
                          />
                        </div>
                        <span className="text-xs font-bold tabular-nums text-gray-500 dark:text-gray-400">
                          {score}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="flex flex-col gap-5 w-full">
              {gameData!.matchups.map((matchup) => {
                const i = matchup.turnIndex;
                const userGotItRight = userResults![i] ?? false;
                const totalPlays = gameData!.totalPlays;
                const pct =
                  totalPlays > 0
                    ? Math.round(
                        ((gameData!.correctPerTurn[i] ?? 0) / totalPlays) * 100,
                      )
                    : 0;

                // Show the player the user picked with correct/wrong state;
                // the other card stays idle.
                const p1IsCorrect = matchup.player1.elo >= matchup.player2.elo;
                const userPickedP1 = userGotItRight
                  ? p1IsCorrect
                  : !p1IsCorrect;
                const p1State = userPickedP1
                  ? userGotItRight
                    ? "correct"
                    : "wrong"
                  : "idle";
                const p2State = !userPickedP1
                  ? userGotItRight
                    ? "correct"
                    : "wrong"
                  : "idle";
                const prob1 = expectedScore(
                  matchup.player1.elo,
                  matchup.player2.elo,
                );

                return (
                  <div key={i} className="flex flex-col gap-1">
                    <div className="flex items-center justify-between px-1 mb-1">
                      <span className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">
                        Round {i + 1}
                      </span>
                      <span className="text-xs text-gray-400 dark:text-gray-500 font-semibold">
                        {totalPlays > 0
                          ? `${pct}% got this right`
                          : "No data yet"}
                      </span>
                    </div>

                    <div className="flex gap-2">
                      <div className="flex-1 min-w-0">
                        <MiniPlayerCard
                          player={matchup.player1}
                          state={p1State}
                          probability={prob1}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <MiniPlayerCard
                          player={matchup.player2}
                          state={p2State}
                          probability={1 - prob1}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </main>
  );
}
