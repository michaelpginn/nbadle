"use client";

import { useEffect, useState, useCallback } from "react";
import Cookies from "js-cookie";
import PlayerCard, { Player } from "@/components/PlayerCard";
import StreakCounter from "@/components/StreakCounter";
import GameOver from "@/components/GameOver";

type CardState = "idle" | "correct" | "wrong" | "fading";

interface VoteResult {
  winnerProbability: number;
  loserProbability: number;
}

function getBestStreak(): number {
  return parseInt(Cookies.get("best_streak") ?? "0", 10);
}

function saveBestStreak(value: number) {
  Cookies.set("best_streak", String(value), { expires: 365 });
}

export default function Home() {
  const [player1, setPlayer1] = useState<Player | null>(null);
  const [player2, setPlayer2] = useState<Player | null>(null);
  const [loading, setLoading] = useState(true);
  const [disabled, setDisabled] = useState(false);
  const [state1, setState1] = useState<CardState>("idle");
  const [state2, setState2] = useState<CardState>("idle");
  const [prob1, setProb1] = useState<number | null>(null);
  const [prob2, setProb2] = useState<number | null>(null);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [showGameOver, setShowGameOver] = useState(false);
  // Track the streak that just ended for the game-over dialog
  const [endedStreak, setEndedStreak] = useState(0);

  const fetchPlayers = useCallback(async () => {
    setLoading(true);
    setState1("idle");
    setState2("idle");
    setProb1(null);
    setProb2(null);
    setDisabled(false);

    try {
      const res = await fetch("/api/players/random");
      const data = await res.json();
      setPlayer1(data.player1);
      setPlayer2(data.player2);
    } catch (err) {
      console.error("Failed to fetch players", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load best streak from cookie on mount
  useEffect(() => {
    setBestStreak(getBestStreak());
    fetchPlayers();
  }, [fetchPlayers]);

  const handleVote = async (pickedPlayer: Player, otherPlayer: Player) => {
    if (disabled || !player1 || !player2) return;
    setDisabled(true);

    // Determine which player had higher ELO before the vote
    const pickedIsHigher = pickedPlayer.elo >= otherPlayer.elo;

    try {
      const res = await fetch("/api/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          winnerId: pickedPlayer.id,
          loserId: otherPlayer.id,
        }),
      });

      const result: VoteResult = await res.json();

      // Map probabilities back to card positions
      const pickedIsP1 = pickedPlayer.id === player1.id;
      if (pickedIsP1) {
        setProb1(result.winnerProbability);
        setProb2(result.loserProbability);
      } else {
        setProb1(result.loserProbability);
        setProb2(result.winnerProbability);
      }

      if (pickedIsHigher) {
        // Correct answer
        setStreak((prev) => {
          const newStreak = prev + 1;
          const currentBest = getBestStreak();
          if (newStreak > currentBest) {
            saveBestStreak(newStreak);
            setBestStreak(newStreak);
          }
          return newStreak;
        });

        if (pickedIsP1) {
          setState1("correct");
          setState2("fading");
        } else {
          setState2("correct");
          setState1("fading");
        }

        // After 1s highlight, fade both out and load next pair
        setTimeout(() => {
          setState1("fading");
          setState2("fading");
          setTimeout(fetchPlayers, 500);
        }, 1000);
      } else {
        // Wrong answer
        if (pickedIsP1) {
          setState1("wrong");
        } else {
          setState2("wrong");
        }

        setStreak((prev) => {
          setEndedStreak(prev);
          return 0;
        });
        setShowGameOver(true);
      }
    } catch (err) {
      console.error("Vote failed", err);
      setDisabled(false);
    }
  };

  const handleRestart = () => {
    setShowGameOver(false);
    setState1("idle");
    setState2("idle");
    fetchPlayers();
  };

  return (
    <main className="min-h-screen bg-gray-950 text-white flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-8 py-5 border-b border-white/10">
        <h1 className="text-2xl font-black tracking-tight">
          NBA<span className="text-orange-400">dle</span>
        </h1>
        <StreakCounter streak={streak} />
      </header>

      {/* Game area */}
      <div className="flex-1 flex flex-col items-center justify-center gap-8 px-4 py-10">
        <h2 className="text-3xl md:text-4xl font-black text-center tracking-tight">
          Who is hotter???
        </h2>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-12 h-12 border-4 border-orange-400 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-10 w-full max-w-3xl">
            {player1 && (
              <PlayerCard
                player={player1}
                state={state1}
                probability={prob1}
                onClick={() => handleVote(player1, player2!)}
                disabled={disabled}
              />
            )}

            <div className="text-3xl font-black text-gray-500 select-none shrink-0">
              vs
            </div>

            {player2 && (
              <PlayerCard
                player={player2}
                state={state2}
                probability={prob2}
                onClick={() => handleVote(player2, player1!)}
                disabled={disabled}
              />
            )}
          </div>
        )}
      </div>

      {showGameOver && (
        <GameOver
          streak={endedStreak}
          bestStreak={bestStreak}
          onRestart={handleRestart}
        />
      )}
    </main>
  );
}
