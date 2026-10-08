# STEP-08 — Back office modules

- **Reservations** — table (ref, guest, room, dates, nights, guests, source, status, total), search + filters (status, source, date range), click → detail drawer (full data, extras, notes, timeline, actions: check in, check out, cancel, mark paid, edit notes). "New reservation" modal for phone/walk-in bookings using the same engine.
- **Calendar** — rooms × days grid (14 / 30 days, prev/next), colour by status, hover → guest + ref, click → drawer, today marker, out-of-order rooms hatched.
- **Rooms** — list of 10 rooms with status (available / occupied / out of order), base rate inline edit, toggle out-of-order with reason, edit sheet (name, capacity, features, photos order).
- **Rates & extras** — rate plans (edit markup / discount), seasons (date ranges + multiplier), extras (price + unit, active toggle), city tax.
- **Guests** — derived from reservations: name, country, stays, last stay, total spend, notes; click → their reservations.
- **Inbox** — inquiries (contact / concierge / group) with status new → replied → closed, reply field (demo: stores reply text).
- **Settings** — hotel profile, check-in/out times, languages, WhatsApp number, channels list, "Reset demo data".

## Done when
Every module reads and writes the shared store; a booking made on the site is visible in reservations, calendar, guests and overview.
