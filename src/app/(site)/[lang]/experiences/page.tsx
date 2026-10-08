import { ArrowRight, MapPin } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import { NextPage } from "@/components/site/bands";
import { InquiryForm } from "@/components/site/inquiry-form";
import { Link } from "@/components/site/link";
import { PhotoHero } from "@/components/site/page-intro";
import { Badge, Container, SectionHeading } from "@/components/ui";
import { getDict } from "@/i18n";
import { pageMeta, type LangParams } from "@/i18n/meta";
import { Rich } from "@/i18n/rich";
import { AROUND, WITH_US } from "@/lib/content";

export async function generateMetadata({ params }: LangParams): Promise<Metadata> {
  const { lang } = await params;
  const t = getDict(lang);
  return pageMeta(lang, "/experiences", { title: t.experiences.metaTitle, description: t.experiences.metaDescription });
}

export default async function ExperiencesPage({ params }: LangParams) {
  const { lang } = await params;
  const t = getDict(lang);
  const x = t.experiences;
  return (
    <>
      <PhotoHero image="/images/around/lavaux.jpg" alt={x.heroAlt} eyebrow={x.eyebrow} title={<Rich text={x.title} />} lead={x.lead} crumb={t.nav.items.experiences.label} />

      <section className="py-20 sm:py-28">
        <Container>
          <SectionHeading eyebrow={x.around.eyebrow} title={<Rich text={x.around.title} />} lead={x.around.lead} />
          <div className="mt-12 grid gap-8 md:grid-cols-2">
            {AROUND.map((a) => {
              const c = x.attractions[a.slug] ?? a;
              return (
                <article key={a.slug} id={a.slug} className="scroll-mt-28 overflow-hidden rounded-lg bg-white shadow-card ring-1 ring-ink/5">
                  <div className="relative aspect-[16/9]">
                    <Image src={a.image} alt={c.name} fill sizes="(min-width:768px) 50vw, 100vw" className="object-cover" />
                    <div className="absolute left-4 top-4 flex gap-2"><Badge tone="sand" className="bg-white/90">{c.kind}</Badge></div>
                  </div>
                  <div className="p-6">
                    <p className="inline-flex items-center gap-1.5 caps !text-[10px] text-lake"><MapPin className="h-3.5 w-3.5" /> {c.distance}</p>
                    <h3 className="mt-3 font-display text-3xl text-ink">{c.name}</h3>
                    <p className="mt-2 leading-relaxed text-slate">{c.blurb}</p>
                    <a href="#concierge" className="rule-link caps mt-5 !text-[10px] text-ink">{x.around.ask} <ArrowRight className="h-3 w-3" /></a>
                  </div>
                </article>
              );
            })}
          </div>
        </Container>
      </section>

      <section className="bg-paper py-20 sm:py-28">
        <Container>
          <SectionHeading eyebrow={x.withUs.eyebrow} title={<Rich text={x.withUs.title} />} lead={x.withUs.lead} />
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {WITH_US.map((w) => {
              const c = x.activities[w.id] ?? w;
              return (
                <article key={w.id} className="flex flex-col overflow-hidden rounded-lg bg-white shadow-card ring-1 ring-ink/5">
                  <div className="relative aspect-[4/3]">
                    <Image src={w.image} alt={c.name} fill sizes="(min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw" className="object-cover" />
                  </div>
                  <div className="flex flex-1 flex-col p-5">
                    <h3 className="font-display text-xl text-ink">{c.name}</h3>
                    <p className="caps mt-2 !text-[10px] text-lake">{c.price}</p>
                    <p className="mt-2 flex-1 text-sm leading-relaxed text-slate">{c.blurb}</p>
                    <div className="mt-4">
                      {w.extraId ? (
                        <Link href="/book" className="rule-link caps !text-[10px] text-ink">{x.withUs.add} <ArrowRight className="h-3 w-3" /></Link>
                      ) : (
                        <a href="#concierge" className="rule-link caps !text-[10px] text-ink">{x.withUs.ask} <ArrowRight className="h-3 w-3" /></a>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </Container>
      </section>

      <section id="concierge" className="scroll-mt-20 py-20 sm:py-28">
        <Container className="grid gap-12 lg:grid-cols-[1fr_1.2fr] lg:gap-16">
          <SectionHeading eyebrow={x.concierge.eyebrow} title={<Rich text={x.concierge.title} />} lead={x.concierge.lead} />
          <div className="rounded-lg bg-white p-6 shadow-card ring-1 ring-ink/5 sm:p-8">
            <InquiryForm type="concierge" />
          </div>
        </Container>
      </section>
      <NextPage current="/experiences" />
    </>
  );
}
