# STEP-12 — Languages: EN · FR · DE · IT

## Sanity
Sane — a Swiss hotel site without FR and DE is not credible; IT covers Ticino and Italian guests. Cost: one afternoon for the mechanics, the copy is concept copy I can translate myself (Ivana proofreads FR). The back office stays English.

## Build
- Routing: `/` = EN, `/fr`, `/de`, `/it` prefixes (subdirectory i18n, same as Eco Tours). Middleware reads `Accept-Language` on the first visit and redirects once; a cookie remembers the choice.
- Dictionaries: `src/i18n/{en,fr,de,it}.ts` — every string on the public site keyed, including room names kept as-is, room copy, extras, offers, attractions, FAQ, legal pages, form labels, lightbox, ticker lines, confirmation, emails later.
- Translated slugs: `/fr/chambres`, `/de/zimmer`, `/it/camere` etc. for the main sections; room slugs stay English (short, stable).
- Language switch: in the overlay menu (next to Season) and the mobile header; `hreflang` tags + per-language sitemap entries; `html lang`.
- Dates/prices: `Intl` with the locale (CHF stays CHF; 1’250 vs 1.250 handled by Intl).
- Season / ticker / live lines translated.
- Office stays EN.

## Done when
All four languages render every public page without an English leak; FR proofread by Ivana; lighthouse SEO shows alternates.
