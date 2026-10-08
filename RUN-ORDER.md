# RUN-ORDER — hotel-concept (Maison Vidy, Lausanne)

Concept showcase for 20 North: a 10-room lakeside boutique hotel in Vidy, Lausanne.
Public site with direct booking + back office. Demo data, no backend yet.

## Now
- (nothing — first draft complete, see Done)

## Next
- STEP-10 FR + DE languages (Swiss client; EN is default now)
- STEP-11 Supabase backend (rooms, reservations, inquiries, auth for /office) — replaces the local demo store
- STEP-12 Payments (Stripe or Datatrans for CH) + email confirmations (Resend)
- STEP-13 Channel manager / iCal sync (Booking.com, Expedia) to block dates both ways
- STEP-14 Real photography + hotel's own copy, domain, go-live checklist (SEO, analytics, cookie consent)

## Done
- STEP-01 Foundation: Next.js + Tailwind, fonts, tokens, header/footer/WhatsApp, data model + seed (10 rooms, 40 reservations), pricing + availability engine
- STEP-02 Home page
- STEP-03 Rooms list + room detail
- STEP-04 Booking engine (/book): dates + guests → available rooms → extras → guest details → confirmation
- STEP-05 Experiences (around Lausanne + hotel activities), Dining & services, Offers, Gallery
- STEP-06 Contact (form, map, WhatsApp), reservation request, legal pages, 404, metadata (noindex while demo)
- STEP-07 Back office shell: login, sidebar, overview dashboard
- STEP-08 Back office modules: reservations, calendar, rooms, rates & extras, guests, inbox, settings
- STEP-09 QA (build, every page desktop + mobile) + Vercel deploy

## Rules
- One step at a time; nothing is built without its STEP file
- Push to main after every step; Ivana checks in the browser and says "ok"
- Demo only: data lives in the browser (seeded on first load, "Reset demo data" in /office settings)
- Hotel name, address, phone, email, prices and reviews are concept placeholders — replace before any client use
- No traces: nothing shipped names a tool, a model or a step; commit attribution off
- Footer carries "by 20°N" → https://20north.art on every page
- Sans-serif only (Bricolage Grotesque + Figtree, self-hosted); no gold/leather tones; metric; prices in CHF
- noindex + robots disallow until the client signs
- Office login (demo): manager@maisonvidy.ch / vidy2026
