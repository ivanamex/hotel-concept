import { Clock } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import { NextPage } from "@/components/site/bands";
import { ExtraIcon } from "@/components/site/extra-icon";
import { PhotoHero } from "@/components/site/page-intro";
import { ButtonLink, Container, RuleLink, SectionHeading } from "@/components/ui";
import { fmt, getDict, localizeExtra, unitLabel } from "@/i18n";
import { pageMeta, type LangParams } from "@/i18n/meta";
import { Rich } from "@/i18n/rich";
import { chf } from "@/lib/format";
import { EXTRAS, HOTEL } from "@/lib/seed";

export async function generateMetadata({ params }: LangParams): Promise<Metadata> {
  const { lang } = await params;
  const t = getDict(lang);
  return pageMeta(lang, "/dining", { title: t.dining.metaTitle, description: t.dining.metaDescription });
}

export default async function DiningPage({ params }: LangParams) {
  const { lang } = await params;
  const t = getDict(lang);
  const d = t.dining;
  return (
    <>
      <PhotoHero image="/images/house/terrace-dusk.jpg" alt={d.heroAlt} eyebrow={d.eyebrow} title={<Rich text={d.title} />} lead={d.lead} crumb={t.nav.items.dining.label} />

      <section className="py-20 sm:py-28">
        <Container className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
          <div className="group lift relative aspect-[4/5] overflow-hidden rounded-lg shadow-card">
            <Image src="/images/house/breakfast-balcony.jpg" alt={d.breakfast.alt} fill sizes="(min-width:1024px) 50vw, 100vw" className="object-cover transition duration-[1400ms] group-hover:scale-[1.04]" />
          </div>
          <div>
            <SectionHeading eyebrow={d.breakfast.eyebrow} title={<Rich text={d.breakfast.title} />} />
            <p className="caps mt-5 inline-flex items-center gap-2 !text-[10.5px] text-ink"><Clock className="h-4 w-4 text-lake" /> {fmt(d.breakfast.hours, { p: HOTEL.breakfastPrice, h: HOTEL.breakfastPrice / 2 })}</p>
            <ul className="mt-6 space-y-2.5">
              {d.breakfast.items.map((b) => (
                <li key={b} className="flex items-start gap-2.5 text-[15px] text-ink-soft"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-xs bg-lake" /> {b}</li>
              ))}
            </ul>
            <p className="mt-6 text-sm text-slate">{d.breakfast.note}</p>
            <div className="mt-8"><ButtonLink href="/book" arrow>{d.breakfast.cta}</ButtonLink></div>
          </div>
        </Container>
      </section>

      <section className="bg-paper py-20 sm:py-28">
        <Container className="grid gap-10 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <SectionHeading eyebrow={d.terrace.eyebrow} title={<Rich text={d.terrace.title} />} lead={d.terrace.lead} />
          </div>
          <div className="group lift relative aspect-[16/10] overflow-hidden rounded-lg shadow-card lg:col-span-2">
            <Image src="/images/house/restaurant.jpg" alt={d.terrace.alt} fill sizes="(min-width:1024px) 66vw, 100vw" className="object-cover transition duration-[1400ms] group-hover:scale-[1.04]" />
          </div>
        </Container>
        <Container className="mt-12 grid gap-6 md:grid-cols-3">
          {d.terrace.cards.map(([h, p]) => (
            <div key={h} className="lift-sm rounded-lg bg-white p-6 ring-1 ring-ink/5">
              <h3 className="font-display text-xl text-ink">{h}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate">{p}</p>
            </div>
          ))}
        </Container>
      </section>

      <section className="py-20 sm:py-28">
        <Container>
          <SectionHeading eyebrow={d.picks.eyebrow} title={<Rich text={d.picks.title} />} />
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {d.picks.list.map((r) => (
              <div key={r.name} className="lift-sm rounded-lg bg-white p-6 shadow-card ring-1 ring-ink/5">
                <p className="caps !text-[10px] text-lake">{r.kind}</p>
                <h3 className="mt-2 font-display text-xl text-ink">{r.name}</h3>
                <p className="mt-1 text-sm text-slate">{r.walk}</p>
                <p className="mt-3 text-sm leading-relaxed text-ink-soft">{r.note}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section className="bg-lake-deep py-20 text-white sm:py-28">
        <Container>
          <SectionHeading light eyebrow={d.services.eyebrow} title={<Rich text={d.services.title} />} lead={d.services.lead} />
          <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {EXTRAS.map((base) => {
              const e = localizeExtra(base, t);
              return (
                <li key={e.id} className="rise flex items-start gap-4 rounded-lg bg-white/5 p-5 ring-1 ring-white/10 hover:bg-white/10">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-white/10 text-sky"><ExtraIcon name={e.icon} /></span>
                  <div>
                    <p className="font-semibold">{e.name}</p>
                    <p className="mt-0.5 text-sm text-sky/80">{e.requestOnly ? d.services.free : `${chf(e.price)} ${unitLabel(e.unit, t)}`}</p>
                  </div>
                </li>
              );
            })}
            {d.services.more.map(([h, p]) => (
              <li key={h} className="rise flex items-start gap-4 rounded-lg bg-white/5 p-5 ring-1 ring-white/10 hover:bg-white/10">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-white/10 text-sky"><ExtraIcon name="concierge" /></span>
                <div><p className="font-semibold">{h}</p><p className="mt-0.5 text-sm text-sky/80">{p}</p></div>
              </li>
            ))}
          </ul>
          <div className="mt-10 flex flex-wrap gap-3">
            <ButtonLink href="/book" variant="light" arrow>{d.services.cta}</ButtonLink>
            <RuleLink href="/experiences#concierge" light>{d.services.ask}</RuleLink>
          </div>
        </Container>
      </section>
      <NextPage current="/dining" />
    </>
  );
}
