const stats = [
  { value: "4+", label: "BUSINESS UNITS" },
  { value: "IT-DRIVEN", label: "OPERATIONS STYLE" },
  { value: "PREMIUM", label: "SERVICE STANDARD" },
];

export default function AboutStats() {
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
              By the numbers
            </p>
            <h2 className="mt-4 text-3xl md:text-5xl font-semibold tracking-tight">
              Built to scale without losing quality
            </h2>
            <p className="mt-6 text-neutral-600 max-w-2xl mx-auto leading-relaxed">
              Growth is only good when standards stay intact. That’s how we think.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {stats.map((s) => (
              <div
                key={s.label}
                className="rounded-3xl bg-white p-10 text-center border border-neutral-200 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.15)] transition hover:-translate-y-1"
              >
                <div className="text-4xl md:text-5xl font-semibold text-neutral-900">
                  {s.value}
                </div>
                <div className="mt-3 text-xs tracking-[0.22em] text-neutral-500">
                  {s.label}
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
