import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";

// Only the home page is indexable. User picture pages (/p/*) are noindex, so they are not listed.
// <lastmod> is left out on purpose: a made-up date is worse than none.
export default function sitemap(): MetadataRoute.Sitemap {
  return [{ url: `${siteUrl()}/` }];
}
