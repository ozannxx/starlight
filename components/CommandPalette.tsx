"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { NAV_ITEMS } from "./AppSidebar";
import {
  AGENDA_KEY, TASKS_KEY, DOCS_KEY, APPS_KEY, JOURNAL_KEY,
  readJSON, formatLong,
  type AgendaEvent, type Task, type DocItem, type Application, type JournalEntry,
} from "@/lib/storage";

type Item = { label: string; sub: string; href: string; group: string };

const norm = (s: string) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

export default function CommandPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const items = useMemo<Item[]>(() => {
    if (!open) return [];
    const out: Item[] = [];
    NAV_ITEMS.filter((n) => n.href).forEach((n) =>
      out.push({ label: n.label, sub: "Page", href: n.href!, group: "Pages" })
    );
    readJSON<Task[]>(TASKS_KEY, []).forEach((t) =>
      out.push({ label: t.title, sub: `Devoir · ${t.subject ?? "sans matière"}`, href: "/tasks", group: "Devoirs" })
    );
    readJSON<AgendaEvent[]>(AGENDA_KEY, []).forEach((e) =>
      out.push({ label: e.title, sub: `Agenda · ${formatLong(e.date)}`, href: "/agenda", group: "Agenda" })
    );
    readJSON<DocItem[]>(DOCS_KEY, []).forEach((d) =>
      out.push({ label: d.name, sub: `Document · ${d.subject ?? ""}`, href: "/documents", group: "Documents" })
    );
    readJSON<Application[]>(APPS_KEY, []).forEach((a) =>
      out.push({ label: `${a.school} — ${a.program}`, sub: "Candidature", href: "/applications", group: "Candidatures" })
    );
    readJSON<JournalEntry[]>(JOURNAL_KEY, [])
      .filter((j) => j.text.trim())
      .forEach((j) =>
        out.push({ label: j.text.slice(0, 60), sub: `Journal · ${formatLong(j.date)}`, href: "/today", group: "Journal" })
      );
    return out;
  }, [open]);

  const filtered = useMemo(() => {
    const q = norm(query.trim());
    if (!q) return items.slice(0, 10);
    return items.filter((i) => norm(i.label).includes(q) || norm(i.sub).includes(q)).slice(0, 12);
  }, [items, query]);

  useEffect(() => {
    if (open) {
      setQuery("");
      setActive(0);
      setTimeout(() => inputRef.current?.focus(), 30);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const h = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowDown") { e.preventDefault(); setActive((a) => Math.min(a + 1, filtered.length - 1)); }
      if (e.key === "ArrowUp") { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)); }
      if (e.key === "Enter" && filtered[active]) { router.push(filtered[active].href); onClose(); }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [open, filtered, active, router, onClose]);

  if (!open) return null;
  let lastGroup = "";

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center bg-black/25 p-4 pt-[15vh]" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="glass-panel w-full max-w-xl overflow-hidden rounded-3xl border border-white/60 shadow-2xl"
      >
        <div className="flex items-center gap-3 border-b border-white/40 px-5 py-4">
          <Search size={18} className="shrink-0 text-subtle" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => { setQuery(e.target.value); setActive(0); }}
            placeholder="Rechercher : devoirs, événements, documents, candidatures, journal…"
            className="w-full bg-transparent text-sm text-text outline-none placeholder:text-subtle"
          />
          <kbd className="shrink-0 rounded-md bg-black/5 px-2 py-1 text-[10px] font-medium text-subtle">Échap</kbd>
        </div>
        <div className="max-h-80 overflow-y-auto p-2">
          {filtered.length === 0 && <p className="py-8 text-center text-sm text-subtle">Aucun résultat</p>}
          {filtered.map((item, i) => {
            const showGroup = item.group !== lastGroup;
            lastGroup = item.group;
            return (
              <div key={`${item.group}-${item.label}-${i}`}>
                {showGroup && (
                  <p className="px-3 pb-1 pt-3 text-[10px] font-semibold uppercase tracking-widest text-subtle">
                    {item.group}
                  </p>
                )}
                <button
                  onClick={() => { router.push(item.href); onClose(); }}
                  onMouseEnter={() => setActive(i)}
                  className={`flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-colors ${
                    i === active ? "bg-accent text-white" : "text-text hover:bg-white/50"
                  }`}
                >
                  <span className="min-w-0">
                    <span className="block truncate font-medium">{item.label}</span>
                    <span className={`block truncate text-xs ${i === active ? "text-white/80" : "text-subtle"}`}>
                      {item.sub}
                    </span>
                  </span>
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}