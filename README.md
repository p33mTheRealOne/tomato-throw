# 🍅 Throw The Tomato

Next.js (App Router) — upload an image, get a link, throw tomatoes at it.

```bash
npm install
npm run dev        # http://localhost:3000
# production: npm run build && npm start
```

- Uploads are stored in `.uploads/` (override with `UPLOAD_DIR`). Max 15 MB after client-side shrink, PNG/JPG/WEBP/GIF, type checked by magic bytes.
- **Vercel:** add a Blob store and set `BLOB_READ_WRITE_TOKEN` (Storage → Blob → Connect to project). Without the token it falls back to local disk (`.uploads/`), which does not work on serverless.
- Tomato / splat art is pure SVG (`components/Tomato.tsx`, `components/Splat.tsx`); sounds are synthesized (`lib/sound.ts`).
