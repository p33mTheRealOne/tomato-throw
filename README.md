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
