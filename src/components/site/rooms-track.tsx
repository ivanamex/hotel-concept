"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { chf } from "@/lib/format";
import type { Room } from "@/lib/types";
import { Eyebrow, RuleLink } from "@/components/ui";

/**
 * Horizontal room track the visitor controls: drag, trackpad, arrows, or just keep scrolling down.
 * No scroll hijacking — the page never pins.
 */
export function RoomsTrack({ rooms }: { rooms: Room[] }) {
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
    const card = el.querySelector<HTMLElement>("article");
    const w = (card?.offsetWidth ?? 400) + 20;
    el.scrollBy({ left: dir * w * (window.innerWidth > 1280 ? 2 : 1), behavior: "smooth" });
  };

  // drag to scroll (mouse)
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
      // swallow the click that follows a drag
      const stop = (ev: Event) => { ev.preventDefault(); ev.stopPropagation(); el.removeEventListener("click", stop, true); };
      el.addEventListener("click", stop, true);
      setTimeout(() => el.removeEventListener("click", stop, true), 50);
    }
  };

  return (
    <section className="relative overflow-hidden bg-paper py-16 lg:py-24">
      <div className="flex items-end justify-between gap-6 px-5 sm:px-8 lg:px-12">
        <div className="max-w-xl">
          <Eyebrow className="mb-4">Rooms & suites</Eyebrow>
          <h2 className="font-display text-3xl leading-[1.02] sm:text-4xl lg:text-[2.9rem]">Pick your <em>window.</em></h2>
        </div>
        <div className="hidden items-center gap-2 sm:flex">
          <button type="button" onClick={() => step(-1)} disabled={atStart} aria-label="Previous rooms" className="flex h-11 w-11 items-center justify-center rounded-xs bg-white ring-1 ring-ink/10 transition hover:bg-ink hover:text-white disabled:opacity-30 disabled:hover:bg-white disabled:hover:text-ink"><ArrowLeft className="h-4 w-4" /></button>
          <button type="button" onClick={() => step(1)} disabled={atEnd} aria-label="Next rooms" className="flex h-11 w-11 items-center justify-center rounded-xs bg-white ring-1 ring-ink/10 transition hover:bg-ink hover:text-white disabled:opacity-30 disabled:hover:bg-white disabled:hover:text-ink"><ArrowRight className="h-4 w-4" /></button>
        </div>
      </div>

      <div
        ref={track}
        onMouseDown={onDown}
        onMouseMove={onMove}
        onMouseUp={onUp}
        onMouseLeave={onUp}
        className="hscroll mt-10 flex gap-5 overflow-x-auto px-5 pb-4 sm:px-8 lg:px-12"
      >
        {rooms.map((room, i) => (
          <article key={room.id} className="group relative flex w-[82vw] shrink-0 flex-col overflow-hidden rounded-lg bg-white ring-1 ring-ink/5 sm:w-[52vw] lg:w-[min(34vw,520px)]">
            <Link href={`/rooms/${room.slug}`} draggable={false} className="relative block aspect-[4/3] overflow-hidden">
              <Image src={room.images[0]} alt={room.name} fill draggable={false} sizes="(min-width:1024px) 34vw, (min-width:640px) 52vw, 82vw" className="object-cover transition duration-[1200ms] group-hover:scale-[1.04]" priority={i < 2} />
              <span className="caps absolute left-4 top-4 rounded-xs bg-white/92 px-2 py-1 !text-[10px] text-ink">{room.view} view · {room.sizeM2} m²</span>
            </Link>
            <div className="flex items-end justify-between gap-4 p-5 lg:p-6">
              <div>
                <p className="caps !text-[10px] text-slate">{String(room.number).padStart(2, "0")} · {room.category}</p>
                <h3 className="mt-1.5 font-display text-2xl leading-tight text-ink">{room.name}</h3>
                <p className="mt-1 text-sm text-slate">{room.beds.split("+")[0].trim()} · up to {room.maxGuests}</p>
              </div>
              <div className="text-right">
                <p className="caps !text-[10px] text-slate">from</p>
                <p className="font-display text-2xl text-ink">{chf(room.basePrice * 0.85)}</p>
                <Link href={`/book?room=${room.slug}`} draggable={false} className="caps mt-2 inline-flex items-center gap-1.5 !text-[10px] text-lake hover:text-lake-deep">Book <ArrowRight className="h-3 w-3" /></Link>
              </div>
            </div>
          </article>
        ))}
        <div className="flex w-[70vw] shrink-0 items-center justify-center sm:w-[40vw] lg:w-[24vw]">
          <div className="text-center">
            <p className="font-display text-3xl text-ink">All ten rooms,<br /><em>one lake.</em></p>
            <RuleLink href="/rooms" className="mt-6">See every room</RuleLink>
          </div>
        </div>
      </div>
      <p className="caps mt-2 px-5 !text-[10px] text-slate sm:px-8 lg:px-12">Drag, swipe or use the arrows</p>
    </section>
  );
}
