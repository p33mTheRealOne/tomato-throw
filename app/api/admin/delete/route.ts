import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin";
import { ID_RE, deleteImage } from "@/lib/storage";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const ok = isAdmin(req);
  if (ok === null) return new Response("Not found", { status: 404 });
  if (!ok) return new Response("Unauthorized", { status: 401 });

  let id = "";
  try {
    const body = (await req.json()) as { id?: unknown };
    id = typeof body.id === "string" ? body.id : "";
  } catch {
    /* handled below */
  }
  if (!ID_RE.test(id)) return NextResponse.json({ error: "bad_id" }, { status: 400 });
  return NextResponse.json({ deleted: await deleteImage(id) });
}
