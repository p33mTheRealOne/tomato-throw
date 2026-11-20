import type { Metadata } from "next";
import HomeClient from "@/components/HomeClient";
import { OG_SIZE } from "@/lib/og";
import { SITE_NAME, siteUrl } from "@/lib/site";

const TITLE = "Tomato Throw: Throw Tomatoes at Any Picture Online";
const DESCRIPTION =
  "Upload any picture, get a shareable link, then tap to throw tomatoes at it. Watch them fly and splat. Free, instant, no sign-up needed.";

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  alternates: { canonical: "/" },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large" } },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    locale: "en_US",
    url: "/",
    title: TITLE,
    description: DESCRIPTION,
    images: [{ url: "/og", width: OG_SIZE.width, height: OG_SIZE.height, alt: "Tomato Throw: a tomato splatting across the page" }],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: [{ url: "/og", alt: "Tomato Throw: a tomato splatting across the page" }],
  },
};

export default function Home() {
  const base = siteUrl();
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${base}/#website`,
        url: `${base}/`,
        name: SITE_NAME,
        description: DESCRIPTION,
        inLanguage: "en",
      },
      {
        "@type": "WebApplication",
        "@id": `${base}/#app`,
        url: `${base}/`,
        name: SITE_NAME,
        description: DESCRIPTION,
        applicationCategory: "EntertainmentApplication",
        operatingSystem: "Any (web browser)",
        browserRequirements: "Requires JavaScript",
        isAccessibleForFree: true,
        inLanguage: "en",
        offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        // "<" is escaped so the JSON can never close the script tag
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <HomeClient />
    </>
  );
}
