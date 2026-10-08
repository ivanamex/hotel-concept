"use client";

import { clsx } from "clsx";
import Image from "next/image";
import { useEffect, useState } from "react";
import { prefersReducedMotion } from "./motion";

/**
 * Still image underneath, video fades in on top once it is really playing.
 * Missing file, slow network, reduced motion or a browser without the codec → the still stays.
 */
export function VideoLayer({ video, image, alt, drift = false, priority = false, className }: { video?: string; image: string; alt: string; drift?: boolean; priority?: boolean; className?: string }) {
  const [enabled, setEnabled] = useState(false);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (!video || prefersReducedMotion()) return;
    let on = true;
    fetch(video, { method: "HEAD" })
      .then((r) => on && setEnabled(r.ok && (r.headers.get("content-type") ?? "").startsWith("video")))
      .catch(() => on && setEnabled(false));
    return () => {
      on = false;
    };
  }, [video]);

  return (
    <div className={clsx("absolute inset-0 overflow-hidden", className)}>
      <Image src={image} alt={alt} fill priority={priority} sizes="100vw" className={clsx("object-cover", drift && !playing && "drift")} />
      {enabled && (
        <video
          className={clsx("absolute inset-0 h-full w-full object-cover transition-opacity duration-1000", playing ? "opacity-100" : "opacity-0")}
          src={video}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          onPlaying={() => setPlaying(true)}
          onError={() => setEnabled(false)}
        />
      )}
    </div>
  );
}
