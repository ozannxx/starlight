export default function AmbientBackground() {
  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 z-0 overflow-hidden pointer-events-none"
    >
      {/* Orbe 1 — Ambre/Orange (Haut Gauche) */}
      <div
        className="absolute top-[-10%] left-[-5%] w-[60vw] h-[60vw] rounded-full opacity-60 animate-float-slow"
        style={{
          background: "radial-gradient(circle, #FF9F0A 0%, transparent 70%)",
          filter: "blur(80px)",
        }}
      />
      {/* Orbe 2 — Pêche/Rose (Centre Droite) */}
      <div
        className="absolute top-[20%] right-[-10%] w-[55vw] h-[55vw] rounded-full opacity-50 animate-float-medium"
        style={{
          background: "radial-gradient(circle, #FF375F 0%, transparent 70%)",
          filter: "blur(90px)",
        }}
      />
      {/* Orbe 3 — Bleu Ciel (Bas Gauche) */}
      <div
        className="absolute bottom-[-15%] left-[20%] w-[50vw] h-[50vw] rounded-full opacity-40 animate-float-fast"
        style={{
          background: "radial-gradient(circle, #0A84FF 0%, transparent 70%)",
          filter: "blur(100px)",
        }}
      />
      {/* Orbe 4 — Lavande/Violet (Milieu Centre) */}
      <div
        className="absolute top-[40%] left-[30%] w-[40vw] h-[40vw] rounded-full opacity-30 animate-float-slow"
        style={{
          background: "radial-gradient(circle, #5E5CE6 0%, transparent 70%)",
          filter: "blur(70px)",
        }}
      />
    </div>
  );
}