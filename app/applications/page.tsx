"use client";

import { useState } from "react";
import { CalendarClock, ChevronDown, ChevronUp, Plus, Trash2 } from "lucide-react";
import { APPS_KEY, SEED_APPS, APP_STATUSES, useLocalState, todayISO, daysBetween, type Application, type AppStatus } from "@/lib/storage";

export default function ApplicationsPage() {
  const [apps, setApps] = useLocalState<Application[]>(APPS_KEY, SEED_APPS);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [form, setForm] = useState({ school: "", program: "", deadline: "" });
  const [matInputs, setMatInputs] = useState<Record<string, string>>({});
  const today = todayISO();

  const add = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.school.trim()) return;
    setApps((p) => [...p, { id: crypto.randomUUID(), school: form.school.trim(), program: form.program.trim(), status: "idee", deadline: form.deadline || undefined, notes: "", materials: [] }]);
    setForm({ school: "", program: "", deadline: "" });
  };

  const setStatus = (id: string, dir: 1 | -1) => {
    const idx = APP_STATUSES.findIndex((s) => s.id === apps.find((a) => a.id === id)?.status);
    const next = APP_STATUSES[Math.min(APP_STATUSES.length - 1, Math.max(0, idx + dir))];
    setApps((p) => p.map((a) => (a.id === id ? { ...a, status: next.id as AppStatus } : a)));
  };

  return (
    <>
      <section className="glass rounded-[1.75rem] p-6">
        <div className="flex items-center gap-2.5">
          <span className="icon-chip"><CalendarClock size={18} /></span>
          <h2 className="font-semibold tracking-tight text-text">Nouvelle candidature</h2>
        </div>
        <form onSubmit={add} className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-4">
          <input className="field" placeholder="École / université" value={form.school} onChange={(e) => setForm({ ...form, school: e.target.value })} />
          <input className="field" placeholder="Formation" value={form.program} onChange={(e) => setForm({ ...form, program: e.target.value })} />
          <input className="field" type="date" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} />
          <button type="submit" className="btn-primary"><Plus size={15} /> Ajouter</button>
        </form>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 xl:grid-cols-3">
        {APP_STATUSES.map((status) => {
          const list = apps.filter((a) => a.status === status.id);
          return (
            <article key={status.id} className="glass rounded-[1.75rem] p-5">
              <div className="flex items-center justify-between px-1">
                <h2 className="text-sm font-semibold text-text">{status.label}</h2>
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${status.pill}`}>{list.length}</span>
              </div>
              <div className={`mt-3 h-1 rounded-full ${status.bar} opacity-40`} />
              <ul className="mt-4 space-y-2.5">
                {list.length === 0 && <li className="glass-inset rounded-2xl py-4 text-center text-xs text-subtle">Vide</li>}
                {list.map((a) => {
                  const open = expanded === a.id;
                  const dLeft = a.deadline ? daysBetween(a.deadline, today) : null;
                  return (
                    <li key={a.id} className="glass-inset rounded-2xl p-4">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-text">{a.school}</p>
                          <p className="mt-0.5 truncate text-xs text-subtle">{a.program}</p>
                        </div>
                        <div className="flex shrink-0 items-center gap-1">
                          <button onClick={() => setStatus(a.id, -1)} disabled={a.status === "idee"} aria-label="Reculer" className="rounded-lg px-1.5 text-subtle transition-colors hover:text-text disabled:opacity-20">‹</button>
                          <button onClick={() => setStatus(a.id, 1)} disabled={a.status === "refuse"} aria-label="Avancer" className="rounded-lg px-1.5 text-subtle transition-colors hover:text-text disabled:opacity-20">›</button>
                          <button onClick={() => setApps((p) => p.filter((x) => x.id !== a.id))} aria-label="Supprimer" className="rounded-lg p-1 text-subtle transition-colors hover:bg-rose-500/10 hover:text-rose-600"><Trash2 size={12} /></button>
                        </div>
                      </div>

                      {dLeft !== null && !["admis", "refuse"].includes(a.status) && (
                        <span className={`mt-2 inline-block rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${dLeft < 0 ? "bg-rose-500/10 text-rose-600" : dLeft <= 7 ? "bg-orange-500/10 text-orange-600" : "bg-black/5 text-subtle"}`}>
                          {dLeft < 0 ? "Deadline dépassée" : `Deadline J-${dLeft} · ${a.deadline}`}
                        </span>
                      )}

                      <button onClick={() => setExpanded(open ? null : a.id)} className="mt-2.5 flex items-center gap-1 text-[11px] font-medium text-subtle transition-colors hover:text-text">
                        {open ? <ChevronUp size={12} /> : <ChevronDown size={12} />} Détails {a.materials.length > 0 && `(${a.materials.filter((m) => m.done).length}/${a.materials.length})`}
                      </button>

                      {open && (
                        <div className="mt-3 space-y-2 border-t border-white/40 pt-3">
                          <p className="text-[10px] font-semibold uppercase tracking-widest text-subtle">Pièces du dossier</p>
                          {a.materials.map((m) => (
                            <label key={m.id} className="flex cursor-pointer items-center gap-2 text-xs">
                              <input type="checkbox" checked={m.done} onChange={() =>
                                setApps((p) => p.map((x) => x.id === a.id ? { ...x, materials: x.materials.map((y) => y.id === m.id ? { ...y, done: !y.done } : y) } : x))
                              } className="h-4 w-4 rounded accent-[var(--accent)]" />
                              <span className={m.done ? "text-subtle line-through" : "text-text"}>{m.text}</span>
                            </label>
                          ))}
                          <form onSubmit={(e) => {
                            e.preventDefault();
                            const v = (matInputs[a.id] ?? "").trim();
                            if (!v) return;
                            setApps((p) => p.map((x) => x.id === a.id ? { ...x, materials: [...x.materials, { id: crypto.randomUUID(), text: v, done: false }] } : x));
                            setMatInputs({ ...matInputs, [a.id]: "" });
                          }} className="flex gap-1.5">
                            <input className="field !py-1.5 !text-xs" placeholder="Ajouter une pièce…" value={matInputs[a.id] ?? ""} onChange={(e) => setMatInputs({ ...matInputs, [a.id]: e.target.value })} />
                            <button type="submit" className="btn-ghost !px-2.5"><Plus size={12} /></button>
                          </form>
                          <textarea className="field !text-xs" rows={2} placeholder="Notes / lettre de motivation…" value={a.notes ?? ""}
                            onChange={(e) => setApps((p) => p.map((x) => x.id === a.id ? { ...x, notes: e.target.value } : x))} />
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