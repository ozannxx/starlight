import { TASKS_KEY, FOCUS_SESSIONS_KEY, HABITS_KEY, GOALS_KEY, JOURNAL_KEY, APPS_KEY, readJSON, todayISO, addDays, type Task, type FocusSession, type Habit, type Goal, type JournalEntry, type Application } from "./storage";

export type Badge = { id: string; name: string; desc: string; unlocked: boolean; progress: string };

export function computeBadges(): Badge[] {
  const tasks = readJSON<Task[]>(TASKS_KEY, []);
  const done = tasks.filter((t) => t.column === "done").length;
  const sessions = readJSON<FocusSession[]>(FOCUS_SESSIONS_KEY, []);
  const hours = sessions.reduce((a, s) => a + s.minutes, 0) / 60;
  const today = todayISO();
  const streaks = readJSON<Habit[]>(HABITS_KEY, []).map((h) => {
    let st = 0, i = h.history.includes(today) ? 0 : 1;
    while (h.history.includes(addDays(-i))) { st++; i++; }
    return st;
  });
  const best = Math.max(0, ...streaks, 0);
  const goalsDone = readJSON<Goal[]>(GOALS_KEY, []).filter((g) => g.done).length;
  const journal = readJSON<JournalEntry[]>(JOURNAL_KEY, []).filter((j) => j.text.trim()).length;
  const apps = readJSON<Application[]>(APPS_KEY, []);
  return [
    { id: "t1", name: "🌱 Premier pas", desc: "1 devoir terminé", unlocked: done >= 1, progress: `${done}/1` },
    { id: "t10", name: "📋 Cadre sérieux", desc: "10 devoirs terminés", unlocked: done >= 10, progress: `${Math.min(done, 10)}/10` },
    { id: "t50", name: "⚔️ Machine de guerre", desc: "50 devoirs terminés", unlocked: done >= 50, progress: `${Math.min(done, 50)}/50` },
    { id: "f1", name: "⏱️ Première heure", desc: "1 h de focus cumulée", unlocked: hours >= 1, progress: `${Math.round(Math.min(hours, 1) * 60)}/60 min` },
    { id: "f10", name: "🧠 Deep worker", desc: "10 h de focus cumulées", unlocked: hours >= 10, progress: `${Math.round(Math.min(hours, 10) * 10) / 10}/10 h` },
    { id: "f50", name: "🚀 Monstre de concentration", desc: "50 h de focus", unlocked: hours >= 50, progress: `${Math.round(Math.min(hours, 50))}/50 h` },
    { id: "s7", name: "🔥 Semaine parfaite", desc: "7 jours de streak d'habitude", unlocked: best >= 7, progress: `${Math.min(best, 7)}/7 j` },
    { id: "s30", name: "🧊 Mois de fer", desc: "30 jours de streak", unlocked: best >= 30, progress: `${Math.min(best, 30)}/30 j` },
    { id: "g1", name: "🎯 Objectif atteint", desc: "1 objectif coché", unlocked: goalsDone >= 1, progress: `${goalsDone}/1` },
    { id: "g5", name: "🏹 Viseur", desc: "5 objectifs atteints", unlocked: goalsDone >= 5, progress: `${Math.min(goalsDone, 5)}/5` },
    { id: "j10", name: "📖 Chroniqueur", desc: "10 entrées de journal", unlocked: journal >= 10, progress: `${Math.min(journal, 10)}/10` },
    { id: "adm", name: "🎓 Admis !", desc: "Une candidature acceptée", unlocked: apps.some((a) => a.status === "admis"), progress: apps.some((a) => a.status === "admis") ? "✓" : "—" },
  ];
}