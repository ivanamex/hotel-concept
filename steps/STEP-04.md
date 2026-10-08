# STEP-04 — Booking engine (/book)

Flow on one page, four steps with a progress rail; state in URL + local store.

1. **Search** — check-in, check-out (min 1 night, max 21), adults (1–4), children (0–3). Validation inline.
2. **Choose a room** — available rooms for those dates and guests, each with the 3 rate plans (Room only · Bed & breakfast · Non-refundable), nightly and total price, cancellation terms. Unavailable rooms shown greyed with "Not available for these dates".
3. **Extras** — toggle list with unit (per night / per stay / per person / per ride) and running total in the summary.
4. **Guest details** — first/last name, email, phone, country, arrival time, special requests; payment block: card guarantee form (demo, nothing is charged, labelled as such) or "Pay at the hotel".
5. **Confirmation** — `/book/confirmed/[ref]`: booking reference, summary, what happens next, add to calendar (.ics), WhatsApp link, "Manage booking" link.

Summary rail (sticky, right on desktop, drawer on mobile): room, dates, nights, guests, rate plan, extras, total CHF, city tax line (CHF 3.50 pp/night, shown separately).

Writes the reservation into the store with `source: "direct"` and status `confirmed` so it appears in /office immediately.

## Done when
A full booking can be made in under a minute and shows up in the office reservations list and calendar.
