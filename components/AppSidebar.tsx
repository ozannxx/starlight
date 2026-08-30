"use client";

import { useEffect } from "react";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard, CalendarDays, NotebookPen, Timer, CalendarRange, Target, BarChart3,
  FolderOpen, Send, FileText, Settings, GraduationCap, Brain, MessagesSquare, Users, X, Sparkles,
} from "lucide-react";

type NavItem = { id: string; label: string; icon: LucideIcon; href?: string; soon?: boolean };

export const NAV_ITEMS: NavItem[] = [
  { id: "dashboard", label: "Tableau de bord", icon: LayoutDashboard, href: "/" },
  { id: "agenda", label: "Agenda", icon: CalendarDays, href: "/agenda" },
  { id: "tasks", label: "Devoirs", icon: NotebookPen, href: "/tasks" },
  { id: "focus", label: "Focus", icon: Timer, href: "/focus" },
  { id: "schedule", label: "Emploi du temps", icon: CalendarRange, href: "/schedule" },
  { id: "goals", label: "Objectifs & Habitudes", icon: Target, href: "/goals" },
  { id: "stats", label: "Statistiques", icon: BarChart3, href: "/stats" },
  { id: "grades", label: "Notes", icon: GraduationCap, soon: true },
  { id: "revision", label: "Révisions", icon: Brain, soon: true },
  { id: "documents", label: "Documents", icon: FolderOpen, href: "/documents" },
  { id: "contacts", label: "Contacts", icon: Users, soon: true },
  { id: "applications", label: "Candidatures", icon: Send, href: "/applications" },
  { id: "cv", label: "CV & Portfolio", icon: FileText, href: "/cv" },
  { id: "messages", label: "Messagerie", icon: MessagesSquare, soon: true },
  { id: "settings", label: "Paramètres", icon: Settings, href: "/settings" },
];

const GROUPS = [
  { title: "Pilotage", ids: ["dashboard", "agenda", "tasks", "focus", "schedule"] },
  { title: "Progression", ids: ["goals", "stats", "grades", "revision"] },
  { title: "Vie scolaire", ids: ["documents", "contacts"] },
  { title: "Avenir", ids: ["applications", "cv"] },
  { title: "Compte", ids: ["messages", "settings"] },
];

export default function AppSidebar({ open, onClose, pathname }: { open: boolean; onClose: () => void; pathname: string }) {
  useEffect(() => {
    if (!open) return;
    const h = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [open, onClose]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const isActive = (i: NavItem) => !!i.href && (i.href === "/" ? pathname === "/" : pathname.startsWith(i.href));

  return (
    <>
      <div onClick={onClose} aria-hidden="true" className={`fixed inset-0 z-40 bg-black/25 transition-opacity duration-300 ${open ? "opacity-100" : "pointer-events-none opacity-0"}`} />
      <aside
        role="dialog" aria-modal="true" aria-label="Navigation"
        className={`glass-panel fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-white/60 shadow-2xl shadow-black/10 transition-[transform,visibility] duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] ${open ? "visible translate-x-0" : "invisible -translate-x-full"}`}
      >
        <div className="flex items-center justify-between px-5 py-6">
          <button onClick={onClose} className="flex items-center gap-2.5" aria-label="Fermer la navigation">
            <span className="glass-inset flex h-9 w-9 items-center justify-center rounded-xl text-accent"><Sparkles size={17} /></span>
            <span className="text-sm font-semibold tracking-tight text-text">Project Starlight</span>
          </button>
          <button onClick={onClose} aria-label="Fermer" className="flex h-9 w-9 items-center justify-center rounded-xl text-subtle transition-colors hover:text-text"><X size={18} /></button>
        </div>

        <nav className="flex-1 space-y-4 overflow-y-auto px-4 pb-4">
          {GROUPS.map((g) => (
            <div key={g.title}>
              <p className="px-3 pb-1.5 pt-2 text-[11px] font-medium uppercase tracking-widest text-subtle">{g.title}</p>
              <div className="space-y-1">
                {NAV_ITEMS.filter((i) => g.ids.includes(i.id)).map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item);
                  const base = `group flex w-full items-center gap-3 rounded-2xl px-4 py-2.5 text-sm font-medium transition-all duration-200 ${active ? "bg-accent text-white shadow-lg shadow-accent/30" : "text-text hover:bg-white/60"}`;
                  if (item.soon) return (
                    <button key={item.id} disabled className={`${base} cursor-not-allowed opacity-45`}>
                      <Icon size={17} className="text-subtle" />
                      <span className="truncate">{item.label}</span>
                      <span className="ml-auto shrink-0 rounded-full bg-black/5 px-2 py-0.5 text-[10px] font-medium text-subtle">Bientôt</span>
                    </button>
                  );
                  return (
                    <Link key={item.id} href={item.href!} onClick={onClose} className={base}>
                      <Icon size={17} className={active ? "" : "text-subtle transition-colors group-hover:text-text"} />
                      <span className="truncate">{item.label}</span>
                      {active && <span className="ml-auto text-[10px]">●</span>}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="p-4">
          <div className="glass-inset flex items-center gap-3 rounded-2xl p-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 text-xs font-bold text-white">OZ</span>
            <span className="min-w-0">
              <span className="block truncate text-sm font-medium text-text">Ozan</span>
              <span className="block truncate text-xs text-subtle">ozntktt@icloud.com</span>
            </span>
          </div>
        </div>
      </aside>
    </>
  );
}