import type { MetadataRoute } from "next";

// Demo phase: keep the concept out of search engines.
export default function robots(): MetadataRoute.Robots {
  return { rules: { userAgent: "*", disallow: "/" } };
}
