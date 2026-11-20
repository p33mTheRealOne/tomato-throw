import { readFile } from "node:fs/promises";
import type { ReactElement } from "react";
import { makeSplatShape, rng } from "@/lib/splat-shape";

export const OG_SIZE = { width: 1200, height: 630 } as const;

export async function loadAnton(): Promise<ArrayBuffer> {
  // Read with fs + new URL(..., import.meta.url) so the bundler traces and ships the font file.
  const buf = await readFile(new URL("./fonts/anton.woff", import.meta.url));
  return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength) as ArrayBuffer;
}

export function hashId(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** One static splat, drawn with plain SVG so the OG renderer can rasterize it. */
export function OgSplat({ seed, size, x, y, rot }: { seed: number; size: number; x: number; y: number; rot: number }): ReactElement {
  const s = makeSplatShape(seed, size);
  return (
    <svg
      width={size}
      height={size}
      viewBox="-100 -100 200 200"
      style={{ position: "absolute", left: Math.round(x - size / 2), top: Math.round(y - size / 2) }}
    >
      <g transform={`rotate(${rot})`}>
        {s.drips.map((d, i) => (
          <rect key={i} x={d.x} y={10} width={d.w} height={d.len} rx={d.w / 2} fill="#b5130d" />
        ))}
        <path d={s.outer} fill="#a50f0a" />
        <path d={s.inner} fill="#e0352a" />
        <path d={s.inner} fill="#f26a54" opacity="0.75" transform="translate(-6 -7) scale(0.55)" />
        {s.drops.map((d, i) => (
          <circle key={i} cx={d.cx} cy={d.cy} r={d.r} fill="#c4160f" />
        ))}
        {s.seeds.map((d, i) => (
          <ellipse key={i} cx={d.cx} cy={d.cy} rx="4" ry="2.4" fill="#ffd96b" transform={`rotate(${d.rot} ${d.cx} ${d.cy})`} />
        ))}
      </g>
    </svg>
  );
}

/** Six splats spread across the picture, deterministic per picture id. */
export function splatsForId(id: string): ReactElement[] {
  const r = rng(hashId(id));
  const slots: [number, number][] = [
    [0.2, 0.3],
    [0.52, 0.68],
    [0.8, 0.27],
    [0.27, 0.82],
    [0.86, 0.76],
    [0.56, 0.2],
  ];
  return slots.map(([fx, fy], i) => (
    <OgSplat
      key={i}
      seed={Math.floor(r() * 1e9)}
      size={220 + Math.round(r() * 110)}
      x={(fx + (r() - 0.5) * 0.1) * OG_SIZE.width}
      y={(fy + (r() - 0.5) * 0.12) * OG_SIZE.height}
      rot={Math.round(r() * 360)}
    />
  ));
}
