"use client";

import { clsx } from "clsx";
import { AlertTriangle, ArrowDownToLine, ArrowUpFromLine, CheckCircle2, RefreshCw } from "lucide-react";
import { useMemo, useState } from "react";
import { OfficeShell } from "@/components/office/shell";
import { Panel, SourceChip, Toggle } from "@/components/office/ui";
import { Button } from "@/components/ui";
import { addDays, todayISO } from "@/lib/engine";
import { fmtDateTime, money, plural } from "@/lib/format";
import { useHotel, useOfficeScope } from "@/lib/store";
import type { Channel, Property } from "@/lib/types";

/** Which reservation source a channel brings in. */
const SOURCE_OF: Record<string, string> = { direct: "direct", booking: "booking.com", expedia: "expedia", airbnb: "airbnb", google: "direct" };
const COMMISSION: Record<string, number> = { direct: 0, booking: 0.15, expedia: 0.18, airbnb: 0.03, google: 0 };

export default function ChannelsPage() {
  const scope = useOfficeScope();
  const updateProperty = useHotel((s) => s.updateProperty);
  const today = todayISO();
  const since = addDays(today, -30);
  const [syncing, setSyncing] = useState<string | null>(null);

  const stats = useMemo(() => {
    const out: Record<string, Record<string, { count: number; value: number }>> = {};
    for (const p of scope.properties) {
      out[p.id] = {};
      for (const c of p.channels) {
        const src = SOURCE_OF[c.id];
        const rs = scope.reservations.filter((r) => r.propertyId === p.id && r.status !== "cancelled" && r.createdAt.slice(0, 10) >= since && (c.id === "google" ? false : r.source === src));
        out[p.id][c.id] = { count: rs.length, value: rs.reduce((s, r) => s + r.total, 0) };
      }
    }
    return out;
  }, [scope.properties, scope.reservations, since]);

  const sync = (p: Property, c: Channel) => {
    setSyncing(`${p.id}-${c.id}`);
    setTimeout(() => {
      updateProperty(p.id, { channels: p.channels.map((x) => (x.id === c.id ? { ...x, lastSync: new Date().toISOString().slice(0, 19), error: undefined } : x)) });
      setSyncing(null);
    }, 900);
  };
  const toggle = (p: Property, c: Channel, on: boolean) => {
    updateProperty(p.id, { channels: p.channels.map((x) => (x.id === c.id ? { ...x, connected: on, lastSync: on ? new Date().toISOString().slice(0, 19) : undefined, error: undefined } : x)) });
  };

  const totalErrors = scope.properties.reduce((n, p) => n + p.channels.filter((c) => c.connected && c.error).length, 0);

  return (
    <OfficeShell title="Channels" subtitle={`Booking engine and OTA connections · ${totalErrors ? `${totalErrors} needing a look` : "all in sync"}`}>
      <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          {scope.properties.map((p) => (
            <Panel key={p.id} title={scope.all && scope.allProperties.length > 1 ? p.name : "Connections"} action={<span className="text-xs text-slate">{p.channels.filter((c) => c.connected).length} of {p.channels.length} live</span>}>
              <ul className="divide-y divide-ink/5">
                {p.channels.map((c) => {
                  const st = stats[p.id][c.id];
                  const key = `${p.id}-${c.id}`;
                  return (
                    <li key={c.id} className="grid gap-3 px-5 py-4 sm:grid-cols-[1fr_auto] sm:items-center">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={clsx("h-2.5 w-2.5 rounded-full", !c.connected ? "bg-line-strong" : c.error ? "bg-clay" : "bg-moss")} />
                          <p className="text-sm font-semibold text-ink">{c.name}</p>
                          {c.id !== "direct" && c.id !== "google" && <SourceChip source={SOURCE_OF[c.id]} />}
                          {c.id === "direct" && <span className="rounded-xs bg-moss-soft px-2 py-0.5 text-[11px] font-semibold text-moss">no commission</span>}
                          {c.connected && c.note && c.id !== "direct" && <span className="text-xs text-slate">{c.note}</span>}
                        </div>
                        <p className="mt-1 text-xs text-slate">
                          {!c.connected ? (c.id === "google" ? "Free listing of your direct rates on Google — connects through the channel manager." : "Not connected.") : c.error ? <span className="inline-flex items-center gap-1 font-semibold text-clay"><AlertTriangle className="h-3.5 w-3.5" /> {c.error}</span> : c.lastSync === "live" ? "Live — bookings land here the second they are made." : <span className="inline-flex items-center gap-1"><CheckCircle2 className="h-3.5 w-3.5 text-moss" /> Synced {fmtDateTime(c.lastSync!)} · rates and availability pushed · dates blocked both ways</span>}
                        </p>
                        {c.connected && c.id !== "google" && (
                          <p className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate">
                            <span className="inline-flex items-center gap-1"><ArrowDownToLine className="h-3 w-3" /> {plural(st.count, "booking")} in 30 days · {money(st.value, p.currency)}</span>
                            {COMMISSION[c.id] > 0 && <span className="inline-flex items-center gap-1 text-clay"><ArrowUpFromLine className="h-3 w-3" /> ≈ {money(st.value * COMMISSION[c.id], p.currency)} commission</span>}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-3 sm:justify-end">
                        {c.connected && c.lastSync !== "live" && (
                          <Button size="sm" variant="secondary" onClick={() => sync(p, c)} disabled={syncing === key}><RefreshCw className={clsx("mr-1.5 h-3.5 w-3.5", syncing === key && "animate-spin")} /> {c.error ? "Retry sync" : "Sync now"}</Button>
                        )}
                        {c.id !== "direct" && <Toggle on={c.connected} label={`${c.name} connected`} onChange={(v) => toggle(p, c, v)} />}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </Panel>
          ))}
        </div>

        <div className="space-y-6">
          <Panel title="How it is wired">
            <div className="space-y-3 px-5 py-4 text-sm text-ink-soft">
              <p><span className="font-semibold text-ink">Direct</span> — the website's booking engine writes straight into this office. No middleman, no commission; the best rate lives here.</p>
              <p><span className="font-semibold text-ink">OTAs</span> — Booking.com, Expedia and Airbnb only open their systems to certified connectivity partners, so the connection runs through a channel manager: it pushes rates and availability out and brings their bookings in, and a night sold anywhere is blocked everywhere within a minute.</p>
              <p><span className="font-semibold text-ink">Per location</span> — each property is its own listing on every OTA, with its own rates and calendar; this page shows them side by side.</p>
              <p className="text-xs text-slate">The live link to the channel manager is wired up with the backend step.</p>
            </div>
          </Panel>
          <Panel title="Last 30 days">
            <ul className="divide-y divide-ink/5">
              {scope.properties.map((p) => {
                const all = scope.reservations.filter((r) => r.propertyId === p.id && r.status !== "cancelled" && r.createdAt.slice(0, 10) >= since);
                const direct = all.filter((r) => r.source === "direct" || r.source === "phone" || r.source === "walk-in" || r.source === "email");
                const share = all.length ? direct.length / all.length : 0;
                return (
                  <li key={p.id} className="px-5 py-3">
                    {scope.properties.length > 1 && <p className="text-xs font-semibold text-ink">{p.name}</p>}
                    <div className="mt-1 h-2 overflow-hidden rounded-xs bg-ink/5"><div className="h-full bg-moss" style={{ width: `${share * 100}%` }} /></div>
                    <p className="mt-1.5 text-xs text-slate"><span className="font-semibold text-moss">{Math.round(share * 100)} % direct</span> · {plural(all.length, "booking")} · commission saved ≈ {money(direct.reduce((s, r) => s + r.total, 0) * 0.15, p.currency)}</p>
                  </li>
                );
              })}
            </ul>
          </Panel>
        </div>
      </div>
    </OfficeShell>
  );
}
