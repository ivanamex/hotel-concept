import Link from "next/link";
import { HOTEL } from "@/lib/seed";
import { Container } from "@/components/ui";
import { Logo } from "./logo";

const COLS = [
  { title: "Stay", links: [{ href: "/rooms", label: "Rooms & suites" }, { href: "/book", label: "Book direct" }, { href: "/offers", label: "Offers" }, { href: "/request", label: "Groups & long stays" }] },
  { title: "Discover", links: [{ href: "/experiences", label: "Experiences" }, { href: "/dining", label: "Dining & services" }, { href: "/gallery", label: "Gallery" }, { href: "/contact", label: "How to get here" }] },
  { title: "House", links: [{ href: "/contact", label: "Contact" }, { href: "/terms", label: "Terms & policies" }, { href: "/privacy", label: "Privacy" }, { href: "/imprint", label: "Imprint" }] },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-line bg-sand text-ink">
      <Container className="py-16 lg:py-20">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div>
            <Logo />
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-slate">
              Ten rooms in a lakeside house in Vidy, Lausanne. The lake at the end of the street, the Olympic park next door, the old town fifteen minutes away.
            </p>
            <address className="mt-6 space-y-1 text-sm not-italic text-ink-soft">
              <div>{HOTEL.address}, {HOTEL.city}</div>
              <div>
                <a className="hover:text-lake" href={`tel:${HOTEL.phone.replace(/\s/g, "")}`}>{HOTEL.phone}</a>
                {" · "}
                <a className="hover:text-lake" href={`mailto:${HOTEL.email}`}>{HOTEL.email}</a>
              </div>
              <div className="text-slate">Reception {HOTEL.receptionHours}</div>
            </address>
          </div>
          {COLS.map((col) => (
            <div key={col.title}>
              <h3 className="caps !text-[10px] text-slate">{col.title}</h3>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.href + l.label}>
                    <Link href={l.href} className="text-sm text-ink-soft transition hover:text-lake">{l.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="caps mt-14 flex flex-col gap-3 border-t border-line pt-6 !text-[10px] text-slate sm:flex-row sm:items-center sm:justify-between">
          <div>© {new Date().getFullYear()} {HOTEL.name} · Lausanne · Switzerland</div>
          <div className="flex items-center gap-5">
            <Link href="/office/login" className="transition hover:text-ink">Staff login</Link>
            <a href="https://20north.art" target="_blank" rel="noopener" className="transition hover:text-ink">by 20°N</a>
          </div>
        </div>
      </Container>
    </footer>
  );
}
