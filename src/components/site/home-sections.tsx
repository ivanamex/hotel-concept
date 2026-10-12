import { ArrowRight, Clock, Quote, Star } from "lucide-react";
import Image from "next/image";
import { Carousel } from "@/components/site/carousel";
import { Link } from "@/components/site/link";
import { FadeIn } from "@/components/site/motion";
import { Badge, Container, RuleLink, SectionHeading } from "@/components/ui";
import { fmt, type Dict } from "@/i18n";
import { Rich, plain } from "@/i18n/rich";
import { AROUND, OFFERS } from "@/lib/content";
import { EXPERIENCES } from "@/lib/experiences";
import { chf } from "@/lib/format";

/* Sections shared by the brand home and the house landing. Server components: the dictionary comes in as a prop. */

export function AroundCarousel({ t }: { t: Dict }) {
  const h = t.home;
  return (
    <section className="py-20 sm:py-28 lg:py-36">
      <Container>
        <Carousel
          heading={<SectionHeading eyebrow={h.around.eyebrow} title={<Rich text={h.around.title} />} lead={h.around.lead} />}
          link={<RuleLink href="/experiences">{h.around.all}</RuleLink>}
          itemClass="w-[78vw] sm:w-[calc((100%-1.25rem)/2)] lg:w-[calc((100%-3.75rem)/4)]"
        >
          {AROUND.map((a) => {
            const c = t.experiences.attractions[a.slug] ?? a;
            return (
              <Link key={a.slug} href={`/experiences#${a.slug}`} className="group lift relative block aspect-[3/4] overflow-hidden rounded-lg">
                <Image src={a.image} alt={c.name} fill draggable={false} sizes="(min-width:1024px) 300px, (min-width:640px) 50vw, 100vw" className="object-cover transition duration-[1200ms] group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/10 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-5">
                  <Badge tone="white" className="mb-3">{c.distance}</Badge>
                  <h3 className="font-display text-2xl leading-tight text-white">{c.name}</h3>
                </div>
              </Link>
            );
          })}
        </Carousel>
      </Container>
    </section>
  );
}

/** The six bookable experiences, as a carousel. */
export function ExperiencesCarousel({ t }: { t: Dict }) {
  const b = t.brand.experiences;
  const x = t.experiences;
  return (
    <section className="py-20 sm:py-28 lg:py-36">
      <Container>
        <Carousel
          heading={<SectionHeading eyebrow={b.eyebrow} title={<Rich text={b.title} />} lead={b.lead} />}
          link={<RuleLink href="/experiences#book">{b.all}</RuleLink>}
          itemClass="w-[80vw] sm:w-[calc((100%-1.25rem)/2)] lg:w-[calc((100%-2.5rem)/3)]"
        >
          {EXPERIENCES.map((e) => {
            const c = x.catalog[e.slug];
            return (
              <Link key={e.slug} href={`/experiences/${e.slug}`} className="group lift flex h-full flex-col overflow-hidden rounded-lg bg-white shadow-card ring-1 ring-ink/5">
                <div className="relative aspect-[4/3] overflow-hidden">
                  <Image src={e.image} alt={c.name} fill draggable={false} sizes="(min-width:1024px) 33vw, (min-width:640px) 50vw, 80vw" className="object-cover transition duration-[1200ms] group-hover:scale-[1.04]" />
                  <div className="absolute left-4 top-4 flex gap-2"><Badge tone="sand" className="bg-white/90">{x.book.categories[e.category]}</Badge></div>
                  {e.video && <span className="caps absolute bottom-4 left-4 rounded-xs bg-ink/70 px-2 py-1 !text-[10px] text-white">▶ film</span>}
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <p className="caps inline-flex items-center gap-1.5 !text-[10px] text-lake"><Clock className="h-3.5 w-3.5" /> {fmt(x.book.hours, { n: e.durationH })} · {e.times[0]}{e.times.length > 1 ? " +" : ""}</p>
                  <h3 className="mt-3 font-display text-2xl leading-tight text-ink transition-colors duration-300 group-hover:text-lake">{c.name}</h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-slate">{c.tagline}</p>
                  <div className="mt-5 flex items-end justify-between gap-3 border-t border-line pt-4">
                    <p><span className="caps !text-[10px] text-slate">{x.book.from}</span> <span className="font-display text-2xl text-ink">{chf(e.price)}</span> <span className="caps !text-[10px] text-slate">{e.priceUnit === "person" ? x.book.perPerson : x.book.perGroup}</span></p>
                    <span className="rule-link caps !text-[10px] text-ink">{x.book.seeAndBook} <ArrowRight className="h-3 w-3" /></span>
                  </div>
                </div>
              </Link>
            );
          })}
        </Carousel>
      </Container>
    </section>
  );
}

export function ReviewsSection({ t }: { t: Dict }) {
  const h = t.home;
  return (
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
  );
}

export function OffersCarousel({ t }: { t: Dict }) {
  const h = t.home;
  return (
    <section className="bg-paper py-20 sm:py-28">
      <Container>
        <Carousel
          heading={<SectionHeading eyebrow={h.offers.eyebrow} title={<Rich text={h.offers.title} />} />}
          link={<RuleLink href="/offers">{h.offers.all}</RuleLink>}
          itemClass="w-[86vw] sm:w-[70vw] lg:w-[calc((100%-1.25rem)/2)]"
        >
          {OFFERS.map((o) => {
            const c = t.offers.list[o.slug] ?? o;
            return (
              <Link key={o.slug} href={`/offers#${o.slug}`} className="group lift grid h-full overflow-hidden rounded-lg bg-white ring-1 ring-ink/5 sm:grid-cols-[220px_1fr]">
                <div className="relative aspect-[4/3] overflow-hidden sm:aspect-auto">
                  <Image src={o.image} alt={plain(c.name)} fill draggable={false} sizes="(min-width:640px) 220px, 100vw" className="object-cover transition duration-[1200ms] group-hover:scale-105" />
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
        </Carousel>
      </Container>
    </section>
  );
}
