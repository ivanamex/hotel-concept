import { ArrowRight, MapPin } from "lucide-react";
import type { Metadata } from "next";
import { NextPage } from "@/components/site/bands";
import Image from "next/image";
import Link from "next/link";
import { InquiryForm } from "@/components/site/inquiry-form";
import { PhotoHero } from "@/components/site/page-intro";
import { Badge, Container, SectionHeading } from "@/components/ui";
import { AROUND, WITH_US } from "@/lib/content";

export const metadata: Metadata = {
  title: "Experiences around Lausanne",
  description: "The lake, the Olympic park, Lavaux vineyards, Montreux and the old town — what to do around Maison Vidy, and what we can arrange for you.",
};

export default function ExperiencesPage() {
  return (
    <>
      <PhotoHero
        image="/images/around/lavaux.jpg"
        alt="Lavaux vineyard terraces above Lake Geneva"
        eyebrow="Experiences"
        title={<>Where the lake <em>takes you.</em></>}
        lead="Half of what makes Vidy special is outside the door. Here is what we’d do with a day, a weekend or a week — and what we can book for you before you arrive."
      />

      <section className="py-20 sm:py-28">
        <Container>
          <SectionHeading eyebrow="Around the house" title={<>Eight places, <em>all close.</em></>} lead="Distances are from our front door. Ask at reception for the printed map with the bus numbers." />
          <div className="mt-12 grid gap-8 md:grid-cols-2">
            {AROUND.map((a) => (
              <article key={a.slug} id={a.slug} className="scroll-mt-28 overflow-hidden rounded-lg bg-white shadow-card ring-1 ring-ink/5">
                <div className="relative aspect-[16/9]">
                  <Image src={a.image} alt={a.name} fill sizes="(min-width:768px) 50vw, 100vw" className="object-cover" />
                  <div className="absolute left-4 top-4 flex gap-2"><Badge tone="sand" className="bg-white/90">{a.kind}</Badge></div>
                </div>
                <div className="p-6">
                  <p className="inline-flex items-center gap-1.5 caps !text-[10px] text-lake"><MapPin className="h-3.5 w-3.5" /> {a.distance}</p>
                  <h3 className="mt-3 font-display text-3xl text-ink">{a.name}</h3>
                  <p className="mt-2 leading-relaxed text-slate">{a.blurb}</p>
                  <a href="#concierge" className="rule-link caps mt-5 !text-[10px] text-ink">Ask the concierge <ArrowRight className="h-3 w-3" /></a>
                </div>
              </article>
            ))}
          </div>
        </Container>
      </section>

      <section className="bg-paper py-20 sm:py-28">
        <Container>
          <SectionHeading eyebrow="With us" title={<>Things we arrange <em>ourselves.</em></>} lead="Add them to a booking, or ask us once you’re here. Prices are per person unless noted." />
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {WITH_US.map((x) => (
              <article key={x.id} className="flex flex-col overflow-hidden rounded-lg bg-white shadow-card ring-1 ring-ink/5">
                <div className="relative aspect-[4/3]">
                  <Image src={x.image} alt={x.name} fill sizes="(min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw" className="object-cover" />
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <h3 className="font-display text-xl text-ink">{x.name}</h3>
                  <p className="caps mt-2 !text-[10px] text-lake">{x.price}</p>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-slate">{x.blurb}</p>
                  <div className="mt-4">
                    {x.extraId ? (
                      <Link href="/book" className="rule-link caps !text-[10px] text-ink">Add when booking <ArrowRight className="h-3 w-3" /></Link>
                    ) : (
                      <a href="#concierge" className="rule-link caps !text-[10px] text-ink">Ask the concierge <ArrowRight className="h-3 w-3" /></a>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </Container>
      </section>

      <section id="concierge" className="scroll-mt-20 py-20 sm:py-28">
        <Container className="grid gap-12 lg:grid-cols-[1fr_1.2fr] lg:gap-16">
          <SectionHeading eyebrow="Concierge" title={<>Tell us what you’d like. <em>We’ll sort it.</em></>} lead="Tables, tickets, a boat, a babysitter, a birthday cake. Before you arrive or while you’re here — by this form, by email or on WhatsApp." />
          <div className="rounded-lg bg-white p-6 shadow-card ring-1 ring-ink/5 sm:p-8">
            <InquiryForm type="concierge" />
          </div>
        </Container>
      </section>
      <NextPage current="/experiences" />
    </>
  );
}
