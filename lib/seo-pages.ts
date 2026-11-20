/**
 * Indexable pages for sitemap.xml.
 * Update `lastmod` (YYYY-MM-DD) only when that page's real content changes:
 * Google ignores <lastmod> if it is not consistently accurate.
 * User picture pages (/p/*) are noindex, so they are never listed.
 */
export type SeoPage = { path: string; lastmod: string; priority: number };

export const SEO_PAGES: SeoPage[] = [
  { path: "/", lastmod: "2026-11-20", priority: 1.0 },
  { path: "/privacy-terms", lastmod: "2026-11-20", priority: 0.4 },
];
