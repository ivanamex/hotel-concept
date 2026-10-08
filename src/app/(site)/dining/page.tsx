import { ArrowRight, Clock } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ExtraIcon, UNIT_LABEL } from "@/components/site/extra-icon";
import { PhotoHero } from "@/components/site/page-intro";
import { ButtonLink, Container, SectionHeading } from "@/components/ui";
import { RESTAURANT_PICKS } from "@/lib/content";
import { chf } from "@/lib/format";
import { EXTRAS, HOTEL } from "@/lib/seed";

export const metadata: Metadata = {
  title: "Dining & services",
  description: "Breakfast on the terrace, aperitif by the garden, light room service — and the services that make a stay easy: rides, parking, bikes, concierge.",
};

const BREAKFAST = [
  "Bread and croissants from the bakery on Avenue de Rhodanie",
  "Eggs the way you like them, bacon, smoked trout from the lake",
  "Gruyère, Vacherin Mont-d’Or in season, Tête de Moine",
  "Yoghurt, granola, fruit, Lavaux honey, home-made jams",
  "Fresh juice, good coffee, tea from a Lausanne tea house",
  "Gluten-free and vegan options every day",
];

export default function DiningPage() {
  return (
    <>
      <PhotoHero image="/images/house/terrace-dusk.jpg" alt="The garden terrace at dusk" eyebrow="Dining & services" title="Breakfast first. Then whatever you need." lead="We are a ten-room house, not a restaurant — so we do a few things and do them well." />

      <section className="py-20 sm:py-28">
        <Container className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
          <div className="relative aspect-[4/5] overflow-hidden rounded-2xl shadow-card">
            <Image src="/images/house/breakfast-balcony.jpg" alt="Breakfast tray on the balcony" fill sizes="(min-width:1024px) 50vw, 100vw" className="object-cover" />
          </div>
          <div>
            <SectionHeading eyebrow="Breakfast" title="On the terrace, in the salon, or on your balcony." />
            <p className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-ink"><Clock className="h-4 w-4 text-lake" /> 07:00 – 10:30 · CHF {HOTEL.breakfastPrice} per person, CHF {HOTEL.breakfastPrice / 2} for children</p>
            <ul className="mt-6 space-y-2.5">
              {BREAKFAST.map((b) => (
                <li key={b} className="flex items-start gap-2.5 text-[15px] text-ink-soft"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-lake" /> {b}</li>
              ))}
            </ul>
            <p className="mt-6 text-sm text-slate">Included in the bed & breakfast rate; otherwise add it when booking or decide each morning before 10:00.</p>
            <div className="mt-6"><ButtonLink href="/book">Book with breakfast</ButtonLink></div>
          </div>
        </Container>
      </section>

      <section className="bg-paper py-20 sm:py-28">
        <Container className="grid gap-10 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <SectionHeading eyebrow="The terrace" title="Aperitif hour." lead="From May to September the garden terrace opens at 17:00. Lavaux whites by the glass, a local beer, olives and Gruyère sticks. In winter, the salon fire and a hot chocolate." />
          </div>
          <div className="relative aspect-[16/10] overflow-hidden rounded-2xl shadow-card lg:col-span-2">
            <Image src="/images/house/restaurant.jpg" alt="The salon by the port" fill sizes="(min-width:1024px) 66vw, 100vw" className="object-cover" />
          </div>
        </Container>
        <Container className="mt-12 grid gap-6 md:grid-cols-3">
          {[
            ["Room service, light", "Soups, salads, a croque, a cheese plate, dessert of the day. Until 21:30."],
            ["Picnic basket", "For a day on the bikes or the boat: order the night before, CHF 24 per person."],
            ["Private dinner", "For celebrations we set a table in the salon and bring in a chef we trust. Ask the concierge."],
          ].map(([t, d]) => (
            <div key={t} className="rounded-2xl bg-white p-6 ring-1 ring-ink/5">
              <h3 className="font-display text-xl font-semibold text-ink">{t}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate">{d}</p>
            </div>
          ))}
        </Container>
      </section>

      <section className="py-20 sm:py-28">
        <Container>
          <SectionHeading eyebrow="Around the corner" title="Where we send people for dinner." />
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {RESTAURANT_PICKS.map((r) => (
              <div key={r.name} className="rounded-2xl bg-white p-6 shadow-card ring-1 ring-ink/5">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-lake">{r.kind}</p>
                <h3 className="mt-2 font-display text-xl font-semibold text-ink">{r.name}</h3>
                <p className="mt-1 text-sm text-slate">{r.walk}</p>
                <p className="mt-3 text-sm leading-relaxed text-ink-soft">{r.note}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section className="bg-lake-deep py-20 text-white sm:py-28">
        <Container>
          <SectionHeading light eyebrow="Services" title="The practical things, priced plainly." lead="Add any of these to a booking or ask at reception. The concierge is free; the rest is listed below." />
          <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {EXTRAS.map((e) => (
              <li key={e.id} className="flex items-start gap-4 rounded-2xl bg-white/5 p-5 ring-1 ring-white/10">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/10 text-sky"><ExtraIcon name={e.icon} /></span>
                <div>
                  <p className="font-semibold">{e.name}</p>
                  <p className="mt-0.5 text-sm text-sky/80">{e.requestOnly ? "Free" : `${chf(e.price)} ${UNIT_LABEL[e.unit]}`}</p>
                </div>
              </li>
            ))}
            {[
              ["Luggage storage", "Free, before check-in and after check-out"],
              ["Laundry", "Back the next day, priced per piece"],
              ["Dogs", "CHF 25 per night in garden and courtyard rooms"],
            ].map(([t, d]) => (
              <li key={t} className="flex items-start gap-4 rounded-2xl bg-white/5 p-5 ring-1 ring-white/10">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/10 text-sky"><ExtraIcon name="concierge" /></span>
                <div><p className="font-semibold">{t}</p><p className="mt-0.5 text-sm text-sky/80">{d}</p></div>
              </li>
            ))}
          </ul>
          <div className="mt-10 flex flex-wrap gap-3">
            <ButtonLink href="/book" variant="light">Book and add services</ButtonLink>
            <Link href="/experiences#concierge" className="inline-flex h-11 items-center gap-2 rounded-full px-5 text-[15px] font-semibold text-white ring-1 ring-white/30 hover:bg-white/10">Ask the concierge <ArrowRight className="h-4 w-4" /></Link>
          </div>
        </Container>
      </section>
    </>
  );
}
