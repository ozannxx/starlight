"use client";

import { useEffect, useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  Backpack, BookOpen, Bus, Cake, Calculator, CalendarClock, ClipboardCheck,
  Dumbbell, FlaskConical, Landmark, Languages, Layers, Mic, NotebookPen, Palmtree, Users,
} from "lucide-react";

/* ============ Clés ============ */
export const AGENDA_KEY = "starlight-agenda-events-v2";
export const TASKS_KEY = "starlight-tasks";
export const FOCUS_SETTINGS_KEY = "starlight-focus-settings";
export const FOCUS_SESSIONS_KEY = "starlight-focus-sessions";
export const SCHEDULE_KEY = "starlight-schedule";
export const DOCS_KEY = "starlight-docs";
export const GOALS_KEY = "starlight-goals";
export const HABITS_KEY = "starlight-habits";
export const APPS_KEY = "starlight-applications";
export const CV_KEY = "starlight-cv";
export const WIDGETS_KEY = "starlight-widgets";
export const ALL_KEYS = [AGENDA_KEY, TASKS_KEY, FOCUS_SETTINGS_KEY, FOCUS_SESSIONS_KEY, SCHEDULE_KEY, DOCS_KEY, GOALS_KEY, HABITS_KEY, APPS_KEY, CV_KEY, WIDGETS_KEY];

/* ============ Dates ============ */
export const pad = (n: number) => String(n).padStart(2, "0");
export const isoDate = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const addDays = (n: number) => { const d = new Date(); d.setDate(d.getDate() + n); return isoDate(d); };
export const todayISO = () => isoDate(new Date());
export const ts = (iso: string, time: string) => new Date(`${iso}T${time || "12:00"}:00`).getTime();
export const daysBetween = (iso1: string, iso2: string) =>
  Math.round((new Date(`${iso1}T12:00:00`).getTime() - new Date(`${iso2}T12:00:00`).getTime()) / 864e5);
export const formatLong = (iso: string) => {
  const s = new Date(`${iso}T12:00:00`).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" });
  return s.charAt(0).toUpperCase() + s.slice(1);
};
export const minutesOf = (t: string) => { const [h, m] = (t || "0:0").split(":").map(Number); return h * 60 + (m || 0); };

/* ============ Types ============ */
export type EventType = "devoir" | "controle" | "oral" | "projet" | "vacances" | "sortie" | "apporter" | "anniversaire" | "sport" | "reunion" | "rdv";
export type AgendaEvent = { id: string; title: string; type: EventType; date: string; time: string; subject?: string };
export type Task = { id: string; title: string; subject?: string; due?: string; column: "todo" | "doing" | "done"; subtasks: { id: string; text: string; done: boolean }[] };
export type FocusSettings = { focusMin: number; shortBreakMin: number; longBreakMin: number; cyclesBeforeLong: number };
export type FocusSession = { id: string; startedAt: number; minutes: number; subject?: string };
export type Course = { id: string; day: number; start: string; end: string; subject: string; room?: string; teacher?: string; week: "A" | "B" | "both" };
export type DocItem = { id: string; name: string; subject?: string; year?: string; dataUrl?: string; url?: string; size?: number; addedAt: number };
export type Goal = { id: string; title: string; deadline?: string; done: boolean; subgoals: { id: string; text: string; done: boolean }[] };
export type Habit = { id: string; title: string; history: string[] };
export type AppStatus = "idee" | "prep" | "envoye" | "attente" | "admis" | "refuse";
export type Application = { id: string; school: string; program: string; status: AppStatus; deadline?: string; notes?: string; materials: { id: string; text: string; done: boolean }[] };
export type CVData = {
  fullName: string; email: string; phone: string; pitch: string;
  education: { id: string; diploma: string; school: string; years: string }[];
  skills: string[]; languages: string[];
  projects: { id: string; title: string; desc: string }[];
};

/* ============ Méta événements (identique à /agenda) ============ */
export const TYPE_META: Record<EventType, { label: string; short: string; icon: LucideIcon; pill: string; dot: string; allDay?: boolean }> = {
  devoir: { label: "Devoir", short: "Devoir", icon: NotebookPen, pill: "bg-sky-500/10 text-sky-600", dot: "bg-sky-500" },
  controle: { label: "Contrôle", short: "Contrôle", icon: ClipboardCheck, pill: "bg-rose-500/10 text-rose-600", dot: "bg-rose-500" },
  oral: { label: "Oral / Exposé", short: "Oral", icon: Mic, pill: "bg-amber-500/10 text-amber-600", dot: "bg-amber-500" },
  projet: { label: "Projet à rendre", short: "Projet", icon: Layers, pill: "bg-indigo-500/10 text-indigo-600", dot: "bg-indigo-500" },
  vacances: { label: "Vacances / Pont", short: "Vacances", icon: Palmtree, pill: "bg-teal-500/10 text-teal-600", dot: "bg-teal-500", allDay: true },
  sortie: { label: "Sortie scolaire", short: "Sortie", icon: Bus, pill: "bg-orange-500/10 text-orange-600", dot: "bg-orange-500", allDay: true },
  apporter: { label: "À apporter", short: "À apporter", icon: Backpack, pill: "bg-cyan-500/10 text-cyan-600", dot: "bg-cyan-500", allDay: true },
  anniversaire: { label: "Anniversaire", short: "Anniv.", icon: Cake, pill: "bg-pink-500/10 text-pink-600", dot: "bg-pink-500", allDay: true },
  sport: { label: "Sport / Activité", short: "Sport", icon: Dumbbell, pill: "bg-blue-500/10 text-blue-600", dot: "bg-blue-500" },
  reunion: { label: "Réunion parents-profs", short: "Parents-profs", icon: Users, pill: "bg-purple-500/10 text-purple-600", dot: "bg-purple-500" },
  rdv: { label: "Rendez-vous perso", short: "Rdv perso", icon: CalendarClock, pill: "bg-violet-500/10 text-violet-600", dot: "bg-violet-500" },
};
export const eventMeta = (ev: AgendaEvent) => TYPE_META[ev.type] ?? TYPE_META.rdv;
export const eventTarget = (ev: AgendaEvent) => ts(ev.date, eventMeta(ev).allDay ? "08:00" : ev.time);

export const APP_STATUSES: { id: AppStatus; label: string; pill: string; bar: string }[] = [
  { id: "idee", label: "Idée", pill: "bg-black/10 text-subtle", bar: "bg-black/20" },
  { id: "prep", label: "En préparation", pill: "bg-amber-500/10 text-amber-600", bar: "bg-amber-500" },
  { id: "envoye", label: "Envoyé", pill: "bg-sky-500/10 text-sky-600", bar: "bg-sky-500" },
  { id: "attente", label: "En attente", pill: "bg-violet-500/10 text-violet-600", bar: "bg-violet-500" },
  { id: "admis", label: "Admis 🎉", pill: "bg-emerald-500/10 text-emerald-600", bar: "bg-emerald-500" },
  { id: "refuse", label: "Refusé", pill: "bg-rose-500/10 text-rose-600", bar: "bg-rose-500" },
];

export const SUBJECT_ICONS: Record<string, LucideIcon> = {
  Mathématiques: Calculator, "Physique-Chimie": FlaskConical, Anglais: Languages, Espagnol: Languages,
  "Histoire-Géographie": Landmark, Histoire: Landmark, SVT: BookOpen, Sport: Dumbbell, Français: BookOpen,
};
export const subjectIcon = (s?: string): LucideIcon => (s && SUBJECT_ICONS[s]) || BookOpen;

/* ============ Hook de persistance ============ */
export function useLocalState<T>(key: string, initial: T) {
  const [state, setState] = useState<T>(initial);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    try { const raw = localStorage.getItem(key); if (raw !== null) setState(JSON.parse(raw) as T); } catch {}
    setReady(true);
  }, [key]);
  useEffect(() => {
    if (!ready) return;
    try { localStorage.setItem(key, JSON.stringify(state)); } catch {}
  }, [key, state, ready]);
  return [state, setState, ready] as const;
}

export function readJSON<T>(key: string, fallback: T): T {
  try { const raw = localStorage.getItem(key); return raw ? (JSON.parse(raw) as T) : fallback; } catch { return fallback; }
}

/* ============ Seeds ============ */
export const SEED_AGENDA: AgendaEvent[] = [
  { id: "seed-1", title: "DM de Maths — dérivées", type: "devoir", date: addDays(1), time: "08:00", subject: "Mathématiques" },
  { id: "seed-2", title: "Apporter la blouse de chimie", type: "apporter", date: addDays(1), time: "08:00" },
  { id: "seed-3", title: "Entraînement foot", type: "sport", date: addDays(2), time: "17:30" },
  { id: "seed-4", title: "Contrôle Physique — circuits", type: "controle", date: addDays(3), time: "10:00", subject: "Physique-Chimie" },
  { id: "seed-5", title: "Anniversaire de Lucas 🎂", type: "anniversaire", date: addDays(6), time: "08:00" },
  { id: "seed-6", title: "Oral d'Espagnol", type: "oral", date: addDays(9), time: "14:00", subject: "Espagnol" },
  { id: "seed-7", title: "Sortie au musée d'Orsay", type: "sortie", date: addDays(12), time: "08:00" },
  { id: "seed-8", title: "Réunion parents-professeurs", type: "reunion", date: addDays(15), time: "18:00" },
  { id: "seed-9", title: "TPE — rendre le dossier final", type: "projet", date: addDays(18), time: "23:59", subject: "TPE" },
  { id: "seed-10", title: "🏆 Vacances de printemps", type: "vacances", date: addDays(20), time: "08:00" },
];

export const SEED_TASKS: Task[] = [
  { id: "t1", title: "DM de Maths — dérivées", subject: "Mathématiques", due: addDays(1), column: "todo", subtasks: [{ id: "t1a", text: "Exercices 1 à 3", done: false }, { id: "t1b", text: "Relecture", done: false }] },
  { id: "t2", title: "Exposé Histoire — la Révolution", subject: "Histoire-Géographie", due: addDays(3), column: "doing", subtasks: [{ id: "t2a", text: "Plan", done: true }, { id: "t2b", text: "Recherches", done: false }, { id: "t2c", text: "Diaporama", done: false }] },
  { id: "t3", title: "Fiche de vocabulaire anglais", subject: "Anglais", due: addDays(2), column: "todo", subtasks: [] },
  { id: "t4", title: "TP Physique — circuits électriques", subject: "Physique-Chimie", due: addDays(-2), column: "done", subtasks: [] },
];

export const DEFAULT_FOCUS: FocusSettings = { focusMin: 25, shortBreakMin: 5, longBreakMin: 15, cyclesBeforeLong: 4 };

export const SEED_FOCUS: FocusSession[] = [
  { id: "f1", startedAt: ts(addDays(0), "16:10"), minutes: 25, subject: "Mathématiques" },
  { id: "f2", startedAt: ts(addDays(0), "17:00"), minutes: 25, subject: "Mathématiques" },
  { id: "f3", startedAt: ts(addDays(-1), "10:00"), minutes: 50, subject: "Physique-Chimie" },
  { id: "f4", startedAt: ts(addDays(-1), "15:30"), minutes: 25, subject: "Anglais" },
  { id: "f5", startedAt: ts(addDays(-2), "09:00"), minutes: 25, subject: "Histoire-Géo" },
];

export const SEED_SCHEDULE: Course[] = [
  { id: "c1", day: 1, start: "08:00", end: "09:00", subject: "Mathématiques", room: "Salle 204", teacher: "M. Bernard", week: "both" },
  { id: "c2", day: 1, start: "09:00", end: "10:00", subject: "Physique-Chimie", room: "Labo 3", teacher: "Mme Laurent", week: "both" },
  { id: "c3", day: 2, start: "10:00", end: "11:00", subject: "Anglais", room: "Salle 112", teacher: "Mme Carter", week: "both" },
  { id: "c4", day: 3, start: "08:00", end: "09:00", subject: "Mathématiques", room: "Salle 204", teacher: "M. Bernard", week: "both" },
  { id: "c5", day: 3, start: "13:00", end: "14:00", subject: "Histoire-Géographie", room: "Salle 305", teacher: "M. Dubois", week: "both" },
  { id: "c6", day: 4, start: "15:00", end: "16:00", subject: "SVT", room: "Labo 1", teacher: "Mme Petit", week: "both" },
  { id: "c7", day: 5, start: "10:00", end: "12:00", subject: "Sport", room: "Gymnase", teacher: "M. Roche", week: "both" },
];

export const SEED_DOCS: DocItem[] = [
  { id: "d1", name: "Bulletin du T2", subject: "Administration", year: "2025-2026", addedAt: Date.now() },
  { id: "d2", name: "Emploi du temps officiel", subject: "Administration", year: "2025-2026", addedAt: Date.now() },
];

export const SEED_GOALS: Goal[] = [
  { id: "g1", title: "15 de moyenne en Maths au T3", deadline: addDays(45), done: false, subgoals: [
    { id: "g1a", text: "Refaire les 3 derniers contrôles", done: true },
    { id: "g1b", text: "Fiche sur les dérivées", done: true },
    { id: "g1c", text: "2 sessions de focus / semaine", done: false },
    { id: "g1d", text: "Demander de l'aide à M. Bernard", done: false },
  ]},
  { id: "g2", title: "Terminer le dossier TPE", deadline: addDays(18), done: false, subgoals: [
    { id: "g2a", text: "Introduction", done: true },
    { id: "g2b", text: "Partie expérimentale", done: false },
    { id: "g2c", text: "Conclusion + bibliographie", done: false },
  ]},
];

export const SEED_HABITS: Habit[] = [
  { id: "h1", title: "Réviser 20 min", history: [addDays(0), addDays(-1), addDays(-2)] },
  { id: "h2", title: "Lire 10 pages", history: [addDays(-1)] },
];

export const SEED_APPS: Application[] = [
  { id: "a1", school: "Université Paris-Saclay", program: "Licence Informatique", status: "prep", deadline: addDays(30), notes: "", materials: [
    { id: "a1a", text: "Relevé de notes", done: true }, { id: "a1b", text: "Lettre de motivation", done: false },
  ]},
  { id: "a2", school: "IUT de Villetaneuse", program: "BUT Informatique", status: "envoye", deadline: addDays(12), notes: "Dossier envoyé le 2 mars", materials: [] },
  { id: "a3", school: "EPITA", program: "Cycle ingénieur", status: "idee", deadline: addDays(60), notes: "", materials: [] },
];

export const SEED_CV: CVData = {
  fullName: "Ozan", email: "ozntktt@icloud.com", phone: "",
  pitch: "Élève motivé et organisé, passionné par les sciences et les nouvelles technologies.",
  education: [{ id: "e1", diploma: "Baccalauréat général", school: "Lycée ★★", years: "2024 – 2026" }],
  skills: ["Organisation", "Autonomie", "Esprit d'équipe"],
  languages: ["Français (natif)", "Anglais (B2)"],
  projects: [],
};

export const SEED_WIDGETS = { kpis: true, card: true, grades: true, homework: true, courses: true, focus: true, nextUp: true };
export const GRADES = [14, 16, 12, 17, 15, 18, 13, 15.5, 16, 11, 17, 15, 18, 14];