import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin";
import { listReports } from "@/lib/storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const ok = isAdmin(req);
  if (ok === null) return new Response("Not found", { status: 404 });
  if (!ok) return new Response("Unauthorized", { status: 401 });
  return NextResponse.json({ reports: await listReports() });
}
