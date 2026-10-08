# STEP-12 — Languages: EN · FR · DE · IT

Status: DONE 8 Oct 2026 (go at 15:25, pushed ~17:00). FR proofread by Ivana still open.

## Sanity
Sane — a Swiss hotel site without FR and DE is not credible; IT covers Ticino and Italian guests. The back office stays English.

## Built
- Routing: `/` = EN, `/fr`, `/de`, `/it` prefixes. `src/proxy.ts` rewrites the public URL to the internal `[lang]` route, redirects `/en/...` to the bare path, and on the very first visit to `/` follows the browser language once (cookie `mv-lang` remembers it; the switch sets the cookie too).
- Dictionaries: `src/i18n/{en,fr,de,it}.ts`, one shape (`Dict = typeof en`), every public string keyed — room copy, extras, rate plans, offers, attractions, activities, FAQ, legal pages, forms, lightbox, ticker, booking engine, confirmation, 404. Room names (Classic Lake …) stay as product names.
- Translated section slugs: `/fr/chambres`, `/de/zimmer`, `/it/camere`, `/fr/reserver`, `/de/buchen`, `/it/prenota`, `/de/kulinarik`, `/it/ristorazione`, `/fr/offres`, `/de/angebote`, `/fr/galerie`, `/de/kontakt`, `/fr/demande`, `/de/anfrage`, `/fr/conditions`, `/de/agb`, `/fr/confidentialite`, `/de/datenschutz`, `/fr/mentions-legales`, `/de/impressum` … Room slugs stay English.
- Language switch: in the overlay menu (first column, full names) and in the footer line (EN · FR · DE · IT), always to the same page in the other language, query string kept.
- `html lang`, `hreflang` alternates + canonical on every page, sitemap with all four languages, OpenGraph locale.
- Dates in the visitor's language (short month names per language), guests/nights pluralised per language, "Lake view" compounds (Seeblick / Vue lac / Vista lago).
- 404 in the visitor's language under any prefix.
- Office stays EN (its labels read the English dictionary).

## Decisions
- Swiss conventions in all four: CHF with the apostrophe thousands separator, 24 h times, metric; DE in Swiss Standard German (ss, no ß); FR with "petit-déjeuner" and "Impressum"; IT formal Lei in prose, imperative on buttons.
- "À bientôt — Maison Vidy" stays French in all languages (the house's own sign-off).
- No per-language room names and no per-language photos.

## Open
- FR proofread by Ivana; DE/IT proofread by the client's reception before go-live.
- Confirmation email (STEP-14 payments) will use the same dictionary.
