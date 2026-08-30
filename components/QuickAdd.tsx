"use client";

import { useState } from "react";
import { Plus, Wand2 } from "lucide-react";
import { parseQuickAdd } from "@/lib/quickadd";
import { AGENDA_KEY, readJSON, formatLong, type AgendaEvent } from "@/lib/storage";
import { useToast } from "./Toast";

export default function QuickAdd({ onAdd }: { onAdd?: (ev: AgendaEvent) => void }) {
  const [v, setV] = useState("");
  const { toast } = useToast();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!v.trim()) return;
    const ev = parseQuickAdd(v);
    if (!ev) return;
    if (onAdd) onAdd(ev);
    else {
      const list = readJSON<AgendaEvent[]>(AGENDA_KEY, []);
      localStorage.setItem(AGENDA_KEY, JSON.stringify([...list, ev]));
    }
    toast(`✨ Ajouté : ${ev.title} — ${formatLong(ev.date)}`);
    setV("");
  };

  return (
    <form onSubmit={submit} className="flex w-full items-center gap-2">
      <span className="icon-chip !h-10 !w-10 !rounded-2xl"><Wand2 size={17} /></span>
      <input className="field" placeholder="Ajout express : « contrôle physique vendredi 10h » ou « dm maths demain soir »…" value={v} onChange={(e) => setV(e.target.value)} />
      <button type="submit" className="btn-primary !w-auto shrink-0 !px-5"><Plus size={16} /> Ajouter</button>
    </form>
  );
}