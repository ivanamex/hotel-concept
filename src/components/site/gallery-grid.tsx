"use client";

import { clsx } from "clsx";
import Image from "next/image";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useT } from "@/i18n/context";
import { Lightbox } from "./lightbox";
import { prefersReducedMotion } from "./motion";

gsap.registerPlugin(ScrollTrigger);

interface Item { src: string; alt: string; cat: string; w: number; h: number }
const CATS = ["All", "Rooms", "House", "Lake", "Lausanne"];
/** Each column starts a little lower or higher and drifts a fixed number of pixels while the wall scrolls past. */
const DRIFT: [number, number][] = [
  [60, -240],
  [240, -20],
  [0, -320],
];

/** A column that drifts by a fixed amount (px) over the scroll of its parent grid. */
function Drift({ from, to, children, className }: { from: number; to: number; children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion() || from === to) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(el, { y: from }, { y: to, ease: "none", scrollTrigger: { trigger: el.parentElement, start: "top 85%", end: "bottom 15%", scrub: 0.8 } });
    });
    return () => ctx.revert();
  }, [from, to]);
  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}

/** Balance items into N columns by height (shortest column takes the next item). */
function columns<T extends { w: number; h: number }>(items: T[], n: number): { item: T; index: number }[][] {
  const cols: { item: T; index: number }[][] = Array.from({ length: n }, () => []);
  const heights = Array(n).fill(0);
  items.forEach((item, index) => {
    const c = heights.indexOf(Math.min(...heights));
    cols[c].push({ item, index });
    heights[c] += item.h / item.w;
  });
  return cols;
}

function useColumnCount() {
  const [n, setN] = useState(3);
  useEffect(() => {
    const mq2 = window.matchMedia("(min-width: 640px)");
    const mq3 = window.matchMedia("(min-width: 1024px)");
    const update = () => setN(mq3.matches ? 3 : mq2.matches ? 2 : 1);
    update();
    mq2.addEventListener("change", update);
    mq3.addEventListener("change", update);
    return () => {
      mq2.removeEventListener("change", update);
      mq3.removeEventListener("change", update);
    };
  }, []);
  return n;
}

/** Darkroom: a print sits faint until it enters the screen, then develops into colour. */
function Print({ item, index, onOpen, delay }: { item: Item; index: number; onOpen: (i: number) => void; delay: number }) {
  const ref = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (prefersReducedMotion()) {
      el.classList.add("is-developed");
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          el.classList.add("is-developed");
          io.disconnect();
        }
      },
      { threshold: 0.35 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <button
      ref={ref}
      type="button"
      onClick={() => onOpen(index)}
      className="print group lift relative block w-full overflow-hidden rounded-lg bg-ink/5"
      style={{ aspectRatio: `${item.w} / ${item.h}`, transitionDelay: `${delay}ms` }}
    >
      <Image src={item.src} alt={item.alt} fill sizes="(min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw" className="object-cover transition duration-[1400ms] group-hover:scale-[1.04]" />
      <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/70 to-transparent p-4 text-left text-sm text-white opacity-0 transition duration-500 group-hover:opacity-100">{item.alt}</span>
    </button>
  );
}

export function GalleryGrid({ items: raw }: { items: Item[] }) {
  const t = useT();
  const items = useMemo(() => raw.map((i) => ({ ...i, alt: t.gallery.alts[i.src] ?? i.alt })), [raw, t]);
  const [cat, setCat] = useState("All");
  const [index, setIndex] = useState<number | null>(null);
  const list = useMemo(() => (cat === "All" ? items : items.filter((i) => i.cat === cat)), [items, cat]);
  const n = useColumnCount();
  const cols = useMemo(() => columns(list, n), [list, n]);

  return (
    <>
      <div className="flex flex-wrap gap-2">
        {CATS.map((c) => (
          <button key={c} type="button" onClick={() => setCat(c)} className={clsx("rise caps rounded-xs px-3.5 py-2 !text-[10px] ring-1 ring-inset", cat === c ? "bg-ink text-white ring-ink" : "bg-white text-ink-soft ring-line hover:ring-ink/40")}>{t.gallery.cats[c] ?? c}</button>
        ))}
      </div>
      <div key={`${cat}-${n}`} className={clsx("mt-12 grid gap-4 pb-32", n === 1 ? "grid-cols-1" : n === 2 ? "grid-cols-2" : "grid-cols-3")}>
        {cols.map((col, c) => (
          <Drift key={c} from={n === 1 ? 0 : DRIFT[c % DRIFT.length][0]} to={n === 1 ? 0 : DRIFT[c % DRIFT.length][1]} className="flex flex-col gap-4">
            {col.map(({ item, index: i }, r) => (
              <Print key={item.src + i} item={item} index={i} onOpen={setIndex} delay={(r % 3) * 120 + c * 80} />
            ))}
          </Drift>
        ))}
      </div>
      <Lightbox images={list} index={index} onClose={() => setIndex(null)} onIndex={setIndex} />
    </>
  );
}
