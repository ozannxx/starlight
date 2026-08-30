"use client";

import { useRef } from "react";
import { Check, Database, Download, Palette, RotateCcw, Upload } from "lucide-react";
import { useTheme, THEMES, type ThemeId } from "@/components/ThemeProvider";
import { ALL_KEYS } from "@/lib/storage";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const importRef = useRef<HTMLInputElement>(null);

  const exportAll = () => {
    const data: Record<string, unknown> = {};
    ALL_KEYS.forEach((k) => { const v = localStorage.getItem(k); if (v) { try { data[k] = JSON.parse(v); } catch {} } });
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `starlight-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
  };

  const importAll = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(String(reader.result)) as Record<string, unknown>;
        Object.entries(data).forEach(([k, v]) => { if (ALL_KEYS.includes(k)) localStorage.setItem(k, JSON.stringify(v)); });
        location.reload();
      } catch { alert("Fichier de sauvegarde invalide."); }
    };
    reader.readAsText(file);
  };

  const resetAll = () => {
    if (!confirm("Supprimer TOUTES tes données (devoirs, agenda, focus, objectifs…) ? Action irréversible.")) return;
    ALL_KEYS.forEach((k) => localStorage.removeItem(k));
    localStorage.removeItem("starlight-theme");
    location.reload();
  };

  return (
    <>
      <section className="glass rounded-[1.75rem] p-6">
        <div className="flex items-center gap-2.5">
          <span className="icon-chip"><Palette size={18} /></span>
          <h2 className="font-semibold tracking-tight text-text">Thème</h2>
        </div>
        <p className="mt-1 text-xs text-subtle">Change d&apos;ambiance selon ton humeur — tout le site suit instantanément.</p>
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {THEMES.map((t) => (
            <button key={t.id} onClick={() => setTheme(t.id as ThemeId)}
              className={`glass rounded-2xl p-4 text-left transition-all ${theme === t.id ? "ring-2 ring-accent shadow-lg shadow-accent/20" : "glass-hover"}`}>
              <div className="flex items-center justify-between">
                <span className="h-10 w-10 rounded-xl border border-black/5 shadow-inner" style={{ background: t.bg }}>
                  <span className="m-auto mt-2 block h-4 w-4 rounded-full" style={{ background: t.accent }} />
                </span>
                {theme === t.id && <span className="flex h-6 w-6 items-center justify-center rounded-full bg-accent text-white"><Check size={13} /></span>}
              </div>
              <p className="mt-3 text-sm font-semibold text-text">{t.name}</p>
              <p className="text-xs text-subtle">{t.desc}</p>
            </button>
          ))}
        </div>
      </section>

      <section className="glass rounded-[1.75rem] p-6">
        <div className="flex items-center gap-2.5">
          <span className="icon-chip"><Database size={18} /></span>
          <h2 className="font-semibold tracking-tight text-text">Mes données</h2>
        </div>
        <p className="mt-1 text-xs text-subtle">Tout est stocké localement dans ton navigateur. Exporte régulièrement pour ne rien perdre !</p>
        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <button onClick={exportAll} className="btn-primary"><Download size={15} /> Exporter la sauvegarde</button>
          <button onClick={() => importRef.current?.click()} className="btn-ghost !w-full !py-3"><Upload size={15} /> Importer une sauvegarde</button>
          <button onClick={resetAll} className="btn-ghost !w-full !py-3 !text-rose-600 hover:!bg-rose-500/10"><RotateCcw size={15} /> Tout réinitialiser</button>
        </div>
        <input ref={importRef} type="file" accept="application/json" hidden onChange={(e) => e.target.files?.[0] && importAll(e.target.files[0])} />
      </section>
    </>
  );
}