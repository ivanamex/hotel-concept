"use client";

import { useEffect, useState } from "react";
import { useT } from "@/i18n/context";
import { fmt } from "@/i18n";
import { liveValues } from "@/lib/season";

export function Ticker({ dark = false }: { dark?: boolean }) {
  const t = useT().ticker;
  const [lines, setLines] = useState<string[]>(t.perks);
  useEffect(() => {
    const v = liveValues();
    const live = [
      fmt(t.lake, { t: v.lakeTemp }),
      fmt(t.sunset, { t: v.sunset }),
      fmt(t.nextBoat, { t: v.nextBoat }),
      v.season === "summer" ? t.terrace : t.fire,
      v.season === "summer" ? t.bikes : t.chocolate,
    ];
    const merged: string[] = [];
    t.perks.forEach((p, i) => {
      merged.push(p);
      if (live[i]) merged.push(live[i]);
    });
    setLines(merged);
  }, [t]);

  const items = [...lines, ...lines];
  return (
    <div className={`ticker overflow-hidden border-y ${dark ? "border-white/10 bg-ink text-white" : "border-line bg-paper text-ink"}`} aria-label={t.label}>
      <div className="ticker-track flex w-max items-center py-3.5">
        {items.map((line, i) => (
          <span key={i} className="caps flex items-center !text-[10.5px]">
            <span className="px-6">{line}</span>
            <span className={`h-1 w-1 rounded-full ${dark ? "bg-sky" : "bg-lake"}`} />
          </span>
        ))}
      </div>
    </div>
  );
}
