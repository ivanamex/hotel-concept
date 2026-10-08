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

/* One continuous hero film per season (clips stitched with soft crossfades, fast → slower → slowest).
   A missing file falls back to the still with a slow push-in. */
export const SLIDES: Record<Season, Slide[]> = {
  summer: [
    { image: "/images/lake/aerial-dusk.jpg", video: ["/videos/hero.mp4", "/videos/aerial-dusk.mp4"], alt: "Maison Vidy from the air at dusk, the terrace lit, the lake at first light", caption: "Vidy, from the air to the water" },
  ],
  winter: [
    { image: "/images/lake/aerial-dusk.jpg", video: ["/videos/hero-winter.mp4", "/videos/hero.mp4", "/videos/aerial-dusk.mp4"], alt: "Maison Vidy from the air at dusk, the lake in winter light", caption: "Vidy in winter" },
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
            <VideoLayer video={motion ? s.video : undefined} image={s.image} alt={s.alt} drift={motion && active} driftVideo={false} priority={i === 0} />
          </div>
        );
      })}
      <div className="absolute inset-0 bg-gradient-to-b from-ink/45 via-ink/15 to-ink/60" />

      <div className="relative">{children}</div>

      {/* slide index */}
      <div className="absolute bottom-6 right-6 z-10 hidden items-center gap-3 sm:flex lg:right-12">
        <span className="caps !text-[10px] text-white/70">{slides[index].caption}</span>
        <div className={clsx("flex gap-1.5", slides.length < 2 && "hidden")}>
          {slides.map((s, i) => (
            <button key={s.image} type="button" onClick={() => setIndex(i)} aria-label={`Slide ${i + 1}`} className={clsx("h-px w-8 bg-white transition-opacity", i === index ? "opacity-100" : "opacity-35 hover:opacity-70")} />
          ))}
        </div>
      </div>
    </section>
  );
}
