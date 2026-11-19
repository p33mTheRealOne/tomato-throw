import { findImage, readLocalImage } from "@/lib/storage";

export const runtime = "nodejs";

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;

  // Vercel Blob mode: image lives on the blob CDN
  const found = await findImage(id);
  if (!found) return new Response("Not found", { status: 404 });
  if (/^https?:\/\//.test(found.url)) return Response.redirect(found.url, 302);

  // Local-disk mode (dev)
  const local = await readLocalImage(id);
  if (!local) return new Response("Not found", { status: 404 });
  return new Response(new Uint8Array(local.data), {
    headers: {
      "Content-Type": local.mime,
      "Content-Length": String(local.data.length),
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
      "Content-Security-Policy": "default-src 'none'; sandbox",
    },
  });
}
