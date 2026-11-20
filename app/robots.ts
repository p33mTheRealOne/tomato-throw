import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  const base = siteUrl();
  return {
    // /p/* pages are noindex (via meta tags) but must stay crawlable so crawlers can read that tag.
    // /og/* must stay crawlable too: X and other link-preview bots honour robots.txt.
    rules: [{ userAgent: "*", allow: "/", disallow: ["/api/"] }],
    sitemap: `${base}/sitemap.xml`,
  };
}
