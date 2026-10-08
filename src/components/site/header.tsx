"use client";

import { clsx } from "clsx";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { buttonClass } from "@/components/ui";
import { Logo } from "./logo";

const NAV = [
  { href: "/rooms", label: "Rooms" },
  { href: "/experiences", label: "Experiences" },
  { href: "/dining", label: "Dining & services" },
  { href: "/offers", label: "Offers" },
  { href: "/gallery", label: "Gallery" },
  { href: "/contact", label: "Contact" },
];

export function SiteHeader({ overlay = false }: { overlay?: boolean }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  const light = overlay && !scrolled && !open;

  return (
    <header
      className={clsx(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        light ? "bg-transparent" : "bg-sand/90 backdrop-blur-md shadow-[0_1px_0_rgba(23,26,31,0.06)]",
      )}
    >
      <div className="mx-auto flex h-[72px] max-w-[1440px] items-center justify-between px-5 sm:px-8">
        <Logo light={light} />

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Main">
          {NAV.map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(
                  "rounded-full px-3.5 py-2 text-[15px] font-medium transition",
                  light ? "text-white/85 hover:bg-white/10 hover:text-white" : "text-ink-soft hover:bg-ink/5 hover:text-ink",
                  active && (light ? "bg-white/15 text-white" : "bg-ink/5 text-ink"),
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <Link href="/book" className={clsx(buttonClass(light ? "light" : "primary", "sm"), "hidden sm:inline-flex")}>
            Check availability
          </Link>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className={clsx(
              "inline-flex h-10 w-10 items-center justify-center rounded-full lg:hidden",
              light ? "text-white hover:bg-white/10" : "text-ink hover:bg-ink/5",
            )}
            aria-expanded={open}
            aria-label={open ? "Close menu" : "Open menu"}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-line bg-sand lg:hidden">
          <nav className="mx-auto flex max-w-[1440px] flex-col px-5 py-4 sm:px-8" aria-label="Mobile">
            {NAV.map((item) => (
              <Link key={item.href} href={item.href} className="rounded-xl px-3 py-3 text-base font-medium text-ink hover:bg-ink/5">
                {item.label}
              </Link>
            ))}
            <Link href="/book" className={clsx(buttonClass("primary", "md"), "mt-3")}>
              Check availability
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
