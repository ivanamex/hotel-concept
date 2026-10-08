# RUN-ORDER — hotel-concept (Maison Vidy, Lausanne)

Concept showcase for 20 North: a 10-room lakeside boutique hotel in Vidy, Lausanne.
Public site with direct booking + back office. Demo data, no backend yet.

## Now
- Ivana clicks through round 4 (forms as lines, hover motion) and the four languages; FR proofread
- Golden aerial clip (Gemini) when it comes → re-cut the lake film with it first

## Next
- STEP-13 Supabase backend (rooms, reservations, inquiries, subscribers, auth for /office) — replaces the local demo store
- STEP-14 Payments (Stripe or Datatrans for CH) + email confirmations (Resend)
- STEP-15 Channel manager (Channex.io) for Booking.com, Expedia, Airbnb, Google — availability + rates out, bookings in by webhook
- STEP-16 Real photography + hotel's own copy, domain, go-live checklist (SEO, analytics, cookie consent)

## Done
- STEP-12 Languages EN · FR · DE · IT — `/fr /de /it`, translated section slugs, dictionaries for every public string, switch in menu + footer, hreflang + sitemap; office stays EN
- STEP-01 Foundation: Next.js + Tailwind, fonts, tokens, header/footer/WhatsApp, data model + seed (10 rooms, 40 reservations), pricing + availability engine
- STEP-02 Home page
- STEP-03 Rooms list + room detail
- STEP-04 Booking engine (/book): dates + guests → available rooms → extras → guest details → confirmation
- STEP-05 Experiences (around Lausanne + hotel activities), Dining & services, Offers, Gallery
- STEP-06 Contact (form, map, WhatsApp), reservation request, legal pages, 404, metadata (noindex while demo)
- STEP-07 Back office shell: login, sidebar, overview dashboard
- STEP-08 Back office modules: reservations, calendar, rooms, rates & extras, guests, inbox, settings
- STEP-09 QA + deploy — live at https://hotel-concept.vercel.app (auto-deploys from main)
- STEP-14 Round 4 — pinned rooms track back (arrows, "Skip the rooms", faster pass); lightbox returns every visit until subscribed; forms as lines on the background (contact, request, booking, lightbox, office login); hover motion on every card, tile, row and button (lift, slide, sweep fill)
- STEP-13 Round 3 — hero = entrance film looping at native speed, lake film as page break, Home in the menu + breadcrumbs + HOME on the rail, close × on booking and confirmation
- STEP-11 Round 2 — Cormorant Garamond, motion on every clip, parallax intro photos, closing section + contact modal + WhatsApp line, swans in the VIDY band, rooms track without scroll-hijack, back-to-top, skew protection + chunk-reload guard, hash links
- STEP-10 Polish round 1 — serif/caps/grotesk type system, ticket buttons, rail + overlay menu, hero carousel with video, ticker, horizontal rooms track, step-inside video, illustrated map block, script accents, VIDY video band, next-page links, email lightbox + VIDY10 code + subscribers in the office, Winter/Summer mode

## Notes — answers if anyone asks
- Is the back office the real estate CRM (Riviera Match / WB admin)? No. Written new for hotel objects (rooms × nights calendar, rate plans, extras, city tax); only the dashboard pattern (sidebar, tables, drawers) is shared
- Booking.com / Expedia / Airbnb / Google integration? Yes, through a channel manager — OTAs only open their APIs to certified connectivity partners, a 10-room hotel never connects direct. Pick for a custom back office: Channex.io (API-first, ~CHF 20–40/month): we push availability + rates, it pushes OTA bookings back by webhook, dates blocked both ways. Alternatives: Beds24, Smoobu. iCal sync is the cheap fallback (availability only, delayed). STEP-14
- Do website bookings show in the back office straight away? Yes — written to the reservations table, visible in calendar and list with no retyping. In the demo the data lives in the browser (same browser only); after STEP-12 it is real-time across devices plus an email/WhatsApp ping to reception

## Rules
- One step at a time; nothing is built without its STEP file
- Push to main after every step; Ivana checks in the browser and says "ok"
- Demo only: data lives in the browser (seeded on first load, "Reset demo data" in /office settings)
- Hotel name, address, phone, email, prices and reviews are concept placeholders — replace before any client use
- Photos: rooms 1–3, 5, 9 and the house shots are the client's own; the rest are generated concept images and clips (public/videos), to be replaced by real photography at go-live
- Promo code VIDY10 (10 % off the room) is the demo newsletter code; the lightbox comes back every visit until someone subscribes (then quiet for 30 days)
- Every screen that takes over (booking, modals, menu, lightbox) has a visible close and a way back — functionality before looks
- No traces: nothing shipped names a tool, a model or a step; commit attribution off
- Forms sit on the background as lines (`form-lines`); every clickable thing moves on desktop hover (`lift` `slide` `rise` `sweep`) — new components follow this
- Footer carries "by 20°N" → https://20north.art on every page
- Fonts self-hosted (fontsource): Cormorant Garamond display (serif allowed on this project, decided 8 Oct), Archivo caps for nav/buttons/labels, Hanken Grotesk body + office, Mrs Saint Delafield script accents; no gold/leather tones; metric; prices in CHF
- noindex + robots disallow until the client signs
- Office login (demo): manager@maisonvidy.ch / vidy2026
- Languages: EN is `/`, FR/DE/IT are `/fr /de /it`; every public string lives in `src/i18n/*.ts` — copy changes go there, never in components
