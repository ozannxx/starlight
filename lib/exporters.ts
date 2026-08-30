import { AGENDA_KEY, TASKS_KEY, FOCUS_SESSIONS_KEY, GOALS_KEY, HABITS_KEY, APPS_KEY, JOURNAL_KEY, readJSON, eventMeta, todayISO, type AgendaEvent, type Task, type FocusSession, type Goal, type Habit, type Application, type JournalEntry } from "./storage";
import { detectType } from "./quickadd";

export function download(filename: string, content: string, mime = "text/plain") {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([content], { type: mime }));
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

const pad2 = (n: number) => String(n).padStart(2, "0");
const compact = (iso: string) => iso.replace(/-/g, "");
const nextDay = (iso: string) => { const d = new Date(`${iso}T12:00:00`); d.setDate(d.getDate() + 1); return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`; };

export function toICS(events: AgendaEvent[]): string {
  const esc = (s: string) => s.replace(/([,;\\])/g, "\\$1");
  const stamp = new Date().toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  const lines = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Project Starlight//Agenda//FR"];
  events.forEach((e) => {
    lines.push("BEGIN:VEVENT", `UID:${e.id}@starlight`, `DTSTAMP:${stamp}`, `SUMMARY:${esc(e.title)}`);
    if (e.subject) lines.push(`DESCRIPTION:${esc(e.subject)}`);
    if (eventMeta(e).allDay || !e.time) {
      lines.push(`DTSTART;VALUE=DATE:${compact(e.date)}`, `DTEND;VALUE=DATE:${compact(nextDay(e.date))}`);
    } else {
      const [h, m] = e.time.split(":").map(Number);
      lines.push(`DTSTART:${compact(e.date)}T${pad2(h)}${pad2(m)}00`, `DTEND:${compact(e.date)}T${pad2(Math.min(23, h + 1))}${pad2(m)}00`);
    }
    lines.push("END:VEVENT");
  });
  lines.push("END:VCALENDAR");
  return lines.join("\r\n");
}

export function parseICS(text: string): AgendaEvent[] {
  const out: AgendaEvent[] = [];
  (text.match(/BEGIN:VEVENT[\s\S]*?END:VEVENT/g) ?? []).forEach((b) => {
    const sum = b.match(/SUMMARY[^:]*:(.*)/)?.[1]?.trim();
    const dt = b.match(/DTSTART[^:]*:(\d{8})(?:T(\d{2})(\d{2}))?/);
    if (!sum || !dt) return;
    out.push({
      id: crypto.randomUUID(),
      title: sum.replace(/\\([,;\\])/g, "$1"),
      type: detectType(sum),
      date: `${dt[1].slice(0, 4)}-${dt[1].slice(4, 6)}-${dt[1].slice(6, 8)}`,
      time: dt[2] ? `${dt[2]}:${dt[3]}` : "08:00",
    });
  });
  return out;
}

export function exportICS() {
  const events = readJSON<AgendaEvent[]>(AGENDA_KEY, []);
  download(`starlight-agenda-${todayISO()}.ics`, toICS(events), "text/calendar");
}

export function exportMarkdown() {
  const L: string[] = [`# ⭐ Project Starlight — Archive du ${new Date().toLocaleDateString("fr-FR")}`, ""];
  const agenda = readJSON<AgendaEvent[]>(AGENDA_KEY, []);
  L.push(`## 📅 Agenda (${agenda.length})`, "", "| Date | Heure | Type | Titre | Matière |", "|---|---|---|---|---|");
  [...agenda].sort((a, b) => a.date.localeCompare(b.date)).forEach((e) => L.push(`| ${e.date} | ${e.time} | ${eventMeta(e).label} | ${e.title} | ${e.subject ?? ""} |`));
  const tasks = readJSON<Task[]>(TASKS_KEY, []);
  L.push("", `## 📝 Devoirs (${tasks.length})`, "");
  tasks.forEach((t) => {
    L.push(`- [${t.column === "done" ? "x" : " "}] **${t.title}**${t.due ? ` — pour le ${t.due}` : ""}${t.subject ? ` (${t.subject})` : ""}`);
    t.subtasks.forEach((s) => L.push(`  - [${s.done ? "x" : " "}] ${s.text}`));
  });
  const sessions = readJSON<FocusSession[]>(FOCUS_SESSIONS_KEY, []);
  L.push("", `## ⏱️ Focus — ${Math.round(sessions.reduce((a, s) => a + s.minutes, 0) / 60)} h cumulées`, "");
  [...sessions].sort((a, b) => b.startedAt - a.startedAt).slice(0, 60).forEach((s) => L.push(`- ${new Date(s.startedAt).toLocaleDateString("fr-FR")} — ${s.subject ?? "Session libre"} (${s.minutes} min)`));
  const goals = readJSON<Goal[]>(GOALS_KEY, []);
  L.push("", `## 🎯 Objectifs`, "");
  goals.forEach((g) => { L.push(`- [${g.done ? "x" : " "}] **${g.title}**${g.deadline ? ` (avant le ${g.deadline})` : ""}`); g.subgoals.forEach((s) => L.push(`  - [${s.done ? "x" : " "}] ${s.text}`)); });
  const habits = readJSON<Habit[]>(HABITS_KEY, []);
  L.push("", `## 🔥 Habitudes`, "");
  habits.forEach((h) => L.push(`- **${h.title}** — ${h.history.length} jours validés`));
  const apps = readJSON<Application[]>(APPS_KEY, []);
  L.push("", `## 🎓 Candidatures`, "");
  apps.forEach((a) => L.push(`- **${a.school}** — ${a.program} (${a.status})${a.deadline ? ` · deadline ${a.deadline}` : ""}`));
  const journal = readJSON<JournalEntry[]>(JOURNAL_KEY, []).filter((j) => j.text.trim());
  if (journal.length) {
    L.push("", `## 📖 Journal`, "");
    [...journal].sort().forEach((j) => L.push(`### ${j.date}`, j.text, ""));
  }
  download(`starlight-archive-${todayISO()}.md`, L.join("\n"), "text/markdown");
}