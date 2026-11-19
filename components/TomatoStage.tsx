"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import Tomato from "./Tomato";
import Splat from "./Splat";
import { playSplat, playWhoosh, unlockAudio } from "@/lib/sound";

type Flight = {
  id: number;
  x0: number; y0: number; // start (px, viewport)
  cx: number; cy: number; // bezier control
  x1: number; y1: number; // target
  size0: number; size1: number;
  rot: number; spin: number;
  splatSize: number;
  seed: number;
};

type SplatData = {
  id: number;
  fx: number; fy: number; // fraction of viewport
  rel: number;            // size relative to min(vw, vh)
  seed: number;
  rot: number;
};

const FLIGHT_MS = 650;
const MAX_SPLATS = 150;

function rand(a: number, b: number) {
  return a + Math.random() * (b - a);
}

function FlyingTomato({ f, onLand }: { f: Flight; onLand: (f: Flight) => void }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const STEPS = 18;
    const frames: Keyframe[] = [];
    for (let i = 0; i <= STEPS; i++) {
      const u = i / STEPS;
      const t = 1 - (1 - u) * (1 - u); // ease-out: fast leaving the hand, slows with distance
      const mt = 1 - t;
      const x = mt * mt * f.x0 + 2 * mt * t * f.cx + t * t * f.x1;
      const y = mt * mt * f.y0 + 2 * mt * t * f.cy + t * t * f.y1;
      const s = (f.size0 + (f.size1 - f.size0) * Math.pow(t, 0.7)) / f.size0;
      const r = f.rot + f.spin * t;
      frames.push({
        offset: u,
        transform: `translate(${x - f.size0 / 2}px, ${y - f.size0 / 2}px) rotate(${r}deg) scale(${s})`,
      });
    }

    const anim = el.animate(frames, { duration: FLIGHT_MS, easing: "linear", fill: "forwards" });
    anim.onfinish = () => onLand(f);
    return () => anim.cancel();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [f]);

  return (
    <div
      ref={ref}
      className="flying"
      style={{
        width: f.size0,
        height: f.size0,
        transform: `translate(${f.x0 - f.size0 / 2}px, ${f.y0 - f.size0 / 2}px) scale(1)`,
      }}
    >
      <Tomato style={{ width: "100%", height: "100%", filter: "drop-shadow(0 12px 10px rgba(0,0,0,.35))" }} />
    </div>
  );
}

export default function TomatoStage({ src }: { src: string }) {
  const [flights, setFlights] = useState<Flight[]>([]);
  const [splats, setSplats] = useState<SplatData[]>([]);
  const [vp, setVp] = useState({ w: 0, h: 0 });
  const [thrown, setThrown] = useState(0);
  const [muted, setMuted] = useState(false);
  const [copied, setCopied] = useState(false);
  const idRef = useRef(0);
  const shakeRef = useRef<HTMLDivElement>(null);
  const mutedRef = useRef(false);
  mutedRef.current = muted;

  useEffect(() => {
    const read = () => setVp({ w: window.innerWidth, h: window.innerHeight });
    read();
    window.addEventListener("resize", read);
    window.addEventListener("orientationchange", read);
    return () => {
      window.removeEventListener("resize", read);
      window.removeEventListener("orientationchange", read);
    };
  }, []);

  const throwAt = useCallback((x: number, y: number) => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    const min = Math.min(w, h);
    const size0 = Math.max(150, Math.min(min * 0.5, 380));
    const splatSize = Math.max(90, Math.min(min * 0.24, 230)) * rand(0.85, 1.2);
    const size1 = splatSize * 0.42;

    // thrown from the viewer (bottom, roughly centered) toward the click
    const x0 = w * 0.5 + rand(-0.18, 0.18) * w;
    const y0 = h + size0 * 0.35;
    const cx = (x0 + x) / 2 + rand(-0.12, 0.12) * w;
    const cy = Math.min(y, y0) - rand(0.18, 0.32) * h;

    if (!mutedRef.current) {
      unlockAudio();
      playWhoosh();
    }

    const id = ++idRef.current;
    setThrown((n) => n + 1);
    setFlights((fl) => [
      ...fl,
      {
        id, x0, y0, cx, cy, x1: x, y1: y, size0, size1,
        rot: rand(-30, 30), spin: rand(220, 420) * (Math.random() < 0.5 ? -1 : 1),
        splatSize, seed: Math.floor(Math.random() * 1e9),
      },
    ]);
  }, []);

  const onLand = useCallback((f: Flight) => {
    setFlights((fl) => fl.filter((x) => x.id !== f.id));
    setSplats((sp) => {
      const next = [
        ...sp,
        {
          id: f.id,
          fx: f.x1 / window.innerWidth,
          fy: f.y1 / window.innerHeight,
          rel: f.splatSize / Math.min(window.innerWidth, window.innerHeight),
          seed: f.seed,
          rot: Math.random() * 360,
        },
      ];
      return next.length > MAX_SPLATS ? next.slice(next.length - MAX_SPLATS) : next;
    });
    if (!mutedRef.current) playSplat();

    // impact shake on the picture
    const el = shakeRef.current;
    if (el) {
      const a = rand(5, 9) * (Math.random() < 0.5 ? -1 : 1);
      const b = rand(3, 6) * (Math.random() < 0.5 ? -1 : 1);
      el.animate(
        [
          { transform: "translate(0,0) scale(1.012)" },
          { transform: `translate(${a}px, ${b}px) scale(1.012)` },
          { transform: `translate(${-a * 0.6}px, ${-b * 0.6}px) scale(1.012)` },
          { transform: "translate(0,0) scale(1)" },
        ],
        { duration: 220, easing: "ease-out" },
      );
    }
  }, []);

  const stop = (e: React.SyntheticEvent) => e.stopPropagation();

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch {
      /* clipboard unavailable */
    }
  };

  return (
    <div
      className="stage"
      onPointerDown={(e) => {
        if (e.pointerType === "mouse" && e.button !== 0) return;
        throwAt(e.clientX, e.clientY);
      }}
    >
      <div ref={shakeRef} className="stage-shake">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="stage-img" src={src} alt="" draggable={false} />
        <div className="splat-layer">
          {vp.w > 0 &&
            splats.map((s) => (
              <Splat
                key={s.id}
                seed={s.seed}
                rot={s.rot}
                x={s.fx * vp.w}
                y={s.fy * vp.h}
                size={s.rel * Math.min(vp.w, vp.h)}
              />
            ))}
        </div>
      </div>

      <div className="flight-layer">
        {flights.map((f) => (
          <FlyingTomato key={f.id} f={f} onLand={onLand} />
        ))}
      </div>

      {thrown === 0 && <div className="hint">TAP TO THROW 🍅</div>}

      <div className="hud" onPointerDown={stop}>
        <button className="hud-btn" onClick={() => setSplats([])} aria-label="ล้างรอยมะเขือเทศ">
          🧽 <span>ล้าง</span>
        </button>
        <button className="hud-btn" onClick={() => setMuted((m) => !m)} aria-label="เปิดปิดเสียง">
          {muted ? "🔇" : "🔊"}
        </button>
        <button className="hud-btn" onClick={copyLink}>
          {copied ? "✅ copied" : "🔗 แชร์"}
        </button>
        <Link className="hud-btn hud-new" href="/">
          ➕ <span>รูปใหม่</span>
        </Link>
      </div>
    </div>
  );
}
