"use client";

import { clsx } from "clsx";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";
import { NewReservationModal } from "@/components/office/new-reservation";
import { ReservationDrawer } from "@/components/office/reservation-drawer";
import { OfficeShell } from "@/components/office/shell";
import { Panel } from "@/components/office/ui";
import { addDays, nightsBetween, occupancyOn, todayISO } from "@/lib/engine";
import { dayShort, fmtDate, monthLabel } from "@/lib/format";
import { useHotel } from "@/lib/store";
import type { Reservation, ReservationStatus } from "@/lib/types";

const BAR: Record<ReservationStatus, string> = {
  pending: "bg-[#ffe3b3] text-[#6b4500] ring-[#f3c879]",
  confirmed: "bg-sky text-lake-deep ring-lake/30",
  checked_in: "bg-moss-soft text-moss ring-moss/30",
  checked_out: "bg-ink/8 text-slate ring-ink/10",
  cancelled: "bg-transparent text-slate ring-line line-through",
};

export default function CalendarPage() {
  const rooms = useHotel((s) => s.rooms);
  const reservations = useHotel((s) => s.reservations);
  const today = todayISO();
  const [start, setStart] = useState(addDays(today, -1));
  const [span, setSpan] = useState<14 | 30>(14);
  const [open, setOpen] = useState<string | null>(null);
  const [create, setCreate] = useState<{ roomId: string; checkIn: string } | null>(null);

  const days = useMemo(() => Array.from({ length: span }, (_, i) => addDays(start, i)), [start, span]);
  const end = addDays(start, span);

  const rowFor = (roomId: string) => {
    const res = reservations
      .filter((r) => r.roomId === roomId && r.status !== "cancelled" && r.checkIn < end && r.checkOut > start)
      .sort((a, b) => (a.checkIn < b.checkIn ? -1 : 1));
    type Cell = { kind: "res"; r: Reservation; span: number; clippedStart: boolean; clippedEnd: boolean } | { kind: "empty"; date: string };
    const cells: Cell[] = [];
    let cursor = 0;
    for (const r of res) {
      const from = Math.max(0, nightsBetween(start, r.checkIn));
      const to = Math.min(span, nightsBetween(start, r.checkOut));
      while (cursor < from) { cells.push({ kind: "empty", date: days[cursor] }); cursor++; }
      if (to > from) {
        cells.push({ kind: "res", r, span: to - from, clippedStart: r.checkIn < start, clippedEnd: r.checkOut > end });
        cursor = to;
      }
    }
    while (cursor < span) { cells.push({ kind: "empty", date: days[cursor] }); cursor++; }
    return cells;
  };

  return (
    <OfficeShell
      title="Calendar"
      subtitle={`${fmtDate(start, "short")} – ${fmtDate(addDays(end, -1), "medium")}`}
      actions={
        <div className="hidden items-center gap-1 rounded-full bg-white p-1 ring-1 ring-ink/5 sm:flex">
          {[14, 30].map((n) => <button key={n} type="button" onClick={() => setSpan(n as 14 | 30)} className={clsx("rounded-full px-3 py-1 text-xs font-semibold", span === n ? "bg-ink text-white" : "text-slate")}>{n} days</button>)}
        </div>
      }
    >
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <button type="button" onClick={() => setStart(addDays(start, -span))} className="rounded-full bg-white p-2 ring-1 ring-ink/5 hover:bg-ink/5" aria-label="Earlier"><ChevronLeft className="h-4 w-4" /></button>
        <button type="button" onClick={() => setStart(addDays(today, -1))} className="rounded-full bg-white px-3 py-1.5 text-sm font-semibold ring-1 ring-ink/5 hover:bg-ink/5">Today</button>
        <button type="button" onClick={() => setStart(addDays(start, span))} className="rounded-full bg-white p-2 ring-1 ring-ink/5 hover:bg-ink/5" aria-label="Later"><ChevronRight className="h-4 w-4" /></button>
        <span className="ml-2 font-display text-lg font-semibold">{monthLabel(start)}</span>
        <div className="ml-auto flex flex-wrap items-center gap-3 text-xs text-slate">
          {(["confirmed", "checked_in", "pending", "checked_out"] as const).map((s) => (
            <span key={s} className="inline-flex items-center gap-1.5"><span className={clsx("h-3 w-5 rounded-sm ring-1", BAR[s])} /> {{ confirmed: "Confirmed", checked_in: "In house", pending: "Pending", checked_out: "Checked out" }[s]}</span>
          ))}
          <span className="inline-flex items-center gap-1.5"><span className="hatched h-3 w-5 rounded-sm ring-1 ring-line" /> Out of order</span>
        </div>
      </div>

      <Panel>
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full border-separate border-spacing-0" style={{ minWidth: span === 14 ? 980 : 1800 }}>
            <thead>
              <tr>
                <th className="sticky left-0 z-10 w-44 bg-white px-4 py-2 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-slate">Room</th>
                {days.map((d) => {
                  const { dow, day } = dayShort(d);
                  const weekend = dow === "Sat" || dow === "Sun";
                  return (
                    <th key={d} className={clsx("border-l border-ink/5 px-1 py-2 text-center", d === today && "bg-mist", weekend && d !== today && "bg-[#fafbfc]")}>
                      <span className="block text-[10px] font-medium uppercase text-slate">{dow}</span>
                      <span className={clsx("block text-sm font-semibold", d === today ? "text-lake" : "text-ink")}>{day}</span>
                    </th>
                  );
                })}
              </tr>
              <tr>
                <th className="sticky left-0 z-10 bg-white px-4 py-1 text-left text-[10px] font-medium text-slate">Occupancy</th>
                {days.map((d) => {
                  const pct = Math.round(occupancyOn(d, rooms, reservations) * 100);
                  return <th key={d} className={clsx("border-l border-ink/5 px-1 py-1 text-center text-[10px] font-medium tabular-nums", pct >= 80 ? "text-moss" : pct >= 50 ? "text-lake" : "text-slate")}>{pct}%</th>;
                })}
              </tr>
            </thead>
            <tbody>
              {rooms.map((room) => (
                <tr key={room.id} className="border-t border-ink/5">
                  <td className="sticky left-0 z-10 border-t border-ink/5 bg-white px-4 py-2">
                    <p className="text-sm font-semibold text-ink">{room.number} · {room.name}</p>
                    <p className="text-[11px] text-slate">{room.maxGuests} guests · {room.view}{room.status === "out_of_order" ? " · out of order" : ""}</p>
                  </td>
                  {room.status === "out_of_order" ? (
                    <td colSpan={span} className="hatched border-l border-t border-ink/5 px-3 text-xs text-slate">{room.statusNote || "Out of order"}</td>
                  ) : (
                    rowFor(room.id).map((c, i) =>
                      c.kind === "empty" ? (
                        <td key={i} className={clsx("h-12 border-l border-t border-ink/5", c.date === today && "bg-mist/50")}>
                          <button type="button" onClick={() => setCreate({ roomId: room.id, checkIn: c.date })} className="h-full w-full opacity-0 transition hover:opacity-100" aria-label={`New reservation ${room.name} ${c.date}`}>
                            <span className="text-lg leading-none text-lake">+</span>
                          </button>
                        </td>
                      ) : (
                        <td key={i} colSpan={c.span} className="h-12 border-l border-t border-ink/5 p-1">
                          <button
                            type="button"
                            onClick={() => setOpen(c.r.id)}
                            title={`${c.r.guest.firstName} ${c.r.guest.lastName} · ${c.r.ref} · ${fmtDate(c.r.checkIn, "short")} → ${fmtDate(c.r.checkOut, "short")}`}
                            className={clsx("flex h-10 w-full items-center overflow-hidden px-2 text-left text-xs font-semibold ring-1 ring-inset", BAR[c.r.status], c.clippedStart ? "rounded-l-none" : "rounded-l-lg", c.clippedEnd ? "rounded-r-none" : "rounded-r-lg")}
                          >
                            <span className="truncate">{c.r.guest.lastName}{c.span > 1 ? `, ${c.r.guest.firstName}` : ""}</span>
                            {c.span > 2 && <span className="ml-auto truncate pl-2 font-normal opacity-70">{c.r.adults + c.r.children} p · {c.r.source === "direct" ? "direct" : c.r.source}</span>}
                          </button>
                        </td>
                      ),
                    )
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      <ReservationDrawer id={open} onClose={() => setOpen(null)} />
      {create && <NewReservationModal onClose={() => setCreate(null)} initial={create} />}
    </OfficeShell>
  );
}
