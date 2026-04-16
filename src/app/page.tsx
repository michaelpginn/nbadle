"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Cookies from "js-cookie";
import PlayerCard, { MiniPlayerCard, Player } from "@/components/PlayerCard";
import StreakCounter from "@/components/StreakCounter";
import GameOver from "@/components/GameOver";
import { expectedScore } from "@/lib/elo";
import Link from "next/link";
import { Medal, CircleQuestionMark } from "lucide-react";
import { useSearchParams } from "next/navigation";

type CardState = "idle" | "correct" | "wrong" | "fading";

interface PlayerPair {
  player1: Player;
  player2: Player;
}

function getBestStreak(): number {
  return parseInt(Cookies.get("best_streak") ?? "0", 10);
}

function saveBestStreak(value: number) {
  Cookies.set("best_streak", String(value), { expires: 365 });
}

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
  const [player1, setPlayer1] = useState<Player | null>(null);
  const [player2, setPlayer2] = useState<Player | null>(null);
  const [loading, setLoading] = useState(true);
  const [disabled, setDisabled] = useState(false);
  const [state1, setState1] = useState<CardState>("idle");
  const [state2, setState2] = useState<CardState>("idle");
  const [lastState1, setLastState1] = useState<CardState>("idle");
  const [lastState2, setLastState2] = useState<CardState>("idle");
  const [prob1, setProb1] = useState<number>(0.5);
  const [prob2, setProb2] = useState<number>(0.5);
  const [probsRevealed, setProbsRevealed] = useState(false);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [showGameOver, setShowGameOver] = useState(false);
  const [endedStreak, setEndedStreak] = useState(0);
  const [showHowToPlay, setShowHowToPlay] = useState(false);

  const nextPair = useRef<PlayerPair | null>(null);
  const prefetching = useRef(false);
  const searchParams = useSearchParams();

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
      setPlayer1(pair.player1);
      setPlayer2(pair.player2);
      // Compute probabilities immediately from ELO — no round trip needed
      const p1 = expectedScore(pair.player1.elo, pair.player2.elo);
      setProb1(p1);
      setProb2(1 - p1);
      setState1("idle");
      setState2("idle");
      setDisabled(false);
      setProbsRevealed(false);
      setLoading(false);
      // Prefetch next pair in the background while the user decides
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

  useEffect(() => {
    setBestStreak(getBestStreak());
    const p1Id = searchParams.get("p1");
    const p2Id = searchParams.get("p2");
    advance(p1Id, p2Id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleVote = (pickedPlayer: Player, otherPlayer: Player) => {
    if (disabled || !player1 || !player2) return;
    setDisabled(true);

    const pickedIsHigher = pickedPlayer.elo >= otherPlayer.elo;
    const pickedIsP1 = pickedPlayer.id === player1.id;
    setProbsRevealed(true);

    // Fire-and-forget — ELO update happens in the background
    fetch("/api/vote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        winnerId: pickedPlayer.id,
        loserId: otherPlayer.id,
      }),
    }).catch(console.error);

    if (pickedIsHigher) {
      setStreak((prev) => {
        const next = prev + 1;
        if (next > getBestStreak()) {
          saveBestStreak(next);
          setBestStreak(next);
        }
        return next;
      });

      setState1(pickedIsP1 ? "correct" : "idle");
      setState2(pickedIsP1 ? "idle" : "correct");
      setLastState1(pickedIsP1 ? "correct" : "idle");
      setLastState2(pickedIsP1 ? "idle" : "correct");

      setTimeout(() => {
        setState1("fading");
        setState2("fading");
        setTimeout(advance, 1000);
      }, 2000);
    } else {
      setState1(pickedIsP1 ? "wrong" : "idle");
      setState2(pickedIsP1 ? "idle" : "wrong");
      setLastState1(pickedIsP1 ? "wrong" : "idle");
      setLastState2(pickedIsP1 ? "idle" : "wrong");

      setStreak((prev) => {
        setEndedStreak(prev);
        return 0;
      });

      // Show wrong highlight for 2s, then fade out, then show dialog
      setTimeout(() => {
        setState1("fading");
        setState2("fading");
        setTimeout(() => setShowGameOver(true), 1000);
      }, 2000);
    }
  };

  const handleRestart = () => {
    setShowGameOver(false);
    advance();
  };

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white flex flex-col">
      <header className="flex items-center justify-between px-8 py-5 border-b border-gray-200 dark:border-white/10">
        <div className="flex-1 flex items-center gap-3">
          <h1 className="text-2xl font-black tracking-tight">
            NBA<span className="text-orange-400">dle</span>
          </h1>
          <button
            onClick={() => setShowHowToPlay(true)}
            className="md:hidden  text-gray-400 dark:text-gray-500 text-xs font-bold flex items-center justify-center  hover:text-orange-400 transition-colors"
            aria-label="How to play"
          >
            <CircleQuestionMark size={20} />
          </button>
          <Link
            href="/leaderboard"
            className="md:hidden  text-gray-400 dark:text-gray-500 text-xs font-bold flex items-center justify-center  hover:text-orange-400 transition-colors"
          >
            <Medal size={20} />
          </Link>
        </div>
        <div className="gap-5 hidden md:flex">
          <button
            onClick={() => setShowHowToPlay(true)}
            className="rounded-full  text-gray-400 dark:text-gray-500 text-sm font-bold flex items-center justify-center hover:border-orange-400 hover:text-orange-400 transition-colors cursor-pointer"
            aria-label="How to play"
          >
            <CircleQuestionMark size={15} className="mr-1" /> How to Play
          </button>
          <Link
            href="/leaderboard"
            className="text-gray-400 dark:text-gray-500 text-sm font-bold flex items-center justify-center hover:border-orange-400 hover:text-orange-400 transition-colors"
          >
            <Medal size={15} className="mr-1" /> Leaderboard
          </Link>
        </div>
        <div className="flex-1 flex justify-end">
          <StreakCounter streak={streak} />
        </div>
      </header>

      <div className="flex-1 min-h-0 flex flex-col items-center justify-start gap-4 md:gap-8 px-4 py-4 md:py-10">
        <div className="flex items-center flex-col">
          <h2 className="text-3xl md:text-4xl font-black text-center tracking-tight">
            Who is hotter???
          </h2>
        </div>
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-12 h-12 border-4 border-orange-400 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="flex flex-col md:flex-row items-center justify-center gap-3 md:gap-10 w-full max-w-3xl flex-1 min-h-0 md:flex-none">
            {player1 && (
              <PlayerCard
                player={player1}
                state={state1}
                probability={prob1}
                probabilityRevealed={probsRevealed}
                onClick={() => handleVote(player1, player2!)}
                disabled={disabled}
              />
            )}

            <div className="text-3xl font-black text-gray-300 dark:text-gray-500 select-none shrink-0">
              vs
            </div>

            {player2 && (
              <PlayerCard
                player={player2}
                state={state2}
                probability={prob2}
                probabilityRevealed={probsRevealed}
                onClick={() => handleVote(player2, player1!)}
                disabled={disabled}
              />
            )}
          </div>
        )}
      </div>

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
            <button
              onClick={() => setShowHowToPlay(false)}
              className="mt-6 w-full bg-orange-400 hover:bg-orange-500 text-white font-bold py-3 rounded-xl transition-colors cursor-pointer"
            >
              Got it
            </button>
          </div>
        </div>
      )}

      {showGameOver && player1 && player2 && (
        <GameOver
          streak={endedStreak}
          bestStreak={bestStreak}
          onRestart={handleRestart}
          player1Card={
            <MiniPlayerCard
              player={player1}
              state={lastState1}
              probability={prob1}
            />
          }
          player2Card={
            <MiniPlayerCard
              player={player2}
              state={lastState2}
              probability={prob2}
            />
          }
        />
      )}
    </main>
  );
}
