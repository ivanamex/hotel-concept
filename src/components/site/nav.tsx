"use client";

import { clsx } from "clsx";
import { ArrowUpRight, Menu, X } from "lucide-react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useHref, useLang, useT } from "@/i18n/context";
import { LANG_SHORT } from "@/i18n/config";
import { HOTEL } from "@/lib/seed";
import { resolveSeason } from "@/lib/season";
import { useHotel, useHydrated } from "@/lib/store";
import { LangSwitch } from "./lang-switch";
import { Link } from "./link";
import { Mark } from "./logo";
import { scrollTo } from "./motion";
import { whatsappUrl } from "./whatsapp";

export const NAV = [
  { key: "home", href: "/", image: "/images/lake/aerial-dusk.jpg" },
  { key: "rooms", href: "/rooms", image: "/images/rooms/room-junior-suite.jpg" },
  { key: "experiences", href: "/experiences", image: "/images/around/lavaux.jpg" },
  { key: "dining", href: "/dining", image: "/images/house/terrace-dusk.jpg" },
  { key: "offers", href: "/offers", image: "/images/lake/swans.jpg" },
  { key: "gallery", href: "/gallery", image: "/images/lake/marina.jpg" },
  { key: "contact", href: "/contact", image: "/images/lake/terrace-view.jpg" },
] as const;

export function SiteNav() {
  const pathname = usePathname();
  const t = useT();
  const lang = useLang();
  const href = useHref();
  const home = href("/");
  const [open, setOpen] = useState(false);
  const [hover, setHover] = useState(0);
  const hydrated = useHydrated();
  const settings = useHotel((s) => s.settings);
  const updateSettings = useHotel((s) => s.updateSettings);
  const season = hydrated ? resolveSeason(settings.seasonOverride) : "summer";

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    document.documentElement.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.documentElement.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      {/* desktop rail */}
      <aside className="fixed inset-y-0 left-0 z-50 hidden w-rail flex-col items-center justify-between border-r border-line bg-sand lg:flex">
        <div className="w-full">
          <button type="button" onClick={() => setOpen(true)} className="flex h-20 w-full flex-col items-center justify-center gap-1.5 border-b border-line text-ink transition duration-300 hover:bg-ink hover:text-white" aria-label={t.nav.openMenu}>
            <Menu className="h-5 w-5" />
            <span className="caps !text-[9px]">{t.nav.menu}</span>
          </button>
          <button type="button" onClick={() => setOpen(true)} className="caps mt-3 block w-full py-1 !text-[9px] text-slate transition hover:text-ink" aria-label={t.common.language} title={t.common.language}>
            {LANG_SHORT[lang]}
          </button>
        </div>
        <Link href="/" onClick={(e) => { if (pathname === home) { e.preventDefault(); scrollTo(0); } }} className="flex flex-col items-center gap-4" aria-label={t.nav.homeLabel}>
          <Mark className="h-7 w-7" />
          <span className="caps !text-[9px] text-slate">{t.nav.home}</span>
          <span className="caps rotate-180 !text-[10px] text-ink [writing-mode:vertical-rl]">{t.nav.rail}</span>
        </Link>
        <Link href="/book" className="flex h-36 w-full items-center justify-center bg-lake text-white transition duration-300 hover:bg-lake-deep">
          <span className="caps rotate-180 !text-[10.5px] [writing-mode:vertical-rl]">{t.nav.bookRail}</span>
        </Link>
      </aside>

      {/* mobile top bar */}
      <header className="fixed inset-x-0 top-0 z-50 flex h-16 items-center justify-between border-b border-line bg-sand/95 px-5 backdrop-blur lg:hidden">
        <Link href="/" className="inline-flex items-center gap-2" aria-label={t.nav.homeLabel}>
          <Mark className="h-7 w-7" />
          <span className="font-display text-2xl text-ink">Maison Vidy</span>
        </Link>
        <div className="flex items-center gap-2">
          <Link href="/book" className="sweep caps rounded-xs bg-lake px-3 py-2 !text-[10px] text-white [--sweep:var(--color-lake-deep)]">{t.common.book}</Link>
          <button type="button" onClick={() => setOpen(true)} className="flex h-10 w-10 items-center justify-center text-ink" aria-label={t.nav.openMenu}>
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </header>

      {/* overlay menu */}
      <div
        className={clsx(
          "fixed inset-0 z-[70] grid bg-sand transition-[opacity,visibility] duration-500 lg:grid-cols-[1.1fr_1fr]",
          open ? "visible opacity-100" : "invisible opacity-0",
        )}
        role="dialog"
        aria-modal="true"
        aria-label={t.nav.menu}
      >
        <div className="flex flex-col justify-between px-6 pb-8 pt-6 sm:px-10 lg:px-16 lg:pb-12 lg:pt-10">
          <div className="flex items-center justify-between">
            <Link href="/" className="inline-flex items-center gap-2.5">
              <Mark className="h-8 w-8" />
              <span className="font-display text-2xl text-ink">Maison Vidy</span>
            </Link>
            <button type="button" onClick={() => setOpen(false)} className="flex h-11 w-11 items-center justify-center rounded-xs text-ink transition hover:bg-ink hover:text-white" aria-label={t.nav.closeMenu}>
              <X className="h-5 w-5" />
            </button>
          </div>

          <nav className="my-10" aria-label="Main">
            <ol>
              {NAV.map((item, i) => {
                const local = href(item.href);
                const active = item.href === "/" ? pathname === home : pathname === local || pathname.startsWith(local + "/");
                return (
                  <li key={item.href} className="border-b border-line">
                    <Link
                      href={item.href}
                      onMouseEnter={() => setHover(i)}
                      onFocus={() => setHover(i)}
                      className={clsx(
                        "group slide flex items-baseline gap-5 py-3 sm:py-3.5",
                        open && "animate-[fade-up_0.6s_both]",
                      )}
                      style={{ animationDelay: `${120 + i * 50}ms` }}
                    >
                      <span className="caps w-6 !text-[10px] text-slate">0{i}</span>
                      <span className={clsx("font-display text-3xl leading-none text-ink transition sm:text-4xl lg:text-[2.6rem]", active ? "italic" : "group-hover:italic")}>{t.nav.items[item.key].label}</span>
                      <ArrowUpRight className="ml-auto h-5 w-5 shrink-0 text-slate opacity-0 transition group-hover:opacity-100" />
                    </Link>
                  </li>
                );
              })}
            </ol>
          </nav>

          <div className="grid gap-6 text-sm text-ink-soft sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <p className="caps mb-2 !text-[10px] text-slate">{t.common.language}</p>
              <LangSwitch />
            </div>
            <div>
              <p className="caps mb-2 !text-[10px] text-slate">{t.nav.season}</p>
              <div className="inline-flex rounded-xs ring-1 ring-ink/20">
                {(["winter", "summer"] as const).map((s) => (
                  <button key={s} type="button" onClick={() => updateSettings({ seasonOverride: s })} className={clsx("caps px-3 py-1.5 !text-[10px] transition", season === s ? "bg-ink text-white" : "text-ink hover:bg-ink/5")}>
                    {t.nav[s]}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="caps mb-2 !text-[10px] text-slate">{t.nav.reception}</p>
              <a href={`tel:${HOTEL.phone.replace(/\s/g, "")}`} className="block hover:text-ink">{HOTEL.phone}</a>
              <a href={whatsappUrl(t.common.whatsappGreeting)} target="_blank" rel="noopener" className="block hover:text-ink">WhatsApp</a>
            </div>
            <div>
              <p className="caps mb-2 !text-[10px] text-slate">{t.nav.findUs}</p>
              <p>{HOTEL.address}<br />{HOTEL.city}</p>
            </div>
          </div>
        </div>

        <div className="relative hidden overflow-hidden lg:block">
          {NAV.map((item, i) => (
            <div key={item.href} className={clsx("absolute inset-0 transition-opacity duration-700", hover === i ? "opacity-100" : "opacity-0")}>
              <Image src={item.image} alt="" fill sizes="50vw" className="object-cover" />
            </div>
          ))}
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/70 to-transparent p-10">
            <p className="caps !text-[10px] text-sky">{t.nav.items[NAV[hover].key].label}</p>
            <p className="mt-1 font-display text-2xl text-white">{t.nav.items[NAV[hover].key].note}</p>
          </div>
        </div>
      </div>
    </>
  );
}
