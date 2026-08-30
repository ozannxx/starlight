/* ============ Ambiances longues ============ */
let ctx: AudioContext | null = null;
let nodes: { src: AudioBufferSourceNode; gain: GainNode }[] = [];
let current: string | null = null;

function noiseBuffer(c: AudioContext, brown: boolean): AudioBuffer {
  const len = c.sampleRate * 2;
  const buf = c.createBuffer(1, len, c.sampleRate);
  const data = buf.getChannelData(0);
  let last = 0;
  for (let i = 0; i < len; i++) {
    const w = Math.random() * 2 - 1;
    if (brown) { last = (last + 0.02 * w) / 1.02; data[i] = last * 3.5; }
    else data[i] = w;
  }
  return buf;
}

export function startAmbience(kind: "rain" | "cafe" | "forest" | "ocean", volume = 0.5) {
  stopAmbience();
  ctx = ctx ?? new AudioContext();
  ctx.resume();
  const mk = (brown: boolean, freq: number, lfoSpeed = 0, lfoDepth = 0) => {
    const src = ctx!.createBufferSource();
    src.buffer = noiseBuffer(ctx!, brown); src.loop = true;
    const f = ctx!.createBiquadFilter(); f.type = "lowpass"; f.frequency.value = freq;
    const g = ctx!.createGain(); g.gain.value = volume * 0.25;
    src.connect(f); f.connect(g); g.connect(ctx!.destination);
    if (lfoSpeed) {
      const lfo = ctx!.createOscillator(); const lg = ctx!.createGain();
      lfo.frequency.value = lfoSpeed; lg.gain.value = lfoDepth;
      lfo.connect(lg); lg.connect(g.gain); lfo.start();
    }
    src.start();
    nodes.push({ src, gain: g });
  };
  if (kind === "rain") mk(false, 1400);
  if (kind === "cafe") mk(true, 480);
  if (kind === "forest") mk(false, 500, 0.15, 0.15);
  if (kind === "ocean") mk(true, 400, 0.08, 0.25);
  current = kind;
}

export function stopAmbience() {
  nodes.forEach((n) => { try { n.src.stop(); } catch {} });
  nodes = []; current = null;
}
export function setVolume(v: number) { nodes.forEach((n) => (n.gain.gain.value = v * 0.25)); }
export const ambienceOn = () => current !== null;

/* ============ Sons d'interface « douceur » ============ */
export function uiSoundsOn(): boolean {
  return typeof window !== "undefined" && localStorage.getItem("starlight-ui-sounds") !== "0";
}

let uiCtx: AudioContext | null = null;
function getCtx(): AudioContext {
  uiCtx = uiCtx ?? new AudioContext();
  if (uiCtx.state === "suspended") void uiCtx.resume();
  return uiCtx;
}

type NoteOpts = { freq: number; t: number; dur: number; vol?: number; type?: OscillatorType; glide?: number };
function note(c: AudioContext, o: NoteOpts) {
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = o.type ?? "sine";
  const t0 = c.currentTime + o.t;
  osc.frequency.setValueAtTime(o.freq, t0);
  if (o.glide) osc.frequency.exponentialRampToValueAtTime(o.glide, t0 + o.dur);
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(o.vol ?? 0.14, t0 + 0.015);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + o.dur);
  osc.connect(g); g.connect(c.destination);
  osc.start(t0); osc.stop(t0 + o.dur + 0.05);
}

export function uiSound(kind: "pop" | "success" | "complete" | "chime") {
  if (!uiSoundsOn()) return;
  try {
    const c = getCtx();
    if (kind === "pop") {
      // Goutte d'eau délicate
      note(c, { freq: 620, glide: 920, t: 0, dur: 0.12, vol: 0.11 });
    }
    if (kind === "success") {
      // Tierce majeure douce C5 → E5 + scintillement
      note(c, { freq: 523.25, t: 0, dur: 0.5, vol: 0.11, type: "triangle" });
      note(c, { freq: 659.25, t: 0.09, dur: 0.6, vol: 0.11, type: "triangle" });
      note(c, { freq: 1046.5, t: 0.09, dur: 0.4, vol: 0.035 });
    }
    if (kind === "complete") {
      // Arpège C-E-G + écho lointain : le son de fin de pomodoro
      [523.25, 659.25, 783.99].forEach((f, i) => {
        note(c, { freq: f, t: i * 0.12, dur: 0.7, vol: 0.12, type: "triangle" });
        note(c, { freq: f * 2, t: i * 0.12, dur: 0.35, vol: 0.028 });
      });
      [523.25, 659.25, 783.99].forEach((f, i) =>
        note(c, { freq: f, t: 0.55 + i * 0.1, dur: 0.5, vol: 0.04, type: "triangle" })
      );
    }
    if (kind === "chime") {
      // Cloche : fondamentale + partiel inharmonique (2.76×), deux frappes
      note(c, { freq: 660, t: 0, dur: 1.6, vol: 0.11 });
      note(c, { freq: 660 * 2.76, t: 0, dur: 0.9, vol: 0.032 });
      note(c, { freq: 440, t: 0.45, dur: 1.6, vol: 0.085 });
      note(c, { freq: 440 * 2.76, t: 0.45, dur: 0.8, vol: 0.024 });
    }
  } catch {}
}