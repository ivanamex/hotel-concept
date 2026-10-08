"use client";

import { clsx } from "clsx";
import {
  BedDouble,
  CalendarDays,
  ClipboardList,
  ExternalLink,
  Inbox,
  LayoutDashboard,
  LogOut,
  Menu,
  Plus,
  Settings,
  Tags,
  Users,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { Mark } from "@/components/site/logo";
import { fmtDate } from "@/lib/format";
import { todayISO } from "@/lib/engine";
import { useHotel, useHydrated } from "@/lib/store";
import { NewReservationModal } from "./new-reservation";

const NAV = [
  { href: "/office", label: "Overview", icon: LayoutDashboard },
  { href: "/office/reservations", label: "Reservations", icon: ClipboardList },
  { href: "/office/calendar", label: "Calendar", icon: CalendarDays },
  { href: "/office/rooms", label: "Rooms", icon: BedDouble },
  { href: "/office/rates", label: "Rates & extras", icon: Tags },
  { href: "/office/guests", label: "Guests", icon: Users },
  { href: "/office/inbox", label: "Inbox", icon: Inbox },
  { href: "/office/settings", label: "Settings", icon: Settings },
];

export function OfficeShell({ children, title, subtitle, actions }: { children: ReactNode; title: string; subtitle?: string; actions?: ReactNode }) {
  const hydrated = useHydrated();
  const user = useHotel((s) => s.officeUser);
  const signOut = useHotel((s) => s.signOut);
  const unread = useHotel((s) => s.inquiries.filter((i) => i.status === "new").length);
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [newRes, setNewRes] = useState(false);

  useEffect(() => {
    if (hydrated && !user) router.replace("/office/login");
  }, [hydrated, user, router]);

  useEffect(() => setOpen(false), [pathname]);

  if (!hydrated || !user) {
    return <div className="flex min-h-screen items-center justify-center bg-[#f5f6f8] text-sm text-slate">Loading the office…</div>;
  }

  const Sidebar = (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2.5 px-5 py-5">
        <Mark light />
        <div>
          <p className="font-display text-base font-semibold leading-tight text-white">Maison Vidy</p>
          <p className="text-[11px] uppercase tracking-[0.16em] text-sky/70">Back office</p>
        </div>
      </div>
      <nav className="mt-2 flex-1 space-y-0.5 px-3" aria-label="Office">
        {NAV.map((item) => {
          const active = item.href === "/office" ? pathname === "/office" : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
                active ? "bg-white/12 text-white" : "text-sky/80 hover:bg-white/8 hover:text-white",
              )}
            >
              <item.icon className="h-4.5 w-4.5" />
              <span className="flex-1">{item.label}</span>
              {item.href === "/office/inbox" && unread > 0 && (
                <span className="rounded-full bg-clay px-1.5 py-0.5 text-[10px] font-bold text-white">{unread}</span>
              )}
            </Link>
          );
        })}
      </nav>
      <div className="space-y-1 border-t border-white/10 p-3">
        <Link href="/" target="_blank" className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-sky/80 hover:bg-white/8 hover:text-white">
          <ExternalLink className="h-4 w-4" /> View website
        </Link>
        <button type="button" onClick={() => { signOut(); router.push("/office/login"); }} className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm text-sky/80 hover:bg-white/8 hover:text-white">
          <LogOut className="h-4 w-4" /> Sign out
        </button>
        <p className="truncate px-3 pt-1 text-[11px] text-sky/50">{user}</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f5f6f8] text-ink lg:grid lg:grid-cols-[248px_1fr]">
      <aside className="hidden bg-lake-deep lg:block lg:sticky lg:top-0 lg:h-screen">{Sidebar}</aside>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-ink/50" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-72 bg-lake-deep shadow-lift">
            <button type="button" onClick={() => setOpen(false)} className="absolute right-3 top-4 rounded-full p-1.5 text-white/70 hover:bg-white/10" aria-label="Close menu"><X className="h-5 w-5" /></button>
            {Sidebar}
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
          <span className="hidden text-sm text-slate md:block">{fmtDate(todayISO(), "long")}</span>
          {actions}
          <button type="button" onClick={() => setNewRes(true)} className="inline-flex h-9 items-center gap-1.5 rounded-full bg-lake px-3.5 text-sm font-semibold text-white hover:bg-lake-deep">
            <Plus className="h-4 w-4" /> <span className="hidden sm:inline">New reservation</span>
          </button>
        </header>
        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>

      {newRes && <NewReservationModal onClose={() => setNewRes(false)} />}
    </div>
  );
}
