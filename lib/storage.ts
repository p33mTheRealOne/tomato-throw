import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { get, list, put } from "@vercel/blob";

/**
 * Storage with two backends, picked automatically:
 *  - Vercel Blob   when BLOB_READ_WRITE_TOKEN is set (production on Vercel)
 *  - local disk    otherwise (npm run dev) -> .uploads/
 * Public API: saveImage / findImage / readLocalImage
 */
const USE_BLOB = Boolean(process.env.BLOB_READ_WRITE_TOKEN);
// Must match the access mode of your Blob store (default: private). Set BLOB_ACCESS=public for a public store.
const ACCESS: "private" | "public" = process.env.BLOB_ACCESS === "public" ? "public" : "private";
const DIR = process.env.UPLOAD_DIR ?? path.join(/*turbopackIgnore: true*/ process.cwd(), ".uploads");

export const ID_RE = /^[A-Za-z0-9_-]{12}$/;
// Vercel serverless request bodies are capped at 4.5 MB; the client downsizes big photos first.
export const MAX_BYTES = USE_BLOB ? 4.4 * 1024 * 1024 : 15 * 1024 * 1024;

const MIME: Record<string, string> = {
  png: "image/png",
  jpg: "image/jpeg",
  webp: "image/webp",
  gif: "image/gif",
};

/** Detect real image type from magic bytes (never trust client MIME / filename). */
export function sniffImage(buf: Buffer): keyof typeof MIME | null {
  if (buf.length < 12) return null;
  if (buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47) return "png";
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return "jpg";
  if (buf.toString("ascii", 0, 4) === "GIF8") return "gif";
  if (buf.toString("ascii", 0, 4) === "RIFF" && buf.toString("ascii", 8, 12) === "WEBP") return "webp";
  return null;
}

export async function saveImage(buf: Buffer, ext: string): Promise<string> {
  const id = crypto.randomBytes(9).toString("base64url"); // 12 chars
  if (USE_BLOB) {
    await put(`img/${id}.${ext}`, buf, {
      access: ACCESS,
      contentType: MIME[ext],
      addRandomSuffix: false,
    });
  } else {
    await fs.mkdir(DIR, { recursive: true });
    await fs.writeFile(path.join(/*turbopackIgnore: true*/ DIR, `${id}.${ext}`), buf);
  }
  return id;
}

/** Does this image exist? Returns the URL the browser should load it from (always our own /api/img). */
export async function findImage(id: string): Promise<{ url: string } | null> {
  if (!ID_RE.test(id)) return null;

  if (USE_BLOB) {
    const { blobs } = await list({ prefix: `img/${id}.`, limit: 1 });
    return blobs[0] ? { url: `/api/img/${id}` } : null;
  }

  for (const ext of Object.keys(MIME)) {
    try {
      await fs.access(path.join(/*turbopackIgnore: true*/ DIR, `${id}.${ext}`));
      return { url: `/api/img/${id}` };
    } catch {
      /* try next */
    }
  }
  return null;
}

/** Open the image bytes (from Blob or local disk) so /api/img/[id] can stream them. */
export async function openImage(id: string): Promise<{ body: BodyInit; mime: string } | null> {
  if (!ID_RE.test(id)) return null;

  if (USE_BLOB) {
    const { blobs } = await list({ prefix: `img/${id}.`, limit: 1 });
    const pathname = blobs[0]?.pathname;
    if (!pathname) return null;
    const res = await get(pathname, { access: ACCESS });
    if (!res || res.statusCode !== 200) return null;
    const ext = pathname.split(".").pop() ?? "";
    // derive the type from our own extension, never from stored metadata
    return { body: res.stream, mime: MIME[ext] ?? "application/octet-stream" };
  }

  for (const ext of Object.keys(MIME)) {
    try {
      const data = await fs.readFile(path.join(/*turbopackIgnore: true*/ DIR, `${id}.${ext}`));
      return { body: new Uint8Array(data), mime: MIME[ext] };
    } catch {
      /* try next */
    }
  }
  return null;
}
