import type { SeasonMode } from "./types";

export type Season = "winter" | "summer";

export function seasonForDate(d = new Date()): Season {
  const m = d.getMonth() + 1; // 1–12
  return m >= 11 || m <= 3 ? "winter" : "summer";
}

export function resolveSeason(mode: SeasonMode, d = new Date()): Season {
  return mode === "auto" ? seasonForDate(d) : mode;
}

/* live-feel lines for the ticker — approximate monthly values for Lausanne */
const LAKE_TEMP = [6, 5, 7, 10, 14, 18, 21, 22, 19, 15, 11, 8];
const SUNSET = ["17:10", "17:50", "18:35", "20:15", "20:50", "21:20", "21:15", "20:35", "19:40", "18:45", "17:05", "16:50"];
const BOATS = ["10:15", "12:05", "14:30", "16:10"];

export function liveLines(d = new Date()): string[] {
  const m = d.getMonth();
  const season = seasonForDate(d);
  const hhmm = d.getHours() * 60 + d.getMinutes();
  const next = BOATS.find((b) => Number(b.slice(0, 2)) * 60 + Number(b.slice(3)) > hhmm) ?? BOATS[0];
  return [
    `Lake ${LAKE_TEMP[m]} °C`,
    `Sunset ${SUNSET[m]}`,
    `Next boat to Montreux ${next}`,
    season === "summer" ? "Terrace open from 17:00" : "Fire lit in the salon",
    season === "summer" ? "Bikes ready at reception" : "Hot chocolate at 16:00",
  ];
}
