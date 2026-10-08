"use client";

import { Expand } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { Lightbox } from "./lightbox";

export function RoomGallery({ images, name }: { images: string[]; name: string }) {
  const [index, setIndex] = useState<number | null>(null);
  const items = images.map((src, i) => ({ src, alt: `${name} — photo ${i + 1}` }));
  const rest = images.slice(1, 4);

  return (
    <>
      <div className="grid gap-3 lg:grid-cols-[2fr_1fr]">
        <button type="button" onClick={() => setIndex(0)} className="group relative aspect-[4/3] overflow-hidden rounded-lg lg:aspect-auto lg:min-h-[520px]">
          <Image src={images[0]} alt={items[0].alt} fill priority sizes="(min-width:1024px) 66vw, 100vw" className="object-cover transition duration-700 group-hover:scale-[1.03]" />
          <span className="absolute bottom-4 right-4 caps inline-flex items-center gap-1.5 rounded-xs bg-white/90 px-3 py-1.5 !text-[10px] text-ink">
            <Expand className="h-3.5 w-3.5" /> {images.length} photos
          </span>
        </button>
        <div className="grid grid-cols-3 gap-3 lg:grid-cols-1">
          {rest.map((src, i) => (
            <button key={src + i} type="button" onClick={() => setIndex(i + 1)} className="group relative aspect-[4/3] overflow-hidden rounded-lg">
              <Image src={src} alt={items[i + 1].alt} fill sizes="(min-width:1024px) 33vw, 33vw" className="object-cover transition duration-700 group-hover:scale-[1.04]" />
            </button>
          ))}
        </div>
      </div>
      <Lightbox images={items} index={index} onClose={() => setIndex(null)} onIndex={setIndex} />
    </>
  );
}
