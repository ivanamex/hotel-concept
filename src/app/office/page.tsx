"use client";

import { DndContext, KeyboardSensor, PointerSensor, closestCenter, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { SortableContext, arrayMove, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { clsx } from "clsx";
import { ArrowRight, GripVertical, RotateCcw } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { ReservationDrawer } from "@/components/office/reservation-drawer";
import { OfficeShell } from "@/components/office/shell";
import { PropertyChip, SourceChip, StatusChip, td, th } from "@/components/office/ui";
import { attentionItems } from "@/lib/attention";
import { addDays, nightsBetween, occupancyOn, sellableUnits, todayISO, unitOccupiedOn } from "@/lib/engine";
import { dayShort, fmtDate, fmtDateTime, money, plural } from "@/lib/format";
import { useHotel, useOfficeScope } from "@/lib/store";
import type { Property, Reservation, Room } from "@/lib/types";

type PanelId = "guests" | "attention" | "outlook" | "channels" | "latest";
const DEFAULT_ORDER: PanelId[] = ["guests", "attention", "outlook", "channels", "latest"];
const SPAN: Record<PanelId, string> = { guests: "xl:col-span-2", attention: "xl:col-span-1", outlook: "xl:col-span-2", channels: "xl:col-span-1", latest: "xl:col-span-3" };
const ORDER_KEY = "mv-today-order";

export default function TodayPage() {
  const scope = useOfficeScope();
  const setStatus = useHotel((s) => s.setReservationStatus);
  const xpBookings = useHotel((s) => s.experienceBookings);
  const [open, setOpen] = useState<string | null>(null);
  const today = todayISO();

  const live = useMemo(() => scope.reservations.filter((r) => r.status !== "cancelled"), [scope.reservations]);
  const inHouse = live.filter((r) => r.checkIn <= today && r.checkOut > today);
  const units = sellableUnits(scope.rooms).filter((r) => r.status === "active");
  const occupiedUnits = units.filter((u) => unitOccupiedOn(u, today, scope.allRooms, live)).length;
  const attention = useMemo(() => attentionItems(scope, today, new Date().toISOString()), [scope, today]);

  const [order, setOrder] = useState<PanelId[]>(DEFAULT_ORDER);
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(ORDER_KEY) ?? "null") as PanelId[] | null;
      if (saved && saved.length === DEFAULT_ORDER.length && DEFAULT_ORDER.every((id) => saved.includes(id))) setOrder(saved);
    } catch {}
  }, []);
  const persist = (next: PanelId[]) => { setOrder(next); try { localStorage.setItem(ORDER_KEY, JSON.stringify(next)); } catch {} };
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));
  const onDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    persist(arrayMove(order, order.indexOf(active.id as PanelId), order.indexOf(over.id as PanelId)));
  };
  const move = (id: PanelId, dir: -1 | 1) => {
    const i = order.indexOf(id);
    const j = i + dir;
    if (j < 0 || j >= order.length) return;
    persist(arrayMove(order, i, j));
  };
  const customised = order.join() !== DEFAULT_ORDER.join();

  const panels: Record<PanelId, { title: string; action?: ReactNode; body: ReactNode }> = {
    guests: { title: "Today's guests", body: <GuestsPanel today={today} live={live} rooms={scope.allRooms} all={scope.all} onOpen={setOpen} onStatus={setStatus} /> },
    attention: { title: `Needs attention${attention.length ? ` · ${attention.length}` : ""}`, body: <AttentionPanel items={attention} all={scope.all} /> },
    outlook: { title: "Next 14 nights", action: <Link href="/office/calendar" className="inline-flex items-center gap-1 text-sm font-semibold text-lake">Calendar <ArrowRight className="h-4 w-4" /></Link>, body: <OutlookPanel today={today} scope={scope} live={live} /> },
    channels: { title: "Channels", action: <Link href="/office/channels" className="inline-flex items-center gap-1 text-sm font-semibold text-lake">All channels <ArrowRight className="h-4 w-4" /></Link>, body: <ChannelsPanel properties={scope.properties} /> },
    latest: { title: "Latest bookings", action: <Link href="/office/reservations" className="inline-flex items-center gap-1 text-sm font-semibold text-lake">All reservations <ArrowRight className="h-4 w-4" /></Link>, body: <LatestPanel reservations={scope.reservations} rooms={scope.allRooms} properties={scope.properties} all={scope.all} onOpen={setOpen} /> },
  };

  return (
    <OfficeShell
      title={scope.all && scope.allProperties.length > 1 ? "Today · all locations" : "Today"}
      subtitle={`${fmtDate(today, "long")} · ${occupiedUnits} of ${units.length} ${unitWord(scope.properties, units.length)} occupied · ${inHouse.length} ${plural(inHouse.length, "booking").split(" ")[1]} in house`}
      actions={customised ? <button type="button" onClick={() => persist(DEFAULT_ORDER)} className="hidden items-center gap-1.5 rounded-xs px-2.5 py-1.5 text-xs font-semibold text-slate transition hover:bg-ink/5 hover:text-ink sm:inline-flex" title="Put the panels back in their default order"><RotateCcw className="h-3.5 w-3.5" /> Reset layout</button> : null}
    >
      {/* today strips — one per property when looking at all of them */}
      <div className="space-y-4">
        {scope.properties.map((p) => (
          <TodayStrip key={p.id} property={p} showName={scope.all && scope.allProperties.length > 1} today={today} rooms={scope.allRooms} live={live.filter((r) => r.propertyId === p.id)} inquiries={scope.inquiries.filter((i) => i.propertyId === p.id || (!i.propertyId && p.id === scope.allProperties[0].id))} xpToday={xpBookings.filter((b) => b.propertyId === p.id && b.status !== "cancelled" && b.createdAt.slice(0, 10) === today)} />
        ))}
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <SortableContext items={order} strategy={verticalListSortingStrategy}>
          <div className="mt-6 grid gap-6 xl:grid-cols-3">
            {order.map((id) => (
              <SortablePanel key={id} id={id} className={SPAN[id]} title={panels[id].title} action={panels[id].action} onMove={(d) => move(id, d)} first={order[0] === id} last={order[order.length - 1] === id}>
                {panels[id].body}
              </SortablePanel>
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <ReservationDrawer id={open} onClose={() => setOpen(null)} />
    </OfficeShell>
  );
}

function unitWord(properties: Property[], n: number) {
  const words = new Set(properties.map((p) => p.unitLabel.many));
  if (words.size === 1) { const w = [...words][0]; return n === 1 ? properties[0].unitLabel.one : w; }
  return n === 1 ? "unit" : "units";
}

/* ---------- sortable panel ---------- */

function SortablePanel({ id, title, action, className, children, onMove, first, last }: { id: PanelId; title: string; action?: ReactNode; className?: string; children: ReactNode; onMove: (d: -1 | 1) => void; first: boolean; last: boolean }) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style = { transform: CSS.Translate.toString(transform), transition };
  return (
    <section ref={setNodeRef} style={style} className={clsx("rounded-lg bg-white ring-1 ring-ink/5", isDragging && "z-20 shadow-lift ring-lake/40", className)}>
      <div className="group/panel flex items-center gap-2 border-b border-ink/5 px-5 py-3">
        <button ref={setActivatorNodeRef} type="button" {...attributes} {...listeners} className="-ml-2 cursor-grab rounded-xs p-1 text-line-strong transition hover:bg-ink/5 hover:text-ink active:cursor-grabbing" aria-label={`Move the ${title} panel`} title="Drag to reorder">
          <GripVertical className="h-4 w-4" />
        </button>
        <h2 className="flex-1 font-display text-[15px] font-semibold text-ink">{title}</h2>
        <span className="hidden gap-0.5 opacity-0 transition group-hover/panel:opacity-100 sm:flex">
          <button type="button" onClick={() => onMove(-1)} disabled={first} className="rounded-xs px-1.5 py-0.5 text-xs text-slate hover:bg-ink/5 hover:text-ink disabled:opacity-30" aria-label="Move up">↑</button>
          <button type="button" onClick={() => onMove(1)} disabled={last} className="rounded-xs px-1.5 py-0.5 text-xs text-slate hover:bg-ink/5 hover:text-ink disabled:opacity-30" aria-label="Move down">↓</button>
        </span>
        {action}
      </div>
      {children}
    </section>
  );
}

/* ---------- today strip ---------- */

function TodayStrip({ property, showName, today, rooms, live, inquiries, xpToday }: { property: Property; showName: boolean; today: string; rooms: Room[]; live: Reservation[]; inquiries: ReturnType<typeof useOfficeScope>["inquiries"]; xpToday: { total: number }[] }) {
  const own = rooms.filter((r) => r.propertyId === property.id);
  const units = sellableUnits(own).filter((r) => r.status === "active");
  const arrivals = live.filter((r) => r.checkIn === today);
  const departures = live.filter((r) => r.checkOut === today);
  const occupied = units.filter((u) => unitOccupiedOn(u, today, rooms, live)).length;
  const toClean = own.filter((r) => r.kind !== "whole" && r.housekeeping === "dirty").length;
  const newMsgs = inquiries.filter((i) => i.status === "new").length;
  const bookedToday = live.filter((r) => r.createdAt.slice(0, 10) === today);
  const bookedValue = bookedToday.reduce((s, r) => s + r.total, 0) + xpToday.reduce((s, b) => s + b.total, 0);
  const q = (view: string) => `/office/reservations?view=${view}&property=${property.id}`;

  const tiles = [
    { label: "Arrivals", value: arrivals.length, hint: `${arrivals.filter((r) => r.status !== "checked_in").length} still to arrive`, href: q("arrivals"), tone: "lake" },
    { label: "Departures", value: departures.length, hint: `${departures.filter((r) => r.status === "checked_in").length} still to check out`, href: q("departures"), tone: "ink" },
    { label: "In house", value: `${occupied}/${units.length}`, hint: `${units.length ? Math.round((occupied / units.length) * 100) : 0} % occupied`, href: q("inhouse"), tone: "moss" },
    { label: "To clean", value: toClean, hint: toClean ? `${property.unitLabel.many} to turn around` : "all done", href: `/office/rooms?property=${property.id}&hk=dirty`, tone: toClean ? "clay" : "ink" },
    { label: "New messages", value: newMsgs, hint: newMsgs ? "unanswered" : "inbox zero", href: `/office/inbox?property=${property.id}`, tone: newMsgs ? "clay" : "ink" },
    { label: "Booked today", value: bookedToday.length + xpToday.length, hint: bookedToday.length + xpToday.length ? `${money(bookedValue, property.currency)}${xpToday.length ? ` · ${xpToday.length} experience${xpToday.length === 1 ? "" : "s"}` : ""}` : "nothing yet", href: q("bookedtoday"), tone: "ink" },
  ] as const;

  return (
    <div>
      {showName && (
        <div className="mb-2 flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full" style={{ background: property.accent }} />
          <h2 className="font-display text-base font-semibold text-ink">{property.name}</h2>
          <span className="text-xs text-slate">{property.kind}</span>
        </div>
      )}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
        {tiles.map((t) => (
          <Link key={t.label} href={t.href} className="group rounded-lg bg-white p-4 ring-1 ring-ink/5 transition hover:-translate-y-0.5 hover:shadow-lift hover:ring-ink/15">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate">{t.label}</p>
            <p className={clsx("mt-1.5 font-display text-2xl font-semibold tabular-nums", t.tone === "lake" ? "text-lake" : t.tone === "moss" ? "text-moss" : t.tone === "clay" ? "text-clay" : "text-ink")}>{t.value}</p>
            <p className="mt-0.5 truncate text-xs text-slate group-hover:text-ink-soft">{t.hint}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}

/* ---------- today's guests ---------- */

type Tab = "arrivals" | "departures" | "stayovers";

function GuestsPanel({ today, live, rooms, all, onOpen, onStatus }: { today: string; live: Reservation[]; rooms: Room[]; all: boolean; onOpen: (id: string) => void; onStatus: (id: string, s: Reservation["status"]) => void }) {
  const [tab, setTab] = useState<Tab>("arrivals");
  const [day, setDay] = useState<"today" | "tomorrow">("today");
  const date = day === "today" ? today : addDays(today, 1);
  const roomName = (id: string) => rooms.find((r) => r.id === id)?.name ?? id;
  const list = tab === "arrivals" ? live.filter((r) => r.checkIn === date) : tab === "departures" ? live.filter((r) => r.checkOut === date) : live.filter((r) => r.checkIn < date && r.checkOut > date);
  const count = (t: Tab) => (t === "arrivals" ? live.filter((r) => r.checkIn === date).length : t === "departures" ? live.filter((r) => r.checkOut === date).length : live.filter((r) => r.checkIn < date && r.checkOut > date).length);
  const sorted = [...list].sort((a, b) => (a.arrivalTime ?? "").localeCompare(b.arrivalTime ?? "") || a.guest.lastName.localeCompare(b.guest.lastName));

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-ink/5 px-5 py-2.5">
        <div className="flex gap-1">
          {(["arrivals", "departures", "stayovers"] as Tab[]).map((t) => (
            <button key={t} type="button" onClick={() => setTab(t)} className={clsx("rounded-xs px-3 py-1.5 text-xs font-semibold capitalize transition", tab === t ? "bg-ink text-white" : "text-slate hover:bg-ink/5 hover:text-ink")}>{t} · {count(t)}</button>
          ))}
        </div>
        <div className="flex gap-1 rounded-xs bg-[#f5f6f8] p-0.5">
          {(["today", "tomorrow"] as const).map((d) => (
            <button key={d} type="button" onClick={() => setDay(d)} className={clsx("rounded-xs px-2.5 py-1 text-xs font-semibold capitalize transition", day === d ? "bg-white text-ink shadow-sm" : "text-slate hover:text-ink")}>{d}</button>
          ))}
        </div>
      </div>
      <ul className="divide-y divide-ink/5">
        {sorted.map((r) => {
          const guests = r.headcount ?? r.adults + r.children;
          const nights = nightsBetween(r.checkIn, r.checkOut);
          return (
            <li key={r.id} className="flex items-center gap-3 px-5 py-3">
              <button type="button" onClick={() => onOpen(r.id)} className="min-w-0 flex-1 text-left">
                <p className="truncate text-sm font-semibold text-ink">
                  {r.guest.firstName} {r.guest.lastName} <span className="font-normal text-slate">· {roomName(r.roomId)}</span>
                  {all && <PropertyChip id={r.propertyId} size="xs" className="ml-2 align-middle" />}
                  {r.type !== "stay" && <span className="ml-2 rounded-xs bg-[#eef3ff] px-1.5 py-0.5 align-middle text-[10px] font-semibold uppercase tracking-wide text-[#2f4b8f]">{r.type}</span>}
                </p>
                <p className="truncate text-xs text-slate">
                  {plural(nights, "night")} · {guests} {guests === 1 ? "guest" : "guests"}
                  {tab === "arrivals" && r.arrivalTime ? ` · arrives ${r.arrivalTime}` : ""}
                  {tab === "departures" ? ` · ${r.paid ? "paid" : "balance to settle"}` : ""}
                  {r.notes ? ` · ${r.notes.split("\n")[0]}` : ""}
                </p>
              </button>
              {!r.paid && <span className="hidden rounded-xs bg-clay-soft px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-clay sm:inline">unpaid</span>}
              {day === "today" && tab === "arrivals" && (r.status === "confirmed" || r.status === "pending") ? (
                <button type="button" onClick={() => onStatus(r.id, "checked_in")} className="rounded-xs bg-lake px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-lake-deep">Check in</button>
              ) : day === "today" && tab === "departures" && r.status === "checked_in" ? (
                <button type="button" onClick={() => onStatus(r.id, "checked_out")} className="rounded-xs bg-ink px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-lake">Check out</button>
              ) : (
                <StatusChip status={r.status} />
              )}
            </li>
          );
        })}
        {sorted.length === 0 && <li className="px-5 py-10 text-center text-sm text-slate">{tab === "arrivals" ? `No arrivals ${day}.` : tab === "departures" ? `No departures ${day}.` : `Nobody staying over ${day}.`}</li>}
      </ul>
    </div>
  );
}

/* ---------- needs attention ---------- */

function AttentionPanel({ items, all }: { items: ReturnType<typeof attentionItems>; all: boolean }) {
  if (items.length === 0) {
    return <div className="px-5 py-12 text-center"><p className="font-display text-lg font-semibold text-moss">All clear.</p><p className="mt-1 text-sm text-slate">Nothing is waiting on you.</p></div>;
  }
  return (
    <ul className="divide-y divide-ink/5">
      {items.map((i) => (
        <li key={i.id}>
          <Link href={i.href} className="flex gap-3 px-5 py-3 transition hover:bg-[#fafbfc]">
            <span className={clsx("mt-1.5 h-2 w-2 shrink-0 rounded-full", i.tone === "clay" ? "bg-clay" : i.tone === "amber" ? "bg-[#d9a03a]" : "bg-line-strong")} />
            <span className="min-w-0 flex-1">
              <span className="block text-sm text-ink">{i.text}{all && i.propertyId && <PropertyChip id={i.propertyId} size="xs" className="ml-2 align-middle" />}</span>
              {i.detail && <span className="block truncate text-xs text-slate">{i.detail}</span>}
            </span>
            <ArrowRight className="mt-1 h-3.5 w-3.5 shrink-0 text-line-strong" />
          </Link>
        </li>
      ))}
    </ul>
  );
}

/* ---------- outlook: 14 nights + the month ---------- */

function OutlookPanel({ today, scope, live }: { today: string; scope: ReturnType<typeof useOfficeScope>; live: Reservation[] }) {
  const currency = scope.properties.every((p) => p.currency === scope.properties[0].currency) ? scope.properties[0].currency : null;
  const next14 = useMemo(() => Array.from({ length: 14 }, (_, i) => {
    const d = addDays(today, i);
    const occ = occupancyOn(d, scope.rooms, live);
    const rev = live.filter((r) => r.checkIn <= d && r.checkOut > d).reduce((s, r) => s + (r.total - r.cityTax) / Math.max(1, nightsBetween(r.checkIn, r.checkOut)), 0);
    return { date: d, occ, rev };
  }), [today, scope.rooms, live]);
  const maxRev = Math.max(1, ...next14.map((d) => d.rev));

  const month = today.slice(0, 7);
  const dayOfMonth = Number(today.slice(8, 10));
  const prevMonthDate = addDays(`${month}-01`, -1);
  const prevMonth = prevMonthDate.slice(0, 7);
  const units = sellableUnits(scope.rooms).filter((r) => r.status === "active").length || 1;

  const kpis = (m: string, uptoDay: number) => {
    const res = live.filter((r) => r.checkIn.slice(0, 7) === m && Number(r.checkIn.slice(8, 10)) <= uptoDay);
    const revenue = res.reduce((s, r) => s + r.total - r.cityTax, 0);
    const roomNights = res.reduce((s, r) => s + nightsBetween(r.checkIn, r.checkOut), 0);
    const nightsSoFar = Array.from({ length: uptoDay }, (_, i) => `${m}-${String(i + 1).padStart(2, "0")}`);
    const occ = nightsSoFar.reduce((s, d) => s + occupancyOn(d, scope.rooms, live), 0) / nightsSoFar.length;
    return { revenue, adr: roomNights ? revenue / roomNights : 0, revpar: revenue / (units * uptoDay), occ, direct: res.length ? res.filter((r) => r.source === "direct").length / res.length : 0, bookings: res.length };
  };
  const now = kpis(month, dayOfMonth);
  const prev = kpis(prevMonth, dayOfMonth);
  const delta = (a: number, b: number, pct = false) => {
    if (!b) return null;
    const d = pct ? (a - b) * 100 : ((a - b) / b) * 100;
    const sign = d > 0 ? "+" : "";
    return <span className={clsx("ml-1.5 text-[11px] font-semibold", d >= 0 ? "text-moss" : "text-clay")}>{sign}{d.toFixed(0)}{pct ? " pt" : " %"}</span>;
  };
  const fm = (n: number) => (currency ? money(n, currency) : "—");

  return (
    <div className="px-5 pb-5 pt-4">
      <div className="relative h-44">
        <svg viewBox="0 0 560 160" className="h-full w-full" preserveAspectRatio="none" aria-hidden="true">
          {next14.map((d, i) => {
            const x = i * 40 + 6;
            const h = Math.max(3, d.occ * 120);
            return <rect key={d.date} x={x} y={130 - h} width={28} height={h} rx={3} className={d.date === today ? "fill-lake" : "fill-lake/35"} />;
          })}
          <polyline fill="none" strokeWidth={2} className="stroke-clay" points={next14.map((d, i) => `${i * 40 + 20},${130 - (d.rev / maxRev) * 120}`).join(" ")} />
          {next14.map((d, i) => <circle key={d.date} cx={i * 40 + 20} cy={130 - (d.rev / maxRev) * 120} r={3} className="fill-white stroke-clay" strokeWidth={2} />)}
        </svg>
        <div className="pointer-events-none absolute inset-x-0 top-0 grid grid-cols-14" style={{ gridTemplateColumns: "repeat(14, minmax(0, 1fr))" }}>
          {next14.map((d) => {
            const { dow, day } = dayShort(d.date);
            return (
              <div key={d.date} className="group pointer-events-auto relative h-40 text-center" title={`${fmtDate(d.date, "weekday")} · ${Math.round(d.occ * 100)} % · ${fm(d.rev)}`}>
                <span className="absolute inset-x-0 top-0 rounded-md bg-ink px-1 py-0.5 text-[10px] font-semibold text-white opacity-0 transition group-hover:opacity-100">{Math.round(d.occ * 100)} %</span>
                <span className="absolute inset-x-0 bottom-0 text-[10px] text-slate">{dow.slice(0, 2)}<br /><span className={d.date === today ? "font-semibold text-ink" : ""}>{day}</span></span>
              </div>
            );
          })}
        </div>
      </div>
      <p className="mt-1 flex items-center gap-4 text-[11px] text-slate"><span className="inline-flex items-center gap-1"><span className="h-2 w-3 rounded-[2px] bg-lake/40" /> occupancy</span><span className="inline-flex items-center gap-1"><span className="h-0.5 w-3 bg-clay" /> room revenue per night</span></p>

      <div className="mt-5 grid grid-cols-2 gap-4 border-t border-ink/5 pt-4 sm:grid-cols-5">
        <Kpi label="Occupancy MTD" value={`${Math.round(now.occ * 100)} %`} delta={delta(now.occ, prev.occ, true)} />
        <Kpi label="Revenue MTD" value={fm(now.revenue)} delta={delta(now.revenue, prev.revenue)} hint={`${plural(now.bookings, "booking")}`} />
        <Kpi label="ADR" value={fm(now.adr)} delta={delta(now.adr, prev.adr)} />
        <Kpi label="RevPAR" value={fm(now.revpar)} delta={delta(now.revpar, prev.revpar)} />
        <Kpi label="Booked direct" value={`${Math.round(now.direct * 100)} %`} delta={delta(now.direct, prev.direct, true)} hint="no commission" />
      </div>
      <p className="mt-2 text-[11px] text-slate">Month to date, compared with the same days last month.</p>
    </div>
  );
}

function Kpi({ label, value, delta, hint }: { label: string; value: string; delta: ReactNode; hint?: string }) {
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate">{label}</p>
      <p className="mt-1 whitespace-nowrap font-display text-xl font-semibold tabular-nums text-ink">{value}{delta}</p>
      {hint && <p className="text-[11px] text-slate">{hint}</p>}
    </div>
  );
}

/* ---------- channels ---------- */

function ChannelsPanel({ properties }: { properties: Property[] }) {
  return (
    <div className="divide-y divide-ink/5">
      {properties.map((p) => (
        <div key={p.id} className="px-5 py-3">
          {properties.length > 1 && <p className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-ink"><span className="h-2 w-2 rounded-full" style={{ background: p.accent }} />{p.name}</p>}
          <ul className="space-y-1.5">
            {p.channels.map((c) => (
              <li key={c.id} className="flex items-center justify-between gap-3 text-sm">
                <span className="flex items-center gap-2.5">
                  <span className={clsx("h-2 w-2 rounded-full", !c.connected ? "bg-line-strong" : c.error ? "bg-clay" : "bg-moss")} />
                  <span className={c.connected ? "font-medium text-ink" : "text-slate"}>{c.name}</span>
                </span>
                <span className={clsx("text-xs", c.error ? "font-semibold text-clay" : "text-slate")}>{!c.connected ? "not connected" : c.error ? "sync error" : c.lastSync === "live" ? "live" : `synced ${ago(c.lastSync)}`}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}
      <p className="px-5 py-3 text-xs text-slate">Rates and availability go out through the channel manager; bookings come back in here, dates blocked both ways.</p>
    </div>
  );
}

function ago(iso?: string) {
  if (!iso) return "";
  const mins = Math.max(1, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
  if (mins < 60) return `${mins} min ago`;
  const h = Math.round(mins / 60);
  if (h < 48) return `${h} h ago`;
  return `${Math.round(h / 24)} d ago`;
}

/* ---------- latest bookings ---------- */

function LatestPanel({ reservations, rooms, properties, all, onOpen }: { reservations: Reservation[]; rooms: Room[]; properties: Property[]; all: boolean; onOpen: (id: string) => void }) {
  const latest = [...reservations].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1)).slice(0, 8);
  const roomName = (id: string) => rooms.find((r) => r.id === id)?.name ?? id;
  const currency = (r: Reservation) => properties.find((p) => p.id === r.propertyId)?.currency ?? "CHF";
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[760px]">
        <thead className="bg-[#fafbfc]"><tr><th className={th}>Ref</th><th className={th}>Guest</th>{all && <th className={th}>Property</th>}<th className={th}>Unit</th><th className={th}>Dates</th><th className={th}>Source</th><th className={th}>Status</th><th className={`${th} text-right`}>Total</th><th className={th}>Booked</th></tr></thead>
        <tbody className="divide-y divide-ink/5">
          {latest.map((r) => (
            <tr key={r.id} onClick={() => onOpen(r.id)} className="cursor-pointer transition hover:bg-[#fafbfc]">
              <td className={`${td} font-mono text-xs`}>{r.ref}</td>
              <td className={`${td} font-semibold`}>{r.guest.firstName} {r.guest.lastName}{r.type !== "stay" && <span className="ml-2 rounded-xs bg-[#eef3ff] px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#2f4b8f]">{r.type}</span>}</td>
              {all && <td className={td}><PropertyChip id={r.propertyId} /></td>}
              <td className={td}>{roomName(r.roomId)}</td>
              <td className={td}>{fmtDate(r.checkIn, "short")} → {fmtDate(r.checkOut, "short")}</td>
              <td className={td}><SourceChip source={r.source} /></td>
              <td className={td}><StatusChip status={r.status} /></td>
              <td className={`${td} text-right tabular-nums`}>{money(r.total, currency(r))}</td>
              <td className={`${td} text-slate`}>{fmtDateTime(r.createdAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

