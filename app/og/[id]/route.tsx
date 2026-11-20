import { ImageResponse } from "next/og";
import sharp from "sharp";
import { tomatoElements } from "@/components/TomatoArt";
import { OG_SIZE, splatsForId } from "@/lib/og";
import { getImageInfo, readImageBuffer } from "@/lib/storage";

export const runtime = "nodejs";

const HEADERS = { "Cache-Control": "public, max-age=3600, s-maxage=3600" };

/** Static OG image: the user's picture with tomatoes already splatted on it. */
export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const info = await getImageInfo(id);
  if (!info) return new Response("Not found", { status: 404 });

  let photo: string | null = null;
  try {
    const buf = await readImageBuffer(id);
    if (buf) {
      // sharp: honour EXIF rotation, crop to 1.91:1, and turn webp/gif/png into a small JPEG
      const out = await sharp(buf).rotate().resize(OG_SIZE.width, OG_SIZE.height, { fit: "cover", position: "attention" }).jpeg({ quality: 82 }).toBuffer();
      photo = `data:image/jpeg;base64,${out.toString("base64")}`;
    }
  } catch (e) {
    console.error("[og] could not process picture:", e);
  }

  return new ImageResponse(
    (
      <div style={{ display: "flex", position: "relative", width: OG_SIZE.width, height: OG_SIZE.height, background: "#e6d9bd", overflow: "hidden" }}>
        {photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={photo} width={OG_SIZE.width} height={OG_SIZE.height} alt="" style={{ position: "absolute", left: 0, top: 0 }} />
        ) : (
          <svg width="360" height="360" viewBox="0 0 100 100" style={{ position: "absolute", left: 420, top: 135 }}>
            {tomatoElements()}
          </svg>
        )}
        {splatsForId(id)}
      </div>
    ),
    { ...OG_SIZE, headers: HEADERS },
  );
}
