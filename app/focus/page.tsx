"use client";

import { memo, useEffect, useMemo, useRef, useState } from "react";
import { Pause, Play, RotateCcw, SkipForward, Timer, Wind } from "lucide-react";
import { useToast } from "@/components/Toast";
import { Breathing } from "@/components/Breathing";
import { startAmbience, stopAmbience, setVolume, uiSound } from "@/lib/sounds";
import {
  FOCUS_SETTINGS_KEY, FOCUS_SESSIONS_KEY, TASKS_KEY, SEED_FOCUS, SEED_TASKS, DEFAULT_FOCUS,
  useLocalState, todayISO, addDays, isoDate, type FocusSettings, type FocusSession, type Task,
} from "@/lib/storage";

type Phase = "focus" | "short" | "long";

/* ============ Timer isolé : SEUL ce composant re-render chaque seconde ============ */
const TimerCard = memo(function TimerCard({
  phase, durationSec, subjectLabel, cycle, cyclesBeforeLong,
  onComplete, onSkip, onRunningChange,
}: {
  phase: Phase; durationSec: number; subjectLabel: string; cycle: number; cyclesBeforeLong: number;
  onComplete: () => void; onSkip: () => void; onRunningChange: (r: boolean) => void;
}) {
  const { toast } = useToast();
  const [running, setRunning] = useState(false);
  const [endsAt, setEndsAt] = useState<number | null>(null);
  const [remaining, setRemaining] = useState(durationSec);
  const cb = useRef({ onComplete, onSkip, toast });
  cb.current = { onComplete, onSkip, toast };

  useEffect(() => { onRunningChange(running); }, [running, onRunningChange]);
  useEffect(() => { if (!running) setRemaining(durationSec); }, [durationSec, running]);

  useEffect(() => {
    if (!running || endsAt === null) return;
    const fired = { water: false, stand: false, eyes: 0 };
    const t = setInterval(() => {
      const left = Math.max(0, Math.ceil((endsAt - Date.now()) / 1000));
      setRemaining(left);
      const elapsed = durationSec - left;
      if (!fired.water && elapsed >= 1500) { fired.water = true; cb.current.toast("💧 Pense à boire de l'eau"); }
      if (!fired.stand && elapsed >= 3000) { fired.stand = true; cb.current.toast("🧘 Lève-toi, étire-toi 2 minutes"); }
      const eyeSlot = Math.floor(elapsed / 1200);
      if (elapsed >= 1200 && eyeSlot > fired.eyes) { fired.eyes = eyeSlot; cb.current.toast("👀 20-20-20 : regarde au loin 20 secondes"); }
      if (left <= 0) { setRunning(false); setEndsAt(null); cb.current.onComplete(); }
    }, 250);
    return () => clearInterval(t);
  }, [running, endsAt, durationSec]);

  const total = durationSec;
  const progress = 1 - remaining / total;
  const C = 2 * Math.PI * 88;
  const phaseLabel = phase === "focus" ? "Focus" : phase === "short" ? "Pause courte" : "Pause longue ☕";

  return (
    <article className="glass rounded-[1.75rem] p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="icon-chip"><Timer size={18} /></span>
          <h2 className="font-semibold tracking-tight text-text">{phaseLabel}</h2>
        </div>
        <span className="rounded-full bg-accent/10 px-3 py-1 text-xs font-semibold text-accent">
          Cycle {cycle % cyclesBeforeLong + 1}/{cyclesBeforeLong}
        </span>
      </div>

      <div className="mt-6 flex flex-col items-center">
        <div className="relative h-64 w-64">
          <svg viewBox="0 0 200 200" className="h-full w-full -rotate-90">
            <circle cx="100" cy="100" r="88" fill="none" stroke="var(--softest)" strokeWidth="10" />
            <circle cx="100" cy="100" r="88" fill="none" stroke="var(--accent)" strokeWidth="10" strokeLinecap="round"
              strokeDasharray={C} strokeDashoffset={C * (1 - progress)} style={{ transition: "stroke-dashoffset .3s linear" }} />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <p className="text-5xl font-bold tabular-nums text-text">
              {String(Math.floor(remaining / 60)).padStart(2, "0")}:{String(remaining % 60).padStart(2, "0")}
            </p>
            <p className="mt-1 text-xs text-subtle">{phase === "focus" ? subjectLabel : "Respire…"}</p>
          </div>
        </div>

        <div className="mt-6 flex items-center gap-3">
          {!running ? (
            <button onClick={() => { setEndsAt(Date.now() + Math.max(1, remaining) * 1000); setRunning(true); }}
              className="flex items-center gap-2 rounded-2xl bg-accent px-8 py-3.5 font-semibold text-white shadow-lg shadow-accent/30 transition-transform hover:-translate-y-0.5">
              <Play size={18} /> Démarrer
            </button>
          ) : (
            <button onClick={() => { setRunning(false); setEndsAt(null); }}
              className="flex items-center gap-2 rounded-2xl bg-accent px-8 py-3.5 font-semibold text-white shadow-lg shadow-accent/30">
              <Pause size={18} /> Pause
            </button>
          )}
          <button onClick={() => { setRunning(false); setEndsAt(null); setRemaining(total); }} aria-label="Réinitialiser"
            className="icon-chip !h-11 !w-11 !rounded-2xl"><RotateCcw size={16} /></button>
          <button onClick={() => { setRunning(false); setEndsAt(null); cb.current.onSkip(); }} aria-label="Passer"
            className="icon-chip !h-11 !w-11 !rounded-2xl"><SkipForward size={16} /></button>
        </div>
      </div>
    </article>
  );
});

export default function FocusPage() {
  const [settings, setSettings] = useLocalState<FocusSettings>(FOCUS_SETTINGS_KEY, DEFAULT_FOCUS);
  const [sessions, setSessions] = useLocalState<FocusSession[]>(FOCUS_SESSIONS_KEY, SEED_FOCUS);
  const [tasks] = useLocalState<Task[]>(TASKS_KEY, SEED_TASKS);

  const [phase, setPhase] = useState<Phase>("focus");
  const [cycle, setCycle] = useState(0);
  const [taskId, setTaskId] = useState("");
  const [matiere, setMatiere] = useState("");
  const [breathOn, setBreathOn] = useState(true);
  const [zen, setZen] = useState(false);
  const [amb, setAmb] = useState<"off" | "rain" | "cafe" | "forest" | "ocean">("off");
  const [vol, setVol] = useState(0.5);
  const { toast } = useToast();

  const durationSec = (phase === "focus" ? settings.focusMin : phase === "short" ? settings.shortBreakMin : settings.longBreakMin) * 60;
  const openTasks = tasks.filter((t) => t.column !== "done");
  const subjectLabel = tasks.find((t) => t.id === taskId)?.title ?? "Session libre";
  const isBreak = phase !== "focus";

  // 🧘 Mode Zen : le fond s'endort pendant que tu travailles
  useEffect(() => {
    if (zen) document.documentElement.dataset.zen = "1";
    else delete document.documentElement.dataset.zen;
    return () => { delete document.documentElement.dataset.zen; };
  }, [zen]);

  // Ambiance sonore
  useEffect(() => { if (amb === "off") stopAmbience(); else startAmbience(amb, vol); }, [amb]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { setVolume(vol); }, [vol]);

  function complete() {
    if (phase === "focus") {
      uiSound("complete");
      const task = tasks.find((t) => t.id === taskId);
      const subject = task ? task.subject || task.title : matiere.trim() || undefined;
      setSessions((p) => [...p, { id: crypto.randomUUID(), startedAt: Date.now() - settings.focusMin * 60000, minutes: settings.focusMin, subject }]);
      const next = cycle + 1;
      setCycle(next);
      setPhase(next % settings.cyclesBeforeLong === 0 ? "long" : "short");
      toast("🎉 Pomodoro terminé — pause bien méritée");
    } else {
      uiSound("success");
      setPhase("focus");
    }
  }

  function skip() {
    if (phase === "focus") {
      const next = cycle + 1;
      setCycle(next);
      setPhase(next % settings.cyclesBeforeLong === 0 ? "long" : "short");
    } else setPhase("focus");
  }

  /* ===== Stats deep focus ===== */
  const stats = useMemo(() => {
    const dayKey = (ts: number) => isoDate(new Date(ts));
    const today = todayISO();
    const todaySessions = sessions.filter((s) => dayKey(s.startedAt) === today);
    const last7 = Array.from({ length: 7 }, (_, i) => addDays(i - 6));
    const perDay = last7.map((d) => sessions.filter((s) => dayKey(s.startedAt) === d).reduce((a, s) => a + s.minutes, 0));
    const week = perDay.reduce((a, b) => a + b, 0);
    const bySubject = new Map<string, number>();
    sessions.forEach((s) => bySubject.set(s.subject ?? "Autre", (bySubject.get(s.subject ?? "Autre") ?? 0) + s.minutes));
    const subjects = [...bySubject.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);
    const has = (d: string) => sessions.some((s) => dayKey(s.startedAt) === d);
    let streak = 0; let i = has(today) ? 0 : 1;
    while (has(addDays(-i))) { streak++; i++; }
    return { todayMin: todaySessions.reduce((a, s) => a + s.minutes, 0), todayCount: todaySessions.length, perDay, last7, week, subjects, streak, total: sessions.reduce((a, s) => a + s.minutes, 0) };
  }, [sessions]);

  const num = (v: string) => Math.max(1, Math.min(180, Number(v) || 1));

  return (
    <>
      <section className="grid grid-cols-1 gap-4 sm:gap-5 lg:grid-cols-5">
        <div className="flex flex-col gap-4 sm:gap-5 lg:col-span-3">
          <TimerCard
            phase={phase}
            durationSec={durationSec}
            subjectLabel={subjectLabel}
            cycle={cycle}
            cyclesBeforeLong={settings.cyclesBeforeLong}
            onComplete={complete}
            onSkip={skip}
            onRunningChange={setZen}
          />

          {/* 🫁 Respiration guidée pendant les pauses */}
          {isBreak && (
            <article className="glass rounded-[1.75rem] p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="icon-chip"><Wind size={18} /></span>
                  <h2 className="font-semibold tracking-tight text-text">Respiration guidée</h2>
                </div>
                <button onClick={() => setBreathOn((v) => !v)} className="btn-ghost !text-xs">
                  {breathOn ? "Masquer" : "Afficher"}
                </button>
              </div>
              {breathOn && <Breathing />}
            </article>
          )}
        </div>

        {/* Réglages */}
        <div className="flex flex-col gap-4 sm:gap-5 lg:col-span-2">
          <article className="glass rounded-[1.75rem] p-6">
            <h2 className="font-semibold tracking-tight text-text">Réglages</h2>
            <div className="mt-5 space-y-3">
              {([
                ["focusMin", "Durée d'un pomodoro (min)"],
                ["shortBreakMin", "Pause courte (min)"],
                ["longBreakMin", "Pause longue (min)"],
                ["cyclesBeforeLong", "Cycles avant pause longue"],
              ] as const).map(([key, label]) => (
                <label key={key} className="glass-inset flex items-center justify-between rounded-2xl px-4 py-3">
                  <span className="text-xs font-medium text-text">{label}</span>
                  <input type="number" min={1} max={180} value={settings[key]}
                    onChange={(e) => setSettings({ ...settings, [key]: num(e.target.value) })}
                    className="w-16 rounded-lg bg-white/50 px-2 py-1 text-center text-sm font-semibold text-text outline-none" />
                </label>
              ))}
            </div>
          </article>

          <article className="glass rounded-[1.75rem] p-6">
            <h2 className="font-semibold tracking-tight text-text">Sur quoi travailles-tu ?</h2>
            <select className="field mt-4" value={taskId} onChange={(e) => setTaskId(e.target.value)}>
              <option value="">Session libre</option>
              {openTasks.map((t) => <option key={t.id} value={t.id}>{t.title}{t.subject ? ` · ${t.subject}` : ""}</option>)}
            </select>
            {!taskId && <input className="field mt-2" placeholder="Matière (optionnel)" value={matiere} onChange={(e) => setMatiere(e.target.value)} />}
          </article>

          <article className="glass rounded-[1.75rem] p-6">
            <h2 className="font-semibold tracking-tight text-text">Ambiance sonore</h2>
            <div className="mt-4 grid grid-cols-5 gap-1.5">
              {([["off", "🔇", "Off"], ["rain", "🌧️", "Pluie"], ["cafe", "☕", "Café"], ["forest", "🌲", "Forêt"], ["ocean", "🌊", "Océan"]] as const).map(([k, e, label]) => (
                <button key={k} onClick={() => setAmb(k)}
                  className={`flex flex-col items-center gap-1 rounded-xl px-1 py-2.5 text-[10px] font-medium transition-all ${amb === k ? "bg-accent text-white shadow-lg shadow-accent/30" : "glass-inset text-subtle hover:text-text"}`}>
                  <span className="text-base">{e}</span>{label}
                </button>
              ))}
            </div>
            <label className="mt-4 flex items-center gap-3 text-xs text-subtle">
              Volume
              <input type="range" min={0} max={1} step={0.05} value={vol} onChange={(e) => setVol(Number(e.target.value))} className="w-full accent-[var(--accent)]" />
            </label>
          </article>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
        {[
          { label: "Aujourd'hui", value: `${stats.todayMin} min`, sub: `${stats.todayCount} session${stats.todayCount > 1 ? "s" : ""}` },
          { label: "Streak", value: `${stats.streak} j 🔥`, sub: "jours consécutifs" },
          { label: "Cette semaine", value: `${stats.week} min`, sub: "7 derniers jours" },
          { label: "Total", value: `${Math.round(stats.total / 60)} h`, sub: `${sessions.length} sessions` },
        ].map((s) => (
          <article key={s.label} className="glass rounded-[1.75rem] p-5">
            <p className="text-xs font-medium text-subtle">{s.label}</p>
            <p className="mt-1.5 text-2xl font-bold tabular-nums text-text">{s.value}</p>
            <p className="mt-0.5 text-[11px] text-subtle">{s.sub}</p>
          </article>
        ))}
      </section>

      <section className="grid grid-cols-1 gap-4 sm:gap-5 lg:grid-cols-2">
        <article className="glass rounded-[1.75rem] p-6">
          <h2 className="font-semibold tracking-tight text-text">7 derniers jours</h2>
          <div className="mt-5 flex h-40 items-end justify-between gap-2">
            {stats.perDay.map((min, i) => (
              <div key={i} className="flex h-full flex-1 flex-col items-center justify-end gap-1.5">
                <div className="w-full rounded-full bg-accent/70 transition-all hover:bg-accent" style={{ height: `${Math.min(100, (min / Math.max(60, ...stats.perDay)) * 100)}%` }} title={`${min} min`} />
                <span className="text-[9px] text-subtle">{["L", "M", "M", "J", "V", "S", "D"][(new Date(`${stats.last7[i]}T12:00`).getDay() + 6) % 7]}</span>
              </div>
            ))}
          </div>
        </article>
        <article className="glass rounded-[1.75rem] p-6">
          <h2 className="font-semibold tracking-tight text-text">Temps par matière</h2>
          {stats.subjects.length === 0 && <p className="mt-5 text-sm text-subtle">Aucune session encore</p>}
          <ul className="mt-5 space-y-3">
            {stats.subjects.map(([name, min]) => (
              <li key={name}>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-text">{name}</span>
                  <span className="text-subtle tabular-nums">{min} min</span>
                </div>
                <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-white/30">
                  <div className="h-full rounded-full bg-accent" style={{ width: `${(min / stats.subjects[0][1]) * 100}%` }} />
                </div>
              </li>
            ))}
          </ul>
        </article>
      </section>
    </>
  );
}