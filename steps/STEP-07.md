# STEP-07 — Back office shell (/office)

- `/office/login` — email + password (demo credentials below), error state, "remember me". Session flag in the store; unauthenticated office routes redirect to login.
- Office layout — left sidebar (dark lake-blue): Overview · Reservations · Calendar · Rooms · Rates & extras · Guests · Inbox · Settings; collapsible on mobile; top bar with date, "New reservation", user menu (sign out, "View site").
- `/office` Overview — KPI tiles (occupancy today, arrivals, departures, in-house guests, revenue this month, ADR, RevPAR, direct share %), occupancy bars next 14 days, today's arrivals & departures lists with check-in/out actions, latest bookings, unread inbox count.
- Demo credentials: manager@maisonvidy.ch / vidy2026 (shown on the login page as a hint while demo).

## Done when
Login works, overview numbers derive from the store, sidebar navigation reaches every module (placeholders OK until STEP-08).
