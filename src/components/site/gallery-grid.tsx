"use client";

import { clsx } from "clsx";
import Image from "next/image";
import { useMemo, useState } from "react";
import { useT } from "@/i18n/context";
import { Lightbox } from "./lightbox";

interface Item { src: string; alt: string; cat: string; w: number; h: number }
const CATS = ["All", "Rooms", "House", "Lake", "Lausanne"];

export function GalleryGrid({ items: raw }: { items: Item[] }) {
  const t = useT();
  const items = useMemo(() => raw.map((i) => ({ ...i, alt: t.gallery.alts[i.src] ?? i.alt })), [raw, t]);
  const [cat, setCat] = useState("All");
  const [index, setIndex] = useState<number | null>(null);
  const list = useMemo(() => (cat === "All" ? items : items.filter((i) => i.cat === cat)), [items, cat]);

  return (
    <>
      <div className="flex flex-wrap gap-2">
        {CATS.map((c) => (
          <button key={c} type="button" onClick={() => setCat(c)} className={clsx("caps rounded-xs px-3.5 py-2 !text-[10px] ring-1 ring-inset transition", cat === c ? "bg-ink text-white ring-ink" : "bg-white text-ink-soft ring-line hover:ring-ink/40")}>{t.gallery.cats[c] ?? c}</button>
        ))}
      </div>
      <div className="mt-8 columns-1 gap-4 sm:columns-2 lg:columns-3">
        {list.map((it, i) => (
          <button key={it.src + i} type="button" onClick={() => setIndex(i)} className="group relative mb-4 block w-full overflow-hidden rounded-lg" style={{ aspectRatio: `${it.w} / ${it.h}` }}>
            <Image src={it.src} alt={it.alt} fill sizes="(min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw" className="object-cover transition duration-700 group-hover:scale-[1.03]" />
            <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/70 to-transparent p-4 text-left text-sm text-white opacity-0 transition group-hover:opacity-100">{it.alt}</span>
          </button>
        ))}
      </div>
      <Lightbox images={list} index={index} onClose={() => setIndex(null)} onIndex={setIndex} />
    </>
  );
}
