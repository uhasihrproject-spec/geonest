const timeline = [
  { title: "Foundation", desc: "We set the vision, structure, and standard for a multi-brand ecosystem." },
  { title: "Strengthen core brands", desc: "Each venture is built to operate smoothly with consistent quality." },
  { title: "Tech integration", desc: "Smarter tools for management, reporting, and customer experience." },
  { title: "Scale & expansion", desc: "Grow into more locations and new ventures without losing standards." },
];

export default function AboutTimeline() {
  return (
    <section className="relative min-h-[100svh] overflow-hidden bg-white">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-48 -left-48 h-[700px] w-[700px] rounded-full bg-yellow-300/18 blur-[120px]" />
        <div className="absolute -bottom-48 -right-48 h-[720px] w-[720px] rounded-full bg-neutral-900/10 blur-[140px]" />
        <div className="absolute inset-0 bg-gradient-to-b from-white via-white to-neutral-100/40" />
      </div>

      <div className="relative mx-auto flex min-h-[100svh] max-w-7xl items-center px-4 sm:px-6">
        <div className="w-full">
          <div className="mx-auto max-w-4xl text-center">
            <p className="text-xs uppercase tracking-[0.25em] text-neutral-500">
              Roadmap
            </p>
            <h2 className="mt-4 text-3xl md:text-5xl font-semibold tracking-tight">
              Built for long-term growth
            </h2>
            <p className="mt-6 text-neutral-600 max-w-2xl mx-auto leading-relaxed">
              We move step by step — strong foundation first, then expansion with control.
            </p>
          </div>

          <div className="mt-12 grid gap-4 max-w-4xl mx-auto">
            {timeline.map((t, idx) => (
              <div
                key={t.title}
                className="rounded-3xl bg-white p-7 border border-neutral-200 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.15)] transition hover:-translate-y-1"
              >
                <div className="flex items-start gap-4">
                  <div className="mt-1 flex h-8 w-8 items-center justify-center rounded-full bg-yellow-100 text-sm font-semibold text-neutral-900">
                    {idx + 1}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-neutral-900">{t.title}</h3>
                    <p className="mt-2 text-neutral-600 leading-relaxed">{t.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-14 h-[2px] w-20 bg-yellow-400/70 mx-auto" />
        </div>
      </div>
    </section>
  );
}
