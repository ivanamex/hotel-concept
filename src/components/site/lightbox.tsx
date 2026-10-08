"use client";

import { ChevronLeft, ChevronRight, X } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect } from "react";
import { useT } from "@/i18n/context";

export interface LightboxImage {
  src: string;
  alt: string;
}

export function Lightbox({ images, index, onClose, onIndex }: { images: LightboxImage[]; index: number | null; onClose: () => void; onIndex: (i: number) => void }) {
  const t = useT();
  const open = index !== null;
  const prev = useCallback(() => onIndex(((index ?? 0) - 1 + images.length) % images.length), [index, images.length, onIndex]);
  const next = useCallback(() => onIndex(((index ?? 0) + 1) % images.length), [index, images.length, onIndex]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose, prev, next]);

  if (!open) return null;
  const img = images[index];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-ink/95 p-4" role="dialog" aria-modal="true" aria-label={img.alt} onClick={onClose}>
      <button type="button" onClick={onClose} className="rise absolute right-4 top-4 z-10 rounded-xs bg-white/10 p-2 text-white hover:bg-white hover:text-ink" aria-label={t.common.close}>
        <X className="h-5 w-5" />
      </button>
      <button type="button" onClick={(e) => { e.stopPropagation(); prev(); }} className="rise absolute left-3 top-1/2 z-10 -translate-y-1/2 rounded-xs bg-white/10 p-2 text-white hover:bg-white hover:text-ink sm:left-6" aria-label={t.common.previous}>
        <ChevronLeft className="h-6 w-6" />
      </button>
      <button type="button" onClick={(e) => { e.stopPropagation(); next(); }} className="rise absolute right-3 top-1/2 z-10 -translate-y-1/2 rounded-xs bg-white/10 p-2 text-white hover:bg-white hover:text-ink sm:right-6" aria-label={t.common.next}>
        <ChevronRight className="h-6 w-6" />
      </button>
      {/* key on the index restarts the push-in and the caption for every photo */}
      <div key={index} className="relative flex h-full w-full max-w-6xl flex-col items-center justify-center" onClick={(e) => e.stopPropagation()}>
        <div className="lb-frame relative h-[78vh] w-full overflow-hidden rounded-lg">
          <Image src={img.src} alt={img.alt} fill sizes="100vw" className="lb-push object-contain" />
        </div>
        <div className="mt-5 flex w-full items-end justify-between gap-6 px-1">
          <p className="write-in is-visible font-script text-3xl leading-none text-white/90 sm:text-4xl">{img.alt}</p>
          <p className="caps shrink-0 !text-[10px] text-white/60">{index + 1} / {images.length}</p>
        </div>
      </div>
    </div>
  );
}
