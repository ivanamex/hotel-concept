# STEP-11 — Round 2 (Ivana's review of the facelift, 8 Oct)

Status: built and live 8 Oct 2026.

1. **Display serif → Cormorant Garamond** (500, italic 500). Fraunces read as "zigzag / broken" on a Windows screen — its hairlines and wonky forms alias at 1×. Cormorant has lower contrast, renders clean, still grand-hotel. Archivo caps + Hanken Grotesk + Mrs Saint Delafield unchanged.
2. **Hero reads as a slideshow** — the generated clips move too little. Fix in two parts: (a) now: slow push-in on every video and still, so there is always movement; (b) Ivana generates two 10 s aerial clips in Gemini (Veo) from our aerial stills (image flow, two sets: golden-hour high aerial, blue-hour low aerial) → they become hero slide 1 and the VIDY band. Files: public/videos/aerial-day.mp4, aerial-dusk.mp4. Stills placed 8 Oct (hero slide 1 summer/winter, VIDY band, gallery, OG image); the clips play automatically once the two files exist.
3. **Intro photos** — parallax on scroll (the tall one slower, the small one faster) + slow zoom on hover.
4. **Closing section** — min-height 88 svh and content vertically centred; headline on two lines "Come stay / with us," then the script. Lines: Book a room → /book · Find your way → /contact · **Write to us → opens the contact form in a modal** (same inquiry form, lands in the office inbox) · **Send a WhatsApp → wa.me**.
5. **VIDY band** — the lake-water clip was too still inside the letters; now the swans clip with a slow push-in. Switches to the aerial when it arrives.
6. **Horizontal rooms track no longer pins the page.** A native horizontal scroller: drag, swipe, trackpad, arrow buttons; vertical scrolling is never captured. Scroll-snap per card.
7. **Back to top** — floating "mark + ↑ Top" button bottom-left after 900 px; the rail mark also scrolls to top when already on the home page.
8. **"Page couldn't load" / dead links** — deployment skew: Ivana had the old build open while the new one deployed, the router then fetched pages that no longer existed. Fix: a client guard that reloads the page once when a chunk fails to load (Vercel skew protection is not available on this team — API says "not found"). Hash links (/experiences#…) now scroll to the section instead of the top.

## Done when
Ivana reloads once (old tab), clicks through; aerial clips uploaded and placed.
