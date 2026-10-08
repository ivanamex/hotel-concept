# STEP-06 — Contact, requests, legal, 404, metadata

- `/contact` — address, phone, email, WhatsApp, opening hours of reception; contact form (name, email, subject, message) → inquiry `contact`; map embed; how to get here.
- `/request` — reservation request for things the engine doesn't do online: groups (5+ rooms), long stays, events. Form → inquiry `group`.
- `/privacy`, `/imprint` (Swiss sites need an Impressum), `/terms` (cancellation, city tax, check-in times).
- `not-found.tsx` on brand.
- `sitemap.ts` + `robots.ts` (disallow all while demo), per-page metadata, OG image.
- Cookie notice: single line, no tracking in the demo.

## Done when
Every form shows success state and appears in /office inbox; all legal links in the footer resolve.
