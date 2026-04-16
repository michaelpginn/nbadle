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
    <div className="mx-auto py-4 md:py-10 max-w-xl">
      <div className="flex justify-center flex-col ">
        <h2 className="text-3xl dark:text-white mb-4 font-black text-center">
          {title}
        </h2>
        <div className="flex flex-row gap-4 justify-center">
          <button
            onClick={() => {
              setCurrentStat("top10");
            }}
            className={`${currentStat == "top10" ? "text-orange-300" : "text-gray-400 dark:text-gray-500"} text-sm font-bold flex items-center justify-center hover:border-orange-400 hover:text-orange-400 transition-colors cursor-pointer`}
          >
            Top 10
          </button>
          <button
            onClick={() => {
              setCurrentStat("chop10");
            }}
            className={`${currentStat == "chop10" ? "text-orange-300" : "text-gray-400 dark:text-gray-500"} text-sm font-bold flex items-center justify-center hover:border-orange-400 hover:text-orange-400 transition-colors cursor-pointer`}
          >
            Chopped 10
          </button>
          <button
            onClick={() => {
              setCurrentStat("top5teams");
            }}
            className={`${currentStat == "top5teams" ? "text-orange-300" : "text-gray-400 dark:text-gray-500"} text-sm font-bold flex items-center justify-center hover:border-orange-400 hover:text-orange-400 transition-colors cursor-pointer`}
          >
            Top Teams
          </button>
          <button
            onClick={() => {
              setCurrentStat("chop5teams");
            }}
            className={`${currentStat == "chop5teams" ? "text-orange-300" : "text-gray-400 dark:text-gray-500"} text-sm font-bold flex items-center justify-center hover:border-orange-400 hover:text-orange-400 transition-colors cursor-pointer`}
          >
            Chopped Teams
          </button>
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
