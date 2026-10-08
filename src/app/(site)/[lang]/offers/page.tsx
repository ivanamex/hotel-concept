import { Check } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import { NextPage } from "@/components/site/bands";
import { PhotoHero } from "@/components/site/page-intro";
import { Badge, ButtonLink, Container } from "@/components/ui";
import { getDict } from "@/i18n";
import { pageMeta, type LangParams } from "@/i18n/meta";
import { Rich } from "@/i18n/rich";
import { OFFERS } from "@/lib/content";

export async function generateMetadata({ params }: LangParams): Promise<Metadata> {
  const { lang } = await params;
  const t = getDict(lang);
  return pageMeta(lang, "/offers", { title: t.offers.metaTitle, description: t.offers.metaDescription });
}

export default async function OffersPage({ params }: LangParams) {
  const { lang } = await params;
  const t = getDict(lang);
  const o = t.offers;
  return (
    <>
      <PhotoHero image="/images/lake/swans.jpg" alt={o.heroAlt} eyebrow={o.eyebrow} title={<Rich text={o.title} />} lead={o.lead} crumb={t.nav.items.offers.label} />
      <section className="py-20 sm:py-28">
        <Container className="space-y-10">
          {OFFERS.map((base, i) => {
            const c = o.list[base.slug] ?? base;
            return (
              <article key={base.slug} id={base.slug} className="scroll-mt-28 grid overflow-hidden rounded-lg bg-white shadow-card ring-1 ring-ink/5 lg:grid-cols-2">
                <div className={`relative aspect-[4/3] lg:aspect-auto ${i % 2 ? "lg:order-2" : ""}`}>
                  <Image src={base.image} alt={c.name} fill sizes="(min-width:1024px) 50vw, 100vw" className="object-cover" />
                </div>
                <div className="p-7 sm:p-10">
                  <Badge tone="clay">{c.tag}</Badge>
                  <h2 className="mt-4 font-display text-4xl text-ink">{c.name}</h2>
                  <p className="mt-1 text-sm text-slate">{c.dates}</p>
                  <p className="mt-4 leading-relaxed text-ink-soft">{c.summary}</p>
                  <ul className="mt-5 grid gap-2 sm:grid-cols-2">
                    {c.includes.map((x) => (
                      <li key={x} className="flex items-start gap-2 text-sm text-ink-soft"><Check className="mt-0.5 h-4 w-4 shrink-0 text-moss" /> {x}</li>
                    ))}
                  </ul>
                  <div className="mt-6 flex flex-wrap items-center gap-4">
                    <ButtonLink href={`/book?offer=${base.slug}`} arrow>{o.cta}</ButtonLink>
                    <span className="caps !text-[10.5px] text-lake">{c.from}</span>
                  </div>
                </div>
              </article>
            );
          })}
        </Container>
      </section>
      <NextPage current="/offers" />
    </>
  );
}
