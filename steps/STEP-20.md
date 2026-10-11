# STEP-20 — Office shell v2: the template we replicate

Status: go 11 Oct 2026 (23:44) · built and pushed 11 Oct (13a6d25) · waiting for Ivana's click-through and the cabin photos.

Ivana (10 Oct 23:25): the dashboard has to be "really nicely organised — everything easy to reach from the side panel, the important things visible on the main screen". Once built, this shell is replicated for every property client (a Mexico property is already in view). References she sent: ResNexus, Cloudbeds MX, WebRezPro landing pages; Houzez CRM and Bridge packages.

Sanity: **Sane.** Fixing the shell once, as a template, before a second client is the right order. One change to the premise: the shell is the product, the modules are configuration — so this step is as much about the per-property config (currency, taxes, unit vocabulary, languages, property switcher) as about the look. Build on the demo store now; STEP-16 swaps the store, not the screens.

## What the research says (sources at the end)

- **The home screen is "today", not "analytics".** Every PMS worth copying (Mews, Cloudbeds, Prostay, WebRezPro) opens on arrivals · departures · in-house · things that need action, with the action buttons right there. Month KPIs come second. Our overview already does this; it needs ordering and a "needs attention" list.
- **Every number is a link.** Mews' coloured donuts and Prostay's tiles open the list behind the figure. No decorative charts.
- **Seven to eight top-level items, daily ones first, long tail at the bottom; group with section labels past that.** Settings, integrations, help at the bottom, account/property switcher separate from page links.
- **A global search (⌘K) that reaches reservations, guests, rooms, pages and actions** keeps the rail lean (Cloudbeds "universal search", Guesty search bar, Mews Alt+T / Alt+N).
- **"+ New" is one button with a menu** — reservation, block/out of order, guest, task (Guesty quick add, Prostay "Create new": reservation, tentative, blocked dates, out of service).
- **Collapsible icon rail, choice remembered; active state unmistakable; mobile = drawer.**
- **Don't copy the breadth.** Cloudbeds/Guesty have 10–11 groups and dozens of pages because they serve hostels to hotel groups. A 10-room house with 30 screens is a liability in a pitch. Nine destinations, grouped.
- **From Houzez CRM (real estate → hospitality):** enquiries have a *type*, a *source*, a *status* and a *next action with a date*; deals live in groups *active / won / lost*; every contact carries *notes* and an *activity timeline*. Transfer: the inbox becomes a request pipeline, guests get notes + timeline.

## Build

DONE 11 Oct — all sections below are live. Verified on the production build: login → Today (all locations and each property), every page, the search palette, the collapsed rail, calendar move / refuse / extend with Undo, board drag New → Offer sent, Today panels reordered and reset; the public site and its booking engine still show Maison Vidy's rooms only. Open: Ivana picks the five cabin photos from the image flow (two variations each) and uploads them as `public/images/cabins/{site,hetre,chene,sapin,meleze}.jpg` — until then the cabin rows show a grey "photo" tile. Housekeeping state (to clean · clean · inspected) lives on the Units page and in the Today tiles, as planned.

### 1. Sidebar — nine destinations in two groups + bottom

```
[Property switcher]  Maison Vidy ▾        ← active property, separate from page links (one property in the demo; the control exists)
[Search ⌘K]

DAILY
  Today          (badge: needs-attention count)
  Calendar       (tape chart — rooms × nights, drag to move/extend, click to open)
  Reservations
  Guests
  Inbox          (badge: new)

MANAGE
  Rooms          (label follows property vocabulary: Rooms / Units / Villas)
  Rates & extras (rate plans, extras, restrictions, promo codes)
  Channels       (NEW page — booking engine, OTA connections via Channex, sync log; moves out of Settings)
  Reports        (NEW page)

────
  Settings       (property, taxes & invoicing, users & roles, notifications, demo data)
  View website · Help · Sign out · signed-in user
```

- Collapses to an icon rail (tooltips), remembered per browser. Active item: filled; hover: tint, visibly different.
- Mobile: drawer from the ☰, closes on route change, tap outside, swipe or ×.
- Keyboard: `⌘K` search · `N` new reservation · `T` calendar (ignored while typing in a field).

### 2. Header (every office page)

Page title + one-line context (today's date · occupancy) · search field (visible, not only the shortcut) · **+ New ▾** (Reservation · Block dates / Out of order · Guest · Task) · notifications bell (needs-attention items) · user.

### 3. Today (overview) — the template layout

Row 1 — **Today strip**, six clickable tiles → each opens the filtered list: Arrivals (n · x still to arrive) · Departures (n · x still to check out) · In house (n of N · occupancy %) · Rooms to clean (n) · New messages (n) · Booked today (n · value).

Row 2 — left ⅔ **Today's guests**: tabs Arrivals · Departures · Stayovers, each with Today / Tomorrow; rows carry the actions (Check in / Check out / Assign room / balance due flag / note). Right ⅓ **Needs attention**: one list, each row a link — unpaid balance arriving today · request unanswered > 24 h · room out of order · overbooking · incomplete guest profile (no email / no ID at check-in) · channel sync error. Shows only what applies; "All clear" when empty.

Row 3 — **Next 14 nights**: occupancy bars + revenue line in one chart; under it the month: Occupancy MTD · Revenue MTD · ADR · RevPAR · booked direct %, each with the comparison to last month. Right: **Channels** compact (live / last sync / errors) → Channels page.

Row 4 — **Latest bookings** table (as now) → Reservations.

Rules: every figure links to the list behind it; empty states say what to do next; no chart that does not answer a question the manager asks daily.

### 4. New pages

- **Channels**: booking engine status (direct), each OTA (Booking.com, Expedia, Airbnb, Google) with connected / paused, last sync, rates & availability pushed, bookings received, errors; "via Channex" (STEP-18 wires it). Logos when Ivana sends files; typeset until then.
- **Reports** — five, not seventy-five, each with a date range and CSV export: Occupancy & revenue by day · Bookings by source (direct vs each OTA, commission) · ADR / RevPAR by month · Taxes to remit (city tax CH per person-night / lodging tax % elsewhere) · Arrivals & departures sheet (printable, for the desk).

### 5. Inbox → request pipeline (Houzez transfer)

Tabs New · Replied · Offer sent · Won · Lost (active / won / lost groups). Each request: type (stay · group · event · long stay · question), source (site form, WhatsApp, email, phone, OTA message), status, **next action + due date**, notes, activity timeline (received, read, replied, offer sent, converted). "Convert to reservation" pre-fills the new-reservation form. Guests get the same notes + timeline on their profile.

### 6. Multi-property from day one — the replication lever

The first replication client (Mexico, Ivana 10 Oct 23:34) has **three locations**, each a property with its own units; one location's units are tree houses. So the model is `brand → property → unit type → unit` from the start, not a single property with a greyed switcher:

- `property`: name · mark · address · unit vocabulary (room / unit / villa / tree house — per unit type) · currency and number format · locale(s) · tax model (per-person-night fixed amount, % of room, or none — one line per tax) · invoice type (receipt · invoice · CFDI for Mexico, later) · check-in/out times · payment methods shown (cards, Twint; OXXO/SPEI later).
- Reservations, rates, extras, calendar and channels belong to a property (each location is its own Booking.com / Expedia / Airbnb listing). Guests and the inbox are shared across the brand.
- The office opens on **All locations**: one Today strip per property, then portfolio totals; the switcher narrows to one property and every page follows. Calendar shows one property at a time (a tape chart across locations is noise).
- The demo gets a **second, fictional property** so the logic is visible to anyone poking around the office (Ivana 23:37: the prospect must see at once that this is a real system and his case fits): **Les Cabanes** — four tree-house cabins in the Jorat forest above Lausanne, 20 min from the house, plus a "whole site" parent unit for retreats and groups. Same brand, own calendar, rates, channels, tree-house vocabulary, nested units, retreat holds in the pipeline. Office opens on All locations; the public site stays Maison Vidy's own (the cabins' site is "coming" — not this step). Concept images for the cabins come from the usual image flow; Ivana picks and uploads. Nothing branded for the prospect before a signed proposal — the fiction does the demonstrating.
- Public-site counterpart (their build, not this one): brand → three locations → units; the location is the first choice in the booking bar; one brand, three availability calendars.
- Read from their current site (10 Oct, 23:35): **units nest** — a whole house is bookable as one unit *and* as its four rooms, so a `unit` can have a parent; booking the parent blocks the children and vice versa. **Four booking types**, not one: room night · whole property · retreat / group hold (deposit, headcount, dates held until a date) · venue hire for an outside facilitator. Those last two are requests before they are reservations — the pipeline in §5 is where they live. They run today on an all-in-one subscription (website + booking engine + PMS + channel manager) split across **two accounts**, one per location, with no common view — exactly the gap the portfolio Today closes. Replacing that stack means we also carry the channel manager (STEP-18 becomes mandatory for them, not optional) and a Spanish + English site (their current one is English only, in Mexico).

### 7. Drag (Ivana 23:37: "they have things you can drag — that would be super fancy")

Sanity: **Sane** — drag is standard in every PMS she looked at, and three places earn it:
- **Calendar**: drag a reservation to another room or other dates, drag its end to extend or shorten; conflicts refuse with a reason, every move has Undo.
- **Inbox pipeline**: a board view next to the list — drag a request card from New → Replied → Offer sent → Won / Lost.
- **Today**: panels reorder with a drag handle (up/down), the order is remembered per browser, "Reset layout" in the page menu.
Built with dnd-kit (keyboard-accessible, touch on tablets); drag never is the only way — every move also has a button or menu.

### 8. Not in this step (on purpose)

Housekeeping as its own module (room status clean / dirty / inspected / out of order lives in Rooms and in the Today strip) · owner statements (only if the Mexico property is multi-owner) · POS/F&B · revenue-management automation · a mobile app. Each becomes a step when a client asks.

## Notes
- Vendor demo calls (Cloudbeds, Mews, ResNexus, WebRezPro all gate the demo behind a sales call): skipped for now — Ivana won't spend time being sold a solution for a fictional property. Worth two calls later, once we have a real client, to see how the big systems handle multi-property and housekeeping.

## Sources

- Cloudbeds — [Get to know your new Dashboard](https://myfrontdesk.cloudbeds.com/hc/en-us/articles/16873372577435-Get-to-know-your-new-Dashboard) and the [Mexico PMS page](https://www.cloudbeds.com/es/paid-lp/pms-mx/)
- Mews — [Your dashboard](https://help.mews.com/s/article/your-dashboard)
- Prostay — [Reading the dashboard, card by card](https://www.prostay.com/help/property-management-system/dashboard-overview/)
- Guesty — [Navigating the Guesty dashboard](https://help.guesty.com/hc/en-gb/articles/11877241350685-Navigating-the-Guesty-dashboard)
- WebRezPro — [Cloud software](https://webrezpro.com/cloud-software/)
- ResNexus — [landing page](https://landing.g2digitalmarkets.com/resnexus-gdm-lp?category=Hospitality-Property-Management)
- SaaS UI — [Sidebar navigation UX patterns](https://www.saasui.design/blog/saas-sidebar-navigation-ux-patterns)
- Houzez 4.4.2 CRM plugin (Ivana's package): enquiries · leads · deals (active / won / lost) · notes · activities
