"use client";

import { clsx } from "clsx";
import Image from "next/image";
import { useEffect, useState } from "react";
import { prefersReducedMotion } from "./motion";

/**
 * Still image underneath, video fades in on top once it is really playing.
 * Missing file, slow network, reduced motion or a browser without the codec → the still stays.
 */
export function VideoLayer({ video, image, alt, drift = false, driftVideo = true, priority = false, className }: { video?: string | string[]; image: string; alt: string; drift?: boolean; driftVideo?: boolean; priority?: boolean; className?: string }) {
  const [src, setSrc] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);
  const candidates = (Array.isArray(video) ? video : video ? [video] : []).join("|");

  useEffect(() => {
    if (!candidates || prefersReducedMotion()) return;
    let on = true;
    (async () => {
      for (const v of candidates.split("|")) {
        try {
          const r = await fetch(v, { method: "HEAD" });
          if (r.ok && (r.headers.get("content-type") ?? "").startsWith("video")) {
            if (on) setSrc(v);
            return;
          }
        } catch {}
      }
    })();
    return () => {
      on = false;
    };
  }, [candidates]);
  const enabled = !!src;

  return (
    <div className={clsx("absolute inset-0 overflow-hidden", className)}>
      <Image src={image} alt={alt} fill priority={priority} sizes="100vw" className={clsx("object-cover", drift && !playing && "drift")} />
      {enabled && (
        <video
          className={clsx("absolute inset-0 h-full w-full object-cover transition-opacity duration-1000", playing ? "opacity-100" : "opacity-0", drift && driftVideo && "drift-slow")}
          src={src ?? undefined}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          onPlaying={() => setPlaying(true)}
          onError={() => setSrc(null)}
        />
      )}
    </div>
  );
}
