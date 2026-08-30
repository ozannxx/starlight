"use client";

import { memo, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Flame, NotebookPen, Palmtree, Sunrise } from "lucide-react";
import QuickAdd from "@/components/QuickAdd";
import { uiSound } from "@/lib/sounds";
import { dailyMessage } from "@/lib/messages";
import {
  AGENDA_KEY, TASKS_KEY, HABITS_KEY, SCHEDULE_KEY, MOOD_KEY, JOURNAL_KEY, VACATION_KEY,
  SEED_AGENDA, SEED_TASKS, SEED_HABITS, SEED_SCHEDULE,
  useLocalState, readJSON, todayISO, daysBetween, eventTarget, eventMeta,
  minutesOf, type Course, type Habit, type Task, type AgendaEvent, type Vacation, type MoodMap, type JournalEntry,
} from "@/lib/storage";

const MOODS = ["😞", "😕", "😐", "🙂", "😄"];

function fmtDur(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000));
  const d = Math.floor(s / 86400), h = Math.floor((s % 86400) / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
  if (d > 0) return `${d}j ${String(h).padStart(2, "0")}h${String(m).padStart(2, "0")}`;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}

/* Compteur isolé : seul lui re-render chaque seconde */
const LiveCountdown = memo(function LiveCountdown({ target }: { target: number }) {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    setNow(Date.now());
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  return <span className="shrink-0 font-mono text-sm font-bold tabular-nums text-accent">{now === null ? "—" : fmtDur(target - now)}</span>;
});

export default function TodayPage() {
  const [agenda, setAgenda] = useLocalState<AgendaEvent[]>(AGENDA_KEY, SEED_AGENDA);
  const [tasks, setTasks] = useLocalState<Task[]>(TASKS_KEY, SEED_TASKS);
  const [habits, setHabits] = useLocalState<Habit[]>(HABITS_KEY, SEED_HABITS);
  const [schedule] = useLocalState<Course[]>(SCHEDULE_KEY, SEED_SCHEDULE);
  const [moods, setMoods] = useLocalState<MoodMap>(MOOD_KEY, {});
  const [journal, setJournal] = useLocalState<JournalEntry[]>(JOURNAL_KEY, []);
  const [savedFlash, setSavedFlash] = useState(false);

  const today = todayISO();
  const vac = readJSON<Vacation>(VACATION_KEY, { active: false });
  const hour = new Date().getHours();
  const greeting = hour < 6 ? "Bonne nuit Ozan 🌙" : hour < 12 ? "Bonjour Ozan ☀️" : hour < 18 ? "Bon après-midi Ozan 👋" : "Bonsoir Ozan 🌆";
  const dow = new Date().getDay() || 7;
  const nowMin = hour * 60 + new Date().getMinutes();
  const todayCourses = useMemo(() => schedule.filter((c) => c.day === dow).sort((a, b) => a.start.localeCompare(b.start)), [schedule, dow]);
  const currentCourse = todayCourses.find((c) => minutesOf(c.start) <= nowMin && nowMin < minutesOf(c.end));
  const nextCourse = todayCourses.find((c) => minutesOf(c.start) > nowMin);
  const todayEvents = agenda.filter((e) => e.date === today).sort((a, b) => a.time.localeCompare(b.time));
  const nextEvent = [...agenda].filter((e) => eventTarget(e) > Date.now()).sort((a, b) => eventTarget(a) - eventTarget(b))[0];
  const urgent = tasks.filter((t) => t.column !== "done").sort((a, b) => (a.due ?? "9999").localeCompare(b.due ?? "9999")).slice(0, 3);
  const mood = moods[today] ?? 0;

  const toggleTask = (id: string) => {
    const wasDone = tasks.find((t) => t.id === id)?.column === "done";
    uiSound(wasDone ? "pop" : "success");
    setTasks((p) => p.map((t) => (t.id === id ? { ...t, column: t.column === "done" ? "todo" : "done" } : t)));
  };
  const toggleHabit = (h: Habit) => {
    uiSound("pop");
    setHabits((p) => p.map((x) => (x.id === h.id ? { ...x, history: h.history.includes(today) ? x.history.filter((d) => d !== today) : [...x.history, today] } : x)));
  };

  const saved = journal.find((j) => j.date === today)?.text ?? "";
  const [note, setNote] = useState<string | null>(null);
  const noteValue = note ?? saved;
  const saveNote = () => {
    if (note === null || note === saved) return;
    setJournal((p) => p.some((j) => j.date === today) ? p.map((j) => (j.date === today ? { ...j, text: note } : j)) : [...p, { date: today, text: note }]);
    setSavedFlash(true); setTimeout(() => setSavedFlash(false), 1600);
  };

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-text">{greeting}</h1>
          <p className="mt-0.5 text-xs italic text-subtle">{dailyMessage()}</p>
        </div>
        <p className="text-sm capitalize text-subtle">{new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}</p>
      </div>

      {vac.active && (
        <section className="glass rounded-3xl p-5">
          <p className="flex items-center gap-2 text-sm font-semibold text-text">
            <Palmtree size={18} className="text-accent" /> Mode vacances — rappels en pause. Profite !
            {vac.until && daysBetween(vac.until, today) >= 0 ? ` Rentrée dans ${daysBetween(vac.until, today)} jour(s).` : ""}
          </p>
        </section>
      )}

      <section className="glass rounded-3xl p-4">
        <QuickAdd onAdd={(ev) => setAgenda((p) => [...p, ev])} />
      </section>

      <section className="grid grid-cols-1 gap-4 sm:gap-5 lg:grid-cols-3">
        <div className="flex flex-col gap-4 sm:gap-5 lg:col-span-2">
          <article className="glass rounded-[1.75rem] p-6">
            <div className="flex items-center gap-2.5">
              <span className="icon-chip"><Sunrise size={18} /></span>
              <h2 className="font-semibold tracking-tight text-text">Ta journée</h2>
            </div>
            <div className="glass-inset mt-4 rounded-2xl p-4 text-sm">
              {currentCourse ? (
                <p className="font-medium text-emerald-600">● En ce moment : {currentCourse.subject}{currentCourse.room ? ` (${currentCourse.room})` : ""} — jusqu&apos;à {currentCourse.end}</p>
              ) : nextCourse ? (
                <p className="text-text">⏭️ Prochain cours : <span className="font-semibold">{nextCourse.subject}</span> à {nextCourse.start}</p>
              ) : (
                <p className="text-subtle">Plus de cours aujourd&apos;hui 🎉</p>
              )}
            </div>
            {nextEvent && (
              <div className="mt-3 flex items-center justify-between gap-3 rounded-2xl bg-accent/10 p-4">
                <span className="min-w-0 truncate text-sm font-semibold text-text">⏳ {nextEvent.title}</span>
                <LiveCountdown target={eventTarget(nextEvent)} />
              </div>
            )}
            <ul className="mt-4 space-y-1">
              {todayEvents.length === 0 && <p className="rounded-2xl bg-white/30 py-4 text-center text-sm text-subtle">Aucun événement aujourd&apos;hui</p>}
              {todayEvents.map((e) => {
                const meta = eventMeta(e);
                const Icon = meta.icon;
                return (
                  <li key={e.id} className="flex items-center gap-3 rounded-2xl p-2.5 transition-colors hover:bg-white/50">
                    <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${meta.pill}`}><Icon size={15} /></span>
                    <span className="min-w-0 flex-1 truncate text-sm font-medium text-text">{e.title}</span>
                    <span className="shrink-0 text-xs tabular-nums text-subtle">{meta.allDay ? "journée" : e.time}</span>
                  </li>
                );
              })}
            </ul>
          </article>

          <article className="glass rounded-[1.75rem] p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="icon-chip"><NotebookPen size={18} /></span>
                <h2 className="font-semibold tracking-tight text-text">Les 3 urgences</h2>
              </div>
              <Link href="/tasks" className="text-xs font-medium text-subtle transition-colors hover:text-text">Tous les devoirs →</Link>
            </div>
            <ul className="mt-4 space-y-1">
              {urgent.length === 0 && <p className="rounded-2xl bg-white/30 py-4 text-center text-sm text-subtle">Rien d&apos;urgent 🎉</p>}
              {urgent.map((t) => {
                const late = t.due && t.due < today;
                return (
                  <li key={t.id} className="flex items-center gap-3 rounded-2xl p-3 transition-colors hover:bg-white/50">
                    <button onClick={() => toggleTask(t.id)} aria-label="Fait" className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border-2 border-subtle/40 text-xs transition-all hover:border-accent hover:bg-accent/10 hover:text-accent">✓</button>
                    <span className="min-w-0 flex-1 truncate text-sm font-medium text-text">{t.title}</span>
                    {t.due && <span className={`calmable shrink-0 rounded-full px-2.5 py-1 text-[11px] font-medium ${late ? "bg-rose-500/10 text-rose-600" : "bg-black/5 text-subtle"}`}>{late ? "En retard" : t.due === today ? "Aujourd'hui" : `J-${daysBetween(t.due, today)}`}</span>}
                  </li>
                );
              })}
            </ul>
          </article>
        </div>

        <div className="flex flex-col gap-4 sm:gap-5">
          <article className="glass rounded-[1.75rem] p-6">
            <h2 className="font-semibold tracking-tight text-text">Ton humeur du jour</h2>
            <div className="mt-4 flex justify-between gap-1.5">
              {MOODS.map((m, i) => (
                <button key={m} onClick={() => { uiSound("pop"); setMoods({ ...moods, [today]: i + 1 }); }}
                  className={`flex aspect-square flex-1 items-center justify-center rounded-2xl text-2xl transition-all ${mood === i + 1 ? "scale-110 bg-accent/15 ring-2 ring-accent" : "glass-inset hover:scale-105"}`}>
                  {m}
                </button>
              ))}
            </div>
          </article>

          <article className="glass rounded-[1.75rem] p-6">
            <div className="flex items-center gap-2.5">
              <span className="icon-chip"><Flame size={18} /></span>
              <h2 className="font-semibold tracking-tight text-text">Habitudes</h2>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {habits.length === 0 && <p className="text-sm text-subtle">Aucune habitude — crée-en une dans Objectifs.</p>}
              {habits.map((h) => {
                const on = h.history.includes(today);
                return (
                  <button key={h.id} onClick={() => toggleHabit(h)}
                    className={`rounded-full px-3.5 py-2 text-xs font-semibold transition-all ${on ? "bg-accent text-white shadow-lg shadow-accent/30" : "glass-inset text-subtle hover:text-text"}`}>
                    {on ? "🔥 " : ""}{h.title}
                  </button>
                );
              })}
            </div>
          </article>

          <article className="glass rounded-[1.75rem] p-6">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold tracking-tight text-text">Journal de bord</h2>
              {savedFlash && <span className="text-xs font-medium text-emerald-600">✓ Enregistré</span>}
            </div>
            <textarea value={noteValue} onChange={(e) => setNote(e.target.value)} onBlur={saveNote} rows={4}
              placeholder="Ta note du jour : une réussite, une galère, une idée… (enregistre en cliquant ailleurs)"
              className="field mt-4 resize-none" />
          </article>
        </div>
      </section>
    </>
  );
}