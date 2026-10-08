import type { Metadata } from "next";
import { DEFAULT_LANG, alternates, isLang, localePath } from "./config";

/** Title, description and the hreflang set for one public page. `internal` is the EN path ("/rooms/x"). */
export function pageMeta(lang: string, internal: string, m: { title?: string; description?: string; image?: string } = {}): Metadata {
  const l = isLang(lang) ? lang : DEFAULT_LANG;
  return {
    title: m.title,
    description: m.description,
    alternates: { canonical: localePath(l, internal), languages: alternates(internal) },
    openGraph: m.image ? { images: [{ url: m.image }] } : undefined,
  };
}

/** Page params under /[lang]. */
export type LangParams = { params: Promise<{ lang: string }> };
export type LangSlugParams = { params: Promise<{ lang: string; slug: string }> };
