"use client";

import { useState } from "react";
import Link from "next/link";
import {
  GraduationCap,
  TrendingUp,
  CalendarCheck,
  Trophy,
  Eye,
  EyeOff,
  NotebookPen,
  CalendarDays,
  Calculator,
  FlaskConical,
  Languages,
  Landmark,
  Leaf,
} from "lucide-react";

/* ============================================================
   DONNÉES PLACEHOLDER — remplace ce bloc par tes vraies données
   ============================================================ */

const GRADES = [14, 16, 12, 17, 15, 18, 13, 15.5, 16, 11, 17, 15, 18, 14];

const HOMEWORK = [
  { id: 1, title: "DM Maths — dérivées", detail: "À rendre demain · M. Bernard", status: "Urgent" },
  { id: 2, title: "Exposé Histoire — la Révolution", detail: "Vendredi · M. Dubois", status: "À faire" },
  { id: 3, title: "TP Physique — circuits électriques", detail: "Rendu le 10 mars · Mme Laurent", status: "Rendu" },
];

const CLASSES = [
  { id: 1, subject: "Mathématiques", room: "Salle 204", teacher: "M. Bernard", time: "08:00", icon: Calculator },
  { id: 2, subject: "Physique-Chimie", room: "Labo 3", teacher: "Mme Laurent", time: "09:00", icon: FlaskConical },
  { id: 3, subject: "Anglais", room: "Salle 112", teacher: "Mme Carter", time: "10:00", icon: Languages },
  { id: 4, subject: "Histoire-Géographie", room: "Salle 305", teacher: "M. Dubois", time: "13:00", icon: Landmark },
  { id: 5, subject: "SVT", room: "Labo 1", teacher: "Mme Petit", time: "15:00", icon: Leaf },
];

/* ============================================================ */

function StatusPill({ status }: { status: string }) {
  const styles: Record<string, string> = {
    Urgent: "bg-orange-500/10 text-orange-600",
    "À faire": "bg-sky-500/10 text-sky-600",
    Rendu: "bg-emerald-500/10 text-emerald-600",
  };
  return (
    <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-medium ${styles[status] ?? "bg-black/5 text-subtle"}`}>
      {status}
    </span>
  );
}

function barColor(grade: number) {
  if (grade >= 15) return "bg-emerald-400/70 hover:bg-emerald-400";
  if (grade >= 10) return "bg-accent/70 hover:bg-accent";
  return "bg-rose-400/70 hover:bg-rose-400";
}

export default function Dashboard() {
  const [cardRevealed, setCardRevealed] = useState(false);
  const [term, setTerm] = useState("T1");

  return (
    <>
      {/* ==================== LIGNE KPI ==================== */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-5">
        <article className="glass glass-hover rounded-[1.75rem] p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-subtle">Moyenne générale</p>
              <p className="mt-2 text-[2rem] font-semibold leading-none tracking-tight text-text tabular-nums">
                15,4<span className="text-lg text-subtle">/20</span>
              </p>
            </div>
            <span className="glass-inset flex h-11 w-11 items-center justify-center rounded-2xl text-accent">
              <GraduationCap size={20} />
            </span>
          </div>
          <span className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-600">
            <TrendingUp size={13} /> +0,6 vs dernier trimestre
          </span>
        </article>

        <article className="glass glass-hover rounded-[1.75rem] p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-subtle">Assiduité</p>
              <p className="mt-2 text-[2rem] font-semibold leading-none tracking-tight text-text tabular-nums">
                96<span className="text-lg text-subtle">%</span>
              </p>
            </div>
            <span className="glass-inset flex h-11 w-11 items-center justify-center rounded-2xl text-accent">
              <CalendarCheck size={20} />
            </span>
          </div>
          <span className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-sky-500/10 px-2.5 py-1 text-xs font-medium text-sky-600">
            <CalendarCheck size={13} /> 2 absences ce mois
          </span>
        </article>

        <article className="glass glass-hover rounded-[1.75rem] p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-subtle">Classement</p>
              <p className="mt-2 text-[2rem] font-semibold leading-none tracking-tight text-text tabular-nums">
                3<span className="text-lg text-subtle">e / 31</span>
              </p>
            </div>
            <span className="glass-inset flex h-11 w-11 items-center justify-center rounded-2xl text-accent">
              <Trophy size={20} />
            </span>
          </div>
          <span className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-600">
            <TrendingUp size={13} /> +2 places depuis le T2
          </span>
        </article>
      </section>

      {/* ==================== CARTE ÉTUDIANTE + NOTES ==================== */}
      <section className="grid grid-cols-1 gap-4 sm:gap-5 lg:grid-cols-5">
        <article className="glass rounded-[1.75rem] p-6 lg:col-span-2">
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
                  <p className="text-[9px] uppercase tracking-widest opacity-70">Valide jusqu'au</p>
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

        <article className="glass rounded-[1.75rem] p-6 lg:col-span-3">
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
            {GRADES.map((grade, i) => (
              <div key={i} className="flex h-full flex-1 items-end" title={`${grade}/20`}>
                <div
                  className={`w-full rounded-full transition-all duration-300 ${barColor(grade)}`}
                  style={{ height: `${(grade / 20) * 100}%` }}
                />
              </div>
            ))}
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-4 text-[11px] text-subtle">
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-emerald-400" /> ≥ 15</span>
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-accent" /> 10 – 14</span>
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-rose-400" /> &lt; 10</span>
          </div>
        </article>
      </section>

      {/* ==================== DEVOIRS + COURS DU JOUR ==================== */}
      <section className="grid grid-cols-1 gap-4 sm:gap-5 lg:grid-cols-2">
        <article className="glass rounded-[1.75rem] p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="glass-inset flex h-10 w-10 items-center justify-center rounded-2xl text-accent">
                <NotebookPen size={18} />
              </span>
              <h2 className="font-semibold tracking-tight text-text">Devoirs à venir</h2>
              <span className="rounded-full bg-accent/15 px-2 py-0.5 text-xs font-semibold text-accent">
                {HOMEWORK.length}
              </span>
            </div>
            <Link
              href="/agenda"
              className="text-xs font-medium text-subtle transition-colors hover:text-text"
            >
              Voir tout
            </Link>
          </div>

          <ul className="mt-5 space-y-2.5">
            {HOMEWORK.map((h) => (
              <li key={h.id}>
                <button className="glass-inset glass-hover flex w-full items-center justify-between gap-3 rounded-2xl p-4 text-left">
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium text-text">{h.title}</span>
                    <span className="mt-0.5 block text-xs text-subtle">{h.detail}</span>
                  </span>
                  <StatusPill status={h.status} />
                </button>
              </li>
            ))}
          </ul>
        </article>

        <article className="glass rounded-[1.75rem] p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="glass-inset flex h-10 w-10 items-center justify-center rounded-2xl text-accent">
                <CalendarDays size={18} />
              </span>
              <h2 className="font-semibold tracking-tight text-text">Cours du jour</h2>
            </div>
            <button className="text-xs font-medium text-subtle transition-colors hover:text-text">
              Voir tout
            </button>
          </div>

          <ul className="mt-5 space-y-1">
            {CLASSES.map(({ id, subject, room, teacher, time, icon: Icon }) => (
              <li key={id}>
                <button className="flex w-full items-center gap-3.5 rounded-2xl p-3 text-left transition-colors hover:bg-white/50">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent/10 text-accent">
                    <Icon size={17} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-text">{subject}</span>
                    <span className="block text-xs text-subtle">{room} · {teacher}</span>
                  </span>
                  <span className="text-sm font-semibold tabular-nums text-text">{time}</span>
                </button>
              </li>
            ))}
          </ul>
        </article>
      </section>
    </>
  );
}