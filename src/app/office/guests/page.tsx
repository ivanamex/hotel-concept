"use client";

import { clsx } from "clsx";
import { Search } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import { ReservationDrawer } from "@/components/office/reservation-drawer";
import { OfficeShell } from "@/components/office/shell";
import { Drawer, Panel, PropertyChip, SourceChip, StatusChip, td, th } from "@/components/office/ui";
import { Button, Input, inputClass } from "@/components/ui";
import { nightsBetween, todayISO } from "@/lib/engine";
import { INQUIRY_SOURCE_LABEL, fmtDate, fmtDateTime, money } from "@/lib/format";
import { useHotel, useOfficeScope } from "@/lib/store";
import type { Inquiry, Reservation } from "@/lib/types";

interface GuestRow { key: string; name: string; email: string; phone: string; country: string; stays: Reservation[]; requests: Inquiry[]; spend: number; nights: number; last: string; next: string | null; properties: string[] }

export default function GuestsPage() {
  return <Suspense fallback={null}><Guests /></Suspense>;
}

function Guests() {
  const scope = useOfficeScope();
  const params = useSearchParams();
  const guestNotes = useHotel((s) => s.guestNotes);
  const addNote = useHotel((s) => s.addGuestNote);
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<"all" | "returning" | "inhouse" | "upcoming">("all");
  const [open, setOpen] = useState<string | null>(null);
  const [res, setRes] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const today = todayISO();

  useEffect(() => {
    const qq = params.get("q");
    if (qq) { setQ(qq); setOpen(qq.toLowerCase()); }
  }, [params]);

  const guests = useMemo(() => {
    const map = new Map<string, GuestRow>();
    for (const r of scope.reservations) {
      const key = r.guest.email.toLowerCase();
      const g = map.get(key) ?? { key, name: `${r.guest.firstName} ${r.guest.lastName}`, email: r.guest.email, phone: r.guest.phone, country: r.guest.country, stays: [], requests: [], spend: 0, nights: 0, last: "", next: null, properties: [] };
      g.stays.push(r);
      if (!g.properties.includes(r.propertyId)) g.properties.push(r.propertyId);
      if (r.status !== "cancelled") {
        g.spend += r.total;
        g.nights += nightsBetween(r.checkIn, r.checkOut);
        if (r.checkIn <= today && r.checkIn > g.last) g.last = r.checkIn;
        if (r.checkIn > today && (!g.next || r.checkIn < g.next)) g.next = r.checkIn;
      }
      map.set(key, g);
    }
    for (const i of scope.inquiries) {
      const key = i.email.toLowerCase();
      const g = map.get(key);
      if (g) g.requests.push(i);
    }
    const needle = q.trim().toLowerCase();
    return [...map.values()]
      .filter((g) => !needle || `${g.name} ${g.email} ${g.country}`.toLowerCase().includes(needle))
      .filter((g) => {
        if (filter === "returning") return g.stays.filter((s) => s.status !== "cancelled").length > 1;
        if (filter === "inhouse") return g.stays.some((s) => s.status === "checked_in");
        if (filter === "upcoming") return !!g.next;
        return true;
      })
      .sort((a, b) => ((b.last || b.next || "") > (a.last || a.next || "") ? 1 : -1));
  }, [scope.reservations, scope.inquiries, q, filter, today]);

  const current = open ? guests.find((g) => g.key === open) ?? null : null;
  const curOf = (pid: string) => scope.allProperties.find((p) => p.id === pid)?.currency ?? "CHF";
  const oneCurrency = scope.allProperties.every((p) => p.currency === scope.allProperties[0].currency) ? scope.allProperties[0].currency : null;

  return (
    <OfficeShell title="Guests" subtitle={`${guests.length} guests on file · ${guests.filter((g) => g.stays.filter((s) => s.status !== "cancelled").length > 1).length} returning`}>
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[220px] flex-1 sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search guests" className={clsx(inputClass, "h-10 pl-9 text-sm")} />
        </div>
        <div className="flex gap-1 rounded-xs bg-white p-1 ring-1 ring-ink/5">
          {(["all", "inhouse", "upcoming", "returning"] as const).map((f) => (
            <button key={f} type="button" onClick={() => setFilter(f)} className={clsx("rounded-xs px-3 py-1.5 text-xs font-semibold transition", filter === f ? "bg-ink text-white" : "text-slate hover:text-ink")}>{{ all: "All", inhouse: "In house", upcoming: "Arriving", returning: "Returning" }[f]}</button>
          ))}
        </div>
      </div>
      <Panel className="mt-5">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px]">
            <thead className="bg-[#fafbfc]"><tr><th className={th}>Guest</th><th className={th}>Country</th><th className={th}>Stays · nights</th><th className={th}>Last · next</th><th className={`${th} text-right`}>Total spend</th><th className={th}>Notes</th><th className={th}>Contact</th></tr></thead>
            <tbody className="divide-y divide-ink/5">
              {guests.map((g) => {
                const notes = guestNotes[g.key]?.length ?? 0;
                return (
                  <tr key={g.key} onClick={() => setOpen(g.key)} className="cursor-pointer transition hover:bg-[#fafbfc]">
                    <td className={`${td} font-semibold`}>
                      {g.name}
                      {g.stays.filter((s) => s.status !== "cancelled").length > 1 && <span className="ml-2 rounded-xs bg-moss-soft px-2 py-0.5 text-[10px] font-bold uppercase text-moss">Returning</span>}
                      {scope.all && scope.allProperties.length > 1 && g.properties.map((p) => <PropertyChip key={p} id={p} size="xs" className="ml-1.5 align-middle" />)}
                    </td>
                    <td className={td}>{g.country}</td>
                    <td className={`${td} tabular-nums`}>{g.stays.length} · {g.nights}</td>
                    <td className={td}>{g.last ? fmtDate(g.last, "short") : "—"}{g.next ? <span className="text-lake"> · {fmtDate(g.next, "short")}</span> : ""}</td>
                    <td className={`${td} text-right tabular-nums`}>{oneCurrency ? money(g.spend, oneCurrency) : "—"}</td>
                    <td className={td}>{notes ? <span className="rounded-xs bg-[#fff3cd] px-2 py-0.5 text-[11px] font-semibold text-[#6b4500]">{notes}</span> : <span className="text-slate">—</span>}</td>
                    <td className={`${td} text-slate`}>{g.email}</td>
                  </tr>
                );
              })}
              {guests.length === 0 && <tr><td colSpan={7} className="px-5 py-10 text-center text-sm text-slate">No guests match.</td></tr>}
            </tbody>
          </table>
        </div>
      </Panel>

      {current && (
        <Drawer open onClose={() => setOpen(null)} title={<div><p className="text-xs uppercase tracking-[0.12em] text-slate">Guest</p><h2 className="font-display text-lg font-semibold">{current.name}</h2></div>}>
          <div className="rounded-lg bg-[#f5f6f8] p-4 text-sm">
            <p><a href={`mailto:${current.email}`} className="text-lake">{current.email}</a></p><p>{current.phone}</p><p>{current.country}</p>
            <p className="mt-2 text-xs text-slate">{current.stays.length} bookings · {current.nights} nights · {oneCurrency ? money(current.spend, oneCurrency) : ""}</p>
          </div>

          <div className="mt-5">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate">Notes</p>
            <ul className="mt-2 space-y-1.5">
              {(guestNotes[current.key] ?? []).map((n, i) => <li key={i} className="rounded-xs bg-[#fff9e8] px-3 py-2 text-sm text-ink-soft">{n.text}<span className="mt-0.5 block text-[11px] text-slate">{fmtDateTime(n.at)}</span></li>)}
              {!(guestNotes[current.key]?.length) && <li className="text-sm text-slate">Nothing noted yet — preferences, allergies, how they like their coffee.</li>}
            </ul>
            <form className="mt-2 flex gap-2" onSubmit={(e) => { e.preventDefault(); if (note.trim()) { addNote(current.email, note.trim()); setNote(""); } }}>
              <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Add a note…" className="!h-9 flex-1 text-sm" />
              <Button size="sm" type="submit" variant="secondary" disabled={!note.trim()}>Add</Button>
            </form>
          </div>

          <p className="mt-5 text-xs font-semibold uppercase tracking-[0.12em] text-slate">Stays</p>
          <ul className="mt-2 divide-y divide-ink/5">
            {[...current.stays].sort((a, b) => (a.checkIn < b.checkIn ? 1 : -1)).map((r) => (
              <li key={r.id}>
                <button type="button" onClick={() => setRes(r.id)} className="flex w-full items-center justify-between gap-3 py-3 text-left hover:bg-[#fafbfc]">
                  <div><p className="text-sm font-semibold">{scope.allRooms.find((x) => x.id === r.roomId)?.name}{scope.allProperties.length > 1 && <PropertyChip id={r.propertyId} size="xs" className="ml-2 align-middle" />}</p><p className="text-xs text-slate">{fmtDate(r.checkIn, "short")} → {fmtDate(r.checkOut, "medium")} · {r.ref} · {money(r.total, curOf(r.propertyId))}</p></div>
                  <div className="flex items-center gap-2"><SourceChip source={r.source} /><StatusChip status={r.status} /></div>
                </button>
              </li>
            ))}
          </ul>

          {current.requests.length > 0 && (
            <>
              <p className="mt-5 text-xs font-semibold uppercase tracking-[0.12em] text-slate">Requests</p>
              <ul className="mt-2 divide-y divide-ink/5">
                {current.requests.map((i) => (
                  <li key={i.id} className="py-2.5"><p className="text-sm font-semibold">{i.subject}</p><p className="text-xs text-slate">{INQUIRY_SOURCE_LABEL[i.source]} · {fmtDate(i.createdAt.slice(0, 10), "medium")} · {i.status}</p></li>
                ))}
              </ul>
            </>
          )}

          <p className="mt-5 text-xs font-semibold uppercase tracking-[0.12em] text-slate">Timeline</p>
          <ol className="mt-2 space-y-1.5 border-l border-ink/10 pl-3">
            {[...current.stays.flatMap((r) => r.timeline.map((t) => ({ ...t, text: `${t.text} · ${r.ref}` }))), ...current.requests.flatMap((i) => i.timeline.map((t) => ({ ...t, text: `${t.text} · request` })))]
              .sort((a, b) => (a.at < b.at ? 1 : -1))
              .slice(0, 14)
              .map((t, idx) => <li key={idx} className="text-xs text-ink-soft"><span className="text-slate">{fmtDateTime(t.at)}</span> — {t.text}</li>)}
          </ol>
        </Drawer>
      )}
      <ReservationDrawer id={res} onClose={() => setRes(null)} />
    </OfficeShell>
  );
}
