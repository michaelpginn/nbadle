"use client";

import { useState, useEffect } from "react";
import { hasCookieConsent, saveCookieConsent } from "@/lib/cookies";

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!hasCookieConsent()) setVisible(true);
  }, []);

  if (!visible) return null;

  function accept() {
    saveCookieConsent();
    setVisible(false);
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-between gap-4 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-white/10 px-6 py-4 shadow-lg text-sm">
      <p className="text-gray-600 dark:text-gray-400">
        This site uses cookies to save your streak and leaderboard name.
      </p>
      <button
        onClick={accept}
        className="shrink-0 bg-orange-400 hover:bg-orange-500 text-white font-bold px-4 py-2 rounded-lg transition-colors cursor-pointer"
      >
        Got it
      </button>
    </div>
  );
}
