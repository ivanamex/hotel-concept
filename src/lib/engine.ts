import type { Extra, Quote, RatePlan, Reservation, Room, Season } from "./types";

/* ---------- dates (all local, YYYY-MM-DD strings) ---------- */

export function toISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function parseISODate(s: string): Date {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function addDays(s: string, n: number): string {
  const d = parseISODate(s);
  d.setDate(d.getDate() + n);
  return toISODate(d);
}

export function todayISO(): string {
  return toISODate(new Date());
}

export function nightsBetween(checkIn: string, checkOut: string): number {
  const a = parseISODate(checkIn).getTime();
  const b = parseISODate(checkOut).getTime();
  return Math.round((b - a) / 86_400_000);
}

export function eachNight(checkIn: string, checkOut: string): string[] {
  const n = nightsBetween(checkIn, checkOut);
  const out: string[] = [];
  for (let i = 0; i < n; i++) out.push(addDays(checkIn, i));
  return out;
}

export function rangesOverlap(aIn: string, aOut: string, bIn: string, bOut: string): boolean {
  // half-open intervals [in, out)
  return aIn < bOut && bIn < aOut;
}

/* ---------- pricing ---------- */

export function seasonFor(date: string, seasons: Season[]): Season | undefined {
  const mmdd = date.slice(5);
  // later entries win (more specific seasons are listed last)
  let hit: Season | undefined;
  for (const s of seasons) {
    const inRange = s.from <= s.to ? mmdd >= s.from && mmdd <= s.to : mmdd >= s.from || mmdd <= s.to;
    if (inRange) hit = s;
  }
  return hit;
}

export function nightlyPrice(room: Room, date: string, plan: RatePlan, seasons: Season[]): number {
  const season = seasonFor(date, seasons);
  const mult = season?.multiplier ?? 1;
  const base = room.basePrice * mult;
  const discounted = base * (1 - plan.discount);
  // weekend bump (Fri/Sat) of 8 %
  const dow = parseISODate(date).getDay();
  const weekend = dow === 5 || dow === 6 ? 1.08 : 1;
  return Math.round((discounted * weekend) / 5) * 5;
}

export function extraCost(
  extra: Extra,
  ctx: { nights: number; adults: number; children: number },
): number {
  switch (extra.unit) {
    case "per_stay":
      return extra.price;
    case "per_night":
      return extra.price * ctx.nights;
    case "per_person":
      return extra.price * (ctx.adults + ctx.children);
    case "per_person_night":
      return extra.price * (ctx.adults + ctx.children) * ctx.nights;
    case "per_ride":
      return extra.price;
  }
}

export interface QuoteInput {
  room: Room;
  checkIn: string;
  checkOut: string;
  adults: number;
  children: number;
  plan: RatePlan;
  extras: Extra[];
  seasons: Season[];
  breakfastPrice: number;
  cityTaxPerPersonNight: number;
}

export function quote(input: QuoteInput): Quote {
  const nights = nightsBetween(input.checkIn, input.checkOut);
  const nightly = eachNight(input.checkIn, input.checkOut).map((date) => ({
    date,
    price: nightlyPrice(input.room, date, input.plan, input.seasons),
  }));
  const roomTotal = nightly.reduce((s, n) => s + n.price, 0);
  const breakfastTotal = input.plan.includesBreakfast
    ? nights * (input.adults * input.breakfastPrice + input.children * Math.round(input.breakfastPrice / 2))
    : 0;
  const extrasTotal = input.extras.reduce(
    (s, e) => s + extraCost(e, { nights, adults: input.adults, children: input.children }),
    0,
  );
  const cityTax = nights * input.adults * input.cityTaxPerPersonNight;
  return {
    nights,
    nightly,
    roomTotal,
    breakfastTotal,
    extrasTotal,
    cityTax,
    total: roomTotal + breakfastTotal + extrasTotal + cityTax,
  };
}

/* ---------- availability ---------- */

export function isRoomAvailable(
  room: Room,
  checkIn: string,
  checkOut: string,
  reservations: Reservation[],
  ignoreId?: string,
): boolean {
  if (room.status !== "active") return false;
  return !reservations.some(
    (r) =>
      r.roomId === room.id &&
      r.id !== ignoreId &&
      r.status !== "cancelled" &&
      rangesOverlap(checkIn, checkOut, r.checkIn, r.checkOut),
  );
}

export function roomFits(room: Room, adults: number, children: number): boolean {
  return adults <= room.maxAdults && adults + children <= room.maxGuests;
}

/* ---------- references ---------- */

export function nextReference(reservations: Reservation[], year = new Date().getFullYear()): string {
  const prefix = `MV-${year}-`;
  const max = reservations
    .filter((r) => r.ref.startsWith(prefix))
    .map((r) => Number(r.ref.slice(prefix.length)) || 0)
    .reduce((a, b) => Math.max(a, b), 0);
  return `${prefix}${String(max + 1).padStart(4, "0")}`;
}

export function uid(prefix = "id"): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36).slice(-4)}`;
}

/* ---------- KPIs for the office ---------- */

export function occupancyOn(date: string, rooms: Room[], reservations: Reservation[]): number {
  const active = rooms.filter((r) => r.status === "active").length || 1;
  const occupied = reservations.filter(
    (r) => r.status !== "cancelled" && r.checkIn <= date && r.checkOut > date,
  ).length;
  return Math.min(1, occupied / active);
}

export function reservationNights(r: Reservation): number {
  return nightsBetween(r.checkIn, r.checkOut);
}
