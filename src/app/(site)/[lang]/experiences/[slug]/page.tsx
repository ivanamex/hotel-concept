import { CalendarDays, Check, Clock, MapPin, Sun, Users } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { NextPage } from "@/components/site/bands";
import { Carousel } from "@/components/site/carousel";
import { CloseButton } from "@/components/site/close-button";
import { ExperienceBooker } from "@/components/site/experience-booker";
import { Link } from "@/components/site/link";
import { Reveal } from "@/components/site/motion";
import { RoomGallery } from "@/components/site/room-gallery";
import { VideoLayer } from "@/components/site/video-layer";
import { Badge, Container, Eyebrow, RuleLink } from "@/components/ui";
import { fmt, getDict } from "@/i18n";
import { pageMeta, type LangSlugParams } from "@/i18n/meta";
import { chf } from "@/lib/format";
import { EXPERIENCES, experienceBySlug } from "@/lib/experiences";

export function generateStaticParams() {
  return EXPERIENCES.map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({ params }: LangSlugParams): Promise<Metadata> {
  const { lang, slug } = await params;
  const t = getDict(lang);
  const e = experienceBySlug(slug);
  const c = t.experiences.catalog[slug];
  if (!e || !c) return {};
  return pageMeta(lang, `/experiences/${slug}`, { title: c.name, description: c.blurb, image: e.image });
}

export default async function ExperiencePage({ params }: LangSlugParams) {
  const { lang, slug } = await params;
  const t = getDict(lang);
  const e = experienceBySlug(slug);
  const c = t.experiences.catalog[slug];
  if (!e || !c) notFound();
  const b = t.experiences.book;
  const others = EXPERIENCES.filter((x) => x.slug !== e.slug);
  const daysLabel = e.days.length ? e.days.map((d) => b.dayNames[d]).join(" · ") : b.facts.everyDay;
  const seasonLabel = e.season ? `${mmdd(e.season.from, lang)} – ${mmdd(e.season.to, lang)}` : b.facts.allYear;

  const facts = [
    { icon: Clock, label: b.facts.duration, value: fmt(b.hours, { n: e.durationH }) },
    { icon: Sun, label: b.facts.starts, value: e.times.join(" · ") },
    { icon: CalendarDays, label: b.facts.days, value: `${daysLabel}${e.season ? ` · ${seasonLabel}` : ""}` },
    { icon: Users, label: b.facts.group, value: fmt(b.facts.upTo, { a: e.minPeople, b: e.maxPeople }) },
    { icon: MapPin, label: b.facts.meeting, value: c.meeting },
  ];

  return (
    <>
      {/* HERO — film where there is one, the photo otherwise */}
      <section className="relative min-h-[70svh] overflow-hidden text-white">
        <VideoLayer video={e.video} image={e.image} alt={c.name} priority />
        <div className="absolute inset-0 bg-gradient-to-b from-ink/40 via-ink/10 to-ink/70" />
        <Container className="relative flex min-h-[70svh] flex-col justify-between pb-12 pt-8 lg:pt-10">
          <div className="flex items-start justify-between gap-4">
            <nav className="caps !text-[10px] text-white/80" aria-label="Breadcrumb">
              <Link href="/" className="hover:text-white">Maison Vidy</Link> <span className="mx-2">/</span> <Link href="/experiences" className="hover:text-white">{t.nav.items.experiences.label}</Link>
            </nav>
            <CloseButton />
          </div>
          <div className="max-w-3xl">
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <Badge tone="white">{b.categories[e.category]}</Badge>
              <Eyebrow light>{fmt(b.hours, { n: e.durationH })} · {e.times[0]}{e.times.length > 1 ? " +" : ""}</Eyebrow>
            </div>
            <Reveal as="h1" className="font-display text-5xl leading-[0.98] sm:text-6xl lg:text-7xl">{c.name}</Reveal>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-white/85">{c.tagline}</p>
            <p className="caps mt-6 !text-[11px] text-white/90">{b.from} <span className="font-display text-2xl normal-case tracking-normal">{chf(e.price)}</span> {e.priceUnit === "person" ? b.perPerson : b.perGroup}</p>
          </div>
        </Container>
      </section>

      <section className="py-14 sm:py-20">
        <Container className="grid gap-12 lg:grid-cols-[1fr_420px] lg:gap-16">
          <div>
            <p className="text-lg leading-relaxed text-ink">{c.blurb}</p>
            <p className="mt-5 leading-relaxed text-slate">{c.description}</p>

            <dl className="mt-10 grid gap-x-8 gap-y-5 border-t border-line pt-8 sm:grid-cols-2">
              {facts.map((f) => (
                <div key={f.label} className="row-plate -mx-4 flex gap-3 px-4 py-2">
                  <f.icon className="plate-icon mt-0.5 h-5 w-5 shrink-0 text-lake" />
                  <div><dt className="caps !text-[10px] text-slate">{f.label}</dt><dd className="mt-0.5 text-sm text-ink">{f.value}</dd></div>
                </div>
              ))}
            </dl>

            <div className="mt-10 grid gap-10 sm:grid-cols-2">
              <div>
                <h2 className="font-display text-2xl text-ink">{b.includes}</h2>
                <ul className="mt-4 space-y-2">{c.includes.map((x) => <li key={x} className="flex gap-2.5 text-sm text-ink-soft"><Check className="mt-0.5 h-4 w-4 shrink-0 text-moss" /> {x}</li>)}</ul>
              </div>
              <div>
                <h2 className="font-display text-2xl text-ink">{b.bring}</h2>
                <ul className="mt-4 space-y-2">{c.bring.map((x) => <li key={x} className="flex gap-2.5 text-sm text-ink-soft"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-lake" /> {x}</li>)}</ul>
              </div>
            </div>

            <div className="mt-12">
              <h2 className="font-display text-2xl text-ink">{b.gallery}</h2>
              <div className="mt-5"><RoomGallery images={e.gallery} name={c.name} /></div>
            </div>
          </div>

          <aside className="lg:sticky lg:top-24 lg:self-start">
            <ExperienceBooker e={e} />
          </aside>
        </Container>
      </section>

      <section className="bg-paper py-16 sm:py-24">
        <Container>
          <Carousel
            heading={<h2 className="font-display text-3xl text-ink sm:text-4xl">{b.more}</h2>}
            link={<RuleLink href="/experiences">{b.backToAll}</RuleLink>}
            itemClass="w-[78vw] sm:w-[calc((100%-1.25rem)/2)] lg:w-[calc((100%-2.5rem)/3)]"
          >
            {others.map((o) => {
              const oc = t.experiences.catalog[o.slug];
              return (
                <Link key={o.slug} href={`/experiences/${o.slug}`} className="group lift relative block aspect-[4/3] overflow-hidden rounded-lg">
                  <Image src={o.image} alt={oc.name} fill draggable={false} sizes="(min-width:1024px) 33vw, (min-width:640px) 50vw, 80vw" className="object-cover transition duration-[1200ms] group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/10 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-5">
                    <Badge tone="white" className="mb-3">{fmt(b.hours, { n: o.durationH })} · {b.from} {chf(o.price)}</Badge>
                    <h3 className="font-display text-2xl leading-tight text-white">{oc.name}</h3>
                  </div>
                </Link>
              );
            })}
          </Carousel>
        </Container>
      </section>
      <NextPage current="/experiences" />
    </>
  );
}

function mmdd(s: string, lang: string) {
  const [m, d] = s.split("-").map(Number);
  return new Date(2026, m - 1, d).toLocaleDateString(lang === "en" ? "en-GB" : lang, { day: "numeric", month: "short" });
}
