"use client";

import { useState } from "react";
import { FileText, Plus, Printer, Trash2, X } from "lucide-react";
import { CV_KEY, SEED_CV, useLocalState, type CVData } from "@/lib/storage";

export default function CVPage() {
  const [cv, setCV] = useLocalState<CVData>(CV_KEY, SEED_CV);
  const [skill, setSkill] = useState("");
  const [lang, setLang] = useState("");

  const set = (patch: Partial<CVData>) => setCV({ ...cv, ...patch });

  return (
    <>
      <section className="grid grid-cols-1 gap-4 sm:gap-5 lg:grid-cols-2">
        {/* ===== Éditeur ===== */}
        <div className="flex flex-col gap-4 sm:gap-5">
          <section className="glass rounded-[1.75rem] p-6">
            <h2 className="font-semibold tracking-tight text-text">Informations</h2>
            <div className="mt-4 space-y-2">
              <input className="field" placeholder="Nom complet" value={cv.fullName} onChange={(e) => set({ fullName: e.target.value })} />
              <div className="grid grid-cols-2 gap-2">
                <input className="field" placeholder="Email" value={cv.email} onChange={(e) => set({ email: e.target.value })} />
                <input className="field" placeholder="Téléphone" value={cv.phone} onChange={(e) => set({ phone: e.target.value })} />
              </div>
              <textarea className="field" rows={2} placeholder="Pitch : qui es-tu en 2 phrases ?" value={cv.pitch} onChange={(e) => set({ pitch: e.target.value })} />
            </div>
          </section>

          <section className="glass rounded-[1.75rem] p-6">
            <h2 className="font-semibold tracking-tight text-text">Formation</h2>
            <div className="mt-4 space-y-2">
              {cv.education.map((ed) => (
                <div key={ed.id} className="glass-inset grid grid-cols-[1fr_1fr_6rem_2rem] gap-2 rounded-2xl p-3">
                  <input className="field !py-1.5 !text-xs" placeholder="Diplôme" value={ed.diploma} onChange={(e) => set({ education: cv.education.map((x) => x.id === ed.id ? { ...x, diploma: e.target.value } : x) })} />
                  <input className="field !py-1.5 !text-xs" placeholder="Établissement" value={ed.school} onChange={(e) => set({ education: cv.education.map((x) => x.id === ed.id ? { ...x, school: e.target.value } : x) })} />
                  <input className="field !py-1.5 !text-xs" placeholder="Années" value={ed.years} onChange={(e) => set({ education: cv.education.map((x) => x.id === ed.id ? { ...x, years: e.target.value } : x) })} />
                  <button onClick={() => set({ education: cv.education.filter((x) => x.id !== ed.id) })} aria-label="Supprimer" className="rounded-xl text-subtle transition-colors hover:text-rose-600"><Trash2 size={14} /></button>
                </div>
              ))}
              <button onClick={() => set({ education: [...cv.education, { id: crypto.randomUUID(), diploma: "", school: "", years: "" }] })} className="btn-ghost !w-full"><Plus size={14} /> Ajouter une formation</button>
            </div>
          </section>

          <section className="glass rounded-[1.75rem] p-6">
            <h2 className="font-semibold tracking-tight text-text">Compétences & langues</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {cv.skills.map((s) => (
                <span key={s} className="flex items-center gap-1.5 rounded-full bg-accent/10 px-3 py-1.5 text-xs font-medium text-accent">
                  {s}<button onClick={() => set({ skills: cv.skills.filter((x) => x !== s) })} aria-label="Retirer"><X size={12} /></button>
                </span>
              ))}
            </div>
            <form onSubmit={(e) => { e.preventDefault(); if (skill.trim()) { set({ skills: [...cv.skills, skill.trim()] }); setSkill(""); } }} className="mt-3 flex gap-2">
              <input className="field" placeholder="Ajouter une compétence…" value={skill} onChange={(e) => setSkill(e.target.value)} />
              <button type="submit" className="btn-ghost !px-4"><Plus size={14} /></button>
            </form>
            <div className="mt-4 flex flex-wrap gap-2">
              {cv.languages.map((l) => (
                <span key={l} className="flex items-center gap-1.5 rounded-full bg-sky-500/10 px-3 py-1.5 text-xs font-medium text-sky-600">
                  {l}<button onClick={() => set({ languages: cv.languages.filter((x) => x !== l) })} aria-label="Retirer"><X size={12} /></button>
                </span>
              ))}
            </div>
            <form onSubmit={(e) => { e.preventDefault(); if (lang.trim()) { set({ languages: [...cv.languages, lang.trim()] }); setLang(""); } }} className="mt-3 flex gap-2">
              <input className="field" placeholder="Ajouter une langue…" value={lang} onChange={(e) => setLang(e.target.value)} />
              <button type="submit" className="btn-ghost !px-4"><Plus size={14} /></button>
            </form>
          </section>

          <section className="glass rounded-[1.75rem] p-6">
            <h2 className="font-semibold tracking-tight text-text">Projets</h2>
            <div className="mt-4 space-y-2">
              {cv.projects.map((p) => (
                <div key={p.id} className="glass-inset space-y-2 rounded-2xl p-3">
                  <div className="flex gap-2">
                    <input className="field !py-1.5 !text-xs" placeholder="Titre du projet" value={p.title} onChange={(e) => set({ projects: cv.projects.map((x) => x.id === p.id ? { ...x, title: e.target.value } : x) })} />
                    <button onClick={() => set({ projects: cv.projects.filter((x) => x.id !== p.id) })} aria-label="Supprimer" className="rounded-xl px-2 text-subtle transition-colors hover:text-rose-600"><Trash2 size={14} /></button>
                  </div>
                  <textarea className="field !py-1.5 !text-xs" rows={2} placeholder="Description" value={p.desc} onChange={(e) => set({ projects: cv.projects.map((x) => x.id === p.id ? { ...x, desc: e.target.value } : x) })} />
                </div>
              ))}
              <button onClick={() => set({ projects: [...cv.projects, { id: crypto.randomUUID(), title: "", desc: "" }] })} className="btn-ghost !w-full"><Plus size={14} /> Ajouter un projet</button>
            </div>
          </section>
        </div>

        {/* ===== Aperçu ===== */}
        <div className="lg:sticky lg:top-4 lg:self-start">
          <div className="glass print-area rounded-[1.75rem] p-8">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-text">{cv.fullName || "Ton nom"}</h1>
                <p className="mt-1 text-sm text-subtle">{[cv.email, cv.phone].filter(Boolean).join(" · ")}</p>
              </div>
              <span className="icon-chip !h-12 !w-12"><FileText size={22} /></span>
            </div>
            {cv.pitch && <p className="mt-4 text-sm leading-relaxed text-text">{cv.pitch}</p>}

            {cv.education.length > 0 && (
              <div className="mt-6">
                <h2 className="text-xs font-bold uppercase tracking-widest text-accent">Formation</h2>
                <ul className="mt-2 space-y-2">
                  {cv.education.map((ed) => (
                    <li key={ed.id} className="flex items-baseline justify-between gap-3 text-sm">
                      <span className="font-medium text-text">{ed.diploma}{ed.school ? ` — ${ed.school}` : ""}</span>
                      <span className="shrink-0 text-xs text-subtle">{ed.years}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {cv.skills.length > 0 && (
              <div className="mt-6">
                <h2 className="text-xs font-bold uppercase tracking-widest text-accent">Compétences</h2>
                <p className="mt-2 text-sm leading-relaxed text-text">{cv.skills.join(" · ")}</p>
              </div>
            )}
            {cv.languages.length > 0 && (
              <div className="mt-4">
                <h2 className="text-xs font-bold uppercase tracking-widest text-accent">Langues</h2>
                <p className="mt-2 text-sm text-text">{cv.languages.join(" · ")}</p>
              </div>
            )}
            {cv.projects.length > 0 && (
              <div className="mt-6">
                <h2 className="text-xs font-bold uppercase tracking-widest text-accent">Projets</h2>
                <ul className="mt-2 space-y-2">
                  {cv.projects.filter((p) => p.title).map((p) => (
                    <li key={p.id}>
                      <p className="text-sm font-medium text-text">{p.title}</p>
                      {p.desc && <p className="mt-0.5 text-xs leading-relaxed text-subtle">{p.desc}</p>}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          <button onClick={() => window.print()} className="btn-primary mt-4"><Printer size={16} /> Exporter en PDF (imprimer)</button>
        </div>
      </section>
    </>
  );
}