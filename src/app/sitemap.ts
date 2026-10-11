import type { MetadataRoute } from "next";
import { LOCALES, alternates, localePath } from "@/i18n/config";
import { CABINS, ROOMS } from "@/lib/seed";
import { EXPERIENCES } from "@/lib/experiences";

const BASE = "https://hotel-concept.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = ["/", "/rooms", "/cabanes", "/book", "/experiences", "/dining", "/offers", "/gallery", "/contact", "/request", "/terms", "/privacy", "/imprint", ...ROOMS.map((r) => `/rooms/${r.slug}`), ...CABINS.filter((c) => c.kind !== "whole").map((c) => `/rooms/${c.slug}`), ...EXPERIENCES.map((e) => `/experiences/${e.slug}`)];
  return pages.flatMap((internal) =>
    LOCALES.map((lang) => ({
      url: BASE + localePath(lang, internal),
      changeFrequency: internal.startsWith("/rooms/") ? ("monthly" as const) : ("weekly" as const),
      priority: internal === "/" ? 1 : internal.startsWith("/rooms/") ? 0.8 : 0.7,
      alternates: { languages: alternates(internal, BASE) },
    })),
  );
}
