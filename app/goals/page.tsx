"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Flame, Plus, Target, Trash2 } from "lucide-react";
import { useToast } from "@/components/Toast";
import { GOALS_KEY, HABITS_KEY, SEED_GOALS, SEED_HABITS, useLocalState, todayISO, addDays, daysBetween, type Goal } from "@/lib/storage";

export default function GoalsPage() {
  const [goals, setGoals] = useLocalState<Goal[]>(GOALS_KEY, SEED_GOALS);
  const [habits, setHabits] = useLocalState(HABITS_KEY, SEED_HABITS);
  const { toast } = useToast();
  const [expanded, setExpanded] = useState<string | null>(null);
  const [goalTitle, setGoalTitle] = useState("");
  const [goalDeadline, setGoalDeadline] = useState("");
  const [subInputs, setSubInputs] = useState<Record<string, string>>({});
  const [habitTitle, setHabitTitle] = useState("");
  const today = todayISO();
  const last7 = Array.from({ length: 7 }, (_, i) => addDays(i - 6));

  const addGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!goalTitle.trim()) return;
    setGoals((p) => [...p, { id: crypto.randomUUID(), title: goalTitle.trim(), deadline: goalDeadline || undefined, done: false, subgoals: [] }]);
    setGoalTitle(""); setGoalDeadline("");
  };

  const streakOf = (h: { history: string[] }) => {
    let st = 0; let i = h.history.includes(today) ? 0 : 1;
    while (h.history.includes(addDays(-i))) { st++; i++; }
    return st;
  };

  return (
    <>
      <section className="grid grid-cols-1 gap-4 sm:gap-5 lg:grid-cols-2">
        {/* ===== Objectifs ===== */}
        <div className="flex flex-col gap-4 sm:gap-5">
          <section className="glass rounded-[1.75rem] p-6">
            <div className="flex items-center gap-2.5">
              <span className="icon-chip"><Target size={18} /></span>
              <h2 className="font-semibold tracking-tight text-text">Nouvel objectif</h2>
            </div>
            <form onSubmit={addGoal} className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-3">
              <input className="field sm:col-span-2" placeholder="Ex : 15 de moyenne en physique" value={goalTitle} onChange={(e) => setGoalTitle(e.target.value)} />
              <input className="field" type="date" value={goalDeadline} onChange={(e) => setGoalDeadline(e.target.value)} />
              <button type="submit" className="btn-primary sm:col-span-3"><Plus size={15} /> Ajouter l&apos;objectif</button>
            </form>
          </section>

          {goals.map((g) => {
            const open = expanded === g.id;
            const done = g.subgoals.filter((s) => s.done).length;
            const pct = g.subgoals.length ? Math.round((done / g.subgoals.length) * 100) : g.done ? 100 : 0;
            return (
              <section key={g.id} className="glass rounded-[1.75rem] p-6">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className={`text-sm font-semibold text-text ${g.done ? "line-through opacity-50" : ""}`}>{g.title}</p>
                    {g.deadline && (
                      <span className={`mt-1.5 inline-block rounded-full px-2.5 py-0.5 text-[11px] font-medium ${daysBetween(g.deadline, today) < 0 ? "bg-rose-500/10 text-rose-600" : daysBetween(g.deadline, today) <= 7 ? "bg-orange-500/10 text-orange-600" : "bg-black/5 text-subtle"}`}>
                        {daysBetween(g.deadline, today) < 0 ? "Dépassé" : `J-${daysBetween(g.deadline, today)}`} · {g.deadline}
                      </span>
                    )}
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <button onClick={() => setGoals((p) => p.map((x) => x.id === g.id ? { ...x, done: !x.done } : x))}
                      aria-label="Terminer" className={`flex h-7 w-7 items-center justify-center rounded-lg border-2 text-xs transition-all ${g.done ? "border-accent bg-accent text-white" : "border-subtle/40 hover:border-accent"}`}>✓</button>
                    <button onClick={() => { const removed = g; setGoals((p) => p.filter((x) => x.id !== g.id)); toast(`« ${g.title} » supprimé`, () => setGoals((p) => [...p, removed])); }}
                      aria-label="Supprimer" className="rounded-lg p-1.5 text-subtle transition-colors hover:bg-rose-500/10 hover:text-rose-600"><Trash2 size={14} /></button>
                  </div>
                </div>

                <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-white/30">
                  <div className="h-full rounded-full bg-accent transition-all duration-500" style={{ width: `${pct}%` }} />
                </div>
                <p className="mt-1.5 text-xs text-subtle">{pct}% atteint{g.subgoals.length ? ` · ${done}/${g.subgoals.length} sous-objectifs` : ""}</p>

                <button onClick={() => setExpanded(open ? null : g.id)} className="mt-3 flex items-center gap-1 text-xs font-medium text-subtle transition-colors hover:text-text">
                  {open ? <ChevronUp size={13} /> : <ChevronDown size={13} />} Sous-objectifs
                </button>

                {open && (
                  <div className="mt-3 space-y-2 border-t border-white/40 pt-3">
                    {g.subgoals.map((s) => (
                      <div key={s.id} className="flex items-center gap-2.5">
                        <input type="checkbox" checked={s.done} onChange={() =>
                          setGoals((p) => p.map((x) => x.id === g.id ? { ...x, subgoals: x.subgoals.map((y) => y.id === s.id ? { ...y, done: !y.done } : y) } : x))
                        } className="h-4 w-4 rounded accent-[var(--accent)]" />
                        <span className={`flex-1 text-xs ${s.done ? "text-subtle line-through" : "text-text"}`}>{s.text}</span>
                        <button onClick={() => setGoals((p) => p.map((x) => x.id === g.id ? { ...x, subgoals: x.subgoals.filter((y) => y.id !== s.id) } : x))} aria-label="Supprimer" className="text-subtle transition-colors hover:text-rose-600"><Trash2 size={12} /></button>
                      </div>
                    ))}
                    <form onSubmit={(e) => {
                      e.preventDefault();
                      const v = (subInputs[g.id] ?? "").trim();
                      if (!v) return;
                      setGoals((p) => p.map((x) => x.id === g.id ? { ...x, subgoals: [...x.subgoals, { id: crypto.randomUUID(), text: v, done: false }] } : x));
                      setSubInputs({ ...subInputs, [g.id]: "" });
                    }} className="flex gap-2 pt-1">
                      <input className="field !py-1.5 !text-xs" placeholder="Nouveau sous-objectif…" value={subInputs[g.id] ?? ""} onChange={(e) => setSubInputs({ ...subInputs, [g.id]: e.target.value })} />
                      <button type="submit" className="btn-ghost !px-3"><Plus size={13} /></button>
                    </form>
                  </div>
                )}
              </section>
            );
          })}
        </div>

        {/* ===== Habitudes ===== */}
        <div className="flex flex-col gap-4 sm:gap-5">
          <section className="glass rounded-[1.75rem] p-6">
            <div className="flex items-center gap-2.5">
              <span className="icon-chip"><Flame size={18} /></span>
              <h2 className="font-semibold tracking-tight text-text">Nouvelle habitude</h2>
            </div>
            <form onSubmit={(e) => {
              e.preventDefault();
              if (!habitTitle.trim()) return;
              setHabits((p) => [...p, { id: crypto.randomUUID(), title: habitTitle.trim(), history: [] }]);
              setHabitTitle("");
            }} className="mt-4 flex gap-2">
              <input className="field" placeholder="Ex : Réviser 20 min par jour" value={habitTitle} onChange={(e) => setHabitTitle(e.target.value)} />
              <button type="submit" className="btn-ghost !px-4"><Plus size={15} /></button>
            </form>
          </section>

          {habits.map((h) => {
            const streak = streakOf(h);
            return (
              <section key={h.id} className="glass rounded-[1.75rem] p-6">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <p className="text-sm font-semibold text-text">{h.title}</p>
                    {streak > 0 && <span className="rounded-full bg-orange-500/10 px-2.5 py-0.5 text-xs font-bold text-orange-600">🔥 {streak} j</span>}
                  </div>
                  <button onClick={() => { const removed = h; setHabits((p) => p.filter((x) => x.id !== h.id)); toast(`« ${h.title} » supprimée`, () => setHabits((p) => [...p, removed])); }}
                    aria-label="Supprimer" className="rounded-lg p-1.5 text-subtle transition-colors hover:bg-rose-500/10 hover:text-rose-600"><Trash2 size={14} /></button>
                </div>
                <div className="mt-4 flex justify-between gap-1.5">
                  {last7.map((d) => {
                    const active = h.history.includes(d);
                    return (
                      <button key={d} onClick={() =>
                        setHabits((p) => p.map((x) => x.id === h.id ? { ...x, history: active ? x.history.filter((y) => y !== d) : [...x.history, d] } : x))
                      } title={d}
                        className={`flex aspect-square flex-1 items-center justify-center rounded-xl text-[10px] font-medium transition-all ${active ? "bg-accent text-white shadow-lg shadow-accent/30" : "glass-inset text-subtle hover:text-text"}`}>
                        {["L", "M", "M", "J", "V", "S", "D"][(new Date(`${d}T12:00`).getDay() + 6) % 7]}
                      </button>
                    );
                  })}
                </div>
                <p className="mt-2.5 text-[11px] text-subtle">{h.history.length} jour{h.history.length > 1 ? "s" : ""} validé{h.history.length > 1 ? "s" : ""} au total</p>
              </section>
            );
          })}
        </div>
      </section>
    </>
  );
}