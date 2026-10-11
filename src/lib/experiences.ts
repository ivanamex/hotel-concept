/** Bookable experiences — open to guests of the house and to anyone else. Copy lives in the dictionaries under experiences.catalog. */

export type ExperienceCategory = "table" | "vineyards" | "lake" | "city" | "forest";

export interface ExperienceProduct {
  slug: string;
  category: ExperienceCategory;
  propertyId: string;
  durationH: number;
  /** Start times, HH:MM. */
  times: string[];
  /** Days it runs, 0 = Sunday … 6 = Saturday. Empty = every day. */
  days: number[];
  /** MM-DD, inclusive; omitted = all year. */
  season?: { from: string; to: string };
  price: number;
  priceUnit: "person" | "group";
  minPeople: number;
  maxPeople: number;
  image: string;
  gallery: string[];
  video?: string | string[];
}

export const EXPERIENCES: ExperienceProduct[] = [
  {
    slug: "fondue-evening", category: "table", propertyId: "cabanes", durationH: 3.5, times: ["18:00"], days: [5, 6],
    price: 95, priceUnit: "person", minPeople: 4, maxPeople: 12,
    image: "/images/cabins/meleze.jpg", gallery: ["/images/cabins/meleze.jpg", "/images/cabins/site.jpg", "/images/cabins/chene.jpg", "/images/cabins/hetre.jpg"],
  },
  {
    slug: "lavaux-walk", category: "vineyards", propertyId: "vidy", durationH: 4, times: ["13:30"], days: [4, 6],
    price: 150, priceUnit: "person", minPeople: 2, maxPeople: 10,
    image: "/images/around/lavaux.jpg", gallery: ["/images/around/lavaux.jpg", "/images/around/lavaux-2.jpg", "/images/lake/terrace-view.jpg", "/images/lake/marina.jpg"], video: ["/videos/hero.mp4"],
  },
  {
    slug: "sunrise-paddle", category: "lake", propertyId: "vidy", durationH: 2, times: ["06:30"], days: [], season: { from: "05-01", to: "09-30" },
    price: 55, priceUnit: "person", minPeople: 1, maxPeople: 8,
    image: "/images/lake/beach-aerial.jpg", gallery: ["/images/lake/beach-aerial.jpg", "/images/lake/swans.jpg", "/images/lake/lakeside-path.jpg", "/images/lake/hero-lake.jpg"], video: ["/videos/swans.mp4"],
  },
  {
    slug: "private-boat", category: "lake", propertyId: "vidy", durationH: 2, times: ["10:00", "14:00", "17:30"], days: [], season: { from: "04-01", to: "10-31" },
    price: 480, priceUnit: "group", minPeople: 1, maxPeople: 6,
    image: "/images/lake/marina.jpg", gallery: ["/images/lake/marina.jpg", "/images/lake/aerial-day.jpg", "/images/lake/terrace-view-2.jpg", "/images/lake/hero-lake.jpg"], video: ["/videos/hero-lake.mp4"],
  },
  {
    slug: "chocolate-walk", category: "city", propertyId: "vidy", durationH: 3, times: ["10:00"], days: [3, 6],
    price: 85, priceUnit: "person", minPeople: 2, maxPeople: 10,
    image: "/images/around/old-town.jpg", gallery: ["/images/around/old-town.jpg", "/images/around/old-town-2.jpg", "/images/house/lounge.jpg"],
  },
  {
    slug: "ebike-lavaux", category: "vineyards", propertyId: "vidy", durationH: 7, times: ["09:30"], days: [], season: { from: "03-15", to: "10-31" },
    price: 65, priceUnit: "person", minPeople: 1, maxPeople: 8,
    image: "/images/lake/lakeside-path.jpg", gallery: ["/images/lake/lakeside-path.jpg", "/images/around/lavaux-2.jpg", "/images/lake/lakeside-path-2.jpg", "/images/around/olympic-park.jpg"], video: ["/videos/terrace-dusk.mp4"],
  },
];

export function experienceBySlug(slug: string): ExperienceProduct | undefined {
  return EXPERIENCES.find((e) => e.slug === slug);
}

/** Does this experience run on a given day (YYYY-MM-DD)? */
export function runsOn(e: ExperienceProduct, date: string): boolean {
  const [y, m, d] = date.split("-").map(Number);
  const dow = new Date(y, m - 1, d).getDay();
  if (e.days.length && !e.days.includes(dow)) return false;
  if (e.season) {
    const mmdd = date.slice(5);
    const { from, to } = e.season;
    const inSeason = from <= to ? mmdd >= from && mmdd <= to : mmdd >= from || mmdd <= to;
    if (!inSeason) return false;
  }
  return true;
}

/** The first date on or after `from` the experience runs. */
export function nextRun(e: ExperienceProduct, from: string): string {
  let d = from;
  for (let i = 0; i < 400; i++) {
    if (runsOn(e, d)) return d;
    const [y, m, day] = d.split("-").map(Number);
    const n = new Date(y, m - 1, day + 1);
    d = `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, "0")}-${String(n.getDate()).padStart(2, "0")}`;
  }
  return from;
}

export function experienceTotal(e: ExperienceProduct, people: number): number {
  return e.priceUnit === "person" ? e.price * people : e.price;
}
