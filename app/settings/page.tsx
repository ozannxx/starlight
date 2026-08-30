"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Cloud, Database, Download, Palette, RotateCcw, Upload, Bell, Palmtree, Volume2, Waves } from "lucide-react";
import { useTheme, THEMES, type ThemeId } from "@/components/ThemeProvider";
import { ALL_KEYS, VACATION_KEY, readJSON, type Vacation } from "@/lib/storage";
import { readCloudConfig, saveCloudConfig, cloudPush, cloudPull, genCode, lastSyncISO, type CloudConfig } from "@/lib/cloud";
import { notifReady, enableNotifications, disableNotifications } from "@/lib/notifications";
import { exportMarkdown, exportICS } from "@/lib/exporters";
import { uiSound, uiSoundsOn } from "@/lib/sounds";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const importRef = useRef<HTMLInputElement>(null);

  const [vac, setVac] = useState<Vacation>({ active: false });
  useEffect(() => { setVac(readJSON<Vacation>(VACATION_KEY, { active: false })); }, []);
  const saveVac = (v: Vacation) => { setVac(v); localStorage.setItem(VACATION_KEY, JSON.stringify(v)); };

  const [notifOn, setNotifOn] = useState(false);
  useEffect(() => { setNotifOn(notifReady()); }, []);

  const [sounds, setSounds] = useState(true);
  useEffect(() => { setSounds(uiSoundsOn()); }, []);
  const toggleSounds = (on: boolean) => {
    setSounds(on);
    localStorage.setItem("starlight-ui-sounds", on ? "1" : "0");
    if (on) uiSound("success");
  };

  const [calm, setCalm] = useState(false);
  useEffect(() => { setCalm(document.documentElement.dataset.calm === "1"); }, []);
  const toggleCalm = (on: boolean) => {
    setCalm(on);
    if (on) document.documentElement.dataset.calm = "1";
    else delete document.documentElement.dataset.calm;
    localStorage.setItem("starlight-calm", on ? "1" : "0");
  };

  const [cloud, setCloud] = useState<CloudConfig>({ url: "", key: "", code: "", auto: false });
  const [cloudStatus, setCloudStatus] = useState("");
  useEffect(() => { const c = readCloudConfig(); if (c) setCloud(c); }, []);
  const persistCloud = () => saveCloudConfig(cloud);
  const doPush = async () => { persistCloud(); const r = await cloudPush(); setCloudStatus(r === "pushed" ? `✅ Envoyé à ${new Date().toLocaleTimeString("fr-FR")}` : r === "no-config" ? "⚠️ Remplis l'URL, la clé et le code" : `❌ Erreur (${r})`); };
  const doPull = async () => { persistCloud(); const r = await cloudPull(); if (r === "pulled") { setCloudStatus("✅ Récupéré — rechargement…"); setTimeout(() => location.reload(), 700); } else setCloudStatus(r === "empty" ? "Rien sur le cloud pour ce code — envoie d'abord tes données" : r === "up-to-date" ? "✅ Déjà à jour" : `❌ Erreur (${r})`); };

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
    if (!confirm("Supprimer TOUTES tes données ? Action irréversible.")) return;
    ALL_KEYS.forEach((k) => localStorage.removeItem(k));
    localStorage.removeItem("starlight-theme");
    location.reload();
  };

  const ls = lastSyncISO();

  return (
    <>
      <section className="glass rounded-[1.75rem] p-6">
        <div className="flex items-center gap-2.5">
          <span className="icon-chip"><Palette size={18} /></span>
          <h2 className="font-semibold tracking-tight text-text">Thème</h2>
        </div>
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

      {/* ✨ NOUVEAU — Confort */}
      <section className="glass rounded-[1.75rem] p-6">
        <div className="flex items-center gap-2.5">
          <span className="icon-chip"><Waves size={18} /></span>
          <h2 className="font-semibold tracking-tight text-text">Confort</h2>
        </div>
        <div className="mt-5 space-y-3">
          <label className="glass-inset flex items-center justify-between gap-3 rounded-2xl px-4 py-3">
            <span className="flex items-center gap-2 text-xs font-medium text-text">
              <Volume2 size={15} className="text-accent" /> Sons d&apos;interface (validations, fins de session)
            </span>
            <input type="checkbox" checked={sounds} onChange={(e) => toggleSounds(e.target.checked)} className="h-4 w-4 accent-[var(--accent)]" />
          </label>
          <label className="glass-inset flex items-center justify-between gap-3 rounded-2xl px-4 py-3">
            <span className="flex items-center gap-2 text-xs font-medium text-text">
              🧘 Mode calme (masque compteurs, badges et chiffres rouges)
            </span>
            <input type="checkbox" checked={calm} onChange={(e) => toggleCalm(e.target.checked)} className="h-4 w-4 accent-[var(--accent)]" />
          </label>
          <button onClick={() => uiSound("complete")} className="btn-ghost !w-full">🎵 Écouter le son de fin de pomodoro</button>
        </div>
      </section>

      <section className="glass rounded-[1.75rem] p-6">
        <div className="flex items-center gap-2.5">
          <span className="icon-chip"><Palmtree size={18} /></span>
          <h2 className="font-semibold tracking-tight text-text">Mode vacances</h2>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <label className="glass-inset flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-text">
            <input type="checkbox" checked={vac.active} onChange={(e) => saveVac({ ...vac, active: e.target.checked })} className="h-4 w-4 accent-[var(--accent)]" />
            Activer
          </label>
          <input type="date" className="field !w-auto" value={vac.until ?? ""} onChange={(e) => saveVac({ ...vac, until: e.target.value })} title="Date de rentrée" />
        </div>
      </section>

      <section className="glass rounded-[1.75rem] p-6">
        <div className="flex items-center gap-2.5">
          <span className="icon-chip"><Bell size={18} /></span>
          <h2 className="font-semibold tracking-tight text-text">Rappels navigateur</h2>
        </div>
        <div className="mt-4 flex flex-wrap gap-3">
          <button onClick={async () => { if (notifOn) { disableNotifications(); setNotifOn(false); } else { const ok = await enableNotifications(); setNotifOn(ok); if (!ok) alert("Notifications refusées par le navigateur."); } }}
            className={`rounded-xl px-5 py-2.5 text-sm font-semibold transition-all ${notifOn ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/30" : "bg-accent text-white shadow-lg shadow-accent/30"}`}>
            {notifOn ? "✓ Activés" : "Activer les rappels"}
          </button>
          {notifOn && <button onClick={() => { if (typeof Notification !== "undefined") new Notification("⭐ Project Starlight", { body: "Les rappels fonctionnent !" }); }} className="btn-ghost !py-2.5">Tester</button>}
        </div>
      </section>

      <section className="glass rounded-[1.75rem] p-6">
        <div className="flex items-center gap-2.5">
          <span className="icon-chip"><Cloud size={18} /></span>
          <h2 className="font-semibold tracking-tight text-text">Sync multi-appareils</h2>
        </div>
        <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
          <input className="field" placeholder="URL Supabase (https://xxx.supabase.co)" value={cloud.url} onChange={(e) => setCloud({ ...cloud, url: e.target.value.trim() })} />
          <input className="field" type="password" placeholder="Clé anon (publique)" value={cloud.key} onChange={(e) => setCloud({ ...cloud, key: e.target.value.trim() })} />
          <div className="flex gap-2">
            <input className="field" placeholder="Code d'appairage" value={cloud.code} onChange={(e) => setCloud({ ...cloud, code: e.target.value.trim().toUpperCase() })} />
            <button onClick={() => setCloud({ ...cloud, code: genCode() })} className="btn-ghost shrink-0">🎲</button>
          </div>
          <label className="glass-inset flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-text">
            <input type="checkbox" checked={cloud.auto} onChange={(e) => setCloud({ ...cloud, auto: e.target.checked })} className="h-4 w-4 accent-[var(--accent)]" />
            Sync auto (toutes les 2 min)
          </label>
        </div>
        <div className="mt-3 flex flex-wrap gap-3">
          <button onClick={doPush} className="rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-accent/30 transition-transform hover:-translate-y-0.5">☁️ Envoyer</button>
          <button onClick={doPull} className="btn-ghost !py-2.5">⬇️ Récupérer</button>
          {cloudStatus && <span className="self-center text-xs text-subtle">{cloudStatus}</span>}
        </div>
        {ls && <p className="mt-2 text-[11px] text-subtle">Dernière synchro : {new Date(ls).toLocaleString("fr-FR")}</p>}
      </section>

      <section className="glass rounded-[1.75rem] p-6">
        <div className="flex items-center gap-2.5">
          <span className="icon-chip"><Database size={18} /></span>
          <h2 className="font-semibold tracking-tight text-text">Mes données</h2>
        </div>
        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <button onClick={exportAll} className="btn-primary"><Download size={15} /> Sauvegarde JSON</button>
          <button onClick={exportMarkdown} className="btn-ghost !w-full !py-3"><Download size={15} /> Archive Markdown (Notion/Obsidian)</button>
          <button onClick={exportICS} className="btn-ghost !w-full !py-3"><Download size={15} /> Agenda .ics (Google/Apple)</button>
          <button onClick={() => importRef.current?.click()} className="btn-ghost !w-full !py-3"><Upload size={15} /> Importer une sauvegarde</button>
          <button onClick={resetAll} className="btn-ghost !w-full !py-3 !text-rose-600 hover:!bg-rose-500/10 sm:col-span-2"><RotateCcw size={15} /> Tout réinitialiser</button>
        </div>
        <input ref={importRef} type="file" accept="application/json" hidden onChange={(e) => e.target.files?.[0] && importAll(e.target.files[0])} />
      </section>
    </>
  );
}