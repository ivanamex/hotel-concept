"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowDown, ArrowLeft, ArrowRight } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Eyebrow, RuleLink } from "@/components/ui";
import { localizeRoom, viewLabel } from "@/i18n";
import { useT } from "@/i18n/context";
import { Rich } from "@/i18n/rich";
import { chf } from "@/lib/format";
import type { Room } from "@/lib/types";
import { Link } from "./link";
import { prefersReducedMotion, scrollTo } from "./motion";

gsap.registerPlugin(ScrollTrigger);

/** The page scrolls, the rooms slide past. Vertical scroll is shorter than the track, so it passes quickly. */
const PACE = 0.72;

/**
 * Desktop: the section pins and the track scrubs sideways with the page scroll —
 * arrows jump a room at a time, "Skip" drops to the next section.
 * Below lg: a native swipe track.
 */
export function RoomsTrack({ rooms }: { rooms: Room[] }) {
  const t = useT();
  const r = t.home.rooms;
  const section = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const bar = useRef<HTMLDivElement>(null);
  const st = useRef<ScrollTrigger | null>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const el = section.current;
    const tr = track.current;
    if (!el || !tr || prefersReducedMotion()) return;
    const mm = gsap.matchMedia();
    mm.add("(min-width: 1024px)", () => {
      const distance = () => Math.max(0, tr.scrollWidth - window.innerWidth + 48);
      const tween = gsap.to(tr, {
        x: () => -distance(),
        ease: "none",
        scrollTrigger: {
          trigger: el,
          start: "top top",
          end: () => `+=${Math.round(distance() * PACE)}`,
          pin: true,
          scrub: 0.5,
          invalidateOnRefresh: true,
          anticipatePin: 1,
          onUpdate: (self) => {
            setProgress(self.progress);
            if (bar.current) bar.current.style.transform = `scaleX(${self.progress})`;
          },
        },
      });
      st.current = tween.scrollTrigger ?? null;
      return () => {
        tween.scrollTrigger?.kill();
        tween.kill();
        st.current = null;
      };
    });
    return () => mm.revert();
  }, []);

  /** Jump one room left or right by scrolling the page the matching amount. */
  const nudge = (dir: 1 | -1) => {
    const s = st.current;
    const tr = track.current;
    if (!s || !tr) return;
    const card = tr.querySelector<HTMLElement>("article");
    const step = (card?.offsetWidth ?? 480) + 20;
    const distance = tr.scrollWidth - window.innerWidth + 48;
    const current = s.progress * distance;
    const next = gsap.utils.clamp(0, distance, Math.round(current / step) * step + dir * step);
    scrollTo(s.start + (next / distance) * (s.end - s.start));
  };

  /** Drop to whatever comes after the rooms. */
  const skip = () => {
    const s = st.current;
    const el = section.current;
    if (!s || !el) return;
    scrollTo(s.end + el.offsetHeight);
  };

  return (
    <section ref={section} className="relative overflow-hidden bg-paper">
      <div className="flex items-end justify-between gap-6 px-5 pt-16 sm:px-8 lg:px-12 lg:pt-14">
        <div className="max-w-xl">
          <Eyebrow className="mb-4">{r.eyebrow}</Eyebrow>
          <h2 className="font-display text-3xl leading-[1.02] sm:text-4xl lg:text-[2.9rem]"><Rich text={r.title} /></h2>
        </div>
        <div className="hidden items-center gap-5 lg:flex">
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => nudge(-1)} disabled={progress <= 0.001} aria-label={r.prev} className="flex h-11 w-11 items-center justify-center rounded-xs bg-white ring-1 ring-ink/10 transition hover:bg-ink hover:text-white disabled:opacity-30 disabled:hover:bg-white disabled:hover:text-ink"><ArrowLeft className="h-4 w-4" /></button>
            <button type="button" onClick={() => nudge(1)} disabled={progress >= 0.999} aria-label={r.next} className="flex h-11 w-11 items-center justify-center rounded-xs bg-white ring-1 ring-ink/10 transition hover:bg-ink hover:text-white disabled:opacity-30 disabled:hover:bg-white disabled:hover:text-ink"><ArrowRight className="h-4 w-4" /></button>
          </div>
          <button type="button" onClick={skip} className="caps inline-flex items-center gap-2 !text-[10px] text-slate transition hover:text-ink">
            {r.skip} <ArrowDown className="h-3.5 w-3.5" />
          </button>
        </div>
        <p className="caps !text-[10px] text-slate lg:hidden">{r.swipe}</p>
      </div>

      {/* progress line (desktop) */}
      <div className="mx-5 mt-6 hidden h-px bg-ink/10 sm:mx-8 lg:mx-12 lg:block">
        <div ref={bar} className="h-px origin-left bg-ink" style={{ transform: "scaleX(0)" }} />
      </div>

      <div
        ref={track}
        className="hscroll mt-8 flex gap-5 overflow-x-auto px-5 pb-16 sm:px-8 lg:mt-6 lg:h-[calc(100vh-13.5rem)] lg:items-stretch lg:overflow-visible lg:px-12 lg:pb-10"
      >
        {rooms.map((base, i) => {
          const room = localizeRoom(base, t);
          return (
          <article key={room.id} className="group relative flex w-[82vw] shrink-0 flex-col overflow-hidden rounded-lg bg-white ring-1 ring-ink/5 sm:w-[52vw] lg:w-[min(36vw,540px)]">
            <Link href={`/rooms/${room.slug}`} draggable={false} className="relative block aspect-[4/3] overflow-hidden lg:aspect-auto lg:flex-1">
              <Image src={room.images[0]} alt={room.name} fill draggable={false} sizes="(min-width:1024px) 36vw, (min-width:640px) 52vw, 82vw" className="object-cover transition duration-[1200ms] group-hover:scale-[1.04]" priority={i < 2} />
              <span className="caps absolute left-4 top-4 rounded-xs bg-white/92 px-2 py-1 !text-[10px] text-ink">{viewLabel(room.view, t)} · {room.sizeM2} m²</span>
            </Link>
            <div className="flex items-end justify-between gap-4 p-5 lg:p-6">
              <div>
                <p className="caps !text-[10px] text-slate">{String(room.number).padStart(2, "0")} · {room.category}</p>
                <h3 className="mt-1.5 font-display text-2xl leading-tight text-ink">{room.name}</h3>
                <p className="mt-1 text-sm text-slate">{room.beds.split("+")[0].trim()} · {t.common.upTo} {room.maxGuests}</p>
              </div>
              <div className="text-right">
                <p className="caps !text-[10px] text-slate">{t.common.from}</p>
                <p className="font-display text-2xl text-ink">{chf(room.basePrice * 0.85)}</p>
                <Link href={`/book?room=${room.slug}`} draggable={false} className="caps mt-2 inline-flex items-center gap-1.5 !text-[10px] text-lake hover:text-lake-deep">{t.common.book} <ArrowRight className="h-3 w-3" /></Link>
              </div>
            </div>
          </article>
          );
        })}
        <div className="flex w-[70vw] shrink-0 items-center justify-center sm:w-[40vw] lg:w-[26vw]">
          <div className="text-center">
            <p className="font-display text-3xl text-ink"><Rich text={r.allTitle} /></p>
            <RuleLink href="/rooms" className="mt-6">{r.all}</RuleLink>
          </div>
        </div>
      </div>
    </section>
  );
}
