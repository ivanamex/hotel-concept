"use client";

import { useEffect, useState } from "react";
import { useT } from "@/i18n/context";
import { RevealGate } from "./motion";
import { VideoLayer } from "./video-layer";

/**
 * The arrival: a film looping at its own pace. The entrance film by default; the brand home passes the brand film.
 * The film comes first; the words and the booking bar (`.hero-words`) fade in a beat after it starts — or after 3 s if no film plays.
 */
export function HeroFilm({ children, caption, video = "/videos/entrance.mp4", image = "/images/house/entrance-poster.jpg", alt }: { children: React.ReactNode; caption?: string; video?: string | string[]; image?: string; alt?: string }) {
  const t = useT();
  const [playing, setPlaying] = useState(false);
  const [show, setShow] = useState(false);
  useEffect(() => {
    const id = setTimeout(() => setShow(true), playing ? 1200 : 3000);
    return () => clearTimeout(id);
  }, [playing]);
  return (
    <section className="relative min-h-[92svh] overflow-hidden bg-ink" data-show={show ? "1" : "0"}>
      <VideoLayer video={video} image={image} alt={alt ?? t.home.heroAlt} drift driftVideo={false} priority onPlaying={() => setPlaying(true)} />
      <div className="absolute inset-0 bg-gradient-to-b from-ink/45 via-ink/10 to-ink/65" />
      <RevealGate.Provider value={show}><div className="relative">{children}</div></RevealGate.Provider>
      <div className="absolute bottom-6 right-6 z-10 hidden sm:block lg:right-12">
        <span className="caps !text-[10px] text-white/70">{caption ?? t.home.heroCaption}</span>
      </div>
    </section>
  );
}
