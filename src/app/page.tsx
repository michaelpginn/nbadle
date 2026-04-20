"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { Player } from "@/components/PlayerCard";
import StreakCounter from "@/components/StreakCounter";
import GameOver from "@/components/GameOver";
import Link from "next/link";
import { BarChart2, Trophy, Calendar } from "lucide-react";
import { LEADERBOARD_SIZE } from "@/lib/constants";
import GameView, { PlayerPair } from "@/components/GameView";
import {
  getBestStreak,
  saveBestStreak,
  getDailyResults,
  hasDismissedDailyNudge,
  saveDismissedDailyNudge,
} from "@/lib/cookies";
import { getDayOf } from "@/lib/dates";

async function fetchRandomPair(): Promise<PlayerPair> {
  const res = await fetch("/api/players/random");
  if (!res.ok) throw new Error("Failed to fetch players");
  return res.json();
}

async function fetchPair(p1Id: string, p2Id: string): Promise<PlayerPair> {
  const res = await fetch(`/api/players?p1=${p1Id}&p2=${p2Id}`);
  if (!res.ok) throw new Error("Failed to fetch players");
  return res.json();
}

export default function Home() {
  const [pair, setPair] = useState<PlayerPair | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [showGameOver, setShowGameOver] = useState<{
    show: boolean;
    pickedId?: number;
  }>({
    show: false,
  });
  const [endedStreak, setEndedStreak] = useState(0);
  const [showHowToPlay, setShowHowToPlay] = useState(false);
  const [showDailyNudge, setShowDailyNudge] = useState(false);
  const [madeLeaderboard, setMadeLeaderboard] = useState<boolean | null>(null);

  const nextPair = useRef<PlayerPair | null>(null);
  const prefetching = useRef(false);

  const prefetchNext = useCallback(async () => {
    if (prefetching.current) return;
    prefetching.current = true;
    try {
      nextPair.current = await fetchRandomPair();
    } catch {
      nextPair.current = null;
    } finally {
      prefetching.current = false;
    }
  }, []);

  const displayPair = useCallback(
    (pair: PlayerPair) => {
      setPair(pair);
      setLoading(false);
      prefetchNext();
    },
    [prefetchNext],
  );

  const advance = useCallback(
    async (p1Id?: string | null, p2Id?: string | null) => {
      if (nextPair.current) {
        const pair = nextPair.current;
        nextPair.current = null;
        displayPair(pair);
      } else {
        setLoading(true);
        try {
          if (p1Id && p2Id) {
            displayPair(await fetchPair(p1Id, p2Id));
          } else {
            displayPair(await fetchRandomPair());
          }
        } catch (err) {
          console.error("Failed to fetch players", err);
          setLoading(false);
        }
      }
    },
    [displayPair],
  );

  // First page load
  useEffect(() => {
    setBestStreak(getBestStreak());

    const params = new URLSearchParams(window.location.search);
    const p1Id = params.get("p1");
    const p2Id = params.get("p2");
    advance(p1Id, p2Id);

    const cookie = getDailyResults();
    const today = getDayOf(new Date()).toISOString();
    const playedToday = cookie && new Date(cookie.day).toISOString() === today;
    let nudgeTimer: ReturnType<typeof setTimeout> | null = null;
    if (
      !playedToday &&
      !hasDismissedDailyNudge() &&
      p1Id == null &&
      p2Id == null
    ) {
      nudgeTimer = setTimeout(() => setShowDailyNudge(true), 1500);
    }

    const ref = params.get("ref");
    let ctrl: AbortController | null = null;
    if (ref) {
      ctrl = new AbortController();
      fetch("/api/ref", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refId: ref }),
        signal: ctrl.signal,
      }).catch(console.error);
    }

    return () => {
      if (nudgeTimer) clearTimeout(nudgeTimer);
      if (ctrl) ctrl.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleVote = (
    correct: boolean,
    pickedPlayer: Player,
    otherPlayer: Player,
  ) => {
    // Fire-and-forget — ELO update happens in the background
    fetch("/api/vote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        winnerId: pickedPlayer.id,
        loserId: otherPlayer.id,
      }),
    }).catch(console.error);

    if (correct) {
      setStreak((prev) => {
        const next = prev + 1;
        if (next > getBestStreak()) {
          saveBestStreak(next);
          setBestStreak(next);
        }
        return next;
      });
      advance();
    } else {
      const endedAt = streak;
      setStreak((prev) => {
        setEndedStreak(prev);
        return 0;
      });

      // Check leaderboard eligibility during the transition window
      setMadeLeaderboard(null);
      fetch("/api/leaderboard")
        .then((r) => r.json())
        .then(({ entries }: { entries: { streak: number }[] }) => {
          const canMake =
            endedAt > 0 &&
            (entries.length < LEADERBOARD_SIZE ||
              endedAt > entries[entries.length - 1].streak);
          setMadeLeaderboard(canMake);
        })
        .catch(() => setMadeLeaderboard(false));

      setShowGameOver({
        show: true,
        pickedId: pickedPlayer.id,
      });
    }
  };

  const handleRestart = () => {
    setShowGameOver({ show: false });
    advance();
  };

  return (
    <main className="min-h-dvh bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white flex flex-col pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)]">
      <header className="flex items-center justify-between px-8 py-2 md:py-5 border-b border-gray-200 dark:border-white/10">
        <div className="flex-1 flex items-center gap-3">
          <h1 className="text-2xl font-black tracking-tight">
            NBA<span className="text-orange-400">dle</span>
          </h1>
          <Link
            href="/daily"
            className="md:hidden text-gray-400 dark:text-gray-500 text-xs font-bold flex items-center justify-center hover:text-orange-400 transition-colors"
            aria-label="Daily challenge"
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
            href="/daily"
            className="text-gray-400 dark:text-gray-500 text-sm font-bold flex items-center justify-center hover:text-orange-400 transition-colors"
          >
            <Calendar size={15} className="mr-1" /> Daily
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
        <div className="flex-1 flex justify-end">
          <StreakCounter streak={streak} />
        </div>
      </header>

      <GameView
        loading={loading}
        pair={pair}
        handleVote={handleVote}
        onHowToPlay={() => setShowHowToPlay(true)}
      />

      {showHowToPlay && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
          onClick={() => setShowHowToPlay(false)}
        >
          <div
            className="bg-white dark:bg-gray-900 rounded-2xl p-8 max-w-sm w-full mx-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-black mb-4">How to play</h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              You will be given two random NBA players. Your goal is to guess
              which player most people think is hotter.
            </p>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mt-4">
              Your vote counts! As you play, your votes will update each
              player&apos;s win probability.
            </p>
            <button
              onClick={() => setShowHowToPlay(false)}
              className="mt-6 w-full bg-orange-400 hover:bg-orange-500 text-white font-bold py-3 rounded-xl transition-colors cursor-pointer"
            >
              Got it
            </button>
          </div>
        </div>
      )}

      {showDailyNudge && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-3xl shadow-2xl p-8 max-w-sm w-full mx-4 text-center flex flex-col gap-6 animate-in fade-in zoom-in duration-200">
            <Calendar size={36} className="text-orange-400 mx-auto" />
            <div className="flex flex-col gap-2">
              <h2 className="text-3xl font-black text-gray-900 dark:text-white">
                Daily Challenge
              </h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                Play today&apos;s fixed set of matchups and see how your picks
                compare to everyone else.
              </p>
            </div>
            <div className="flex flex-col">
              <Link
                href="/daily"
                className="w-full bg-orange-400 hover:bg-orange-500 text-white font-bold py-3 rounded-xl transition-colors"
              >
                Play now
              </Link>
              <button
                onClick={() => {
                  saveDismissedDailyNudge();
                  setShowDailyNudge(false);
                }}
                className="text-gray-400 dark:text-gray-500 text-sm font-semibold hover:text-gray-600 dark:hover:text-gray-300 transition-colors cursor-pointer pt-3"
              >
                Maybe later
              </button>
            </div>
          </div>
        </div>
      )}

      {showGameOver.show && showGameOver.pickedId && pair && (
        <GameOver
          streak={endedStreak}
          bestStreak={bestStreak}
          onRestart={handleRestart}
          madeLeaderboard={madeLeaderboard}
          pair={pair}
          pickedId={showGameOver.pickedId}
        />
      )}
    </main>
  );
}
