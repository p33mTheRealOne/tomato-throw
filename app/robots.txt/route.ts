import { siteUrl } from "@/lib/site";

export const dynamic = "force-static";

export function GET() {
  const base = siteUrl();
  const body = `# Tomato Throw robots.txt
User-agent: *
Allow: /

# API and admin routes: nothing here is meant for search
Disallow: /api/

# Deliberately NOT blocked:
#  /_next/  holds the JS and CSS Google needs to render the page
#  /p/      picture pages are noindex via meta tag; crawlers must be able to read that tag
#  /og/     link-preview bots (X, Facebook, Slack) fetch these images and honour robots.txt

Sitemap: ${base}/sitemap.xml
`;
  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
