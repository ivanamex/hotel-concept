import { ArrowUpRight, BedDouble, Maximize2, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { chf } from "@/lib/format";
import type { Room } from "@/lib/types";
import { Badge } from "@/components/ui";

export function RoomCard({ room, priority = false }: { room: Room; priority?: boolean }) {
  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-card ring-1 ring-ink/5 transition duration-300 hover:-translate-y-1 hover:shadow-lift">
      <Link href={`/rooms/${room.slug}`} className="relative block aspect-[4/3] overflow-hidden">
        <Image
          src={room.images[0]}
          alt={room.name}
          fill
          priority={priority}
          sizes="(min-width: 1024px) 400px, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition duration-700 group-hover:scale-[1.04]"
        />
        <div className="absolute left-3 top-3 flex gap-2">
          <Badge tone={room.view === "Lake" ? "lake" : room.view === "Garden" ? "moss" : "sand"}>{room.view} view</Badge>
        </div>
      </Link>
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate">{room.category} · Room {room.number}</p>
            <h3 className="mt-1 font-display text-xl font-semibold text-ink">{room.name}</h3>
          </div>
          <div className="text-right">
            <p className="text-[11px] uppercase tracking-wider text-slate">from</p>
            <p className="font-display text-lg font-semibold text-ink">{chf(room.basePrice * 0.85)}</p>
          </div>
        </div>
        <p className="mt-2 text-sm leading-relaxed text-slate">{room.summary}</p>
        <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-ink-soft">
          <li className="inline-flex items-center gap-1.5"><Maximize2 className="h-3.5 w-3.5 text-lake" /> {room.sizeM2} m²</li>
          <li className="inline-flex items-center gap-1.5"><BedDouble className="h-3.5 w-3.5 text-lake" /> {room.beds.split("+")[0].trim()}</li>
          <li className="inline-flex items-center gap-1.5"><Users className="h-3.5 w-3.5 text-lake" /> up to {room.maxGuests}</li>
        </ul>
        <div className="mt-5 flex items-center justify-between border-t border-line pt-4">
          <Link href={`/rooms/${room.slug}`} className="inline-flex items-center gap-1 text-sm font-semibold text-lake hover:text-lake-deep">
            View room <ArrowUpRight className="h-4 w-4" />
          </Link>
          <Link href={`/book?room=${room.slug}`} className="rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white transition hover:bg-lake">
            Book
          </Link>
        </div>
      </div>
    </article>
  );
}
