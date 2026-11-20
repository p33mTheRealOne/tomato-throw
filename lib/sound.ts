/** Tiny synthesized sound effects (no audio files). */
let ctx: AudioContext | null = null;

export function unlockAudio() {
  if (typeof window === "undefined") return;
  try {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AC) return;
    ctx ??= new AC();
    if (ctx.state === "suspended") void ctx.resume();
  } catch {
    /* audio is optional */
  }
}

function noise(c: AudioContext, dur: number) {
  const buf = c.createBuffer(1, Math.max(1, Math.floor(c.sampleRate * dur)), c.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  const src = c.createBufferSource();
  src.buffer = buf;
  return src;
}

export function playWhoosh() {
  const c = ctx;
  if (!c) return;
  const t = c.currentTime;
  const src = noise(c, 0.5);
  const f = c.createBiquadFilter();
  f.type = "bandpass";
  f.frequency.setValueAtTime(500, t);
  f.frequency.exponentialRampToValueAtTime(1800, t + 0.4);
  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(0.18, t + 0.12);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.5);
  src.connect(f).connect(g).connect(c.destination);
  src.start(t);
}

export function playSplat() {
  const c = ctx;
  if (!c) return;
  const t = c.currentTime;

  const src = noise(c, 0.35);
  const f = c.createBiquadFilter();
  f.type = "lowpass";
  f.frequency.setValueAtTime(2400, t);
  f.frequency.exponentialRampToValueAtTime(300, t + 0.3);
  const g = c.createGain();
  g.gain.setValueAtTime(0.5, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.33);
  src.connect(f).connect(g).connect(c.destination);
  src.start(t);

  const o = c.createOscillator();
  const og = c.createGain();
  o.type = "sine";
  o.frequency.setValueAtTime(190, t);
  o.frequency.exponentialRampToValueAtTime(45, t + 0.18);
  og.gain.setValueAtTime(0.6, t);
  og.gain.exponentialRampToValueAtTime(0.0001, t + 0.22);
  o.connect(og).connect(c.destination);
  o.start(t);
  o.stop(t + 0.25);
}
