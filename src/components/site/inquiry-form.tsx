"use client";

import { Check } from "lucide-react";
import { useState } from "react";
import { Button, Field, Input, Select, Textarea } from "@/components/ui";
import { useHotel } from "@/lib/store";
import type { InquiryType } from "@/lib/types";

const SUBJECTS: Record<InquiryType, string[]> = {
  contact: ["A question before booking", "An existing booking", "Breakfast & dietary needs", "Something else"],
  concierge: ["Restaurant table", "Tickets & museums", "Boat, bikes & tours", "Transport", "Something else"],
  group: ["Group of 5+ rooms", "Long stay (14+ nights)", "Wedding guests", "Company offsite", "Whole house"],
};

export function InquiryForm({ type, compact = false, defaultSubject }: { type: InquiryType; compact?: boolean; defaultSubject?: string }) {
  const addInquiry = useHotel((s) => s.addInquiry);
  const [form, setForm] = useState({ name: "", email: "", phone: "", subject: defaultSubject ?? SUBJECTS[type][0], dates: "", message: "" });
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState<Record<string, string>>({});

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setForm({ ...form, [k]: e.target.value });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};
    if (!form.name.trim()) errors.name = "Your name";
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) errors.email = "A valid email";
    if (form.message.trim().length < 10) errors.message = "A few words more";
    setErr(errors);
    if (Object.keys(errors).length) return;
    addInquiry({ type, name: form.name.trim(), email: form.email.trim(), phone: form.phone.trim() || undefined, subject: form.subject, message: form.message.trim(), dates: form.dates.trim() || undefined });
    setSent(true);
  };

  if (sent) {
    return (
      <div className="rounded-2xl bg-moss-soft p-6 text-center">
        <span className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-moss text-white"><Check className="h-5 w-5" /></span>
        <p className="mt-3 font-display text-xl font-semibold text-ink">Received — thank you, {form.name.split(" ")[0]}.</p>
        <p className="mt-1 text-sm text-slate">A person at reception reads this, usually within the hour during the day. We reply to {form.email}.</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate className="grid gap-4 sm:grid-cols-2">
      <Field label="Name" error={err.name}><Input value={form.name} onChange={set("name")} autoComplete="name" /></Field>
      <Field label="Email" error={err.email}><Input type="email" value={form.email} onChange={set("email")} autoComplete="email" /></Field>
      {!compact && <Field label="Phone" hint="Optional"><Input type="tel" value={form.phone} onChange={set("phone")} autoComplete="tel" /></Field>}
      <Field label={type === "contact" ? "Subject" : "What is it about?"} className={compact ? "sm:col-span-2" : ""}>
        <Select value={form.subject} onChange={set("subject")}>{SUBJECTS[type].map((s) => <option key={s}>{s}</option>)}</Select>
      </Field>
      {type !== "contact" && <Field label="Dates" hint="Approximate is fine" className="sm:col-span-2"><Input value={form.dates} onChange={set("dates")} placeholder="e.g. 12–14 November" /></Field>}
      <Field label="Message" error={err.message} className="sm:col-span-2"><Textarea value={form.message} onChange={set("message")} placeholder={type === "concierge" ? "Tell us what you'd like and when — we'll come back with options." : type === "group" ? "How many people, how many rooms, what's the occasion?" : "How can we help?"} /></Field>
      <div className="sm:col-span-2"><Button type="submit">Send</Button></div>
    </form>
  );
}
