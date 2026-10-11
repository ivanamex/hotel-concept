import { ArrowRight, Bus, Car, Flame, Leaf, ShowerHead, Sunrise, Users } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import { LocationBlock, NextPage } from "@/components/site/bands";
import { Link } from "@/components/site/link";
import { FadeIn, Parallax, Reveal } from "@/components/site/motion";
import { PhotoHero } from "@/components/site/page-intro";
import { RoomCard } from "@/components/site/room-card";
import { ButtonLink, Container, Eyebrow, RuleLink, SectionHeading } from "@/components/ui";
import { fmt, getDict } from "@/i18n";
import { pageMeta, type LangParams } from "@/i18n/meta";
import { Rich } from "@/i18n/rich";
import { EXPERIENCES } from "@/lib/experiences";
import { chf } from "@/lib/format";
import { CABINS } from "@/lib/seed";

export async function generateMetadata({ params }: LangParams): Promise<Metadata> {
  const { lang } = await params;
  const t = getDict(lang);
  return pageMeta(lang, "/cabanes", { title: t.places.page.metaTitle, description: t.places.page.metaDescription, image: "/images/cabins/site.jpg" });
}

export default async function CabanesPage({ params }: LangParams) {
  const { lang } = await params;
  const t = getDict(lang);
  const p = t.places.page;
  const cabins = CABINS.filter((c) => c.kind !== "whole");
  const whole = CABINS.find((c) => c.kind === "whole")!;
  const fondue = EXPERIENCES.find((e) => e.slug === "fondue-evening")!;
  const fc = t.experiences.catalog["fondue-evening"];
  const b = t.experiences.book;
  const thereIcons = [Bus, Car, Bus];

  return (
    <>
      <PhotoHero image="/images/cabins/site.jpg" alt={p.heroAlt} eyebrow={p.eyebrow} title={<Rich text={p.title} />} lead={p.lead} crumb={p.crumb} />

      {/* THE PLACE */}
      <section className="py-20 sm:py-28">
        <Container className="grid items-center gap-12 lg:grid-cols-2 lg:gap-24">
          <div>
            <Eyebrow className="mb-4">{p.story.eyebrow}</Eyebrow>
            <Reveal as="h2" className="font-display text-4xl leading-[1.02] text-ink sm:text-5xl"><Rich text={p.story.title} /></Reveal>
            <FadeIn delay={0.2}>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate">{p.story.text}</p>
              <dl className="mt-10 grid grid-cols-3 gap-6 border-t border-line pt-8">
                {p.story.stats.map(([n, l]) => (
                  <div key={l}><dt className="font-display text-3xl text-lake sm:text-4xl">{n}</dt><dd className="mt-1 text-sm text-slate">{l}</dd></div>
                ))}
              </dl>
              <div className="mt-8 flex flex-wrap items-center gap-6">
                <ButtonLink href="/book?place=cabanes" arrow>{p.bookCab}</ButtonLink>
                <RuleLink href="/experiences/fondue-evening">{t.places.band.cta2}</RuleLink>
              </div>
            </FadeIn>
          </div>
          <div className="relative grid grid-cols-5 gap-4">
            <Parallax speed={-0.25} className="col-span-3">
              <div className="group lift relative aspect-[4/5] overflow-hidden rounded-lg shadow-card">
                <Image src="/images/cabins/hetre.jpg" alt="" fill sizes="(min-width:1024px) 360px, 60vw" className="object-cover transition duration-[1400ms] group-hover:scale-[1.05]" />
              </div>
            </Parallax>
            <Parallax speed={0.35} className="col-span-2 mt-16">
              <div className="group lift relative aspect-[4/5] overflow-hidden rounded-lg shadow-card">
                <Image src="/images/cabins/meleze.jpg" alt="" fill sizes="(min-width:1024px) 240px, 40vw" className="object-cover transition duration-[1400ms] group-hover:scale-[1.05]" />
              </div>
            </Parallax>
          </div>
        </Container>
      </section>

      {/* THE CABINS */}
      <section className="bg-paper py-20 sm:py-28">
        <Container>
          <SectionHeading eyebrow={t.places.cabanes.name} title={<Rich text={p.cabinsTitle} />} lead={p.cabinsLead} />
          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {cabins.map((c, i) => <RoomCard key={c.id} room={c} priority={i < 2} />)}
          </div>

          <div className="lift-sm mt-10 grid gap-8 rounded-lg bg-lake-deep p-8 text-white sm:p-10 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <p className="caps !text-[10px] text-sky">{t.places.cabanes.name}</p>
              <h3 className="mt-2 font-display text-3xl"><Rich text={p.whole.title} /></h3>
              <p className="mt-3 max-w-2xl text-sky/85">{p.whole.text}</p>
              <p className="caps mt-4 !text-[10px] text-sky"><Users className="mr-1 inline h-3.5 w-3.5" /> {fmt(b.facts.upTo, { a: 4, b: whole.maxGuests })} · {t.common.from} {chf(whole.basePrice)} {t.common.perNight}</p>
            </div>
            <ButtonLink href="/request" variant="light" arrow>{p.whole.cta}</ButtonLink>
          </div>
        </Container>
      </section>

      {/* ON THE DECK — the fondue evening */}
      <section className="py-20 sm:py-28">
        <Container className="grid items-center gap-10 lg:grid-cols-[1.1fr_1fr] lg:gap-16">
          <Link href="/experiences/fondue-evening" className="group lift relative block aspect-[16/10] overflow-hidden rounded-lg shadow-card">
            <Image src={fondue.image} alt={fc.name} fill sizes="(min-width:1024px) 55vw, 100vw" className="object-cover transition duration-[1400ms] group-hover:scale-[1.04]" />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/70 to-transparent p-6">
              <p className="caps !text-[10px] text-white/80">{b.categories[fondue.category]} · {fmt(b.hours, { n: fondue.durationH })} · {fondue.times[0]}</p>
              <p className="mt-1 font-display text-2xl text-white">{fc.name}</p>
            </div>
          </Link>
          <div>
            <Eyebrow className="mb-4">{p.fondue.title}</Eyebrow>
            <h2 className="font-display text-4xl leading-[1.02] text-ink"><Rich text={fc.tagline} /></h2>
            <p className="mt-5 leading-relaxed text-slate">{p.fondue.lead}</p>
            <p className="mt-4 leading-relaxed text-slate">{fc.blurb}</p>
            <div className="mt-8 flex flex-wrap items-center gap-6">
              <ButtonLink href="/experiences/fondue-evening" arrow>{b.seeAndBook}</ButtonLink>
              <span className="caps !text-[10px] text-slate">{b.from} {chf(fondue.price)} {b.perPerson}</span>
            </div>
          </div>
        </Container>
      </section>

      {/* GOOD TO KNOW + GETTING THERE */}
      <section className="bg-paper py-20 sm:py-28">
        <Container className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <h2 className="font-display text-3xl text-ink">{p.good.title}</h2>
            <ul className="mt-6 -mx-4 divide-y divide-line border-y border-line">
              {p.good.items.map((x, i) => {
                const Icon = [Sunrise, Leaf, ShowerHead, Users, Flame][i % 5];
                return <li key={x} className="row-plate flex gap-4 px-4 py-4"><Icon className="plate-icon mt-0.5 h-5 w-5 shrink-0 text-lake" /><span className="text-sm leading-relaxed text-ink-soft">{x}</span></li>;
              })}
            </ul>
          </div>
          <div>
            <h2 className="font-display text-3xl text-ink">{p.there.title}</h2>
            <ul className="mt-6 -mx-4 divide-y divide-line border-y border-line">
              {p.there.items.map((x, i) => {
                const Icon = thereIcons[i] ?? Car;
                return <li key={x} className="row-plate flex gap-4 px-4 py-4"><Icon className="plate-icon mt-0.5 h-5 w-5 shrink-0 text-lake" /><span className="text-sm leading-relaxed text-ink-soft">{x}</span></li>;
              })}
            </ul>
            <RuleLink href="/" className="mt-8">{t.places.house.name} <ArrowRight className="ml-1 inline h-3 w-3" /></RuleLink>
          </div>
        </Container>
      </section>

      <LocationBlock compact place="cabanes" />
      <NextPage current="/cabanes" />
    </>
  );
}
