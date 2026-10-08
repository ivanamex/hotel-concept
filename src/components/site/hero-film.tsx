"use client";

import { clsx } from "clsx";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { prefersReducedMotion } from "./motion";

/**
 * The arrival: the entrance film plays once (door, hall, the lake through the windows),
 * then holds its last frame with a slow push-in. Still with push-in when video can't play.
 */
export function HeroFilm({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [state, setState] = useState<"still" | "playing" | "held">("still");

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const v = ref.current;
    if (!v) return;
    const onPlaying = () => setState("playing");
    const onEnded = () => setState("held");
    const onError = () => setState("still");
    v.addEventListener("playing", onPlaying);
    v.addEventListener("ended", onEnded);
    v.addEventListener("error", onError);
    v.play().catch(() => setState("still"));
    return () => {
      v.removeEventListener("playing", onPlaying);
      v.removeEventListener("ended", onEnded);
      v.removeEventListener("error", onError);
    };
  }, []);

  return (
    <section className="relative min-h-[92svh] overflow-hidden bg-ink">
      <div className="absolute inset-0">
        <Image src="/images/house/entrance-poster.jpg" alt="The front door of Maison Vidy opening onto the hall and the lake" fill priority sizes="100vw" className={clsx("object-cover", state === "still" && "drift")} />
        <video
          ref={ref}
          className={clsx("absolute inset-0 h-full w-full object-cover transition-opacity duration-700", state === "still" ? "opacity-0" : "opacity-100", state === "held" && "drift-slow")}
          src="/videos/entrance.mp4"
          poster="/images/house/entrance-poster.jpg"
          autoPlay
          muted
          playsInline
          preload="auto"
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-b from-ink/45 via-ink/10 to-ink/65" />
      <div className="relative">{children}</div>
      <div className="absolute bottom-6 right-6 z-10 hidden sm:block lg:right-12">
        <span className="caps !text-[10px] text-white/70">{state === "held" ? "You’re in. The lake is at the end of the hall." : "Chemin du Lac 12, Vidy"}</span>
      </div>
    </section>
  );
}
