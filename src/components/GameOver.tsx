"use client";

interface GameOverProps {
  streak: number;
  bestStreak: number;
  onRestart: () => void;
}

export default function GameOver({ streak, bestStreak, onRestart }: GameOverProps) {
  const isNewBest = streak > 0 && streak >= bestStreak;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-3xl shadow-2xl p-10 max-w-sm w-full text-center flex flex-col gap-6 animate-in fade-in zoom-in duration-200">
        <div className="text-6xl">😬</div>
        <h2 className="text-3xl font-black text-gray-900 dark:text-white">Game Over</h2>

        <div className="flex flex-col gap-1">
          <p className="text-gray-500 dark:text-gray-400 text-sm uppercase tracking-widest">
            Your streak
          </p>
          <p className="text-5xl font-black text-gray-900 dark:text-white">{streak}</p>
        </div>

        <div className="h-px bg-gray-200 dark:bg-white/10 w-full" />

        <div className="flex flex-col gap-1">
          <p className="text-gray-500 dark:text-gray-400 text-sm uppercase tracking-widest">
            Best streak
          </p>
          <p className="text-4xl font-black text-orange-400">{bestStreak}</p>
          {isNewBest && (
            <p className="text-green-400 text-sm font-semibold mt-1">
              New personal best!
            </p>
          )}
        </div>

        <button
          onClick={onRestart}
          className="mt-2 w-full bg-orange-400 hover:bg-orange-500 text-white font-bold py-3 rounded-xl transition-colors"
        >
          Play Again
        </button>
      </div>
    </div>
  );
}
