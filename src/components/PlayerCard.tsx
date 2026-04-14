"use client";

import Image from "next/image";

export interface Player {
  id: number;
  nbaId: string;
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

const headshotUrl = (nbaId: string) =>
  `https://cdn.nba.com/headshots/nba/latest/1040x760/${nbaId}.png`;

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
      : "border-white/10 shadow-black/30";

  const overlayClass =
    state === "correct"
      ? "bg-green-400/20"
      : state === "wrong"
      ? "bg-red-500/20"
      : "bg-transparent";

  const cardOpacity = state === "fading" ? "opacity-0" : "opacity-100";

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        relative flex flex-col items-center
        bg-gray-900 rounded-2xl border-2 ${borderClass}
        shadow-2xl cursor-pointer select-none
        transition-all duration-700
        ${cardOpacity}
        ${!disabled ? "hover:scale-[1.02] hover:border-white/30" : ""}
        w-full max-w-sm
        group
      `}
    >
      {/* Coloured overlay */}
      <div
        className={`absolute inset-0 rounded-2xl transition-colors duration-300 pointer-events-none z-10 ${overlayClass}`}
      />

      {/* Win probability badge */}
      <div className="h-10 flex items-center justify-center mt-4">
        {probabilityRevealed ? (
          <span className="text-2xl font-bold text-white tracking-wide">
            {(probability * 100).toFixed(1)}%
          </span>
        ) : (
          <span className="text-2xl font-bold text-transparent select-none">
            —
          </span>
        )}
      </div>

      {/* Headshot */}
      <div className="relative w-64 h-48 mx-auto overflow-hidden rounded-xl mt-2">
        <Image
          src={headshotUrl(player.nbaId)}
          alt={player.name}
          fill
          className="object-cover object-top"
          unoptimized
          priority
        />
      </div>

      {/* Name + team */}
      <div className="py-5 px-4 text-center">
        <p className="text-xl font-bold text-white">{player.name}</p>
        <p className="text-sm text-gray-400 mt-1">{player.team}</p>
      </div>
    </button>
  );
}
