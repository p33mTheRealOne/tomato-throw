import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import TomatoStage from "@/components/TomatoStage";
import { findImage } from "@/lib/storage";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Throw tomatoes at this pic",
  robots: { index: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const found = await findImage(id);
  if (!found) notFound();
  return <TomatoStage src={found.url} />;
}
