import { Clock, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import type { Metadata } from "next";
import { LocationBlock, NextPage } from "@/components/site/bands";
import { InquiryForm } from "@/components/site/inquiry-form";
import { PageIntro } from "@/components/site/page-intro";
import { whatsappUrl } from "@/components/site/whatsapp";
import { Container } from "@/components/ui";
import { FAQ } from "@/lib/content";
import { HOTEL } from "@/lib/seed";

export const metadata: Metadata = { title: "Contact", description: "Reach Maison Vidy by phone, email, WhatsApp or the form — and find out how to get to Vidy, Lausanne." };

export default function ContactPage() {
  return (
    <>
      <PageIntro eyebrow="Contact" title={<>A person <em>answers.</em></>} lead="Reception is staffed from 07:00 to 22:00. Outside those hours, messages are read first thing in the morning — and a night bell wakes someone up if you’re locked out." />
      <section className="pb-20 sm:pb-28">
        <Container className="grid gap-10 lg:grid-cols-[1fr_1.3fr] lg:gap-16">
          <div className="space-y-4">
            {[
              { icon: Phone, t: "Phone", d: HOTEL.phone, href: `tel:${HOTEL.phone.replace(/\s/g, "")}` },
              { icon: MessageCircle, t: "WhatsApp", d: "Message reception", href: whatsappUrl() },
              { icon: Mail, t: "Email", d: HOTEL.email, href: `mailto:${HOTEL.email}` },
              { icon: MapPin, t: "Address", d: `${HOTEL.address}, ${HOTEL.city}` },
              { icon: Clock, t: "Reception", d: HOTEL.receptionHours },
            ].map((x) => (
              <div key={x.t} className="flex items-start gap-4 rounded-lg bg-white p-5 ring-1 ring-ink/5">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-mist text-lake"><x.icon className="h-5 w-5" /></span>
                <div>
                  <p className="caps !text-[10px] text-slate">{x.t}</p>
                  {x.href ? <a href={x.href} target={x.href.startsWith("http") ? "_blank" : undefined} rel="noopener" className="mt-0.5 block font-semibold text-ink hover:text-lake">{x.d}</a> : <p className="mt-0.5 font-semibold text-ink">{x.d}</p>}
                </div>
              </div>
            ))}
          </div>
          <div>
            <div className="rounded-lg bg-white p-6 shadow-card ring-1 ring-ink/5 sm:p-8">
              <h2 className="font-display text-3xl text-ink">Write <em>to us</em></h2>
              <p className="mt-1 mb-6 text-sm text-slate">For groups of five rooms or more, or stays over two weeks, use the <a href="/request" className="font-semibold text-lake">request form</a>.</p>
              <InquiryForm type="contact" />
            </div>
            <div className="mt-10">
              <h2 className="font-display text-3xl text-ink">Questions we get <em>a lot</em></h2>
              <dl className="mt-4 divide-y divide-line rounded-lg bg-white ring-1 ring-ink/5">
                {FAQ.map((f) => (
                  <details key={f.q} className="group p-5">
                    <summary className="cursor-pointer list-none font-semibold text-ink marker:hidden">{f.q}</summary>
                    <p className="mt-2 text-sm leading-relaxed text-slate">{f.a}</p>
                  </details>
                ))}
              </dl>
            </div>
          </div>
        </Container>
      </section>
      <LocationBlock compact />
      <NextPage current="/contact" />
    </>
  );
}
