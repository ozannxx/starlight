"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { SCHEDULE_KEY, SEED_SCHEDULE, useLocalState, minutesOf, type Course } from "@/lib/storage";

const DAYS = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi"];
const START_H = 8, END_H = 19, TOTAL_MIN = (END_H - START_H) * 60;

export default function SchedulePage() {
  const [courses, setCourses] = useLocalState<Course[]>(SCHEDULE_KEY, SEED_SCHEDULE);
  const [week, setWeek] = useState<"A" | "B">("A");
  const [form, setForm] = useState({ day: "1", start: "08:00", end: "09:00", subject: "", room: "", teacher: "", week: "both" as Course["week"] });

  const add = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.subject.trim() || minutesOf(form.end) <= minutesOf(form.start)) return;
    setCourses((p) => [...p, { id: crypto.randomUUID(), day: Number(form.day), start: form.start, end: form.end, subject: form.subject.trim(), room: form.room.trim() || undefined, teacher: form.teacher.trim() || undefined, week: form.week }]);
    setForm({ ...form, subject: "", room: "", teacher: "" });
  };

  return (
    <>
      <section className="glass rounded-[1.75rem] p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-semibold tracking-tight text-text">Emploi du temps</h2>
          <div className="glass-inset flex rounded-full p-1">
            {(["A", "B"] as const).map((w) => (
              <button key={w} onClick={() => setWeek(w)} className={`rounded-full px-4 py-1.5 text-xs font-medium transition-all ${week === w ? "bg-accent text-white shadow" : "text-subtle hover:text-text"}`}>Semaine {w}</button>
            ))}
          </div>
        </div>

        <form onSubmit={add} className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-8">
          <select className="field" value={form.day} onChange={(e) => setForm({ ...form, day: e.target.value })}>
            {DAYS.map((d, i) => <option key={d} value={i + 1}>{d}</option>)}
          </select>
          <input className="field" type="time" value={form.start} onChange={(e) => setForm({ ...form, start: e.target.value })} />
          <input className="field" type="time" value={form.end} onChange={(e) => setForm({ ...form, end: e.target.value })} />
          <input className="field" placeholder="Matière" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} />
          <input className="field" placeholder="Salle" value={form.room} onChange={(e) => setForm({ ...form, room: e.target.value })} />
          <input className="field" placeholder="Prof" value={form.teacher} onChange={(e) => setForm({ ...form, teacher: e.target.value })} />
          <select className="field" value={form.week} onChange={(e) => setForm({ ...form, week: e.target.value as Course["week"] })}>
            <option value="both">Sem. A+B</option><option value="A">Sem. A</option><option value="B">Sem. B</option>
          </select>
          <button type="submit" className="btn-primary"><Plus size={15} /> Ajouter</button>
        </form>
      </section>

      <section className="glass rounded-[1.75rem] p-6">
        <div className="grid grid-cols-[3rem_repeat(5,1fr)] gap-1.5">
          <div />
          {DAYS.map((d) => <p key={d} className="pb-2 text-center text-xs font-semibold uppercase tracking-widest text-subtle">{d}</p>)}
          <div className="relative row-span-11">
            {Array.from({ length: END_H - START_H }, (_, i) => (
              <p key={i} className="absolute w-full pr-1 text-right text-[10px] text-subtle" style={{ top: `${(i / (END_H - START_H)) * 100}%` }}>{START_H + i}h</p>
            ))}
          </div>
          {DAYS.map((_, dayIdx) => (
            <div key={dayIdx} className="relative row-span-11 min-h-[560px] rounded-2xl bg-white/25 transition-colors hover:bg-white/40">
              {courses.filter((c) => c.day === dayIdx + 1 && (c.week === "both" || c.week === week)).map((c) => {
                const top = ((minutesOf(c.start) - START_H * 60) / TOTAL_MIN) * 100;
                const height = ((minutesOf(c.end) - minutesOf(c.start)) / TOTAL_MIN) * 100;
                return (
                  <div key={c.id} className="group absolute inset-x-1 overflow-hidden rounded-xl bg-accent/90 p-2 text-white shadow-lg shadow-accent/25"
                    style={{ top: `${top}%`, height: `calc(${height}% - 4px)` }}>
                    <p className="truncate text-[11px] font-semibold leading-tight">{c.subject}</p>
                    <p className="mt-0.5 truncate text-[10px] opacity-90">{c.start}–{c.end}{c.room ? ` · ${c.room}` : ""}</p>
                    {height > 8 && c.teacher && <p className="mt-0.5 truncate text-[10px] opacity-75">{c.teacher}</p>}
                    <button onClick={() => setCourses((p) => p.filter((x) => x.id !== c.id))} aria-label="Supprimer"
                      className="absolute right-1 top-1 hidden rounded-lg bg-black/20 p-1 group-hover:block hover:bg-rose-500"><Trash2 size={11} /></button>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </section>
    </>
  );
}