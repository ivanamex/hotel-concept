import { Quote, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Closing, KnockoutBand, LocationBlock, NextPage, StepInside } from "@/components/site/bands";
import { BookingBar } from "@/components/site/booking-bar";
import { HeroCarousel } from "@/components/site/hero-carousel";
import { FadeIn, Reveal } from "@/components/site/motion";
import { RoomsTrack } from "@/components/site/rooms-track";
import { Ticker } from "@/components/site/ticker";
import { Badge, ButtonLink, Container, Eyebrow, RuleLink, SectionHeading } from "@/components/ui";
import { AROUND, OFFERS } from "@/lib/content";
import { HOTEL, REVIEWS, ROOMS } from "@/lib/seed";

export default function HomePage() {
  return (
    <>
      {/* HERO */}
      <HeroCarousel>
        <Container className="flex min-h-[92svh] flex-col justify-end pb-28 pt-24 sm:pb-16">
          <div className="max-w-3xl">
            <Eyebrow light className="mb-5">Vidy · Lausanne · ten rooms by the lake</Eyebrow>
            <Reveal as="h1" className="font-display text-[3.4rem] leading-[0.95] text-white sm:text-7xl lg:text-[6.5rem]">
              Lausanne,<br /><em>by the lake.</em>
            </Reveal>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/85">
              A small house with big windows, two hundred metres from the water. Breakfast on the terrace, the Olympic park next door, the Alps across the lake.
            </p>
          </div>
          <div className="mt-10 max-w-5xl">
            <BookingBar />
            <p className="caps mt-3 !text-[10px] text-white/70">Direct bookings get our best rate and free cancellation on flexible plans</p>
          </div>
        </Container>
      </HeroCarousel>

      <Ticker />

      {/* INTRO */}
      <section className="py-20 sm:py-28 lg:py-36">
        <Container className="grid items-center gap-12 lg:grid-cols-2 lg:gap-24">
          <div>
            <Eyebrow className="mb-4">The house</Eyebrow>
            <Reveal as="h2" className="font-display text-4xl leading-[1.02] text-ink sm:text-5xl lg:text-[3.5rem]">
              Ten rooms. One street from the water. <em>Nothing you don’t need.</em>
            </Reveal>
            <FadeIn delay={0.2}>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate">
                Maison Vidy is a 1920s lakeside house we restored room by room: oak floors, cream panelling, blue toile on the walls and windows that open wide. No lobby, no buffet queue — a salon with the morning papers, a terrace in the garden and people who know the lake.
              </p>
              <dl className="mt-10 grid grid-cols-3 gap-6 border-t border-line pt-8">
                {[["10", "rooms, 1 to 4 guests"], ["200 m", "to the lake and the port"], ["15 min", "to the old town"]].map(([n, l]) => (
                  <div key={l}>
                    <dt className="font-display text-3xl text-lake sm:text-4xl">{n}</dt>
                    <dd className="mt-1 text-sm text-slate">{l}</dd>
                  </div>
                ))}
              </dl>
              <p className="font-script mt-10 text-4xl text-ink-soft">— the family at Maison Vidy</p>
              <div className="mt-8 flex flex-wrap items-center gap-6">
                <ButtonLink href="/rooms" arrow>See the rooms</ButtonLink>
                <RuleLink href="/gallery">Gallery</RuleLink>
              </div>
            </FadeIn>
          </div>
          <FadeIn className="relative grid grid-cols-5 gap-4" delay={0.1}>
            <div className="relative col-span-3 aspect-[4/5] overflow-hidden rounded-lg shadow-card">
              <Image src="/images/house/lounge.jpg" alt="The salon of Maison Vidy" fill sizes="(min-width:1024px) 360px, 60vw" className="object-cover" />
            </div>
            <div className="relative col-span-2 mt-16 aspect-[4/5] overflow-hidden rounded-lg shadow-card">
              <Image src="/images/house/breakfast-balcony.jpg" alt="Breakfast on a balcony above the garden" fill sizes="(min-width:1024px) 240px, 40vw" className="object-cover" />
            </div>
          </FadeIn>
        </Container>
      </section>

      {/* ROOMS — horizontal track */}
      <RoomsTrack rooms={ROOMS} />

      {/* STEP INSIDE */}
      <StepInside />

      {/* AROUND */}
      <section className="py-20 sm:py-28 lg:py-36">
        <Container>
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <SectionHeading eyebrow="Around the house" title={<>The lake first, <em>then everything else.</em></>} lead="Vidy is where Lausanne comes to walk, swim and sail. The city is fifteen minutes away; the vineyards, twenty." />
            <RuleLink href="/experiences" className="self-start sm:self-end">All experiences</RuleLink>
          </div>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {AROUND.slice(0, 4).map((a, i) => (
              <FadeIn key={a.slug} delay={i * 0.08}>
                <Link href={`/experiences#${a.slug}`} className="group relative block aspect-[3/4] overflow-hidden rounded-lg">
                  <Image src={a.image} alt={a.name} fill sizes="(min-width:1024px) 300px, (min-width:640px) 50vw, 100vw" className="object-cover transition duration-[1200ms] group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/10 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-5">
                    <Badge tone="white" className="mb-3">{a.distance}</Badge>
                    <h3 className="font-display text-2xl leading-tight text-white">{a.name}</h3>
                  </div>
                </Link>
              </FadeIn>
            ))}
          </div>
        </Container>
      </section>

      {/* BREAKFAST */}
      <section className="bg-lake-deep text-white">
        <div className="grid lg:grid-cols-2">
          <div className="relative min-h-[360px] lg:min-h-[640px]">
            <Image src="/images/house/restaurant.jpg" alt="The breakfast room by the port" fill sizes="(min-width:1024px) 50vw, 100vw" className="object-cover" />
          </div>
          <div className="flex flex-col justify-center px-6 py-16 sm:px-12 lg:px-20">
            <SectionHeading light eyebrow="Breakfast & the terrace" title={<>Slow mornings <em>are the point.</em></>} lead="Bread from the bakery on Avenue de Rhodanie, eggs the way you like them, Gruyère and Vacherin from the market, fruit, yoghurt, a good coffee. On the terrace when the weather allows, in the salon when it doesn’t, on your balcony if you ask." />
            <ul className="caps mt-8 space-y-2.5 !text-[10.5px] text-sky/90">
              <li>07:00 – 10:30 · CHF {HOTEL.breakfastPrice} per person · half price for children</li>
              <li>Aperitif on the terrace from 17:00, May to September</li>
              <li>Light room-service menu until 21:30</li>
            </ul>
            <div className="mt-10 flex flex-wrap items-center gap-6">
              <ButtonLink href="/dining" variant="light" arrow>Dining & services</ButtonLink>
              <RuleLink href="/book" light>Book with breakfast</RuleLink>
            </div>
          </div>
        </div>
      </section>

      {/* REVIEWS */}
      <section className="py-20 sm:py-28 lg:py-36">
        <Container>
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <SectionHeading eyebrow="Guests" title={<>What people <em>remember.</em></>} />
            <div className="flex items-center gap-3 rounded-xs bg-white px-4 py-3 ring-1 ring-ink/5">
              <div className="flex text-clay">
                {Array.from({ length: 5 }).map((_, i) => <Star key={i} className="h-3.5 w-3.5 fill-current" />)}
              </div>
              <div className="caps !text-[10px]"><span className="text-ink">4.9 / 5</span> <span className="text-slate">· 312 reviews</span></div>
            </div>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {REVIEWS.map((r, i) => (
              <FadeIn key={r.name} delay={i * 0.1}>
                <figure className="flex h-full flex-col rounded-lg bg-white p-7 ring-1 ring-ink/5">
                  <Quote className="h-6 w-6 text-sky" />
                  <blockquote className="mt-4 flex-1 font-display text-xl leading-snug text-ink">{r.text}</blockquote>
                  <figcaption className="caps mt-6 border-t border-line pt-4 !text-[10px]">
                    <span className="text-ink">{r.name}</span><span className="text-slate"> · {r.country} · {r.date}</span>
                  </figcaption>
                </figure>
              </FadeIn>
            ))}
          </div>
        </Container>
      </section>

      {/* OFFERS */}
      <section className="bg-paper py-20 sm:py-28">
        <Container>
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <SectionHeading eyebrow="Offers" title={<>A reason to stay <em>a little longer.</em></>} />
            <RuleLink href="/offers">All offers</RuleLink>
          </div>
          <div className="mt-12 grid gap-6 lg:grid-cols-2">
            {OFFERS.slice(0, 2).map((o) => (
              <Link key={o.slug} href={`/offers#${o.slug}`} className="group grid overflow-hidden rounded-lg bg-white ring-1 ring-ink/5 transition hover:shadow-lift sm:grid-cols-[220px_1fr]">
                <div className="relative aspect-[4/3] sm:aspect-auto">
                  <Image src={o.image} alt={o.name} fill sizes="(min-width:640px) 220px, 100vw" className="object-cover transition duration-[1200ms] group-hover:scale-105" />
                </div>
                <div className="p-6 sm:p-7">
                  <Badge tone="clay">{o.tag}</Badge>
                  <h3 className="mt-3 font-display text-2xl text-ink sm:text-3xl">{o.name}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate">{o.summary}</p>
                  <p className="caps mt-4 !text-[10.5px] text-lake">{o.from}</p>
                </div>
              </Link>
            ))}
          </div>
        </Container>
      </section>

      <LocationBlock />
      <Closing />
      <KnockoutBand />
      <NextPage current="/" />
    </>
  );
}
