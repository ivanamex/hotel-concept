import type { MetadataRoute } from "next";
import { ROOMS } from "@/lib/seed";

const BASE = "https://hotel-concept.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = ["", "/rooms", "/book", "/experiences", "/dining", "/offers", "/gallery", "/contact", "/request", "/terms", "/privacy", "/imprint"];
  return [
    ...pages.map((p) => ({ url: `${BASE}${p}`, changeFrequency: "weekly" as const, priority: p === "" ? 1 : 0.7 })),
    ...ROOMS.map((r) => ({ url: `${BASE}/rooms/${r.slug}`, changeFrequency: "monthly" as const, priority: 0.8 })),
  ];
}
