const steps = [
  { t: "Design the experience", d: "We define how the service should feel — fast, clean, and professional." },
  { t: "Build the system", d: "Workflows, roles, and quality checks are created for consistency." },
  { t: "Enable with technology", d: "Tools help us manage faster, track better, and reduce mistakes." },
  { t: "Scale with control", d: "We grow with standards — not chaos — keeping quality stable as we expand." },
];

export default function AboutHowWeWork() {
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
              How we work
            </p>
            <h2 className="mt-4 text-3xl md:text-5xl font-semibold tracking-tight">
              Clean systems. Strong delivery.
            </h2>
            <p className="mt-6 text-neutral-600 max-w-2xl mx-auto leading-relaxed">
              A repeatable operating model that keeps every venture reliable — even as we grow.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-2">
            {steps.map((s, idx) => (
              <div
                key={s.t}
                className="rounded-3xl bg-white p-8 border border-neutral-200 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.15)] transition hover:-translate-y-1"
              >
                <div className="flex items-center justify-between">
                  <div className="h-1 w-16 rounded bg-yellow-400/80" />
                  <span className="text-xs text-neutral-500">Step {idx + 1}</span>
                </div>
                <h3 className="mt-5 text-xl font-semibold text-neutral-900">{s.t}</h3>
                <p className="mt-3 text-neutral-600 leading-relaxed">{s.d}</p>
              </div>
            ))}
          </div>

          <div className="mt-14 h-[2px] w-20 bg-yellow-400/70 mx-auto" />
        </div>
      </div>
    </section>
  );
}
