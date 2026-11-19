import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { cache } from "react";
import { get, list, put } from "@vercel/blob";

/**
 * Storage with two backends, picked automatically:
 *  - Vercel Blob   when Blob credentials exist (production on Vercel)
 *  - local disk    otherwise (npm run dev) -> .uploads/
 *
 * Each picture is ONE file named  <id>~<base64url(name)>.<ext>  (blob: img/<...>),
 * so a single list call gives us both "does it exist" and "what is it called".
 */
export const HAS_BLOB = Boolean(process.env.BLOB_READ_WRITE_TOKEN || process.env.BLOB_STORE_ID);
const USE_BLOB = HAS_BLOB;
const ACCESS: "private" | "public" = process.env.BLOB_ACCESS === "public" ? "public" : "private";
const DIR = process.env.UPLOAD_DIR ?? path.join(/*turbopackIgnore: true*/ process.cwd(), ".uploads");

export const ID_RE = /^[A-Za-z0-9_-]{12}$/;
export const NAME_MAX = 40;
// Vercel serverless request bodies are capped at 4.5 MB; the client downsizes big photos first.
export const MAX_BYTES = USE_BLOB ? 4.4 * 1024 * 1024 : 15 * 1024 * 1024;

const MIME: Record<string, string> = {
  png: "image/png",
  jpg: "image/jpeg",
  webp: "image/webp",
  gif: "image/gif",
};

const FILE_RE = /^(?:img\/)?([A-Za-z0-9_-]{12})(?:~([A-Za-z0-9_-]*))?\.(png|jpg|webp|gif)$/;

/** Detect real image type from magic bytes (never trust client MIME / filename). */
export function sniffImage(buf: Buffer): keyof typeof MIME | null {
  if (buf.length < 12) return null;
  if (buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47) return "png";
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return "jpg";
  if (buf.toString("ascii", 0, 4) === "GIF8") return "gif";
  if (buf.toString("ascii", 0, 4) === "RIFF" && buf.toString("ascii", 8, 12) === "WEBP") return "webp";
  return null;
}

// control chars, zero-width / invisible chars, line+paragraph separators, bidi overrides
const UNSAFE_CHARS = new RegExp("[\\u0000-\\u001F\\u007F-\\u009F\\u200B-\\u200F\\u2028-\\u202E\\u2060-\\u206F\\uFEFF]", "g");

/** Plain-text picture name: no control / invisible / bidi-override characters, one line, max 40 chars. */
export function cleanName(raw: unknown): string {
  if (typeof raw !== "string") return "";
  const s = raw
    .normalize("NFC")
    .replace(UNSAFE_CHARS, " ")
    .replace(/\s+/g, " ")
    .trim();
  return Array.from(s).slice(0, NAME_MAX).join("").trim();
}

export type ImageInfo = { id: string; ext: string; name: string; mime: string; file: string };

function parseFile(file: string, expectId?: string): ImageInfo | null {
  const m = FILE_RE.exec(file);
  if (!m) return null;
  if (expectId && m[1] !== expectId) return null;
  let name = "";
  if (m[2]) {
    try {
      name = cleanName(Buffer.from(m[2], "base64url").toString("utf8"));
    } catch {
      name = "";
    }
  }
  return { id: m[1], ext: m[3], name, mime: MIME[m[3]], file };
}

export async function saveImage(buf: Buffer, ext: string, rawName = ""): Promise<string> {
  const id = crypto.randomBytes(9).toString("base64url"); // 12 chars
  const enc = Buffer.from(cleanName(rawName), "utf8").toString("base64url");
  const file = `${id}${enc ? `~${enc}` : ""}.${ext}`;
  if (USE_BLOB) {
    await put(`img/${file}`, buf, { access: ACCESS, contentType: MIME[ext], addRandomSuffix: false });
  } else {
    await fs.mkdir(DIR, { recursive: true });
    await fs.writeFile(path.join(/*turbopackIgnore: true*/ DIR, file), buf);
  }
  return id;
}

/** Look a picture up by id. Cached per request so metadata, page and OG share one lookup. */
export const getImageInfo = cache(async (id: string): Promise<ImageInfo | null> => {
  if (!ID_RE.test(id)) return null;

  if (USE_BLOB) {
    const { blobs } = await list({ prefix: `img/${id}`, limit: 5 });
    for (const b of blobs) {
      const info = parseFile(b.pathname, id);
      if (info) return info;
    }
    return null;
  }

  try {
    for (const f of await fs.readdir(/*turbopackIgnore: true*/ DIR)) {
      if (!f.startsWith(id)) continue;
      const info = parseFile(f, id);
      if (info) return info;
    }
  } catch {
    /* no uploads yet */
  }
  return null;
});

/** Open the image bytes (from Blob or local disk) so routes can stream / read them. */
export async function openImage(id: string): Promise<{ body: ReadableStream<Uint8Array> | Uint8Array; mime: string } | null> {
  const info = await getImageInfo(id);
  if (!info) return null;

  if (USE_BLOB) {
    const res = await get(`img/${info.file.replace(/^img\//, "")}`, { access: ACCESS });
    if (!res || res.statusCode !== 200) return null;
    // type comes from our own extension, never from stored metadata
    return { body: res.stream, mime: info.mime };
  }

  try {
    const data = await fs.readFile(path.join(/*turbopackIgnore: true*/ DIR, info.file));
    return { body: new Uint8Array(data), mime: info.mime };
  } catch {
    return null;
  }
}

/** Convenience for server code that needs the whole file in memory (OG images). */
export async function readImageBuffer(id: string): Promise<Buffer | null> {
  const img = await openImage(id);
  if (!img) return null;
  if (img.body instanceof Uint8Array) return Buffer.from(img.body);
  return Buffer.from(await new Response(img.body).arrayBuffer());
}
