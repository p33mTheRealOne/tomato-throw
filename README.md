# Tomato Throw

Next.js (App Router): upload a picture, name it, get a link, throw tomatoes at it.

```bash
npm install
npm run dev        # http://localhost:3000
npm run build && npm start
```

## Environment variables (set on Vercel)

| Name | Purpose |
|------|---------|
| `ADMIN_TOKEN` | Secret (16+ chars) that unlocks the admin routes below. Without it they return 404. |
| `REPORT_THRESHOLD` | Optional. Different reporters needed to auto-remove a pic (default 3). |
| `REPORT_SALT` | Optional. Random string used to hash reporters (no raw IPs stored). |
| `NEXT_PUBLIC_SITE_URL` | Your real domain, e.g. `https://tomatothrow.com`. Used for canonical URLs, OG images, sitemap. |
| `BLOB_STORE_ID` / `BLOB_READ_WRITE_TOKEN` | Added automatically when you connect a Vercel Blob store. |
| `BLOB_ACCESS` | `public` only if your Blob store is public (default `private`). |
| `NEXT_PUBLIC_CONTACT_X`, `_GITHUB`, `_LINKEDIN`, `_INSTAGRAM` | Links in the "Dev's contact" dialog (or edit `lib/contacts.ts`). Empty = hidden. |

Without Blob credentials (local dev) pictures are stored in `.uploads/`.

## Where things are

- `app/page.tsx` home metadata + JSON-LD; `app/p/[id]/page.tsx` per-picture metadata (`Throw tomato at <name>`)
- `app/og/route.tsx` home OG image; `app/og/[id]/route.tsx` per-picture OG image (picture + splats)
- `app/robots.ts`, `app/sitemap.ts`, `app/manifest.ts`
- `lib/storage.ts` storage + picture name handling

## Moderation

- Visitors can **Report** a page. After `REPORT_THRESHOLD` different reporters (default 3) the picture is deleted.
- List reported pics: `curl -H "Authorization: Bearer $ADMIN_TOKEN" https://tomatothrow.com/api/admin/reports`
- Delete a pic now: `curl -X POST -H "Authorization: Bearer $ADMIN_TOKEN" -H "Content-Type: application/json" -d '{"id":"<12-char id from the URL>"}' https://tomatothrow.com/api/admin/delete`
- Uploads and reports have an in-memory per-IP limit (best effort on serverless). Also add a Vercel Firewall rate-limit rule for `/api/upload` and `/api/report`.
