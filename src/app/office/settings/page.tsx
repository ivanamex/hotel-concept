"use client";

import { useState } from "react";
import { OfficeShell } from "@/components/office/shell";
import { Panel, Toggle } from "@/components/office/ui";
import { Button, Field, Input } from "@/components/ui";
import { useHotel } from "@/lib/store";

export default function SettingsPage() {
  const settings = useHotel((s) => s.settings);
  const update = useHotel((s) => s.updateSettings);
  const reset = useHotel((s) => s.resetDemo);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState(settings);

  const save = () => { update(form); setSaved(true); setTimeout(() => setSaved(false), 2000); };
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [k]: e.target.value });

  return (
    <OfficeShell title="Settings" subtitle="Hotel profile, policies, channels">
      <div className="grid gap-6 xl:grid-cols-2">
        <Panel title="Hotel profile">
          <div className="grid gap-4 px-5 py-5 sm:grid-cols-2">
            <Field label="Name"><Input value={form.name} onChange={set("name")} /></Field>
            <Field label="Tagline"><Input value={form.tagline} onChange={set("tagline")} /></Field>
            <Field label="Address"><Input value={form.address} onChange={set("address")} /></Field>
            <Field label="City"><Input value={form.city} onChange={set("city")} /></Field>
            <Field label="Phone"><Input value={form.phone} onChange={set("phone")} /></Field>
            <Field label="Email"><Input value={form.email} onChange={set("email")} /></Field>
            <Field label="WhatsApp number (digits only)" hint="Used by the website button"><Input value={form.whatsapp} onChange={set("whatsapp")} /></Field>
            <Field label="Reception hours"><Input value={form.receptionHours} onChange={set("receptionHours")} /></Field>
            <Field label="Check-in from"><Input value={form.checkIn} onChange={set("checkIn")} /></Field>
            <Field label="Check-out until"><Input value={form.checkOut} onChange={set("checkOut")} /></Field>
          </div>
          <div className="flex items-center gap-3 border-t border-ink/5 px-5 py-4">
            <Button onClick={save}>Save</Button>
            {saved && <span className="text-sm text-moss">Saved.</span>}
          </div>
        </Panel>

        <div className="space-y-6">
          <Panel title="Languages">
            <div className="px-5 py-4">
              <div className="flex flex-wrap gap-2">
                {["English", "Français", "Deutsch", "Italiano"].map((l) => {
                  const on = form.languages.includes(l);
                  return <button key={l} type="button" onClick={() => setForm({ ...form, languages: on ? form.languages.filter((x) => x !== l) : [...form.languages, l] })} className={on ? "rounded-xs bg-lake px-3 py-1.5 text-xs font-semibold text-white" : "rounded-xs bg-white px-3 py-1.5 text-xs font-semibold text-ink-soft ring-1 ring-line"}>{l}</button>;
                })}
              </div>
              <p className="mt-3 text-xs text-slate">The website is live in all four; guests switch in the menu or the footer, and the first visit follows the browser language.</p>
            </div>
          </Panel>

          <Panel title="Channels">
            <ul className="divide-y divide-ink/5">
              {form.channels.map((c) => (
                <li key={c.name} className="flex items-center justify-between px-5 py-3">
                  <div><p className="text-sm font-semibold">{c.name}</p><p className="text-xs text-slate">{c.connected ? "Availability synced both ways" : "Not connected"}</p></div>
                  <Toggle on={c.connected} label={c.name} onChange={(v) => setForm({ ...form, channels: form.channels.map((x) => (x.name === c.name ? { ...x, connected: v } : x)) })} />
                </li>
              ))}
            </ul>
            <p className="px-5 py-3 text-xs text-slate">Connected through Channex: rates and availability out, bookings in, dates blocked both ways. The live link is wired up with the backend.</p>
          </Panel>

          <Panel title="Demo data">
            <div className="px-5 py-4">
              <p className="text-sm text-ink-soft">Everything in this office lives in this browser. Reset puts back the ten rooms, the sample reservations and the inbox.</p>
              <Button variant="danger" className="mt-3" onClick={() => { if (confirm("Reset all demo data?")) { reset(); setForm(useHotel.getState().settings); } }}>Reset demo data</Button>
            </div>
          </Panel>
        </div>
      </div>
    </OfficeShell>
  );
}
