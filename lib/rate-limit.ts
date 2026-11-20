import crypto from "node:crypto";

/**
 * Best-effort sliding-window limiter kept in memory.
 * On serverless each warm instance has its own counters, so this stops casual abuse and
 * accidental floods but is NOT a hard global limit. Pair it with a Vercel Firewall rate-limit rule.
 */
const buckets = new Map<string, number[]>();

export function rateLimit(key: string, max: number, windowMs: number): boolean {
  const now = Date.now();
  const hits = (buckets.get(key) ?? []).filter((t) => now - t < windowMs);
  if (hits.length >= max) {
    buckets.set(key, hits);
    return false;
  }
  hits.push(now);
  buckets.set(key, hits);
  if (buckets.size > 5000) {
    for (const [k, v] of buckets) if (!v.some((t) => now - t < windowMs)) buckets.delete(k);
  }
  return true;
}

export function clientIp(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  return (req.headers.get("x-real-ip") || xff?.split(",")[0] || "unknown").trim();
}

/** Short one-way fingerprint of the caller (no raw IPs are stored). */
export function reporterHash(ip: string): string {
  const salt = process.env.REPORT_SALT || "tomato-throw";
  return crypto.createHash("sha256").update(`${salt}:${ip}`).digest("hex").slice(0, 16);
}
