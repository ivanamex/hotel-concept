import { clsx } from "clsx";
import { ArrowRight } from "lucide-react";
import { Link } from "@/components/site/link";
import type { ComponentProps, ReactNode } from "react";

/* ---------- layout ---------- */

export function Container({ className, children, wide }: { className?: string; children: ReactNode; wide?: boolean }) {
  return (
    <div className={clsx("mx-auto w-full px-5 sm:px-8 lg:px-12", wide ? "max-w-[1480px]" : "max-w-[1240px]", className)}>
      {children}
    </div>
  );
}

export function Eyebrow({ children, light, className }: { children: ReactNode; light?: boolean; className?: string }) {
  return <p className={clsx("caps", light ? "text-sky" : "text-lake", className)}>{children}</p>;
}

export function SectionHeading({
  eyebrow,
  title,
  lead,
  align = "left",
  className,
  light,
  size = "md",
}: {
  eyebrow?: string;
  title: ReactNode;
  lead?: ReactNode;
  align?: "left" | "center";
  className?: string;
  light?: boolean;
  size?: "md" | "lg";
}) {
  return (
    <div className={clsx("max-w-2xl", align === "center" && "mx-auto text-center", className)}>
      {eyebrow && <Eyebrow light={light} className="mb-4">{eyebrow}</Eyebrow>}
      <h2
        className={clsx(
          "font-display leading-[1.02]",
          size === "lg" ? "text-4xl sm:text-5xl lg:text-[3.75rem]" : "text-3xl sm:text-4xl lg:text-[2.9rem]",
          light ? "text-white" : "text-ink",
        )}
      >
        {title}
      </h2>
      {lead && <p className={clsx("mt-5 text-base leading-relaxed sm:text-lg", light ? "text-sky/90" : "text-slate")}>{lead}</p>}
    </div>
  );
}

/* ---------- buttons: square "ticket" ---------- */

type Variant = "primary" | "secondary" | "ghost" | "light" | "outline-light" | "clay" | "danger";
type Size = "sm" | "md" | "lg";

const base =
  "ticket sweep inline-flex items-center justify-center gap-3 rounded-xs font-caps uppercase tracking-[0.16em] font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lake/40 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 whitespace-nowrap";
const variants: Record<Variant, string> = {
  primary: "bg-lake text-white [--sweep:var(--color-lake-deep)]",
  secondary: "bg-transparent text-ink ring-1 ring-inset ring-ink/40 hover:text-white hover:ring-ink [--sweep:var(--color-ink)]",
  ghost: "bg-transparent text-ink [--sweep:rgba(23,26,31,0.06)]",
  light: "bg-white text-ink [--sweep:var(--color-sand)]",
  "outline-light": "bg-transparent text-white ring-1 ring-inset ring-white/60 hover:text-ink hover:ring-white [--sweep:#fff]",
  clay: "bg-clay text-white [--sweep:#a84d2f]",
  danger: "bg-transparent text-[#b3261e] ring-1 ring-inset ring-[#b3261e]/40 hover:text-white [--sweep:#b3261e]",
};
const sizes: Record<Size, string> = {
  sm: "h-9 px-4 text-[10.5px]",
  md: "h-12 px-6 text-[11.5px]",
  lg: "h-14 px-8 text-[12px]",
};

export function buttonClass(variant: Variant = "primary", size: Size = "md", className?: string) {
  return clsx(base, variants[variant], sizes[size], className);
}

export function Button({
  variant = "primary",
  size = "md",
  className,
  arrow,
  children,
  ...props
}: ComponentProps<"button"> & { variant?: Variant; size?: Size; arrow?: boolean }) {
  return (
    <button className={buttonClass(variant, size, className)} {...props}>
      {children}
      {arrow && <ArrowRight className="arrow h-3.5 w-3.5" />}
    </button>
  );
}

export function ButtonLink({
  variant = "primary",
  size = "md",
  className,
  href,
  arrow,
  children,
  ...props
}: Omit<ComponentProps<typeof Link>, "href"> & { href: string; variant?: Variant; size?: Size; arrow?: boolean }) {
  return (
    <Link href={href} className={buttonClass(variant, size, className)} {...props}>
      {children}
      {arrow && <ArrowRight className="arrow h-3.5 w-3.5" />}
    </Link>
  );
}

/** Secondary action: text with a rule that draws on hover. */
export function RuleLink({ href, children, className, light, external }: { href: string; children: ReactNode; className?: string; light?: boolean; external?: boolean }) {
  const cls = clsx("rule-link caps", light ? "text-white" : "text-ink", className);
  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener" className={cls}>
        {children} <ArrowRight className="h-3.5 w-3.5" />
      </a>
    );
  }
  return (
    <Link href={href} className={cls}>
      {children} <ArrowRight className="h-3.5 w-3.5" />
    </Link>
  );
}

/* ---------- small bits ---------- */

export function Badge({ children, tone = "lake", className }: { children: ReactNode; tone?: "lake" | "clay" | "moss" | "ink" | "sand" | "slate" | "white"; className?: string }) {
  const tones = {
    lake: "bg-mist text-lake",
    clay: "bg-clay-soft text-clay",
    moss: "bg-moss-soft text-moss",
    ink: "bg-ink text-white",
    sand: "bg-sand text-ink-soft",
    slate: "bg-ink/5 text-slate",
    white: "bg-white/92 text-ink",
  };
  return (
    <span className={clsx("caps inline-flex items-center gap-1 rounded-xs px-2 py-1 !text-[10px]", tones[tone], className)}>
      {children}
    </span>
  );
}

export function Card({ className, children, as: Tag = "div" }: { className?: string; children: ReactNode; as?: "div" | "article" | "section" }) {
  return <Tag className={clsx("rounded-lg bg-white shadow-card ring-1 ring-ink/5", className)}>{children}</Tag>;
}

/* ---------- form controls ---------- */

export const inputClass =
  "h-11 w-full rounded-xs border border-line bg-white px-3.5 text-[15px] text-ink placeholder:text-slate/60 transition focus:border-lake focus:outline-none focus:ring-2 focus:ring-lake/15 disabled:bg-sand/60";

export function Field({ label, hint, error, children, className }: { label: string; hint?: string; error?: string; children: ReactNode; className?: string }) {
  return (
    <label className={clsx("block", error && "is-error", className)}>
      <span className="caps mb-2 block !text-[10.5px] text-ink-soft">{label}</span>
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
    <select className={clsx(inputClass, "select-chevron", className)} {...props}>
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
