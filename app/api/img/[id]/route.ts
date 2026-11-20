import { openImage } from "@/lib/storage";

export const runtime = "nodejs";

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const img = await openImage(id);
  if (!img) return new Response("Not found", { status: 404 });

  return new Response(img.body as BodyInit, {
    headers: {
      "Content-Type": img.mime,
      // short CDN cache so a removed picture disappears within minutes
      "Cache-Control": "public, max-age=600, s-maxage=60",
      "X-Content-Type-Options": "nosniff",
      "Content-Security-Policy": "default-src 'none'; sandbox",
    },
  });
}
