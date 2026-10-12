import type { Metadata } from "next";
import Image from "next/image";
import { Closing, FilmBreak, KnockoutBand, LocationBlock, NextPage, SecondPlaceBand } from "@/components/site/bands";
import { PhotoHero } from "@/components/site/page-intro";
import { AroundCarousel, OffersCarousel, ReviewsSection } from "@/components/site/home-sections";
import { FadeIn, Parallax, Reveal } from "@/components/site/motion";
import { RoomsTrack } from "@/components/site/rooms-track";
import { ButtonLink, Container, Eyebrow, RuleLink, SectionHeading } from "@/components/ui";
import { fmt, getDict } from "@/i18n";
import { pageMeta, type LangParams } from "@/i18n/meta";
import { Rich } from "@/i18n/rich";
import { HOTEL, ROOMS } from "@/lib/seed";
import { SITE } from "@/lib/site";

export async function generateMetadata({ params }: LangParams): Promise<Metadata> {
  const { lang } = await params;
  const t = getDict(lang);
  return pageMeta(lang, "/maison", { title: t.brand.maison.metaTitle, description: t.brand.maison.metaDescription });
}

/** The house's own landing — the entrance film, the house, the rooms, around, breakfast, reviews, offers, where. */
export default async function MaisonPage({ params }: LangParams) {
  const { lang } = await params;
  const t = getDict(lang);
  const h = t.home;
  const f = SITE.features;

  return (
    <>
      {/* HERO — the same opening as the cabins: the house, its name, one line */}
      <PhotoHero image="/images/lake/aerial-day.jpg" alt={h.heroAlt} eyebrow={h.eyebrow} title={<Rich text={h.title} />} lead={h.lead} crumb={t.brand.maison.crumb} />

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
                <ButtonLink href="/book?place=vidy" arrow>{t.home.closing.bookRoom}</ButtonLink>
                <RuleLink href="/rooms">{h.house.seeRooms}</RuleLink>
                {f.gallery && <RuleLink href="/gallery">{h.house.gallery}</RuleLink>}
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

      {/* OUR SECOND PLACE */}
      {SITE.brand.multiPlace && <SecondPlaceBand />}

      {/* AROUND */}
      <AroundCarousel t={t} />

      {/* BREAKFAST */}
      {f.dining && (
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
                <RuleLink href="/book?place=vidy" light>{h.breakfast.cta2}</RuleLink>
              </div>
            </div>
          </div>
        </section>
      )}

      <ReviewsSection t={t} />

      {f.offers && <OffersCarousel t={t} />}

      <LocationBlock />
      <Closing />
      <KnockoutBand />
      <NextPage current="/maison" />
    </>
  );
}
