# STEP-22 — Two places on the public site

Status: spec written 11 Oct 2026 (10:25), waiting for go.

Ivana: the office knows two properties; the website still shows one. Put "our locations" in the footer and carry the two-location logic through the site — home, navigation, booking — so a visitor sees the brand has two places, without spinning the cabins off into their own site.

Sanity: **Sane; the spin-off is not.** A second site for the cabins would reproduce the prospect's problem (two sites, two accounts). One brand, the house leads, the cabins are its second place.

## Build

1. **Footer** — "Our locations": Maison Vidy (Chemin du Lac 12, by the lake) and Les Cabanes (Route du Chalet-à-Gobet, 20 min above the lake), each linking to its page; the map link covers both.
2. **Navigation** — under Stay: *The house* · *Les Cabanes*. Brand stays "Maison Vidy"; the cabins are "Maison Vidy · Les Cabanes" in titles and metadata.
3. **Home** — hero film unchanged. After the rooms track, a band *Our second place*: the site photo, "four cabins in the Jorat forest, twenty minutes above the lake", from CHF 290, the fondue evening, → `/cabanes`. The rooms track's closing card becomes "All ten rooms — and four cabins in the forest".
4. **Location page `/cabanes`** (four languages, translated slug `/fr/cabanes` `/de/huetten` `/it/cabanes`) — hero photo, the story, the four cabins as cards with live prices, *The whole site* for groups and workshops → the request form with the subject prefilled, the fondue evening card → its experience page, breakfast basket · sauna · fire pit facts, how to get there (minibus from the house, car, bus), map block.
5. **Cabin detail pages** — `/rooms/cabane-hetre` etc. from the same room template (gallery, facts, price card with availability), vocabulary "cabin", view "Forest"; the whole-site unit is not bookable online (request only). Copy for the five units in EN · FR · DE · IT.
6. **Booking engine** — a first step *Where*: the house (10 rooms) or the cabins (4 cabins), preselected when the visitor comes from a cabin or from `/cabanes`; units, taxes, check-in times and the reference prefix follow the choice; the confirmation names the place. The booking bar on the home hero gets the same choice as a small toggle.
7. **Rooms page** — tabs *The house · Les Cabanes*; the view filter shows Forest for the cabins.
8. Sitemap, hreflang and the office unchanged (bookings already carry the property).

## Not in this step
A third location (the model takes it; the site shows what exists), separate phone numbers per place (one reception), cabin photos beyond the five we have.
