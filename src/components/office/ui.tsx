"use client";

import { clsx } from "clsx";
import { X } from "lucide-react";
import { useEffect, type ReactNode } from "react";
import { STATUS_LABEL } from "@/lib/format";
import type { InquiryStatus, ReservationStatus } from "@/lib/types";

export function Panel({ children, className, title, action }: { children: ReactNode; className?: string; title?: string; action?: ReactNode }) {
  return (
    <section className={clsx("rounded-2xl bg-white ring-1 ring-ink/5", className)}>
      {(title || action) && (
        <div className="flex items-center justify-between gap-3 border-b border-ink/5 px-5 py-3.5">
          {title && <h2 className="font-display text-[15px] font-semibold text-ink">{title}</h2>}
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

export function Kpi({ label, value, hint, tone = "ink" }: { label: string; value: ReactNode; hint?: ReactNode; tone?: "ink" | "lake" | "moss" | "clay" }) {
  const tones = { ink: "text-ink", lake: "text-lake", moss: "text-moss", clay: "text-clay" };
  return (
    <div className="rounded-2xl bg-white p-4 ring-1 ring-ink/5 sm:p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate">{label}</p>
      <p className={clsx("mt-2 font-display text-2xl font-semibold tabular-nums sm:text-[1.75rem]", tones[tone])}>{value}</p>
      {hint && <p className="mt-1 text-xs text-slate">{hint}</p>}
    </div>
  );
}

const STATUS_TONE: Record<ReservationStatus, string> = {
  pending: "bg-[#fff3e0] text-[#8a5a00]",
  confirmed: "bg-mist text-lake",
  checked_in: "bg-moss-soft text-moss",
  checked_out: "bg-ink/5 text-slate",
  cancelled: "bg-[#fdecea] text-[#9f2f24]",
};

export function StatusChip({ status }: { status: ReservationStatus }) {
  return <span className={clsx("inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold", STATUS_TONE[status])}>
    <span className="h-1.5 w-1.5 rounded-full bg-current" />{STATUS_LABEL[status]}
  </span>;
}

export function InquiryChip({ status }: { status: InquiryStatus }) {
  const map = { new: "bg-[#fff3e0] text-[#8a5a00]", replied: "bg-mist text-lake", closed: "bg-ink/5 text-slate" };
  const label = { new: "New", replied: "Replied", closed: "Closed" };
  return <span className={clsx("inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold", map[status])}>{label[status]}</span>;
}

export function SourceChip({ source }: { source: string }) {
  const label: Record<string, string> = { direct: "Direct", "booking.com": "Booking.com", expedia: "Expedia", phone: "Phone", "walk-in": "Walk-in", email: "Email" };
  return <span className={clsx("inline-flex rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset", source === "direct" ? "bg-moss-soft text-moss ring-moss/20" : "bg-white text-slate ring-line")}>{label[source] ?? source}</span>;
}

export function Drawer({ open, onClose, title, children, width = "max-w-xl" }: { open: boolean; onClose: () => void; title: ReactNode; children: ReactNode; width?: string }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-ink/40" onClick={onClose} />
      <div className={clsx("absolute inset-y-0 right-0 flex w-full flex-col bg-white shadow-lift", width)} role="dialog" aria-modal="true">
        <div className="flex items-center justify-between gap-3 border-b border-ink/5 px-5 py-4">
          <div className="min-w-0">{title}</div>
          <button type="button" onClick={onClose} className="rounded-full p-2 text-slate hover:bg-ink/5" aria-label="Close"><X className="h-5 w-5" /></button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-5">{children}</div>
      </div>
    </div>
  );
}

export function Modal({ open, onClose, title, children, width = "max-w-2xl" }: { open: boolean; onClose: () => void; title: ReactNode; children: ReactNode; width?: string }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-6">
      <div className="absolute inset-0 bg-ink/40" onClick={onClose} />
      <div className={clsx("relative flex max-h-[92vh] w-full flex-col rounded-t-2xl bg-white shadow-lift sm:rounded-2xl", width)} role="dialog" aria-modal="true">
        <div className="flex items-center justify-between gap-3 border-b border-ink/5 px-5 py-4">
          <div className="min-w-0">{title}</div>
          <button type="button" onClick={onClose} className="rounded-full p-2 text-slate hover:bg-ink/5" aria-label="Close"><X className="h-5 w-5" /></button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-5">{children}</div>
      </div>
    </div>
  );
}

export const th = "px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-slate";
export const td = "px-4 py-3 text-sm text-ink align-middle";

export function Toggle({ on, onChange, label }: { on: boolean; onChange: (v: boolean) => void; label?: string }) {
  return (
    <button type="button" role="switch" aria-checked={on} aria-label={label} onClick={() => onChange(!on)} className={clsx("relative h-6 w-11 shrink-0 rounded-full transition", on ? "bg-lake" : "bg-ink/15")}>
      <span className={clsx("absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition", on ? "left-[22px]" : "left-0.5")} />
    </button>
  );
}

export function EmptyState({ title, text }: { title: string; text?: string }) {
  return (
    <div className="px-5 py-12 text-center">
      <p className="font-display text-lg font-semibold text-ink">{title}</p>
      {text && <p className="mt-1 text-sm text-slate">{text}</p>}
    </div>
  );
}
