"use client";

import { clsx } from "clsx";
import { ArrowRight, BedDouble, CalendarDays, ClipboardList, CornerDownLeft, Inbox, LayoutDashboard, Plus, Radio, Search, Settings, Tags, User, Users, BarChart3, Building2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { STATUS_LABEL, fmtDate } from "@/lib/format";
import { useHotel, useOfficeScope } from "@/lib/store";

interface Hit {
  id: string;
  group: "Actions" | "Pages" | "Reservations" | "Guests" | "Units" | "Requests";
  title: string;
  detail?: string;
  icon: typeof Search;
  run: () => void;
}

const PAGES = [
  { href: "/office", label: "Today", icon: LayoutDashboard },
  { href: "/office/calendar", label: "Calendar", icon: CalendarDays },
  { href: "/office/reservations", label: "Reservations", icon: ClipboardList },
  { href: "/office/guests", label: "Guests", icon: Users },
  { href: "/office/inbox", label: "Inbox", icon: Inbox },
  { href: "/office/rooms", label: "Units", icon: BedDouble },
  { href: "/office/rates", label: "Rates & extras", icon: Tags },
  { href: "/office/channels", label: "Channels", icon: Radio },
  { href: "/office/reports", label: "Reports", icon: BarChart3 },
  { href: "/office/settings", label: "Settings", icon: Settings },
];

const norm = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

/** ⌘K — reaches pages, records and actions, so the rail can stay lean. */
export function CommandPalette({ onClose, onNew }: { onClose: () => void; onNew: () => void }) {
  const router = useRouter();
  const scope = useOfficeScope();
  const setProperty = useHotel((s) => s.setOfficeProperty);
  const [q, setQ] = useState("");
  const [cursor, setCursor] = useState(0);
  const input = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  useEffect(() => { input.current?.focus(); }, []);

  const hits = useMemo<Hit[]>(() => {
    const go = (href: string) => () => { router.push(href); onClose(); };
    const nq = norm(q.trim());
    const out: Hit[] = [];

    if (!nq) {
      out.push({ id: "new", group: "Actions", title: "New reservation", detail: "N", icon: Plus, run: onNew });
      for (const p of PAGES.slice(0, 6)) out.push({ id: p.href, group: "Pages", title: p.label, icon: p.icon, run: go(p.href) });
      return out;
    }

    // actions
    if ("new reservation booking".includes(nq) || nq.startsWith("new")) out.push({ id: "new", group: "Actions", title: "New reservation", detail: "N", icon: Plus, run: onNew });
    for (const p of scope.allProperties) {
      if (norm(p.name).includes(nq) || "switch property location".includes(nq)) out.push({ id: `sw-${p.id}`, group: "Actions", title: `Show ${p.name} only`, detail: p.kind, icon: Building2, run: () => { setProperty(p.id); onClose(); } });
    }
    if ("all locations everything portfolio".includes(nq) && scope.allProperties.length > 1) out.push({ id: "sw-all", group: "Actions", title: "Show all locations", icon: Building2, run: () => { setProperty("all"); onClose(); } });

    // pages
    for (const p of PAGES) if (norm(p.label).includes(nq)) out.push({ id: p.href, group: "Pages", title: p.label, icon: p.icon, run: go(p.href) });

    // reservations: ref or guest name
    const res = scope.reservations.filter((r) => norm(r.ref).includes(nq) || norm(`${r.guest.firstName} ${r.guest.lastName}`).includes(nq) || norm(r.guest.email).includes(nq));
    for (const r of res.slice(0, 6)) {
      const unit = scope.allRooms.find((u) => u.id === r.roomId);
      out.push({ id: r.id, group: "Reservations", title: `${r.guest.firstName} ${r.guest.lastName} · ${r.ref}`, detail: `${unit?.name ?? ""} · ${fmtDate(r.checkIn, "short")} → ${fmtDate(r.checkOut, "short")} · ${STATUS_LABEL[r.status]}`, icon: ClipboardList, run: go(`/office/reservations?open=${r.id}`) });
    }

    // guests (unique by email)
    const seen = new Set<string>();
    for (const r of scope.reservations) {
      const key = r.guest.email.toLowerCase();
      if (seen.has(key)) continue;
      if (norm(`${r.guest.firstName} ${r.guest.lastName}`).includes(nq) || key.includes(nq)) {
        seen.add(key);
        const stays = scope.reservations.filter((x) => x.guest.email.toLowerCase() === key && x.status !== "cancelled").length;
        out.push({ id: `g-${key}`, group: "Guests", title: `${r.guest.firstName} ${r.guest.lastName}`, detail: `${r.guest.country} · ${stays} stay${stays === 1 ? "" : "s"}`, icon: User, run: go(`/office/guests?q=${encodeURIComponent(r.guest.email)}`) });
        if (seen.size >= 5) break;
      }
    }

    // units
    for (const u of scope.rooms.filter((u) => norm(u.name).includes(nq) || String(u.number) === nq).slice(0, 5)) {
      const p = scope.allProperties.find((x) => x.id === u.propertyId);
      out.push({ id: u.id, group: "Units", title: u.name, detail: `${p?.short ?? ""} · ${u.category} · ${u.status === "active" ? u.housekeeping : "out of order"}`, icon: BedDouble, run: go(`/office/rooms?open=${u.id}`) });
    }

    // requests
    for (const i of scope.inquiries.filter((i) => norm(i.name).includes(nq) || norm(i.subject).includes(nq)).slice(0, 5)) {
      out.push({ id: i.id, group: "Requests", title: i.subject, detail: `${i.name} · ${i.status}`, icon: Inbox, run: go(`/office/inbox?open=${i.id}`) });
    }
    return out;
  }, [q, scope, router, onClose, onNew, setProperty]);

  useEffect(() => setCursor(0), [q]);

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setCursor((c) => Math.min(hits.length - 1, c + 1)); }
    if (e.key === "ArrowUp") { e.preventDefault(); setCursor((c) => Math.max(0, c - 1)); }
    if (e.key === "Enter" && hits[cursor]) { e.preventDefault(); hits[cursor].run(); }
    if (e.key === "Escape") onClose();
  };

  useEffect(() => {
    const el = listRef.current?.querySelector<HTMLElement>(`[data-i="${cursor}"]`);
    el?.scrollIntoView({ block: "nearest" });
  }, [cursor]);

  let lastGroup = "";
  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center p-4 pt-[12vh]" role="dialog" aria-modal="true" aria-label="Search">
      <div className="absolute inset-0 bg-ink/40" onClick={onClose} />
      <div className="relative w-full max-w-xl overflow-hidden rounded-lg bg-white shadow-lift ring-1 ring-ink/10">
        <div className="flex items-center gap-3 border-b border-ink/5 px-4">
          <Search className="h-4 w-4 text-slate" />
          <input ref={input} value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={onKey} placeholder="Search reservations, guests, units, pages… or type an action" className="h-12 flex-1 bg-transparent text-sm outline-none placeholder:text-slate" />
          <kbd className="rounded-xs bg-ink/5 px-1.5 py-0.5 text-[10px] text-slate">esc</kbd>
        </div>
        <ul ref={listRef} className="max-h-[50vh] overflow-y-auto p-1.5">
          {hits.map((h, i) => {
            const header = h.group !== lastGroup ? h.group : null;
            lastGroup = h.group;
            return (
              <li key={`${h.group}-${h.id}`}>
                {header && <p className="px-2.5 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate">{header}</p>}
                <button type="button" data-i={i} onMouseEnter={() => setCursor(i)} onClick={h.run} className={clsx("flex w-full items-center gap-3 rounded-xs px-2.5 py-2 text-left", i === cursor ? "bg-mist text-ink" : "text-ink-soft hover:bg-ink/5")}>
                  <h.icon className="h-4 w-4 shrink-0 text-lake" />
                  <span className="min-w-0 flex-1"><span className="block truncate text-sm font-medium">{h.title}</span>{h.detail && <span className="block truncate text-xs text-slate">{h.detail}</span>}</span>
                  {i === cursor ? <CornerDownLeft className="h-3.5 w-3.5 text-slate" /> : <ArrowRight className="h-3.5 w-3.5 text-transparent" />}
                </button>
              </li>
            );
          })}
          {hits.length === 0 && <li className="px-3 py-8 text-center text-sm text-slate">Nothing matches “{q}”.</li>}
        </ul>
      </div>
    </div>
  );
}
