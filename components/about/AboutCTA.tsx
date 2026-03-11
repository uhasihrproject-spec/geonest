export default function AboutCTA() {
  return (
    <section className="relative min-h-[100svh] overflow-hidden bg-white">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-48 -left-48 h-[700px] w-[700px] rounded-full bg-yellow-300/18 blur-[120px]" />
        <div className="absolute -bottom-48 -right-48 h-[720px] w-[720px] rounded-full bg-neutral-900/10 blur-[140px]" />
        <div className="absolute inset-0 bg-gradient-to-b from-white via-white to-neutral-100/40" />
      </div>

      <div className="relative mx-auto flex min-h-[100svh] max-w-7xl items-center px-4 sm:px-6">
        <div className="mx-auto w-full max-w-5xl rounded-[2rem] bg-neutral-900 p-10 text-white shadow-[0_30px_90px_-35px_rgba(0,0,0,0.55)]">
          <p className="text-xs uppercase tracking-[0.25em] text-white/60">
            Next step
          </p>

          <h2 className="mt-4 text-3xl md:text-5xl font-semibold tracking-tight">
            Build with Geonest Ventures
          </h2>

          <p className="mt-6 max-w-2xl text-white/80 leading-relaxed">
            Whether you want to partner, collaborate, or support one of our ventures,
            we’re open to aligned opportunities focused on quality, structure, and growth.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <a
              href="/contact"
              className="rounded-2xl bg-yellow-400 px-6 py-3 text-sm font-semibold text-black transition hover:-translate-y-0.5 hover:shadow-md"
            >
              Contact Us
            </a>
            <a
              href="/companies"
              className="rounded-2xl border border-white/20 bg-white/10 px-6 py-3 text-sm font-medium text-white transition hover:-translate-y-0.5 hover:bg-white/15"
            >
              View Companies
            </a>
          </div>

          <div className="mt-10 h-[2px] w-20 bg-yellow-400/70" />
        </div>
      </div>
    </section>
  );
}
