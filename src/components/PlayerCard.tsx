"use client";

import { nbaHeadshotUrl } from "@/lib/image_urls";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

export interface Player {
  id: number;
  nbaId: string;
  nbaIdHash: string | null;
  name: string;
  team: string;
  elo: number;
  voteCount: number;
}

type CardState = "idle" | "correct" | "wrong" | "fading";

interface PlayerCardProps {
  player: Player;
  state: CardState;
  probability: number;
  probabilityRevealed: boolean;
  onClick: () => void;
  disabled: boolean;
}

const DURATION = 1000; // ms

function useCountUp(target: number, running: boolean): number {
  const [displayed, setDisplayed] = useState(0);
  const rafRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    if (!running) {
      setDisplayed(0);
      startTimeRef.current = null;
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      return;
    }

    const tick = (now: number) => {
      if (startTimeRef.current === null) startTimeRef.current = now;
      const elapsed = now - startTimeRef.current;
      const progress = Math.min(elapsed / DURATION, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayed(eased * target);
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick);
      }
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [running, target]);

  return displayed;
}

export default function PlayerCard({
  player,
  state,
  probability,
  probabilityRevealed,
  onClick,
  disabled,
}: PlayerCardProps) {
  const borderClass =
    state === "correct"
      ? "border-green-400 shadow-green-400/60"
      : state === "wrong"
        ? "border-red-500 shadow-red-500/60"
        : "border-gray-200 dark:border-white/10 shadow-gray-300/20 dark:shadow-black/30";

  const overlayClass =
    state === "correct"
      ? "bg-green-400/20"
      : state === "wrong"
        ? "bg-red-500/20"
        : "bg-transparent";

  const cardOpacity = state === "fading" ? "opacity-0" : "opacity-100";

  const displayed = useCountUp(probability * 100, probabilityRevealed);

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        relative flex flex-col items-center
        bg-white dark:bg-gray-900 rounded-2xl border-2 ${borderClass}
        shadow-2xl cursor-pointer select-none
        transition-all duration-700
        ${cardOpacity}
        ${!disabled ? "hover:scale-[1.02] hover:border-white/30" : ""}
        w-full max-w-sm flex-1 md:flex-none
        group
      `}
    >
      {/* Coloured overlay */}
      <div
        className={`absolute inset-0 rounded-2xl transition-colors duration-300 pointer-events-none z-10 ${overlayClass}`}
      />

      {/* Win probability badge */}
      <div className="h-10 flex items-center justify-center mt-2 md:mt-4">
        {probabilityRevealed ? (
          <span className="text-2xl font-bold text-gray-900 dark:text-white tracking-wide tabular-nums">
            {displayed.toFixed(1)}%
          </span>
        ) : (
          <span className="text-2xl font-bold text-transparent select-none">
            —
          </span>
        )}
      </div>

      {/* Headshot */}
      <div className="relative w-full flex-1 min-h-0 md:flex-none md:w-64 md:h-48 mx-auto overflow-hidden rounded-xl mt-1 md:mt-2">
        <Image
          src={nbaHeadshotUrl(player.nbaId)}
          alt={player.name}
          fill
          className="object-contain md:object-cover object-top"
          unoptimized
          priority
        />
      </div>

      {/* Name + team */}
      <div className="py-2 md:py-5 px-4 text-center">
        <p className="text-xl font-bold text-gray-900 dark:text-white">
          {player.name}
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          {player.team}
        </p>
      </div>
    </button>
  );
}

interface MiniPlayerCardProps {
  player: Player;
  state: CardState;
  probability: number;
}

export function MiniPlayerCard({
  player,
  state,
  probability,
}: MiniPlayerCardProps) {
  const borderClass =
    state === "correct"
      ? "border-green-400 shadow-green-400/60"
      : state === "wrong"
        ? "border-red-500 shadow-red-500/60"
        : "border-gray-200 dark:border-white/10 shadow-gray-300/20 dark:shadow-black/30";

  const overlayClass =
    state === "correct"
      ? "bg-green-400/20"
      : state === "wrong"
        ? "bg-red-500/20"
        : "bg-transparent";

  return (
    <div
      className={`
        relative flex flex-col items-center
        bg-white dark:bg-gray-900 rounded-2xl border-2 ${borderClass}
        shadow-2xl select-none
        transition-all duration-700
        w-full max-w-sm md:flex-none
        group
      `}
    >
      {/* Coloured overlay */}
      <div
        className={`absolute inset-0 rounded-2xl transition-colors duration-300 pointer-events-none z-10 ${overlayClass}`}
      />

      {/* Win probability badge */}
      <div className="h-10 flex items-center justify-center mt-2 md:mt-4">
        <span className="text-2xl font-bold text-gray-900 dark:text-white tracking-wide tabular-nums">
          {(probability * 100).toFixed(1)}%
        </span>
      </div>

      {/* Headshot */}
      <div className="relative w-full h-24 flex-none md:w-64 md:h-48 mx-auto overflow-hidden rounded-xl mt-1 md:mt-2">
        <Image
          src={nbaHeadshotUrl(player.nbaId)}
          alt={player.name}
          fill
          className="object-contain md:object-cover object-top"
          unoptimized
          priority
        />
      </div>

      {/* Name + team */}
      <div className="py-2 md:py-5 px-4 text-center">
        <p className="text-sm font-bold text-gray-900 dark:text-white">
          {player.name}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {player.team}
        </p>
      </div>
    </div>
  );
}
