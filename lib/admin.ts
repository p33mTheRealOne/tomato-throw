import crypto from "node:crypto";

/** Bearer-token check for admin routes. Without ADMIN_TOKEN the admin routes do not exist. */
export function isAdmin(req: Request): boolean | null {
  const token = process.env.ADMIN_TOKEN;
  if (!token || token.length < 16) return null; // not configured
  const given = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ?? "";
  const a = crypto.createHash("sha256").update(given).digest();
  const b = crypto.createHash("sha256").update(token).digest();
  return crypto.timingSafeEqual(a, b);
}
