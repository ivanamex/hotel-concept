# RUN-ORDER — hotel-concept (Maison Vidy, Lausanne)

Concept showcase for 20 North: a 10-room lakeside boutique hotel in Vidy, Lausanne.
Public site with direct booking + back office. Demo data, no backend yet.

## Now
- STEP-10 Polish round 1 — collecting Ivana's items + inspo in steps/STEP-10.md; build starts when she says "done", then push to production

## Next
- STEP-11 FR + DE languages (Swiss client; EN is default now)
- STEP-12 Supabase backend (rooms, reservations, inquiries, auth for /office) — replaces the local demo store
- STEP-13 Payments (Stripe or Datatrans for CH) + email confirmations (Resend)
- STEP-14 Channel manager (Channex.io) for Booking.com, Expedia, Airbnb, Google — availability + rates out, bookings in by webhook
- STEP-15 Real photography + hotel's own copy, domain, go-live checklist (SEO, analytics, cookie consent)

## Done
- STEP-01 Foundation: Next.js + Tailwind, fonts, tokens, header/footer/WhatsApp, data model + seed (10 rooms, 40 reservations), pricing + availability engine
- STEP-02 Home page
- STEP-03 Rooms list + room detail
- STEP-04 Booking engine (/book): dates + guests → available rooms → extras → guest details → confirmation
- STEP-05 Experiences (around Lausanne + hotel activities), Dining & services, Offers, Gallery
- STEP-06 Contact (form, map, WhatsApp), reservation request, legal pages, 404, metadata (noindex while demo)
- STEP-07 Back office shell: login, sidebar, overview dashboard
- STEP-08 Back office modules: reservations, calendar, rooms, rates & extras, guests, inbox, settings
- STEP-09 QA + deploy — live at https://hotel-concept.vercel.app (auto-deploys from main)

## Notes — answers if anyone asks
- Is the back office the real estate CRM (Riviera Match / WB admin)? No. Written new for hotel objects (rooms × nights calendar, rate plans, extras, city tax); only the dashboard pattern (sidebar, tables, drawers) is shared
- Booking.com / Expedia / Airbnb / Google integration? Yes, through a channel manager — OTAs only open their APIs to certified connectivity partners, a 10-room hotel never connects direct. Pick for a custom back office: Channex.io (API-first, ~CHF 20–40/month): we push availability + rates, it pushes OTA bookings back by webhook, dates blocked both ways. Alternatives: Beds24, Smoobu. iCal sync is the cheap fallback (availability only, delayed). STEP-14
- Do website bookings show in the back office straight away? Yes — written to the reservations table, visible in calendar and list with no retyping. In the demo the data lives in the browser (same browser only); after STEP-12 it is real-time across devices plus an email/WhatsApp ping to reception

## Rules
- One step at a time; nothing is built without its STEP file
- Push to main after every step; Ivana checks in the browser and says "ok"
- Demo only: data lives in the browser (seeded on first load, "Reset demo data" in /office settings)
- Hotel name, address, phone, email, prices and reviews are concept placeholders — replace before any client use
- Photos: rooms 1–3, 5, 9 and the house shots are the client's own; the rest are generated concept images, to be replaced by real photography at go-live
- No traces: nothing shipped names a tool, a model or a step; commit attribution off
- Footer carries "by 20°N" → https://20north.art on every page
- Fonts self-hosted (fontsource); serif allowed for display on this project (decided 8 Oct), sans for nav, UI and the office; no gold/leather tones; metric; prices in CHF
- noindex + robots disallow until the client signs
- Office login (demo): manager@maisonvidy.ch / vidy2026
