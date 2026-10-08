import { clsx } from "clsx";
import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

/* ---------- layout ---------- */

export function Container({ className, children, wide }: { className?: string; children: ReactNode; wide?: boolean }) {
  return (
    <div className={clsx("mx-auto w-full px-5 sm:px-8", wide ? "max-w-[1440px]" : "max-w-[1200px]", className)}>
      {children}
    </div>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  lead,
  align = "left",
  className,
  light,
}: {
  eyebrow?: string;
  title: ReactNode;
  lead?: ReactNode;
  align?: "left" | "center";
  className?: string;
  light?: boolean;
}) {
  return (
    <div className={clsx("max-w-2xl", align === "center" && "mx-auto text-center", className)}>
      {eyebrow && (
        <p className={clsx("mb-3 text-xs font-semibold uppercase tracking-[0.18em]", light ? "text-sky" : "text-lake")}>{eyebrow}</p>
      )}
      <h2 className={clsx("font-display text-3xl font-semibold leading-[1.08] sm:text-4xl lg:text-[2.75rem]", light ? "text-white" : "text-ink")}>
        {title}
      </h2>
      {lead && <p className={clsx("mt-4 text-base leading-relaxed sm:text-lg", light ? "text-sky/90" : "text-slate")}>{lead}</p>}
    </div>
  );
}

/* ---------- buttons ---------- */

type Variant = "primary" | "secondary" | "ghost" | "light" | "clay" | "danger";
type Size = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lake/40 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 whitespace-nowrap";
const variants: Record<Variant, string> = {
  primary: "bg-lake text-white hover:bg-lake-deep shadow-[0_8px_20px_-10px_rgba(27,75,115,0.7)] hover:shadow-[0_10px_24px_-10px_rgba(19,57,90,0.8)] hover:-translate-y-px",
  secondary: "bg-transparent text-ink ring-1 ring-inset ring-ink/20 hover:ring-ink/50 hover:bg-white/60",
  ghost: "bg-transparent text-ink hover:bg-ink/5",
  light: "bg-white text-ink hover:bg-paper shadow-soft",
  clay: "bg-clay text-white hover:bg-[#a84d2f]",
  danger: "bg-transparent text-[#b3261e] ring-1 ring-inset ring-[#b3261e]/30 hover:bg-[#b3261e]/5",
};
const sizes: Record<Size, string> = {
  sm: "h-9 px-4 text-sm",
  md: "h-11 px-5 text-[15px]",
  lg: "h-13 px-7 text-base",
};

export function buttonClass(variant: Variant = "primary", size: Size = "md", className?: string) {
  return clsx(base, variants[variant], sizes[size], className);
}

export function Button({
  variant = "primary",
  size = "md",
  className,
  ...props
}: ComponentProps<"button"> & { variant?: Variant; size?: Size }) {
  return <button className={buttonClass(variant, size, className)} {...props} />;
}

export function ButtonLink({
  variant = "primary",
  size = "md",
  className,
  href,
  ...props
}: Omit<ComponentProps<typeof Link>, "href"> & { href: string; variant?: Variant; size?: Size }) {
  return <Link href={href} className={buttonClass(variant, size, className)} {...props} />;
}

/* ---------- small bits ---------- */

export function Badge({ children, tone = "lake", className }: { children: ReactNode; tone?: "lake" | "clay" | "moss" | "ink" | "sand" | "slate"; className?: string }) {
  const tones = {
    lake: "bg-mist text-lake",
    clay: "bg-clay-soft text-clay",
    moss: "bg-moss-soft text-moss",
    ink: "bg-ink text-white",
    sand: "bg-sand text-ink-soft",
    slate: "bg-ink/5 text-slate",
  };
  return (
    <span className={clsx("inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold", tones[tone], className)}>
      {children}
    </span>
  );
}

export function Card({ className, children, as: Tag = "div" }: { className?: string; children: ReactNode; as?: "div" | "article" | "section" }) {
  return <Tag className={clsx("rounded-2xl bg-white shadow-card ring-1 ring-ink/5", className)}>{children}</Tag>;
}

/* ---------- form controls ---------- */

export const inputClass =
  "h-11 w-full rounded-xl border border-line bg-white px-3.5 text-[15px] text-ink placeholder:text-slate/60 transition focus:border-lake focus:outline-none focus:ring-2 focus:ring-lake/15 disabled:bg-sand/60";

export function Field({ label, hint, error, children, className }: { label: string; hint?: string; error?: string; children: ReactNode; className?: string }) {
  return (
    <label className={clsx("block", className)}>
      <span className="mb-1.5 block text-sm font-medium text-ink">{label}</span>
      {children}
      {error ? <span className="mt-1 block text-xs text-[#b3261e]">{error}</span> : hint ? <span className="mt-1 block text-xs text-slate">{hint}</span> : null}
    </label>
  );
}

export function Input({ className, ...props }: ComponentProps<"input">) {
  return <input className={clsx(inputClass, className)} {...props} />;
}

export function Select({ className, children, ...props }: ComponentProps<"select">) {
  return (
    <select className={clsx(inputClass, "appearance-none bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2216%22 height=%2216%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%235b6470%22 stroke-width=%222%22 stroke-linecap=%22round%22 stroke-linejoin=%22round%22><path d=%22m6 9 6 6 6-6%22/></svg>')] bg-[length:16px] bg-[right_12px_center] bg-no-repeat pr-9", className)} {...props}>
      {children}
    </select>
  );
}

export function Textarea({ className, ...props }: ComponentProps<"textarea">) {
  return <textarea className={clsx(inputClass, "h-auto min-h-32 py-3", className)} {...props} />;
}

export function Divider({ className }: { className?: string }) {
  return <hr className={clsx("border-line", className)} />;
}
