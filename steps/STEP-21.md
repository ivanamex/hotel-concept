# STEP-21 — Experiences, bookable

Status: go 11 Oct 2026 (08:58, "let's make it clickable, reservable, outside of the hotel as well") · built the same morning.

Ivana: the experiences page only *describes* things and sends everyone to the concierge form. The first replication client sells experiences in their own right — to guests and to people who are not staying — so the page has to show what that looks like: open one, see a film or a gallery, the details, time, price, pick a date and the number of people, reserve. The layout is the tour page from her Eco Tours build.

Sanity: **Sane with a change.** The "With us" cards and the new bookable list would overlap (e-bike, Lavaux, boat, cruise), so the bookable list replaces them; "Around the house" (the eight places, concierge) stays as the free half of the page. Six experiences, one of them at Les Cabanes (the fondue evening), so the two properties sell each other and the office shows both kinds of booking.

## Build

1. **Catalogue** — `src/lib/experiences.ts`: six products with duration, start times, days, season, price (per person or per group), group size, meeting point, media, property. Copy in the four dictionaries under `experiences.catalog`.
   - Fondue & raclette evening at Les Cabanes · 3.5 h · Fri, Sat 18:00 · CHF 95 pp · 4–12
   - Lavaux terraces walk & two cellars · 4 h · Thu, Sat 13:30 · CHF 150 pp · 2–10 · boat back
   - Sunrise paddle & swim from Vidy beach · 2 h · daily 06:30, May–Sep · CHF 55 pp · 1–8
   - Private boat, two hours · 10:00 / 14:00 / 17:30, Apr–Oct · CHF 480 per boat (up to 6)
   - Chocolate & old-town walk · 3 h · Wed, Sat 10:00 · CHF 85 pp · 2–10
   - E-bike loop to Lavaux · full day · daily 09:30, Mar–Oct · CHF 65 pp · 1–8
2. **List** — `/experiences` opens with "Book an experience": six cards (film or photo, category, duration, from-price), then the eight places, then the concierge form.
3. **Detail** — `/experiences/[slug]` in the four languages: film or photo hero with title and price; sticky booking card — date (only the days it runs, inside its season), start time, people (stepper within the group size), total, name · email · phone, "I'm staying at the house" with an optional booking reference, Reserve → confirmation with a reference `XP-2026-0001`; facts (duration, starts, days, season, meeting point, group size), what's included, what to bring, a gallery with the lightbox, the other experiences in a carousel. Close × goes back. Open to anyone — a stay is not required.
4. **Office** — experience bookings land in the store (`experienceBookings`) and show on the Reservations page under an "Experiences" tab: ref, experience, date and time, people, guest, total, status, cancel / mark paid; Today's "Booked today" tile counts them.
5. Sitemap and hreflang carry the six pages. No new tool, model or step named anywhere.

## Not in this step
Capacity per departure (a departure sells out at max people — the store refuses beyond it, nothing more), payment, vouchers, a calendar of departures in the office. Each is a line when a client asks.
