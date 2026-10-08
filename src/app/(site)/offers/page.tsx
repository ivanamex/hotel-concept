import { Check } from "lucide-react";
import type { Metadata } from "next";
import { NextPage } from "@/components/site/bands";
import Image from "next/image";
import { PhotoHero } from "@/components/site/page-intro";
import { Badge, ButtonLink, Container } from "@/components/ui";
import { OFFERS } from "@/lib/content";

export const metadata: Metadata = {
  title: "Offers",
  description: "Stay three pay two in winter, the Lavaux weekend, an Olympic week for families — direct-booking offers at Maison Vidy.",
};

export default function OffersPage() {
  return (
    <>
      <PhotoHero image="/images/lake/swans.jpg" alt="Swans on the lake at blue hour" eyebrow="Offers" title={<>A reason to stay <em>a little longer.</em></>} lead="Three offers, only when you book here. Each one is a real plan for a few days, not a discount code." />
      <section className="py-20 sm:py-28">
        <Container className="space-y-10">
          {OFFERS.map((o, i) => (
            <article key={o.slug} id={o.slug} className="scroll-mt-28 grid overflow-hidden rounded-lg bg-white shadow-card ring-1 ring-ink/5 lg:grid-cols-2">
              <div className={`relative aspect-[4/3] lg:aspect-auto ${i % 2 ? "lg:order-2" : ""}`}>
                <Image src={o.image} alt={o.name} fill sizes="(min-width:1024px) 50vw, 100vw" className="object-cover" />
              </div>
              <div className="p-7 sm:p-10">
                <Badge tone="clay">{o.tag}</Badge>
                <h2 className="mt-4 font-display text-4xl text-ink">{o.name}</h2>
                <p className="mt-1 text-sm text-slate">{o.dates}</p>
                <p className="mt-4 leading-relaxed text-ink-soft">{o.summary}</p>
                <ul className="mt-5 grid gap-2 sm:grid-cols-2">
                  {o.includes.map((x) => (
                    <li key={x} className="flex items-start gap-2 text-sm text-ink-soft"><Check className="mt-0.5 h-4 w-4 shrink-0 text-moss" /> {x}</li>
                  ))}
                </ul>
                <div className="mt-6 flex flex-wrap items-center gap-4">
                  <ButtonLink href={`/book?offer=${o.slug}`} arrow>Book this offer</ButtonLink>
                  <span className="caps !text-[10.5px] text-lake">{o.from}</span>
                </div>
              </div>
            </article>
          ))}
        </Container>
      </section>
      <NextPage current="/offers" />
    </>
  );
}
