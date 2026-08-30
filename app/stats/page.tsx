"use client";

import { useMemo } from "react";
import { BarChart3, CheckCircle2, Flame, Timer } from "lucide-react";
import {
  FOCUS_SESSIONS_KEY, TASKS_KEY, HABITS_KEY, GOALS_KEY, SEED_FOCUS, SEED_TASKS, SEED_HABITS, SEED_GOALS,
  useLocalState, todayISO, addDays, isoDate, daysBetween, GRADES, MOOD_KEY,
  type FocusSession, type Task, type Habit, type Goal, type MoodMap,
} from "@/lib/storage";
import { computeBadges } from "@/lib/badges";
import { predictNextAverage } from "@/lib/intelligence";

export default function StatsPage() {
  const [sessions] = useLocalState<FocusSession[]>(FOCUS_SESSIONS_KEY, SEED_FOCUS);
  const [tasks] = useLocalState<Task[]>(TASKS_KEY, SEED_TASKS);
  const [habits] = useLocalState<Habit[]>(HABITS_KEY, SEED_HABITS);
  const [goals] = useLocalState<Goal[]>(GOALS_KEY, SEED_GOALS);
  const [moods] = useLocalState<MoodMap>(MOOD_KEY, {});
  const today = todayISO();

  const pred = predictNextAverage(GRADES);
  const badges = computeBadges();
  const focusByDay = new Map<string, number>();
  sessions.forEach((x) => {
    const k = isoDate(new Date(x.startedAt));
    focusByDay.set(k, (focusByDay.get(k) ?? 0) + x.minutes);
  });
  const moodDays = Object.entries(moods).filter(([d]) => d <= today && daysBetween(today, d) >= 0 && daysBetween(today, d) <= 13);
  const avgArr = (a: number[]) => (a.length ? Math.round(a.reduce((x, y) => x + y, 0) / a.length) : null);
  const goodMood = avgArr(moodDays.filter(([, m]) => m >= 4).map(([d]) => focusByDay.get(d) ?? 0));
  const badMood = avgArr(moodDays.filter(([, m]) => m <= 2).map(([d]) => focusByDay.get(d) ?? 0));

  const s = useMemo(() => {
    const dayKey = (ts: number) => isoDate(new Date(ts));
    const last14 = Array.from({ length: 14 }, (_, i) => addDays(i - 13));
    const perDay = last14.map((d) => sessions.filter((x) => dayKey(x.startedAt) === d).reduce((a, x) => a + x.minutes, 0));
    const bestIdx = perDay.indexOf(Math.max(...perDay));
    const bySubject = new Map<string, number>();
    sessions.forEach((x) => bySubject.set(x.subject ?? "Autre", (bySubject.get(x.subject ?? "Autre") ?? 0) + x.minutes));
    const topSubject = [...bySubject.entries()].sort((a, b) => b[1] - a[1])[0];
    const doneTasks = tasks.filter((t) => t.column === "done").length;
    const goalProgress = goals.length
      ? Math.round(
          (goals.reduce((a, g) => a + (g.subgoals.length ? g.subgoals.filter((x) => x.done).length / g.subgoals.length : g.done ? 1 : 0), 0) / goals.length) * 100
        )
      : 0;
    const bestStreak = Math.max(
      0,
      ...habits.map((h) => {
        let st = 0;
        let i = h.history.includes(today) ? 0 : 1;
        while (h.history.includes(addDays(-i))) { st++; i++; }
        return st;
      })
    );
    return { perDay, last14, bestDay: perDay[bestIdx], bestIdx, topSubject, doneTasks, totalMin: sessions.reduce((a, x) => a + x.minutes, 0), goalProgress, bestStreak };
  }, [sessions, tasks, goals, habits, today]);

  const maxDay = Math.max(60, ...s.perDay);

  return (
    <>
      <section className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
        {[
          { icon: Timer, label: "Temps de focus total", value: `${Math.round(s.totalMin / 60)} h`, sub: `${sessions.length} sessions` },
          { icon: CheckCircle2, label: "Devoirs terminés", value: `${s.doneTasks}/${tasks.length}`, sub: "depuis le début" },
          { icon: BarChart3, label: "Objectifs (progression)", value: `${s.goalProgress}%`, sub: `${goals.length} objectifs` },
          { icon: Flame, label: "Meilleur streak habitude", value: `${s.bestStreak} j 🔥`, sub: `${habits.length} habitudes` },
        ].map(({ icon: Icon, label, value, sub }) => (
          <article key={label} className="glass glass-hover rounded-[1.75rem] p-6">
            <span className="icon-chip"><Icon size={19} /></span>
            <p className="mt-3 text-xs font-medium text-subtle">{label}</p>
            <p className="mt-1 text-2xl font-bold tabular-nums text-text">{value}</p>
            <p className="mt-0.5 text-[11px] text-subtle">{sub}</p>
          </article>
        ))}
      </section>

      <section className="glass rounded-[1.75rem] p-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-semibold tracking-tight text-text">Focus — 14 derniers jours</h2>
          {s.topSubject && (
            <span className="rounded-full bg-accent/10 px-3 py-1 text-xs font-semibold text-accent">
              Matière n°1 : {s.topSubject[0]} ({s.topSubject[1]} min)
            </span>
          )}
        </div>
        <div className="mt-6 flex h-52 items-end justify-between gap-1.5">
          {s.perDay.map((min, i) => (
            <div key={i} className="flex h-full flex-1 flex-col items-center justify-end gap-1" title={`${min} min · ${s.last14[i]}`}>
              <div
                className={`w-full rounded-full transition-all ${i === s.bestIdx && min > 0 ? "bg-accent" : "bg-accent/50 hover:bg-accent"}`}
                style={{ height: `${(min / maxDay) * 100}%` }}
              />
              <span className="text-[9px] text-subtle">{new Date(`${s.last14[i]}T12:00`).getDate()}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="glass rounded-[1.75rem] p-6">
        <h2 className="font-semibold tracking-tight text-text">Sessions récentes</h2>
        <ul className="mt-4 divide-y divide-white/30">
          {[...sessions].sort((a, b) => b.startedAt - a.startedAt).slice(0, 8).map((x) => (
            <li key={x.id} className="flex items-center justify-between gap-3 py-3">
              <span className="flex items-center gap-3">
                <span className="icon-chip !h-9 !w-9"><Timer size={15} /></span>
                <span>
                  <span className="block text-sm font-medium text-text">{x.subject ?? "Session libre"}</span>
                  <span className="block text-xs text-subtle">
                    {new Date(x.startedAt).toLocaleDateString("fr-FR", { weekday: "short", day: "numeric", month: "short" })} · {new Date(x.startedAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </span>
              </span>
              <span className="rounded-full bg-accent/10 px-3 py-1 text-xs font-semibold text-accent tabular-nums">{x.minutes} min</span>
            </li>
          ))}
          {sessions.length === 0 && <p className="py-6 text-center text-sm text-subtle">Aucune session — lance ton premier focus !</p>}
        </ul>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:gap-5 lg:grid-cols-2">
        <article className="glass rounded-[1.75rem] p-6">
          <h2 className="font-semibold tracking-tight text-text">📈 Projection</h2>
          <p className="mt-3 text-3xl font-bold tabular-nums text-text">
            ~{String(pred.next).replace(".", ",")}<span className="text-base text-subtle">/20</span>
          </p>
          <p className="mt-1 text-xs text-subtle">
            Tendance : {pred.trend > 0 ? `↗ +${String(pred.trend).replace(".", ",")} pts/éval` : pred.trend < 0 ? `↘ ${String(pred.trend).replace(".", ",")} pts/éval` : "→ stable"} — projection sur ta prochaine évaluation.
          </p>
        </article>
        <article className="glass rounded-[1.75rem] p-6">
          <h2 className="font-semibold tracking-tight text-text">😊 Humeur & focus</h2>
          {goodMood !== null || badMood !== null ? (
            <div className="mt-4 space-y-3 text-sm">
              <p className="text-text">Bonne humeur (🙂😄) : <span className="font-bold text-emerald-600">{goodMood ?? "—"} min</span> de focus en moyenne</p>
              <p className="text-text">Jours difficiles (😞😕) : <span className="font-bold text-rose-600">{badMood ?? "—"} min</span> de focus en moyenne</p>
              <p className="text-xs text-subtle">Sur les 14 derniers jours ({moodDays.length} humeurs enregistrées sur /today).</p>
            </div>
          ) : (
            <p className="mt-4 text-sm text-subtle">Enregistre ton humeur sur la page « Aujourd&apos;hui » pour découvrir les corrélations.</p>
          )}
        </article>
      </section>

      <section className="glass calmable rounded-[1.75rem] p-6">
        <h2 className="font-semibold tracking-tight text-text">🏅 Badges</h2>
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {badges.map((b) => (
            <div key={b.id} className={`glass-inset rounded-2xl p-4 text-center ${b.unlocked ? "" : "opacity-45"}`}>
              <p className="text-sm font-semibold text-text">{b.name}</p>
              <p className="mt-1 text-[11px] text-subtle">{b.desc}</p>
              <p className={`mt-2 text-[11px] font-bold ${b.unlocked ? "text-emerald-600" : "text-subtle"}`}>{b.unlocked ? "✓ Débloqué" : b.progress}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}