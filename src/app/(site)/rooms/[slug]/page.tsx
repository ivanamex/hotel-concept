import { BedDouble, Building2, Check, Eye, Maximize2, Users } from "lucide-react";
import type { Metadata } from "next";
import { NextPage } from "@/components/site/bands";
import Link from "next/link";
import { notFound } from "next/navigation";
import { RoomCard } from "@/components/site/room-card";
import { RoomGallery } from "@/components/site/room-gallery";
import { RoomPriceCard } from "@/components/site/room-price-card";
import { Badge, Container } from "@/components/ui";
import { HOTEL, ROOMS } from "@/lib/seed";

export function generateStaticParams() {
  return ROOMS.map((r) => ({ slug: r.slug }));
}

export async function generateMetadata({ params }: PageProps<"/rooms/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const room = ROOMS.find((r) => r.slug === slug);
  if (!room) return {};
  return { title: room.name, description: room.summary, openGraph: { images: [{ url: room.images[0] }] } };
}

export default async function RoomPage({ params }: PageProps<"/rooms/[slug]">) {
  const { slug } = await params;
  const room = ROOMS.find((r) => r.slug === slug);
  if (!room) notFound();
  const others = ROOMS.filter((r) => r.id !== room.id && (r.view === room.view || r.category === room.category)).slice(0, 3);
  const fallbackOthers = others.length >= 3 ? others : [...others, ...ROOMS.filter((r) => r.id !== room.id && !others.includes(r))].slice(0, 3);

  const facts = [
    { icon: Maximize2, label: `${room.sizeM2} m²` },
    { icon: BedDouble, label: room.beds },
    { icon: Users, label: `up to ${room.maxGuests} guest${room.maxGuests > 1 ? "s" : ""}` },
    { icon: Eye, label: `${room.view} view` },
    { icon: Building2, label: room.floor === 1 ? "Ground floor" : `Floor ${room.floor - 1}` },
  ];

  return (
    <>
      <section className="pt-10 sm:pt-14 lg:pt-20">
        <Container>
          <nav className="caps mb-6 !text-[10px] text-slate" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-ink">Maison Vidy</Link> <span className="mx-2">/</span> <Link href="/rooms" className="hover:text-ink">Rooms & suites</Link> <span className="mx-2">/</span> <span className="text-ink">{room.name}</span>
          </nav>
          <RoomGallery images={room.images} name={room.name} />
        </Container>
      </section>

      <section className="py-12 sm:py-16">
        <Container className="grid gap-12 lg:grid-cols-[1fr_380px] lg:gap-16">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone={room.view === "Lake" ? "lake" : room.view === "Garden" ? "moss" : "sand"}>{room.view} view</Badge>
              <Badge tone="slate">{room.category} · Room {room.number}</Badge>
            </div>
            <h1 className="mt-5 font-display text-5xl leading-[1.0] text-ink sm:text-6xl">{room.name}</h1>
            <p className="mt-3 text-lg text-slate">{room.summary}</p>

            <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-3 border-y border-line py-5 text-sm text-ink-soft">
              {facts.map((f) => (
                <li key={f.label} className="inline-flex items-center gap-2"><f.icon className="h-4 w-4 text-lake" /> {f.label}</li>
              ))}
            </ul>

            <p className="mt-8 text-[17px] leading-relaxed text-ink-soft">{room.description}</p>

            <h2 className="mt-12 font-display text-3xl text-ink">In the <em>room</em></h2>
            <ul className="mt-4 grid gap-2.5 sm:grid-cols-2">
              {room.features.map((f) => (
                <li key={f} className="flex items-center gap-2.5 text-[15px] text-ink-soft"><Check className="h-4 w-4 shrink-0 text-moss" /> {f}</li>
              ))}
            </ul>

            <h2 className="mt-12 font-display text-3xl text-ink">Good <em>to know</em></h2>
            <dl className="mt-4 grid gap-4 sm:grid-cols-2">
              {[
                ["Check-in / out", `From ${HOTEL.checkIn} · until ${HOTEL.checkOut}. Late check-out until 14:00 on request (CHF 60).`],
                ["Breakfast", `CHF ${HOTEL.breakfastPrice} per person, half price for children; included in the bed & breakfast rate.`],
                ["Children", room.maxGuests > 2 ? "Cot and high chair free of charge. Sofa bed for one child." : "Cot on request for babies up to two years; the room is best for two."],
                ["House rules", "No smoking. Dogs welcome in garden and courtyard rooms. Quiet from 22:00."],
              ].map(([t, d]) => (
                <div key={t} className="rounded-md bg-white p-4 ring-1 ring-ink/5">
                  <dt className="text-sm font-semibold text-ink">{t}</dt>
                  <dd className="mt-1 text-sm leading-relaxed text-slate">{d}</dd>
                </div>
              ))}
            </dl>
          </div>
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <RoomPriceCard room={room} />
          </aside>
        </Container>
      </section>

      <section className="bg-paper py-16 sm:py-20">
        <Container>
          <h2 className="font-display text-3xl text-ink sm:text-4xl">Other rooms <em>you may like</em></h2>
          <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {fallbackOthers.map((r) => (
              <RoomCard key={r.id} room={r} />
            ))}
          </div>
        </Container>
      </section>
      <NextPage current="/rooms" />
    </>
  );
}
