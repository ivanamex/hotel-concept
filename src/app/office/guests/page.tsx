"use client";

import { clsx } from "clsx";
import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import { ReservationDrawer } from "@/components/office/reservation-drawer";
import { OfficeShell } from "@/components/office/shell";
import { Drawer, Panel, SourceChip, StatusChip, td, th } from "@/components/office/ui";
import { inputClass } from "@/components/ui";
import { chf, fmtDate } from "@/lib/format";
import { useHotel } from "@/lib/store";
import type { Reservation } from "@/lib/types";

interface GuestRow { key: string; name: string; email: string; phone: string; country: string; stays: Reservation[]; spend: number; last: string; next: string | null }

export default function GuestsPage() {
  const reservations = useHotel((s) => s.reservations);
  const rooms = useHotel((s) => s.rooms);
  const [q, setQ] = useState("");
  const [open, setOpen] = useState<GuestRow | null>(null);
  const [res, setRes] = useState<string | null>(null);

  const guests = useMemo(() => {
    const map = new Map<string, GuestRow>();
    for (const r of reservations) {
      const key = r.guest.email.toLowerCase();
      const g = map.get(key) ?? { key, name: `${r.guest.firstName} ${r.guest.lastName}`, email: r.guest.email, phone: r.guest.phone, country: r.guest.country, stays: [], spend: 0, last: "", next: null };
      g.stays.push(r);
      if (r.status !== "cancelled") {
        g.spend += r.total;
        if (r.checkIn > g.last) g.last = r.checkIn;
      }
      map.set(key, g);
    }
    const needle = q.trim().toLowerCase();
    return [...map.values()]
      .filter((g) => !needle || `${g.name} ${g.email} ${g.country}`.toLowerCase().includes(needle))
      .sort((a, b) => (a.last < b.last ? 1 : -1));
  }, [reservations, q]);

  return (
    <OfficeShell title="Guests" subtitle={`${guests.length} guests on file`}>
      <div className="relative max-w-xs">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search guests" className={clsx(inputClass, "h-10 pl-9 text-sm")} />
      </div>
      <Panel className="mt-5">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px]">
            <thead className="bg-[#fafbfc]"><tr><th className={th}>Guest</th><th className={th}>Country</th><th className={th}>Stays</th><th className={th}>Last stay</th><th className={`${th} text-right`}>Total spend</th><th className={th}>Contact</th></tr></thead>
            <tbody className="divide-y divide-ink/5">
              {guests.map((g) => (
                <tr key={g.key} onClick={() => setOpen(g)} className="cursor-pointer hover:bg-[#fafbfc]">
                  <td className={`${td} font-semibold`}>{g.name}{g.stays.filter((s) => s.status !== "cancelled").length > 1 && <span className="ml-2 rounded-xs bg-moss-soft px-2 py-0.5 text-[10px] font-bold uppercase text-moss">Returning</span>}</td>
                  <td className={td}>{g.country}</td>
                  <td className={`${td} tabular-nums`}>{g.stays.length}</td>
                  <td className={td}>{g.last ? fmtDate(g.last, "medium") : "—"}</td>
                  <td className={`${td} text-right tabular-nums`}>{chf(g.spend)}</td>
                  <td className={`${td} text-slate`}>{g.email}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      {open && (
        <Drawer open onClose={() => setOpen(null)} title={<div><p className="text-xs uppercase tracking-[0.12em] text-slate">Guest</p><h2 className="font-display text-lg font-semibold">{open.name}</h2></div>}>
          <div className="rounded-lg bg-[#f5f6f8] p-4 text-sm">
            <p>{open.email}</p><p>{open.phone}</p><p>{open.country}</p>
            <p className="mt-2 text-xs text-slate">{open.stays.length} bookings · {chf(open.spend)} total</p>
          </div>
          <p className="mt-5 text-xs font-semibold uppercase tracking-[0.12em] text-slate">Stays</p>
          <ul className="mt-2 divide-y divide-ink/5">
            {open.stays.sort((a, b) => (a.checkIn < b.checkIn ? 1 : -1)).map((r) => (
              <li key={r.id}>
                <button type="button" onClick={() => setRes(r.id)} className="flex w-full items-center justify-between gap-3 py-3 text-left hover:bg-[#fafbfc]">
                  <div><p className="text-sm font-semibold">{rooms.find((x) => x.id === r.roomId)?.name}</p><p className="text-xs text-slate">{fmtDate(r.checkIn, "short")} → {fmtDate(r.checkOut, "medium")} · {r.ref}</p></div>
                  <div className="flex items-center gap-2"><SourceChip source={r.source} /><StatusChip status={r.status} /></div>
                </button>
              </li>
            ))}
          </ul>
        </Drawer>
      )}
      <ReservationDrawer id={res} onClose={() => setRes(null)} />
    </OfficeShell>
  );
}
