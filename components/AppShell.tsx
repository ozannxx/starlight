"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Search, Bell, Sparkles } from "lucide-react";
import AppSidebar, { NAV_ITEMS } from "./AppSidebar";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  const activeLabel =
    NAV_ITEMS.find((item) =>
      item.href ? (item.href === "/" ? pathname === "/" : pathname.startsWith(item.href)) : false
    )?.label ?? "Tableau de bord";

  return (
    <>
      <AppSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} pathname={pathname} />

      <main className="h-dvh overflow-y-auto p-5 sm:p-8">
        <div className="mx-auto flex max-w-[1600px] flex-col gap-4 sm:gap-5">
          {/* Header */}
          <header className="flex items-center justify-between gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              aria-haspopup="dialog"
              aria-expanded={sidebarOpen}
              className="glass glass-hover flex items-center gap-3 rounded-2xl py-2.5 pl-3 pr-5"
            >
              <span className="glass-inset flex h-9 w-9 items-center justify-center rounded-xl text-accent">
                <Sparkles size={18} />
              </span>
              <span className="text-left">
                <span className="block text-sm font-semibold leading-tight tracking-tight text-text">
                  Project Starlight
                </span>
                <span className="block text-[11px] leading-tight text-subtle">{activeLabel}</span>
              </span>
            </button>

            <div className="flex items-center gap-2.5">
              <button
                aria-label="Rechercher"
                className="glass glass-hover hidden h-11 w-11 items-center justify-center rounded-2xl text-subtle sm:flex"
              >
                <Search size={18} />
              </button>
              <button
                aria-label="Notifications"
                className="glass glass-hover relative flex h-11 w-11 items-center justify-center rounded-2xl text-subtle"
              >
                <Bell size={18} />
                <span className="absolute right-3 top-3 h-2 w-2 rounded-full bg-accent ring-2 ring-white/80" />
              </button>
              <button className="glass glass-hover flex items-center gap-2.5 rounded-2xl py-1.5 pl-1.5 pr-4">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 text-xs font-bold text-white">
                  OZ
                </span>
                <span className="hidden text-sm font-medium text-text sm:block">Ozan</span>
              </button>
            </div>
          </header>

          {children}
        </div>
      </main>
    </>
  );
}