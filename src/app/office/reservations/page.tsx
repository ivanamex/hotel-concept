"use client";

import { clsx } from "clsx";
import { Search } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import { ReservationDrawer } from "@/components/office/reservation-drawer";
import { OfficeShell } from "@/components/office/shell";
import { EmptyState, Panel, PropertyChip, SourceChip, StatusChip, td, th } from "@/components/office/ui";
import { inputClass } from "@/components/ui";
import { addDays, nightsBetween, todayISO } from "@/lib/engine";
import { TYPE_LABEL, fmtDate, money } from "@/lib/format";
import { useHotel, useOfficeScope } from "@/lib/store";
import type { ReservationSource, ReservationStatus, ReservationType } from "@/lib/types";

const STATUSES: (ReservationStatus | "all")[] = ["all", "pending", "confirmed", "checked_in", "checked_out", "cancelled"];
const STATUS_LABEL: Record<string, string> = { all: "All statuses", pending: "Pending", confirmed: "Confirmed", checked_in: "In house", checked_out: "Checked out", cancelled: "Cancelled" };
const RANGES = [
  { id: "arrivals", label: "Arrivals today" },
  { id: "departures", label: "Departures today" },
  { id: "inhouse", label: "In house" },
  { id: "upcoming", label: "Upcoming" },
  { id: "bookedtoday", label: "Booked today" },
  { id: "past", label: "Past" },
  { id: "all", label: "All dates" },
];

export default function ReservationsPage() {
  return <Suspense fallback={null}><Reservations /></Suspense>;
}

function Reservations() {
  const scope = useOfficeScope();
  const params = useSearchParams();
  const setProperty = useHotel((s) => s.setOfficeProperty);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<ReservationStatus | "all">("all");
  const [source, setSource] = useState<ReservationSource | "all">("all");
  const [type, setType] = useState<ReservationType | "all">("all");
  const [range, setRange] = useState("upcoming");
  const [open, setOpen] = useState<string | null>(null);
  const today = todayISO();

  // deep links from the Today tiles and the search palette
  useEffect(() => {
    const v = params.get("view");
    if (v && RANGES.some((r) => r.id === v)) setRange(v);
    const o = params.get("open");
    if (o) setOpen(o);
    const p = params.get("property");
    if (p && scope.all && scope.allProperties.some((x) => x.id === p)) setProperty(p);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

  const rooms = scope.allRooms;
  const list = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return scope.reservations
      .filter((r) => (status === "all" ? true : r.status === status))
      .filter((r) => (source === "all" ? true : r.source === source))
      .filter((r) => (type === "all" ? true : r.type === type))
      .filter((r) => {
        const live = r.status !== "cancelled";
        if (range === "arrivals") return r.checkIn === today && live;
        if (range === "departures") return r.checkOut === today && live;
        if (range === "upcoming") return r.checkOut >= today;
        if (range === "inhouse") return r.checkIn <= today && r.checkOut > today && live;
        if (range === "bookedtoday") return r.createdAt.slice(0, 10) === today;
        if (range === "past") return r.checkOut < today;
        return true;
      })
      .filter((r) => !needle || `${r.ref} ${r.guest.firstName} ${r.guest.lastName} ${r.guest.email} ${rooms.find((x) => x.id === r.roomId)?.name}`.toLowerCase().includes(needle))
      .sort((a, b) => (range === "past" || range === "bookedtoday" ? (a.createdAt < b.createdAt ? 1 : -1) : a.checkIn < b.checkIn ? -1 : 1));
  }, [scope.reservations, rooms, q, status, source, type, range, today]);

  const currency = scope.properties.every((p) => p.currency === scope.properties[0].currency) ? scope.properties[0].currency : null;
  const total = list.filter((r) => r.status !== "cancelled").reduce((s, r) => s + r.total, 0);
  const curOf = (pid: string) => scope.allProperties.find((p) => p.id === pid)?.currency ?? "CHF";

  return (
    <OfficeShell title="Reservations" subtitle={`${list.length} shown${currency ? ` · ${money(total, currency)} total` : ""}`}>
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[220px] flex-1 sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, ref, email, unit" className={clsx(inputClass, "h-10 pl-9 text-sm")} />
        </div>
        <div className="flex flex-wrap gap-1 rounded-xs bg-white p-1 ring-1 ring-ink/5">
          {RANGES.map((r) => (
            <button key={r.id} type="button" onClick={() => setRange(r.id)} className={clsx("rounded-xs px-3 py-1.5 text-xs font-semibold transition", range === r.id ? "bg-ink text-white" : "text-slate hover:text-ink")}>{r.label}</button>
          ))}
        </div>
        <select value={status} onChange={(e) => setStatus(e.target.value as ReservationStatus | "all")} className={clsx(inputClass, "h-10 w-auto text-sm")}>
          {STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
        </select>
        <select value={source} onChange={(e) => setSource(e.target.value as ReservationSource | "all")} className={clsx(inputClass, "h-10 w-auto text-sm")}>
          <option value="all">All sources</option>
          {(["direct", "booking.com", "expedia", "airbnb", "phone", "walk-in", "email"] as const).map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={type} onChange={(e) => setType(e.target.value as ReservationType | "all")} className={clsx(inputClass, "h-10 w-auto text-sm")}>
          <option value="all">All kinds</option>
          {(["stay", "whole", "retreat", "venue"] as const).map((s) => <option key={s} value={s}>{TYPE_LABEL[s]}</option>)}
        </select>
      </div>

      <Panel className="mt-5">
        {list.length === 0 ? (
          <EmptyState title="Nothing here" text="Try another filter or clear the search." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[960px]">
              <thead className="bg-[#fafbfc]">
                <tr>
                  <th className={th}>Ref</th><th className={th}>Guest</th>{scope.all && scope.allProperties.length > 1 && <th className={th}>Property</th>}<th className={th}>Unit</th><th className={th}>Check-in</th><th className={th}>Check-out</th><th className={th}>Nights</th><th className={th}>Guests</th><th className={th}>Source</th><th className={th}>Status</th><th className={`${th} text-right`}>Total</th><th className={th}>Paid</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/5">
                {list.map((r) => {
                  const room = rooms.find((x) => x.id === r.roomId);
                  const guests = r.headcount ?? r.adults + r.children;
                  return (
                    <tr key={r.id} onClick={() => setOpen(r.id)} className="cursor-pointer transition hover:bg-[#fafbfc]">
                      <td className={`${td} font-mono text-xs`}>{r.ref}</td>
                      <td className={td}><p className="font-semibold">{r.guest.firstName} {r.guest.lastName}{r.type !== "stay" && <span className="ml-2 rounded-xs bg-[#eef3ff] px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#2f4b8f]">{TYPE_LABEL[r.type]}</span>}</p><p className="text-xs text-slate">{r.guest.country}{r.holdUntil && r.status === "pending" ? ` · hold until ${fmtDate(r.holdUntil, "short")}` : ""}</p></td>
                      {scope.all && scope.allProperties.length > 1 && <td className={td}><PropertyChip id={r.propertyId} /></td>}
                      <td className={td}>{room?.kind === "whole" ? room.name : `${room?.number} · ${room?.name}`}</td>
                      <td className={td}>{fmtDate(r.checkIn, "weekday")}</td>
                      <td className={td}>{fmtDate(r.checkOut, "weekday")}</td>
                      <td className={`${td} tabular-nums`}>{nightsBetween(r.checkIn, r.checkOut)}</td>
                      <td className={td}>{guests}</td>
                      <td className={td}><SourceChip source={r.source} /></td>
                      <td className={td}><StatusChip status={r.status} /></td>
                      <td className={`${td} text-right tabular-nums`}>{money(r.total, curOf(r.propertyId), { decimals: true })}</td>
                      <td className={td}>{r.paid ? <span className="text-moss">Yes</span> : r.deposit ? <span className="text-[#8a5a00]">Deposit</span> : <span className="text-slate">No</span>}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
      {range === "upcoming" && list.length > 0 && <p className="mt-2 text-xs text-slate">Upcoming = everything that has not checked out yet, from {fmtDate(today, "short")}. Tomorrow's arrivals: {scope.reservations.filter((r) => r.checkIn === addDays(today, 1) && r.status !== "cancelled").length}.</p>}
      <ReservationDrawer id={open} onClose={() => setOpen(null)} />
    </OfficeShell>
  );
}
