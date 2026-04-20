"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { saveDailyResults } from "@/lib/cookies";
import Link from "next/link";
import { BarChart2, Calendar, Trophy } from "lucide-react";
import { DAILY_LENGTH } from "@/lib/constants";
import GameView, { PlayerPair } from "@/components/GameView";
import { getDayOf } from "@/lib/dates";
import { useRouter } from "next/navigation";

async function fetchPair(turn: number): Promise<PlayerPair> {
  const res = await fetch(`/api/players/daily?turn=${turn}`);
  if (!res.ok) throw new Error("Failed to fetch players");
  return res.json();
}

export default function DailyGame() {
  const router = useRouter();
  const [turn, setTurn] = useState(0);
  const [pair, setPair] = useState<PlayerPair | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [correctByTurn, setCorrectByTurn] = useState<boolean[]>([]);

  const dateString = getDayOf(new Date()).toLocaleDateString("en-US", {
    day: "2-digit",
    month: "2-digit",
    // year: "2-digit",
  });
  const numCorrect = correctByTurn.filter(Boolean).length;

  const nextPair = useRef<PlayerPair | null>(null);
  const prefetching = useRef(false);

  const prefetchNext = useCallback(async (turn: number) => {
    if (prefetching.current) return;
    prefetching.current = true;
    try {
      nextPair.current = await fetchPair(turn);
    } catch {
      nextPair.current = null;
    } finally {
      prefetching.current = false;
    }
  }, []);

  const displayPair = useCallback(
    (pair: PlayerPair, currentTurn: number) => {
      setPair(pair);
      setLoading(false);
      prefetchNext(currentTurn + 1);
    },
    [prefetchNext],
  );

  const advance = useCallback(async (currentTurn: number) => {
    if (nextPair.current) {
      const pair = nextPair.current;
      nextPair.current = null;
      displayPair(pair, currentTurn);
    } else {
      setLoading(true);
      try {
        displayPair(await fetchPair(currentTurn), currentTurn);
      } catch (err) {
        console.error("Failed to fetch players", err);
        setLoading(false);
      }
    }
  }, [displayPair]);

  // First page load
  useEffect(() => {
    advance(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleVote = (correct: boolean) => {
    const newResults = [...correctByTurn, correct];
    setCorrectByTurn(newResults);
    if (turn === DAILY_LENGTH - 1) {
      saveDailyResults(newResults);
      fetch("/api/daily", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correctByTurn: newResults }),
      }).catch(console.error);
      router.push("/daily/results");
    } else {
      const nextTurn = turn + 1;
      setTurn(nextTurn);
      advance(nextTurn);
    }
  };

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

      <GameView
        loading={loading}
        pair={pair}
        handleVote={handleVote}
        extraLabel={
          <div className="text-sm text-gray-400 dark:text-gray-500 font-bold ">
            Daily Challenge {dateString} &mdash; Round {turn + 1}
          </div>
        }
      />
    </main>
  );
}
