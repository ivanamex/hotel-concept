# STEP-15 — Round 5 (collecting)

Status: collecting since 8 Oct 2026 17:40. Built one by one on "go".

## Items

1. **Language switch in the menu** (Ivana 17:40, phone screenshot: the four languages stacked as a list looks like a list, not a control). Options she named: a select dropdown or flags.
   Sanity: **Sane with a change.** Flags are the wrong signal on a Swiss hotel — French is not France and German is not Germany here; 🇫🇷 🇩🇪 🇮🇹 under "Maison Vidy · Lausanne" reads as a foreign site, and Swiss guests notice. A native `<select>` is system UI (grey box, OS arrow) inside a page where every control is ours. Build instead: the same segmented control the Season switch already uses, one row — `EN | FR | DE | IT`, current one filled ink — on mobile and desktop, in the menu and the footer; on the desktop rail a small current-language code (e.g. FR) under the MENU button that opens the menu. Full language names on hover/aria. If Ivana still wants flags after seeing it: a 1-px-ring round flag set can be added later, but the recommendation is no flags.
2. **Trust marks — secure payments and the channels** (Ivana 17:40: "decorate the website with secure card payments — Stripe logo — and the reservation platform that goes out to Booking, Expedia"). The second one is **Channex** (channel manager, STEP-18).
   Sanity: **Sane with a change.** Payment marks belong on the public site: a "Secure payment" strip in the booking's payment step (Stripe · Visa · Mastercard · Amex · **Twint** — the Swiss one, guests look for it) and a one-line trust row in the footer. OTA logos do **not** belong on the public pages: a direct-booking site that shows Booking.com and Expedia logos sends guests to Booking.com and Expedia. They belong in the back office, where the client sees the plumbing: the Channels block in Settings and a "Connected channels" tile on the dashboard with the logos (Booking.com, Expedia, Airbnb, Google Hotel Ads, "via Channex"), live/paused per channel. On the public site the only mention stays in words, as a conversion argument: "Best rate here — lower than on Booking.com or Expedia" under the booking bar.
   Logos: brand marks are not drawn in-house — Ivana sends the files (SVG or PNG on transparent): Stripe, Visa, Mastercard, Amex, Twint; Booking.com, Expedia, Airbnb, Google. Until they arrive the strip is typeset in caps (Visa · Mastercard · Amex · Twint), which is a legitimate final look on its own.

## Done when
Every item built or struck through with a reason; Ivana clicks through; "ok".
