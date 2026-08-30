"use client";

import { memo, useEffect, useState } from "react";

const STEPS = ["Inspire…", "Retiens…", "Expire…", "Retiens…"];

function Breathing_() {
  const [step, setStep] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setStep((s) => (s + 1) % 4), 4000);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="flex flex-col items-center gap-4 py-4">
      <div className="relative flex h-44 w-44 items-center justify-center">
        <div className="absolute inset-0 rounded-full border border-accent/20" />
        <div
          className="h-full w-full rounded-full bg-accent/20"
          style={{ animation: "breathe 16s ease-in-out infinite" }}
        />
        <span className="absolute text-sm font-semibold text-text">{STEPS[step]}</span>
      </div>
      <p className="text-xs text-subtle">Respiration carrée 4-4-4-4 — suis le cercle</p>
    </div>
  );
}

export const Breathing = memo(Breathing_);