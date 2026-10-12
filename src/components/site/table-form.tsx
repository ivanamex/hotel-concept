"use client";

import { Check } from "lucide-react";
import { useState } from "react";
import { Button, Field, Input, Select, Textarea } from "@/components/ui";
import { fmt, fmtDateL } from "@/i18n";
import { useT } from "@/i18n/context";
import { addDays, todayISO } from "@/lib/engine";
import { useHotel } from "@/lib/store";

const TIMES = ["12:00", "12:30", "13:00", "17:00", "17:30", "18:00", "18:30", "19:00", "19:30", "20:00", "20:30", "21:00"];

/** A table: date · time · people, who you are — the request lands in the office inbox as a concierge request. */
export function TableForm() {
  const t = useT();
  const c = t.dining.table;
  const addInquiry = useHotel((s) => s.addInquiry);
  const today = todayISO();
  const [date, setDate] = useState(addDays(today, 1));
  const [time, setTime] = useState("19:00");
  const [people, setPeople] = useState(2);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [note, setNote] = useState("");
  const [err, setErr] = useState<Record<string, string>>({});
  const [done, setDone] = useState(false);

  const submit = (ev: React.FormEvent) => {
    ev.preventDefault();
    const errors: Record<string, string> = {};
    if (!name.trim()) errors.name = t.forms.nameErr;
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) errors.email = t.common.validEmail;
    setErr(errors);
    if (Object.keys(errors).length) return;
    addInquiry({ type: "concierge", name: name.trim(), email: email.trim(), subject: c.subject, dates: `${fmtDateL(date, t, "weekday")} · ${time} · ${people}`, message: note.trim() || `${c.subject} — ${fmtDateL(date, t, "weekday")} ${time}, ${people}` });
    setDone(true);
  };

  if (done) {
    return (
      <div className="rounded-lg bg-white p-6 shadow-card ring-1 ring-ink/5">
        <span className="flex h-10 w-10 items-center justify-center rounded-xs bg-moss text-white"><Check className="h-5 w-5" /></span>
        <p className="mt-4 font-display text-2xl text-ink">{fmt(c.done, { name: name.trim().split(" ")[0] })}</p>
        <p className="mt-2 text-sm leading-relaxed text-slate">{fmt(c.doneText, { date: fmtDateL(date, t, "weekday"), time, n: people })}</p>
        <button type="button" onClick={() => { setDone(false); setNote(""); }} className="rule-link caps mt-6 inline-flex !text-[10px] text-ink">{c.another}</button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate className="form-lines rounded-lg bg-white p-6 shadow-card ring-1 ring-ink/5">
      <div className="grid grid-cols-3 gap-4">
        <Field label={c.date} className="col-span-3 sm:col-span-1"><Input type="date" value={date} min={today} onChange={(ev) => setDate(ev.target.value)} /></Field>
        <Field label={c.time}><Select value={time} onChange={(ev) => setTime(ev.target.value)}>{TIMES.map((x) => <option key={x}>{x}</option>)}</Select></Field>
        <Field label={c.people}><Select value={people} onChange={(ev) => setPeople(Number(ev.target.value))}>{Array.from({ length: 10 }, (_, i) => i + 1).map((n) => <option key={n} value={n}>{n}</option>)}</Select></Field>
      </div>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Field label={c.name} error={err.name}><Input value={name} onChange={(ev) => setName(ev.target.value)} autoComplete="name" /></Field>
        <Field label={c.email} error={err.email}><Input type="email" value={email} onChange={(ev) => setEmail(ev.target.value)} autoComplete="email" /></Field>
        <Field label={c.note} className="sm:col-span-2"><Textarea value={note} onChange={(ev) => setNote(ev.target.value)} placeholder={c.notePlaceholder} className="min-h-20" /></Field>
      </div>
      <Button type="submit" className="mt-5 w-full justify-center" arrow>{c.cta}</Button>
    </form>
  );
}
