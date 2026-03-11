export default function OurStandards() {
  return (
    <section className="relative bg-neutral-50 py-16 md:py-24 fade-up">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        {/* Header */}
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-xs uppercase tracking-[0.25em] text-neutral-500">
            Our standard
          </p>

          <h2 className="mt-3 text-3xl md:text-4xl font-semibold tracking-tight text-neutral-900">
            One standard across every Geonest unit
          </h2>

          <p className="mt-4 text-neutral-600 text-base md:text-lg leading-relaxed">
            Regardless of the service you choose, Geonest operates with the same
            level of professionalism, care, and consistency.
          </p>
        </div>

        {/* Standards grid */}
        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {[
            {
              title: "Professional Operations",
              text: "Each unit follows clear processes, trained staff routines, and structured service delivery — no shortcuts, no confusion.",
            },
            {
              title: "Clean & Modern Experience",
              text: "From physical spaces to digital interfaces, we maintain clean environments, simple layouts, and an experience that feels premium.",
            },
            {
              title: "Clear Communication",
              text: "We prioritize clarity — pricing, services, timelines, and responses are communicated in a straightforward and respectful way.",
            },
            {
              title: "Consistency Across Units",
              text: "While each business has its own identity, all Geonest units meet the same baseline for quality, service, and customer care.",
            },
            {
              title: "Customer-First Culture",
              text: "Every decision is made with the customer in mind — comfort, trust, and long-term satisfaction matter more than quick wins.",
            },
            {
              title: "Built to Scale Responsibly",
              text: "Geonest grows carefully. Systems, people, and quality are strengthened before expansion, ensuring long-term reliability.",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="group rounded-3xl border border-neutral-200 bg-white p-7
                         shadow-[0_16px_55px_rgba(0,0,0,0.06)]
                         hover:shadow-[0_26px_80px_rgba(0,0,0,0.12)]
                         hover:-translate-y-2 transition-all duration-300"
            >
              {/* Accent line */}
              <div className="h-[2px] w-16 bg-yellow-400/70 mb-5 transition-all group-hover:w-24" />

              <h3 className="text-lg font-semibold text-neutral-900">
                {item.title}
              </h3>

              <p className="mt-3 text-sm text-neutral-600 leading-relaxed">
                {item.text}
              </p>
            </div>
          ))}
        </div>

        {/* Closing confidence line */}
        <div className="mt-16 max-w-3xl mx-auto text-center">
          <p className="text-sm text-neutral-600">
            Different services. Different interfaces.
            <br />
            <span className="font-semibold text-neutral-900">
              One Geonest standard.
            </span>
          </p>
        </div>
      </div>
    </section>
  );
}
