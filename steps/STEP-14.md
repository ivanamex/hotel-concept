# STEP-14 — Round 4 (collecting)

Status: collecting since 8 Oct 2026 15:30. Items 2+ are built one by one on "go". Item 1 was a live glitch and went out at once.

## Items

1. DONE 8 Oct 15:45 — **Rooms track glitch** (Ivana 15:30: "it doesn't move … we had a nice behaviour, we just needed an option to speed it up or to overcome it"). The free-scrolling track from round 2 did not react to the wheel/trackpad on desktop (the smooth-scroll layer owns the wheel). Build: the round-1 behaviour is back — on desktop the section pins and the rooms slide past as the page scrolls — with three ways to get through it: ← → arrows that jump one room at a time, a **Skip the rooms ↓** control that drops straight to "Around the house", and a shorter scroll distance (the track passes in ~70 % of the vertical scroll it used to take). A thin progress line under the heading shows where you are. Phones and tablets keep the native swipe track.
2. **Forms directly on the background** (Ivana 15:33, on /request): no white boxes — the fields sit on the page as lines only. Applies to the reservation request, the contact form, the guest-details step of the booking, the stay-in-touch lightbox and the office login. Build: label in caps above, a single rule under the field, the rule darkens on focus; text areas the same; selects and the date fields keep the rule; the surrounding "Groups / Long stays" cards on /request lose their boxes too (rule between them instead).
3. **Everything moves on hover, desktop** (Ivana 15:33): nothing on the site may read as "printed on paper". Every box, card, tile, row and button gets a hover state with motion — image push-in on tiles (already on most), a 4–6 px lift + shadow on cards, the arrow sliding on rule links and ticket buttons, a slow fill on outline buttons, the room cards in the track and on /rooms, offers, experiences, dining, gallery thumbs, the "Around" tiles, FAQ rows, the closing-section lines, the menu items. Reduced-motion users get the colour change only. Audit page by page after the build.

## Separate steps in progress
- STEP-12 Languages EN · FR · DE · IT — building (go at 15:25)

## Done when
Every item built or struck through with a reason; Ivana clicks through; "ok".
