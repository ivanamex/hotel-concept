"use client";

import { clsx } from "clsx";
import { ArrowRight, Check, Info } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { defaultDates } from "@/components/site/booking-bar";
import { inputClass } from "@/components/ui";
import { addDays, isRoomAvailable, nightsBetween, quote, roomFits, todayISO } from "@/lib/engine";
import { chf, plural } from "@/lib/format";
import { useHotel, useHydrated } from "@/lib/store";
import type { Room } from "@/lib/types";

export function RoomPriceCard({ room: staticRoom }: { room: Room }) {
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
    <div className="rounded-2xl bg-white p-5 shadow-lift ring-1 ring-ink/5 sm:p-6">
      <div className="flex items-baseline justify-between">
        <p className="text-sm text-slate">From</p>
        <p className="font-display text-2xl font-semibold text-ink">
          {chf(room.basePrice * 0.85)} <span className="text-sm font-normal text-slate">/ night</span>
        </p>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <label className="text-xs font-semibold uppercase tracking-[0.12em] text-slate">
          Check-in
          <input type="date" value={checkIn} min={today} onChange={(e) => { setCheckIn(e.target.value); if (e.target.value >= checkOut) setCheckOut(addDays(e.target.value, 1)); }} className={clsx(inputClass, "mt-1 h-10 text-sm font-normal normal-case tracking-normal")} />
        </label>
        <label className="text-xs font-semibold uppercase tracking-[0.12em] text-slate">
          Check-out
          <input type="date" value={checkOut} min={addDays(checkIn, 1)} onChange={(e) => setCheckOut(e.target.value)} className={clsx(inputClass, "mt-1 h-10 text-sm font-normal normal-case tracking-normal")} />
        </label>
        <label className="text-xs font-semibold uppercase tracking-[0.12em] text-slate">
          Adults
          <select value={adults} onChange={(e) => setAdults(Number(e.target.value))} className={clsx(inputClass, "mt-1 h-10 text-sm font-normal normal-case tracking-normal")}>
            {Array.from({ length: room.maxAdults }, (_, i) => i + 1).map((n) => <option key={n} value={n}>{n}</option>)}
          </select>
        </label>
        <label className="text-xs font-semibold uppercase tracking-[0.12em] text-slate">
          Children
          <select value={children} onChange={(e) => setChildren(Number(e.target.value))} className={clsx(inputClass, "mt-1 h-10 text-sm font-normal normal-case tracking-normal")}>
            {Array.from({ length: Math.max(0, room.maxGuests - 1) + 1 }, (_, i) => i).map((n) => <option key={n} value={n}>{n}</option>)}
          </select>
        </label>
      </div>

      <div className="mt-5 space-y-2">
        {!hydrated ? (
          <div className="h-24 animate-pulse rounded-xl bg-sand" />
        ) : !fits ? (
          <p className="flex items-start gap-2 rounded-xl bg-clay-soft p-3 text-sm text-clay"><Info className="mt-0.5 h-4 w-4 shrink-0" /> This room takes up to {room.maxGuests} guests ({room.maxAdults} adults). Try the Family room or the Duplex Suite.</p>
        ) : !available ? (
          <p className="flex items-start gap-2 rounded-xl bg-sand p-3 text-sm text-ink-soft"><Info className="mt-0.5 h-4 w-4 shrink-0 text-slate" /> Not available for these dates. Try other dates, or see which rooms are free.</p>
        ) : (
          quotes.map(({ plan, q }) => (
            <div key={plan.id} className="flex items-center justify-between rounded-xl border border-line px-3.5 py-2.5">
              <div>
                <p className="text-sm font-semibold text-ink">{plan.short}</p>
                <p className="text-xs text-slate">{plan.cancellation.replace("Free cancellation until", "Free until").replace(" before arrival", "")}</p>
              </div>
              <p className="text-right text-sm">
                <span className="font-semibold text-ink">{chf(q.roomTotal + q.breakfastTotal)}</span>
                <span className="block text-xs text-slate">{plural(q.nights, "night")}</span>
              </p>
            </div>
          ))
        )}
      </div>

      {hydrated && available && fits ? (
        <Link href={`/book?${params.toString()}`} className="mt-5 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-lake font-semibold text-white transition hover:bg-lake-deep">
          Book this room <ArrowRight className="h-4 w-4" />
        </Link>
      ) : (
        <Link href={`/book?in=${checkIn}&out=${checkOut}&adults=${adults}&children=${children}`} className="mt-5 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-ink font-semibold text-white transition hover:bg-lake">
          See available rooms <ArrowRight className="h-4 w-4" />
        </Link>
      )}
      <ul className="mt-4 space-y-1.5 text-xs text-slate">
        <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-moss" /> Best rate when you book here</li>
        <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-moss" /> City tax CHF {settings.cityTax.toFixed(2)} per adult per night, shown before you pay</li>
        <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-moss" /> Nothing charged today on flexible rates</li>
      </ul>
    </div>
  );
}
