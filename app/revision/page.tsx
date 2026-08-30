"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Brain, Plus, Wand2 } from "lucide-react";
import {
  AGENDA_KEY, FLASHCARDS_KEY, REVISIONS_KEY, SEED_AGENDA,
  useLocalState, todayISO, addDays, daysBetween, formatLong,
  type AgendaEvent, type Flashcard, type RevisionPlan,
} from "@/lib/storage";
import { summarize, makeCloze } from "@/lib/intelligence";

const OFFSETS: [number, string][] = [
  [-7, "Relire le cours + fiches"],
  [-3, "Exercices ciblés"],
  [-1, "Entraînement en conditions réelles"],
  [0, "Relecture rapide (veille du jour J)"],
];

const shiftISO = (iso: string, days: number) => {
  const d = new Date(`${iso}T12:00:00`);
  d.setDate(d.getDate() + days);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

export default function RevisionPage() {
  const [agenda] = useLocalState<AgendaEvent[]>(AGENDA_KEY, SEED_AGENDA);
  const [cards, setCards] = useLocalState<Flashcard[]>(FLASHCARDS_KEY, []);
  const [plans, setPlans] = useLocalState<RevisionPlan>(REVISIONS_KEY, {});
  const today = todayISO();

  const exams = useMemo(
    () => agenda.filter((e) => (e.type === "controle" || e.type === "oral") && e.date >= today && daysBetween(e.date, today) <= 45).sort((a, b) => a.date.localeCompare(b.date)),
    [agenda, today]
  );

  // ⭐ Génération automatique des rétroplannings
  useEffect(() => {
    const missing = exams.filter((e) => !plans[e.id]);
    if (!missing.length) return;
    setPlans((p) => {
      const next = { ...p };
      missing.forEach((e) => {
        next[e.id] = { eventId: e.id, title: e.title, examDate: e.date, sessions: OFFSETS.map(([off, label]) => ({ id: crypto.randomUUID(), date: shiftISO(e.date, off), label, done: false })) };
      });
      return next;
    });
  }, [exams, plans]); // eslint-disable-line react-hooks/exhaustive-deps

  const toggleSession = (examId: string, sid: string) =>
    setPlans((p) => ({ ...p, [examId]: { ...p[examId], sessions: p[examId].sessions.map((s) => (s.id === sid ? { ...s, done: !s.done } : s)) } }));

  /* ===== Flashcards ===== */
  const decks = useMemo(() => [...new Set(cards.map((c) => c.deck))], [cards]);
  const [deck, setDeck] = useState("");
  const [nc, setNc] = useState({ deck: "", front: "", back: "", image: "" });
  const [queue, setQueue] = useState<string[]>([]);
  const [flipped, setFlipped] = useState(false);
  const [reviewed, setReviewed] = useState(0);
  const current = cards.find((c) => c.id === queue[0]);
  const dueCards = cards.filter((c) => c.due <= today && (!deck || c.deck === deck));

  const imgRef = useRef<HTMLInputElement>(null);
  const onImg = (f?: File) => {
    if (!f) return;
    if (f.size > 150_000) { alert("Image trop lourde (max 150 Ko)"); return; }
    const r = new FileReader();
    r.onload = () => setNc((p) => ({ ...p, image: String(r.result) }));
    r.readAsDataURL(f);
  };

  const grade = (g: "again" | "hard" | "good" | "easy") => {
    if (!current) return;
    const iv = g === "again" ? 0
      : g === "hard" ? Math.max(1, Math.round(current.interval * 1.2))
      : g === "good" ? Math.max(1, current.interval * 2 || 1)
      : Math.max(3, Math.round(current.interval * 2.5));
    setCards((p) => p.map((c) => (c.id === current.id ? { ...c, interval: iv, due: addDays(Math.max(0, iv)) } : c)));
    setQueue((q) => q.slice(1));
    setFlipped(false);
    setReviewed((r) => r + 1);
  };

  /* ===== Résumé ===== */
  const [src, setSrc] = useState("");
  const [out, setOut] = useState<{ sentences: string[]; quiz: { q: string; a: string }[] } | null>(null);
  const [revealed, setRevealed] = useState<Record<number, boolean>>({});

  return (
    <>
      {/* ⭐ Planificateur */}
      <section>
        <div className="flex items-center gap-2.5">
          <span className="icon-chip"><Brain size={18} /></span>
          <h2 className="font-semibold tracking-tight text-text">Planificateur de révisions</h2>
        </div>
        <p className="mt-1 text-xs text-subtle">Chaque contrôle ou oral ajouté à l&apos;agenda génère automatiquement son rétroplanning (J-7, J-3, J-1, veille).</p>
        {exams.length === 0 ? (
          <p className="glass mt-4 rounded-[1.75rem] py-8 text-center text-sm text-subtle">Aucun contrôle dans les 45 prochains jours — ajoute-en un dans l&apos;agenda ✨</p>
        ) : (
          <div className="mt-4 grid grid-cols-1 gap-4 sm:gap-5 lg:grid-cols-2">
            {exams.map((e) => {
              const plan = plans[e.id];
              if (!plan) return null;
              const done = plan.sessions.filter((s) => s.done).length;
              return (
                <article key={e.id} className="glass rounded-[1.75rem] p-6">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="truncate text-sm font-semibold text-text">{e.title}</h3>
                      <p className="mt-0.5 text-xs text-subtle">{formatLong(e.date)} · {e.time}</p>
                    </div>
                    <span className="shrink-0 rounded-full bg-rose-500/10 px-3 py-1 text-xs font-bold text-rose-600">J-{daysBetween(e.date, today)}</span>
                  </div>
                  <ul className="mt-4 space-y-1.5">
                    {plan.sessions.map((s) => {
                      const past = s.date < today;
                      return (
                        <li key={s.id}>
                          <label className={`flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-xs transition-colors hover:bg-white/50 ${past && !s.done ? "bg-rose-500/5" : ""}`}>
                            <input type="checkbox" checked={s.done} onChange={() => toggleSession(e.id, s.id)} className="h-4 w-4 shrink-0 rounded accent-[var(--accent)]" />
                            <span className={s.done ? "flex-1 text-subtle line-through" : "flex-1 text-text"}>{s.label}</span>
                            <span className={`shrink-0 tabular-nums ${past && !s.done ? "font-semibold text-rose-600" : "text-subtle"}`}>{s.date === today ? "aujourd'hui" : s.date}</span>
                          </label>
                        </li>
                      );
                    })}
                  </ul>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/30">
                    <div className="h-full rounded-full bg-accent transition-all duration-500" style={{ width: `${(done / plan.sessions.length) * 100}%` }} />
                  </div>
                  <p className="mt-1.5 text-[11px] text-subtle">{done}/{plan.sessions.length} sessions validées</p>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* Flashcards */}
      <section className="glass rounded-[1.75rem] p-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-semibold tracking-tight text-text">Flashcards</h2>
          <div className="flex gap-2 text-[11px]">
            <span className="rounded-full bg-black/5 px-2.5 py-1 font-medium text-subtle">{cards.length} cartes</span>
            <span className="rounded-full bg-accent/10 px-2.5 py-1 font-semibold text-accent">{dueCards.length} à revoir</span>
            <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 font-medium text-emerald-600">{cards.filter((c) => c.interval >= 21).length} maîtrisées</span>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-2">
          <div className="glass-inset rounded-2xl p-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-subtle">Nouvelle carte</p>
            <div className="mt-3 space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <input list="decks" className="field !py-2 !text-xs" placeholder="Paquet (ex : Maths)" value={nc.deck} onChange={(e) => setNc({ ...nc, deck: e.target.value })} />
                <datalist id="decks">{decks.map((d) => <option key={d} value={d} />)}</datalist>
                <button onClick={() => imgRef.current?.click()} className="btn-ghost !py-2 !text-xs">📷 {nc.image ? "Image ✓ (changer)" : "Photo / image"}</button>
                <input ref={imgRef} type="file" accept="image/*" hidden onChange={(e) => onImg(e.target.files?.[0])} />
              </div>
              <input className="field !py-2 !text-xs" placeholder="Recto (question) — optionnel si image" value={nc.front} onChange={(e) => setNc({ ...nc, front: e.target.value })} />
              <input className="field !py-2 !text-xs" placeholder="Verso (réponse)" value={nc.back} onChange={(e) => setNc({ ...nc, back: e.target.value })} />
              <button onClick={() => {
                if (!nc.deck.trim() || (!nc.front.trim() && !nc.image) || !nc.back.trim()) return;
                setCards((p) => [...p, { id: crypto.randomUUID(), deck: nc.deck.trim(), front: nc.front.trim(), frontImage: nc.image || undefined, back: nc.back.trim(), interval: 0, due: today }]);
                setNc({ deck: nc.deck, front: "", back: "", image: "" });
              }} className="btn-primary !py-2.5 !text-xs"><Plus size={14} /> Ajouter la carte</button>
            </div>
            {decks.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                <button onClick={() => setDeck("")} className={`rounded-full px-3 py-1 text-[11px] font-medium ${!deck ? "bg-accent text-white" : "bg-white/40 text-subtle"}`}>Tous</button>
                {decks.map((d) => (
                  <button key={d} onClick={() => setDeck(d)} className={`rounded-full px-3 py-1 text-[11px] font-medium ${deck === d ? "bg-accent text-white" : "bg-white/40 text-subtle"}`}>{d}</button>
                ))}
              </div>
            )}
          </div>

          <div className="glass-inset flex min-h-[220px] flex-col rounded-2xl p-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-subtle">Révision espacée {reviewed > 0 && `· ${reviewed} revues`}</p>
            {queue.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-3">
                <p className="text-sm text-subtle">{dueCards.length === 0 ? "Rien à revoir aujourd'hui 🎉" : `${dueCards.length} carte(s) à revoir`}</p>
                {dueCards.length > 0 && (
                  <button onClick={() => { setQueue(dueCards.map((c) => c.id)); setFlipped(false); setReviewed(0); }} className="btn-primary !w-auto !px-6">Commencer</button>
                )}
              </div>
            ) : !current ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-2">
                <p className="text-2xl">🎉</p>
                <p className="text-sm font-semibold text-text">Session terminée — {reviewed} cartes revues !</p>
                <button onClick={() => setQueue([])} className="btn-ghost">Fermer</button>
              </div>
            ) : (
              <div className="flex flex-1 flex-col">
                <div className="flex flex-1 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl bg-white/30 p-4" onClick={() => setFlipped(true)}>
                  {current.frontImage ? <img src={current.frontImage} alt="recto" className="max-h-28 rounded-xl" /> : null}
                  <p className="text-center text-sm font-semibold text-text">{flipped ? current.back : current.front || "📷 Image"}</p>
                  {!flipped && <p className="text-[11px] text-subtle">Clique pour retourner</p>}
                </div>
                {flipped ? (
                  <div className="mt-3 grid grid-cols-4 gap-1.5">
                    <button onClick={() => grade("again")} className="rounded-xl bg-rose-500/15 py-2 text-[11px] font-semibold text-rose-600 hover:bg-rose-500/25">Encore</button>
                    <button onClick={() => grade("hard")} className="rounded-xl bg-orange-500/15 py-2 text-[11px] font-semibold text-orange-600 hover:bg-orange-500/25">Difficile</button>
                    <button onClick={() => grade("good")} className="rounded-xl bg-sky-500/15 py-2 text-[11px] font-semibold text-sky-600 hover:bg-sky-500/25">Bien</button>
                    <button onClick={() => grade("easy")} className="rounded-xl bg-emerald-500/15 py-2 text-[11px] font-semibold text-emerald-600 hover:bg-emerald-500/25">Facile</button>
                  </div>
                ) : (
                  <button onClick={() => setFlipped(true)} className="btn-primary mt-3 !py-2 !text-xs">Retourner</button>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Résumé intelligent */}
      <section className="glass rounded-[1.75rem] p-6">
        <div className="flex items-center gap-2.5">
          <span className="icon-chip"><Wand2 size={18} /></span>
          <h2 className="font-semibold tracking-tight text-text">Résumé & quiz automatiques</h2>
        </div>
        <p className="mt-1 text-xs text-subtle">Colle un cours → résumé en phrases clés + questions à trous pour t&apos;auto-tester.</p>
        <textarea value={src} onChange={(e) => setSrc(e.target.value)} rows={4} placeholder="Colle ici ton cours…" className="field mt-4 resize-none" />
        <button onClick={() => { setOut({ sentences: summarize(src), quiz: makeCloze(src) }); setRevealed({}); }} disabled={src.trim().length < 100}
          className="btn-primary mt-3 disabled:opacity-40">✨ Résumer & générer le quiz</button>
        {out && (
          <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-subtle">Points clés</p>
              <ul className="mt-2 space-y-2">
                {out.sentences.map((s, i) => <li key={i} className="glass-inset rounded-xl p-3 text-xs leading-relaxed text-text">{s}</li>)}
              </ul>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-subtle">Auto-quiz (clique pour révéler)</p>
              <ul className="mt-2 space-y-2">
                {out.quiz.map((q, i) => (
                  <li key={i}>
                    <button onClick={() => setRevealed({ ...revealed, [i]: !revealed[i] })} className="glass-inset w-full rounded-xl p-3 text-left text-xs leading-relaxed text-text">
                      {q.q}
                      {revealed[i] && <span className="mt-1.5 block font-bold text-accent">→ {q.a}</span>}
                    </button>
                  </li>
                ))}
                {out.quiz.length === 0 && <p className="text-xs text-subtle">Pas assez de mots-clés détectés.</p>}
              </ul>
            </div>
          </div>
        )}
      </section>
    </>
  );
}