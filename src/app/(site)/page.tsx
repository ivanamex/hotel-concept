import { ArrowRight, BadgeCheck, CalendarCheck, Coffee, MessageCircle, Quote, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { BookingBar } from "@/components/site/booking-bar";
import { RoomCard } from "@/components/site/room-card";
import { whatsappUrl } from "@/components/site/whatsapp";
import { Badge, ButtonLink, Container, SectionHeading } from "@/components/ui";
import { AROUND, OFFERS } from "@/lib/content";
import { HOTEL, REVIEWS, ROOMS } from "@/lib/seed";

const PERKS = [
  { icon: BadgeCheck, title: "Best rate, guaranteed", text: "Booking here is always the lowest price. Find it cheaper elsewhere and we match it." },
  { icon: CalendarCheck, title: "Free cancellation", text: "Flexible rates can be cancelled until 48 hours before arrival." },
  { icon: Coffee, title: "Breakfast your way", text: "Add it to your rate or decide each morning. Terrace, salon or your balcony." },
  { icon: MessageCircle, title: "Concierge on WhatsApp", text: "Tables, tickets, boats, babysitters. One message, we take it from there." },
];

export default function HomePage() {
  const featured = [ROOMS[2], ROOMS[5], ROOMS[6]];

  return (
    <>
      {/* HERO */}
      <section className="relative min-h-[92svh] overflow-hidden">
        <Image
          src="/images/lake/hero-lake.jpg"
          alt="Lake Geneva from the terrace of Maison Vidy at golden hour"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-ink/55 via-ink/20 to-ink/55" />
        <Container className="relative flex min-h-[92svh] flex-col justify-end pb-24 pt-32 sm:pb-14">
          <div className="max-w-3xl">
            <p className="fade-up mb-4 text-xs font-semibold uppercase tracking-[0.22em] text-sky">
              Vidy · Lausanne · ten rooms by the lake
            </p>
            <h1 className="fade-up fade-up-2 font-display text-5xl font-semibold leading-[0.98] text-white sm:text-6xl lg:text-[5.25rem]">
              Lausanne,<br />by the lake.
            </h1>
            <p className="fade-up fade-up-3 mt-6 max-w-xl text-lg leading-relaxed text-white/85">
              A small house with big windows, two hundred metres from the water. Breakfast on the terrace, the Olympic park next door, the Alps across the lake.
            </p>
          </div>
          <div className="fade-up fade-up-3 mt-10 max-w-5xl">
            <BookingBar />
            <p className="mt-3 text-xs text-white/70">Direct bookings get our best rate and free cancellation on flexible plans.</p>
          </div>
        </Container>
      </section>

      {/* PERKS */}
      <section className="border-b border-line bg-paper">
        <Container className="grid gap-6 py-10 sm:grid-cols-2 lg:grid-cols-4">
          {PERKS.map((p) => (
            <div key={p.title} className="flex gap-3.5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-mist text-lake">
                <p.icon className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-sans text-[15px] font-semibold text-ink">{p.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-slate">{p.text}</p>
              </div>
            </div>
          ))}
        </Container>
      </section>

      {/* INTRO */}
      <section className="py-20 sm:py-28">
        <Container className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
          <div>
            <SectionHeading
              eyebrow="The house"
              title={<>Ten rooms. One street from the water. Nothing you don’t need.</>}
              lead="Maison Vidy is a 1920s lakeside house we restored room by room: oak floors, cream panelling, blue toile on the walls and windows that open wide. No lobby, no buffet queue — just a salon with the morning papers, a terrace in the garden and people who know the lake."
            />
            <dl className="mt-10 grid grid-cols-3 gap-6 border-t border-line pt-8">
              {[
                ["10", "rooms, 1 to 4 guests"],
                ["200 m", "to the lake and the port"],
                ["15 min", "to the old town"],
              ].map(([n, l]) => (
                <div key={l}>
                  <dt className="font-display text-3xl font-semibold text-lake">{n}</dt>
                  <dd className="mt-1 text-sm text-slate">{l}</dd>
                </div>
              ))}
            </dl>
            <div className="mt-10 flex flex-wrap gap-3">
              <ButtonLink href="/rooms">See the rooms</ButtonLink>
              <ButtonLink href="/gallery" variant="secondary">Gallery</ButtonLink>
            </div>
          </div>
          <div className="relative grid grid-cols-5 gap-4">
            <div className="relative col-span-3 aspect-[4/5] overflow-hidden rounded-2xl shadow-card">
              <Image src="/images/house/lounge.jpg" alt="The salon of Maison Vidy" fill sizes="(min-width:1024px) 360px, 60vw" className="object-cover" />
            </div>
            <div className="relative col-span-2 mt-16 aspect-[4/5] overflow-hidden rounded-2xl shadow-card">
              <Image src="/images/house/breakfast-balcony.jpg" alt="Breakfast on a balcony above the garden" fill sizes="(min-width:1024px) 240px, 40vw" className="object-cover" />
            </div>
          </div>
        </Container>
      </section>

      {/* ROOMS */}
      <section className="bg-paper py-20 sm:py-28">
        <Container>
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <SectionHeading eyebrow="Rooms & suites" title="Pick your window." lead="Every room faces the lake, the garden or the quiet courtyard. From a proper single to a duplex suite for four." />
            <Link href="/rooms" className="inline-flex items-center gap-1.5 self-start text-sm font-semibold text-lake hover:text-lake-deep sm:self-end">
              All ten rooms <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {featured.map((room, i) => (
              <RoomCard key={room.id} room={room} priority={i === 0} />
            ))}
          </div>
        </Container>
      </section>

      {/* AROUND */}
      <section className="py-20 sm:py-28">
        <Container>
          <SectionHeading eyebrow="Around the house" title="The lake first, then everything else." lead="Vidy is where Lausanne comes to walk, swim and sail. The city is fifteen minutes away; the vineyards, twenty." />
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {AROUND.slice(0, 4).map((a) => (
              <Link key={a.slug} href={`/experiences#${a.slug}`} className="group relative aspect-[3/4] overflow-hidden rounded-2xl">
                <Image src={a.image} alt={a.name} fill sizes="(min-width:1024px) 300px, (min-width:640px) 50vw, 100vw" className="object-cover transition duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/10 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-5">
                  <Badge tone="sand" className="mb-2 bg-white/90">{a.distance}</Badge>
                  <h3 className="font-display text-xl font-semibold leading-tight text-white">{a.name}</h3>
                </div>
              </Link>
            ))}
          </div>
          <div className="mt-8">
            <ButtonLink href="/experiences" variant="secondary">All experiences</ButtonLink>
          </div>
        </Container>
      </section>

      {/* BREAKFAST */}
      <section className="bg-lake-deep text-white">
        <div className="grid lg:grid-cols-2">
          <div className="relative min-h-[360px] lg:min-h-[560px]">
            <Image src="/images/house/restaurant.jpg" alt="The breakfast room by the port" fill sizes="(min-width:1024px) 50vw, 100vw" className="object-cover" />
          </div>
          <div className="flex flex-col justify-center px-6 py-16 sm:px-12 lg:px-16">
            <SectionHeading
              light
              eyebrow="Breakfast & the terrace"
              title="Slow mornings are the point."
              lead="Bread from the bakery on Avenue de Rhodanie, eggs the way you like them, Gruyère and Vacherin from the market, fruit, yoghurt, a good coffee. On the terrace when the weather allows, in the salon when it doesn’t, on your balcony if you ask."
            />
            <ul className="mt-8 space-y-2 text-sm text-sky/90">
              <li>Served 07:00 – 10:30 · CHF {HOTEL.breakfastPrice} per person, half price for children</li>
              <li>Aperitif on the terrace from 17:00, May to September</li>
              <li>Light room-service menu until 21:30</li>
            </ul>
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink href="/dining" variant="light">Dining & services</ButtonLink>
              <ButtonLink href="/book" variant="ghost" className="text-white hover:bg-white/10">Book with breakfast</ButtonLink>
            </div>
          </div>
        </div>
      </section>

      {/* REVIEWS */}
      <section className="py-20 sm:py-28">
        <Container>
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <SectionHeading eyebrow="Guests" title="What people remember." />
            <div className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3 shadow-soft ring-1 ring-ink/5">
              <div className="flex text-clay">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-current" />
                ))}
              </div>
              <div className="text-sm">
                <span className="font-semibold text-ink">4.9 / 5</span> <span className="text-slate">· 312 reviews</span>
              </div>
            </div>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {REVIEWS.map((r) => (
              <figure key={r.name} className="flex flex-col rounded-2xl bg-white p-7 shadow-card ring-1 ring-ink/5">
                <Quote className="h-6 w-6 text-sky" />
                <blockquote className="mt-4 flex-1 text-[15px] leading-relaxed text-ink-soft">{r.text}</blockquote>
                <figcaption className="mt-6 border-t border-line pt-4 text-sm">
                  <span className="font-semibold text-ink">{r.name}</span>
                  <span className="text-slate"> · {r.country} · {r.date}</span>
                </figcaption>
              </figure>
            ))}
          </div>
        </Container>
      </section>

      {/* OFFERS */}
      <section className="bg-paper py-20 sm:py-28">
        <Container>
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <SectionHeading eyebrow="Offers" title="A reason to stay a little longer." />
            <Link href="/offers" className="inline-flex items-center gap-1.5 text-sm font-semibold text-lake hover:text-lake-deep">
              All offers <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-12 grid gap-6 lg:grid-cols-2">
            {OFFERS.slice(0, 2).map((o) => (
              <Link key={o.slug} href={`/offers#${o.slug}`} className="group grid overflow-hidden rounded-2xl bg-white shadow-card ring-1 ring-ink/5 transition hover:-translate-y-1 hover:shadow-lift sm:grid-cols-[200px_1fr]">
                <div className="relative aspect-[4/3] sm:aspect-auto">
                  <Image src={o.image} alt={o.name} fill sizes="(min-width:640px) 200px, 100vw" className="object-cover transition duration-700 group-hover:scale-105" />
                </div>
                <div className="p-6">
                  <Badge tone="clay">{o.tag}</Badge>
                  <h3 className="mt-3 font-display text-2xl font-semibold text-ink">{o.name}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate">{o.summary}</p>
                  <p className="mt-4 text-sm font-semibold text-lake">{o.from}</p>
                </div>
              </Link>
            ))}
          </div>
        </Container>
      </section>

      {/* LOCATION */}
      <section className="py-20 sm:py-28">
        <Container className="grid gap-12 lg:grid-cols-[1fr_1.2fr] lg:gap-16">
          <div>
            <SectionHeading eyebrow="Getting here" title="Easy from everywhere." />
            <dl className="mt-8 space-y-5 text-sm">
              {[
                ["From Geneva Airport", "Train to Lausanne every 15 min (45 min), then bus 1 or 2 to Vidy. Or our private ride, CHF 180."],
                ["From Lausanne station", "Bus 1 or 2 to the Vidy stop, 15 min. Pickup by car CHF 40, or a 10-minute taxi."],
                ["By car", "A1 motorway, exit Lausanne-Sud / Maladière, 4 min. Private parking CHF 25 per night with EV charging."],
                ["By boat", "CGN boats dock at Ouchy, a 12-minute walk along the lake, or bus 2."],
              ].map(([t, d]) => (
                <div key={t} className="grid gap-1 border-l-2 border-sky pl-4">
                  <dt className="font-semibold text-ink">{t}</dt>
                  <dd className="leading-relaxed text-slate">{d}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-8 text-sm text-slate">
              {HOTEL.name} · {HOTEL.address} · {HOTEL.city}
            </p>
          </div>
          <div className="overflow-hidden rounded-2xl bg-sky/40 shadow-card ring-1 ring-ink/5">
            <iframe
              title="Map of Maison Vidy, Lausanne"
              src="https://www.openstreetmap.org/export/embed.html?bbox=6.5770%2C46.5085%2C6.6180%2C46.5260&layer=mapnik&marker=46.5168%2C6.5965"
              className="h-[380px] w-full lg:h-full lg:min-h-[460px]"
              loading="lazy"
            />
          </div>
        </Container>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden">
        <Image src="/images/house/terrace-dusk.jpg" alt="The garden terrace at dusk" fill sizes="100vw" className="object-cover" />
        <div className="absolute inset-0 bg-ink/60" />
        <Container className="relative py-24 text-center sm:py-32">
          <h2 className="mx-auto max-w-2xl font-display text-4xl font-semibold leading-tight text-white sm:text-5xl">
            The lake is waiting. Pick your dates.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-white/80">Book direct for the best rate, or send us a message — a person answers, usually within the hour.</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <ButtonLink href="/book" variant="light" size="lg">Check availability</ButtonLink>
            <a href={whatsappUrl()} target="_blank" rel="noopener" className="inline-flex h-13 items-center gap-2 rounded-full bg-white/10 px-7 text-base font-semibold text-white ring-1 ring-white/30 backdrop-blur transition hover:bg-white/20">
              <MessageCircle className="h-5 w-5" /> WhatsApp us
            </a>
          </div>
        </Container>
      </section>
    </>
  );
}
