import { NextResponse } from "next/server";
import { clientIp, rateLimit, reporterHash } from "@/lib/rate-limit";
import { ID_RE, REPORT_REASONS, REPORT_THRESHOLD, addReport, deleteImage, type ReportReason } from "@/lib/storage";

export const runtime = "nodejs";

const reply = (ok: boolean, status = 200) => NextResponse.json({ ok }, { status });

export async function POST(req: Request) {
  const ip = clientIp(req);
  if (!rateLimit(`report:${ip}`, 8, 10 * 60_000)) return reply(false, 429);

  let body: { id?: unknown; reason?: unknown };
  try {
    body = await req.json();
  } catch {
    return reply(false, 400);
  }
  const id = typeof body.id === "string" ? body.id : "";
  const reason = REPORT_REASONS.find((r) => r === body.reason) as ReportReason | undefined;
  if (!ID_RE.test(id) || !reason) return reply(false, 400);

  try {
    const reporters = await addReport(id, reporterHash(ip), reason);
    if (reporters >= REPORT_THRESHOLD) await deleteImage(id);
    return reply(true);
  } catch (e) {
    console.error("[report] failed:", e);
    return reply(false, 500);
  }
}
