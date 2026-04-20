"use client";

import { ReactElement, useEffect, useMemo, useRef, useState } from "react";
import { getLeaderboardName, saveLeaderboardName } from "@/lib/cookies";
import { PlayerPair } from "./GameView";
import { MiniPlayerCard } from "./PlayerCard";
import { expectedScore } from "@/lib/elo";

interface GameOverProps {
  streak: number;
  bestStreak: number;
  onRestart: () => void;
  pair: PlayerPair;
  pickedId: number;
  madeLeaderboard: boolean | null;
}


export default function GameOver({
  streak,
  bestStreak,
  onRestart,
  pair,
  pickedId,
  madeLeaderboard,
}: GameOverProps) {
  const isNewBest = streak > 0 && streak >= bestStreak;

  const [username, setUsername] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const [prob1, prob2] = useMemo(() => {
    if (!pair) {
      return [0, 0];
    }
    const p1 = expectedScore(pair.player1.elo, pair.player2.elo);
    return [p1, 1 - p1];
  }, [pair]);

  useEffect(() => {
    const saved = getLeaderboardName();
    if (saved) setUsername(saved);
  }, []);

  useEffect(() => {
    if (madeLeaderboard && !submitted) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [madeLeaderboard, submitted]);

  async function handleSubmit() {
    const name = username.trim().toUpperCase().slice(0, 5);
    if (!name) return;
    setSubmitting(true);
    try {
      await fetch("/api/leaderboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: name, streak }),
      });
      saveLeaderboardName(name);
      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  }

  const showCongrats = madeLeaderboard === true && !submitted;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-3xl shadow-2xl p-4 md:p-10 max-w-sm w-full text-center flex flex-col gap-6 animate-in fade-in zoom-in duration-200">
        {/* Player cards */}
        <div className="flex items-center justify-center gap-3 md:gap-10">
          <MiniPlayerCard
            player={pair.player1}
            state={pickedId == pair.player1.id ? "wrong" : "idle"}
            probability={prob1}
          />
          <MiniPlayerCard
            player={pair.player2}
            state={pickedId == pair.player2.id ? "idle" : "wrong"}
            probability={prob2}
          />
        </div>

        {/* Title */}
        <h2 className="text-3xl font-black text-gray-900 dark:text-white">
          {showCongrats ? "You made it!" : "Game Over"}
        </h2>

        {showCongrats ? (
          <>
            <p className="text-gray-500 dark:text-gray-400 text-sm -mt-3">
              You&apos;re on the weekly leaderboard with a streak of{" "}
              <span className="text-orange-400 font-bold">{streak}</span>
            </p>

            {/* Arcade username input */}
            <div className="flex flex-col gap-2">
              <p className="text-xs font-bold tracking-[0.2em] uppercase text-gray-400">
                Enter your name
              </p>
              <input
                ref={inputRef}
                value={username}
                onChange={(e) =>
                  setUsername(e.target.value.toUpperCase().slice(0, 5))
                }
                maxLength={5}
                spellCheck={false}
                autoComplete="off"
                placeholder="· · · · ·"
                className="w-full text-center font-mono text-3xl font-black tracking-[0.4em] bg-gray-50 dark:bg-gray-800 border-2 border-gray-200 dark:border-white/10 rounded-xl py-3 text-gray-900 dark:text-white focus:outline-none focus:border-orange-400 transition-colors placeholder:text-gray-300 dark:placeholder:text-gray-700"
              />
            </div>
          </>
        ) : (
          <>
            <div className="flex flex-col gap-1">
              <p className="text-gray-500 dark:text-gray-400 text-sm uppercase tracking-widest">
                Your streak
              </p>
              <p className="text-5xl font-black text-gray-900 dark:text-white">
                {streak}
              </p>
            </div>

            <div className="h-px bg-gray-200 dark:bg-white/10 w-full" />

            <div className="flex flex-col gap-1">
              <p className="text-gray-500 dark:text-gray-400 text-sm uppercase tracking-widest">
                Best streak
              </p>
              <p className="text-4xl font-black text-orange-400">
                {bestStreak}
              </p>
              {isNewBest && (
                <p className="text-green-400 text-sm font-semibold mt-1">
                  New personal best!
                </p>
              )}
            </div>
          </>
        )}

        <button
          onClick={showCongrats ? handleSubmit : onRestart}
          disabled={submitting || (showCongrats && !username.trim())}
          className="mt-2 w-full bg-orange-400 hover:bg-orange-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl transition-colors cursor-pointer"
        >
          {showCongrats ? (submitting ? "Saving…" : "Submit") : "Keep Playing"}
        </button>
      </div>
    </div>
  );
}
