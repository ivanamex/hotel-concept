import { Link } from "./link";

export function Crumb({ current, light = false }: { current: string; light?: boolean }) {
  return (
    <nav aria-label="Breadcrumb" className={`caps mb-5 flex items-center gap-2 !text-[10px] ${light ? "text-white/70" : "text-slate"}`}>
      <Link href="/" className={light ? "hover:text-white" : "hover:text-ink"}>Maison Vidy</Link>
      <span aria-hidden="true">/</span>
      <span className={light ? "text-white" : "text-ink"}>{current}</span>
    </nav>
  );
}
