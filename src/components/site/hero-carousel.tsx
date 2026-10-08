"use client";

import { clsx } from "clsx";
import { useEffect, useState } from "react";
import { resolveSeason, type Season } from "@/lib/season";
import { useHotel, useHydrated } from "@/lib/store";
import { prefersReducedMotion } from "./motion";
import { VideoLayer } from "./video-layer";

export interface Slide {
  image: string;
  video?: string | string[];
  alt: string;
  caption: string;
}

/* Video paths are optional: add the file to public/videos and the slide switches to video. */
export const SLIDES: Record<Season, Slide[]> = {
  summer: [
    { image: "/images/lake/aerial-dusk.jpg", video: ["/videos/aerial-dusk.mp4"], alt: "The house and its lit garden by the lake at dusk, seen from the air", caption: "Blue hour over the garden" },
    { image: "/images/lake/aerial-day.jpg", video: ["/videos/aerial-day.mp4"], alt: "Maison Vidy from the air: the house, the harbour and the lake at golden hour", caption: "Vidy from above" },
    { image: "/images/lake/hero-lake.jpg", video: "/videos/hero-lake.mp4", alt: "Deck chairs facing Lake Geneva at first light", caption: "The deck, 7 a.m." },
    { image: "/images/lake/marina.jpg", alt: "Port de Vidy in the morning", caption: "Port de Vidy, three minutes away" },
    { image: "/images/house/terrace-dusk.jpg", video: "/videos/terrace-dusk.mp4", alt: "The garden terrace at dusk", caption: "Aperitif on the terrace" },
    { image: "/images/lake/lakeside-path.jpg", alt: "Lakeside path under the plane trees", caption: "The lakeside path to Ouchy" },
  ],
  winter: [
    { image: "/images/lake/aerial-dusk.jpg", video: ["/videos/aerial-dusk.mp4"], alt: "The house and its lit garden by the lake at dusk, seen from the air", caption: "Blue hour over the garden" },
    { image: "/images/lake/swans.jpg", video: "/videos/swans.mp4", alt: "Swans on the lake at blue hour", caption: "The lake in winter" },
    { image: "/images/lake/terrace-view.jpg", alt: "Two chairs on the deck facing the misty Alps", caption: "The Alps, snow on top" },
    { image: "/images/around/old-town-2.jpg", alt: "Lausanne old town at blue hour", caption: "The old town, fifteen minutes away" },
    { image: "/images/rooms/room-attic.jpg", alt: "Attic room with the lamps lit", caption: "Attic Lake, lamps on" },
  ],
};

const INTERVAL = 6500;

export function HeroCarousel({ children }: { children: React.ReactNode }) {
  const hydrated = useHydrated();
  const mode = useHotel((s) => s.settings.seasonOverride);
  const season: Season = hydrated ? resolveSeason(mode) : "summer";
  const slides = SLIDES[season];
  const [index, setIndex] = useState(0);
  const [motion, setMotion] = useState(true);

  useEffect(() => setMotion(!prefersReducedMotion()), []);
  useEffect(() => setIndex(0), [season]);
  useEffect(() => {
    if (!motion) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % slides.length), INTERVAL);
    return () => clearInterval(id);
  }, [motion, slides.length]);

  return (
    <section className="relative min-h-[92svh] overflow-hidden bg-ink">
      {slides.map((s, i) => {
        const active = i === index;
        return (
          <div key={s.image} className={clsx("absolute inset-0 transition-opacity duration-[1600ms] ease-out", active ? "opacity-100" : "opacity-0")} aria-hidden={!active}>
            <VideoLayer video={motion ? s.video : undefined} image={s.image} alt={s.alt} drift={motion && active} priority={i === 0} />
          </div>
        );
      })}
      <div className="absolute inset-0 bg-gradient-to-b from-ink/45 via-ink/15 to-ink/60" />

      <div className="relative">{children}</div>

      {/* slide index */}
      <div className="absolute bottom-6 right-6 z-10 hidden items-center gap-3 sm:flex lg:right-12">
        <span className="caps !text-[10px] text-white/70">{slides[index].caption}</span>
        <div className="flex gap-1.5">
          {slides.map((s, i) => (
            <button key={s.image} type="button" onClick={() => setIndex(i)} aria-label={`Slide ${i + 1}`} className={clsx("h-px w-8 bg-white transition-opacity", i === index ? "opacity-100" : "opacity-35 hover:opacity-70")} />
          ))}
        </div>
      </div>
    </section>
  );
}
