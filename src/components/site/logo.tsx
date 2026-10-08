import { clsx } from "clsx";
import Link from "next/link";

export function Mark({ className, light }: { className?: string; light?: boolean }) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" className={clsx("h-8 w-8", className)}>
      <rect x="1" y="1" width="30" height="30" rx="2" className={light ? "fill-white" : "fill-lake"} />
      <path d="M7 19.5c2.2 0 2.2-2 4.5-2s2.3 2 4.5 2 2.3-2 4.5-2 2.3 2 4.5 2" fill="none" strokeWidth="2.2" strokeLinecap="round" className={light ? "stroke-lake" : "stroke-white"} />
      <path d="M9 13.5l7-5 7 5" fill="none" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={light ? "stroke-lake" : "stroke-white"} />
    </svg>
  );
}

export function Logo({ light, className, href = "/" }: { light?: boolean; className?: string; href?: string }) {
  return (
    <Link href={href} className={clsx("group inline-flex items-center gap-2.5", className)} aria-label="Maison Vidy — home">
      <Mark light={light} />
      <span className={clsx("whitespace-nowrap font-display text-[1.6rem] tracking-tight", light ? "text-white" : "text-ink")}>
        Maison <em>Vidy</em>
      </span>
    </Link>
  );
}
