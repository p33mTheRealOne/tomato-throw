import { NextResponse } from "next/server";
import { HAS_BLOB, MAX_BYTES, cleanName, saveImage, sniffImage } from "@/lib/storage";

export const runtime = "nodejs";

// Only short error codes leave the server. Details go to the server log, never to the browser.
const fail = (code: "bad_request" | "no_file" | "too_large" | "not_image" | "server", status: number) =>
  NextResponse.json({ error: code }, { status });

export async function POST(req: Request) {
  if (process.env.VERCEL && !HAS_BLOB) {
    console.error("[upload] no Blob credentials in this deployment");
    return fail("server", 500);
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return fail("bad_request", 400);
  }

  const file = form.get("file");
  if (!(file instanceof File)) return fail("no_file", 400);
  if (file.size > MAX_BYTES) return fail("too_large", 413);

  const buf = Buffer.from(await file.arrayBuffer());
  const ext = sniffImage(buf);
  if (!ext) return fail("not_image", 415);

  try {
    const id = await saveImage(buf, ext, cleanName(form.get("name")));
    return NextResponse.json({ id, path: `/p/${id}` });
  } catch (e) {
    console.error("[upload] save failed:", e);
    return fail("server", 500);
  }
}
