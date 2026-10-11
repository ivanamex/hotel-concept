"use client";

import { clsx } from "clsx";
import {
  BarChart3,
  BedDouble,
  Bell,
  CalendarDays,
  Check,
  ChevronDown,
  ChevronsLeft,
  ChevronsRight,
  ClipboardList,
  ExternalLink,
  Inbox,
  LayoutDashboard,
  LifeBuoy,
  LogOut,
  Menu,
  MessageSquarePlus,
  Plus,
  Radio,
  Search,
  Settings,
  StickyNote,
  Tags,
  Users,
  Wrench,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Mark } from "@/components/site/logo";
import { attentionItems } from "@/lib/attention";
import { todayISO } from "@/lib/engine";
import { fmtDate } from "@/lib/format";
import { useHotel, useHydrated, useOfficeScope } from "@/lib/store";
import { CommandPalette } from "./command-palette";
import { NewReservationModal } from "./new-reservation";
import { GuestNoteModal, NewRequestModal, OutOfOrderModal } from "./quick-modals";

interface NavItem { href: string; label: string; icon: typeof Inbox; badge?: "attention" | "inbox" }
interface NavGroup { label: string; items: NavItem[] }

const GROUPS: NavGroup[] = [
  {
    label: "Daily",
    items: [
      { href: "/office", label: "Today", icon: LayoutDashboard, badge: "attention" },
      { href: "/office/calendar", label: "Calendar", icon: CalendarDays },
      { href: "/office/reservations", label: "Reservations", icon: ClipboardList },
      { href: "/office/guests", label: "Guests", icon: Users },
      { href: "/office/inbox", label: "Inbox", icon: Inbox, badge: "inbox" },
    ],
  },
  {
    label: "Manage",
    items: [
      { href: "/office/rooms", label: "Units", icon: BedDouble },
      { href: "/office/rates", label: "Rates & extras", icon: Tags },
      { href: "/office/channels", label: "Channels", icon: Radio },
      { href: "/office/reports", label: "Reports", icon: BarChart3 },
    ],
  },
];

const RAIL_KEY = "mv-office-rail";
/** Where the rail was scrolled to — survives page changes, since every office page mounts its own shell. */
let railScroll = 0;

type Quick = "reservation" | "request" | "ooo" | "note" | null;

export function OfficeShell({ children, title, subtitle, actions }: { children: ReactNode; title: string; subtitle?: ReactNode; actions?: ReactNode }) {
  const hydrated = useHydrated();
  const user = useHotel((s) => s.officeUser);
  const signOut = useHotel((s) => s.signOut);
  const scope = useOfficeScope();
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [quick, setQuick] = useState<Quick>(null);
  const [palette, setPalette] = useState(false);
  const today = todayISO();

  useEffect(() => {
    if (hydrated && !user) router.replace("/office/login");
  }, [hydrated, user, router]);

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    try { setCollapsed(localStorage.getItem(RAIL_KEY) === "collapsed"); } catch {}
  }, []);
  const railRef = useRef<HTMLElement>(null);
  useLayoutEffect(() => {
    const el = railRef.current;
    if (!el) return;
    el.scrollTop = railScroll;
    const active = el.querySelector<HTMLElement>('[aria-current="page"]');
    if (active) {
      const top = active.offsetTop;
      const bottom = top + active.offsetHeight;
      if (top < el.scrollTop || bottom > el.scrollTop + el.clientHeight) el.scrollTop = Math.max(0, top - el.clientHeight / 2);
    }
    // the rail only exists once the store has hydrated and the user is known, so those are deps too
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, collapsed, hydrated, user]);
  const toggleRail = () => {
    setCollapsed((c) => {
      try { localStorage.setItem(RAIL_KEY, c ? "open" : "collapsed"); } catch {}
      return !c;
    });
  };

  // keyboard: ⌘K / Ctrl+K search · N new reservation · T calendar (never while typing)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const typing = !!target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.tagName === "SELECT" || target.isContentEditable);
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); setPalette((p) => !p); return; }
      if (typing || e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === "n" || e.key === "N") { e.preventDefault(); setQuick("reservation"); }
      if (e.key === "t" || e.key === "T") { e.preventDefault(); router.push("/office/calendar"); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [router]);

  const unread = scope.inquiries.filter((i) => i.status === "new").length;
  const attention = useMemo(() => attentionItems(scope, today, new Date().toISOString()), [scope, today]);

  if (!hydrated || !user) {
    return <div className="flex min-h-screen items-center justify-center bg-[#f5f6f8] text-sm text-slate">Loading the office…</div>;
  }

  const brand = scope.allProperties[0];
  const badgeFor = (b?: NavItem["badge"]) => (b === "inbox" ? unread : b === "attention" ? attention.length : 0);

  const sidebar = (compact: boolean) => (
    <div className="flex min-h-full flex-col">
      <div className={clsx("flex items-center gap-2.5 py-4", compact ? "justify-center px-2" : "px-5")}>
        <Mark light />
        {!compact && (
          <div className="min-w-0">
            <p className="truncate font-display text-base font-semibold leading-tight text-white">{brand.name}</p>
            <p className="text-[11px] uppercase tracking-[0.16em] text-sky/70">Back office</p>
          </div>
        )}
      </div>

      <div className={clsx(compact ? "px-2" : "px-3")}>
        <PropertySwitcher compact={compact} />
        <button type="button" onClick={() => setPalette(true)} title="Search (⌘K)" className={clsx("mt-2 flex w-full items-center gap-2.5 rounded-md bg-white/8 py-2 text-sm text-sky/80 transition hover:bg-white/12 hover:text-white", compact ? "justify-center px-0" : "px-3")}>
          <Search className="h-4 w-4 shrink-0" />
          {!compact && <><span className="flex-1 text-left">Search</span><kbd className="rounded-xs bg-white/10 px-1.5 py-0.5 text-[10px] text-sky/80">⌘K</kbd></>}
        </button>
      </div>

      <nav className="mt-3 flex-1 space-y-3 px-3" aria-label="Office">
        {GROUPS.map((g) => (
          <div key={g.label}>
            {!compact && <p className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-sky/50">{g.label}</p>}
            {compact && <div className="mx-auto mb-1 h-px w-6 bg-white/10" />}
            <ul className="space-y-0.5">
              {g.items.map((item) => {
                const active = item.href === "/office" ? pathname === "/office" : pathname.startsWith(item.href);
                const badge = badgeFor(item.badge);
                const label = item.href === "/office/rooms" ? unitsLabel(scope) : item.label;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      title={compact ? label : undefined}
                      aria-current={active ? "page" : undefined}
                      className={clsx(
                        "relative flex items-center gap-3 rounded-md py-2 text-sm font-medium transition",
                        compact ? "justify-center px-0" : "px-3",
                        active ? "bg-white text-lake-deep shadow-sm" : "text-sky/80 hover:bg-white/8 hover:text-white",
                      )}
                    >
                      <item.icon className="h-[18px] w-[18px] shrink-0" />
                      {!compact && <span className="flex-1">{label}</span>}
                      {badge > 0 && (
                        <span className={clsx("rounded-xs px-1.5 py-0.5 text-[10px] font-bold leading-none", compact ? "absolute -right-0.5 -top-0.5" : "", item.badge === "attention" ? "bg-clay text-white" : "bg-white text-lake-deep", active && item.badge === "inbox" && "bg-lake-deep text-white")}>{badge}</span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className={clsx("space-y-0 border-t border-white/10 py-2", compact ? "px-2" : "px-3")}>
        <Link href="/office/settings" title="Settings" className={clsx("flex items-center gap-3 rounded-md py-1.5 text-sm transition", compact ? "justify-center" : "px-3", pathname.startsWith("/office/settings") ? "bg-white text-lake-deep" : "text-sky/80 hover:bg-white/8 hover:text-white")}>
          <Settings className="h-4 w-4 shrink-0" />{!compact && "Settings"}
        </Link>
        <Link href="/" target="_blank" title="View website" className={clsx("flex items-center gap-3 rounded-md py-1.5 text-sm text-sky/80 hover:bg-white/8 hover:text-white", compact ? "justify-center" : "px-3")}>
          <ExternalLink className="h-4 w-4 shrink-0" />{!compact && "View website"}
        </Link>
        <HelpPopover compact={compact} />
        <button type="button" onClick={() => { signOut(); router.push("/office/login"); }} title="Sign out" className={clsx("flex w-full items-center gap-3 rounded-md py-1.5 text-sm text-sky/80 hover:bg-white/8 hover:text-white", compact ? "justify-center" : "px-3")}>
          <LogOut className="h-4 w-4 shrink-0" />{!compact && "Sign out"}
        </button>
        {!compact && <p className="truncate px-3 pt-1 text-[11px] text-sky/50">{user}</p>}
        <button type="button" onClick={toggleRail} className={clsx("hidden w-full items-center gap-3 rounded-md py-1.5 text-xs text-sky/50 hover:bg-white/8 hover:text-white lg:flex", compact ? "justify-center" : "px-3")} title={compact ? "Expand the menu" : "Collapse the menu"}>
          {compact ? <ChevronsRight className="h-4 w-4" /> : <><ChevronsLeft className="h-4 w-4" /> Collapse</>}
        </button>
      </div>
    </div>
  );

  return (
    <div className={clsx("min-h-screen bg-[#f5f6f8] text-ink lg:grid", collapsed ? "lg:grid-cols-[72px_1fr]" : "lg:grid-cols-[248px_1fr]")}>
      <aside ref={railRef} onScroll={(e) => { railScroll = e.currentTarget.scrollTop; }} className="scrollbar-thin hidden bg-lake-deep lg:block lg:sticky lg:top-0 lg:h-screen lg:overflow-y-auto">{sidebar(collapsed)}</aside>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-ink/50" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-72 bg-lake-deep shadow-lift">
            <button type="button" onClick={() => setOpen(false)} className="absolute right-3 top-4 rounded-xs p-1.5 text-white/70 hover:bg-white/10" aria-label="Close menu"><X className="h-5 w-5" /></button>
            {sidebar(false)}
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-ink/5 bg-white/90 px-4 backdrop-blur sm:px-6">
          <button type="button" onClick={() => setOpen(true)} className="rounded-lg p-2 text-ink hover:bg-ink/5 lg:hidden" aria-label="Open menu"><Menu className="h-5 w-5" /></button>
          <div className="min-w-0 flex-1">
            <h1 className="truncate font-display text-lg font-semibold leading-tight">{title}</h1>
            {subtitle && <p className="truncate text-xs text-slate">{subtitle}</p>}
          </div>
          <button type="button" onClick={() => setPalette(true)} className="hidden h-9 w-64 items-center gap-2 rounded-xs bg-[#f5f6f8] px-3 text-sm text-slate ring-1 ring-ink/5 transition hover:ring-ink/20 md:flex">
            <Search className="h-4 w-4" /><span className="flex-1 text-left">Search reservations, guests, units…</span><kbd className="text-[10px]">⌘K</kbd>
          </button>
          <span className="hidden text-sm text-slate xl:block">{fmtDate(today, "long")}</span>
          {actions}
          <AttentionBell items={attention} />
          <NewMenu onPick={setQuick} />
        </header>
        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>

      {quick === "reservation" && <NewReservationModal onClose={() => setQuick(null)} />}
      {quick === "request" && <NewRequestModal onClose={() => setQuick(null)} />}
      {quick === "ooo" && <OutOfOrderModal onClose={() => setQuick(null)} />}
      {quick === "note" && <GuestNoteModal onClose={() => setQuick(null)} />}
      {palette && <CommandPalette onClose={() => setPalette(false)} onNew={() => { setPalette(false); setQuick("reservation"); }} />}
    </div>
  );
}

function unitsLabel(scope: ReturnType<typeof useOfficeScope>) {
  if (scope.property) return cap(scope.property.unitLabel.many);
  const labels = new Set(scope.allProperties.map((p) => p.unitLabel.many));
  return labels.size === 1 ? cap([...labels][0]) : "Units";
}
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/* ---------- property switcher ---------- */

function PropertySwitcher({ compact }: { compact: boolean }) {
  const scope = useOfficeScope();
  const set = useHotel((s) => s.setOfficeProperty);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useOutside(ref, () => setOpen(false), open);
  const multi = scope.allProperties.length > 1;
  const label = scope.all ? (multi ? "All locations" : scope.allProperties[0].name) : scope.property!.name;
  const accent = scope.property?.accent;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => multi && setOpen((o) => !o)}
        aria-haspopup={multi ? "listbox" : undefined}
        aria-expanded={open}
        title={compact ? label : undefined}
        className={clsx("flex w-full items-center gap-2.5 rounded-md bg-white/10 py-2 text-left text-sm font-semibold text-white transition", multi && "hover:bg-white/15", compact ? "justify-center px-0" : "px-3")}
      >
        <span className="flex h-2.5 w-2.5 shrink-0 items-center justify-center">
          {scope.all && multi ? <span className="grid h-2.5 w-2.5 grid-cols-2 gap-px">{scope.allProperties.slice(0, 4).map((p) => <span key={p.id} className="rounded-[1px]" style={{ background: p.accent === "#1b4b73" ? "#9cc4e4" : "#9cd3a6" }} />)}</span> : <span className="h-2.5 w-2.5 rounded-full ring-2 ring-white/60" style={{ background: accent ?? "#fff" }} />}
        </span>
        {!compact && <><span className="flex-1 truncate">{label}</span>{multi && <ChevronDown className={clsx("h-4 w-4 text-sky/70 transition", open && "rotate-180")} />}</>}
      </button>
      {open && (
        <ul role="listbox" className={clsx("absolute z-40 mt-1 w-64 rounded-md bg-white p-1 text-ink shadow-lift ring-1 ring-ink/10", compact ? "left-full top-0 ml-2 mt-0" : "left-0")}>
          <li role="option" aria-selected={scope.all}>
            <button type="button" onClick={() => { set("all"); setOpen(false); }} className={clsx("flex w-full items-center gap-3 rounded-xs px-3 py-2 text-left text-sm hover:bg-ink/5", scope.all && "font-semibold")}>
              <span className="grid h-2.5 w-2.5 grid-cols-2 gap-px">{scope.allProperties.slice(0, 4).map((p) => <span key={p.id} className="rounded-[1px]" style={{ background: p.accent }} />)}</span>
              <span className="flex-1">All locations</span>
              <span className="text-xs text-slate">{scope.allProperties.length}</span>
              {scope.all && <Check className="h-4 w-4 text-lake" />}
            </button>
          </li>
          <li className="my-1 h-px bg-ink/5" />
          {scope.allProperties.map((p) => (
            <li key={p.id} role="option" aria-selected={scope.property?.id === p.id}>
              <button type="button" onClick={() => { set(p.id); setOpen(false); }} className={clsx("flex w-full items-center gap-3 rounded-xs px-3 py-2 text-left text-sm hover:bg-ink/5", scope.property?.id === p.id && "font-semibold")}>
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: p.accent }} />
                <span className="min-w-0 flex-1"><span className="block truncate">{p.name}</span><span className="block truncate text-[11px] font-normal text-slate">{p.kind} · {p.city}</span></span>
                {scope.property?.id === p.id && <Check className="h-4 w-4 text-lake" />}
              </button>
            </li>
          ))}
          <li className="my-1 h-px bg-ink/5" />
          <li><span className="block px-3 py-2 text-xs text-slate">Add a property — in Settings, when the brand grows.</span></li>
        </ul>
      )}
    </div>
  );
}

/* ---------- + New ---------- */

function NewMenu({ onPick }: { onPick: (q: Quick) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useOutside(ref, () => setOpen(false), open);
  const items: { id: Exclude<Quick, null>; label: string; hint: string; icon: typeof Plus }[] = [
    { id: "reservation", label: "Reservation", hint: "Phone, walk-in, email · N", icon: CalendarDays },
    { id: "request", label: "Request", hint: "A WhatsApp, call or DM into the pipeline", icon: MessageSquarePlus },
    { id: "ooo", label: "Out of order", hint: "Take a unit off sale", icon: Wrench },
    { id: "note", label: "Guest note", hint: "Something to remember about a guest", icon: StickyNote },
  ];
  return (
    <div ref={ref} className="relative">
      <button type="button" onClick={() => setOpen((o) => !o)} aria-haspopup="menu" aria-expanded={open} className="inline-flex h-9 items-center gap-1.5 rounded-xs bg-lake px-3.5 text-sm font-semibold text-white transition hover:bg-lake-deep">
        <Plus className="h-4 w-4" /> <span className="hidden sm:inline">New</span> <ChevronDown className={clsx("h-3.5 w-3.5 transition", open && "rotate-180")} />
      </button>
      {open && (
        <ul role="menu" className="absolute right-0 z-40 mt-1 w-72 rounded-md bg-white p-1 shadow-lift ring-1 ring-ink/10">
          {items.map((it) => (
            <li key={it.id} role="none">
              <button type="button" role="menuitem" onClick={() => { setOpen(false); onPick(it.id); }} className="flex w-full items-start gap-3 rounded-xs px-3 py-2 text-left hover:bg-ink/5">
                <it.icon className="mt-0.5 h-4 w-4 text-lake" />
                <span><span className="block text-sm font-semibold text-ink">{it.label}</span><span className="block text-xs text-slate">{it.hint}</span></span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/* ---------- bell ---------- */

function AttentionBell({ items }: { items: ReturnType<typeof attentionItems> }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useOutside(ref, () => setOpen(false), open);
  const urgent = items.filter((i) => i.tone === "clay").length;
  return (
    <div ref={ref} className="relative">
      <button type="button" onClick={() => setOpen((o) => !o)} aria-label={`${items.length} things need attention`} aria-expanded={open} className="relative flex h-9 w-9 items-center justify-center rounded-xs text-ink-soft transition hover:bg-ink/5 hover:text-ink">
        <Bell className="h-[18px] w-[18px]" />
        {items.length > 0 && <span className={clsx("absolute -right-0.5 -top-0.5 min-w-[18px] rounded-xs px-1 py-0.5 text-center text-[10px] font-bold leading-none text-white", urgent ? "bg-clay" : "bg-[#b8860b]")}>{items.length}</span>}
      </button>
      {open && (
        <div className="absolute right-0 z-40 mt-1 w-[22rem] rounded-md bg-white shadow-lift ring-1 ring-ink/10">
          <div className="flex items-center justify-between border-b border-ink/5 px-4 py-2.5"><p className="text-sm font-semibold text-ink">Needs attention</p><Link href="/office" onClick={() => setOpen(false)} className="text-xs font-semibold text-lake">Today →</Link></div>
          <ul className="max-h-80 divide-y divide-ink/5 overflow-y-auto">
            {items.slice(0, 8).map((i) => (
              <li key={i.id}>
                <Link href={i.href} onClick={() => setOpen(false)} className="flex gap-3 px-4 py-2.5 hover:bg-[#fafbfc]">
                  <span className={clsx("mt-1.5 h-2 w-2 shrink-0 rounded-full", i.tone === "clay" ? "bg-clay" : i.tone === "amber" ? "bg-[#d9a03a]" : "bg-line-strong")} />
                  <span className="min-w-0"><span className="block truncate text-sm text-ink">{i.text}</span>{i.detail && <span className="block truncate text-xs text-slate">{i.detail}</span>}</span>
                </Link>
              </li>
            ))}
            {items.length === 0 && <li className="px-4 py-8 text-center text-sm text-slate">All clear.</li>}
          </ul>
        </div>
      )}
    </div>
  );
}

/* ---------- help ---------- */

function HelpPopover({ compact }: { compact: boolean }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useOutside(ref, () => setOpen(false), open);
  return (
    <div ref={ref} className="relative">
      <button type="button" onClick={() => setOpen((o) => !o)} title="Help" className={clsx("flex w-full items-center gap-3 rounded-md py-1.5 text-sm text-sky/80 hover:bg-white/8 hover:text-white", compact ? "justify-center" : "px-3")}>
        <LifeBuoy className="h-4 w-4 shrink-0" />{!compact && "Help"}
      </button>
      {open && (
        <div className="absolute bottom-0 left-full z-40 ml-3 w-72 rounded-md bg-white p-4 text-ink shadow-lift ring-1 ring-ink/10">
          <p className="text-sm font-semibold">Shortcuts</p>
          <ul className="mt-2 space-y-1 text-sm text-ink-soft">
            <li className="flex justify-between"><span>Search anything</span><kbd className="rounded-xs bg-ink/5 px-1.5 text-xs">⌘K</kbd></li>
            <li className="flex justify-between"><span>New reservation</span><kbd className="rounded-xs bg-ink/5 px-1.5 text-xs">N</kbd></li>
            <li className="flex justify-between"><span>Calendar</span><kbd className="rounded-xs bg-ink/5 px-1.5 text-xs">T</kbd></li>
          </ul>
          <p className="mt-3 text-xs text-slate">Demo: the data lives in this browser. Reset it from Settings. Drag works on the calendar, the inbox board and the Today panels — every drag also has a button.</p>
        </div>
      )}
    </div>
  );
}

/* ---------- utils ---------- */

function useOutside(ref: React.RefObject<HTMLElement | null>, onOutside: () => void, active: boolean) {
  const cb = useCallback(onOutside, [onOutside]);
  useEffect(() => {
    if (!active) return;
    const onDown = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) cb(); };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && cb();
    document.addEventListener("mousedown", onDown);
    window.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("mousedown", onDown); window.removeEventListener("keydown", onKey); };
  }, [active, cb, ref]);
}
