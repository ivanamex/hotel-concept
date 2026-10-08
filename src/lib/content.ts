export interface Attraction {
  slug: string;
  name: string;
  distance: string;
  kind: string;
  image: string;
  blurb: string;
}

export const AROUND: Attraction[] = [
  {
    slug: "port-de-vidy",
    name: "Port de Vidy & the lakeside path",
    distance: "3 min walk",
    kind: "Lake",
    image: "/images/lake/marina.jpg",
    blurb: "Sailboats, swans and a flat path that runs for kilometres along the water — towards Ouchy one way, the Vidy beach and the Roman ruins the other. Our e-bikes know it well.",
  },
  {
    slug: "olympic-museum",
    name: "Olympic park & museum",
    distance: "10 min walk · 15 min by bus",
    kind: "Culture",
    image: "/images/around/olympic-park.jpg",
    blurb: "The home of the Olympic movement is our neighbour: the park with its sculptures and the lake view, and the museum in Ouchy with three floors of medals, torches and stories.",
  },
  {
    slug: "roman-vidy",
    name: "Roman Vidy",
    distance: "6 min walk",
    kind: "History",
    image: "/images/lake/beach-aerial.jpg",
    blurb: "Lousonna, the Roman town under the park. Open-air ruins by the water, a small museum, and the Vidy beach a few steps away for a swim in summer.",
  },
  {
    slug: "old-town",
    name: "Cathedral & old town",
    distance: "15 min by metro and bus",
    kind: "City",
    image: "/images/around/old-town.jpg",
    blurb: "Lausanne climbs: the Gothic cathedral, the covered stairs, the Palud market on Wednesdays and Saturdays, and Flon for dinner and a drink.",
  },
  {
    slug: "lavaux",
    name: "Lavaux terraces",
    distance: "20 min by train",
    kind: "UNESCO",
    image: "/images/around/lavaux.jpg",
    blurb: "Terraced vineyards between Lausanne and Montreux, a UNESCO world heritage site. Walk from Lutry to Cully, taste a Chasselas at a vigneron, return by boat.",
  },
  {
    slug: "chillon",
    name: "Montreux & Château de Chillon",
    distance: "35 min by train · 90 min by boat",
    kind: "Day trip",
    image: "/images/lake/terrace-view.jpg",
    blurb: "The lakeside castle at the far end of the lake, the Montreux promenade and, in July, the Jazz Festival. Go by boat, come back by train through the vineyards.",
  },
  {
    slug: "cgn-boats",
    name: "Belle-époque boats",
    distance: "Ouchy pier · 12 min",
    kind: "Lake",
    image: "/images/lake/swans.jpg",
    blurb: "The CGN fleet of paddle steamers crosses to Évian and sails along the Swiss shore. Lunch on board, or a simple evening cruise with the Alps turning pink.",
  },
  {
    slug: "sauvabelin",
    name: "Sauvabelin tower & forest",
    distance: "25 min by bus",
    kind: "Nature",
    image: "/images/lake/lakeside-path.jpg",
    blurb: "A wooden tower above the city with a 360° view of the lake and the Alps, a small lake with ducks, and forest paths for a morning run.",
  },
];

export interface Experience {
  id: string;
  name: string;
  price: string;
  image: string;
  blurb: string;
  extraId?: string;
}

export const WITH_US: Experience[] = [
  { id: "ebike", name: "E-bike day along the lake", price: "CHF 35 per bike", image: "/images/lake/lakeside-path.jpg", blurb: "Our bikes, a map with three routes (Ouchy, Lavaux, the Venoge river) and a picnic from the kitchen if you ask the night before.", extraId: "ebike" },
  { id: "lavaux", name: "Lavaux wine tour, half day", price: "CHF 150 per person", image: "/images/around/lavaux.jpg", blurb: "Train to Lutry, a guided walk through the terraces, two cellar visits with a vigneron and the boat back to Ouchy. Thursdays and Saturdays.", extraId: "lavaux_tour" },
  { id: "cruise", name: "Lake cruise tickets", price: "CHF 42 per person", image: "/images/lake/swans.jpg", blurb: "Day tickets for the belle-époque boats, Lausanne–Montreux or the Évian crossing. We print them, you walk to the pier.", extraId: "cruise" },
  { id: "boat", name: "Private boat, two hours", price: "from CHF 480", image: "/images/lake/marina.jpg", blurb: "A skippered motorboat from Port de Vidy, with a swim stop in summer and a bottle of Lavaux white on board. Ask the concierge." },
  { id: "run", name: "Running route & morning swim", price: "Free", image: "/images/lake/beach-aerial.jpg", blurb: "A 5 km and a 10 km route from the door along the water, and a towel waiting at reception for a swim at Vidy beach in summer." },
];

export interface Offer {
  slug: string;
  name: string;
  tag: string;
  dates: string;
  image: string;
  summary: string;
  includes: string[];
  from: string;
  ratePlan: "room_only" | "bed_breakfast" | "non_refundable";
  extras?: string[];
}

export const OFFERS: Offer[] = [
  {
    slug: "stay-3-pay-2",
    name: "Stay three nights, pay two",
    tag: "Winter",
    dates: "1 November 2026 – 31 March 2027",
    image: "/images/lake/swans.jpg",
    summary: "The lake in winter is a quieter, softer place. Three nights for the price of two on any room, breakfast included, direct bookings only.",
    includes: ["Third night free", "Breakfast every morning", "Late check-out on Sunday when available", "Free cancellation until 48 h before"],
    from: "CHF 390 for three nights",
    ratePlan: "bed_breakfast",
  },
  {
    slug: "lavaux-weekend",
    name: "Lavaux weekend",
    tag: "Signature",
    dates: "Fridays & Saturdays, April – October",
    image: "/images/around/lavaux.jpg",
    summary: "Two nights in a lake-view room, the half-day Lavaux wine tour with a vigneron, and the boat back along the terraces.",
    includes: ["Two nights, lake view", "Breakfast on the terrace", "Lavaux wine tour for two", "Lake cruise tickets back to Ouchy", "A bottle of Chasselas in the room"],
    from: "CHF 985 for two",
    ratePlan: "bed_breakfast",
    extras: ["lavaux_tour", "welcome"],
  },
  {
    slug: "olympic-week",
    name: "Olympic week for families",
    tag: "Family",
    dates: "School holidays",
    image: "/images/around/olympic-park.jpg",
    summary: "The Family Garden room, museum tickets for everyone, bikes for the lakeside path and a picnic for the park.",
    includes: ["Family room for four", "Breakfast for the whole family", "Olympic Museum tickets", "E-bikes and a child seat", "Picnic basket for one day"],
    from: "CHF 1’240 for four, three nights",
    ratePlan: "bed_breakfast",
    extras: ["ebike"],
  },
];

export const RESTAURANT_PICKS = [
  { name: "Le Rivage, Ouchy", kind: "Lake terrace · fish", walk: "12 min walk", note: "Perch fillets by the water. Book the terrace for sunset." },
  { name: "Café de Grancy", kind: "Bistro · local", walk: "10 min by bus", note: "Where Lausanne eats on a weeknight. Good wines by the glass." },
  { name: "Brasserie de Montbenon", kind: "Brasserie · view", walk: "15 min by metro", note: "A terrace above the lake with the Alps in front. Classics done well." },
];

export const GALLERY = [
  { src: "/images/lake/hero-lake.jpg", alt: "Lake Geneva from the terrace at golden hour", cat: "Lake", w: 16, h: 9 },
  { src: "/images/rooms/classic-lake.jpg", alt: "Classic Lake room", cat: "Rooms", w: 3, h: 2 },
  { src: "/images/house/lounge.jpg", alt: "The salon", cat: "House", w: 4, h: 3 },
  { src: "/images/around/old-town.jpg", alt: "Lausanne old town in the evening", cat: "Lausanne", w: 16, h: 9 },
  { src: "/images/rooms/duplex-suite.jpg", alt: "Duplex Suite with the round window", cat: "Rooms", w: 4, h: 3 },
  { src: "/images/house/breakfast-balcony.jpg", alt: "Breakfast on the balcony", cat: "House", w: 4, h: 5 },
  { src: "/images/lake/marina.jpg", alt: "Port de Vidy", cat: "Lake", w: 16, h: 9 },
  { src: "/images/rooms/room-junior-suite.jpg", alt: "Junior Suite Balcony", cat: "Rooms", w: 4, h: 3 },
  { src: "/images/house/restaurant.jpg", alt: "Breakfast room by the port", cat: "House", w: 4, h: 3 },
  { src: "/images/around/lavaux.jpg", alt: "Lavaux terraces", cat: "Lausanne", w: 16, h: 9 },
  { src: "/images/rooms/room-family.jpg", alt: "Family Garden room", cat: "Rooms", w: 4, h: 3 },
  { src: "/images/lake/swans.jpg", alt: "Swans at blue hour", cat: "Lake", w: 16, h: 9 },
  { src: "/images/rooms/deluxe-lake.jpg", alt: "Deluxe Lake room", cat: "Rooms", w: 3, h: 2 },
  { src: "/images/house/terrace-dusk.jpg", alt: "The garden terrace at dusk", cat: "House", w: 16, h: 9 },
  { src: "/images/around/olympic-park.jpg", alt: "Olympic park in autumn", cat: "Lausanne", w: 3, h: 2 },
  { src: "/images/rooms/room-attic.jpg", alt: "Attic Lake room", cat: "Rooms", w: 4, h: 3 },
  { src: "/images/house/bathroom.jpg", alt: "Marble bathroom", cat: "House", w: 3, h: 2 },
  { src: "/images/lake/lakeside-path.jpg", alt: "Lakeside path under the plane trees", cat: "Lake", w: 16, h: 9 },
  { src: "/images/rooms/room-twin.jpg", alt: "Twin Garden room", cat: "Rooms", w: 4, h: 3 },
  { src: "/images/lake/beach-aerial.jpg", alt: "Vidy beach from above", cat: "Lake", w: 4, h: 3 },
  { src: "/images/rooms/classic-garden.jpg", alt: "Classic Garden room", cat: "Rooms", w: 3, h: 2 },
  { src: "/images/lake/terrace-view.jpg", alt: "The terrace at first light", cat: "House", w: 16, h: 9 },
  { src: "/images/around/old-town-2.jpg", alt: "Old town at blue hour", cat: "Lausanne", w: 16, h: 9 },
  { src: "/images/lake/lakeside-path-2.jpg", alt: "Under the plane trees", cat: "Lake", w: 16, h: 9 },
  { src: "/images/rooms/room-twin-2.jpg", alt: "Twin Garden, morning light", cat: "Rooms", w: 4, h: 3 },
  { src: "/images/around/lavaux-2.jpg", alt: "Lavaux village above the lake", cat: "Lausanne", w: 16, h: 9 },
  { src: "/images/lake/terrace-view-2.jpg", alt: "Evening on the deck", cat: "House", w: 16, h: 9 },
];

export const FAQ = [
  { q: "What time is check-in and check-out?", a: "Check-in from 15:00, check-out until 11:00. Early arrival and late check-out (until 14:00, CHF 60) when the room allows — ask us the day before." },
  { q: "Is breakfast included?", a: "Choose the bed & breakfast rate when booking, or add it at the hotel for CHF 28 per person (CHF 14 for children). Served 07:00–10:30 on the terrace or in the salon." },
  { q: "Do you have parking?", a: "Yes, private parking behind the house for CHF 25 per night, with an EV charger. Reserve it with your booking — spaces are limited." },
  { q: "How do I get from Geneva Airport?", a: "Train to Lausanne in 45 minutes, then bus 1 or 2 to Vidy (15 minutes), or our private ride for CHF 180. From the station, a pickup is CHF 40." },
  { q: "Are pets welcome?", a: "Well-behaved dogs are welcome in garden and courtyard rooms (CHF 25 per night). Tell us when you book." },
  { q: "Can I cancel?", a: "Flexible rates can be cancelled free of charge until 48 hours before arrival. The saver rate is non-refundable." },
];
