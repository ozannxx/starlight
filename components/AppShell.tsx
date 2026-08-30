"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Bell, ChevronRight, Search, Sparkles } from "lucide-react";
import AppSidebar, { NAV_ITEMS } from "./AppSidebar";
import CommandPalette from "./CommandPalette";
import KeyboardHelp from "./KeyboardHelp";
import { scheduleReminders } from "@/lib/notifications";
import { readCloudConfig, cloudPull, cloudPush } from "@/lib/cloud";
import {
  AGENDA_KEY, TASKS_KEY, APPS_KEY, VACATION_KEY, readJSON, addDays, todayISO, daysBetween,
  type AgendaEvent, type Task, type Application, type Vacation,
} from "@/lib/storage";

type Notif = { text: string; sub: string; href: string };

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [bellOpen, setBellOpen] = useState(false);
  const [notifs, setNotifs] = useState<Notif[]>([]);
  const pathname = usePathname();
  const router = useRouter();

  // ⌨️ Raccourcis
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); setPaletteOpen((v) => !v); return; }
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const el = e.target as HTMLElement;
      if (el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.tagName === "SELECT" || el.isContentEditable)) return;
      if (e.key === "?") { setHelpOpen(true); return; }
      if (e.key === "Escape") { setHelpOpen(false); return; }
      const map: Record<string, string> = { n: "/tasks", a: "/agenda", f: "/focus", t: "/today", s: "/stats", r: "/revision", c: "/documents", d: "/" };
      const dest = map[e.key.toLowerCase()];
      if (dest) router.push(dest);
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [router]);

  // 💤 Onglet caché → orbes en pause (batterie)
  useEffect(() => {
    const h = () => document.documentElement.classList.toggle("tab-hidden", document.hidden);
    document.addEventListener("visibilitychange", h);
    return () => document.removeEventListener("visibilitychange", h);
  }, []);

  // 🔔 Rappels + ☁️ sync
  useEffect(() => {
    scheduleReminders();
    cloudPull().then((r) => { if (r === "pulled") location.reload(); });
    const auto = readCloudConfig()?.auto;
    const iv = auto ? setInterval(() => { void cloudPush(); }, 120000) : null;
    const onLeave = () => { if (auto) void cloudPush(); };
    window.addEventListener("beforeunload", onLeave);
    return () => { if (iv) clearInterval(iv); window.removeEventListener("beforeunload", onLeave); };
  }, []);

  useEffect(() => {
    setBellOpen(false);
    if (readJSON<Vacation>(VACATION_KEY, { active: false }).active) { setNotifs([]); return; }
    const list: Notif[] = [];
    const today = todayISO();
    const tomorrow = addDays(1);
    readJSON<AgendaEvent[]>(AGENDA_KEY, []).forEach((e) => {
      if (e.date === today) list.push({ text: `Aujourd'hui : ${e.title}`, sub: `Agenda · ${e.time}`, href: "/agenda" });
      else if (e.date === tomorrow) list.push({ text: `Demain : ${e.title}`, sub: "Agenda", href: "/agenda" });
    });
    readJSON<Task[]>(TASKS_KEY, []).forEach((t) => {
      if (t.column !== "done" && t.due && t.due <= tomorrow)
        list.push({ text: `À rendre : ${t.title}`, sub: t.due < today ? "⚠️ En retard" : "Échéance proche", href: "/tasks" });
    });
    readJSON<Application[]>(APPS_KEY, []).forEach((a) => {
      if (!a.deadline || a.status === "admis" || a.status === "refuse") return;
      const d = daysBetween(a.deadline, today);
      if (d >= 0 && d <= 7) list.push({ text: `Deadline : ${a.school}`, sub: `J-${d} · ${a.program}`, href: "/applications" });
    });
    setNotifs(list);
  }, [pathname]);

  const activeLabel = useMemo(
    () => NAV_ITEMS.find((i) => i.href && (i.href === "/" ? pathname === "/" : pathname.startsWith(i.href)))?.label ?? "Project Starlight",
    [pathname]
  );

  return (
    <>
      <AppSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} pathname={pathname} />
      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
      <KeyboardHelp open={helpOpen} onClose={() => setHelpOpen(false)} />

      <main className="h-dvh overflow-y-auto p-5 sm:p-8">
        <div className="stagger mx-auto flex max-w-[1600px] flex-col gap-4 sm:gap-5">
          <header className="zen-dim flex items-center justify-between gap-3">
            <button onClick={() => setSidebarOpen(true)} aria-haspopup="dialog" aria-expanded={sidebarOpen}
              className="glass glass-hover flex items-center gap-3 rounded-2xl py-2.5 pl-3 pr-5">
              <span className="glass-inset flex h-9 w-9 items-center justify-center rounded-xl text-accent"><Sparkles size={18} /></span>
              <span className="text-left">
                <span className="block text-sm font-semibold leading-tight tracking-tight text-text">Project Starlight</span>
                <span className="block text-[11px] leading-tight text-subtle">{activeLabel}</span>
              </span>
            </button>

            <div className="flex items-center gap-2.5">
              <button onClick={() => setPaletteOpen(true)}
                className="glass glass-hover hidden items-center gap-2.5 rounded-2xl px-4 py-2.5 text-sm text-subtle md:flex">
                <Search size={15} />
                <span>Rechercher…</span>
                <kbd className="rounded-md bg-black/5 px-1.5 py-0.5 text-[10px] font-medium">⌘K</kbd>
              </button>
              <button onClick={() => setPaletteOpen(true)} aria-label="Rechercher"
                className="glass glass-hover flex h-11 w-11 items-center justify-center rounded-2xl text-subtle md:hidden">
                <Search size={18} />
              </button>

              <div className="relative">
                <button onClick={() => setBellOpen((v) => !v)} aria-label="Notifications"
                  className={`glass glass-hover relative flex h-11 w-11 items-center justify-center rounded-2xl text-subtle ${bellOpen ? "ring-2 ring-accent/50" : ""}`}>
                  <Bell size={18} />
                  {notifs.length > 0 && (
                    <span className="calmable absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-bold text-white ring-2 ring-white/80">{notifs.length}</span>
                  )}
                </button>
                {bellOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setBellOpen(false)} />
                    <div className="glass-panel absolute right-0 top-14 z-50 w-80 overflow-hidden rounded-2xl border border-white/60 shadow-2xl">
                      <p className="border-b border-white/40 px-4 py-3 text-sm font-semibold text-text">Notifications</p>
                      <div className="max-h-80 overflow-y-auto p-2">
                        {notifs.length === 0 && <p className="py-6 text-center text-sm text-subtle">Rien d&apos;urgent, respire 😌</p>}
                        {notifs.map((n, i) => (
                          <button key={i} onClick={() => { router.push(n.href); setBellOpen(false); }}
                            className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-white/50">
                            <span className="min-w-0 flex-1">
                              <span className="block truncate text-sm font-medium text-text">{n.text}</span>
                              <span className="block truncate text-xs text-subtle">{n.sub}</span>
                            </span>
                            <ChevronRight size={14} className="shrink-0 text-subtle" />
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>

              <Link href="/settings" className="glass glass-hover flex items-center gap-2.5 rounded-2xl py-1.5 pl-1.5 pr-4">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 text-xs font-bold text-white">OZ</span>
                <span className="hidden text-sm font-medium text-text sm:block">Ozan</span>
              </Link>
            </div>
          </header>

          {/* key={pathname} → chaque page glisse en douceur à la navigation */}
          <div key={pathname} className="flex flex-col gap-4 sm:gap-5">
            {children}
          </div>
        </div>
      </main>
    </>
  );
}