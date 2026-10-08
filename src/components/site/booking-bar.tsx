"use client";

import { clsx } from "clsx";
import { ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { addDays, todayISO } from "@/lib/engine";
import { inputClass } from "@/components/ui";

export function defaultDates() {
  const today = todayISO();
  const d = new Date();
  // next Friday → Sunday
  const daysToFriday = (5 - d.getDay() + 7) % 7 || 7;
  const checkIn = addDays(today, daysToFriday);
  return { checkIn, checkOut: addDays(checkIn, 2) };
}

export function BookingBar({ compact = false, roomSlug }: { compact?: boolean; roomSlug?: string }) {
  const router = useRouter();
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
    router.push(`/book?${params.toString()}`);
  };

  const onCheckIn = (v: string) => {
    setCheckIn(v);
    if (v >= checkOut) setCheckOut(addDays(v, 1));
  };

  const field = "flex min-w-0 flex-1 flex-col gap-1";
  const label = "text-[11px] font-semibold uppercase tracking-[0.14em] text-slate";
  const control = clsx(inputClass, compact ? "h-10 text-sm" : "h-12");

  return (
    <form
      onSubmit={submit}
      className={clsx(
        "grid gap-3 rounded-2xl bg-white p-3 shadow-lift ring-1 ring-ink/5 sm:grid-cols-2",
        compact ? "lg:grid-cols-[1fr_1fr_0.8fr_0.8fr_auto]" : "lg:grid-cols-[1.1fr_1.1fr_0.8fr_0.8fr_auto] lg:p-4",
      )}
      aria-label="Check availability"
    >
      <div className={field}>
        <span className={label}>Check-in</span>
        <input type="date" value={checkIn} min={today} onChange={(e) => onCheckIn(e.target.value)} className={control} required />
      </div>
      <div className={field}>
        <span className={label}>Check-out</span>
        <input type="date" value={checkOut} min={addDays(checkIn, 1)} onChange={(e) => setCheckOut(e.target.value)} className={control} required />
      </div>
      <div className={field}>
        <span className={label}>Adults</span>
        <select value={adults} onChange={(e) => setAdults(Number(e.target.value))} className={control}>
          {[1, 2, 3, 4].map((n) => (
            <option key={n} value={n}>{n}</option>
          ))}
        </select>
      </div>
      <div className={field}>
        <span className={label}>Children</span>
        <select value={children} onChange={(e) => setChildren(Number(e.target.value))} className={control}>
          {[0, 1, 2, 3].map((n) => (
            <option key={n} value={n}>{n}</option>
          ))}
        </select>
      </div>
      <button
        type="submit"
        className={clsx(
          "inline-flex items-center justify-center gap-2 self-end rounded-xl bg-lake px-5 font-semibold text-white transition hover:bg-lake-deep sm:col-span-2 lg:col-span-1",
          compact ? "h-10 text-sm" : "h-12",
        )}
      >
        Check availability <ArrowRight className="h-4 w-4" />
      </button>
    </form>
  );
}
