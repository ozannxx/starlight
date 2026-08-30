"use client";

import { useEffect, useMemo, useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  CalendarClock,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  NotebookPen,
  Plus,
  Timer,
  Trash2,
} from "lucide-react";

/* ==================== Types & constantes ==================== */

type EventType = "devoir" | "controle" | "rdv";

type SchoolEvent = {
  id: string;
  title: string;
  type: EventType;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  subject?: string;
};

const TYPE_META: Record<EventType, { label: string; icon: LucideIcon; pill: string; dot: string }> = {
  devoir: { label: "Devoir", icon: NotebookPen, pill: "bg-sky-500/10 text-sky-600", dot: "bg-sky-500" },
  controle: { label: "Contrôle", icon: ClipboardCheck, pill: "bg-rose-500/10 text-rose-600", dot: "bg-rose-500" },
  rdv: { label: "Rendez-vous", icon: CalendarClock, pill: "bg-violet-500/10 text-violet-600", dot: "bg-violet-500" },
};

const MONTHS = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];
const WEEKDAYS = ["L", "M", "M", "J", "V", "S", "D"];
const STORAGE_KEY = "starlight-agenda-events";

/* ==================== Helpers dates ==================== */

const pad = (n: number) => String(n).padStart(2, "0");
const isoDate = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const toDate = (iso: string) => new Date(`${iso}T12:00:00`); // midi = évite les décalages UTC
const addDays = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return isoDate(d);
};
const eventTarget = (ev: SchoolEvent) => new Date(`${ev.date}T${ev.time || "23:59"}`).getTime();

const formatLong = (iso: string) => {
  const s = toDate(iso).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" });
  return s.charAt(0).toUpperCase() + s.slice(1);
};

function monthCells(year: number, month: number) {
  const offset = (new Date(year, month, 1).getDay() + 6) % 7; // lundi = 0
  const start = new Date(year, month, 1 - offset);
  return Array.from({ length: 42 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });
}

/* Événements de démo (si aucun événement sauvegardé) — dates relatives à aujourd'hui */
const SEED: SchoolEvent[] = [
  { id: "seed-1", title: "DM de Maths — dérivées", type: "devoir", date: addDays(1), time: "08:00", subject: "Mathématiques" },
  { id: "seed-2", title: "Contrôle Physique — circuits", type: "controle", date: addDays(3), time: "10:00", subject: "Physique-Chimie" },
  { id: "seed-3", title: "Rendez-vous orthodontiste", type: "rdv", date: addDays(5), time: "17:30" },
  { id: "seed-4", title: "Contrôle Histoire — la Révolution", type: "controle", date: addDays(8), time: "13:00", subject: "Histoire" },
];

function relativeLabel(ev: SchoolEvent, now: number) {
  const diff = eventTarget(ev) - now;
  if (diff <= 0) return "Maintenant";
  const days = Math.floor(diff / 864e5);
  if (days === 0) return "Aujourd'hui";
  if (days === 1) return "Demain";
  return `Dans ${days} jours`;
}

/* ==================== Carte compte à rebours ==================== */

function CountdownCard({ ev, now }: { ev: SchoolEvent; now: number }) {
  const meta = TYPE_META[ev.type];
  const Icon = meta.icon;
  const diff = Math.max(0, eventTarget(ev) - now);
  const done = diff === 0;
  const units: Array<[number, string]> = [
    [Math.floor(diff / 864e5), "Jours"],
    [Math.floor((diff % 864e5) / 36e5), "Heures"],
    [Math.floor((diff % 36e5) / 6e4), "Min"],
    [Math.floor((diff % 6e4) / 1e3), "Sec"],
  ];

  return (
    <article className="glass rounded-[1.75rem] p-6">
      <div className="flex items-center justify-between gap-3">
        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${meta.pill}`}>
          <Icon size={13} /> {meta.label}
        </span>
        <span className="text-xs text-subtle">{formatLong(ev.date)} · {ev.time}</span>
      </div>
      <h3 className="mt-3 truncate text-lg font-semibold tracking-tight text-text">{ev.title}</h3>

      {done ? (
        <p className="mt-6 rounded-2xl bg-accent/10 py-4 text-center text-sm font-semibold text-accent">
          C&apos;est maintenant 🎉
        </p>
      ) : (
        <div className="mt-4 grid grid-cols-4 gap-2">
          {units.map(([value, label]) => (
            <div key={label} className="glass-inset rounded-2xl py-3 text-center">
              <p className="text-2xl font-bold tabular-nums leading-none text-text">{pad(value)}</p>
              <p className="mt-1.5 text-[10px] uppercase tracking-widest text-subtle">{label}</p>
            </div>
          ))}
        </div>
      )}
    </article>
  );
}

/* ==================== Page Agenda ==================== */

export default function AgendaPage() {
  const [events, setEvents] = useState<SchoolEvent[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [now, setNow] = useState<number | null>(null);
  const [todayIso, setTodayIso] = useState("");
  const [view, setView] = useState<{ y: number; m: number } | null>(null);
  const [selected, setSelected] = useState("");
  const [form, setForm] = useState({
    title: "",
    type: "devoir" as EventType,
    date: "",
    time: "08:00",
    subject: "",
  });

  // Montage : horloge + date du jour (évite les écarts serveur/client)
  useEffect(() => {
    const t = new Date();
    setTodayIso(isoDate(t));
    setView({ y: t.getFullYear(), m: t.getMonth() });
    setSelected(isoDate(t));
    setForm((f) => ({ ...f, date: isoDate(t) }));
    setNow(Date.now());
    setMounted(true);
    const tick = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(tick);
  }, []);

  // Chargement (localStorage ou événements de démo)
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      setEvents(raw ? (JSON.parse(raw) as SchoolEvent[]) : SEED);
    } catch {
      setEvents(SEED);
    }
    setLoaded(true);
  }, []);

  // Sauvegarde
  useEffect(() => {
    if (!loaded) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
  }, [events, loaded]);

  function addEvent(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!form.title.trim() || !form.date) return;
    setEvents((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        title: form.title.trim(),
        type: form.type,
        date: form.date,
        time: form.time || "08:00",
        subject: form.subject.trim() || undefined,
      },
    ]);
    setForm((f) => ({ ...f, title: "", subject: "" }));
    setSelected(form.date);
  }

  function removeEvent(id: string) {
    setEvents((prev) => prev.filter((ev) => ev.id !== id));
  }

  function shiftMonth(delta: number) {
    setView((v) => {
      if (!v) return v;
      const m = v.m + delta;
      if (m < 0) return { y: v.y - 1, m: 11 };
      if (m > 11) return { y: v.y + 1, m: 0 };
      return { ...v, m };
    });
  }

  const byDay = useMemo(() => {
    const map = new Map<string, SchoolEvent[]>();
    for (const ev of events) {
      const list = map.get(ev.date) ?? [];
      list.push(ev);
      map.set(ev.date, list);
    }
    return map;
  }, [events]);

  const upcoming = useMemo(() => {
    if (now === null) return [];
    return events
      .filter((ev) => eventTarget(ev) >= now)
      .sort((a, b) => eventTarget(a) - eventTarget(b));
  }, [events, now]);

  const cells = view ? monthCells(view.y, view.m) : [];
  const selectedEvents = selected ? byDay.get(selected) ?? [] : [];

  const inputClass =
    "rounded-xl border border-white/60 bg-white/50 px-3.5 py-2.5 text-sm text-text placeholder:text-subtle/70 focus:outline-none focus:ring-2 focus:ring-accent/40";

  return (
    <>
      {/* ============ CALENDRIER + FORMULAIRE ============ */}
      <section className="grid grid-cols-1 gap-4 sm:gap-5 lg:grid-cols-5">
        {/* Calendrier */}
        <article className="glass rounded-[1.75rem] p-6 lg:col-span-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="glass-inset flex h-10 w-10 items-center justify-center rounded-2xl text-accent">
                <CalendarDays size={18} />
              </span>
              <h2 className="font-semibold tracking-tight text-text">
                {view ? `${MONTHS[view.m]} ${view.y}` : "—"}
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  const t = new Date();
                  setView({ y: t.getFullYear(), m: t.getMonth() });
                  setSelected(todayIso);
                }}
                className="glass-inset glass-hover rounded-full px-3.5 py-1.5 text-xs font-medium text-text"
              >
                Aujourd&apos;hui
              </button>
              <div className="glass-inset flex rounded-full p-1">
                <button
                  onClick={() => shiftMonth(-1)}
                  aria-label="Mois précédent"
                  className="flex h-7 w-7 items-center justify-center rounded-full text-subtle transition-colors hover:text-text"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  onClick={() => shiftMonth(1)}
                  aria-label="Mois suivant"
                  className="flex h-7 w-7 items-center justify-center rounded-full text-subtle transition-colors hover:text-text"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* Jours de la semaine */}
          <div className="mt-5 grid grid-cols-7 gap-1.5 text-center">
            {WEEKDAYS.map((d, i) => (
              <span key={i} className="py-1 text-[11px] font-semibold uppercase tracking-widest text-subtle">
                {d}
              </span>
            ))}
          </div>

          {/* Grille des jours */}
          {mounted ? (
            <div className="grid grid-cols-7 gap-1.5">
              {cells.map((d) => {
                const iso = isoDate(d);
                const inMonth = view ? d.getMonth() === view.m : true;
                const dayEvents = byDay.get(iso) ?? [];
                const isToday = iso === todayIso;
                const isSelected = iso === selected;
                return (
                  <button
                    key={iso}
                    onClick={() => setSelected(iso)}
                    className={`relative flex aspect-square flex-col items-center justify-center rounded-2xl text-sm transition-all duration-150 ${
                      isSelected
                        ? "scale-105 bg-accent font-semibold text-white shadow-lg shadow-accent/30"
                        : isToday
                          ? "font-bold text-text ring-2 ring-accent/60 hover:bg-white/60"
                          : inMonth
                            ? "text-text hover:bg-white/60"
                            : "text-subtle/40 hover:bg-white/30"
                    }`}
                  >
                    <span className="tabular-nums">{d.getDate()}</span>
                    {dayEvents.length > 0 && (
                      <span className="absolute bottom-1.5 flex gap-1">
                        {dayEvents.slice(0, 3).map((ev) => (
                          <span
                            key={ev.id}
                            className={`h-1.5 w-1.5 rounded-full ${isSelected ? "bg-white" : TYPE_META[ev.type].dot}`}
                          />
                        ))}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="mt-2 h-[380px] animate-pulse rounded-2xl bg-white/30" />
          )}

          {/* Légende */}
          <div className="mt-4 flex flex-wrap items-center gap-4 text-[11px] text-subtle">
            {(Object.keys(TYPE_META) as EventType[]).map((t) => (
              <span key={t} className="flex items-center gap-1.5">
                <span className={`h-2 w-2 rounded-full ${TYPE_META[t].dot}`} /> {TYPE_META[t].label}
              </span>
            ))}
          </div>
        </article>

        {/* Colonne droite : formulaire + jour sélectionné */}
        <div className="flex flex-col gap-4 sm:gap-5 lg:col-span-2">
          {/* Ajouter un événement */}
          <article className="glass rounded-[1.75rem] p-6">
            <div className="flex items-center gap-2.5">
              <span className="glass-inset flex h-10 w-10 items-center justify-center rounded-2xl text-accent">
                <Plus size={18} />
              </span>
              <h2 className="font-semibold tracking-tight text-text">Ajouter un événement</h2>
            </div>

            <form onSubmit={addEvent} className="mt-5 space-y-4">
              <input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Titre (ex : Contrôle de Maths)"
                className={`w-full ${inputClass}`}
              />

              {/* Type */}
              <div className="grid grid-cols-3 gap-2">
                {(Object.keys(TYPE_META) as EventType[]).map((t) => {
                  const meta = TYPE_META[t];
                  const Icon = meta.icon;
                  const active = form.type === t;
                  return (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setForm({ ...form, type: t })}
                      className={`flex flex-col items-center gap-1.5 rounded-xl py-2.5 text-[11px] font-medium transition-all duration-200 ${
                        active
                          ? "bg-accent text-white shadow-lg shadow-accent/30"
                          : "glass-inset text-subtle hover:text-text"
                      }`}
                    >
                      <Icon size={16} />
                      {meta.label}
                    </button>
                  );
                })}
              </div>

              {/* Date + heure */}
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  className={inputClass}
                />
                <input
                  type="time"
                  value={form.time}
                  onChange={(e) => setForm({ ...form, time: e.target.value })}
                  className={inputClass}
                />
              </div>

              <input
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
                placeholder="Matière (optionnel)"
                className={`w-full ${inputClass}`}
              />

              <button
                type="submit"
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-accent py-3 text-sm font-semibold text-white shadow-lg shadow-accent/30 transition-all duration-300 hover:-translate-y-0.5 hover:brightness-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
              >
                <Plus size={16} /> Ajouter à l&apos;agenda
              </button>
            </form>
          </article>

          {/* Jour sélectionné */}
          <article className="glass rounded-[1.75rem] p-6">
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-semibold tracking-tight text-text">
                {selected ? formatLong(selected) : "—"}
              </h2>
              {selectedEvents.length > 0 && (
                <span className="rounded-full bg-accent/15 px-2 py-0.5 text-xs font-semibold text-accent">
                  {selectedEvents.length}
                </span>
              )}
            </div>

            {selectedEvents.length === 0 ? (
              <p className="mt-4 rounded-2xl bg-white/30 py-6 text-center text-sm text-subtle">
                Aucun événement ce jour-là
              </p>
            ) : (
              <ul className="mt-4 space-y-2.5">
                {selectedEvents.map((ev) => {
                  const meta = TYPE_META[ev.type];
                  const Icon = meta.icon;
                  return (
                    <li key={ev.id} className="glass-inset flex items-center gap-3 rounded-2xl p-3.5">
                      <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${meta.pill}`}>
                        <Icon size={16} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium text-text">{ev.title}</span>
                        <span className="block text-xs text-subtle">
                          {meta.label}
                          {ev.subject ? ` · ${ev.subject}` : ""} · {ev.time}
                        </span>
                      </span>
                      <button
                        onClick={() => removeEvent(ev.id)}
                        aria-label="Supprimer"
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-subtle transition-colors hover:bg-rose-500/10 hover:text-rose-600"
                      >
                        <Trash2 size={15} />
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </article>
        </div>
      </section>

      {/* ============ COMPTES À REBOURS ============ */}
      <section>
        <div className="flex items-center gap-2.5">
          <span className="glass-inset flex h-10 w-10 items-center justify-center rounded-2xl text-accent">
            <Timer size={18} />
          </span>
          <h2 className="font-semibold tracking-tight text-text">Comptes à rebours</h2>
        </div>

        {now !== null && upcoming.length > 0 ? (
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
            {upcoming.slice(0, 3).map((ev) => (
              <CountdownCard key={ev.id} ev={ev} now={now} />
            ))}
          </div>
        ) : (
          <p className="glass mt-4 rounded-[1.75rem] py-8 text-center text-sm text-subtle">
            Aucun événement à venir — ajoute ton premier ✨
          </p>
        )}
      </section>

      {/* ============ TOUT L'AGENDA À VENIR ============ */}
      <section className="glass rounded-[1.75rem] p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="glass-inset flex h-10 w-10 items-center justify-center rounded-2xl text-accent">
              <CalendarClock size={18} />
            </span>
            <h2 className="font-semibold tracking-tight text-text">Tout l&apos;agenda à venir</h2>
          </div>
          <span className="text-xs text-subtle">
            {upcoming.length} événement{upcoming.length > 1 ? "s" : ""}
          </span>
        </div>

        {upcoming.length === 0 ? (
          <p className="mt-4 rounded-2xl bg-white/30 py-6 text-center text-sm text-subtle">
            Rien de prévu pour le moment
          </p>
        ) : (
          <ul className="mt-5 space-y-1">
            {upcoming.map((ev) => {
              const meta = TYPE_META[ev.type];
              const Icon = meta.icon;
              return (
                <li key={ev.id}>
                  <div className="flex items-center gap-3.5 rounded-2xl p-3 transition-colors hover:bg-white/50">
                    <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${meta.pill}`}>
                      <Icon size={17} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-text">{ev.title}</span>
                      <span className="block text-xs text-subtle">
                        {meta.label}
                        {ev.subject ? ` · ${ev.subject}` : ""} · {formatLong(ev.date)} · {ev.time}
                      </span>
                    </span>
                    {now !== null && (
                      <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-medium ${meta.pill}`}>
                        {relativeLabel(ev, now)}
                      </span>
                    )}
                    <button
                      onClick={() => removeEvent(ev.id)}
                      aria-label="Supprimer"
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-subtle transition-colors hover:bg-rose-500/10 hover:text-rose-600"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </>
  );
}