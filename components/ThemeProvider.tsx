"use client";

import { createContext, useContext, useEffect, useState } from "react";

export type ThemeId = "solar" | "marine" | "yuki" | "sakura" | "matcha" | "midnight";

export const THEMES: { id: ThemeId; name: string; desc: string; bg: string; accent: string }[] = [
  { id: "solar", name: "Solar Amber", desc: "Ambre chaud", bg: "#F2EFE9", accent: "#FF9F0A" },
  { id: "marine", name: "Bleu Marine", desc: "Océan profond", bg: "#EBF1F7", accent: "#1D6FE0" },
  { id: "yuki", name: "Yuki", desc: "Neige glacée", bg: "#F7FAFD", accent: "#38BDF8" },
  { id: "sakura", name: "Sakura", desc: "Fleurs de cerisier", bg: "#FAF0F3", accent: "#F0537E" },
  { id: "matcha", name: "Matcha", desc: "Thé vert", bg: "#F0F4EA", accent: "#5F9E3F" },
  { id: "midnight", name: "Midnight", desc: "Nuit étoilée", bg: "#0E1116", accent: "#8F9CFF" },
];

const KEY = "starlight-theme";
const ThemeCtx = createContext<{ theme: ThemeId; setTheme: (t: ThemeId) => void }>({ theme: "solar", setTheme: () => {} });
export const useTheme = () => useContext(ThemeCtx);

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeId>("solar");

  useEffect(() => {
    const saved = (localStorage.getItem(KEY) as ThemeId) || "solar";
    setThemeState(saved);
    document.documentElement.dataset.theme = saved;
  }, []);

  const setTheme = (t: ThemeId) => {
    setThemeState(t);
    localStorage.setItem(KEY, t);
    document.documentElement.dataset.theme = t;
  };

  return <ThemeCtx.Provider value={{ theme, setTheme }}>{children}</ThemeCtx.Provider>;
}