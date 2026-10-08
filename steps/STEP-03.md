# STEP-03 — Rooms

## /rooms
- Filter chips by guests (1 · 2 · 3 · 4) and view (Lake / Garden / Courtyard).
- Card per room: photo, name, m², beds, max guests, view, "from CHF xxx / night", "View room".
- Sorted by price.

## /rooms/[slug]
- Gallery (main + thumbnails, lightbox on click).
- Facts row: m² · beds · guests · view · floor.
- Description, features list (grouped), policies (check-in 15:00 / out 11:00, no smoking, pets on request).
- Sticky booking card: dates + guests → price for those dates (per rate plan) → "Book this room" → `/book?room=…`.
- "Other rooms you may like" (3).

## Done when
All 10 rooms open from the list; the price card recalculates with the dates; booking goes to /book with the room preselected.
