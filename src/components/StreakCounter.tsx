"use client";

interface StreakCounterProps {
  streak: number;
}

export default function StreakCounter({ streak }: StreakCounterProps) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-gray-400 text-sm uppercase tracking-widest font-semibold">
        Streak
      </span>
      <span className="text-4xl font-black text-white tabular-nums">
        {streak}
      </span>
      {streak >= 5 && (
        <span className="text-orange-400 text-2xl animate-pulse">🔥</span>
      )}
    </div>
  );
}
