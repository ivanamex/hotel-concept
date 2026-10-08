export const LOCALES = ["en", "fr", "de", "it"] as const;
export type Lang = (typeof LOCALES)[number];
export const DEFAULT_LANG: Lang = "en";

export const LANG_NAMES: Record<Lang, string> = { en: "English", fr: "Français", de: "Deutsch", it: "Italiano" };
export const LANG_SHORT: Record<Lang, string> = { en: "EN", fr: "FR", de: "DE", it: "IT" };

export function isLang(x: string | undefined | null): x is Lang {
  return !!x && (LOCALES as readonly string[]).includes(x);
}

/** Internal route key → public slug per language. Room slugs stay as they are. */
export const SECTION_SLUGS: Record<string, Record<Lang, string>> = {
  rooms: { en: "rooms", fr: "chambres", de: "zimmer", it: "camere" },
  book: { en: "book", fr: "reserver", de: "buchen", it: "prenota" },
  confirmed: { en: "confirmed", fr: "confirme", de: "bestaetigt", it: "confermata" },
  experiences: { en: "experiences", fr: "experiences", de: "erlebnisse", it: "esperienze" },
  dining: { en: "dining", fr: "table", de: "kulinarik", it: "ristorazione" },
  offers: { en: "offers", fr: "offres", de: "angebote", it: "offerte" },
  gallery: { en: "gallery", fr: "galerie", de: "galerie", it: "galleria" },
  contact: { en: "contact", fr: "contact", de: "kontakt", it: "contatto" },
  request: { en: "request", fr: "demande", de: "anfrage", it: "richiesta" },
  terms: { en: "terms", fr: "conditions", de: "agb", it: "condizioni" },
  privacy: { en: "privacy", fr: "confidentialite", de: "datenschutz", it: "privacy" },
  imprint: { en: "imprint", fr: "mentions-legales", de: "impressum", it: "note-legali" },
};

/** "/rooms/classic-lake?x=1#y" in EN → "/fr/chambres/classic-lake?x=1#y" in FR. External links pass through. */
export function localePath(lang: Lang, internal: string): string {
  if (/^(https?:|mailto:|tel:|#)/.test(internal)) return internal;
  const m = internal.match(/^([^?#]*)(.*)$/);
  const path = m?.[1] ?? internal;
  const rest = m?.[2] ?? "";
  const segs = path.split("/").filter(Boolean);
  const out = segs.map((seg, i) => {
    const key = i === 0 ? seg : i === 1 && segs[0] === "book" && seg === "confirmed" ? "confirmed" : null;
    return key && SECTION_SLUGS[key] ? SECTION_SLUGS[key][lang] : seg;
  });
  const prefix = lang === DEFAULT_LANG ? "" : `/${lang}`;
  const joined = out.length ? `/${out.join("/")}` : "";
  return `${prefix}${joined}${rest}` || "/";
}

/** Public segments (after the language prefix) → internal segments. */
export function internalSegments(lang: Lang, segs: string[]): string[] {
  return segs.map((seg, i) => {
    if (i === 0) {
      const key = Object.keys(SECTION_SLUGS).find((k) => k !== "confirmed" && SECTION_SLUGS[k][lang] === seg);
      return key ?? seg;
    }
    if (i === 1 && SECTION_SLUGS.confirmed[lang] === seg) {
      const first = Object.keys(SECTION_SLUGS).find((k) => SECTION_SLUGS[k][lang] === segs[0]);
      if (first === "book") return "confirmed";
    }
    return seg;
  });
}

/** Internal path ("/rooms/x") → alternates for hreflang. */
export function alternates(internal: string, base = "https://hotel-concept.vercel.app") {
  const languages: Record<string, string> = {};
  for (const l of LOCALES) languages[l] = base + localePath(l, internal);
  languages["x-default"] = base + localePath(DEFAULT_LANG, internal);
  return languages;
}

/** Browser pathname ("/fr/chambres/x") → the language and the internal path ("/rooms/x"). */
export function parsePublicPath(pathname: string): { lang: Lang; internal: string } {
  const segs = pathname.split("/").filter(Boolean);
  let lang: Lang = DEFAULT_LANG;
  if (isLang(segs[0])) {
    lang = segs[0];
    segs.shift();
  }
  return { lang, internal: "/" + internalSegments(lang, segs).join("/") };
}
