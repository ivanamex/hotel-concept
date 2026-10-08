"use client";

import { useEffect, useState } from "react";
import { liveLines } from "@/lib/season";

const PERKS = ["Best rate when you book here", "Free cancellation on flexible plans", "Breakfast added to any rate", "Concierge on WhatsApp", "Ten rooms, one street from the water"];

export function Ticker({ dark = false }: { dark?: boolean }) {
  const [lines, setLines] = useState<string[]>(PERKS);
  useEffect(() => {
    const live = liveLines();
    const merged: string[] = [];
    PERKS.forEach((p, i) => {
      merged.push(p);
      if (live[i]) merged.push(live[i]);
    });
    setLines(merged);
  }, []);

  const items = [...lines, ...lines];
  return (
    <div className={`ticker overflow-hidden border-y ${dark ? "border-white/10 bg-ink text-white" : "border-line bg-paper text-ink"}`} aria-label="Good to know">
      <div className="ticker-track flex w-max items-center py-3.5">
        {items.map((t, i) => (
          <span key={i} className="caps flex items-center !text-[10.5px]">
            <span className="px-6">{t}</span>
            <span className={`h-1 w-1 rounded-full ${dark ? "bg-sky" : "bg-lake"}`} />
          </span>
        ))}
      </div>
    </div>
  );
}
