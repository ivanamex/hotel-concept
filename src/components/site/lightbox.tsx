"use client";

import { ChevronLeft, ChevronRight, X } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect } from "react";

export interface LightboxImage {
  src: string;
  alt: string;
}

export function Lightbox({ images, index, onClose, onIndex }: { images: LightboxImage[]; index: number | null; onClose: () => void; onIndex: (i: number) => void }) {
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
      <button type="button" onClick={onClose} className="absolute right-4 top-4 rounded-xs bg-white/10 p-2 text-white hover:bg-white/20" aria-label="Close">
        <X className="h-5 w-5" />
      </button>
      <button type="button" onClick={(e) => { e.stopPropagation(); prev(); }} className="absolute left-3 top-1/2 -translate-y-1/2 rounded-xs bg-white/10 p-2 text-white hover:bg-white/20 sm:left-6" aria-label="Previous">
        <ChevronLeft className="h-6 w-6" />
      </button>
      <button type="button" onClick={(e) => { e.stopPropagation(); next(); }} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-xs bg-white/10 p-2 text-white hover:bg-white/20 sm:right-6" aria-label="Next">
        <ChevronRight className="h-6 w-6" />
      </button>
      <div className="relative h-full w-full max-w-6xl" onClick={(e) => e.stopPropagation()}>
        <Image src={img.src} alt={img.alt} fill sizes="100vw" className="object-contain" />
      </div>
      <p className="absolute bottom-5 left-1/2 -translate-x-1/2 text-sm text-white/70">
        {img.alt} · {index + 1} / {images.length}
      </p>
    </div>
  );
}
