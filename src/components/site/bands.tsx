"use client";

import { ArrowRight } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { Container, RuleLink } from "@/components/ui";
import { useT } from "@/i18n/context";
import { Rich } from "@/i18n/rich";
import { HOTEL } from "@/lib/seed";
import { ContactModal } from "./contact-modal";
import { Link } from "./link";
import { InView, Reveal } from "./motion";
import { VideoLayer } from "./video-layer";
import { whatsappUrl } from "./whatsapp";

/* ---------- VIDY: video inside the letters ---------- */

export function KnockoutBand({ video = ["/videos/swans.mp4", "/videos/aerial-dusk.mp4"], image = "/images/lake/swans.jpg" }: { video?: string | string[]; image?: string }) {
  const t = useT();
  return (
    <section className="relative isolate overflow-hidden bg-black" aria-label={t.home.vidy.label}>
      <VideoLayer video={video} image={image} alt="" drift />
      {/* black everywhere except the letters: multiply keeps the media only inside white glyphs */}
      <div className="relative flex items-center justify-center bg-black py-6 mix-blend-multiply sm:py-10">
        <span className="select-none font-display text-[27vw] font-bold leading-[0.8] tracking-[-0.01em] text-white lg:text-[24vw]">
          VIDY
        </span>
      </div>
      <div className="absolute inset-x-0 bottom-0 flex items-center justify-between px-5 pb-5 sm:px-8 lg:px-12">
        <span className="caps !text-[10px] text-white/60">{t.home.vidy.coords}</span>
        <span className="caps !text-[10px] text-white/60">{t.home.vidy.lake}</span>
      </div>
    </section>
  );
}

/* ---------- Closing: Come stay with us ---------- */

export function Closing() {
  const t = useT();
  const c = t.home.closing;
  const [contact, setContact] = useState(false);
  const lineCls = "group inline-flex items-center gap-3 font-display text-3xl text-ink transition hover:text-lake sm:text-4xl";
  const arrow = <ArrowRight className="h-5 w-5 opacity-0 transition group-hover:translate-x-1 group-hover:opacity-100" />;
  return (
    <section className="relative flex min-h-[88svh] items-center overflow-hidden bg-sand py-24 sm:py-32">
      <Container className="w-full">
        <div className="grid items-center gap-14 lg:grid-cols-[1.5fr_1fr] lg:gap-20">
          <div>
            <Reveal as="h2" className="font-display text-[3.6rem] leading-[0.95] text-ink sm:text-7xl lg:text-[6rem] xl:text-[7rem]">
              <Rich text={c.title} />
            </Reveal>
            <InView className="mt-3 pl-1">
              <span className="write-in font-script block text-[3.6rem] leading-none text-lake sm:text-[4.8rem] lg:text-[6rem]">{c.script}</span>
            </InView>
          </div>
          <ul className="space-y-5">
            <li><Link href="/book" className={lineCls}>{c.bookRoom} {arrow}</Link></li>
            <li><Link href="/contact#find-us" className={lineCls}>{c.findWay} {arrow}</Link></li>
            <li><button type="button" onClick={() => setContact(true)} className={lineCls}>{c.write} {arrow}</button></li>
            <li><a href={whatsappUrl(t.common.whatsappGreeting)} target="_blank" rel="noopener" className={lineCls}>{c.whatsapp} {arrow}</a></li>
          </ul>
        </div>
      </Container>
      <ContactModal open={contact} onClose={() => setContact(false)} />
    </section>
  );
}

/* ---------- Page break: the lake film ---------- */

export function FilmBreak() {
  const { film } = useT().home;
  return (
    <section className="relative overflow-hidden bg-ink">
      <div className="relative aspect-[16/9] max-h-[86vh] w-full">
        <VideoLayer video={["/videos/hero.mp4", "/videos/aerial-dusk.mp4"]} image="/images/lake/aerial-dusk.jpg" alt={film.alt} driftVideo={false} />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/60 via-transparent to-ink/10" />
        <div className="absolute inset-x-0 bottom-0 p-6 sm:p-10 lg:p-14">
          <p className="caps !text-[10px] text-sky">{film.eyebrow}</p>
          <p className="mt-3 max-w-xl font-display text-3xl leading-tight text-white sm:text-4xl lg:text-5xl"><Rich text={film.title} /></p>
          <div className="mt-6"><RuleLink href="/experiences" light>{film.cta}</RuleLink></div>
        </div>
      </div>
    </section>
  );
}

/* ---------- Location block (illustrated map) ---------- */

export function LocationBlock({ compact = false }: { compact?: boolean }) {
  const t = useT();
  const l = t.location;
  const maps = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${HOTEL.name}, ${HOTEL.address}, ${HOTEL.city}`)}`;
  return (
    <section id="find-us" className="grid scroll-mt-16 lg:grid-cols-2">
      <div className="relative min-h-[320px] bg-[#f3eee4] sm:min-h-[420px] lg:min-h-[560px]">
        <Image src="/images/around/map.jpg" alt={l.mapAlt} fill sizes="(min-width:1024px) 50vw, 100vw" className="object-cover object-center" />
      </div>
      <div className="flex flex-col items-center justify-center bg-lake-deep px-6 py-16 text-center text-white sm:px-12 lg:py-24">
        <p className="caps !text-[10px] text-sky">{l.eyebrow}</p>
        <h2 className="mt-4 font-display text-4xl sm:text-5xl">{HOTEL.name}</h2>
        <p className="mt-4 text-sky/90">{HOTEL.address}<br />{HOTEL.city}</p>
        <a href={maps} target="_blank" rel="noopener" className="ticket caps mt-6 inline-flex h-12 items-center gap-3 rounded-xs px-6 !text-[11px] text-white ring-1 ring-inset ring-white/60 transition hover:bg-white hover:text-ink">{l.maps} <ArrowRight className="arrow h-3.5 w-3.5" /></a>
        <div className="mt-8 space-y-1 text-sky/90">
          <a href={`mailto:${HOTEL.email}`} className="block hover:text-white">{HOTEL.email}</a>
          <a href={`tel:${HOTEL.phone.replace(/\s/g, "")}`} className="block hover:text-white">T. {HOTEL.phone}</a>
        </div>
        <a href={whatsappUrl(t.common.whatsappGreeting)} target="_blank" rel="noopener" className="ticket caps mt-6 inline-flex h-12 items-center gap-3 rounded-xs px-6 !text-[11px] text-white ring-1 ring-inset ring-white/60 transition hover:bg-white hover:text-ink">{l.whatsapp} <ArrowRight className="arrow h-3.5 w-3.5" /></a>
        {!compact && (
          <ul className="mt-10 flex items-center gap-5 text-sky/80">
            {l.socials.map((s) => (
              <li key={s}><a href="#" className="caps !text-[10px] hover:text-white">{s}</a></li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

/* ---------- Next page ---------- */

const ORDER = [
  { href: "/", key: "home" },
  { href: "/rooms", key: "rooms" },
  { href: "/experiences", key: "experiences" },
  { href: "/dining", key: "dining" },
  { href: "/offers", key: "offers" },
  { href: "/gallery", key: "gallery" },
  { href: "/contact", key: "contact" },
] as const;

export function NextPage({ current }: { current: string }) {
  const t = useT();
  const i = ORDER.findIndex((o) => o.href === current);
  const next = ORDER[(i + 1) % ORDER.length];
  return (
    <section className="border-t border-line bg-paper">
      <Container>
        <Link href={next.href} className="group flex items-center justify-between py-10 sm:py-14">
          <div>
            <p className="caps !text-[10px] text-slate">{t.common.nextPage}</p>
            <p className="mt-2 font-display text-3xl text-ink transition group-hover:italic sm:text-4xl lg:text-5xl">{t.nav.items[next.key].label}</p>
          </div>
          <span className="flex h-12 w-12 items-center justify-center rounded-xs bg-ink text-white transition group-hover:bg-lake sm:h-14 sm:w-14"><ArrowRight className="h-5 w-5 transition group-hover:translate-x-0.5" /></span>
        </Link>
      </Container>
    </section>
  );
}
