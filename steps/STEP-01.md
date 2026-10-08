# STEP-01 — Foundation

## Goal
Project skeleton everything else builds on: stack, design tokens, shared layout, demo data and the booking engine logic.

## Build
- Next.js (App Router, TypeScript) + Tailwind 4, `src/` layout, `@/` alias. Cache components off (classic static pages + client components).
- Fonts self-hosted via fontsource: Bricolage Grotesque Variable (display) + Figtree Variable (body/UI). No serif anywhere.
- Tokens in `globals.css` (`@theme`): sand `#F4EFE6`, paper `#FBF8F2`, white, ink `#171A1F`, slate `#5B6470`, line `#E4DDD1`, lake `#1B4B73` (primary), lake-deep `#13395A`, sky `#D7E6F0`, mist `#EEF4F8`, clay `#C25E3A` (small warm accent only). Radii 12/20/28. Shadows soft.
- `src/lib/types.ts` — Room, RatePlan, Extra, Reservation, Guest, Inquiry, Season, HotelSettings.
- `src/lib/seed.ts` — hotel profile (Maison Vidy, Chemin du Lac 12, 1007 Lausanne), 10 rooms (numbers 1–10, 1 to 4 guests, m², beds, view, floor, features, photos, base CHF), 3 rate plans (Room only / Bed & breakfast / Non-refundable −10 %), seasons (low Nov–Mar ×0.85, mid ×1, high Jun–Sep ×1.25, Montreux Jazz first half of July ×1.4), 9 extras (breakfast, Geneva airport ride, station pickup, parking, e-bike day, late check-out, lake cruise tickets, Lavaux wine tour, concierge request), ~40 reservations Sep–Dec 2026 with mixed sources (direct / Booking.com / Expedia / phone / walk-in) and statuses, 6 inquiries.
- `src/lib/engine.ts` — nights, season for a date, nightly price per room per rate plan, availability (no overlap with non-cancelled reservations; out-of-order rooms excluded), quote (rooms × nights + breakfast per person per night + extras by unit), booking reference `MV-2026-0xxx`.
- `src/lib/store.ts` — zustand + persist (localStorage key `maison-vidy-demo`), seeded on first load, actions: createReservation, updateReservationStatus, updateRoom, addInquiry, updateInquiry, updateSettings, resetDemo. Hydration-safe (`useHydrated` hook).
- Shared UI: `SiteHeader` (sticky, transparent over hero → solid on scroll, nav: Rooms · Book · Experiences · Dining · Offers · Contact, "Check availability" button), `SiteFooter` (address, phone, email, quick links, "by 20°N" credit), `WhatsAppButton` (floating, bottom-right), `Button`, `Container`, `SectionHeading`, `Badge`.
- Images in `public/images/` (optimised JPG/WebP ≤ 1600 px). Watermarked stock files are never shipped.
- Metadata: title template "… · Maison Vidy", description, OG image, `robots: noindex,nofollow` while demo.

## Done when
`npm run build` passes, `/` shows header + footer + WhatsApp on the sand background with correct fonts.
