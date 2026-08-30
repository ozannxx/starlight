"use client";

import { useState } from "react";
import { CalendarPlus, ChevronDown, ChevronUp, Plus, Trash2 } from "lucide-react";
import { useToast } from "@/components/Toast";
import { TASKS_KEY, AGENDA_KEY, SEED_TASKS, useLocalState, todayISO, daysBetween, type Task } from "@/lib/storage";

const COLUMNS = [
  { id: "todo", label: "À faire", pill: "bg-sky-500/10 text-sky-600" },
  { id: "doing", label: "En cours", pill: "bg-amber-500/10 text-amber-600" },
  { id: "done", label: "Fait", pill: "bg-emerald-500/10 text-emerald-600" },
] as const;

function formatDue(due: string, today: string) {
  const d = daysBetween(due, today);
  if (d < 0) return "en retard";
  if (d === 0) return "aujourd'hui";
  if (d === 1) return "demain";
  return `dans ${d} j`;
}

export default function TasksPage() {
  const [tasks, setTasks] = useLocalState(TASKS_KEY, SEED_TASKS);
  const { toast } = useToast();
  const [expanded, setExpanded] = useState<string | null>(null);
  const [form, setForm] = useState({ title: "", subject: "", due: "", weekly: false, until: "" });
  const [subInput, setSubInput] = useState("");
  const today = todayISO();

  const addTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    const mk = (due?: string) => ({ id: crypto.randomUUID(), title: form.title.trim(), subject: form.subject.trim() || undefined, due, column: "todo" as const, subtasks: [] });
    const list = [mk(form.due || undefined)];
    if (form.weekly && form.due && form.until && form.due < form.until) {
      let d = new Date(`${form.due}T12:00:00`);
      const end = new Date(`${form.until}T12:00:00`);
      while (d < end && list.length < 26) {
        d = new Date(d.getTime() + 7 * 864e5);
        if (d <= end) list.push(mk(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`));
      }
    }
    setTasks((p) => [...p, ...list]);
    if (list.length > 1) toast(`${list.length} devoirs créés (récurrence hebdo)`);
    setForm({ title: "", subject: "", due: "", weekly: false, until: "" });
  };

  const move = (t: Task, dir: 1 | -1) => {
    const order = ["todo", "doing", "done"];
    const i = order.indexOf(t.column);
    const next = order[Math.min(2, Math.max(0, i + dir))];
    setTasks((p) => p.map((x) => (x.id === t.id ? { ...x, column: next as Task["column"] } : x)));
  };

  const sendToAgenda = (t: Task) => {
    if (!t.due) return;
    const list = JSON.parse(localStorage.getItem(AGENDA_KEY) ?? "[]");
    localStorage.setItem(AGENDA_KEY, JSON.stringify([...list, { id: crypto.randomUUID(), title: t.title, type: "devoir", date: t.due, time: "08:00", subject: t.subject }]));
  };

  return (
    <>
      <section className="glass rounded-[1.75rem] p-6">
        <h2 className="font-semibold tracking-tight text-text">Nouveau devoir</h2>
        <form onSubmit={addTask} className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-4">
          <input className="field sm:col-span-2" placeholder="Titre du devoir" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <input className="field" placeholder="Matière" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} />
          <input className="field" type="date" value={form.due} onChange={(e) => setForm({ ...form, due: e.target.value })} />
          <label className="glass-inset flex items-center justify-between gap-2 rounded-xl px-3 py-2.5 text-xs font-medium text-text sm:col-span-2">
            <span>↻ Répéter chaque semaine</span>
            <input type="checkbox" checked={form.weekly} onChange={(e) => setForm({ ...form, weekly: e.target.checked })} className="h-4 w-4 accent-[var(--accent)]" />
          </label>
          {form.weekly && <input className="field" type="date" title="Jusqu'au" value={form.until} onChange={(e) => setForm({ ...form, until: e.target.value })} />}
          <button type="submit" className="btn-primary sm:col-span-4"><Plus size={16} /> Ajouter</button>
        </form>
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-3 sm:gap-5">
        {COLUMNS.map((col) => {
          const list = tasks.filter((t) => t.column === col.id);
          return (
            <article key={col.id} className="glass rounded-[1.75rem] p-5">
              <div className="flex items-center justify-between px-1">
                <h2 className="text-sm font-semibold text-text">{col.label}</h2>
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${col.pill}`}>{list.length}</span>
              </div>
              <ul className="mt-4 space-y-2.5">
                {list.length === 0 && <li className="glass-inset rounded-2xl py-5 text-center text-xs text-subtle">Vide</li>}
                {list.map((t) => {
                  const open = expanded === t.id;
                  const done = t.subtasks.filter((s) => s.done).length;
                  const late = t.due && t.due < today && t.column !== "done";
                  return (
                    <li key={t.id} className="glass-inset rounded-2xl p-4">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className={`text-sm font-medium text-text ${t.column === "done" ? "line-through opacity-50" : ""}`}>{t.title}</p>
                          <p className="mt-0.5 text-xs text-subtle">
                            {t.subject ?? "Sans matière"}
                            {t.subtasks.length > 0 && ` · ${done}/${t.subtasks.length}`}
                            {t.due && <span className={late ? "ml-1 font-semibold text-rose-600" : ""}> · {formatDue(t.due, today)}</span>}
                          </p>
                        </div>
                        <div className="flex shrink-0 items-center gap-1">
                          <button onClick={() => move(t, -1)} disabled={t.column === "todo"} aria-label="Reculer" className="rounded-lg px-1.5 py-0.5 text-subtle transition-colors hover:text-text disabled:opacity-20">‹</button>
                          <button onClick={() => move(t, 1)} disabled={t.column === "done"} aria-label="Avancer" className="rounded-lg px-1.5 py-0.5 text-subtle transition-colors hover:text-text disabled:opacity-20">›</button>
                          <button onClick={() => { const removed = t; setTasks((p) => p.filter((x) => x.id !== t.id)); toast(`« ${t.title} » supprimé`, () => setTasks((p) => [...p, removed])); }}
                            aria-label="Supprimer" className="rounded-lg p-1 text-subtle transition-colors hover:bg-rose-500/10 hover:text-rose-600"><Trash2 size={13} /></button>
                        </div>
                      </div>

                      <div className="mt-3 flex items-center gap-2">
                        <button onClick={() => setExpanded(open ? null : t.id)} className="flex items-center gap-1 text-[11px] font-medium text-subtle transition-colors hover:text-text">
                          {open ? <ChevronUp size={12} /> : <ChevronDown size={12} />} Sous-tâches
                        </button>
                        {t.due && t.column !== "done" && (
                          <button onClick={() => sendToAgenda(t)} className="flex items-center gap-1 text-[11px] font-medium text-subtle transition-colors hover:text-accent">
                            <CalendarPlus size={12} /> Vers l&apos;agenda
                          </button>
                        )}
                      </div>

                      {open && (
                        <div className="mt-3 space-y-1.5 border-t border-white/40 pt-3">
                          {t.subtasks.map((s) => (
                            <label key={s.id} className="flex cursor-pointer items-center gap-2.5 text-xs">
                              <input type="checkbox" checked={s.done} onChange={() =>
                                setTasks((p) => p.map((x) => x.id === t.id ? { ...x, subtasks: x.subtasks.map((y) => y.id === s.id ? { ...y, done: !y.done } : y) } : x))
                              } className="h-4 w-4 rounded accent-[var(--accent)]" />
                              <span className={s.done ? "text-subtle line-through" : "text-text"}>{s.text}</span>
                            </label>
                          ))}
                          <form onSubmit={(e) => {
                            e.preventDefault();
                            if (!subInput.trim()) return;
                            setTasks((p) => p.map((x) => x.id === t.id ? { ...x, subtasks: [...x.subtasks, { id: crypto.randomUUID(), text: subInput.trim(), done: false }] } : x));
                            setSubInput("");
                          }} className="flex gap-2 pt-1">
                            <input className="field !py-1.5 !text-xs" placeholder="Ajouter une sous-tâche…" value={subInput} onChange={(e) => setSubInput(e.target.value)} />
                            <button type="submit" className="btn-ghost !px-3"><Plus size={13} /></button>
                          </form>
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            </article>
          );
        })}
      </section>
    </>
  );
}