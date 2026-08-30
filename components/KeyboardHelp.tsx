"use client";

const SHORTCUTS: [string, string][] = [
  ["⌘K / Ctrl+K", "Recherche globale"],
  ["T", "Aujourd'hui"],
  ["D", "Tableau de bord"],
  ["A", "Agenda"],
  ["N", "Devoirs"],
  ["F", "Focus"],
  ["S", "Statistiques"],
  ["R", "Révisions"],
  ["C", "Documents"],
  ["?", "Cette aide"],
  ["Échap", "Fermer"],
];

export default function KeyboardHelp({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/25 p-4" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="glass-panel w-full max-w-sm rounded-3xl border border-white/60 p-6 shadow-2xl">
        <h2 className="font-semibold tracking-tight text-text">⌨️ Raccourcis clavier</h2>
        <ul className="mt-4 space-y-2">
          {SHORTCUTS.map(([k, label]) => (
            <li key={k} className="flex items-center justify-between text-sm">
              <span className="text-text">{label}</span>
              <kbd className="rounded-md bg-black/5 px-2 py-0.5 text-[11px] font-semibold text-subtle">{k}</kbd>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}