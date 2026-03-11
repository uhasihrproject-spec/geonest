import Image from "next/image";

const services = [
  {
    id: "mart",
    pageHref: "/mart",
    contactHref: "/contact?service=mart",
    contactLabel: "Contact Mart",
    viewLabel: "View Geonest Mart",

    name: "Geonest Mart",
    tagline: "Everyday essentials — clean shopping, fair pricing, fast service.",
    description:
      "A reliable shopping experience with quality goods, neat shelves, and quick support. Built for convenience, trust, and speed.",
    logo: "/brands/geonest-mart.svg",

    // ORANGE (Mart)
    pill: "border-orange-200 bg-orange-500/10 text-orange-700",
    line: "bg-orange-500/80",
    glow: "from-orange-500/18 via-white to-white",
    primaryBtn: "bg-orange-600 hover:bg-orange-700",
    secondaryBtn: "border-orange-200 text-orange-700 hover:bg-orange-50",
  },
  {
    id: "pharmacy",
    pageHref: "/pharmacy",
    contactHref: "/contact?service=pharmacy",
    contactLabel: "Contact Pharmacy",
    viewLabel: "View Geonest Pharmacy",

    name: "Geonest Pharmacy",
    tagline: "Trusted pharmacy support — clean service and clear guidance.",
    description:
      "A professional pharmacy experience focused on reliability, speed, and customer care. Built to feel organized, safe, and easy to navigate.",
    logo: "/brands/geonest-pharmacy.svg",

    // GREEN (Pharmacy)
    pill: "border-green-200 bg-green-500/10 text-green-700",
    line: "bg-green-500/80",
    glow: "from-green-500/16 via-white to-white",
    primaryBtn: "bg-green-600 hover:bg-green-700",
    secondaryBtn: "border-green-200 text-green-700 hover:bg-green-50",
  },
  {
    id: "salon",
    pageHref: "/salon",
    contactHref: "/contact?service=salon",
    contactLabel: "Contact Salon",
    viewLabel: "View Geonest Salon",

    name: "Geonest Salon",
    tagline: "Barbering & hairdressing — premium feel, clean results.",
    description:
      "A modern salon experience built on hygiene, professionalism, and detail. From sharp cuts to styling and care — consistently premium.",
    logo: "/brands/geonest-salon.svg",

    // GREY/BLACK (Salon)
    pill: "border-neutral-200 bg-neutral-900/5 text-neutral-700",
    line: "bg-neutral-900/70",
    glow: "from-neutral-900/10 via-white to-white",
    primaryBtn: "bg-neutral-900 hover:bg-neutral-800",
    secondaryBtn: "border-neutral-300 text-neutral-800 hover:bg-neutral-50",
  },
  {
    id: "travels",
    pageHref: "/travels",
    contactHref: "/contact?service=travels",
    contactLabel: "Contact Travels",
    viewLabel: "View Geonest Travels",

    name: "Geonest Travels",
    tagline: "Trips, bookings, and planning — smooth from start to finish.",
    description:
      "We help you plan travel with less stress: bookings, coordination, and tours designed to feel clear, organized, and enjoyable.",
    logo: "/brands/geonest-travels.svg",

    // BLUE (Travels)
    pill: "border-blue-200 bg-blue-500/10 text-blue-700",
    line: "bg-blue-600/80",
    glow: "from-blue-600/16 via-white to-white",
    primaryBtn: "bg-blue-600 hover:bg-blue-700",
    secondaryBtn: "border-blue-200 text-blue-700 hover:bg-blue-50",
  },
];

function ServiceBlock({
  s,
  reverse,
}: {
  s: (typeof services)[number];
  reverse?: boolean;
}) {
  return (
    <section
      id={s.id}
      className="relative overflow-hidden bg-white py-14 md:py-20 fade-up"
    >
      {/* subtle tinted glow per brand */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className={[
            "absolute -top-24 -left-24 h-80 w-80 rounded-full blur-3xl floaty",
            `bg-gradient-to-br ${s.glow}`,
          ].join(" ")}
        />
        <div className="absolute inset-0 opacity-[0.04] bg-[radial-gradient(circle_at_50%_35%,rgba(0,0,0,0.06),transparent_55%)]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        <div
          className={[
            "grid items-center gap-10 md:grid-cols-2",
            reverse ? "md:[&>*:first-child]:order-2" : "",
          ].join(" ")}
        >
          {/* Left: Dedicated Card + SVG + bottom CTA (like screenshot) */}
          <div className="relative">
            <div
              className="rounded-3xl border border-neutral-200 bg-white p-6 md:p-7
                         shadow-[0_18px_60px_rgba(0,0,0,0.08)]
                         hover:shadow-[0_26px_80px_rgba(0,0,0,0.12)]
                         hover:-translate-y-2 hover:rotate-[0.2deg]
                         transition-all duration-300"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-neutral-900">
                    Dedicated unit
                  </p>
                  <p className="mt-1 text-xs text-neutral-500">
                    Brand color + identity stays consistent.
                  </p>
                </div>

                {/* SVG logo */}
                <div className="relative h-10 w-28">
                  <Image
                    src={s.logo}
                    alt={`${s.name} logo`}
                    fill
                    className="object-contain"
                  />
                </div>
              </div>

              <div className="mt-6 grid gap-3">
                {[
                  "Clean & professional experience",
                  "Fast response and clear communication",
                  "Quality you can recommend",
                ].map((x) => (
                  <div
                    key={x}
                    className="rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-700"
                  >
                    <span className="mr-2">✦</span>
                    {x}
                  </div>
                ))}
              </div>

              {/* Bottom CTA inside card (3rd CTA like screenshot) */}
              <div className="mt-6 rounded-2xl border border-neutral-200 bg-white p-4">
                <p className="text-sm font-medium text-neutral-900">
                  Want this service now?
                </p>
                <p className="mt-1 text-xs text-neutral-500">
                  Tap below and we’ll respond with next steps.
                </p>

                <a
                  href={s.contactHref}
                  className={[
                    "mt-4 relative overflow-hidden inline-flex w-full items-center justify-center rounded-2xl px-5 py-3 text-sm font-medium text-white transition active:scale-[0.98]",
                    "btn-shimmer",
                    s.primaryBtn,
                  ].join(" ")}
                >
                  {s.contactLabel}
                </a>
              </div>
            </div>

            {/* corner accents */}
            <div className="absolute -top-4 -left-4 h-16 w-16 rounded-2xl border border-neutral-200 bg-white/70" />
            <div className="absolute -bottom-4 -right-4 h-16 w-16 rounded-2xl border border-neutral-200 bg-white/70" />
          </div>

          {/* Right: Text + 2 CTAs (like screenshot) */}
          <div className="max-w-xl">
            <span
              className={[
                "inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium",
                s.pill,
              ].join(" ")}
            >
              Service
            </span>

            <h3 className="mt-4 text-4xl md:text-5xl font-semibold tracking-tight text-neutral-900">
              {s.name}
            </h3>

            <p className="mt-3 text-neutral-700 text-base md:text-lg">
              {s.tagline}
            </p>

            <div className={["mt-6 h-[2px] w-28", s.line].join(" ")} />

            <p className="mt-8 text-sm md:text-base text-neutral-600 leading-relaxed">
              {s.description}
            </p>

            {/* 2 CTAs on right (top area) */}
            <div className="mt-10 flex flex-col sm:flex-row gap-4">
              {/* Contact CTA */}
              <a
                href={s.contactHref}
                className={[
                  "relative overflow-hidden inline-flex items-center justify-center rounded-2xl px-6 py-3 text-sm font-medium text-white transition active:scale-[0.98]",
                  "btn-shimmer",
                  s.primaryBtn,
                ].join(" ")}
              >
                {s.contactLabel}
              </a>

              {/* View Company Page CTA */}
              <a
                href={s.pageHref}
                className={[
                  "inline-flex items-center justify-center gap-2 rounded-2xl px-6 py-3 text-sm font-semibold border transition active:scale-[0.98]",
                  s.secondaryBtn,
                ].join(" ")}
              >
                {s.viewLabel} <span aria-hidden className="opacity-80">→</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function ServicesShowcase() {
  return (
    <div id="services">
      {/* Intro */}
      <section className="bg-white py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-xs uppercase tracking-[0.25em] text-neutral-500">
              Our services
            </p>
            <h2 className="mt-3 text-3xl md:text-4xl font-semibold tracking-tight text-neutral-900">
              Each unit has its own identity — one shared standard
            </h2>
            <p className="mt-4 text-neutral-600 text-base md:text-lg leading-relaxed">
              We don’t mix everything together. Each Geonest service has a dedicated unit,
              clear brand color, and a focused customer experience.
            </p>
          </div>
        </div>
      </section>

      {/* Dedicated sections (layout like screenshot) */}
      <ServiceBlock s={services[0]} />
      <ServiceBlock s={services[1]} reverse />
      <ServiceBlock s={services[2]} />
      <ServiceBlock s={services[3]} reverse />
    </div>
  );
}
