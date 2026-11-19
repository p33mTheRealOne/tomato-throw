import { memo, useMemo } from "react";

function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function blobPath(r: () => number, R: number) {
  const N = 16;
  const pts: [number, number][] = [];
  for (let i = 0; i < N; i++) {
    const ang = (i / N) * Math.PI * 2 + (r() - 0.5) * 0.25;
    const rad = i % 2 === 0 ? R * (1.0 + r() * 0.55) : R * (0.55 + r() * 0.25);
    pts.push([Math.cos(ang) * rad, Math.sin(ang) * rad]);
  }
  const mid = (a: [number, number], b: [number, number]) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  const start = mid(pts[N - 1], pts[0]);
  let d = `M${start[0].toFixed(1)} ${start[1].toFixed(1)}`;
  for (let i = 0; i < N; i++) {
    const p = pts[i];
    const m = mid(p, pts[(i + 1) % N]);
    d += ` Q${p[0].toFixed(1)} ${p[1].toFixed(1)} ${m[0].toFixed(1)} ${m[1].toFixed(1)}`;
  }
  return d + "Z";
}

type Props = { seed: number; size: number; x: number; y: number; rot: number };

/** A splattered tomato: spiky blob + droplets + seeds + dripping streaks + burst particles. */
function Splat({ seed, size, x, y, rot }: Props) {
  const shape = useMemo(() => {
    const r = rng(seed);
    const outer = blobPath(r, 48);
    const inner = blobPath(r, 40);
    const drops = Array.from({ length: 9 }, () => {
      const a = r() * Math.PI * 2;
      const d = 62 + r() * 32;
      return { cx: Math.cos(a) * d, cy: Math.sin(a) * d, r: 2.5 + r() * 6 };
    });
    const seeds = Array.from({ length: 7 }, () => {
      const a = r() * Math.PI * 2;
      const d = r() * 30;
      return { cx: Math.cos(a) * d, cy: Math.sin(a) * d, rot: r() * 180 };
    });
    const drips = Array.from({ length: 3 }, (_, i) => ({
      x: -22 + i * 22 + (r() - 0.5) * 10,
      w: 5 + r() * 4,
      len: 28 + r() * 40,
      dur: 2.4 + r() * 3,
      delay: 0.35 + r() * 0.6,
    }));
    const burst = Array.from({ length: 10 }, () => {
      const a = r() * Math.PI * 2;
      const d = 0.7 + r() * 0.9;
      return { dx: Math.cos(a) * d * size, dy: Math.sin(a) * d * size, s: 0.05 + r() * 0.07 };
    });
    return { outer, inner, drops, seeds, drips, burst };
  }, [seed, size]);

  return (
    <div className="splat" style={{ left: x - size / 2, top: y - size / 2, width: size, height: size }}>
      <div className="splat-pop" style={{ transform: `rotate(${rot}deg)` }}>
        <svg viewBox="-100 -100 200 200" overflow="visible" width="100%" height="100%">
          <g className="splat-drips" fill="#b5130d">
            {shape.drips.map((d, i) => (
              <rect
                key={i}
                className="drip"
                x={d.x}
                y={10}
                width={d.w}
                height={d.len}
                rx={d.w / 2}
                style={{ animationDuration: `${d.dur}s`, animationDelay: `${d.delay}s` }}
              />
            ))}
          </g>
          <path d={shape.outer} fill="#a50f0a" />
          <path d={shape.inner} fill="#e0352a" />
          <path d={shape.inner} fill="#f26a54" transform="translate(-6 -7) scale(0.55)" opacity="0.75" />
          {shape.drops.map((d, i) => (
            <circle key={i} cx={d.cx} cy={d.cy} r={d.r} fill="#c4160f" />
          ))}
          {shape.seeds.map((s, i) => (
            <ellipse key={i} cx={s.cx} cy={s.cy} rx="4" ry="2.4" fill="#ffd96b" transform={`rotate(${s.rot} ${s.cx} ${s.cy})`} />
          ))}
        </svg>
      </div>
      {shape.burst.map((b, i) => (
        <span
          key={i}
          className="burst"
          style={
            {
              width: size * b.s,
              height: size * b.s,
              "--dx": `${b.dx}px`,
              "--dy": `${b.dy}px`,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}

export default memo(Splat);
