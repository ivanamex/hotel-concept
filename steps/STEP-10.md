# STEP-10 — Polish round 1 (collecting)

Status: collecting. Ivana adds items and inspo here; build starts when she says "done". Then push to production.

## Items so far (8 Oct)

1. **Fonts** — Bricolage Grotesque + Figtree are the Árbol pair; both go. Pick one of:
   - A (recommended) **Archivo** (variable width) for display + nav, **Hanken Grotesk** for body. Archivo semi-expanded in caps for the navbar reads like Swiss signage; headlines at regular width, weight 600, tight tracking; Hanken is a calm Swiss-style grotesk for text.
   - B **Hanken Grotesk** alone, 500 headlines / 400 body — strictest, risk of plain.
   - C **Instrument Sans** display + Hanken Grotesk body — softer, more editorial.
   All Google fonts, self-hosted via fontsource. Nothing else on our sites uses these.
2. **Navbar** — all caps, small size (12–13 px), tracked (+0.14 em), weight 500; thin 1 px rule under the header when solid; stricter spacing; active item marked by a short underline, not a pill background.
3. **Buttons** — no pills anywhere (site + office). Options:
   - 1 (recommended, primary) **Square "ticket" button**: 0–2 px radius, all-caps tracked label, 1 px border or solid fill, arrow slides in from the right on hover.
   - 2 **Soft rectangle + disc**: 6 px radius, sentence case, small circular arrow disc at the right end that expands on hover (cousin of the 20N sun-disc, in ink).
   - 3 (recommended, secondary) **Rule link**: text + arrow with a baseline rule that draws left→right on hover.
   - 4 **Bracket button**: corner marks that close in on hover — more "nerd", maybe too much for a hotel.
   Pick a primary and a secondary; same system in the back office at smaller size.
4. **Hero** — image carousel behind the search form, slow crossfade (6–7 s per slide, Ken-Burns push-in), 4–5 slides from the area; optionally 2–3 of them as short looping video clips (image-to-video from our generated stills: water moving, light shifting, 5 s, muted, poster fallback, respects reduced-motion). Needs 2–4 new area images (Ouchy pier with a belle-époque boat, cathedral from Sauvabelin, winter lake with snowed Alps, Vidy beach in summer) — generate first, pick, then animate. Video generation costs credits: estimate and confirm with Ivana before running.
5. **Perks strip under the hero** — give it movement. Options: (a) continuous ticker (perks + live-feel lines: "Lake 14 °C · Sunset 18:52 · Next boat to Montreux 15:10 · Terrace open", pause on hover) — recommended; (b) staggered reveal with icons drawing in on scroll; (c) both: reveal once, then ticker.
6. **Entrance video** — inspo coming (door opens, you walk into the hotel). Decide where it lives (hero? intro section? a "Step inside" overlay?) once we see it.
7. **Email lightbox with an offer** (inspo: thepopuphotel.com "Join our community", lasalaplazahotel.com "Otoño en Lasala: 20 % con el promocode"). Ours: "Stay in touch" / claim-your-discount — image left (a room or the lake), copy + email field + CTA right, in the new button style. Offer: 10 % off a direct booking with the code you get by email (demo code VIDY10, applied in the booking engine as a promo field). Trigger: after ~45 % scroll or 25 s on page, whichever first; once per visitor (remembered 30 days); never on /book, /office or the confirmation; closes on Esc / outside click; no exit-intent tricks. Subscribers land in the back office as a "Subscribers" list under Inbox (name optional, email, date, source page) so the hotel can export them.
8. **Location block instead of native maps** (inspo: lasalaplazahotel.com footer map). Drop the OpenStreetMap iframes on home and contact. Split layout: left an illustrated map of Vidy / Lausanne with the lake, Port de Vidy, the Olympic park, Ouchy, the cathedral, Lavaux direction and the Alps, with a small drawn house marking the hotel — style not watercolor: ink line drawing in lake blue on sand, labels in caps in our nav font. Generate with an image model that renders text well (concept), redraw as SVG if the client signs. Right a dark lake-blue block: hotel name, address, outline "Open in Google Maps →" button (links out, no embed), email, phone, "Send us a WhatsApp →" button, social icons row. Same block reused at the end of the contact page; the contact form stays above it.
9. (Ivana to add more)

## Inspo
- hotelaurelia.online — booking as its own page with a date picker that marks available / limited / sold-out days (we could colour the calendar in /book the same way)
- thepopuphotel.com — "Join our community" lightbox: photo left, headline + one line + email + full-width button right; close X top-right
- lasalaplazahotel.com — promo-code lightbox: small caps eyebrow, big headline with the offer, validity line, short paragraph, one CTA with arrow; room photo with a person in it on the left

## Done when
Every item above is either built or struck through with a reason; site re-checked desktop + mobile; Ivana says "ok"; then production.
