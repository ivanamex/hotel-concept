"use client";

import { useState } from "react";
import { OfficeShell } from "@/components/office/shell";
import { Panel, PropertyChip } from "@/components/office/ui";
import { Button, Field, Input, Select } from "@/components/ui";
import { useHotel, useOfficeScope } from "@/lib/store";
import type { Property, Tax, TaxKind } from "@/lib/types";

const TAX_KINDS: Record<TaxKind, string> = { per_person_night: "fixed amount per person per night", per_night: "fixed amount per night", percent: "% of the room price" };
const PAY = ["Visa", "Mastercard", "Amex", "Twint", "OXXO", "SPEI", "PayPal", "Cash"];

export default function SettingsPage() {
  const settings = useHotel((s) => s.settings);
  const scope = useOfficeScope();
  const setProperty = useHotel((s) => s.setOfficeProperty);
  const update = useHotel((s) => s.updateSettings);
  // the property card follows the switcher in the rail; "All locations" shows the first one, and the select here changes the switcher too
  const editing = scope.property ?? scope.allProperties[0];
  const reset = useHotel((s) => s.resetDemo);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState(settings);

  const save = () => { update(form); setSaved(true); setTimeout(() => setSaved(false), 2000); };
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [k]: e.target.value });

  return (
    <OfficeShell title="Settings" subtitle="The brand, each property's own rules, the demo">
      <div className="grid gap-6 xl:grid-cols-2">
        <div className="space-y-6">
          <Panel title="Brand" action={<span className="text-xs text-slate">shared by every location</span>}>
            <div className="grid gap-4 px-5 py-5 sm:grid-cols-2">
              <Field label="Name"><Input value={form.name} onChange={set("name")} /></Field>
              <Field label="Tagline"><Input value={form.tagline} onChange={set("tagline")} /></Field>
              <Field label="Phone"><Input value={form.phone} onChange={set("phone")} /></Field>
              <Field label="Email"><Input value={form.email} onChange={set("email")} /></Field>
              <Field label="WhatsApp number (digits only)" hint="Used by the website button"><Input value={form.whatsapp} onChange={set("whatsapp")} /></Field>
              <Field label="Reception hours"><Input value={form.receptionHours} onChange={set("receptionHours")} /></Field>
              <Field label="Breakfast price" hint="per adult, children half"><Input type="number" value={form.breakfastPrice} onChange={(e) => setForm({ ...form, breakfastPrice: Number(e.target.value) })} /></Field>
            </div>
            <div className="px-5 pb-5">
              <p className="mb-2 text-sm font-medium text-ink">Website languages</p>
              <div className="flex flex-wrap gap-2">
                {["English", "Français", "Deutsch", "Italiano", "Español"].map((l) => {
                  const on = form.languages.includes(l);
                  return <button key={l} type="button" onClick={() => setForm({ ...form, languages: on ? form.languages.filter((x) => x !== l) : [...form.languages, l] })} className={on ? "rounded-xs bg-lake px-3 py-1.5 text-xs font-semibold text-white" : "rounded-xs bg-white px-3 py-1.5 text-xs font-semibold text-ink-soft ring-1 ring-line"}>{l}</button>;
                })}
              </div>
              <p className="mt-2 text-xs text-slate">The site is live in English, French, German and Italian; guests switch in the menu or the footer. Spanish is ready to be added for a Mexican property.</p>
            </div>
            <div className="flex items-center gap-3 border-t border-ink/5 px-5 py-4">
              <Button onClick={save}>Save</Button>
              {saved && <span className="text-sm text-moss">Saved.</span>}
            </div>
          </Panel>

          <Panel title="Users & roles">
            <ul className="divide-y divide-ink/5 text-sm">
              <li className="flex items-center justify-between px-5 py-3"><div><p className="font-semibold">manager@maisonvidy.ch</p><p className="text-xs text-slate">Owner · every property, every page</p></div><span className="rounded-xs bg-ink/5 px-2 py-0.5 text-xs">you</span></li>
              <li className="flex items-center justify-between px-5 py-3"><div><p className="font-semibold">Reception</p><p className="text-xs text-slate">Today, calendar, reservations, guests, inbox · no rates, no reports</p></div><span className="text-xs text-slate">role</span></li>
              <li className="flex items-center justify-between px-5 py-3"><div><p className="font-semibold">Housekeeping</p><p className="text-xs text-slate">Units and their cleaning state only · phone-sized</p></div><span className="text-xs text-slate">role</span></li>
              <li className="flex items-center justify-between px-5 py-3"><div><p className="font-semibold">Owner (read-only)</p><p className="text-xs text-slate">Reports and Today, nothing editable — for a second owner or an accountant</p></div><span className="text-xs text-slate">role</span></li>
            </ul>
            <p className="px-5 py-3 text-xs text-slate">Real sign-in and invitations arrive with the backend; the roles are the model.</p>
          </Panel>

          <Panel title="Demo data">
            <div className="px-5 py-4">
              <p className="text-sm text-ink-soft">Everything in this office lives in this browser. Reset puts back the two properties, the sample reservations and the inbox, dated to today.</p>
              <Button variant="danger" className="mt-3" onClick={() => { if (confirm("Reset all demo data?")) { reset(); setForm(useHotel.getState().settings); } }}>Reset demo data</Button>
            </div>
          </Panel>
        </div>

        <div className="space-y-6">
          <PropertyCard
            key={editing.id}
            property={editing}
            picker={
              scope.allProperties.length > 1 ? (
                <label className="flex items-center gap-2 text-xs text-slate">
                  Property
                  <Select value={editing.id} onChange={(e) => setProperty(e.target.value)} className="!h-8 !w-auto !text-sm">
                    {scope.allProperties.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </Select>
                </label>
              ) : undefined
            }
          />
          <Panel title="Add a property">
            <div className="px-5 py-4 text-sm text-ink-soft">
              <p>A third location gets its own card here: name, units and their vocabulary, currency, taxes, check-in times, payment methods, channels. Everything else — Today, calendar, reservations, reports — follows automatically.</p>
              <Button variant="secondary" className="mt-3" disabled>Add property</Button>
              <p className="mt-2 text-xs text-slate">Enabled with the backend.</p>
            </div>
          </Panel>
        </div>
      </div>
    </OfficeShell>
  );
}

function PropertyCard({ property, picker }: { property: Property; picker?: React.ReactNode }) {
  const update = useHotel((s) => s.updateProperty);
  const [f, setF] = useState(property);
  const [saved, setSaved] = useState(false);
  const set = (k: keyof Property) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setF({ ...f, [k]: e.target.value });
  const save = () => { update(property.id, f); setSaved(true); setTimeout(() => setSaved(false), 2000); };
  const setTax = (i: number, patch: Partial<Tax>) => setF({ ...f, taxes: f.taxes.map((t, idx) => (idx === i ? { ...t, ...patch } : t)) });

  return (
    <Panel title={property.name} action={<div className="flex items-center gap-3">{picker}<PropertyChip id={property.id} /></div>}>
      <div className="grid gap-4 px-5 py-5 sm:grid-cols-2">
        <Field label="Name"><Input value={f.name} onChange={set("name")} /></Field>
        <Field label="Kind" hint="shown under the name"><Input value={f.kind} onChange={set("kind")} /></Field>
        <Field label="Address"><Input value={f.address} onChange={set("address")} /></Field>
        <Field label="City"><Input value={f.city} onChange={set("city")} /></Field>
        <Field label="Unit, singular" hint="room · cabin · villa · apartment"><Input value={f.unitLabel.one} onChange={(e) => setF({ ...f, unitLabel: { ...f.unitLabel, one: e.target.value } })} /></Field>
        <Field label="Unit, plural"><Input value={f.unitLabel.many} onChange={(e) => setF({ ...f, unitLabel: { ...f.unitLabel, many: e.target.value } })} /></Field>
        <Field label="Currency"><Select value={f.currency} onChange={set("currency")}>{["CHF", "EUR", "MXN", "USD"].map((c) => <option key={c}>{c}</option>)}</Select></Field>
        <Field label="Reference prefix" hint="MV-2026-0001"><Input value={f.refPrefix} onChange={set("refPrefix")} /></Field>
        <Field label="Check-in from"><Input value={f.checkIn} onChange={set("checkIn")} /></Field>
        <Field label="Check-out until"><Input value={f.checkOut} onChange={set("checkOut")} /></Field>
      </div>

      <div className="border-t border-ink/5 px-5 py-4">
        <p className="mb-2 text-sm font-medium text-ink">Taxes</p>
        {f.taxes.map((t, i) => (
          <div key={t.id} className="grid gap-3 sm:grid-cols-[1fr_200px_120px]">
            <Field label="Name"><Input value={t.name} onChange={(e) => setTax(i, { name: e.target.value })} /></Field>
            <Field label="Rule"><Select value={t.kind} onChange={(e) => setTax(i, { kind: e.target.value as TaxKind })}>{(Object.keys(TAX_KINDS) as TaxKind[]).map((k) => <option key={k} value={k}>{TAX_KINDS[k]}</option>)}</Select></Field>
            <Field label={t.kind === "percent" ? "%" : f.currency}><Input type="number" step="0.1" value={t.amount} onChange={(e) => setTax(i, { amount: Number(e.target.value) })} /></Field>
          </div>
        ))}
        <p className="text-xs text-slate">Switzerland charges a fixed city tax per person-night; a Mexican state charges a percentage lodging tax on the room — same field, different rule. Invoice type (receipt · invoice · CFDI) follows the country when the backend lands.</p>
      </div>

      <div className="border-t border-ink/5 px-5 py-4">
        <p className="mb-2 text-sm font-medium text-ink">Payment methods shown to guests</p>
        <div className="flex flex-wrap gap-2">
          {PAY.map((m) => {
            const on = f.paymentMethods.includes(m);
            return <button key={m} type="button" onClick={() => setF({ ...f, paymentMethods: on ? f.paymentMethods.filter((x) => x !== m) : [...f.paymentMethods, m] })} className={on ? "rounded-xs bg-lake px-3 py-1.5 text-xs font-semibold text-white" : "rounded-xs bg-white px-3 py-1.5 text-xs font-semibold text-ink-soft ring-1 ring-line"}>{m}</button>;
          })}
        </div>
        <p className="mt-2 text-xs text-slate">Twint for Switzerland, OXXO and SPEI for Mexico — the booking engine shows what the property accepts.</p>
      </div>

      <div className="flex items-center gap-3 border-t border-ink/5 px-5 py-4">
        <Button onClick={save}>Save {property.short}</Button>
        {saved && <span className="text-sm text-moss">Saved.</span>}
        <span className="ml-auto text-xs text-slate">Channels are managed on their own page.</span>
      </div>
    </Panel>
  );
}
