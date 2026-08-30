const ORBS = [
  { pos: "-top-[15%] -left-[10%] h-[70vw] w-[70vw]", anim: "animate-orb-drift-1", dur: "18s", op: 0.75, c: "var(--orb1)", at: "35% 35%" },
  { pos: "top-[10%] -right-[15%] h-[60vw] w-[60vw]", anim: "animate-orb-drift-2", dur: "13s", op: 0.65, c: "var(--orb2)", at: "60% 40%" },
  { pos: "-bottom-[20%] left-[5%] h-[60vw] w-[60vw]", anim: "animate-orb-drift-3", dur: "20s", op: 0.65, c: "var(--orb3)", at: "40% 60%" },
  { pos: "top-[30%] left-[25%] h-[55vw] w-[55vw]", anim: "animate-orb-drift-1", dur: "22s", op: 0.55, c: "var(--orb4)", at: "40% 40%" },
  { pos: "-bottom-[10%] -right-[5%] h-[50vw] w-[50vw]", anim: "animate-orb-drift-2", dur: "15s", op: 0.55, c: "var(--orb5)", at: "45% 45%" },
  { pos: "-top-[10%] left-[35%] h-[35vw] w-[35vw]", anim: "animate-orb-pulse", dur: "", op: 0.6, c: "var(--orb6)", at: "50% 50%" },
  { pos: "bottom-[5%] left-[30%] h-[40vw] w-[40vw]", anim: "animate-orb-drift-3", dur: "16s", op: 0.5, c: "var(--orb7)", at: "55% 55%" },
];

const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='160' height='160' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E\")";

export default function AmbientBackground() {
  return (
    <div aria-hidden="true" className="ambient fixed inset-0 z-0 overflow-hidden pointer-events-none">
      {ORBS.map((o, i) => (
        <div
          key={i}
          className={`absolute rounded-full ${o.pos} ${o.anim}`}
          style={{
            background: `radial-gradient(circle at ${o.at}, ${o.c} 0%, color-mix(in srgb, ${o.c} 55%, transparent) 25%, color-mix(in srgb, ${o.c} 25%, transparent) 48%, transparent 70%)`,
            opacity: o.op,
            ...(o.dur ? { animationDuration: o.dur } : {}),
          }}
        />
      ))}
      {/* Grain matière */}
      <div className="absolute inset-0" style={{ backgroundImage: GRAIN, opacity: 0.045, mixBlendMode: "overlay" }} />
      {/* Voile zen */}
      <div className="zen-veil" />
    </div>
  );
}