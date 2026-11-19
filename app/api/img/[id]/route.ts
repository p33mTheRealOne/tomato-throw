import { openImage } from "@/lib/storage";

export const runtime = "nodejs";

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const img = await openImage(id);
  if (!img) return new Response("Not found", { status: 404 });

  return new Response(img.body, {
    headers: {
      "Content-Type": img.mime,
      // ids are random and never overwritten, so the image can be cached hard
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
      "Content-Security-Policy": "default-src 'none'; sandbox",
    },
  });
}
