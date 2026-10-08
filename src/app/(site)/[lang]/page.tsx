import { Quote, Star } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import { Closing, FilmBreak, KnockoutBand, LocationBlock, NextPage } from "@/components/site/bands";
import { BookingBar } from "@/components/site/booking-bar";
import { HeroFilm } from "@/components/site/hero-film";
import { Link } from "@/components/site/link";
import { FadeIn, Parallax, Reveal } from "@/components/site/motion";
import { RoomsTrack } from "@/components/site/rooms-track";
import { Ticker } from "@/components/site/ticker";
import { Badge, ButtonLink, Container, Eyebrow, RuleLink, SectionHeading } from "@/components/ui";
import { fmt, getDict } from "@/i18n";
import { pageMeta, type LangParams } from "@/i18n/meta";
import { Rich, plain } from "@/i18n/rich";
import { AROUND, OFFERS } from "@/lib/content";
import { HOTEL, ROOMS } from "@/lib/seed";

export async function generateMetadata({ params }: LangParams): Promise<Metadata> {
  const { lang } = await params;
  const t = getDict(lang);
  return { ...pageMeta(lang, "/", { description: t.meta.description }), title: { absolute: t.meta.siteTitle } };
}

export default async function HomePage({ params }: LangParams) {
  const { lang } = await params;
  const t = getDict(lang);
  const h = t.home;

  return (
    <>
      {/* HERO */}
      <HeroFilm caption={h.heroCaption}>
        <Container className="flex min-h-[92svh] flex-col justify-end pb-28 pt-24 sm:pb-16">
          <div className="max-w-3xl">
            <Eyebrow light className="mb-5">{h.eyebrow}</Eyebrow>
            <Reveal as="h1" className="font-display text-[3.4rem] leading-[0.95] text-white sm:text-7xl lg:text-[6.5rem]">
              <Rich text={h.title} />
            </Reveal>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/85">{h.lead}</p>
          </div>
          <div className="mt-10 max-w-5xl">
            <BookingBar />
            <p className="caps mt-3 !text-[10px] text-white/70">{t.bookingBar.note}</p>
          </div>
        </Container>
      </HeroFilm>

      <Ticker />

      {/* INTRO */}
      <section className="py-20 sm:py-28 lg:py-36">
        <Container className="grid items-center gap-12 lg:grid-cols-2 lg:gap-24">
          <div>
            <Eyebrow className="mb-4">{h.house.eyebrow}</Eyebrow>
            <Reveal as="h2" className="font-display text-4xl leading-[1.02] text-ink sm:text-5xl lg:text-[3.5rem]">
              <Rich text={h.house.title} />
            </Reveal>
            <FadeIn delay={0.2}>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate">{h.house.text}</p>
              <dl className="mt-10 grid grid-cols-3 gap-6 border-t border-line pt-8">
                {h.house.stats.map(([n, l]) => (
                  <div key={l}>
                    <dt className="font-display text-3xl text-lake sm:text-4xl">{n}</dt>
                    <dd className="mt-1 text-sm text-slate">{l}</dd>
                  </div>
                ))}
              </dl>
              <p className="font-script mt-10 text-4xl text-ink-soft">{h.house.signature}</p>
              <div className="mt-8 flex flex-wrap items-center gap-6">
                <ButtonLink href="/rooms" arrow>{h.house.seeRooms}</ButtonLink>
                <RuleLink href="/gallery">{h.house.gallery}</RuleLink>
              </div>
            </FadeIn>
          </div>
          <div className="relative grid grid-cols-5 gap-4">
            <Parallax speed={-0.25} className="col-span-3">
              <div className="group lift relative aspect-[4/5] overflow-hidden rounded-lg shadow-card">
                <Image src="/images/house/lounge.jpg" alt={h.house.salonAlt} fill sizes="(min-width:1024px) 360px, 60vw" className="object-cover transition duration-[1400ms] group-hover:scale-[1.05]" />
              </div>
            </Parallax>
            <Parallax speed={0.35} className="col-span-2 mt-16">
              <div className="group lift relative aspect-[4/5] overflow-hidden rounded-lg shadow-card">
                <Image src="/images/house/breakfast-balcony.jpg" alt={h.house.balconyAlt} fill sizes="(min-width:1024px) 240px, 40vw" className="object-cover transition duration-[1400ms] group-hover:scale-[1.05]" />
              </div>
            </Parallax>
          </div>
        </Container>
      </section>

      {/* PAGE BREAK — the lake film */}
      <FilmBreak />

      {/* ROOMS — horizontal track */}
      <RoomsTrack rooms={ROOMS} />

      {/* AROUND */}
      <section className="py-20 sm:py-28 lg:py-36">
        <Container>
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <SectionHeading eyebrow={h.around.eyebrow} title={<Rich text={h.around.title} />} lead={h.around.lead} />
            <RuleLink href="/experiences" className="self-start sm:self-end">{h.around.all}</RuleLink>
          </div>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {AROUND.slice(0, 4).map((a, i) => {
              const c = t.experiences.attractions[a.slug] ?? a;
              return (
                <FadeIn key={a.slug} delay={i * 0.08}>
                  <Link href={`/experiences#${a.slug}`} className="group lift relative block aspect-[3/4] overflow-hidden rounded-lg">
                    <Image src={a.image} alt={c.name} fill sizes="(min-width:1024px) 300px, (min-width:640px) 50vw, 100vw" className="object-cover transition duration-[1200ms] group-hover:scale-105" />
                    <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/10 to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 p-5">
                      <Badge tone="white" className="mb-3">{c.distance}</Badge>
                      <h3 className="font-display text-2xl leading-tight text-white">{c.name}</h3>
                    </div>
                  </Link>
                </FadeIn>
              );
            })}
          </div>
        </Container>
      </section>

      {/* BREAKFAST */}
      <section className="bg-lake-deep text-white">
        <div className="grid lg:grid-cols-2">
          <div className="relative min-h-[360px] lg:min-h-[640px]">
            <Image src="/images/house/restaurant.jpg" alt={h.breakfast.alt} fill sizes="(min-width:1024px) 50vw, 100vw" className="object-cover" />
          </div>
          <div className="flex flex-col justify-center px-6 py-16 sm:px-12 lg:px-20">
            <SectionHeading light eyebrow={h.breakfast.eyebrow} title={<Rich text={h.breakfast.title} />} lead={h.breakfast.lead} />
            <ul className="caps mt-8 space-y-2.5 !text-[10.5px] text-sky/90">
              {h.breakfast.lines.map((l) => (
                <li key={l}>{fmt(l, { p: HOTEL.breakfastPrice })}</li>
              ))}
            </ul>
            <div className="mt-10 flex flex-wrap items-center gap-6">
              <ButtonLink href="/dining" variant="light" arrow>{h.breakfast.cta}</ButtonLink>
              <RuleLink href="/book" light>{h.breakfast.cta2}</RuleLink>
            </div>
          </div>
        </div>
      </section>

      {/* REVIEWS */}
      <section className="py-20 sm:py-28 lg:py-36">
        <Container>
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <SectionHeading eyebrow={h.reviews.eyebrow} title={<Rich text={h.reviews.title} />} />
            <div className="flex items-center gap-3 rounded-xs bg-white px-4 py-3 ring-1 ring-ink/5">
              <div className="flex text-clay">
                {Array.from({ length: 5 }).map((_, i) => <Star key={i} className="h-3.5 w-3.5 fill-current" />)}
              </div>
              <div className="caps !text-[10px]"><span className="text-ink">{h.reviews.score}</span> <span className="text-slate">· {h.reviews.count}</span></div>
            </div>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {t.reviews.map((r, i) => (
              <FadeIn key={r.name} delay={i * 0.1}>
                <figure className="lift-sm flex h-full flex-col rounded-lg bg-white p-7 ring-1 ring-ink/5">
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
            <SectionHeading eyebrow={h.offers.eyebrow} title={<Rich text={h.offers.title} />} />
            <RuleLink href="/offers">{h.offers.all}</RuleLink>
          </div>
          <div className="mt-12 grid gap-6 lg:grid-cols-2">
            {OFFERS.slice(0, 2).map((o) => {
              const c = t.offers.list[o.slug] ?? o;
              return (
                <Link key={o.slug} href={`/offers#${o.slug}`} className="group lift grid overflow-hidden rounded-lg bg-white ring-1 ring-ink/5 sm:grid-cols-[220px_1fr]">
                  <div className="relative aspect-[4/3] sm:aspect-auto">
                    <Image src={o.image} alt={plain(c.name)} fill sizes="(min-width:640px) 220px, 100vw" className="object-cover transition duration-[1200ms] group-hover:scale-105" />
                  </div>
                  <div className="p-6 sm:p-7">
                    <Badge tone="clay">{c.tag}</Badge>
                    <h3 className="mt-3 font-display text-2xl text-ink sm:text-3xl">{c.name}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-slate">{c.summary}</p>
                    <p className="caps mt-4 !text-[10.5px] text-lake">{c.from}</p>
                  </div>
                </Link>
              );
            })}
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
