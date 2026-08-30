export default function AmbientBackground() {
  return (
    <div aria-hidden="true" className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
      {/* 1 — Ambre massif (haut gauche) */}
      <div
        className="absolute -top-[15%] -left-[10%] h-[70vw] w-[70vw] rounded-full opacity-80 animate-orb-drift-1"
        style={{
          background: "radial-gradient(circle at 35% 35%, #FFC53D 0%, #FF7A00 45%, transparent 70%)",
          filter: "blur(80px)",
          animationDuration: "16s",
        }}
      />
      {/* 2 — Rose fuchsia (droite) */}
      <div
        className="absolute top-[10%] -right-[15%] h-[60vw] w-[60vw] rounded-full opacity-70 animate-orb-drift-2"
        style={{
          background: "radial-gradient(circle at 60% 40%, #FF6B9D 0%, #FF2D78 45%, transparent 70%)",
          filter: "blur(90px)",
          animationDuration: "12s",
        }}
      />
      {/* 3 — Bleu électrique (bas gauche) */}
      <div
        className="absolute -bottom-[20%] left-[5%] h-[60vw] w-[60vw] rounded-full opacity-70 animate-orb-drift-3"
        style={{
          background: "radial-gradient(circle at 40% 60%, #5AC8FA 0%, #0A84FF 45%, transparent 70%)",
          filter: "blur(100px)",
          animationDuration: "18s",
        }}
      />
      {/* 4 — Multicolore qui change de teinte (centre) */}
      <div className="absolute top-[30%] left-[25%] h-[55vw] w-[55vw] animate-hue-cycle">
        <div
          className="h-full w-full rounded-full opacity-70 animate-orb-drift-1"
          style={{
            background: "radial-gradient(circle at 40% 40%, #FF6B9D 0%, #A855F7 45%, transparent 70%)",
            filter: "blur(85px)",
            animationDuration: "20s",
          }}
        />
      </div>
      {/* 5 — Vert menthe (bas droite) */}
      <div
        className="absolute -bottom-[10%] -right-[5%] h-[50vw] w-[50vw] rounded-full opacity-60 animate-orb-drift-2"
        style={{
          background: "radial-gradient(circle at 45% 45%, #A8F0C6 0%, #30D158 45%, transparent 70%)",
          filter: "blur(75px)",
          animationDuration: "14s",
        }}
      />
      {/* 6 — Jaune pulsé (haut centre) */}
      <div
        className="absolute -top-[10%] left-[35%] h-[35vw] w-[35vw] rounded-full animate-orb-pulse"
        style={{
          background: "radial-gradient(circle, #FFE066 0%, #FFC300 50%, transparent 72%)",
          filter: "blur(60px)",
        }}
      />
      {/* 7 — Corail (bas centre) */}
      <div
        className="absolute bottom-[5%] left-[30%] h-[40vw] w-[40vw] rounded-full opacity-60 animate-orb-drift-3"
        style={{
          background: "radial-gradient(circle at 55% 55%, #FF9F8A 0%, #FF6B4A 45%, transparent 70%)",
          filter: "blur(70px)",
          animationDuration: "13s",
        }}
      />
    </div>
  );
}