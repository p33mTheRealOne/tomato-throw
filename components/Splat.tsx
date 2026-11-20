import { memo, useMemo } from "react";
import { makeSplatShape } from "@/lib/splat-shape";

type Props = { seed: number; size: number; x: number; y: number; rot: number };

/** A splattered tomato: spiky blob + droplets + seeds + dripping streaks + burst particles. */
function Splat({ seed, size, x, y, rot }: Props) {
  const shape = useMemo(() => makeSplatShape(seed, size), [seed, size]);

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
