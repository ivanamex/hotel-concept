"use client";

import { clsx } from "clsx";
import { ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useHref, useT } from "@/i18n/context";
import { addDays, todayISO } from "@/lib/engine";

export function defaultDates() {
  const today = todayISO();
  const d = new Date();
  const daysToFriday = (5 - d.getDay() + 7) % 7 || 7;
  const checkIn = addDays(today, daysToFriday);
  return { checkIn, checkOut: addDays(checkIn, 2) };
}

export function BookingBar({ compact = false, roomSlug }: { compact?: boolean; roomSlug?: string }) {
  const router = useRouter();
  const href = useHref();
  const t = useT().bookingBar;
  const dd = defaultDates();
  const [checkIn, setCheckIn] = useState(dd.checkIn);
  const [checkOut, setCheckOut] = useState(dd.checkOut);
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const today = todayISO();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams({ in: checkIn, out: checkOut, adults: String(adults), children: String(children) });
    if (roomSlug) params.set("room", roomSlug);
    router.push(href(`/book?${params.toString()}`));
  };

  const onCheckIn = (v: string) => {
    setCheckIn(v);
    if (v >= checkOut) setCheckOut(addDays(v, 1));
  };

  const field = "flex min-w-0 flex-1 flex-col gap-1.5 border-b border-line px-4 py-3 sm:border-b-0 sm:border-r";
  const label = "caps !text-[9.5px] text-slate";
  const control = clsx("w-full bg-transparent font-display text-ink focus:outline-none", compact ? "text-base" : "text-lg sm:text-xl");

  return (
    <form
      onSubmit={submit}
      className="grid overflow-hidden rounded-xs bg-white shadow-lift ring-1 ring-ink/10 sm:grid-cols-2 lg:grid-cols-[1.1fr_1.1fr_0.7fr_0.7fr_auto]"
      aria-label={t.cta}
    >
      <div className={field}>
        <span className={label}>{t.checkIn}</span>
        <input type="date" value={checkIn} min={today} onChange={(e) => onCheckIn(e.target.value)} className={control} required />
      </div>
      <div className={field}>
        <span className={label}>{t.checkOut}</span>
        <input type="date" value={checkOut} min={addDays(checkIn, 1)} onChange={(e) => setCheckOut(e.target.value)} className={control} required />
      </div>
      <div className={field}>
        <span className={label}>{t.adults}</span>
        <select value={adults} onChange={(e) => setAdults(Number(e.target.value))} className={control}>
          {[1, 2, 3, 4].map((n) => <option key={n} value={n}>{n}</option>)}
        </select>
      </div>
      <div className={clsx(field, "sm:border-r-0 lg:border-r")}>
        <span className={label}>{t.children}</span>
        <select value={children} onChange={(e) => setChildren(Number(e.target.value))} className={control}>
          {[0, 1, 2, 3].map((n) => <option key={n} value={n}>{n}</option>)}
        </select>
      </div>
      <button type="submit" className="ticket sweep caps inline-flex items-center justify-center gap-3 bg-lake px-7 py-4 !text-[11px] text-white [--sweep:var(--color-lake-deep)] sm:col-span-2 lg:col-span-1 lg:py-0">
        {t.cta} <ArrowRight className="arrow h-3.5 w-3.5" />
      </button>
    </form>
  );
}
