import { BedDouble, Building2, Check, Eye, Maximize2, Users } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NextPage } from "@/components/site/bands";
import { Link } from "@/components/site/link";
import { RoomCard } from "@/components/site/room-card";
import { RoomGallery } from "@/components/site/room-gallery";
import { RoomPriceCard } from "@/components/site/room-price-card";
import { Badge, Container } from "@/components/ui";
import { fmt, getDict, localizeRoom, viewLabel } from "@/i18n";
import { pageMeta, type LangSlugParams } from "@/i18n/meta";
import { Rich } from "@/i18n/rich";
import { HOTEL, ROOMS } from "@/lib/seed";

export function generateStaticParams() {
  return ROOMS.map((r) => ({ slug: r.slug }));
}

export async function generateMetadata({ params }: LangSlugParams): Promise<Metadata> {
  const { lang, slug } = await params;
  const t = getDict(lang);
  const base = ROOMS.find((r) => r.slug === slug);
  if (!base) return {};
  const room = localizeRoom(base, t);
  return pageMeta(lang, `/rooms/${slug}`, { title: room.name, description: room.summary, image: room.images[0] });
}

export default async function RoomPage({ params }: LangSlugParams) {
  const { lang, slug } = await params;
  const t = getDict(lang);
  const base = ROOMS.find((r) => r.slug === slug);
  if (!base) notFound();
  const room = localizeRoom(base, t);
  const others = ROOMS.filter((r) => r.id !== room.id && (r.view === room.view || r.category === base.category)).slice(0, 3);
  const fallbackOthers = others.length >= 3 ? others : [...others, ...ROOMS.filter((r) => r.id !== room.id && !others.includes(r))].slice(0, 3);
  const d = t.rooms.detail;

  const facts = [
    { icon: Maximize2, label: `${room.sizeM2} m²` },
    { icon: BedDouble, label: room.beds },
    { icon: Users, label: `${t.common.upTo} ${room.maxGuests}` },
    { icon: Eye, label: viewLabel(room.view, t) },
    { icon: Building2, label: room.floor === 1 ? t.common.floorGround : `${t.common.floor} ${room.floor - 1}` },
  ];

  return (
    <>
      <section className="pt-10 sm:pt-14 lg:pt-20">
        <Container>
          <nav className="caps mb-6 !text-[10px] text-slate" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-ink">Maison Vidy</Link> <span className="mx-2">/</span> <Link href="/rooms" className="hover:text-ink">{t.nav.items.rooms.label}</Link> <span className="mx-2">/</span> <span className="text-ink">{room.name}</span>
          </nav>
          <RoomGallery images={room.images} name={room.name} />
        </Container>
      </section>

      <section className="py-12 sm:py-16">
        <Container className="grid gap-12 lg:grid-cols-[1fr_380px] lg:gap-16">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone={room.view === "Lake" ? "lake" : room.view === "Garden" ? "moss" : "sand"}>{viewLabel(room.view, t)}</Badge>
              <Badge tone="slate">{room.category} · {t.rooms.roomN} {room.number}</Badge>
            </div>
            <h1 className="mt-5 font-display text-5xl leading-[1.0] text-ink sm:text-6xl">{room.name}</h1>
            <p className="mt-3 text-lg text-slate">{room.summary}</p>

            <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-3 border-y border-line py-5 text-sm text-ink-soft">
              {facts.map((f) => (
                <li key={f.label} className="inline-flex items-center gap-2"><f.icon className="h-4 w-4 text-lake" /> {f.label}</li>
              ))}
            </ul>

            <p className="mt-8 text-[17px] leading-relaxed text-ink-soft">{room.description}</p>

            <h2 className="mt-12 font-display text-3xl text-ink"><Rich text={d.inTheRoom} /></h2>
            <ul className="mt-4 grid gap-2.5 sm:grid-cols-2">
              {room.features.map((f) => (
                <li key={f} className="flex items-center gap-2.5 text-[15px] text-ink-soft"><Check className="h-4 w-4 shrink-0 text-moss" /> {f}</li>
              ))}
            </ul>

            <h2 className="mt-12 font-display text-3xl text-ink"><Rich text={d.goodToKnow} /></h2>
            <dl className="mt-4 grid gap-4 sm:grid-cols-2">
              {[
                [d.checkInOut, fmt(d.checkInOutText, { in: HOTEL.checkIn, out: HOTEL.checkOut })],
                [d.breakfast, fmt(d.breakfastText, { p: HOTEL.breakfastPrice })],
                [d.childrenTitle, room.maxGuests > 2 ? d.childrenBig : d.childrenSmall],
                [d.rules, d.rulesText],
              ].map(([k, v]) => (
                <div key={k} className="rounded-md bg-white p-4 ring-1 ring-ink/5">
                  <dt className="text-sm font-semibold text-ink">{k}</dt>
                  <dd className="mt-1 text-sm leading-relaxed text-slate">{v}</dd>
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
          <h2 className="font-display text-3xl text-ink sm:text-4xl"><Rich text={d.others} /></h2>
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
