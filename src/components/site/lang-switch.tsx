"use client";

import { clsx } from "clsx";
import NextLink from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LANG_NAMES, LANG_SHORT, LOCALES, localePath, parsePublicPath } from "@/i18n/config";
import { useLang } from "@/i18n/context";

/** EN · FR · DE · IT — the same page in another language. */
export function LangSwitch({ className, light, long }: { className?: string; light?: boolean; long?: boolean }) {
  const lang = useLang();
  const pathname = usePathname();
  const router = useRouter();
  const { internal } = parsePublicPath(pathname);
  return (
    <ul className={clsx("flex items-center gap-3", className)} aria-label="Language">
      {LOCALES.map((l) => {
        const target = localePath(l, internal);
        return (
          <li key={l}>
            <NextLink
              href={target}
              hrefLang={l}
              lang={l}
              aria-current={l === lang ? "true" : undefined}
              onClick={(e) => {
                e.preventDefault();
                document.cookie = `mv-lang=${l}; path=/; max-age=31536000; samesite=lax`;
                router.push(target + window.location.search);
              }}
              className={clsx(
                "caps !text-[10px] transition",
                l === lang ? (light ? "text-white" : "text-ink") : light ? "text-white/60 hover:text-white" : "text-slate hover:text-ink",
              )}
            >
              {long ? LANG_NAMES[l] : LANG_SHORT[l]}
            </NextLink>
          </li>
        );
      })}
    </ul>
  );
}
