import type { AgendaEvent, EventType } from "./storage";
import { addDays, todayISO, pad } from "./storage";

const TYPE_KEYWORDS: [EventType, string[]][] = [
  ["controle", ["controle", "contrôle", " ds ", "interro"]],
  ["devoir", ["devoir", "dm ", "à rendre"]],
  ["oral", ["oral", "expose", "exposé", "presentation", "présentation"]],
  ["projet", ["projet", "tpe", "dossier"]],
  ["vacances", ["vacances", "pont"]],
  ["sortie", ["sortie", "voyage", "musée"]],
  ["apporter", ["apporter", "amener", "blouse"]],
  ["anniversaire", ["anniv"]],
  ["sport", ["entrainement", "entraînement", "foot", "match", "sport", "tennis", "basket"]],
  ["reunion", ["reunion", "réunion", "parents"]],
  ["rdv", ["rdv", "rendez-vous", "medecin", "médecin", "dentiste", "orthodontiste"]],
];

export function detectType(text: string): EventType {
  const t = ` ${text.toLowerCase()} `;
  for (const [type, kws] of TYPE_KEYWORDS) if (kws.some((k) => t.includes(k))) return type;
  return "devoir";
}

const SUBJECTS: [RegExp, string][] = [
  [/math(s|ematiques|ématiques)?\b/i, "Mathématiques"],
  [/\bphysique\b|\bchimie\b/i, "Physique-Chimie"],
  [/\banglais\b/i, "Anglais"], [/\bespagnol\b/i, "Espagnol"],
  [/\bhistoire\b|\bg[eé]o(graphie)?\b/i, "Histoire-Géographie"],
  [/\bsvt\b/i, "SVT"], [/\bfran[cç]ais\b/i, "Français"],
  [/\bphilo(sophie)?\b/i, "Philosophie"], [/\bses\b/i, "SES"],
];

function detectDate(text: string): string | null {
  const t = text.toLowerCase();
  if (t.includes("aujourd")) return todayISO();
  if (t.includes("après-demain") || t.includes("apres-demain")) return addDays(2);
  if (t.includes("demain")) return addDays(1);
  const dans = t.match(/dans (\d+) (jour|jours|semaine|semaines)/);
  if (dans) { const n = parseInt(dans[1]); return addDays(dans[2].startsWith("semaine") ? n * 7 : n); }
  const days = ["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"];
  for (let i = 0; i < days.length; i++) {
    if (new RegExp(`\\b${days[i]}\\b`).test(t)) {
      let diff = (i - new Date().getDay() + 7) % 7;
      if (/prochain/.test(t)) diff += 7;
      return addDays(diff);
    }
  }
  const dm = t.match(/(\d{1,2})[\/\-](\d{1,2})(?:[\/\-](\d{2,4}))?/);
  if (dm) {
    const d = +dm[1], m = +dm[2];
    let y = dm[3] ? +dm[3] : new Date().getFullYear();
    if (y < 100) y += 2000;
    if (d >= 1 && d <= 31 && m >= 1 && m <= 12) return `${y}-${pad(m)}-${pad(d)}`;
  }
  return null;
}

function detectTime(t: string): string | null {
  const h = t.match(/\b(\d{1,2})\s?[h:]\s?(\d{2})?\b/);
  if (h) return `${pad(Math.min(23, +h[1]))}:${pad(h[2] ? Math.min(59, +h[2]) : 0)}`;
  if (/midi/.test(t)) return "12:00";
  if (/matin/.test(t)) return "08:00";
  if (/soir/.test(t)) return "18:00";
  if (/apr[eè]s/.test(t)) return "14:00";
  return null;
}

export function parseQuickAdd(input: string): AgendaEvent | null {
  const raw = input.trim();
  if (!raw) return null;
  const type = detectType(raw);
  const date = detectDate(raw) ?? todayISO();
  const time = detectTime(raw) ?? "08:00";
  let subject: string | undefined;
  for (const [re, name] of SUBJECTS) if (re.test(raw)) { subject = name; break; }
  let title = raw
    .replace(/(\d{1,2})\s?[h:]\s?(\d{2})?/gi, " ")
    .replace(/\b\d{1,2}[\/\-]\d{1,2}([\/\-]\d{2,4})?\b/gi, " ")
    .replace(/\b(aujourd'hui|après-demain|apres-demain|demain|prochain|prochaine|midi|matin|soir|soirée|aprem|après-midi|dans \d+ (jours?|semaines?))\b/gi, " ")
    .replace(/\b(dimanche|lundi|mardi|mercredi|jeudi|vendredi|samedi)\b/gi, " ")
    .replace(/\s+/g, " ").trim();
  if (!title) title = raw;
  title = title.charAt(0).toUpperCase() + title.slice(1);
  return { id: crypto.randomUUID(), title, type, date, time, subject };
}