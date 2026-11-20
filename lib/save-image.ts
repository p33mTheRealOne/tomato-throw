import { makeSplatShape } from "@/lib/splat-shape";

export type SavedSplat = { fx: number; fy: number; rel: number; seed: number; rot: number };

const MAX_SIDE = 1600;

function splatSvg(seed: number, rot: number): string {
  const s = makeSplatShape(seed, 100);
  const drips = s.drips
    .map((d) => `<rect x="${d.x}" y="10" width="${d.w}" height="${d.len}" rx="${d.w / 2}"/>`)
    .join("");
  const drops = s.drops.map((d) => `<circle cx="${d.cx}" cy="${d.cy}" r="${d.r}" fill="#c4160f"/>`).join("");
  const seeds = s.seeds
    .map((e) => `<ellipse cx="${e.cx}" cy="${e.cy}" rx="4" ry="2.4" fill="#ffd96b" transform="rotate(${e.rot} ${e.cx} ${e.cy})"/>`)
    .join("");
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-100 -100 200 200" width="400" height="400">` +
    `<g transform="rotate(${rot})"><g fill="#b5130d">${drips}</g>` +
    `<path d="${s.outer}" fill="#a50f0a"/><path d="${s.inner}" fill="#e0352a"/>` +
    `<path d="${s.inner}" fill="#f26a54" transform="translate(-6 -7) scale(0.55)" opacity="0.75"/>` +
    `${drops}${seeds}</g></svg>`
  );
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const im = new Image();
    im.onload = () => resolve(im);
    im.onerror = () => reject(new Error("image"));
    im.src = src;
  });
}

/** Render the picture exactly as framed on screen (cover) with every splat on top, plus a small URL tag. */
export async function renderSplattedImage(src: string, splats: SavedSplat[], vw: number, vh: number): Promise<Blob> {
  const base = await loadImage(src);
  const k = Math.min(MAX_SIDE / Math.max(vw, vh), 3);
  const W = Math.round(vw * k);
  const H = Math.round(vh * k);
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas");

  // object-fit: cover
  const sc = Math.max(W / base.naturalWidth, H / base.naturalHeight);
  const dw = base.naturalWidth * sc;
  const dh = base.naturalHeight * sc;
  ctx.drawImage(base, (W - dw) / 2, (H - dh) / 2, dw, dh);

  const min = Math.min(vw, vh);
  const cache = new Map<string, HTMLImageElement>();
  for (const sp of splats) {
    const key = `${sp.seed}:${Math.round(sp.rot)}`;
    let im = cache.get(key);
    if (!im) {
      im = await loadImage(`data:image/svg+xml;charset=utf-8,${encodeURIComponent(splatSvg(sp.seed, sp.rot))}`);
      cache.set(key, im);
    }
    const size = sp.rel * min * k;
    ctx.save();
    ctx.shadowColor = "rgba(0,0,0,.35)";
    ctx.shadowBlur = 3 * k;
    ctx.shadowOffsetY = 2 * k;
    ctx.drawImage(im, sp.fx * W - size / 2, sp.fy * H - size / 2, size, size);
    ctx.restore();
  }

  // site tag, bottom-left
  const label = window.location.host;
  const fs = Math.max(16, Math.round(W * 0.032));
  ctx.font = `${fs}px Anton, Impact, "Arial Narrow Bold", sans-serif`;
  const tw = ctx.measureText(label).width;
  const pad = fs * 0.5;
  ctx.fillStyle = "rgba(20,18,16,.78)";
  ctx.beginPath();
  ctx.roundRect(pad, H - pad - fs * 1.5, tw + pad * 2, fs * 1.5, fs * 0.3);
  ctx.fill();
  ctx.fillStyle = "#fff";
  ctx.textBaseline = "middle";
  ctx.fillText(label, pad * 2, H - pad - fs * 0.75);

  return await new Promise<Blob>((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("blob"))), "image/jpeg", 0.92),
  );
}
