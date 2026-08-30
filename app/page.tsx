export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center p-6 sm:p-10">
      <div className="w-full max-w-lg">
        <section className="glass glass-hover rounded-[2rem] p-8">
          <span className="glass-inset inline-flex rounded-full px-4 py-1.5 text-xs font-medium uppercase tracking-widest text-subtle">
            Design System
          </span>

          <h1 className="mt-5 text-3xl font-semibold tracking-tight text-text">
            Solar Amber
          </h1>
          <p className="mt-2 leading-relaxed text-subtle">
            Ultra-Glassmorphism + Neumorphism : flou 40px, saturation 200 %,
            reflets internes et halos pastels animés.
          </p>

          <div className="glass-inset mt-6 grid grid-cols-3 gap-4 rounded-2xl p-5 text-center">
            <div>
              <p className="text-2xl font-bold text-text">40px</p>
              <p className="mt-1 text-xs text-subtle">Blur</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-text">200%</p>
              <p className="mt-1 text-xs text-subtle">Saturation</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-accent">4</p>
              <p className="mt-1 text-xs text-subtle">Orbes</p>
            </div>
          </div>

          <button
            type="button"
            className="mt-6 w-full rounded-xl bg-accent py-3.5 font-semibold text-white shadow-lg shadow-accent/30 transition-all duration-300 hover:-translate-y-0.5 hover:brightness-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
          >
            Commencer
          </button>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <button className="glass glass-hover rounded-xl py-3 text-sm font-medium text-text">
              Secondaire
            </button>
            <button className="glass-inset rounded-xl py-3 text-sm font-medium text-subtle">
              Tertiaire
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}