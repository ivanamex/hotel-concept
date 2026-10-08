"use client";

import { Container } from "@/components/ui";
import { useT } from "@/i18n/context";
import { HOTEL } from "@/lib/seed";
import { LangSwitch } from "./lang-switch";
import { Link } from "./link";
import { Logo } from "./logo";
import { PaymentMarks } from "./payment-marks";
import { SwissCross } from "./swiss";

export function SiteFooter() {
  const t = useT();
  const f = t.footer;
  const cols = [
    { title: f.stay, links: [{ href: "/rooms", label: f.links.rooms }, { href: "/book", label: f.links.book }, { href: "/offers", label: f.links.offers }, { href: "/request", label: f.links.groups }] },
    { title: f.discover, links: [{ href: "/experiences", label: f.links.experiences }, { href: "/dining", label: f.links.dining }, { href: "/gallery", label: f.links.gallery }, { href: "/contact#find-us", label: f.links.howToGetHere }] },
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
        <div className="mt-14 flex flex-col gap-6 border-t border-line pt-8 lg:flex-row lg:items-center lg:justify-between">
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
