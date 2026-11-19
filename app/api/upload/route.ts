import { NextResponse } from "next/server";
import { MAX_BYTES, saveImage, sniffImage } from "@/lib/storage";

export const runtime = "nodejs";

export async function POST(req: Request) {
  // On Vercel the disk is read-only: without a Blob token we must stop with a clear message.
  if (process.env.VERCEL && !process.env.BLOB_READ_WRITE_TOKEN) {
    console.error("[upload] BLOB_READ_WRITE_TOKEN is missing in this deployment");
    return NextResponse.json(
      { error: "เซิร์ฟเวอร์ยังไม่ได้เชื่อม Vercel Blob (ไม่พบ BLOB_READ_WRITE_TOKEN) — เชื่อม store กับโปรเจกต์แล้ว Redeploy" },
      { status: 500 },
    );
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "bad request" }, { status: 400 });
  }

  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "ไม่พบไฟล์รูป" }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "รูปใหญ่เกินไป" }, { status: 413 });
  }

  const buf = Buffer.from(await file.arrayBuffer());
  const ext = sniffImage(buf);
  if (!ext) {
    return NextResponse.json({ error: "รองรับเฉพาะ PNG, JPG, WEBP, GIF" }, { status: 415 });
  }

  try {
    const id = await saveImage(buf, ext);
    return NextResponse.json({ id, path: `/p/${id}` });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[upload] save failed:", e);
    return NextResponse.json({ error: "บันทึกรูปไม่สำเร็จ", detail: msg.slice(0, 300) }, { status: 500 });
  }
}
