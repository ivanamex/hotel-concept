"use client";

import { useT } from "@/i18n/context";
import { VideoLayer } from "./video-layer";

/** The arrival: the entrance film, looping at its own pace — exactly as it played in the band. */
export function HeroFilm({ children, caption }: { children: React.ReactNode; caption?: string }) {
  const t = useT();
  return (
    <section className="relative min-h-[92svh] overflow-hidden bg-ink">
      <VideoLayer video="/videos/entrance.mp4" image="/images/house/entrance-poster.jpg" alt={t.home.heroAlt} drift driftVideo={false} priority />
      <div className="absolute inset-0 bg-gradient-to-b from-ink/45 via-ink/10 to-ink/65" />
      <div className="relative">{children}</div>
      <div className="absolute bottom-6 right-6 z-10 hidden sm:block lg:right-12">
        <span className="caps !text-[10px] text-white/70">{caption ?? t.home.heroCaption}</span>
      </div>
    </section>
  );
}
