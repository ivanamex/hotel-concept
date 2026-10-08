import { ArrowRight, BedDouble, Maximize2, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { chf } from "@/lib/format";
import type { Room } from "@/lib/types";
import { Badge } from "@/components/ui";

export function RoomCard({ room, priority = false }: { room: Room; priority?: boolean }) {
  return (
    <article className="group flex flex-col overflow-hidden rounded-lg bg-white ring-1 ring-ink/5 transition duration-300 hover:shadow-lift">
      <Link href={`/rooms/${room.slug}`} className="relative block aspect-[4/3] overflow-hidden">
        <Image src={room.images[0]} alt={room.name} fill priority={priority} sizes="(min-width: 1024px) 400px, (min-width: 640px) 50vw, 100vw" className="object-cover transition duration-[1200ms] group-hover:scale-[1.04]" />
        <div className="absolute left-3 top-3"><Badge tone="white">{room.view} view · {room.sizeM2} m²</Badge></div>
      </Link>
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="caps !text-[10px] text-slate">{String(room.number).padStart(2, "0")} · {room.category}</p>
            <h3 className="mt-1.5 font-display text-2xl leading-tight text-ink">{room.name}</h3>
          </div>
          <div className="text-right">
            <p className="caps !text-[10px] text-slate">from</p>
            <p className="font-display text-xl text-ink">{chf(room.basePrice * 0.85)}</p>
          </div>
        </div>
        <p className="mt-2 text-sm leading-relaxed text-slate">{room.summary}</p>
        <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-ink-soft">
          <li className="inline-flex items-center gap-1.5"><Maximize2 className="h-3.5 w-3.5 text-lake" /> {room.sizeM2} m²</li>
          <li className="inline-flex items-center gap-1.5"><BedDouble className="h-3.5 w-3.5 text-lake" /> {room.beds.split("+")[0].trim()}</li>
          <li className="inline-flex items-center gap-1.5"><Users className="h-3.5 w-3.5 text-lake" /> up to {room.maxGuests}</li>
        </ul>
        <div className="mt-5 flex items-center justify-between border-t border-line pt-4">
          <Link href={`/rooms/${room.slug}`} className="rule-link caps !text-[10px] text-ink">View room <ArrowRight className="h-3 w-3" /></Link>
          <Link href={`/book?room=${room.slug}`} className="ticket caps inline-flex items-center gap-2 rounded-xs bg-ink px-4 py-2.5 !text-[10px] text-white transition hover:bg-lake">Book <ArrowRight className="arrow h-3 w-3" /></Link>
        </div>
      </div>
    </article>
  );
}
