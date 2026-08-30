"use client";

import { useEffect } from "react";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  CalendarDays,
  GraduationCap,
  NotebookPen,
  MessagesSquare,
  Settings,
  X,
  Sparkles,
} from "lucide-react";

type NavItem = {
  id: string;
  label: string;
  icon: LucideIcon;
  href?: string; // pas de href = page pas encore développée
};

export const NAV_ITEMS: NavItem[] = [
  { id: "overview", label: "Tableau de bord", icon: LayoutDashboard, href: "/" },
  { id: "agenda", label: "Agenda", icon: CalendarDays, href: "/agenda" },
  { id: "grades", label: "Notes", icon: GraduationCap },
  { id: "homework", label: "Devoirs", icon: NotebookPen },
  { id: "messages", label: "Messagerie", icon: MessagesSquare },
  { id: "settings", label: "Paramètres", icon: Settings },
];

const NAV_GROUPS = [
  { title: "École", ids: ["overview", "agenda", "grades", "homework"] },
  { title: "Compte", ids: ["messages", "settings"] },
];

type AppSidebarProps = {
  open: boolean;
  onClose: () => void;
  pathname: string;
};

export default function AppSidebar({ open, onClose, pathname }: AppSidebarProps) {
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const isActive = (item: NavItem) =>
    !!item.href && (item.href === "/" ? pathname === "/" : pathname.startsWith(item.href));

  return (
    <>
      <div
        onClick={onClose}
        aria-hidden="true"
        className={`fixed inset-0 z-40 bg-black/25 transition-opacity duration-300 ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Navigation"
        className={`glass-panel fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-white/60 shadow-2xl shadow-black/10 transition-[transform,visibility] duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] ${
          open ? "visible translate-x-0" : "invisible -translate-x-full"
        }`}
      >
        {/* En-tête */}
        <div className="flex items-center justify-between px-5 py-6">
          <button
            onClick={onClose}
            className="flex items-center gap-2.5"
            aria-label="Fermer la navigation"
          >
            <span className="glass-inset flex h-9 w-9 items-center justify-center rounded-xl text-accent">
              <Sparkles size={17} />
            </span>
            <span className="text-sm font-semibold tracking-tight text-text">
              Project Starlight
            </span>
          </button>
          <button
            onClick={onClose}
            aria-label="Fermer"
            className="flex h-9 w-9 items-center justify-center rounded-xl text-subtle transition-colors hover:text-text"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-5 overflow-y-auto px-4">
          {NAV_GROUPS.map((group) => (
            <div key={group.title}>
              <p className="px-3 pb-2 pt-3 text-[11px] font-medium uppercase tracking-widest text-subtle">
                {group.title}
              </p>
              <div className="space-y-1">
                {NAV_ITEMS.filter((item) => group.ids.includes(item.id)).map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item);
                  const base = `group flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-all duration-200 ${
                    active ? "bg-accent text-white shadow-lg shadow-accent/30" : "text-text hover:bg-white/60"
                  }`;

                  if (item.href) {
                    return (
                      <Link key={item.id} href={item.href} onClick={onClose} className={base}>
                        <Icon
                          size={18}
                          className={active ? "" : "text-subtle transition-colors group-hover:text-text"}
                        />
                        {item.label}
                        {active && <span className="ml-auto text-[10px]">●</span>}
                      </Link>
                    );
                  }

                  return (
                    <button key={item.id} disabled className={`${base} cursor-not-allowed opacity-50`}>
                      <Icon size={18} className="text-subtle" />
                      {item.label}
                      <span className="ml-auto rounded-full bg-black/5 px-2 py-0.5 text-[10px] font-medium text-subtle">
                        Bientôt
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Pied : profil élève */}
        <div className="p-4">
          <div className="glass-inset flex items-center gap-3 rounded-2xl p-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 text-xs font-bold text-white">
              OZ
            </span>
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