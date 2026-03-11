export default function HowGeonestWorks() {
  return (
    <section className="relative bg-neutral-50 py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        {/* Header */}
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-xs uppercase tracking-[0.25em] text-neutral-500">
            Our approach
          </p>

          <h2 className="mt-3 text-3xl md:text-4xl font-semibold tracking-tight text-neutral-900">
            Built as a system, not a shortcut
          </h2>

          <p className="mt-4 text-neutral-600 text-base md:text-lg leading-relaxed">
            Geonest Ventures operates as a structured group.
            Each business is built carefully, managed professionally,
            and aligned under one standard of quality.
          </p>
        </div>

        {/* Steps */}
        <div className="mt-16 grid gap-8 md:grid-cols-3">
          {[
            {
              step: "01",
              title: "Foundation First",
              text: "Every Geonest venture starts with structure — clear operations, defined roles, and consistent branding before growth begins.",
            },
            {
              step: "02",
              title: "Operate Independently",
              text: "Each business runs as its own unit, focused on its customers and services, while benefiting from the strength of the Geonest brand.",
            },
            {
              step: "03",
              title: "Grow With Control",
              text: "Expansion is intentional. We improve quality, systems, and people before adding new locations or offerings.",
            },
          ].map((item) => (
            <div
              key={item.step}
              className="group relative rounded-3xl border border-neutral-200 bg-white p-8
                         hover:shadow-[0_20px_60px_rgba(0,0,0,0.08)]
                         transition-all duration-300"
            >
              {/* Step number */}
              <div className="absolute -top-4 -left-4 h-12 w-12 rounded-2xl bg-yellow-400 text-neutral-900 font-semibold grid place-items-center">
                {item.step}
              </div>

              <h3 className="mt-6 text-lg font-semibold text-neutral-900">
                {item.title}
              </h3>

              <p className="mt-3 text-sm text-neutral-600 leading-relaxed">
                {item.text}
              </p>

              <div className="mt-6 h-[2px] w-12 bg-yellow-400/70 transition-all group-hover:w-20" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
