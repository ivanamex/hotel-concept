"use client";

import { clsx } from "clsx";
import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import { ReservationDrawer } from "@/components/office/reservation-drawer";
import { OfficeShell } from "@/components/office/shell";
import { EmptyState, Panel, SourceChip, StatusChip, td, th } from "@/components/office/ui";
import { inputClass } from "@/components/ui";
import { nightsBetween, todayISO } from "@/lib/engine";
import { chf, fmtDate, guestsLabel } from "@/lib/format";
import { useHotel } from "@/lib/store";
import type { ReservationSource, ReservationStatus } from "@/lib/types";

const STATUSES: (ReservationStatus | "all")[] = ["all", "pending", "confirmed", "checked_in", "checked_out", "cancelled"];
const STATUS_LABEL: Record<string, string> = { all: "All", pending: "Pending", confirmed: "Confirmed", checked_in: "In house", checked_out: "Checked out", cancelled: "Cancelled" };
const RANGES = [
  { id: "upcoming", label: "Upcoming" },
  { id: "in_house", label: "In house" },
  { id: "past", label: "Past" },
  { id: "all", label: "All dates" },
];

export default function ReservationsPage() {
  const reservations = useHotel((s) => s.reservations);
  const rooms = useHotel((s) => s.rooms);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<ReservationStatus | "all">("all");
  const [source, setSource] = useState<ReservationSource | "all">("all");
  const [range, setRange] = useState("upcoming");
  const [open, setOpen] = useState<string | null>(null);
  const today = todayISO();

  const list = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return reservations
      .filter((r) => (status === "all" ? true : r.status === status))
      .filter((r) => (source === "all" ? true : r.source === source))
      .filter((r) => {
        if (range === "upcoming") return r.checkOut >= today;
        if (range === "in_house") return r.checkIn <= today && r.checkOut > today && r.status !== "cancelled";
        if (range === "past") return r.checkOut < today;
        return true;
      })
      .filter((r) => !needle || `${r.ref} ${r.guest.firstName} ${r.guest.lastName} ${r.guest.email} ${rooms.find((x) => x.id === r.roomId)?.name}`.toLowerCase().includes(needle))
      .sort((a, b) => (range === "past" ? (a.checkIn < b.checkIn ? 1 : -1) : a.checkIn < b.checkIn ? -1 : 1));
  }, [reservations, rooms, q, status, source, range, today]);

  const total = list.filter((r) => r.status !== "cancelled").reduce((s, r) => s + r.total, 0);

  return (
    <OfficeShell title="Reservations" subtitle={`${list.length} shown · ${chf(total)} total`}>
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[220px] flex-1 sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, ref, email, room" className={clsx(inputClass, "h-10 pl-9 text-sm")} />
        </div>
        <div className="flex gap-1 rounded-full bg-white p-1 ring-1 ring-ink/5">
          {RANGES.map((r) => (
            <button key={r.id} type="button" onClick={() => setRange(r.id)} className={clsx("rounded-full px-3 py-1.5 text-xs font-semibold transition", range === r.id ? "bg-ink text-white" : "text-slate hover:text-ink")}>{r.label}</button>
          ))}
        </div>
        <select value={status} onChange={(e) => setStatus(e.target.value as ReservationStatus | "all")} className={clsx(inputClass, "h-10 w-auto text-sm")}>
          {STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
        </select>
        <select value={source} onChange={(e) => setSource(e.target.value as ReservationSource | "all")} className={clsx(inputClass, "h-10 w-auto text-sm")}>
          <option value="all">All sources</option>
          {(["direct", "booking.com", "expedia", "phone", "walk-in", "email"] as const).map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <Panel className="mt-5">
        {list.length === 0 ? (
          <EmptyState title="Nothing here" text="Try another filter or clear the search." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead className="bg-[#fafbfc]">
                <tr>
                  <th className={th}>Ref</th><th className={th}>Guest</th><th className={th}>Room</th><th className={th}>Check-in</th><th className={th}>Check-out</th><th className={th}>Nights</th><th className={th}>Guests</th><th className={th}>Source</th><th className={th}>Status</th><th className={`${th} text-right`}>Total</th><th className={th}>Paid</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/5">
                {list.map((r) => {
                  const room = rooms.find((x) => x.id === r.roomId);
                  return (
                    <tr key={r.id} onClick={() => setOpen(r.id)} className="cursor-pointer hover:bg-[#fafbfc]">
                      <td className={`${td} font-mono text-xs`}>{r.ref}</td>
                      <td className={td}><p className="font-semibold">{r.guest.firstName} {r.guest.lastName}</p><p className="text-xs text-slate">{r.guest.country}</p></td>
                      <td className={td}>{room?.number} · {room?.name}</td>
                      <td className={td}>{fmtDate(r.checkIn, "weekday")}</td>
                      <td className={td}>{fmtDate(r.checkOut, "weekday")}</td>
                      <td className={`${td} tabular-nums`}>{nightsBetween(r.checkIn, r.checkOut)}</td>
                      <td className={td}>{guestsLabel(r.adults, r.children)}</td>
                      <td className={td}><SourceChip source={r.source} /></td>
                      <td className={td}><StatusChip status={r.status} /></td>
                      <td className={`${td} text-right tabular-nums`}>{chf(r.total, { decimals: true })}</td>
                      <td className={td}>{r.paid ? <span className="text-moss">Yes</span> : <span className="text-slate">No</span>}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
      <ReservationDrawer id={open} onClose={() => setOpen(null)} />
    </OfficeShell>
  );
}
