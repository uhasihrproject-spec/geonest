const brands = [
  { name: "Geonest Mart", desc: "A modern multipurpose store built for convenience, speed, and quality." },
  { name: "Geonest Salon", desc: "Barbering & hairdressing with a clean, premium customer experience." },
  { name: "Geonest Prints", desc: "Printing and branding solutions delivered with professional standards." },
  { name: "Geonest Travel & Tour", desc: "Travel planning and tours made simple, reliable, and smooth." },
];

export default function AboutBrandsGrid() {
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
              Our companies
            </p>
            <h2 className="mt-4 text-3xl md:text-5xl font-semibold tracking-tight">
              Independent brands, shared backbone
            </h2>
            <p className="mt-6 text-neutral-600 max-w-2xl mx-auto leading-relaxed">
              Each venture runs its own operations, but Geonest sets the standard and supports growth.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-2">
            {brands.map((b) => (
              <div
                key={b.name}
                className="rounded-3xl bg-white p-8 border border-neutral-200 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.15)] transition hover:-translate-y-1"
              >
                <div className="h-1 w-16 rounded bg-yellow-400/80" />
                <h3 className="mt-5 text-xl font-semibold text-neutral-900">{b.name}</h3>
                <p className="mt-3 text-neutral-600 leading-relaxed">{b.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-14 h-[2px] w-20 bg-yellow-400/70 mx-auto" />
        </div>
      </div>
    </section>
  );
}
