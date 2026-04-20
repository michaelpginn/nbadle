import { expectedScore } from "@/lib/elo";
import { CircleHelp } from "lucide-react";
import { ReactNode, useCallback, useMemo, useState } from "react";
import PlayerCard, { Player } from "./PlayerCard";

interface GameViewProps {
  loading: boolean;
  pair?: PlayerPair;
  handleVote: (correct: boolean, picked: Player, notPicked: Player) => void;
  extraLabel?: ReactNode;
  onHowToPlay?: () => void;
}

export interface PlayerPair {
  player1: Player;
  player2: Player;
}

type CardState = "idle" | "correct" | "wrong" | "fading";

export default function GameView({
  loading,
  pair,
  handleVote,
  extraLabel,
  onHowToPlay,
}: GameViewProps) {
  const [disabled, setDisabled] = useState(false);
  const [probsRevealed, setProbsRevealed] = useState(false);
  const [state1, setState1] = useState<CardState>("idle");
  const [state2, setState2] = useState<CardState>("idle");

  const [prevPair, setPrevPair] = useState(pair);
  if (pair !== prevPair) {
    setPrevPair(pair);
    setState1("idle");
    setState2("idle");
    setProbsRevealed(false);
  }

  const [prob1, prob2] = useMemo(() => {
    if (!pair) {
      return [0, 0];
    }
    const p1 = expectedScore(pair.player1.elo, pair.player2.elo);
    return [p1, 1 - p1];
  }, [pair]);

  const handleVoteLocal = useCallback(
    async (pickedPlayer: Player, otherPlayer: Player) => {
      if (disabled || !pair) return;
      setDisabled(true);
      const pickedIsHigher = pickedPlayer.elo >= otherPlayer.elo;
      const pickedIsP1 = pickedPlayer.id === pair.player1.id;
      setProbsRevealed(true);

      if (pickedIsHigher) {
        setState1(pickedIsP1 ? "correct" : "idle");
        setState2(pickedIsP1 ? "idle" : "correct");
      } else {
        setState1(pickedIsP1 ? "wrong" : "idle");
        setState2(pickedIsP1 ? "idle" : "wrong");
      }

      setTimeout(() => {
        setState1("fading");
        setState2("fading");
        setTimeout(async () => {
          handleVote(pickedIsHigher, pickedPlayer, otherPlayer);
          setDisabled(false);
        }, 1000);
      }, 2000);
    },
    [disabled, pair, handleVote],
  );

  return (
    <div className="flex-1 min-h-0 flex flex-col items-center justify-start gap-4 md:gap-8 px-4 py-4 md:py-10">
      <div className="flex items-center flex-col">
        {extraLabel}

        <h2 className="text-3xl md:text-4xl font-black text-center tracking-tight flex items-center gap-2">
          Who is hotter???
          {onHowToPlay && (
            <button
              onClick={onHowToPlay}
              className="text-gray-400 dark:text-gray-500 hover:text-orange-400 transition-colors"
              aria-label="How to play"
            >
              <CircleHelp size={20} />
            </button>
          )}
        </h2>
      </div>
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-12 h-12 border-4 border-orange-400 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : pair ? (
        <div className="flex flex-col md:flex-row items-center justify-center gap-3 md:gap-10 w-full max-w-3xl flex-1 min-h-0 md:flex-none">
          <PlayerCard
            player={pair.player1}
            state={state1}
            probability={prob1}
            probabilityRevealed={probsRevealed}
            onClick={() => {
              handleVoteLocal(pair.player1, pair.player2);
            }}
            disabled={disabled}
          />
          <div className="text-3xl font-black text-gray-300 dark:text-gray-500 select-none shrink-0">
            vs
          </div>
          <PlayerCard
            player={pair.player2}
            state={state2}
            probability={prob2}
            probabilityRevealed={probsRevealed}
            onClick={() => {
              handleVoteLocal(pair.player2, pair.player1);
            }}
            disabled={disabled}
          />
        </div>
      ) : (
        <div className="flex flex-col md:flex-row items-center justify-center gap-3 md:gap-10 w-full max-w-3xl flex-1 min-h-0 md:flex-none">
          There was a problem loading this matchup
        </div>
      )}
    </div>
  );
}
