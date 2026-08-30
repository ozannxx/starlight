"use client";

import { createContext, useCallback, useContext, useRef, useState } from "react";
import { uiSound } from "@/lib/sounds";

const Ctx = createContext<{ toast: (msg: string, undo?: () => void) => void }>({ toast: () => {} });
export const useToast = () => useContext(Ctx);

export default function ToastProvider({ children }: { children: React.ReactNode }) {
  const [t, setT] = useState<{ id: number; msg: string; undo?: () => void } | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const toast = useCallback((msg: string, undo?: () => void) => {
    uiSound("pop");
    setT({ id: Date.now(), msg, undo });
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setT(null), 5000);
  }, []);

  return (
    <Ctx.Provider value={{ toast }}>
      {children}
      {t && (
        <div key={t.id} className="animate-toast-in fixed bottom-6 left-1/2 z-[70] -translate-x-1/2">
          <div className="glass-panel flex items-center gap-3 rounded-2xl border border-white/60 px-5 py-3 shadow-2xl">
            <span className="max-w-[60vw] truncate text-sm text-text">{t.msg}</span>
            {t.undo && (
              <button onClick={() => { t.undo?.(); setT(null); }} className="shrink-0 rounded-lg bg-accent px-3 py-1 text-xs font-semibold text-white">Annuler</button>
            )}
            <button onClick={() => setT(null)} aria-label="Fermer" className="shrink-0 text-subtle transition-colors hover:text-text">✕</button>
          </div>
        </div>
      )}
    </Ctx.Provider>
  );
}