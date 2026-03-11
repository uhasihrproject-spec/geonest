export default function AboutGeonest() {
  return (
    <section id="about" className="relative bg-white py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        {/* Section header */}
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-xs uppercase tracking-[0.25em] text-neutral-500">
            About Geonest
          </p>

          <h2 className="mt-3 text-3xl md:text-4xl font-semibold tracking-tight text-neutral-900">
            One group. Multiple trusted businesses.
          </h2>

          <p className="mt-4 text-neutral-600 text-base md:text-lg leading-relaxed">
            Geonest Ventures is a parent brand built to operate and grow
            service-focused businesses under one strong, trusted identity.
            Each venture runs independently, but all share the same standard
            of quality, professionalism, and customer experience.
          </p>
        </div>

        {/* Divider */}
        <div className="mt-12 h-px w-full bg-neutral-200" />

        {/* Values / principles (NOT services) */}
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {[
            {
              title: "Structured Operations",
              text: "Each Geonest venture follows clear systems and processes, ensuring consistency, accountability, and reliable service delivery across all units.",
            },
            {
              title: "Customer-First Culture",
              text: "From the shop floor to the salon chair, we prioritize customer comfort, satisfaction, and long-term trust in everything we do.",
            },
            {
              title: "Long-Term Growth",
              text: "Geonest Ventures is built for sustainability — expanding carefully, improving continuously, and investing in people and quality over shortcuts.",
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className="group rounded-3xl border border-neutral-200 bg-white p-6
                         hover:shadow-[0_18px_60px_rgba(0,0,0,0.08)]
                         transition-all duration-300"
            >
              <div className="h-1 w-12 bg-yellow-400/70 mb-4 transition-all group-hover:w-20" />
              <h3 className="text-lg font-semibold text-neutral-900">
                {item.title}
              </h3>
              <p className="mt-3 text-sm text-neutral-600 leading-relaxed">
                {item.text}
              </p>
            </div>
          ))}
        </div>

        {/* Subtle stats row (confidence, not loud) */}
        <div className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-8 text-center">
          {[
            { value: "4+", label: "Business Units" },
            { value: "100%", label: "Service-Based" },
            { value: "Premium", label: "Brand Standard" },
            { value: "Ghana", label: "Rooted Locally" },
          ].map((stat) => (
            <div key={stat.label}>
              <p className="text-2xl font-semibold text-neutral-900">
                {stat.value}
              </p>
              <p className="mt-1 text-xs uppercase tracking-wide text-neutral-500">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
