"use client";

import { clsx } from "clsx";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { useT } from "@/i18n/context";

/**
 * Horizontal carousel: swipe on touch, drag or arrows on desktop, snap to items.
 * `heading` sits left, the arrows and `link` ("See all") right.
 */
export function Carousel({ heading, link, children, itemClass, className }: { heading: ReactNode; link?: ReactNode; children: ReactNode[]; itemClass: string; className?: string }) {
  const t = useT();
  const track = useRef<HTMLDivElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);
  const drag = useRef<{ x: number; left: number; moved: boolean } | null>(null);

  const update = useCallback(() => {
    const el = track.current;
    if (!el) return;
    setAtStart(el.scrollLeft <= 4);
    setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    const el = track.current;
    if (!el) return;
    update();
    el.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      el.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [update]);

  const step = (dir: 1 | -1) => {
    const el = track.current;
    if (!el) return;
    const first = el.firstElementChild as HTMLElement | null;
    const gap = parseFloat(getComputedStyle(el).columnGap || "20") || 20;
    const w = (first?.offsetWidth ?? 320) + gap;
    el.scrollBy({ left: dir * w, behavior: "smooth" });
  };

  const onDown = (e: React.MouseEvent) => {
    const el = track.current;
    if (!el || e.button !== 0) return;
    drag.current = { x: e.clientX, left: el.scrollLeft, moved: false };
    el.classList.add("is-dragging");
  };
  const onMove = (e: React.MouseEvent) => {
    const el = track.current;
    if (!el || !drag.current) return;
    const dx = e.clientX - drag.current.x;
    if (Math.abs(dx) > 4) drag.current.moved = true;
    el.scrollLeft = drag.current.left - dx;
  };
  const onUp = () => {
    const el = track.current;
    if (!el) return;
    el.classList.remove("is-dragging");
    const moved = drag.current?.moved;
    drag.current = null;
    if (moved) {
      const stop = (ev: Event) => {
        ev.preventDefault();
        ev.stopPropagation();
        el.removeEventListener("click", stop, true);
      };
      el.addEventListener("click", stop, true);
      setTimeout(() => el.removeEventListener("click", stop, true), 50);
    }
  };

  const arrow = "rise flex h-11 w-11 items-center justify-center rounded-xs bg-white ring-1 ring-ink/10 hover:bg-ink hover:text-white disabled:opacity-30 disabled:hover:bg-white disabled:hover:text-ink";

  return (
    <div className={className}>
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        {heading}
        <div className="flex items-center gap-5 self-start sm:self-end">
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => step(-1)} disabled={atStart} aria-label={t.common.previous} className={arrow}><ArrowLeft className="h-4 w-4" /></button>
            <button type="button" onClick={() => step(1)} disabled={atEnd} aria-label={t.common.next} className={arrow}><ArrowRight className="h-4 w-4" /></button>
          </div>
          {link}
        </div>
      </div>
      <div
        ref={track}
        onMouseDown={onDown}
        onMouseMove={onMove}
        onMouseUp={onUp}
        onMouseLeave={onUp}
        className="carousel mt-12 flex gap-5 overflow-x-auto pb-3 pt-2 [scrollbar-width:none]"
      >
        {children.map((child, i) => (
          <div key={i} className={clsx("shrink-0 snap-start", itemClass)}>
            {child}
          </div>
        ))}
      </div>
    </div>
  );
}
