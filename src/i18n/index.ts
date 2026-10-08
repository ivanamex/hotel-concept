import type { Extra, RatePlan, Room } from "@/lib/types";
import { parseISODate } from "@/lib/engine";
import { DEFAULT_LANG, isLang, type Lang } from "./config";
import { de } from "./de";
import { en, type Dict } from "./en";
import { fr } from "./fr";
import { it } from "./it";

export type { Dict } from "./en";
export * from "./config";

export const DICTS: Record<Lang, Dict> = { en, fr, de, it };

export function getDict(lang: string | undefined): Dict {
  return DICTS[isLang(lang) ? lang : DEFAULT_LANG];
}

/** "{name} — {ref}" → values in. */
export function fmt(template: string, vars: Record<string, string | number | undefined>): string {
  return template.replace(/\{(\w+)\}/g, (m, k) => (vars[k] === undefined ? m : String(vars[k])));
}

/* ---------- content in the visitor's language ---------- */

export function localizeRoom(room: Room, t: Dict): Room {
  const c = t.rooms.copy[room.slug];
  return {
    ...room,
    category: t.rooms.categories[room.category as keyof typeof t.rooms.categories] ?? room.category,
    beds: c?.beds ?? room.beds,
    summary: c?.summary ?? room.summary,
    description: c?.description ?? room.description,
    features: room.features.map((f) => t.rooms.features[f] ?? f),
  };
}

export function localizeExtra(extra: Extra, t: Dict): Extra {
  const c = t.extras[extra.id];
  return c ? { ...extra, name: c.name, short: c.short } : extra;
}

export function localizeRatePlan(plan: RatePlan, t: Dict): RatePlan {
  const c = t.ratePlans[plan.id];
  return c ? { ...plan, ...c } : plan;
}

export function viewLabel(view: string, t: Dict): string {
  return t.common.viewLabels[view as keyof typeof t.common.viewLabels] ?? view;
}

export function unitLabel(unit: string, t: Dict): string {
  return t.units[unit] ?? unit;
}

/* ---------- dates & counts ---------- */

export function fmtDateL(iso: string, t: Dict, style: "short" | "medium" | "long" | "weekday" = "medium"): string {
  if (!iso) return "";
  const d = parseISODate(iso.slice(0, 10));
  const day = d.getDate();
  const m = d.getMonth();
  switch (style) {
    case "short":
      return `${day} ${t.months[m]}`;
    case "medium":
      return `${day} ${t.months[m]} ${d.getFullYear()}`;
    case "long":
      return `${t.daysLong[d.getDay()]} ${day} ${t.monthsLong[m]} ${d.getFullYear()}`;
    case "weekday":
      return `${t.days[d.getDay()]} ${day} ${t.months[m]}`;
  }
}

export function fmtRangeL(checkIn: string, checkOut: string, t: Dict): string {
  const a = parseISODate(checkIn);
  const b = parseISODate(checkOut);
  if (a.getMonth() === b.getMonth() && a.getFullYear() === b.getFullYear()) {
    return `${a.getDate()}–${b.getDate()} ${t.months[a.getMonth()]} ${a.getFullYear()}`;
  }
  return `${fmtDateL(checkIn, t, "short")} – ${fmtDateL(checkOut, t, "short")} ${b.getFullYear()}`;
}

export function nightsLabel(n: number, t: Dict): string {
  return `${n} ${n === 1 ? t.common.night : t.common.nights}`;
}

export function guestsLabelL(adults: number, children: number, t: Dict): string {
  const parts = [`${adults} ${adults === 1 ? t.common.adult : t.common.adults}`];
  if (children) parts.push(`${children} ${children === 1 ? t.common.child : t.common.children}`);
  return parts.join(", ");
}
