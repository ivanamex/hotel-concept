import { Clock, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import type { Metadata } from "next";
import { LocationBlock, NextPage } from "@/components/site/bands";
import { InquiryForm } from "@/components/site/inquiry-form";
import { Link } from "@/components/site/link";
import { PageIntro } from "@/components/site/page-intro";
import { whatsappUrl } from "@/components/site/whatsapp";
import { Container } from "@/components/ui";
import { getDict } from "@/i18n";
import { pageMeta, type LangParams } from "@/i18n/meta";
import { Rich } from "@/i18n/rich";
import { HOTEL } from "@/lib/seed";

export async function generateMetadata({ params }: LangParams): Promise<Metadata> {
  const { lang } = await params;
  const t = getDict(lang);
  return pageMeta(lang, "/contact", { title: t.contact.metaTitle, description: t.contact.metaDescription });
}

export default async function ContactPage({ params }: LangParams) {
  const { lang } = await params;
  const t = getDict(lang);
  const c = t.contact;
  return (
    <>
      <PageIntro eyebrow={c.eyebrow} title={<Rich text={c.title} />} lead={c.lead} crumb={t.nav.items.contact.label} />
      <section className="pb-20 sm:pb-28">
        <Container className="grid gap-10 lg:grid-cols-[1fr_1.3fr] lg:gap-16">
          <div className="divide-y divide-line border-y border-line lg:self-start">
            {[
              { icon: Phone, t: c.phone, d: HOTEL.phone, href: `tel:${HOTEL.phone.replace(/\s/g, "")}` },
              { icon: MessageCircle, t: c.whatsapp, d: c.whatsappText, href: whatsappUrl(t.common.whatsappGreeting) },
              { icon: Mail, t: c.email, d: HOTEL.email, href: `mailto:${HOTEL.email}` },
              { icon: MapPin, t: c.address, d: `${HOTEL.address}, ${HOTEL.city}, ${t.common.country}` },
              { icon: Clock, t: c.reception, d: c.receptionHours },
            ].map((x) => (
              <div key={x.t} className="row-slide-item flex items-start gap-4 py-5">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-mist text-lake"><x.icon className="h-5 w-5" /></span>
                <div>
                  <p className="caps !text-[10px] text-slate">{x.t}</p>
                  {x.href ? <a href={x.href} target={x.href.startsWith("http") ? "_blank" : undefined} rel="noopener" className="mt-0.5 block font-semibold text-ink hover:text-lake">{x.d}</a> : <p className="mt-0.5 font-semibold text-ink">{x.d}</p>}
                </div>
              </div>
            ))}
          </div>
          <div>
            <div>
              <h2 className="font-display text-3xl text-ink"><Rich text={c.writeTitle} /></h2>
              <p className="mt-1 mb-6 text-sm text-slate">{c.writeLead} <Link href="/request" className="font-semibold text-lake">{c.writeLeadLink}</Link>.</p>
              <InquiryForm type="contact" />
            </div>
            <div className="mt-10">
              <h2 className="font-display text-3xl text-ink"><Rich text={c.faqTitle} /></h2>
              <dl className="mt-4 divide-y divide-line border-y border-line">
                {c.faq.map((f) => (
                  <details key={f.q} className="group row-slide py-5">
                    <summary className="cursor-pointer list-none font-semibold text-ink marker:hidden hover:text-lake">{f.q}</summary>
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
