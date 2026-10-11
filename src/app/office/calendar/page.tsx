"use client";

import { DndContext, PointerSensor, useDraggable, useDroppable, useSensor, useSensors, type DragEndEvent, type DragStartEvent } from "@dnd-kit/core";
import { clsx } from "clsx";
import { ChevronLeft, ChevronRight, Undo2, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { NewReservationModal } from "@/components/office/new-reservation";
import { ReservationDrawer } from "@/components/office/reservation-drawer";
import { OfficeShell } from "@/components/office/shell";
import { Panel } from "@/components/office/ui";
import { addDays, nightsBetween, occupancyOn, todayISO } from "@/lib/engine";
import { dayShort, fmtDate, monthLabel } from "@/lib/format";
import { useHotel, useOfficeScope } from "@/lib/store";
import type { Reservation, ReservationStatus, Room } from "@/lib/types";

const BAR: Record<ReservationStatus, string> = {
  pending: "bg-[#ffe3b3] text-[#6b4500] ring-[#f3c879]",
  confirmed: "bg-sky text-lake-deep ring-lake/30",
  checked_in: "bg-moss-soft text-moss ring-moss/30",
  checked_out: "bg-ink/8 text-slate ring-ink/10",
  cancelled: "bg-transparent text-slate ring-line line-through",
};

const LABEL_W = 184;

interface Toast { text: string; tone: "ok" | "no"; undo?: () => void }

export default function CalendarPage() {
  const scope = useOfficeScope();
  const move = useHotel((s) => s.moveReservation);
  const today = todayISO();
  const [propertyId, setPropertyId] = useState(scope.property?.id ?? scope.allProperties[0].id);
  useEffect(() => { if (scope.property) setPropertyId(scope.property.id); }, [scope.property]);
  const property = scope.allProperties.find((p) => p.id === propertyId) ?? scope.allProperties[0];
  const rooms = useMemo(() => scope.allRooms.filter((r) => r.propertyId === property.id).sort((a, b) => (a.kind === "whole" ? -1 : b.kind === "whole" ? 1 : a.number - b.number)), [scope.allRooms, property.id]);
  const allRes = useHotel((s) => s.reservations);
  const live = useMemo(() => allRes.filter((r) => r.propertyId === property.id && r.status !== "cancelled"), [allRes, property.id]);

  const [start, setStart] = useState(addDays(today, -1));
  const [span, setSpan] = useState<14 | 30>(14);
  const [open, setOpen] = useState<string | null>(null);
  const [create, setCreate] = useState<{ roomId: string; checkIn: string } | null>(null);
  const [toast, setToast] = useState<Toast | null>(null);
  const [dragging, setDragging] = useState<string | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  const days = useMemo(() => Array.from({ length: span }, (_, i) => addDays(start, i)), [start, span]);
  const end = addDays(start, span);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 7000);
    return () => clearTimeout(t);
  }, [toast]);

  const cellWidth = () => {
    const w = gridRef.current?.getBoundingClientRect().width ?? 1000;
    return (w - LABEL_W) / span;
  };

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const onDragStart = (e: DragStartEvent) => setDragging(String(e.active.id));
  const onDragEnd = (e: DragEndEvent) => {
    setDragging(null);
    const id = String(e.active.id);
    const daysDelta = Math.round(e.delta.x / cellWidth());
    if (id.startsWith("ext-")) {
      const r = live.find((x) => x.id === id.slice(4));
      if (!r || daysDelta === 0) return;
      const nights = nightsBetween(r.checkIn, r.checkOut);
      const checkOut = addDays(r.checkIn, Math.max(1, nights + daysDelta));
      if (checkOut === r.checkOut) return;
      const before = { checkOut: r.checkOut };
      const res = move(r.id, { checkOut });
      setToast(res.ok
        ? { tone: "ok", text: `${r.guest.lastName}: now ${nightsBetween(r.checkIn, checkOut)} nights, until ${fmtDate(checkOut, "short")}.`, undo: () => { move(r.id, before); setToast(null); } }
        : { tone: "no", text: res.reason ?? "That did not work." });
      return;
    }
    const r = live.find((x) => x.id === id);
    if (!r) return;
    const overRoom = e.over ? String(e.over.id) : r.roomId;
    if (daysDelta === 0 && overRoom === r.roomId) return;
    const before = { roomId: r.roomId, checkIn: r.checkIn, checkOut: r.checkOut };
    const to = { roomId: overRoom, checkIn: addDays(r.checkIn, daysDelta), checkOut: addDays(r.checkOut, daysDelta) };
    const res = move(r.id, to);
    const room = rooms.find((x) => x.id === overRoom);
    const where = overRoom !== r.roomId ? ` moved to ${room?.name ?? "another unit"},` : ":";
    setToast(res.ok
      ? { tone: "ok", text: `${r.guest.lastName}${where} ${fmtDate(to.checkIn, "short")} → ${fmtDate(to.checkOut, "short")}.`, undo: () => { move(r.id, before); setToast(null); } }
      : { tone: "no", text: res.reason ?? "That did not work." });
  };

  const barsFor = (room: Room) => live.filter((r) => r.roomId === room.id && r.checkIn < end && r.checkOut > start);
  const parentBarsFor = (room: Room) => (room.parentId ? live.filter((r) => r.roomId === room.parentId && r.checkIn < end && r.checkOut > start) : []);

  return (
    <OfficeShell
      title="Calendar"
      subtitle={`${property.name} · ${fmtDate(start, "short")} – ${fmtDate(addDays(end, -1), "medium")}`}
      actions={
        <div className="hidden items-center gap-1 rounded-xs bg-white p-1 ring-1 ring-ink/5 sm:flex">
          {[14, 30].map((n) => <button key={n} type="button" onClick={() => setSpan(n as 14 | 30)} className={clsx("rounded-xs px-3 py-1 text-xs font-semibold", span === n ? "bg-ink text-white" : "text-slate")}>{n} days</button>)}
        </div>
      }
    >
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {scope.all && scope.allProperties.length > 1 && (
          <div className="mr-2 flex gap-1 rounded-xs bg-white p-1 ring-1 ring-ink/5">
            {scope.allProperties.map((p) => (
              <button key={p.id} type="button" onClick={() => setPropertyId(p.id)} className={clsx("inline-flex items-center gap-2 rounded-xs px-3 py-1.5 text-xs font-semibold transition", property.id === p.id ? "bg-ink text-white" : "text-slate hover:text-ink")}>
                <span className="h-2 w-2 rounded-full" style={{ background: property.id === p.id ? "#fff" : p.accent }} />{p.name}
              </button>
            ))}
          </div>
        )}
        <button type="button" onClick={() => setStart(addDays(start, -span))} className="rounded-xs bg-white p-2 ring-1 ring-ink/5 hover:bg-ink/5" aria-label="Earlier"><ChevronLeft className="h-4 w-4" /></button>
        <button type="button" onClick={() => setStart(addDays(today, -1))} className="rounded-xs bg-white px-3 py-1.5 text-sm font-semibold ring-1 ring-ink/5 hover:bg-ink/5">Today</button>
        <button type="button" onClick={() => setStart(addDays(start, span))} className="rounded-xs bg-white p-2 ring-1 ring-ink/5 hover:bg-ink/5" aria-label="Later"><ChevronRight className="h-4 w-4" /></button>
        <span className="ml-2 font-display text-lg font-semibold">{monthLabel(start)}</span>
        <div className="ml-auto flex flex-wrap items-center gap-3 text-xs text-slate">
          {(["confirmed", "checked_in", "pending", "checked_out"] as const).map((s) => (
            <span key={s} className="inline-flex items-center gap-1.5"><span className={clsx("h-3 w-5 rounded-sm ring-1", BAR[s])} /> {{ confirmed: "Confirmed", checked_in: "In house", pending: "Pending / hold", checked_out: "Checked out" }[s]}</span>
          ))}
          <span className="inline-flex items-center gap-1.5"><span className="hatched h-3 w-5 rounded-sm ring-1 ring-line" /> Out of order</span>
        </div>
      </div>

      <Panel>
        <div className="overflow-x-auto scrollbar-thin">
          <div ref={gridRef} style={{ minWidth: span === 14 ? 1000 : 1800 }}>
            {/* header */}
            <div className="grid" style={{ gridTemplateColumns: `${LABEL_W}px repeat(${span}, minmax(0, 1fr))` }}>
              <div className="sticky left-0 z-10 bg-white px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate">{property.unitLabel.one[0].toUpperCase() + property.unitLabel.one.slice(1)}</div>
              {days.map((d) => {
                const { dow, day } = dayShort(d);
                const weekend = dow === "Sat" || dow === "Sun";
                return (
                  <div key={d} className={clsx("border-l border-ink/5 px-1 py-2 text-center", d === today && "bg-mist", weekend && d !== today && "bg-[#fafbfc]")}>
                    <span className="block text-[10px] font-medium uppercase text-slate">{dow}</span>
                    <span className={clsx("block text-sm font-semibold", d === today ? "text-lake" : "text-ink")}>{day}</span>
                  </div>
                );
              })}
              <div className="sticky left-0 z-10 bg-white px-4 py-1 text-[10px] font-medium text-slate">Occupancy</div>
              {days.map((d) => {
                const pct = Math.round(occupancyOn(d, rooms, live) * 100);
                return <div key={d} className={clsx("border-l border-ink/5 px-1 py-1 text-center text-[10px] font-medium tabular-nums", pct >= 80 ? "text-moss" : pct >= 50 ? "text-lake" : "text-slate")}>{pct}%</div>;
              })}
            </div>

            <DndContext sensors={sensors} onDragStart={onDragStart} onDragEnd={onDragEnd}>
              {rooms.map((room) => (
                <Row key={room.id} room={room} days={days} span={span} start={start} end={end} today={today} bars={barsFor(room)} parentBars={parentBarsFor(room)} dragging={dragging} onOpen={setOpen} onCreate={(d) => setCreate({ roomId: room.id, checkIn: d })} />
              ))}
            </DndContext>
          </div>
        </div>
        <p className="border-t border-ink/5 px-5 py-2.5 text-xs text-slate">Drag a stay to another {property.unitLabel.one} or other dates · drag its right edge to extend or shorten · click an empty night to book it. Every move can be undone.</p>
      </Panel>

      {toast && (
        <div role="status" className={clsx("fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-3 rounded-lg px-4 py-3 text-sm shadow-lift", toast.tone === "ok" ? "bg-ink text-white" : "bg-[#fdecea] text-[#9f2f24] ring-1 ring-[#f3b9b2]")}>
          <span>{toast.text}</span>
          {toast.undo && <button type="button" onClick={toast.undo} className="inline-flex items-center gap-1 rounded-xs bg-white/15 px-2 py-1 text-xs font-semibold hover:bg-white/25"><Undo2 className="h-3.5 w-3.5" /> Undo</button>}
          <button type="button" onClick={() => setToast(null)} className="rounded-xs p-1 opacity-70 hover:opacity-100" aria-label="Dismiss"><X className="h-3.5 w-3.5" /></button>
        </div>
      )}

      <ReservationDrawer id={open} onClose={() => setOpen(null)} />
      {create && <NewReservationModal onClose={() => setCreate(null)} initial={create} />}
    </OfficeShell>
  );
}

function Row({ room, days, span, start, end, today, bars, parentBars, dragging, onOpen, onCreate }: { room: Room; days: string[]; span: number; start: string; end: string; today: string; bars: Reservation[]; parentBars: Reservation[]; dragging: string | null; onOpen: (id: string) => void; onCreate: (date: string) => void }) {
  const { setNodeRef, isOver } = useDroppable({ id: room.id, disabled: room.status !== "active" });
  const ooo = room.status === "out_of_order";
  const whole = room.kind === "whole";
  return (
    <div ref={setNodeRef} className={clsx("relative grid border-t border-ink/5 transition", isOver && dragging && !dragging.startsWith("ext-") && "bg-mist/40", whole && "bg-[#fbfbf7]")} style={{ gridTemplateColumns: `${LABEL_W}px repeat(${span}, minmax(0, 1fr))` }}>
      <div className={clsx("sticky left-0 z-10 px-4 py-2", whole ? "bg-[#fbfbf7]" : "bg-white")}>
        <p className="truncate text-sm font-semibold text-ink">{whole ? room.name : `${room.number} · ${room.name}`}</p>
        <p className="truncate text-[11px] text-slate">{whole ? `books every unit below · up to ${room.maxGuests} guests` : `${room.maxGuests} guests · ${room.housekeeping}`}{ooo ? " · out of order" : ""}</p>
      </div>
      {ooo ? (
        <div className="hatched col-span-full border-l border-ink/5 px-3 py-3 text-xs text-slate" style={{ gridColumn: `2 / span ${span}` }}>{room.statusNote || "Out of order"}</div>
      ) : (
        <>
          {days.map((d) => (
            <button key={d} type="button" onClick={() => onCreate(d)} className={clsx("group h-12 border-l border-ink/5 text-left", d === today && "bg-mist/50")} aria-label={`New reservation ${room.name} ${d}`}>
              <span className="block w-full text-center text-lg leading-none text-lake opacity-0 transition group-hover:opacity-100">+</span>
            </button>
          ))}
          {/* a parent's booking shows faintly on its children */}
          {parentBars.map((r) => {
            const from = Math.max(0, nightsBetween(start, r.checkIn));
            const to = Math.min(span, nightsBetween(start, r.checkOut));
            return (
              <div key={r.id} className="pointer-events-none absolute top-1 h-10 rounded-md border border-dashed border-ink/20 bg-ink/[0.03] px-2 text-[11px] leading-10 text-slate" style={{ left: `calc(${LABEL_W}px + ${(from / span) * 100}% - ${(from / span) * LABEL_W}px)`, width: `calc(${((to - from) / span) * 100}% - ${((to - from) / span) * LABEL_W}px)` }}>
                <span className="truncate">whole site · {r.guest.lastName}</span>
              </div>
            );
          })}
          {bars.map((r) => <Bar key={r.id} r={r} span={span} start={start} end={end} dragging={dragging} onOpen={onOpen} />)}
        </>
      )}
    </div>
  );
}

function Bar({ r, span, start, end, dragging, onOpen }: { r: Reservation; span: number; start: string; end: string; dragging: string | null; onOpen: (id: string) => void }) {
  const from = Math.max(0, nightsBetween(start, r.checkIn));
  const to = Math.min(span, nightsBetween(start, r.checkOut));
  const width = to - from;
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: r.id });
  const ext = useDraggable({ id: `ext-${r.id}` });
  const dx = transform?.x ?? 0;
  const dy = transform?.y ?? 0;
  const extDx = ext.transform?.x ?? 0;
  const style: React.CSSProperties = {
    left: `calc(${LABEL_W}px + ${(from / span) * 100}% - ${(from / span) * LABEL_W}px)`,
    width: `calc(${(width / span) * 100}% - ${(width / span) * LABEL_W}px + ${extDx}px)`,
    transform: `translate(${dx}px, ${dy}px)`,
    zIndex: isDragging || ext.isDragging ? 30 : 5,
  };
  const guests = r.headcount ?? r.adults + r.children;
  const hold = r.status === "pending" && r.holdUntil;
  return (
    <div ref={setNodeRef} style={style} className={clsx("absolute top-1 h-10", isDragging && "opacity-90 drop-shadow-lg", dragging && !isDragging && "pointer-events-none")}>
      <button
        type="button"
        {...listeners}
        {...attributes}
        onClick={() => onOpen(r.id)}
        title={`${r.guest.firstName} ${r.guest.lastName} · ${r.ref} · ${fmtDate(r.checkIn, "short")} → ${fmtDate(r.checkOut, "short")}${hold ? ` · hold until ${fmtDate(r.holdUntil!, "short")}` : ""}`}
        className={clsx("flex h-10 w-full cursor-grab items-center overflow-hidden px-2 text-left text-xs font-semibold ring-1 ring-inset active:cursor-grabbing", BAR[r.status], r.checkIn < start ? "rounded-l-none" : "rounded-l-lg", r.checkOut > end ? "rounded-r-none" : "rounded-r-lg", hold && "border-2 border-dashed border-[#d9a03a]/60")}
      >
        <span className="truncate">{r.guest.lastName}{width > 1 ? `, ${r.guest.firstName}` : ""}</span>
        {width > 2 && <span className="ml-auto truncate pl-2 font-normal opacity-70">{guests} p · {r.type !== "stay" ? r.type : r.source === "direct" ? "direct" : r.source}</span>}
      </button>
      {r.checkOut <= end && (
        <button ref={ext.setNodeRef} type="button" {...ext.listeners} {...ext.attributes} className="absolute -right-1 top-0 h-10 w-3 cursor-ew-resize rounded-r-lg opacity-0 transition hover:bg-ink/10 hover:opacity-100" aria-label={`Change the check-out of ${r.guest.lastName}`} title="Drag to extend or shorten" />
      )}
    </div>
  );
}
