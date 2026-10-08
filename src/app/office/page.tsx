"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { ReservationDrawer } from "@/components/office/reservation-drawer";
import { OfficeShell } from "@/components/office/shell";
import { Kpi, Panel, SourceChip, StatusChip, td, th } from "@/components/office/ui";
import { addDays, nightsBetween, occupancyOn, todayISO } from "@/lib/engine";
import { chf, dayShort, fmtDate, fmtDateTime, plural } from "@/lib/format";
import { useHotel } from "@/lib/store";

export default function OverviewPage() {
  const rooms = useHotel((s) => s.rooms);
  const reservations = useHotel((s) => s.reservations);
  const inquiries = useHotel((s) => s.inquiries);
  const settings = useHotel((s) => s.settings);
  const setStatus = useHotel((s) => s.setReservationStatus);
  const [open, setOpen] = useState<string | null>(null);
  const today = todayISO();

  const live = reservations.filter((r) => r.status !== "cancelled");
  const arrivals = live.filter((r) => r.checkIn === today);
  const departures = live.filter((r) => r.checkOut === today);
  const inHouse = live.filter((r) => r.checkIn <= today && r.checkOut > today);
  const activeRooms = rooms.filter((r) => r.status === "active").length;
  const occToday = inHouse.length / Math.max(1, activeRooms);

  const month = today.slice(0, 7);
  const monthRes = live.filter((r) => r.checkIn.slice(0, 7) === month);
  const revenue = monthRes.reduce((s, r) => s + r.total - r.cityTax, 0);
  const roomNights = monthRes.reduce((s, r) => s + nightsBetween(r.checkIn, r.checkOut), 0);
  const adr = roomNights ? revenue / roomNights : 0;
  const daysInMonth = new Date(Number(month.slice(0, 4)), Number(month.slice(5, 7)), 0).getDate();
  const revpar = revenue / (activeRooms * daysInMonth);
  const directShare = monthRes.length ? monthRes.filter((r) => r.source === "direct").length / monthRes.length : 0;

  const next14 = useMemo(() => Array.from({ length: 14 }, (_, i) => { const d = addDays(today, i); return { date: d, occ: occupancyOn(d, rooms, reservations) }; }), [today, rooms, reservations]);
  const latest = [...reservations].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1)).slice(0, 6);
  const unread = inquiries.filter((i) => i.status === "new");
  const roomName = (id: string) => rooms.find((r) => r.id === id)?.name ?? id;

  return (
    <OfficeShell title="Overview" subtitle={`${fmtDate(today, "long")} · ${inHouse.length} of ${activeRooms} rooms occupied`}>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi label="Occupancy today" value={`${Math.round(occToday * 100)} %`} hint={`${inHouse.length} rooms in house`} tone="lake" />
        <Kpi label="Arrivals · departures" value={<>{arrivals.length} <span className="text-slate">·</span> {departures.length}</>} hint="today" />
        <Kpi label="Revenue this month" value={chf(revenue)} hint={`${plural(monthRes.length, "booking")} · ${plural(roomNights, "room night")}`} tone="moss" />
        <Kpi label="ADR · RevPAR" value={<>{chf(adr)} <span className="text-slate">·</span> {chf(revpar)}</>} hint={`${Math.round(directShare * 100)} % booked direct`} />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <Panel title="Occupancy, next 14 nights" action={<Link href="/office/calendar" className="inline-flex items-center gap-1 text-sm font-semibold text-lake">Calendar <ArrowRight className="h-4 w-4" /></Link>}>
          <div className="px-5 pb-5 pt-4">
            <div className="flex h-44 items-end gap-1.5 sm:gap-2">
              {next14.map((d) => {
                const { dow, day } = dayShort(d.date);
                const pct = Math.round(d.occ * 100);
                return (
                  <div key={d.date} className="group relative flex flex-1 flex-col items-center justify-end" title={`${fmtDate(d.date, "weekday")}: ${pct} %`}>
                    <span className="pointer-events-none absolute -top-7 rounded-md bg-ink px-1.5 py-0.5 text-[11px] font-semibold text-white opacity-0 transition group-hover:opacity-100">{pct} %</span>
                    <div className="flex h-32 w-full items-end rounded-md bg-[#f5f6f8]">
                      <div className={d.date === today ? "w-full rounded-md bg-lake" : "w-full rounded-md bg-lake/60 group-hover:bg-lake"} style={{ height: `${Math.max(3, pct)}%` }} />
                    </div>
                    <span className="mt-1.5 text-[11px] text-slate">{dow.slice(0, 2)}</span>
                    <span className={d.date === today ? "text-xs font-semibold text-ink" : "text-xs text-slate"}>{day}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </Panel>

        <div className="space-y-6">
        <Panel title="Inbox" action={<Link href="/office/inbox" className="inline-flex items-center gap-1 text-sm font-semibold text-lake">All messages <ArrowRight className="h-4 w-4" /></Link>}>
          <ul className="divide-y divide-ink/5">
            {unread.slice(0, 4).map((i) => (
              <li key={i.id} className="px-5 py-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="truncate text-sm font-semibold text-ink">{i.name}</p>
                  <span className="shrink-0 text-xs text-slate">{fmtDate(i.createdAt.slice(0, 10), "short")}</span>
                </div>
                <p className="truncate text-sm text-ink-soft">{i.subject}</p>
                <p className="mt-0.5 line-clamp-1 text-xs text-slate">{i.message}</p>
              </li>
            ))}
            {unread.length === 0 && <li className="px-5 py-8 text-center text-sm text-slate">Inbox zero.</li>}
          </ul>
        </Panel>

        <Panel title="Channels" action={<Link href="/office/settings" className="inline-flex items-center gap-1 text-sm font-semibold text-lake">Settings <ArrowRight className="h-4 w-4" /></Link>}>
          <ul className="divide-y divide-ink/5">
            {settings.channels.map((c, i) => (
              <li key={c.name} className="flex items-center justify-between gap-3 px-5 py-2.5">
                <div className="flex items-center gap-3">
                  <span className={c.connected ? "h-2 w-2 rounded-full bg-moss" : "h-2 w-2 rounded-full bg-line-strong"} />
                  <p className="text-sm font-semibold text-ink">{c.name}</p>
                </div>
                <p className="text-xs text-slate">{c.connected ? (i === 0 ? "live" : `synced ${[2, 4, 7][i % 3]} min ago`) : "not connected"}</p>
              </li>
            ))}
          </ul>
          <p className="border-t border-ink/5 px-5 py-3 text-xs text-slate">Rates and availability go out through Channex; bookings come back in here, dates blocked both ways.</p>
        </Panel>
        </div>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <Panel title={`Arrivals today · ${arrivals.length}`}>
          <ul className="divide-y divide-ink/5">
            {arrivals.map((r) => (
              <li key={r.id} className="flex items-center gap-3 px-5 py-3">
                <button type="button" onClick={() => setOpen(r.id)} className="min-w-0 flex-1 text-left">
                  <p className="truncate text-sm font-semibold text-ink">{r.guest.firstName} {r.guest.lastName} <span className="font-normal text-slate">· {roomName(r.roomId)}</span></p>
                  <p className="text-xs text-slate">{plural(nightsBetween(r.checkIn, r.checkOut), "night")} · {r.adults + r.children} guests{r.arrivalTime ? ` · arrives ${r.arrivalTime}` : ""}{r.notes ? ` · ${r.notes.split("\n")[0]}` : ""}</p>
                </button>
                {r.status === "confirmed" || r.status === "pending" ? (
                  <button type="button" onClick={() => setStatus(r.id, "checked_in")} className="rounded-xs bg-lake px-3 py-1.5 text-xs font-semibold text-white hover:bg-lake-deep">Check in</button>
                ) : <StatusChip status={r.status} />}
              </li>
            ))}
            {arrivals.length === 0 && <li className="px-5 py-8 text-center text-sm text-slate">No arrivals today.</li>}
          </ul>
        </Panel>
        <Panel title={`Departures today · ${departures.length}`}>
          <ul className="divide-y divide-ink/5">
            {departures.map((r) => (
              <li key={r.id} className="flex items-center gap-3 px-5 py-3">
                <button type="button" onClick={() => setOpen(r.id)} className="min-w-0 flex-1 text-left">
                  <p className="truncate text-sm font-semibold text-ink">{r.guest.firstName} {r.guest.lastName} <span className="font-normal text-slate">· {roomName(r.roomId)}</span></p>
                  <p className="text-xs text-slate">{chf(r.total, { decimals: true })} · {r.paid ? "paid" : "to settle at check-out"}</p>
                </button>
                {r.status === "checked_in" ? (
                  <button type="button" onClick={() => setStatus(r.id, "checked_out")} className="rounded-xs bg-ink px-3 py-1.5 text-xs font-semibold text-white hover:bg-lake">Check out</button>
                ) : <StatusChip status={r.status} />}
              </li>
            ))}
            {departures.length === 0 && <li className="px-5 py-8 text-center text-sm text-slate">No departures today.</li>}
          </ul>
        </Panel>
      </div>

      <Panel className="mt-6" title="Latest bookings" action={<Link href="/office/reservations" className="inline-flex items-center gap-1 text-sm font-semibold text-lake">All reservations <ArrowRight className="h-4 w-4" /></Link>}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px]">
            <thead className="bg-[#fafbfc]"><tr><th className={th}>Ref</th><th className={th}>Guest</th><th className={th}>Room</th><th className={th}>Dates</th><th className={th}>Source</th><th className={th}>Status</th><th className={`${th} text-right`}>Total</th><th className={th}>Booked</th></tr></thead>
            <tbody className="divide-y divide-ink/5">
              {latest.map((r) => (
                <tr key={r.id} onClick={() => setOpen(r.id)} className="cursor-pointer hover:bg-[#fafbfc]">
                  <td className={`${td} font-mono text-xs`}>{r.ref}</td>
                  <td className={`${td} font-semibold`}>{r.guest.firstName} {r.guest.lastName}</td>
                  <td className={td}>{roomName(r.roomId)}</td>
                  <td className={td}>{fmtDate(r.checkIn, "short")} → {fmtDate(r.checkOut, "short")}</td>
                  <td className={td}><SourceChip source={r.source} /></td>
                  <td className={td}><StatusChip status={r.status} /></td>
                  <td className={`${td} text-right tabular-nums`}>{chf(r.total)}</td>
                  <td className={`${td} text-slate`}>{fmtDateTime(r.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      <ReservationDrawer id={open} onClose={() => setOpen(null)} />
    </OfficeShell>
  );
}
