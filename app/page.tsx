"use client";

import { useState } from "react";
import Link from "next/link";
import QuickAdd from "@/components/QuickAdd";
import { dailyMessage } from "@/lib/messages";
import {
  GraduationCap,
  Palmtree,
  TrendingUp,
  Eye,
  EyeOff,
  NotebookPen,
  CalendarRange,
  Timer,
  CalendarClock,
  ChevronDown,
  ChevronUp,
  SlidersHorizontal,
  Play,
} from "lucide-react";
import {
  TASKS_KEY, FOCUS_SESSIONS_KEY, SCHEDULE_KEY, AGENDA_KEY, WIDGETS_KEY, SEED_WIDGETS,
  SEED_TASKS, SEED_FOCUS, SEED_SCHEDULE, SEED_AGENDA, GRADES, useLocalState, readJSON,
  todayISO, daysBetween, formatLong, eventTarget, subjectIcon, VACATION_KEY,
  type Course, type Vacation,
} from "@/lib/storage";

type WidgetId = "kpis" | "card" | "grades" | "homework" | "courses" | "focus" | "nextUp";
const WIDGET_LABELS: Record<WidgetId, string> = {
  kpis: "Indicateurs",
  card: "Carte étudiante",
  grades: "Évolution des notes",
  homework: "Devoirs",
  courses: "Cours du jour",
  focus: "Focus du jour",
  nextUp: "Prochain événement",
};

function barColor(g: number) {
  if (g >= 15) return "bg-emerald-400/70 hover:bg-emerald-400";
  if (g >= 10) return "bg-accent/70 hover:bg-accent";
  return "bg-rose-400/70 hover:bg-rose-400";
}

export default function Dashboard() {
  const [cardRevealed, setCardRevealed] = useState(false);
  const [term, setTerm] = useState("T1");
  const [editing, setEditing] = useState(false);
  const [widgets, setWidgets] = useLocalState<typeof SEED_WIDGETS>(WIDGETS_KEY, SEED_WIDGETS);
  const [tasks, setTasks] = useLocalState(TASKS_KEY, SEED_TASKS);
  const [sessions] = useLocalState(FOCUS_SESSIONS_KEY, SEED_FOCUS);
  const [courses] = useLocalState(SCHEDULE_KEY, SEED_SCHEDULE);
  const [agenda, setAgenda] = useLocalState(AGENDA_KEY, SEED_AGENDA);

  const today = todayISO();
  const activeTasks = tasks.filter((t) => t.column !== "done").sort((a, b) => (a.due ?? "9999").localeCompare(b.due ?? "9999"));
  const focusToday = sessions.filter((s) => new Date(s.startedAt).toISOString().slice(0, 10) === new Date().toISOString().slice(0, 10));
  const focusMinToday = focusToday.reduce((a, s) => a + s.minutes, 0);
  const jsDay = new Date().getDay();
  const todayCourses = courses.filter((c) => c.day === (jsDay === 0 ? 7 : jsDay)).sort((a, b) => a.start.localeCompare(b.start));
  const nextEvent = [...agenda].filter((e) => eventTarget(e) > Date.now()).sort((a, b) => eventTarget(a) - eventTarget(b))[0];

  const vac = readJSON<Vacation>(VACATION_KEY, { active: false });
  const vacDays = vac.until ? daysBetween(vac.until, today) : null;

  const toggleTask = (id: string) =>
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, column: t.column === "done" ? "todo" : "done" } : t)));

  return (
    <>
      {/* ==================== SALUTATION ==================== */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-subtle">Bonjour Ozan 👋</p>
          <p className="text-xs italic text-subtle/80">{dailyMessage()}</p>
        </div>
        <button onClick={() => setEditing((v) => !v)} className="btn-ghost">
          <SlidersHorizontal size={14} /> Personnaliser {editing ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
      </div>

      {/* ==================== PERSONNALISATION ==================== */}
      {editing && (
        <section className="glass rounded-3xl p-5">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-subtle">Widgets affichés</p>
          <div className="flex flex-wrap gap-2">
            {(Object.entries(WIDGET_LABELS) as [WidgetId, string][]).map(([id, label]) => (
              <button
                key={id}
                onClick={() => setWidgets((w) => ({ ...w, [id]: !w[id] } as typeof SEED_WIDGETS))}
                className={`rounded-full px-4 py-2 text-xs font-medium transition-all ${widgets[id] ? "bg-accent text-white shadow-lg shadow-accent/30" : "glass-inset text-subtle"}`}
              >
                {widgets[id] ? "✓ " : ""}{label}
              </button>
            ))}
          </div>
        </section>
      )}

      {/* ==================== MODE VACANCES ==================== */}
      {vac.active && (
        <section className="glass rounded-3xl p-5">
          <p className="flex items-center gap-2 text-sm font-semibold text-text">
            <Palmtree size={18} className="text-accent" /> Mode vacances — rappels en pause. Profite !
            {vacDays !== null && vacDays >= 0 ? ` Rentrée dans ${vacDays} jour${vacDays > 1 ? "s" : ""}.` : ""}
          </p>
        </section>
      )}

      {/* ==================== QUICK-ADD ==================== */}
      <section className="glass rounded-3xl p-4">
        <QuickAdd onAdd={(ev) => setAgenda((p) => [...p, ev])} />
      </section>

      {/* ==================== LIGNE KPI ==================== */}
      {widgets.kpis && (
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-5">
          <article className="glass glass-hover rounded-[1.75rem] p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-subtle">Moyenne générale</p>
                <p className="mt-2 text-[2rem] font-semibold leading-none tracking-tight text-text tabular-nums">
                  15,4<span className="text-lg text-subtle">/20</span>
                </p>
              </div>
              <span className="icon-chip"><GraduationCap size={20} /></span>
            </div>
            <span className="calmable mt-4 inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-600">
              <TrendingUp size={13} /> +0,6 vs dernier trimestre
            </span>
          </article>

          <article className="glass glass-hover rounded-[1.75rem] p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-subtle">Devoirs actifs</p>
                <p className="mt-2 text-[2rem] font-semibold leading-none tracking-tight text-text tabular-nums">{activeTasks.length}</p>
              </div>
              <span className="icon-chip"><NotebookPen size={20} /></span>
            </div>
            <Link href="/tasks" className="calmable mt-4 inline-flex items-center gap-1.5 rounded-full bg-sky-500/10 px-2.5 py-1 text-xs font-medium text-sky-600">
              Gérer mes devoirs →
            </Link>
          </article>

          <article className="glass glass-hover rounded-[1.75rem] p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-subtle">Focus aujourd&apos;hui</p>
                <p className="mt-2 text-[2rem] font-semibold leading-none tracking-tight text-text tabular-nums">
                  {focusMinToday}<span className="text-lg text-subtle"> min</span>
                </p>
              </div>
              <span className="icon-chip"><Timer size={20} /></span>
            </div>
            <span className="calmable mt-4 inline-flex items-center gap-1.5 rounded-full bg-violet-500/10 px-2.5 py-1 text-xs font-medium text-violet-600">
              {focusToday.length} session{focusToday.length > 1 ? "s" : ""} · {Math.round(focusMinToday / 25)} pomodoro
            </span>
          </article>
        </section>
      )}

      {/* ==================== CARTE ÉTUDIANTE + NOTES ==================== */}
      {(widgets.card || widgets.grades) && (
        <section className="grid grid-cols-1 gap-4 sm:gap-5 lg:grid-cols-5">
          {widgets.card && (
            <article className={`glass rounded-[1.75rem] p-6 ${widgets.grades ? "lg:col-span-2" : "lg:col-span-5"}`}>
              <div className="flex items-center justify-between">
                <h2 className="font-semibold tracking-tight text-text">Carte étudiante</h2>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-600">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Validée
                </span>
              </div>

              <div className="relative mt-5 aspect-[8/5] overflow-hidden rounded-3xl bg-gradient-to-br from-amber-300 via-orange-400 to-rose-400 p-6 text-white shadow-xl shadow-orange-500/30">
                <div className="pointer-events-none absolute -right-16 -top-20 h-52 w-52 rounded-full bg-white/25 blur-2xl" />
                <div className="pointer-events-none absolute -bottom-24 -left-12 h-56 w-56 rounded-full bg-white/20 blur-2xl" />

                <div className="relative flex h-full flex-col justify-between">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.25em] opacity-80">Starlight</p>
                      <p className="mt-0.5 text-xs font-medium opacity-80">Élève · 2025–2026</p>
                    </div>
                    <GraduationCap size={24} className="opacity-90" />
                  </div>

                  <div className="space-y-3">
                    <div className="h-8 w-11 rounded-md bg-gradient-to-br from-yellow-100/90 to-yellow-300/70 shadow-inner" />
                    <p className="font-mono text-lg tracking-[0.12em] tabular-nums">
                      {cardRevealed ? "2025 0847 2211" : "•••• •••• 2211"}
                    </p>
                  </div>

                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-[9px] uppercase tracking-widest opacity-70">Élève</p>
                      <p className="text-sm font-semibold tracking-wide">OZAN</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[9px] uppercase tracking-widest opacity-70">Valide jusqu&apos;au</p>
                      <p className="text-sm font-semibold tracking-wide">{cardRevealed ? "06/2026" : "••/••••"}</p>
                    </div>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setCardRevealed((v) => !v)}
                className="glass-inset glass-hover mt-5 flex w-full items-center justify-center gap-2 rounded-2xl py-3 text-sm font-medium text-text"
              >
                {cardRevealed ? <EyeOff size={16} /> : <Eye size={16} />}
                {cardRevealed ? "Masquer les détails" : "Afficher les détails"}
              </button>
            </article>
          )}

          {widgets.grades && (
            <article className={`glass rounded-[1.75rem] p-6 ${widgets.card ? "lg:col-span-3" : "lg:col-span-5"}`}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="font-semibold tracking-tight text-text">Évolution des notes</h2>
                  <p className="mt-1 text-xs text-subtle">14 dernières évaluations · moyenne 15,4</p>
                </div>
                <div className="glass-inset flex rounded-full p-1">
                  {["T1", "T2", "T3"].map((t) => (
                    <button
                      key={t}
                      onClick={() => setTerm(t)}
                      className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-all duration-200 ${
                        term === t ? "bg-accent text-white shadow" : "text-subtle hover:text-text"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-6 flex h-48 items-end justify-between gap-2 sm:gap-3">
                {GRADES.map((g, i) => (
                  <div key={i} className="flex h-full flex-1 items-end" title={`${g}/20`}>
                    <div className={`w-full rounded-full transition-all duration-300 ${barColor(g)}`} style={{ height: `${(g / 20) * 100}%` }} />
                  </div>
                ))}
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-4 text-[11px] text-subtle">
                <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-emerald-400" /> ≥ 15</span>
                <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-accent" /> 10 – 14</span>
                <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-rose-400" /> &lt; 10</span>
              </div>
            </article>
          )}
        </section>
      )}

      {/* ==================== DEVOIRS + COURS DU JOUR ==================== */}
      {(widgets.homework || widgets.courses) && (
        <section className="grid grid-cols-1 gap-4 sm:gap-5 lg:grid-cols-2">
          {widgets.homework && (
            <article className={`glass rounded-[1.75rem] p-6 ${widgets.courses ? "" : "lg:col-span-2"}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="icon-chip"><NotebookPen size={18} /></span>
                  <h2 className="font-semibold tracking-tight text-text">Devoirs à venir</h2>
                  <span className="rounded-full bg-accent/15 px-2 py-0.5 text-xs font-semibold text-accent">{activeTasks.length}</span>
                </div>
                <Link href="/tasks" className="text-xs font-medium text-subtle transition-colors hover:text-text">Voir tout</Link>
              </div>

              <ul className="mt-5 space-y-1">
                {activeTasks.length === 0 && <p className="rounded-2xl bg-white/30 py-6 text-center text-sm text-subtle">Tout est fait 🎉</p>}
                {activeTasks.slice(0, 5).map((t) => {
                  const late = t.due && t.due < today;
                  const soon = t.due && !late && daysBetween(t.due, today) <= 1;
                  return (
                    <li key={t.id} className="flex items-center gap-3 rounded-2xl p-3 transition-colors hover:bg-white/50">
                      <button onClick={() => toggleTask(t.id)} aria-label="Marquer comme fait"
                        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border-2 border-subtle/40 transition-colors hover:border-accent hover:bg-accent/10" />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium text-text">{t.title}</span>
                        <span className="block text-xs text-subtle">
                          {t.subject ?? "Sans matière"}{t.subtasks.length > 0 ? ` · ${t.subtasks.filter((s) => s.done).length}/${t.subtasks.length}` : ""}
                        </span>
                      </span>
                      {t.due && (
                        <span className={`calmable shrink-0 rounded-full px-2.5 py-1 text-[11px] font-medium ${late ? "bg-rose-500/10 text-rose-600" : soon ? "bg-orange-500/10 text-orange-600" : "bg-black/5 text-subtle"}`}>
                          {late ? "En retard" : daysBetween(t.due, today) === 0 ? "Aujourd'hui" : daysBetween(t.due, today) === 1 ? "Demain" : `J-${daysBetween(t.due, today)}`}
                        </span>
                      )}
                    </li>
                  );
                })}
              </ul>
            </article>
          )}

          {widgets.courses && (
            <article className={`glass rounded-[1.75rem] p-6 ${widgets.homework ? "" : "lg:col-span-2"}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="icon-chip"><CalendarRange size={18} /></span>
                  <h2 className="font-semibold tracking-tight text-text">Cours du jour</h2>
                </div>
                <Link href="/schedule" className="text-xs font-medium text-subtle transition-colors hover:text-text">Emploi du temps</Link>
              </div>

              <ul className="mt-5 space-y-1">
                {todayCourses.length === 0 && (
                  <p className="rounded-2xl bg-white/30 py-6 text-center text-sm text-subtle">
                    {jsDay === 0 || jsDay === 6 ? "Week-end 🎉" : "Pas de cours aujourd'hui"}
                  </p>
                )}
                {todayCourses.map((c: Course) => {
                  const Icon = subjectIcon(c.subject);
                  return (
                    <li key={c.id} className="flex items-center gap-3.5 rounded-2xl p-3 transition-colors hover:bg-white/50">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent/10 text-accent"><Icon size={17} /></span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium text-text">{c.subject}</span>
                        <span className="block text-xs text-subtle">{c.room ?? ""}{c.room && c.teacher ? " · " : ""}{c.teacher ?? ""}</span>
                      </span>
                      <span className="text-sm font-semibold tabular-nums text-text">{c.start}–{c.end}</span>
                    </li>
                  );
                })}
              </ul>
            </article>
          )}
        </section>
      )}

      {/* ==================== FOCUS + PROCHAIN ÉVÉNEMENT ==================== */}
      {(widgets.focus || widgets.nextUp) && (
        <section className="grid grid-cols-1 gap-4 sm:gap-5 lg:grid-cols-2">
          {widgets.focus && (
            <article className={`glass rounded-[1.75rem] p-6 ${widgets.nextUp ? "" : "lg:col-span-2"}`}>
              <div className="flex items-center gap-2.5">
                <span className="icon-chip"><Timer size={18} /></span>
                <h2 className="font-semibold tracking-tight text-text">Session de focus</h2>
              </div>
              <div className="glass-inset mt-5 flex items-center justify-between rounded-2xl p-5">
                <div>
                  <p className="text-3xl font-bold tabular-nums text-text">
                    {focusMinToday}<span className="text-base font-medium text-subtle"> min</span>
                  </p>
                  <p className="mt-1 text-xs text-subtle">travaillées aujourd&apos;hui</p>
                </div>
                <Link href="/focus" className="flex items-center gap-2 rounded-xl bg-accent px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-accent/30 transition-transform hover:-translate-y-0.5">
                  <Play size={16} /> Démarrer
                </Link>
              </div>
            </article>
          )}

          {widgets.nextUp && (
            <article className={`glass rounded-[1.75rem] p-6 ${widgets.focus ? "" : "lg:col-span-2"}`}>
              <div className="flex items-center gap-2.5">
                <span className="icon-chip"><CalendarClock size={18} /></span>
                <h2 className="font-semibold tracking-tight text-text">Prochain événement</h2>
              </div>
              {nextEvent ? (
                <Link href="/agenda" className="glass-inset glass-hover mt-5 flex items-center justify-between rounded-2xl p-5">
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold text-text">{nextEvent.title}</span>
                    <span className="mt-0.5 block text-xs text-subtle">{formatLong(nextEvent.date)} · {nextEvent.time}</span>
                  </span>
                  <span className="shrink-0 rounded-full bg-accent/15 px-3 py-1.5 text-xs font-bold text-accent">J-{daysBetween(nextEvent.date, today) || 0}</span>
                </Link>
              ) : (
                <p className="glass-inset mt-5 rounded-2xl py-6 text-center text-sm text-subtle">Aucun événement à venir</p>
              )}
            </article>
          )}
        </section>
      )}
    </>
  );
}