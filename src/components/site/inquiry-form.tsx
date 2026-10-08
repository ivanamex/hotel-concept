"use client";

import { Check } from "lucide-react";
import { useState } from "react";
import { Button, Field, Input, Select, Textarea } from "@/components/ui";
import { fmt } from "@/i18n";
import { useT } from "@/i18n/context";
import { useHotel } from "@/lib/store";
import type { InquiryType } from "@/lib/types";

export function InquiryForm({ type, compact = false, defaultSubject }: { type: InquiryType; compact?: boolean; defaultSubject?: string }) {
  const t = useT();
  const f = t.forms;
  const subjects = f.subjects[type];
  const addInquiry = useHotel((s) => s.addInquiry);
  const [form, setForm] = useState({ name: "", email: "", phone: "", subject: defaultSubject ?? subjects[0], dates: "", message: "" });
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState<Record<string, string>>({});

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setForm({ ...form, [k]: e.target.value });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};
    if (!form.name.trim()) errors.name = f.nameErr;
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) errors.email = t.common.validEmail;
    if (form.message.trim().length < 10) errors.message = f.messageErr;
    setErr(errors);
    if (Object.keys(errors).length) return;
    addInquiry({ type, name: form.name.trim(), email: form.email.trim(), phone: form.phone.trim() || undefined, subject: form.subject, message: form.message.trim(), dates: form.dates.trim() || undefined });
    setSent(true);
  };

  if (sent) {
    return (
      <div className="rounded-lg bg-moss-soft p-6 text-center">
        <span className="mx-auto flex h-10 w-10 items-center justify-center rounded-xs bg-moss text-white"><Check className="h-5 w-5" /></span>
        <p className="mt-3 font-display text-xl text-ink">{fmt(f.sentTitle, { name: form.name.split(" ")[0] })}</p>
        <p className="mt-1 text-sm text-slate">{fmt(f.sentText, { email: form.email })}</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate className="form-lines grid gap-5 sm:grid-cols-2">
      <Field label={f.name} error={err.name}><Input value={form.name} onChange={set("name")} autoComplete="name" /></Field>
      <Field label={f.email} error={err.email}><Input type="email" value={form.email} onChange={set("email")} autoComplete="email" /></Field>
      {!compact && <Field label={f.phone} hint={t.common.optional}><Input type="tel" value={form.phone} onChange={set("phone")} autoComplete="tel" /></Field>}
      <Field label={type === "contact" ? f.subject : f.about} className={compact ? "sm:col-span-2" : ""}>
        <Select value={form.subject} onChange={set("subject")}>{subjects.map((s) => <option key={s}>{s}</option>)}</Select>
      </Field>
      {type !== "contact" && <Field label={f.dates} hint={f.datesHint} className="sm:col-span-2"><Input value={form.dates} onChange={set("dates")} placeholder={f.datesPlaceholder} /></Field>}
      <Field label={f.message} error={err.message} className="sm:col-span-2"><Textarea value={form.message} onChange={set("message")} placeholder={f.placeholders[type]} /></Field>
      <div className="sm:col-span-2"><Button type="submit">{f.send}</Button></div>
    </form>
  );
}
