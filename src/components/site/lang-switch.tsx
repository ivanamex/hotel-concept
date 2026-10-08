"use client";

import { clsx } from "clsx";
import { ChevronDown } from "lucide-react";
import NextLink from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { LANG_NAMES, LANG_SHORT, LOCALES, localePath, parsePublicPath, type Lang } from "@/i18n/config";
import { useLang } from "@/i18n/context";

function useSwitch() {
  const pathname = usePathname();
  const router = useRouter();
  const { internal } = parsePublicPath(pathname);
  return (l: Lang) => ({
    href: localePath(l, internal),
    go: (e: React.MouseEvent) => {
      e.preventDefault();
      document.cookie = `mv-lang=${l}; path=/; max-age=31536000; samesite=lax`;
      router.push(localePath(l, internal) + window.location.search);
    },
  });
}

/** EN | FR | DE | IT as one segmented control — the same page in another language. */
export function LangSwitch({ className, light }: { className?: string; light?: boolean }) {
  const lang = useLang();
  const sw = useSwitch();
  return (
    <ul className={clsx("inline-flex rounded-xs ring-1", light ? "ring-white/40" : "ring-ink/20", className)} aria-label="Language">
      {LOCALES.map((l) => {
        const { href, go } = sw(l);
        const on = l === lang;
        return (
          <li key={l}>
            <NextLink
              href={href}
              hrefLang={l}
              lang={l}
              title={LANG_NAMES[l]}
              aria-current={on ? "true" : undefined}
              onClick={go}
              className={clsx(
                "caps block px-3 py-1.5 !text-[10px] transition-colors duration-300",
                on ? (light ? "bg-white text-ink" : "bg-ink text-white") : light ? "text-white/80 hover:bg-white/10 hover:text-white" : "text-ink hover:bg-ink/5",
              )}
            >
              {LANG_SHORT[l]}
            </NextLink>
          </li>
        );
      })}
    </ul>
  );
}

/** "EN ⌄" — a small popover with the four languages (used on the desktop rail). */
export function LangMenu({ className, label }: { className?: string; label?: string }) {
  const lang = useLang();
  const sw = useSwitch();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className={clsx("relative", className)}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={label ?? "Language"}
        title={label ?? "Language"}
        className="caps inline-flex items-center gap-1 py-1 !text-[9px] text-slate transition hover:text-ink"
      >
        {LANG_SHORT[lang]}
        <ChevronDown className={clsx("h-3 w-3 transition duration-300", open && "rotate-180")} />
      </button>
      <ul
        role="listbox"
        aria-label={label ?? "Language"}
        className={clsx(
          "absolute left-full top-0 z-10 ml-3 min-w-[10rem] rounded-xs bg-white py-1 shadow-lift ring-1 ring-ink/10 transition duration-200",
          open ? "visible translate-x-0 opacity-100" : "invisible -translate-x-1 opacity-0",
        )}
      >
        {LOCALES.map((l) => {
          const { href, go } = sw(l);
          const on = l === lang;
          return (
            <li key={l} role="option" aria-selected={on}>
              <NextLink
                href={href}
                hrefLang={l}
                lang={l}
                onClick={(e) => {
                  setOpen(false);
                  go(e);
                }}
                className={clsx("flex items-center justify-between gap-4 px-4 py-2 text-[13px] transition-colors hover:bg-ink/5", on ? "text-ink" : "text-ink-soft")}
              >
                <span>{LANG_NAMES[l]}</span>
                <span className="caps !text-[9px] text-slate">{LANG_SHORT[l]}</span>
              </NextLink>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
