import { addDays, nightsBetween, quote, rangesOverlap } from "./engine";
import type {
  Extra,
  HotelSettings,
  Inquiry,
  Property,
  RatePlan,
  Reservation,
  ReservationSource,
  ReservationStatus,
  Room,
  Season,
} from "./types";

export const DEMO_TODAY = "2026-10-08";

export const HOTEL: HotelSettings = {
  seasonOverride: "auto",
  name: "Maison Vidy",
  tagline: "Lausanne, by the lake.",
  address: "Chemin du Lac 12",
  city: "1007 Lausanne",
  phone: "+41 21 555 10 07",
  whatsapp: "529841803527",
  email: "stay@maisonvidy.ch",
  checkIn: "15:00",
  checkOut: "11:00",
  cityTax: 3.5,
  breakfastPrice: 28,
  languages: ["English", "Français", "Deutsch"],
  channels: [
    { name: "Direct (website)", connected: true },
    { name: "Booking.com", connected: true },
    { name: "Expedia", connected: true },
    { name: "Google Hotel Ads", connected: false },
    { name: "Airbnb", connected: false },
  ],
  receptionHours: "07:00 – 22:00 (night bell after hours)",
};

export const RATE_PLANS: RatePlan[] = [
  {
    id: "room_only",
    name: "Flexible · room only",
    short: "Room only",
    description: "Best flexibility. Breakfast can be added at the hotel.",
    cancellation: "Free cancellation until 48 h before arrival.",
    includesBreakfast: false,
    discount: 0,
  },
  {
    id: "bed_breakfast",
    name: "Flexible · bed & breakfast",
    short: "With breakfast",
    description: "Breakfast on the terrace or in the salon, 07:00–10:30.",
    cancellation: "Free cancellation until 48 h before arrival.",
    includesBreakfast: true,
    discount: 0,
  },
  {
    id: "non_refundable",
    name: "Saver · non-refundable",
    short: "Saver −10 %",
    description: "Our lowest rate. Paid at booking, breakfast optional at the hotel.",
    cancellation: "Non-refundable, non-changeable.",
    includesBreakfast: false,
    discount: 0.1,
  },
];

// Later entries override earlier ones for overlapping dates.
export const SEASONS: Season[] = [
  { id: "low", name: "Low season", from: "11-01", to: "03-31", multiplier: 0.85 },
  { id: "mid", name: "Mid season", from: "04-01", to: "05-31", multiplier: 1 },
  { id: "mid2", name: "Mid season (autumn)", from: "10-01", to: "10-31", multiplier: 1 },
  { id: "high", name: "High season", from: "06-01", to: "09-30", multiplier: 1.25 },
  { id: "jazz", name: "Montreux Jazz", from: "07-03", to: "07-18", multiplier: 1.4 },
  { id: "festive", name: "Festive season", from: "12-23", to: "01-02", multiplier: 1.2 },
];

export const EXTRAS: Extra[] = [
  { id: "airport_ride", name: "Private ride from Geneva Airport", short: "Airport ride", price: 180, unit: "per_ride", icon: "car", active: true },
  { id: "station_pickup", name: "Pickup at Lausanne station", short: "Station pickup", price: 40, unit: "per_ride", icon: "train", active: true },
  { id: "parking", name: "Private parking", short: "Parking", price: 25, unit: "per_night", icon: "parking", active: true },
  { id: "ebike", name: "E-bike for a day along the lake", short: "E-bike day", price: 35, unit: "per_person", icon: "bike", active: false },
  { id: "cruise", name: "Lake cruise tickets (Lausanne–Montreux)", short: "Lake cruise", price: 42, unit: "per_person", icon: "ship", active: false },
  { id: "lavaux_tour", name: "Lavaux wine tour, half day", short: "Lavaux tour", price: 150, unit: "per_person", icon: "wine", active: false },
  { id: "late_checkout", name: "Late check-out until 14:00", short: "Late check-out", price: 60, unit: "per_stay", icon: "clock", active: true },
  { id: "welcome", name: "Flowers & a bottle of Lavaux white in the room", short: "Welcome set", price: 65, unit: "per_stay", icon: "flower", active: true },
  { id: "concierge", name: "Concierge request (tables, tickets, anything)", short: "Concierge", price: 0, unit: "per_stay", icon: "concierge", active: true, requestOnly: true },
];

const F = {
  wifi: "Fast Wi-Fi",
  ac: "Air conditioning",
  nespresso: "Coffee machine & kettle",
  minibar: "Minibar",
  safe: "Safe",
  tv: "Smart TV",
  desk: "Writing desk",
  rain: "Rain shower",
  bath: "Bathtub",
  robes: "Bathrobes & slippers",
  balcony: "Private balcony",
  lakeview: "Lake view",
  garden: "Garden view",
  courtyard: "Quiet courtyard",
  sofa: "Sofa bed",
  blackout: "Blackout curtains",
  soundproof: "Soundproof windows",
  mezz: "Mezzanine bedroom",
  dining: "Dining table for six",
  twin: "Beds can be joined",
};

/** The house on the lake — the property the public site is built for. */
export const SITE_PROPERTY = "vidy";

const V = { propertyId: SITE_PROPERTY, kind: "room" as const, housekeeping: "clean" as const };

export const ROOMS: Room[] = [
  {
    ...V,
    id: "r1", number: 1, slug: "classic-garden", name: "Classic Garden", category: "Classic",
    floor: 1, sizeM2: 20, beds: "Queen bed 160 cm", maxAdults: 2, maxGuests: 2, view: "Garden", basePrice: 230,
    summary: "Our most-booked room: calm, bright, opening onto the garden.",
    description: "A quiet room on the garden side with a writing desk under the window, blue toile de Jouy on one wall and the sound of the lake fountain in the morning. The bathroom has a walk-in rain shower.",
    features: [F.garden, F.wifi, F.ac, F.nespresso, F.desk, F.rain, F.safe, F.tv, F.blackout],
    images: ["/images/rooms/classic-garden.jpg", "/images/house/bathroom.jpg", "/images/house/lounge.jpg"],
    status: "active",
  },
  {
    ...V,
    id: "r2", number: 2, slug: "single-courtyard", name: "Single Courtyard", category: "Single",
    floor: 1, sizeM2: 16, beds: "Single bed 120 cm", maxAdults: 1, maxGuests: 1, view: "Courtyard", basePrice: 175,
    summary: "A proper single room for the solo traveller, not a cupboard.",
    description: "Facing the inner courtyard, this is the quietest room in the house. A wide single bed, a desk, good light and a compact bathroom with a rain shower. Ideal for a work trip or a solo weekend by the lake.",
    features: [F.courtyard, F.wifi, F.ac, F.nespresso, F.desk, F.rain, F.safe, F.tv, F.soundproof],
    images: ["/images/rooms/single-courtyard.jpg", "/images/house/bathroom.jpg"],
    status: "active",
  },
  {
    ...V,
    id: "r3", number: 3, slug: "classic-lake", name: "Classic Lake", category: "Classic",
    floor: 2, sizeM2: 22, beds: "Queen bed 160 cm", maxAdults: 2, maxGuests: 2, view: "Lake", basePrice: 260,
    summary: "Wake up to Lake Geneva and the Savoy Alps across the water.",
    description: "On the second floor with the lake framed in the window. Cream panelling, a blue velvet armchair for reading, a marble bathroom with rain shower. Breakfast on the balcony is a short request away.",
    features: [F.lakeview, F.wifi, F.ac, F.nespresso, F.minibar, F.rain, F.safe, F.tv, F.robes],
    images: ["/images/rooms/classic-lake.jpg", "/images/rooms/deluxe-lake.jpg", "/images/house/bathroom.jpg"],
    status: "active",
  },
  {
    ...V,
    id: "r4", number: 4, slug: "twin-garden", name: "Twin Garden", category: "Twin",
    floor: 2, sizeM2: 21, beds: "Two single beds 90 cm (can be joined)", maxAdults: 2, maxGuests: 2, view: "Garden", basePrice: 240,
    summary: "Two beds, one view of the garden — for friends or colleagues.",
    description: "Two single beds with padded blue headboards, a desk for two laptops and a bathroom with a rain shower. The beds can be joined into a 180 cm bed on request.",
    features: [F.garden, F.twin, F.wifi, F.ac, F.nespresso, F.desk, F.rain, F.safe, F.tv],
    images: ["/images/rooms/room-twin.jpg", "/images/rooms/room-twin-2.jpg", "/images/house/bathroom.jpg"],
    status: "active",
  },
  {
    ...V,
    id: "r5", number: 5, slug: "deluxe-lake", name: "Deluxe Lake", category: "Deluxe",
    floor: 2, sizeM2: 28, beds: "King bed 180 cm + sofa bed", maxAdults: 2, maxGuests: 3, view: "Lake", basePrice: 320,
    summary: "More room, a king bed and two armchairs facing the water.",
    description: "A generous corner room with two tall windows on the lake, a king bed, a seating corner with two armchairs and a sofa that converts for a child. Bathtub and separate rain shower.",
    features: [F.lakeview, F.sofa, F.wifi, F.ac, F.nespresso, F.minibar, F.bath, F.rain, F.safe, F.tv, F.robes],
    images: ["/images/rooms/deluxe-lake.jpg", "/images/rooms/classic-lake.jpg", "/images/house/lounge.jpg", "/images/house/bathroom.jpg"],
    status: "active",
  },
  {
    ...V,
    id: "r6", number: 6, slug: "junior-suite-balcony", name: "Junior Suite Balcony", category: "Junior Suite",
    floor: 3, sizeM2: 34, beds: "King bed 180 cm + sofa bed", maxAdults: 2, maxGuests: 3, view: "Lake", basePrice: 390,
    summary: "A private balcony over the lake and a bed you will not want to leave.",
    description: "Third floor, French windows opening to a balcony with two chairs and the whole lake in front of you. A king bed, a salon corner, a marble bathroom with bathtub and rain shower. Breakfast served on the balcony on request.",
    features: [F.balcony, F.lakeview, F.sofa, F.wifi, F.ac, F.nespresso, F.minibar, F.bath, F.rain, F.safe, F.tv, F.robes],
    images: ["/images/rooms/room-junior-suite.jpg", "/images/lake/terrace-view-2.jpg", "/images/house/breakfast-balcony.jpg", "/images/house/bathroom.jpg"],
    status: "active",
  },
  {
    ...V,
    id: "r7", number: 7, slug: "family-garden", name: "Family Garden", category: "Family",
    floor: 1, sizeM2: 36, beds: "Queen bed 160 cm + two single beds 90 cm", maxAdults: 3, maxGuests: 4, view: "Garden", basePrice: 360,
    summary: "One big room for four, straight onto the garden.",
    description: "Ground floor, with a door to the garden terrace. A queen bed and two single beds in an alcove, a dining corner, a bathroom with bathtub. Cot and high chair on request, at no charge.",
    features: [F.garden, F.wifi, F.ac, F.nespresso, F.bath, F.rain, F.safe, F.tv, F.blackout],
    images: ["/images/rooms/room-family.jpg", "/images/house/bathroom.jpg", "/images/house/lounge.jpg"],
    status: "active",
  },
  {
    ...V,
    id: "r8", number: 8, slug: "attic-lake", name: "Attic Lake", category: "Attic",
    floor: 4, sizeM2: 24, beds: "Queen bed 160 cm", maxAdults: 2, maxGuests: 2, view: "Lake", basePrice: 270,
    summary: "Under the roof, with a dormer framing the lake like a painting.",
    description: "Top floor, sloping ceilings and pale beams, a dormer window on the lake. A queen bed, a reading chair, a compact bathroom with rain shower. Romantic by nature; the stairs are part of the charm (there is a lift to the third floor).",
    features: [F.lakeview, F.wifi, F.ac, F.nespresso, F.rain, F.safe, F.tv, F.robes],
    images: ["/images/rooms/room-attic.jpg", "/images/house/bathroom.jpg"],
    status: "active",
  },
  {
    ...V,
    id: "r9", number: 9, slug: "duplex-suite", name: "Duplex Suite", category: "Suite",
    floor: 3, sizeM2: 48, beds: "King bed 180 cm on the mezzanine + sofa bed", maxAdults: 3, maxGuests: 4, view: "Lake", basePrice: 520,
    summary: "Two levels, a round window on the lake and a table for six.",
    description: "Our signature suite. Downstairs a salon with a dining table for six, a coffee corner and a round window over the port; up the spiral stair, a king bed under the roof. Perfect for a long weekend, a small celebration or a working stay.",
    features: [F.lakeview, F.mezz, F.dining, F.sofa, F.wifi, F.ac, F.nespresso, F.minibar, F.bath, F.rain, F.safe, F.tv, F.robes],
    images: ["/images/rooms/duplex-suite.jpg", "/images/house/lounge.jpg", "/images/house/bathroom.jpg"],
    status: "active",
  },
  {
    ...V,
    id: "r10", number: 10, slug: "attic-courtyard", name: "Attic Courtyard", category: "Attic",
    floor: 4, sizeM2: 19, beds: "Queen bed 150 cm", maxAdults: 2, maxGuests: 2, view: "Courtyard", basePrice: 215,
    summary: "Small, quiet and full of character — the best value in the house.",
    description: "A cosy attic room on the courtyard side with a queen bed, a reading chair and a skylight that fills it with light. Rain shower. The quietest option for light sleepers.",
    features: [F.courtyard, F.wifi, F.ac, F.nespresso, F.rain, F.safe, F.tv, F.soundproof],
    images: ["/images/rooms/attic-courtyard.jpg", "/images/house/bathroom.jpg"],
    status: "active",
  },
];

/* ---------- properties ---------- */

export const PROPERTIES: Property[] = [
  {
    id: SITE_PROPERTY, slug: "maison-vidy", name: "Maison Vidy", short: "Vidy", kind: "Hotel · 10 rooms",
    tagline: "Lausanne, by the lake.", address: "Chemin du Lac 12", city: "1007 Lausanne", country: "Switzerland",
    currency: "CHF", locale: "fr-CH", unitLabel: { one: "room", many: "rooms" },
    taxes: [{ id: "city", name: "City tax (taxe de séjour)", kind: "per_person_night", amount: 3.5 }],
    checkIn: "15:00", checkOut: "11:00",
    channels: [
      { id: "direct", name: "Direct (website)", connected: true, lastSync: "live", note: "no commission" },
      { id: "booking", name: "Booking.com", connected: true, lastSync: "2026-10-11T07:58:00", note: "15 % commission" },
      { id: "expedia", name: "Expedia", connected: true, lastSync: "2026-10-11T07:55:00", note: "18 % commission" },
      { id: "google", name: "Google Hotel Ads", connected: false },
      { id: "airbnb", name: "Airbnb", connected: false },
    ],
    paymentMethods: ["Visa", "Mastercard", "Amex", "Twint"],
    refPrefix: "MV", accent: "#1b4b73", image: "/images/house/lounge.jpg", website: "/",
  },
  {
    id: "cabanes", slug: "les-cabanes", name: "Les Cabanes", short: "Cabanes", kind: "Tree-house cabins · 4 cabins",
    tagline: "Four cabins in the Jorat forest, twenty minutes above the lake.", address: "Route du Chalet-à-Gobet", city: "1000 Lausanne 25", country: "Switzerland",
    currency: "CHF", locale: "fr-CH", unitLabel: { one: "cabin", many: "cabins" },
    taxes: [{ id: "city", name: "City tax (taxe de séjour)", kind: "per_person_night", amount: 3.5 }],
    checkIn: "16:00", checkOut: "11:00",
    channels: [
      { id: "direct", name: "Direct (website)", connected: true, lastSync: "live", note: "no commission" },
      { id: "airbnb", name: "Airbnb", connected: true, lastSync: "2026-10-11T07:51:00", note: "3 % host fee" },
      { id: "booking", name: "Booking.com", connected: true, lastSync: "2026-10-11T07:58:00", error: "Rate push rejected for Cabane Sapin — minimum stay missing" },
      { id: "expedia", name: "Expedia", connected: false },
      { id: "google", name: "Google Hotel Ads", connected: false },
    ],
    paymentMethods: ["Visa", "Mastercard", "Twint"],
    refPrefix: "LC", accent: "#3f6b4f", image: "/images/cabins/site.jpg",
  },
];

const C = { propertyId: "cabanes", housekeeping: "clean" as const, status: "active" as const, view: "Forest" as const, floor: 1 };
const CF = {
  wifi: "Wi-Fi (slow on purpose)", stove: "Wood stove", terrace: "Terrace in the canopy", kitchen: "Kitchenette",
  bath: "Bathroom with rain shower", tub: "Outdoor bathtub", sauna: "Private sauna", breakfast: "Breakfast basket at the ladder",
  firepit: "Fire pit", deck: "Round deck under the trees (shared)", sleeps: "Bunk alcove for two children", stars: "Skylight over the bed",
};

/** The second property: four tree-house cabins and a "whole site" parent that books them all for a workshop weekend or a group. */
export const CABINS: Room[] = [
  {
    ...C, id: "c0", kind: "whole", number: 0, slug: "whole-site", name: "The whole site", category: "Workshop · group",
    sizeM2: 130, beds: "Four cabins · 4 double beds + bunks", maxAdults: 8, maxGuests: 12, basePrice: 1150,
    summary: "All four cabins, the round deck and the fire pit — for a cooking weekend, a family or a team.",
    description: "Booking the whole site takes the four cabins at once and keeps the forest to your group. The round deck, the fire pit and the breakfast baskets are included; a chef for the deck kitchen and a host can be arranged.",
    features: [CF.deck, CF.firepit, CF.breakfast, CF.wifi], images: ["/images/cabins/site.jpg", "/images/cabins/hetre.jpg", "/images/cabins/chene.jpg", "/images/cabins/meleze.jpg"],
  },
  {
    ...C, id: "c1", kind: "cabin", parentId: "c0", number: 1, slug: "cabane-hetre", name: "Cabane Hêtre", category: "Cabin for two",
    sizeM2: 28, beds: "Double bed 160 cm", maxAdults: 2, maxGuests: 2, basePrice: 290,
    summary: "The first cabin up the path, in an old beech.",
    description: "Six metres up, a bed under a skylight, a wood stove and a terrace in the leaves. Breakfast arrives in a basket at the foot of the ladder.",
    features: [CF.stars, CF.stove, CF.terrace, CF.bath, CF.breakfast, CF.wifi], images: ["/images/cabins/hetre.jpg"],
  },
  {
    ...C, id: "c2", kind: "cabin", parentId: "c0", number: 2, slug: "cabane-chene", name: "Cabane Chêne", category: "Cabin with bathtub",
    sizeM2: 32, beds: "Double bed 180 cm", maxAdults: 2, maxGuests: 3, basePrice: 340,
    summary: "The oak cabin, with a bathtub on the terrace.",
    description: "The largest of the four for two: a king bed, a kitchenette, and an outdoor bathtub on the terrace looking down the valley.",
    features: [CF.tub, CF.kitchen, CF.stove, CF.terrace, CF.bath, CF.breakfast, CF.wifi], images: ["/images/cabins/chene.jpg", "/images/cabins/chene-2.jpg"],
  },
  {
    ...C, id: "c3", kind: "cabin", parentId: "c0", number: 3, slug: "cabane-sapin", name: "Cabane Sapin", category: "Family cabin",
    sizeM2: 40, beds: "Double bed 160 cm + bunk alcove", maxAdults: 2, maxGuests: 4, basePrice: 390,
    summary: "The fir cabin — two levels, for a family of four.",
    description: "A double bed upstairs, a bunk alcove below, a kitchenette and a wide terrace with a rope net. The one children ask to come back to.",
    features: [CF.sleeps, CF.kitchen, CF.stove, CF.terrace, CF.bath, CF.breakfast, CF.wifi], images: ["/images/cabins/sapin.jpg"],
  },
  {
    ...C, id: "c4", kind: "cabin", parentId: "c0", number: 4, slug: "cabane-meleze", name: "Cabane Mélèze", category: "Cabin with sauna",
    sizeM2: 30, beds: "Double bed 160 cm", maxAdults: 2, maxGuests: 2, basePrice: 360,
    summary: "The larch cabin, with its own sauna at the foot of the tree.",
    description: "The quietest cabin at the end of the path, a private barrel sauna below it and a fire pit of its own.",
    features: [CF.sauna, CF.firepit, CF.stove, CF.terrace, CF.bath, CF.breakfast, CF.wifi], images: ["/images/cabins/meleze.jpg", "/images/cabins/meleze-2.jpg"],
  },
];

export const ALL_UNITS: Room[] = [...ROOMS, ...CABINS];

/* ---------- demo reservations (deterministic) ---------- */

function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

const NAMES: [string, string, string, string][] = [
  ["Claire", "Favre", "Switzerland", "CH"], ["Lukas", "Brunner", "Switzerland", "CH"], ["Elena", "Rossi", "Italy", "IT"],
  ["Thomas", "Müller", "Germany", "DE"], ["Sophie", "Laurent", "France", "FR"], ["James", "Whitfield", "United Kingdom", "GB"],
  ["Anna", "Kowalski", "Poland", "PL"], ["Marc", "Dubois", "Belgium", "BE"], ["Yuki", "Tanaka", "Japan", "JP"],
  ["María", "Fernández", "Spain", "ES"], ["Olivier", "Besson", "Switzerland", "CH"], ["Nina", "Haugen", "Norway", "NO"],
  ["Daniel", "Cohen", "United States", "US"], ["Isabelle", "Martin", "France", "FR"], ["Pieter", "de Vries", "Netherlands", "NL"],
  ["Laura", "Schmid", "Switzerland", "CH"], ["Ahmed", "Khalil", "United Arab Emirates", "AE"], ["Chloé", "Renaud", "Switzerland", "CH"],
  ["Mateo", "García", "Mexico", "MX"], ["Hannah", "Fischer", "Austria", "AT"], ["Julien", "Perrin", "Switzerland", "CH"],
  ["Sara", "Lindqvist", "Sweden", "SE"], ["Rafael", "Costa", "Brazil", "BR"], ["Emma", "Johansson", "Sweden", "SE"],
  ["Kenji", "Sato", "Japan", "JP"], ["Lucia", "Bianchi", "Italy", "IT"], ["Nikola", "Petrović", "Serbia", "RS"],
  ["Grace", "O'Connor", "Ireland", "IE"], ["Felix", "Wagner", "Germany", "DE"], ["Camille", "Roux", "France", "FR"],
  ["Beatrice", "Hofmann", "Switzerland", "CH"], ["Samuel", "Nkemelu", "Nigeria", "NG"], ["Ingrid", "Berg", "Denmark", "DK"],
  ["Pablo", "Ortega", "Spain", "ES"], ["Aiko", "Nakamura", "Japan", "JP"], ["Victor", "Lemaire", "France", "FR"],
  ["Helena", "Novak", "Czechia", "CZ"], ["Omar", "Haddad", "Lebanon", "LB"], ["Mia", "Keller", "Switzerland", "CH"],
  ["Tom", "Bradley", "Australia", "AU"], ["Zoé", "Monnier", "Switzerland", "CH"], ["Arjun", "Mehta", "India", "IN"],
];

const SOURCES: ReservationSource[] = ["direct", "direct", "direct", "booking.com", "booking.com", "expedia", "phone", "walk-in", "email"];
const CABIN_SOURCES: ReservationSource[] = ["direct", "direct", "airbnb", "airbnb", "booking.com", "email", "phone"];
const NOTES = [
  "", "", "", "Anniversary — flowers in the room please.", "Arrives by train, late check-in around 22:00.",
  "Allergic to nuts (breakfast).", "Travelling with a toddler, cot requested.", "Quiet room if possible.",
  "Business trip, invoice to company.", "Celebrating a birthday on the second night.", "Needs parking for an EV.",
  "", "Vegetarian breakfast.", "Returning guest — third stay.",
];
const ARRIVALS = ["14:00–16:00", "16:00–18:00", "18:00–20:00", "after 20:00", "before 14:00"];

function emailFor(first: string, last: string, i: number) {
  const f = first.toLowerCase().normalize("NFD").replace(/[^a-z]/g, "");
  const l = last.toLowerCase().normalize("NFD").replace(/[^a-z]/g, "");
  const domains = ["gmail.com", "outlook.com", "bluewin.ch", "icloud.com", "proton.me", "orange.fr", "web.de"];
  return `${f}.${l}${i % 3 === 0 ? i : ""}@${domains[i % domains.length]}`;
}

function phoneFor(cc: string, r: () => number) {
  const prefixes: Record<string, string> = { CH: "+41 79", DE: "+49 170", FR: "+33 6", IT: "+39 33", GB: "+44 7", US: "+1 415", ES: "+34 6", NL: "+31 6", SE: "+46 70", JP: "+81 90" };
  const p = prefixes[cc] ?? "+41 78";
  const n = Math.floor(r() * 9_000_000 + 1_000_000).toString();
  return `${p} ${n.slice(0, 3)} ${n.slice(3, 5)} ${n.slice(5, 7)}`;
}

type Name = [string, string, string, string];

interface GenOpts {
  property: Property;
  units: Room[];
  sources: ReservationSource[];
  seed: number;
  count: number;
  today: string;
  /** How far the window reaches back and forward from today. */
  back: number;
  span: number;
}

/** Deterministic reservations for one property, anchored on `today` so the office always has arrivals, departures and in-house guests. */
function generate(o: GenOpts, out: Reservation[], seqStart: number): number {
  const r = rng(o.seed);
  const bookable = o.units.filter((u) => u.kind !== "whole");
  const start = addDays(o.today, -o.back);
  let attempts = 0;
  let seq = seqStart;
  let made = 0;
  while (made < o.count && attempts < 20000) {
    attempts++;
    const offset = Math.floor(r() * o.span);
    const checkIn = addDays(start, offset);
    const nights = 1 + Math.floor(r() * r() * 5) + (r() > 0.85 ? 2 : 0); // 1–7, skewed short
    const checkOut = addDays(checkIn, Math.max(1, nights));
    const room = bookable[Math.floor(r() * bookable.length)];
    const overlapping = out.some(
      (x) => x.propertyId === o.property.id && x.status !== "cancelled" && rangesOverlap(checkIn, checkOut, x.checkIn, x.checkOut) && (x.roomId === room.id || x.roomId === room.parentId),
    );
    if (overlapping) continue;

    const adults = Math.min(room.maxAdults, 1 + (r() > 0.25 ? 1 : 0) + (r() > 0.9 ? 1 : 0));
    const children = room.maxGuests - adults > 0 && r() > 0.7 ? Math.min(room.maxGuests - adults, 1 + (r() > 0.6 ? 1 : 0)) : 0;
    const planRoll = r();
    const ratePlan = planRoll < 0.45 ? "bed_breakfast" : planRoll < 0.8 ? "room_only" : "non_refundable";
    const plan = RATE_PLANS.find((p) => p.id === ratePlan)!;
    const extras: string[] = [];
    if (o.property.id === SITE_PROPERTY) {
      if (r() > 0.7) extras.push("parking");
      if (r() > 0.85) extras.push("airport_ride");
      if (r() > 0.88) extras.push("late_checkout");
      if (r() > 0.9) extras.push("ebike");
      if (r() > 0.92) extras.push("lavaux_tour");
    } else {
      if (r() > 0.8) extras.push("welcome");
      if (r() > 0.9) extras.push("station_pickup");
    }
    const tax = o.property.taxes.find((t) => t.kind === "per_person_night")?.amount ?? 0;
    const q = quote({
      room, checkIn, checkOut, adults, children, plan,
      extras: EXTRAS.filter((e) => extras.includes(e.id)),
      seasons: SEASONS, breakfastPrice: HOTEL.breakfastPrice, cityTaxPerPersonNight: tax,
    });
    const firstName = NAMES[seq % NAMES.length][0];
    const [, lastName, country, cc] = NAMES[(seq * 11 + 5) % NAMES.length];
    const source = o.sources[Math.floor(r() * o.sources.length)];
    let status: ReservationStatus;
    if (r() > 0.93) status = "cancelled";
    else if (checkOut <= o.today) status = "checked_out";
    else if (checkIn <= o.today) status = "checked_in";
    else status = source === "booking.com" && r() > 0.7 ? "pending" : "confirmed";
    const bookedOn = addDays(checkIn, -Math.floor(r() * 60) - 1);
    const createdDay = bookedOn > o.today ? addDays(o.today, -Math.floor(r() * 20)) : bookedOn;
    const createdAt = `${createdDay}T${String(8 + Math.floor(r() * 12)).padStart(2, "0")}:${String(Math.floor(r() * 60)).padStart(2, "0")}:00`;
    seq++;
    made++;
    const ref = `${o.property.refPrefix}-2026-${String(seq).padStart(4, "0")}`;
    const timeline = [{ at: createdAt, text: `Booked via ${source === "direct" ? "the website" : source}` }];
    if (status === "checked_in" || status === "checked_out") timeline.push({ at: `${checkIn}T15:30:00`, text: "Checked in" });
    if (status === "checked_out") timeline.push({ at: `${checkOut}T10:40:00`, text: "Checked out" });
    if (status === "cancelled") timeline.push({ at: `${addDays(checkIn, -3)}T09:10:00`, text: "Cancelled by guest" });
    out.push({
      id: `res_${seq}`,
      ref,
      propertyId: o.property.id,
      roomId: room.id,
      type: "stay",
      checkIn,
      checkOut,
      adults,
      children,
      guest: { firstName, lastName, email: emailFor(firstName, lastName, seq), phone: phoneFor(cc, r), country },
      ratePlan,
      extras,
      notes: NOTES[Math.floor(r() * NOTES.length)],
      arrivalTime: ARRIVALS[Math.floor(r() * ARRIVALS.length)],
      status,
      source,
      total: q.total,
      cityTax: q.cityTax,
      paid: status === "checked_out" || ratePlan === "non_refundable" || r() > 0.6,
      createdAt,
      timeline,
    });
  }
  return seq;
}

interface EnsureOpts {
  property: Property;
  roomId: string;
  checkIn: string;
  checkOut: string;
  name: Name;
  status: ReservationStatus;
  source: ReservationSource;
  type?: Reservation["type"];
  headcount?: number;
  holdUntil?: string;
  deposit?: number;
  paid?: boolean;
  notes?: string;
}

/** Place one reservation exactly, cancelling whatever it collides with (used to guarantee today's arrivals, departures, a hold and a workshop weekend). */
function ensure(o: EnsureOpts, out: Reservation[], seq: number, r: () => number): number {
  const room = ALL_UNITS.find((x) => x.id === o.roomId)!;
  const family = [room.id, room.parentId, ...ALL_UNITS.filter((u) => u.parentId === room.id).map((u) => u.id)].filter(Boolean);
  for (const c of out) {
    if (c.propertyId === o.property.id && family.includes(c.roomId) && c.status !== "cancelled" && rangesOverlap(o.checkIn, o.checkOut, c.checkIn, c.checkOut)) c.status = "cancelled";
  }
  seq++;
  const plan = RATE_PLANS[1];
  const tax = o.property.taxes.find((t) => t.kind === "per_person_night")?.amount ?? 0;
  const adults = o.headcount ? Math.min(room.maxAdults, o.headcount) : 2;
  const q = quote({ room, checkIn: o.checkIn, checkOut: o.checkOut, adults, children: 0, plan, extras: [], seasons: SEASONS, breakfastPrice: HOTEL.breakfastPrice, cityTaxPerPersonNight: tax });
  const total = o.headcount ? q.roomTotal + nightsBetween(o.checkIn, o.checkOut) * o.headcount * (HOTEL.breakfastPrice + tax) : q.total;
  const bookedAt = `${addDays(o.checkIn, -12)}T10:00:00`;
  out.push({
    id: `res_${seq}`, ref: `${o.property.refPrefix}-2026-${String(seq).padStart(4, "0")}`, propertyId: o.property.id, roomId: o.roomId,
    type: o.type ?? "stay", checkIn: o.checkIn, checkOut: o.checkOut, adults, children: 0, headcount: o.headcount, holdUntil: o.holdUntil, deposit: o.deposit,
    guest: { firstName: o.name[0], lastName: o.name[1], email: emailFor(o.name[0], o.name[1], seq), phone: phoneFor(o.name[3], r), country: o.name[2] },
    ratePlan: "bed_breakfast", extras: [], notes: o.notes ?? "", arrivalTime: ARRIVALS[1], status: o.status, source: o.source, total: Math.round(total), cityTax: q.cityTax,
    paid: o.paid ?? false, createdAt: bookedAt, timeline: [{ at: bookedAt, text: `Booked via ${o.source === "direct" ? "the website" : o.source}` }],
  });
  return seq;
}

export function buildDemoReservations(today = DEMO_TODAY): Reservation[] {
  const out: Reservation[] = [];
  const [vidy, cabanes] = PROPERTIES;
  const r = rng(20261011);

  let seq = generate({ property: vidy, units: ROOMS, sources: SOURCES, seed: 20261008, count: 300, today, back: 40, span: 112 }, out, 0);
  seq = ensure({ property: vidy, roomId: "r3", checkIn: today, checkOut: addDays(today, 3), name: ["Claire", "Favre", "Switzerland", "CH"], status: "confirmed", source: "direct", paid: true }, out, seq, r);
  seq = ensure({ property: vidy, roomId: "r6", checkIn: today, checkOut: addDays(today, 2), name: ["James", "Whitfield", "United Kingdom", "GB"], status: "confirmed", source: "booking.com", notes: "Arrives by train, late check-in around 22:00." }, out, seq, r);
  seq = ensure({ property: vidy, roomId: "r5", checkIn: addDays(today, -2), checkOut: today, name: ["Elena", "Rossi", "Italy", "IT"], status: "checked_in", source: "direct" }, out, seq, r);
  seq = ensure({ property: vidy, roomId: "r1", checkIn: addDays(today, -3), checkOut: today, name: ["Thomas", "Müller", "Germany", "DE"], status: "checked_in", source: "expedia", paid: true }, out, seq, r);
  seq = ensure({ property: vidy, roomId: "r9", checkIn: addDays(today, -1), checkOut: addDays(today, 2), name: ["Daniel", "Cohen", "United States", "US"], status: "checked_in", source: "direct", paid: true }, out, seq, r);
  seq = ensure({ property: vidy, roomId: "r7", checkIn: today, checkOut: addDays(today, 4), name: ["Mateo", "García", "Mexico", "MX"], status: "pending", source: "booking.com", notes: "Travelling with a toddler, cot requested." }, out, seq, r);

  seq = generate({ property: cabanes, units: CABINS, sources: CABIN_SOURCES, seed: 20261010, count: 120, today, back: 40, span: 112 }, out, 1000);
  seq = ensure({ property: cabanes, roomId: "c2", checkIn: today, checkOut: addDays(today, 2), name: ["Zoé", "Monnier", "Switzerland", "CH"], status: "confirmed", source: "airbnb", paid: true }, out, seq, r);
  seq = ensure({ property: cabanes, roomId: "c1", checkIn: addDays(today, -2), checkOut: today, name: ["Felix", "Wagner", "Germany", "DE"], status: "checked_in", source: "direct", paid: true }, out, seq, r);
  seq = ensure({ property: cabanes, roomId: "c4", checkIn: addDays(today, -1), checkOut: addDays(today, 1), name: ["Camille", "Roux", "France", "FR"], status: "checked_in", source: "direct", paid: true }, out, seq, r);
  // a cooking weekend that books the whole site, confirmed with a deposit
  seq = ensure({ property: cabanes, roomId: "c0", checkIn: addDays(today, 18), checkOut: addDays(today, 21), name: ["Nina", "Haugen", "Norway", "NO"], status: "confirmed", source: "email", type: "retreat", headcount: 10, deposit: 1800, notes: "Fondue & raclette weekend, 10 participants · chef from Épalinges · cellar visit in Lavaux on Saturday." }, out, seq, r);
  // a group hold on the whole site: dates kept until a day, nothing paid yet
  seq = ensure({ property: cabanes, roomId: "c0", checkIn: addDays(today, 39), checkOut: addDays(today, 41), name: ["Katrin", "Vogel", "Switzerland", "CH"], status: "pending", source: "phone", type: "whole", headcount: 9, holdUntil: addDays(today, 5), notes: "Team offsite option B — hold until Friday." }, out, seq, r);

  return out.sort((a, b) => (a.checkIn < b.checkIn ? -1 : 1));
}

const T = (at: string, text: string) => ({ at, text });

export const INQUIRIES: Inquiry[] = [
  {
    id: "inq_1", type: "group", source: "website", propertyId: SITE_PROPERTY, name: "Katrin Vogel", email: "k.vogel@helvetia-consult.ch", phone: "+41 44 555 12 90",
    subject: "Team offsite, 6 rooms, 12–14 November", dates: "12–14 Nov 2026", headcount: 9,
    message: "We are a team of 9 (6 rooms, 3 of them twin) looking for two nights with breakfast and the use of a meeting space for one afternoon. Could you send a group offer? We would also like a dinner reservation nearby for Thursday evening.",
    createdAt: "2026-10-07T16:42:00", status: "offer",
    reply: "Offer sent: 6 rooms B&B at the group rate, salon reserved Thursday afternoon, table for 9 at Le Rivage held until Friday.",
    nextAction: { label: "Call Katrin — twin rooms confirmed?", due: "2026-10-12" },
    notes: [T("2026-10-08T09:20:00", "Prefers invoice to the company, VAT number to follow."), T("2026-10-09T11:05:00", "Also asked about the cabins for option B — hold placed on the whole site 19–21 Nov.")],
    timeline: [T("2026-10-07T16:42:00", "Received from the website"), T("2026-10-08T09:15:00", "Replied"), T("2026-10-09T10:50:00", "Offer sent")],
  },
  {
    id: "inq_2", type: "concierge", source: "whatsapp", propertyId: SITE_PROPERTY, name: "Sophie Laurent", email: "sophie.laurent@orange.fr",
    subject: "Château de Chillon tickets + boat", dates: "18 Oct 2026",
    message: "We arrive on the 17th. Could you book two tickets for Château de Chillon for Sunday morning and tell us the best boat from Ouchy? We would love to come back by train through Lavaux.",
    createdAt: "2026-10-10T09:15:00", status: "new",
    nextAction: { label: "Book Chillon tickets, send boat times", due: "2026-10-11" },
    notes: [], timeline: [T("2026-10-10T09:15:00", "Received on WhatsApp")],
  },
  {
    id: "inq_3", type: "contact", source: "website", propertyId: SITE_PROPERTY, name: "Marco Bellini", email: "marco.bellini@icloud.com", phone: "+39 338 555 0142",
    subject: "Anniversary dinner on the terrace",
    message: "It is our 10th anniversary on 24 October. Is it possible to have a private dinner on the terrace, or a table at a restaurant with a lake view that you would recommend? Also, flowers in the room please — I will book the Junior Suite now.",
    createdAt: "2026-10-06T20:05:00", status: "replied",
    reply: "Congratulations! The terrace closes for dinner in late October, but we can set a candlelit table in the salon with the lake lit outside, or reserve at Le Rivage in Ouchy. Flowers will be in the room. — Reception",
    nextAction: { label: "Confirm salon table or Le Rivage", due: "2026-10-14" },
    notes: [T("2026-10-07T08:00:00", "Booked the Junior Suite 23–25 Oct (MV-2026-0287).")],
    timeline: [T("2026-10-06T20:05:00", "Received from the website"), T("2026-10-07T07:55:00", "Replied")],
  },
  {
    id: "inq_4", type: "contact", source: "email", propertyId: SITE_PROPERTY, name: "Ingrid Berg", email: "ingrid.berg@gmail.com",
    subject: "Gluten-free breakfast?",
    message: "Before I book: is a gluten-free breakfast possible? Bread, cereals, etc. Thank you.",
    createdAt: "2026-10-05T11:30:00", status: "replied",
    reply: "Yes — gluten-free bread, granola and a hot option every morning. Just mention it in the booking notes. — Reception",
    notes: [], timeline: [T("2026-10-05T11:30:00", "Received by email"), T("2026-10-05T12:10:00", "Replied")],
  },
  {
    id: "inq_5", type: "concierge", source: "whatsapp", propertyId: SITE_PROPERTY, name: "Daniel Cohen", email: "daniel.cohen3@gmail.com",
    subject: "Babysitter for Saturday evening", dates: "10 Oct 2026",
    message: "We are in the Duplex Suite until Saturday. Could you arrange a babysitter (English speaking) from 19:00 to 23:00 so we can have dinner out?",
    createdAt: "2026-10-04T18:20:00", status: "won",
    reply: "Arranged with Mme Perret (English/French), CHF 35 per hour, she will be at the hotel at 18:50. — Reception",
    notes: [], timeline: [T("2026-10-04T18:20:00", "Received on WhatsApp"), T("2026-10-04T18:40:00", "Replied"), T("2026-10-05T09:00:00", "Done — babysitter confirmed")],
  },
  {
    id: "inq_6", type: "whole", source: "website", propertyId: SITE_PROPERTY, name: "Aurélie & Noah", email: "aurelie.noah.wedding@gmail.com",
    subject: "Wedding guests, whole house, 5–7 June 2027", dates: "5–7 Jun 2027", headcount: 22,
    message: "We are getting married in Lutry next June and would love to book the whole hotel for our families (about 22 people). Is that possible, and what would the terms be?",
    createdAt: "2026-10-02T14:10:00", status: "new",
    nextAction: { label: "Send whole-house terms (22 guests, 2 nights)", due: "2026-10-11" },
    notes: [], timeline: [T("2026-10-02T14:10:00", "Received from the website")],
  },
  {
    id: "inq_7", type: "retreat", source: "instagram", propertyId: "cabanes", name: "Lena Hartmann", email: "lena@table-sauvage.ch", phone: "+41 79 555 44 10",
    subject: "Fondue weekend, whole site, 14–17 May 2027", dates: "14–17 May 2027", headcount: 11,
    message: "I run small cooking weekends (10–12 people) and found you on Instagram. Could we take all four cabins for three nights in May, with the round deck for a fondue and raclette class on the Saturday and a cellar visit in Lavaux? What is the deposit?",
    createdAt: "2026-10-09T21:30:00", status: "replied",
    reply: "Yes — the whole site is yours for those dates, the deck and its outdoor kitchen are included and we work with a cheesemaker in Épalinges for the fondue. Offer with the deposit terms follows tomorrow. — Les Cabanes",
    nextAction: { label: "Send cooking-weekend offer with 30 % deposit", due: "2026-10-12" },
    notes: [T("2026-10-10T08:15:00", "Second cooking group this year from Instagram — the cabins' link in bio works.")],
    timeline: [T("2026-10-09T21:30:00", "Received on Instagram"), T("2026-10-10T08:10:00", "Replied")],
  },
  {
    id: "inq_8", type: "venue", source: "email", propertyId: "cabanes", name: "Rafael Costa", email: "r.costa@lumen-studio.com",
    subject: "Team day with our own trainer, 28 November", dates: "28 Nov 2026", headcount: 14,
    message: "We would like to hire the site for one day (no overnight) for a team workshop of 14 with our own trainer — the round deck, the fire pit and lunch. Is that something you do?",
    createdAt: "2026-10-08T15:05:00", status: "lost",
    reply: "Thank you — the site is taken by a cooking weekend that week and we only hire the deck to groups staying overnight. We would gladly host the team for a night in the spring. — Les Cabanes",
    notes: [T("2026-10-09T09:00:00", "Dates clash with the fondue weekend; offered spring instead.")],
    timeline: [T("2026-10-08T15:05:00", "Received by email"), T("2026-10-09T08:50:00", "Replied"), T("2026-10-09T08:50:00", "Lost — dates not available")],
  },
];

export const REVIEWS = [
  { name: "Charlotte", country: "United Kingdom", date: "September 2026", rating: 5, text: "Ten rooms, a garden, the lake at the end of the street. Breakfast on the balcony was the highlight of our Swiss trip." },
  { name: "Matthias", country: "Germany", date: "August 2026", rating: 5, text: "Small hotel done right. Everything is a short walk away and the staff booked our Lavaux tour in minutes over WhatsApp." },
  { name: "Aline", country: "Switzerland", date: "June 2026", rating: 5, text: "We came for the Olympic Museum with the kids and stayed in the Family room. Quiet, spotless, very kind people." },
];

export function nightsOf(r: Reservation) {
  return nightsBetween(r.checkIn, r.checkOut);
}
