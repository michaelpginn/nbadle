"use client";

import StatSection from "@/components/StatSection";
import { Stats } from "@/lib/stats";
import { useState } from "react";

interface StatsContainerProps {
  stats: Stats;
}
export default function StatsContainer({
  stats: { players, teams },
}: StatsContainerProps) {
  const [currentStat, setCurrentStat] = useState<
    "top10" | "chop10" | "top5teams" | "chop5teams"
  >("top10");

  const titles = {
    top10: "Top 10",
    chop10: "Chopped 10",
    top5teams: "Top 5 Teams",
    chop5teams: "Chopped 5 Teams",
  };
  const title = titles[currentStat];

  return (
    <div className="flex flex-col items-center py-12">
      <div className="w-full max-w-lg mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <p className="text-xs font-bold tracking-[0.3em] uppercase text-orange-400 mb-1">
            Overall
          </p>
          <h1 className="text-4xl font-black tracking-tight">{title}</h1>
          <div className="flex flex-row gap-4 justify-center mt-2">
            <button
              onClick={() => {
                setCurrentStat("top10");
              }}
              className={`${currentStat == "top10" ? "text-orange-500 dark:text-orange-300" : "text-gray-400 dark:text-gray-500"} text-xs font-bold flex items-center justify-center hover:border-orange-400 hover:text-orange-400 transition-colors cursor-pointer`}
            >
              Top 10
            </button>
            <button
              onClick={() => {
                setCurrentStat("chop10");
              }}
              className={`${currentStat == "chop10" ? "text-orange-500 dark:text-orange-300" : "text-gray-400 dark:text-gray-500"} text-xs font-bold flex items-center justify-center hover:border-orange-400 hover:text-orange-400 transition-colors cursor-pointer`}
            >
              Chopped 10
            </button>
            <button
              onClick={() => {
                setCurrentStat("top5teams");
              }}
              className={`${currentStat == "top5teams" ? "text-orange-500 dark:text-orange-300" : "text-gray-400 dark:text-gray-500"} text-xs font-bold flex items-center justify-center hover:border-orange-400 hover:text-orange-400 transition-colors cursor-pointer`}
            >
              Top Teams
            </button>
            <button
              onClick={() => {
                setCurrentStat("chop5teams");
              }}
              className={`${currentStat == "chop5teams" ? "text-orange-500 dark:text-orange-300" : "text-gray-400 dark:text-gray-500"} text-xs font-bold flex items-center justify-center hover:border-orange-400 hover:text-orange-400 transition-colors cursor-pointer`}
            >
              Chopped Teams
            </button>
          </div>
        </div>

        {currentStat == "top10" ? (
          <StatSection players={players.slice(0, 10)} />
        ) : currentStat == "chop10" ? (
          <StatSection players={players.slice(-10)} />
        ) : currentStat == "top5teams" ? (
          <StatSection teams={teams.slice(0, 5)} />
        ) : (
          <StatSection teams={teams.slice(-5)} />
        )}
      </div>
    </div>
  );
}
