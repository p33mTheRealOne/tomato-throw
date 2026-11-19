import { NextResponse } from "next/server";
import { MAX_BYTES, saveImage, sniffImage } from "@/lib/storage";

export const runtime = "nodejs";

export async function POST(req: Request) {
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
    console.error("upload failed:", e);
    return NextResponse.json({ error: "เซิร์ฟเวอร์บันทึกรูปไม่ได้ ลองใหม่อีกครั้ง" }, { status: 500 });
  }
}
