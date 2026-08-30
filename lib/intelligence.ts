import type { CVData } from "./storage";

const STOP = new Set("le la les un une des de du au aux et ou mais donc or ni car que qui quoi dont je tu il elle on nous vous ils elles ce cette ces son sa ses mon ma mes ton ta tes notre votre leur pour par avec sans sous sur dans en y est sont était plus moins très aussi comme tout tous toute toutes ne pas cela".split(" "));

const words = (t: string) => t.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9\s]/g, " ").split(/\s+/).filter(Boolean);
const freqs = (t: string) => { const f = new Map<string, number>(); words(t).forEach((w) => { if (w.length > 3 && !STOP.has(w)) f.set(w, (f.get(w) ?? 0) + 1); }); return f; };

export function summarize(text: string, max = 6): string[] {
  const sentences = text.replace(/\s+/g, " ").match(/[^.!?]+[.!?]+/g)?.map((s) => s.trim()) ?? [];
  if (sentences.length <= max) return sentences;
  const f = freqs(text);
  return sentences
    .map((s, i) => ({ s, i, score: words(s).reduce((a, w) => a + (f.get(w) ?? 0), 0) / Math.sqrt(s.length) }))
    .sort((a, b) => b.score - a.score).slice(0, max).sort((a, b) => a.i - b.i).map((x) => x.s);
}

export function makeCloze(text: string, count = 5): { q: string; a: string }[] {
  const f = freqs(text);
  const keywords = [...f.entries()].sort((a, b) => b[1] - a[1]).map((e) => e[0]);
  const sentences = text.replace(/\s+/g, " ").match(/[^.!?]+[.!?]+/g)?.map((s) => s.trim()) ?? [];
  const out: { q: string; a: string }[] = [];
  for (const s of sentences) {
    const kw = keywords.find((k) => new RegExp(`\\b${k}\\b`, "i").test(s));
    if (kw && !out.some((o) => o.a === kw)) {
      out.push({ q: s.replace(new RegExp(`\\b${kw}\\b`, "i"), "_____"), a: kw });
      if (out.length >= count) break;
    }
  }
  return out;
}

export function motivationLetter(o: { school: string; program: string; cv: CVData }): string {
  const c = o.cv;
  const edu = c.education[c.education.length - 1];
  const projs = c.projects.filter((p) => p.title).map((p) => `${p.title} — ${p.desc}`).join(" ; ");
  const paras = [
    `Objet : candidature — ${o.program}`,
    "Madame, Monsieur,",
    `Actuellement ${edu?.diploma ? `${edu.diploma}${edu.school ? ` au ${edu.school}` : ""}` : "élève"}, je souhaite poursuivre mon parcours en intégrant la formation ${o.program} au sein de ${o.school}.`,
    c.pitch || "",
    c.skills.length ? `Au fil de mon parcours, j'ai développé des compétences telles que ${c.skills.join(", ")} — des qualités que je souhaite mettre au service de cette formation.` : "",
    projs ? `J'ai notamment mené les projets suivants : ${projs}.` : "",
    `Votre formation correspond précisément à ce que je recherche, et je mettrai tout en œuvre pour m'y investir pleinement. Je me tiens à votre disposition pour un entretien afin de vous exposer ma motivation.`,
    "Dans l'attente de votre réponse, je vous prie d'agréer, Madame, Monsieur, l'expression de mes salutations distinguées.",
    `${c.fullName}\n${c.email}`,
  ].filter((p) => p && p.trim());
  return paras.join("\n\n");
}

export function predictNextAverage(grades: number[]): { next: number; trend: number } {
  const n = grades.length;
  if (n < 2) return { next: grades[0] ?? 0, trend: 0 };
  const mx = (n - 1) / 2;
  const my = grades.reduce((a, b) => a + b, 0) / n;
  let num = 0, den = 0;
  for (let i = 0; i < n; i++) { num += (i - mx) * (grades[i] - my); den += (i - mx) ** 2; }
  const slope = den ? num / den : 0;
  return { next: Math.round(Math.max(0, Math.min(20, my + slope * (n - mx))) * 10) / 10, trend: Math.round(slope * 10) / 10 };
}