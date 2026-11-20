import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import TomatoStage from "@/components/TomatoStage";
import { OG_SIZE } from "@/lib/og";
import { SITE_NAME } from "@/lib/site";
import { getImageInfo } from "@/lib/storage";

export const dynamic = "force-dynamic";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const info = await getImageInfo(id);
  if (!info) return { title: "Picture not found", robots: { index: false, follow: false } };

  const label = info.name || "this pic";
  const title = `Throw tomato at ${label}`;
  const description = info.name
    ? `Tap anywhere to throw tomatoes at ${info.name} and watch them splat. Share the link, or upload your own pic on ${SITE_NAME}.`
    : `Tap anywhere to throw tomatoes at this pic and watch them splat. Share the link, or upload your own pic on ${SITE_NAME}.`;
  const ogImage = { url: `/og/${id}`, width: OG_SIZE.width, height: OG_SIZE.height, alt: `${label} covered in splatted tomatoes` };

  return {
    title: { absolute: title },
    description,
    alternates: { canonical: `/p/${id}` },
    // User-made pages stay out of search results; link previews (OG/Twitter) still work.
    robots: { index: false, follow: false },
    openGraph: { type: "website", siteName: SITE_NAME, locale: "en_US", url: `/p/${id}`, title, description, images: [ogImage] },
    twitter: { card: "summary_large_image", title, description, images: [{ url: ogImage.url, alt: ogImage.alt }] },
  };
}

export default async function Page({ params }: Props) {
  const { id } = await params;
  const info = await getImageInfo(id);
  if (!info) notFound();
  return <TomatoStage src={`/api/img/${id}`} name={info.name} id={id} />;
}
