# STEP-23 — Brand home, and a site that switches on and off

Status: go 11 Oct 2026 (12:42, "let's start redesigning") · built 12 Oct. Verified on the production build: `/` in four languages, `/maison` · `/fr/maison` · `/de/haus` · `/it/casa`, the menu order, the footer, the book links from the place cards, the sitemap.

The brand film is in: `public/videos/brand.mp4` — the front door opening and a level walk through the hall to the lake doors, the forest walk to the cabins, arriving on the terrace, the bath in the oak, then up through the canopy, out over the lake and down onto the house from the air (21.7 s, 1440×810, 6.4 MB, muted; cut so the camera never halts — the generated clips stop dead at their ends, so each is cut before its stop; the entrance walk came out with one frame dropped every second, retimed and motion-interpolated to an even 24 fps) — the loop lands on the house and opens the door again. The hero on `/` plays it; `/maison` keeps the entrance film.

Ivana: a new hero film is coming (Gemini, from the cabin photos) and the home page should say "two places" from the first second. The current home page stays as the Lausanne house's landing; `/cabanes` is the cabins'. The whole thing must sell accommodation — one place or all — and then experiences. And it must be composable: for the next client we switch sections and features on or off instead of rebuilding.

Sanity: **Sane.** The home page becomes the brand page; the house gets its own landing like the cabins have. The switchboard is a plain config file, not an admin screen — a client with specifics is a config change plus copy, which is the replication promise of STEP-20 on the public side.

## Build

1. **`src/lib/site.ts` — the switchboard.** One object: brand (name, multi-place), the places and their order, which home sections run and in what order, which features exist (experiences, offers, dining, gallery, whole-site requests, newsletter lightbox, season switch, languages). Nav, footer, the next-page chain and the home page read it; a feature off disappears everywhere at once.
2. **Home = brand page** (`/`): hero with the brand film (`/videos/brand.mp4` when it arrives, the entrance film until then) and the booking bar with *Where*; copy "one lake, two ways to stay"; **Our places** — the house and the cabins as two large cards (rooms/cabins, from-price, see · book), with "the whole of either place for a group"; **Experiences** — the six bookable in a carousel; the lake film break; offers; reviews; both locations; closing. Each block is a section the switchboard can drop.
3. **`/maison` = the house's landing** — the former home page unchanged (entrance film, the house, rooms track, around, breakfast, reviews, offers, location), in four languages with translated slug (`/fr/maison`, `/de/haus`, `/it/casa`). The menu gets *The house* and *Les Cabanes* under Stay; the home's "Home" note becomes the brand line.
4. **Copy** for the brand hero, the places section and the new nav items in EN · FR · DE · IT.
5. Sitemap and hreflang carry `/maison`.

## What the switchboard drives today
`brand.multiPlace` (brand home + place landings vs. one house), `places` (order of the cards and the addresses), `home.film`, `home.sections` (order and presence of every home block), `features.experiences / offers / dining / gallery / wholePlace / newsletter / seasonSwitch / ticker / whatsapp` — read by the menu, the footer, the next-page chain, the home page, the house landing, the layout (lightbox, WhatsApp button) and the closing section.

## Not in this step
A config UI in the office (the file is the UI until a client needs more), a third place.
