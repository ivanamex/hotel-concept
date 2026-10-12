import { ArrowRight, MapPin } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import { Closing, FilmBreak, KnockoutBand, LocationBlock, NextPage } from "@/components/site/bands";
import { BookingBar } from "@/components/site/booking-bar";
import { HeroFilm } from "@/components/site/hero-film";
import { ExperiencesCarousel, OffersCarousel, ReviewsSection } from "@/components/site/home-sections";
import { Link } from "@/components/site/link";
import { FadeIn, Reveal } from "@/components/site/motion";
import { Ticker } from "@/components/site/ticker";
import { Container, Eyebrow, SectionHeading } from "@/components/ui";
import { fmt, getDict, type Dict } from "@/i18n";
import { pageMeta, type LangParams } from "@/i18n/meta";
import { Rich } from "@/i18n/rich";
import { ALL_UNITS, PROPERTIES } from "@/lib/seed";
import { SITE, type HomeSection } from "@/lib/site";

export async function generateMetadata({ params }: LangParams): Promise<Metadata> {
  const { lang } = await params;
  const t = getDict(lang);
  const multi = SITE.brand.multiPlace;
  return { ...pageMeta(lang, "/", { description: multi ? t.brand.metaDescription : t.meta.description }), title: { absolute: multi ? t.brand.metaTitle : t.meta.siteTitle } };
}

/** The brand page: one hero, the places, then what the switchboard says — each block is a section it can drop. */
export default async function HomePage({ params }: LangParams) {
  const { lang } = await params;
  const t = getDict(lang);
  const b = t.brand;
  const f = SITE.features;

  const sections: Record<HomeSection, React.ReactNode> = {
    places: <Places t={t} />,
    experiences: f.experiences ? <ExperiencesCarousel t={t} /> : null,
    film: <FilmBreak />,
    offers: f.offers ? <OffersCarousel t={t} /> : null,
    reviews: <ReviewsSection t={t} />,
    locations: <LocationBlock places={SITE.places as ("vidy" | "cabanes")[]} />,
    closing: <Closing />,
    knockout: <KnockoutBand />,
  };

  return (
    <>
      <HeroFilm video={SITE.home.film} caption={b.heroCaption} alt={b.heroAlt}>
        <Container className="flex min-h-[92svh] flex-col justify-end pb-28 pt-24 sm:pb-16">
          <div className="max-w-3xl">
            <Eyebrow light className="mb-5">{b.eyebrow}</Eyebrow>
            <Reveal as="h1" className="font-display text-[3.4rem] leading-[0.95] text-white sm:text-7xl lg:text-[6.5rem]">
              <Rich text={b.title} />
            </Reveal>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/85">{b.lead}</p>
          </div>
          <div className="mt-10 max-w-5xl">
            <p className="caps mb-3 !text-[10px] text-white/80">{t.bookingBar.eyebrow}</p>
            <BookingBar places />
            <p className="caps mt-3 !text-[10px] text-white/70">{t.bookingBar.note}</p>
          </div>
        </Container>
      </HeroFilm>

      {f.ticker && <Ticker />}

      {SITE.home.sections.map((s) => <div key={s}>{sections[s]}</div>)}

      <NextPage current="/" />
    </>
  );
}

/* ---------- Our places: the house and the cabins as two large cards ---------- */

const PLACE_PAGE: Record<string, { href: string; copy: "house" | "cabanes"; units: "house" | "cabanes"; image: string }> = {
  vidy: { href: "/maison", copy: "house", units: "house", image: "/images/house/terrace-dusk.jpg" },
  cabanes: { href: "/cabanes", copy: "cabanes", units: "cabanes", image: "/images/cabins/site.jpg" },
};

function Places({ t }: { t: Dict }) {
  const p = t.brand.places;
  return (
    <section className="pt-20 sm:pt-28 lg:pt-36">
      <Container>
        <SectionHeading eyebrow={p.eyebrow} title={<Rich text={p.title} />} lead={p.lead} />
        <div className="mt-12 grid gap-6 lg:grid-cols-2 lg:gap-8">
          {SITE.places.map((id, i) => {
            const prop = PROPERTIES.find((x) => x.id === id);
            const page = PLACE_PAGE[id];
            if (!prop || !page) return null;
            const from = Math.min(...ALL_UNITS.filter((u) => u.propertyId === id && u.kind !== "whole").map((u) => u.basePrice)) * 0.85;
            const c = p[page.copy];
            return (
              <FadeIn key={id} delay={i * 0.12}>
                <article className="group lift flex h-full flex-col overflow-hidden rounded-lg bg-white shadow-card ring-1 ring-ink/5">
                  <Link href={page.href} className="relative block aspect-[4/3] overflow-hidden sm:aspect-[16/10]">
                    <Image src={page.image} alt={c.title} fill sizes="(min-width:1024px) 50vw, 100vw" className="object-cover transition duration-[1600ms] group-hover:scale-[1.04]" />
                    <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/0 to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-6 sm:p-8">
                      <div>
                        <p className="caps inline-flex items-center gap-1.5 !text-[10px] text-white/80"><MapPin className="h-3 w-3" /> {c.line}</p>
                        <h3 className="mt-2 font-display text-4xl leading-none text-white sm:text-5xl">{c.title}</h3>
                      </div>
                      <span className="caps hidden shrink-0 rounded-xs bg-white/90 px-3 py-1.5 !text-[10px] text-ink sm:block">{t.places.where[page.units].split(" · ").pop()}</span>
                    </div>
                  </Link>
                  <div className="flex flex-1 flex-col p-6 sm:p-8">
                    <p className="leading-relaxed text-slate">{c.text}</p>
                    <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-line pt-5">
                      <p className="caps !text-[10.5px] text-lake">{fmt(p.from, { p: Math.round(from) })}</p>
                      <div className="flex items-center gap-5">
                        <Link href={page.href} className="rule-link caps !text-[10px] text-ink">{p.see} <ArrowRight className="h-3 w-3" /></Link>
                        <Link href={`/book?place=${id}`} className="sweep caps inline-flex h-10 items-center rounded-xs bg-ink px-5 !text-[10px] text-white [--sweep:var(--color-lake)]">{p.book}</Link>
                      </div>
                    </div>
                  </div>
                </article>
              </FadeIn>
            );
          })}
        </div>
        {SITE.features.wholePlace && (
          <FadeIn delay={0.25}>
            <div className="mt-8 flex flex-col gap-4 rounded-lg bg-paper px-6 py-6 ring-1 ring-ink/5 sm:flex-row sm:items-center sm:justify-between sm:px-8">
              <p className="max-w-2xl font-display text-xl leading-snug text-ink sm:text-2xl"><Rich text={p.whole.text} /></p>
              <Link href="/request" className="rule-link caps shrink-0 !text-[10px] text-ink">{p.whole.cta} <ArrowRight className="h-3 w-3" /></Link>
            </div>
          </FadeIn>
        )}
      </Container>
    </section>
  );
}
