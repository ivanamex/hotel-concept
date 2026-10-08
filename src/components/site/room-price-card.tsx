"use client";

import { clsx } from "clsx";
import { ArrowRight, Check, Info } from "lucide-react";
import { useMemo, useState } from "react";
import { defaultDates } from "@/components/site/booking-bar";
import { Link } from "@/components/site/link";
import { inputClass } from "@/components/ui";
import { fmt, localizeRatePlan, nightsLabel } from "@/i18n";
import { useT } from "@/i18n/context";
import { addDays, isRoomAvailable, nightsBetween, quote, roomFits, todayISO } from "@/lib/engine";
import { chf } from "@/lib/format";
import { useHotel, useHydrated } from "@/lib/store";
import type { Room } from "@/lib/types";

export function RoomPriceCard({ room: staticRoom }: { room: Room }) {
  const t = useT();
  const p = t.rooms.price;
  const hydrated = useHydrated();
  const dd = defaultDates();
  const [checkIn, setCheckIn] = useState(dd.checkIn);
  const [checkOut, setCheckOut] = useState(dd.checkOut);
  const [adults, setAdults] = useState(Math.min(2, staticRoom.maxAdults));
  const [children, setChildren] = useState(0);

  const room = useHotel((s) => s.rooms.find((r) => r.id === staticRoom.id)) ?? staticRoom;
  const reservations = useHotel((s) => s.reservations);
  const ratePlans = useHotel((s) => s.ratePlans);
  const seasons = useHotel((s) => s.seasons);
  const settings = useHotel((s) => s.settings);

  const nights = Math.max(0, nightsBetween(checkIn, checkOut));
  const available = hydrated && nights > 0 && isRoomAvailable(room, checkIn, checkOut, reservations);
  const fits = roomFits(room, adults, children);

  const quotes = useMemo(
    () =>
      nights > 0
        ? ratePlans.map((plan) => ({
            plan,
            q: quote({ room, checkIn, checkOut, adults, children, plan, extras: [], seasons, breakfastPrice: settings.breakfastPrice, cityTaxPerPersonNight: settings.cityTax }),
          }))
        : [],
    [room, checkIn, checkOut, adults, children, ratePlans, seasons, settings, nights],
  );

  const params = new URLSearchParams({ in: checkIn, out: checkOut, adults: String(adults), children: String(children), room: room.slug });
  const today = todayISO();

  return (
    <div className="rounded-lg bg-white p-5 shadow-lift ring-1 ring-ink/5 sm:p-6">
      <div className="flex items-baseline justify-between">
        <p className="text-sm text-slate">{p.from}</p>
        <p className="font-display text-2xl text-ink">
          {chf(room.basePrice * 0.85)} <span className="text-sm font-normal text-slate">{t.common.perNight}</span>
        </p>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <label className="caps !text-[10px] text-slate">
          {p.checkIn}
          <input type="date" value={checkIn} min={today} onChange={(e) => { setCheckIn(e.target.value); if (e.target.value >= checkOut) setCheckOut(addDays(e.target.value, 1)); }} className={clsx(inputClass, "mt-1 h-10 font-sans text-sm font-normal normal-case tracking-normal")} />
        </label>
        <label className="caps !text-[10px] text-slate">
          {p.checkOut}
          <input type="date" value={checkOut} min={addDays(checkIn, 1)} onChange={(e) => setCheckOut(e.target.value)} className={clsx(inputClass, "mt-1 h-10 font-sans text-sm font-normal normal-case tracking-normal")} />
        </label>
        <label className="caps !text-[10px] text-slate">
          {p.adults}
          <select value={adults} onChange={(e) => setAdults(Number(e.target.value))} className={clsx(inputClass, "mt-1 h-10 font-sans text-sm font-normal normal-case tracking-normal")}>
            {Array.from({ length: room.maxAdults }, (_, i) => i + 1).map((n) => <option key={n} value={n}>{n}</option>)}
          </select>
        </label>
        <label className="caps !text-[10px] text-slate">
          {p.children}
          <select value={children} onChange={(e) => setChildren(Number(e.target.value))} className={clsx(inputClass, "mt-1 h-10 font-sans text-sm font-normal normal-case tracking-normal")}>
            {Array.from({ length: Math.max(0, room.maxGuests - 1) + 1 }, (_, i) => i).map((n) => <option key={n} value={n}>{n}</option>)}
          </select>
        </label>
      </div>

      <div className="mt-5 space-y-2">
        {!hydrated ? (
          <div className="h-24 animate-pulse rounded-md bg-sand" />
        ) : !fits ? (
          <p className="flex items-start gap-2 rounded-md bg-clay-soft p-3 text-sm text-clay"><Info className="mt-0.5 h-4 w-4 shrink-0" /> {fmt(p.tooMany, { max: room.maxGuests, adults: room.maxAdults })}</p>
        ) : !available ? (
          <p className="flex items-start gap-2 rounded-md bg-sand p-3 text-sm text-ink-soft"><Info className="mt-0.5 h-4 w-4 shrink-0 text-slate" /> {p.notAvailable}</p>
        ) : (
          quotes.map(({ plan: base, q }) => {
            const plan = localizeRatePlan(base, t);
            return (
            <div key={plan.id} className="rise flex items-center justify-between rounded-md border border-line px-3.5 py-2.5 hover:border-ink/30 hover:bg-white">
              <div>
                <p className="text-sm font-medium text-ink">{plan.short}</p>
                <p className="text-xs text-slate">{plan.id === "non_refundable" ? p.nonRefundable : p.freeUntil}</p>
              </div>
              <p className="text-right text-sm">
                <span className="font-semibold text-ink">{chf(q.roomTotal + q.breakfastTotal)}</span>
                <span className="block text-xs text-slate">{nightsLabel(q.nights, t)}</span>
              </p>
            </div>
            );
          })
        )}
      </div>

      {hydrated && available && fits ? (
        <Link href={`/book?${params.toString()}`} className="ticket sweep caps mt-5 inline-flex h-12 w-full items-center justify-center gap-3 rounded-xs bg-lake !text-[11px] text-white [--sweep:var(--color-lake-deep)]">
          {p.bookThis} <ArrowRight className="arrow h-3.5 w-3.5" />
        </Link>
      ) : (
        <Link href={`/book?in=${checkIn}&out=${checkOut}&adults=${adults}&children=${children}`} className="ticket sweep caps mt-5 inline-flex h-12 w-full items-center justify-center gap-3 rounded-xs bg-ink !text-[11px] text-white [--sweep:var(--color-lake)]">
          {p.seeAvailable} <ArrowRight className="arrow h-3.5 w-3.5" />
        </Link>
      )}
      <ul className="mt-4 space-y-1.5 text-xs text-slate">
        <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-moss" /> {p.bestRate}</li>
        <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-moss" /> {fmt(p.cityTax, { t: settings.cityTax.toFixed(2) })}</li>
        <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-moss" /> {p.nothingCharged}</li>
      </ul>
    </div>
  );
}
