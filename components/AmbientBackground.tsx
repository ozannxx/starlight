const ORBS = [
  { pos: "-top-[15%] -left-[10%] h-[70vw] w-[70vw]", anim: "animate-orb-drift-1", dur: "16s", blur: 80, op: 0.8, color: "var(--orb1)", at: "35% 35%" },
  { pos: "top-[10%] -right-[15%] h-[60vw] w-[60vw]", anim: "animate-orb-drift-2", dur: "12s", blur: 90, op: 0.7, color: "var(--orb2)", at: "60% 40%" },
  { pos: "-bottom-[20%] left-[5%] h-[60vw] w-[60vw]", anim: "animate-orb-drift-3", dur: "18s", blur: 100, op: 0.7, color: "var(--orb3)", at: "40% 60%" },
  { pos: "top-[30%] left-[25%] h-[55vw] w-[55vw]", anim: "animate-orb-drift-1", dur: "20s", blur: 85, op: 0.7, color: "var(--orb4)", at: "40% 40%", hue: true },
  { pos: "-bottom-[10%] -right-[5%] h-[50vw] w-[50vw]", anim: "animate-orb-drift-2", dur: "14s", blur: 75, op: 0.6, color: "var(--orb5)", at: "45% 45%" },
  { pos: "-top-[10%] left-[35%] h-[35vw] w-[35vw]", anim: "animate-orb-pulse", dur: "", blur: 60, op: 0.8, color: "var(--orb6)", at: "50% 50%" },
  { pos: "bottom-[5%] left-[30%] h-[40vw] w-[40vw]", anim: "animate-orb-drift-3", dur: "13s", blur: 70, op: 0.6, color: "var(--orb7)", at: "55% 55%" },
];

export default function AmbientBackground() {
  return (
    <div aria-hidden="true" className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
      {ORBS.map((o, i) => (
        <div
          key={i}
          className={`absolute rounded-full ${o.pos} ${o.anim}${o.hue ? " animate-hue-cycle" : ""}`}
          style={{
            background: `radial-gradient(circle at ${o.at}, ${o.color} 0%, transparent 70%)`,
            filter: `blur(${o.blur}px)`,
            opacity: o.op,
            ...(o.dur ? { animationDuration: o.dur } : {}),
          }}
        />
      ))}
    </div>
  );
}