"use client";

import { clsx } from "clsx";
import NextLink from "next/link";
import { usePathname, useRouter } from "next/navigation";
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
