"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowRight, MoveRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { chf } from "@/lib/format";
import type { Room } from "@/lib/types";
import { Eyebrow, RuleLink } from "@/components/ui";
import { prefersReducedMotion } from "./motion";

gsap.registerPlugin(ScrollTrigger);

/** Pinned horizontal track on desktop; a plain vertical list below lg. */
export function RoomsTrack({ rooms }: { rooms: Room[] }) {
  const section = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = section.current;
    const tr = track.current;
    if (!el || !tr || prefersReducedMotion()) return;
    const mm = gsap.matchMedia();
    mm.add("(min-width: 1024px)", () => {
      const distance = () => tr.scrollWidth - window.innerWidth + 64;
      const tween = gsap.to(tr, {
        x: () => -distance(),
        ease: "none",
        scrollTrigger: {
          trigger: el,
          start: "top top",
          end: () => `+=${distance()}`,
          pin: true,
          scrub: 0.6,
          invalidateOnRefresh: true,
          anticipatePin: 1,
        },
      });
      return () => tween.scrollTrigger?.kill();
    });
    return () => mm.revert();
  }, []);

  return (
    <section ref={section} className="relative overflow-hidden bg-paper">
      <div className="flex items-end justify-between px-5 pt-16 sm:px-8 lg:px-12 lg:pt-20">
        <div className="max-w-xl">
          <Eyebrow className="mb-4">Rooms & suites</Eyebrow>
          <h2 className="font-display text-3xl leading-[1.02] sm:text-4xl lg:text-[2.9rem]">Pick your <em>window.</em></h2>
        </div>
        <p className="caps hidden items-center gap-2 !text-[10px] text-slate lg:flex">
          Keep scrolling <MoveRight className="h-4 w-4" />
        </p>
      </div>

      <div ref={track} className="mt-10 flex flex-col gap-6 px-5 pb-16 sm:px-8 lg:h-[calc(100vh-11rem)] lg:flex-row lg:items-stretch lg:gap-5 lg:px-12 lg:pb-12">
        {rooms.map((room, i) => (
          <article key={room.id} className="group relative flex shrink-0 flex-col overflow-hidden rounded-lg bg-white ring-1 ring-ink/5 lg:w-[min(38vw,560px)]">
            <Link href={`/rooms/${room.slug}`} className="relative block aspect-[4/3] overflow-hidden lg:aspect-auto lg:flex-1">
              <Image src={room.images[0]} alt={room.name} fill sizes="(min-width:1024px) 38vw, 100vw" className="object-cover transition duration-[1200ms] group-hover:scale-[1.04]" priority={i < 2} />
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
                <p className="font-display text-xl text-ink">{chf(room.basePrice * 0.85)}</p>
                <Link href={`/book?room=${room.slug}`} className="caps mt-2 inline-flex items-center gap-1.5 !text-[10px] text-lake hover:text-lake-deep">Book <ArrowRight className="h-3 w-3" /></Link>
              </div>
            </div>
          </article>
        ))}
        <div className="flex shrink-0 items-center justify-center lg:w-[24vw]">
          <div className="text-center">
            <p className="font-display text-3xl text-ink">All ten rooms,<br /><em>one lake.</em></p>
            <RuleLink href="/rooms" className="mt-6">See every room</RuleLink>
          </div>
        </div>
      </div>
    </section>
  );
}
