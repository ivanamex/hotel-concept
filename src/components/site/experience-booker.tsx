"use client";

import { Check, Minus, Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { Button, Field, Input, Select, Textarea } from "@/components/ui";
import { fmt, fmtDateL } from "@/i18n";
import { useT } from "@/i18n/context";
import { addDays, todayISO } from "@/lib/engine";
import { chf } from "@/lib/format";
import { experienceTotal, nextRun, runsOn, type ExperienceProduct } from "@/lib/experiences";
import { useHotel } from "@/lib/store";
import { Link } from "./link";

/** The sticky card: date, start, people, who you are — Reserve. Open to anyone, a stay is optional. */
export function ExperienceBooker({ e }: { e: ExperienceProduct }) {
  const t = useT();
  const b = t.experiences.book;
  const book = useHotel((s) => s.bookExperience);
  const bookings = useHotel((s) => s.experienceBookings);
  const today = todayISO();
  const first = nextRun(e, addDays(today, 1));

  const [date, setDate] = useState(first);
  const [time, setTime] = useState(e.times[0]);
  const [people, setPeople] = useState(Math.max(e.minPeople, e.priceUnit === "group" ? 2 : 2));
  const [g, setG] = useState({ name: "", email: "", phone: "", notes: "" });
  const [staying, setStaying] = useState(false);
  const [stayRef, setStayRef] = useState("");
  const [err, setErr] = useState<Record<string, string>>({});
  const [done, setDone] = useState<{ ref: string } | null>(null);

  const runs = runsOn(e, date);
  const next = runs ? date : nextRun(e, date);
  const taken = useMemo(() => bookings.filter((x) => x.experienceId === e.slug && x.date === date && x.time === time && x.status !== "cancelled").reduce((n, x) => n + x.people, 0), [bookings, e.slug, date, time]);
  const left = Math.max(0, e.maxPeople - taken);
  const full = left < Math.max(1, e.minPeople) || left < people;
  const total = experienceTotal(e, people);

  const submit = (ev: React.FormEvent) => {
    ev.preventDefault();
    const errors: Record<string, string> = {};
    if (!g.name.trim()) errors.name = t.forms.nameErr;
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(g.email)) errors.email = t.common.validEmail;
    if (!runs) errors.date = fmt(b.noDay, { d: fmtDateL(next, t, "weekday") });
    if (full) errors.people = b.soldOut;
    setErr(errors);
    if (Object.keys(errors).length) return;
    const [firstName, ...rest] = g.name.trim().split(" ");
    const res = book({
      experienceId: e.slug, propertyId: e.propertyId, date, time, people,
      guest: { firstName, lastName: rest.join(" ") || "—", email: g.email.trim(), phone: g.phone.trim(), country: "" },
      notes: g.notes.trim() || undefined, stayRef: staying && stayRef.trim() ? stayRef.trim().toUpperCase() : undefined, total,
    }, e.maxPeople);
    if (!res.ok) return setErr({ people: b.soldOut });
    setDone({ ref: res.booking.ref });
  };

  if (done) {
    return (
      <div className="rounded-lg bg-white p-6 shadow-card ring-1 ring-ink/5">
        <span className="flex h-10 w-10 items-center justify-center rounded-xs bg-moss text-white"><Check className="h-5 w-5" /></span>
        <p className="mt-4 font-display text-2xl text-ink">{fmt(b.done, { ref: done.ref })}</p>
        <p className="mt-2 text-sm leading-relaxed text-slate">{fmt(b.doneText, { email: g.email })}</p>
        <dl className="mt-5 grid grid-cols-2 gap-3 border-t border-line pt-4 text-sm">
          <div><dt className="caps !text-[10px] text-slate">{b.date}</dt><dd className="mt-1 text-ink">{fmtDateL(date, t, "weekday")} · {time}</dd></div>
          <div><dt className="caps !text-[10px] text-slate">{b.people}</dt><dd className="mt-1 text-ink">{people}</dd></div>
          <div><dt className="caps !text-[10px] text-slate">{b.total}</dt><dd className="mt-1 text-ink">{chf(total)}</dd></div>
          <div><dt className="caps !text-[10px] text-slate">{b.facts.meeting}</dt><dd className="mt-1 text-ink">{t.experiences.catalog[e.slug]?.meeting}</dd></div>
        </dl>
        <Link href="/experiences" className="rule-link caps mt-6 inline-flex !text-[10px] text-ink">{b.another}</Link>
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate className="form-lines rounded-lg bg-white p-6 shadow-card ring-1 ring-ink/5">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="font-display text-2xl text-ink">{b.reserveTitle}</h2>
        <p className="text-right"><span className="font-display text-2xl text-ink">{chf(e.price)}</span><span className="caps ml-1.5 !text-[10px] text-slate">{e.priceUnit === "person" ? b.perPerson : b.perGroup}</span></p>
      </div>
      <p className="mt-1 text-xs text-slate">{b.open}</p>

      <div className="mt-5 grid grid-cols-2 gap-4">
        <Field label={b.date} error={err.date} className="col-span-2 sm:col-span-1">
          <Input type="date" value={date} min={addDays(today, 1)} onChange={(ev) => { setDate(ev.target.value); setErr({}); }} />
          {!runs && <p className="mt-1 text-xs text-clay">{fmt(b.noDay, { d: fmtDateL(next, t, "weekday") })} <button type="button" className="underline" onClick={() => setDate(next)}>→</button></p>}
        </Field>
        <Field label={b.time} className="col-span-2 sm:col-span-1">
          {e.times.length > 1 ? (
            <Select value={time} onChange={(ev) => setTime(ev.target.value)}>{e.times.map((x) => <option key={x}>{x}</option>)}</Select>
          ) : (
            <Input value={time} readOnly />
          )}
        </Field>
        <Field label={b.people} error={err.people} hint={e.priceUnit === "group" ? fmt(b.groupPrice, { n: e.maxPeople }) : e.minPeople > 1 ? fmt(b.min, { n: e.minPeople }) : undefined} className="col-span-2">
          <div className="flex items-center gap-3">
            <button type="button" onClick={() => setPeople((p) => Math.max(e.minPeople, p - 1))} disabled={people <= e.minPeople} className="rise flex h-10 w-10 items-center justify-center rounded-xs ring-1 ring-ink/15 hover:bg-ink hover:text-white disabled:opacity-30" aria-label="−"><Minus className="h-4 w-4" /></button>
            <span className="w-10 text-center font-display text-2xl tabular-nums text-ink">{people}</span>
            <button type="button" onClick={() => setPeople((p) => Math.min(e.maxPeople, p + 1))} disabled={people >= e.maxPeople} className="rise flex h-10 w-10 items-center justify-center rounded-xs ring-1 ring-ink/15 hover:bg-ink hover:text-white disabled:opacity-30" aria-label="+"><Plus className="h-4 w-4" /></button>
            <span className="ml-auto text-right"><span className="caps block !text-[10px] text-slate">{b.total}</span><span className="font-display text-2xl text-ink">{chf(total)}</span></span>
          </div>
        </Field>
      </div>

      <div className="mt-5 grid gap-4 border-t border-line pt-5 sm:grid-cols-2">
        <Field label={b.name} error={err.name} className="sm:col-span-2"><Input value={g.name} onChange={(ev) => setG({ ...g, name: ev.target.value })} autoComplete="name" /></Field>
        <Field label={b.email} error={err.email}><Input type="email" value={g.email} onChange={(ev) => setG({ ...g, email: ev.target.value })} autoComplete="email" /></Field>
        <Field label={b.phone} hint={t.common.optional}><Input type="tel" value={g.phone} onChange={(ev) => setG({ ...g, phone: ev.target.value })} autoComplete="tel" /></Field>
        <label className="flex items-center gap-3 text-sm text-ink sm:col-span-2">
          <input type="checkbox" checked={staying} onChange={(ev) => setStaying(ev.target.checked)} className="h-4 w-4 accent-[var(--color-lake)]" /> {b.staying}
        </label>
        {staying && <Field label={b.stayRef} className="sm:col-span-2"><Input value={stayRef} onChange={(ev) => setStayRef(ev.target.value)} placeholder="MV-2026-0000" /></Field>}
        <Field label={b.notes} className="sm:col-span-2"><Textarea value={g.notes} onChange={(ev) => setG({ ...g, notes: ev.target.value })} placeholder={b.notesPlaceholder} className="min-h-20" /></Field>
      </div>

      <Button type="submit" className="mt-5 w-full justify-center" arrow>{b.reserve}</Button>
      <p className="mt-3 text-xs leading-relaxed text-slate">{b.cancellation}</p>
    </form>
  );
}
