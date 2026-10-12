"use client";

import { Container } from "@/components/ui";
import { useT } from "@/i18n/context";
import { HOTEL, PROPERTIES } from "@/lib/seed";
import { SITE } from "@/lib/site";
import { MapPin } from "lucide-react";
import { LangSwitch } from "./lang-switch";
import { Link } from "./link";
import { Logo } from "./logo";
import { PaymentMarks } from "./payment-marks";
import { SwissCross } from "./swiss";

export function SiteFooter() {
  const t = useT();
  const f = t.footer;
  const f2 = SITE.features;
  const stay = [
    ...(SITE.brand.multiPlace ? [{ href: "/maison", label: f.links.maison }, { href: "/cabanes", label: f.links.cabanes }] : [{ href: "/rooms", label: f.links.rooms }]),
    { href: "/book", label: f.links.book },
    ...(f2.offers ? [{ href: "/offers", label: f.links.offers }] : []),
    ...(f2.wholePlace ? [{ href: "/request", label: f.links.groups }] : []),
  ];
  const discover = [
    ...(f2.experiences ? [{ href: "/experiences", label: f.links.experiences }] : []),
    ...(f2.dining ? [{ href: "/dining", label: f.links.dining }] : []),
    ...(f2.gallery ? [{ href: "/gallery", label: f.links.gallery }] : []),
    { href: "/contact#find-us", label: f.links.howToGetHere },
  ];
  const cols = [
    { title: f.stay, links: stay },
    { title: f.discover, links: discover },
    { title: f.house, links: [{ href: "/contact", label: f.links.contact }, { href: "/terms", label: f.links.terms }, { href: "/privacy", label: f.links.privacy }, { href: "/imprint", label: f.links.imprint }] },
  ];
  return (
    <footer className="border-t border-line bg-sand text-ink">
      <Container className="py-16 lg:py-20">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div>
            <Logo />
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-slate">{f.blurb}</p>
            <address className="mt-6 space-y-1 text-sm not-italic text-ink-soft">
              <div>{HOTEL.address}, {HOTEL.city}</div>
              <div>
                <a className="hover:text-lake" href={`tel:${HOTEL.phone.replace(/\s/g, "")}`}>{HOTEL.phone}</a>
                {" · "}
                <a className="hover:text-lake" href={`mailto:${HOTEL.email}`}>{HOTEL.email}</a>
              </div>
              <div className="text-slate">{f.reception} {t.contact.receptionHours}</div>
            </address>
          </div>
          {cols.map((col) => (
            <div key={col.title}>
              <h3 className="caps !text-[10px] text-slate">{col.title}</h3>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.href + l.label}>
                    <Link href={l.href} className="slide inline-block text-sm text-ink-soft hover:text-lake">{l.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        {/* our locations */}
        {SITE.brand.multiPlace && <div className="mt-14 border-t border-line pt-8">
          <h3 className="caps !text-[10px] text-slate">{t.places.footerTitle}</h3>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {[
              { href: "/maison", name: t.places.house.name, line: t.places.house.line, tag: t.places.house.tagline, image: PROPERTIES[0].image },
              { href: "/cabanes", name: t.places.cabanes.name, line: t.places.cabanes.line, tag: t.places.cabanes.tagline, image: PROPERTIES[1].image },
            ].map((pl) => (
              <Link key={pl.href} href={pl.href} className="group lift-sm flex items-center gap-4 rounded-lg bg-white/70 p-3 ring-1 ring-ink/5 transition hover:bg-white">
                <span className="relative h-16 w-24 shrink-0 overflow-hidden rounded-xs bg-cover bg-center" style={{ backgroundImage: pl.image ? `url(${pl.image})` : undefined }} />
                <span className="min-w-0">
                  <span className="block font-display text-xl text-ink transition-colors group-hover:text-lake">{pl.name}</span>
                  <span className="block truncate text-xs text-slate">{pl.tag}</span>
                  <span className="mt-1 flex items-center gap-1 text-xs text-ink-soft"><MapPin className="h-3 w-3 text-lake" /> {pl.line}</span>
                </span>
              </Link>
            ))}
          </div>
        </div>}

        <div className="mt-10 flex flex-col gap-6 border-t border-line pt-8 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <PaymentMarks />
            <p className="mt-3 text-xs text-slate">{f.bestRate}</p>
          </div>
          <div className="flex items-center gap-4">
            <span className="caps !text-[10px] text-slate">{t.common.language}</span>
            <LangSwitch />
          </div>
        </div>
        <div className="caps mt-8 flex flex-col gap-3 border-t border-line pt-6 !text-[10px] text-slate sm:flex-row sm:items-center sm:justify-between">
          <div className="inline-flex items-center gap-2"><SwissCross className="h-3 w-3" title={t.common.country} /> © {new Date().getFullYear()} {HOTEL.name} · {f.copyright}</div>
          <div className="flex flex-wrap items-center gap-5">
            <Link href="/office/login" className="transition hover:text-ink">{f.staffLogin}</Link>
            <a href="https://20north.art" target="_blank" rel="noopener" className="transition hover:text-ink">by 20°N</a>
          </div>
        </div>
      </Container>
    </footer>
  );
}
