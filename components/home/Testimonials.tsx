const testimonials = [
  {
    name: "Customer",
    quote:
      "Everything felt clean and organized. I got what I needed quickly and the service was respectful.",
    tag: "Mart",
  },
  {
    name: "Client",
    quote:
      "The experience was premium. Communication was clear and the delivery felt professional.",
    tag: "Print/Service",
  },
  {
    name: "Guest",
    quote:
      "I loved the smooth process. It was easy to understand what to do and support was fast.",
    tag: "Travels",
  },
];

export default function Testimonials() {
  return (
    <section className="relative bg-neutral-50 py-16 md:py-24 fade-up">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-xs uppercase tracking-[0.25em] text-neutral-500">
            Trust
          </p>
          <h2 className="mt-3 text-3xl md:text-4xl font-semibold tracking-tight text-neutral-900">
            Built on consistency and customer experience
          </h2>
          <p className="mt-4 text-neutral-600 text-base md:text-lg leading-relaxed">
            Geonest is designed to feel clean, premium, and reliable across every unit.
          </p>
        </div>

        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {testimonials.map((t, i) => (
            <div
              key={i}
              className="rounded-3xl border border-neutral-200 bg-white p-7
                         shadow-[0_16px_55px_rgba(0,0,0,0.06)]
                         hover:shadow-[0_26px_80px_rgba(0,0,0,0.12)]
                         hover:-translate-y-2 transition-all duration-300"
            >
              <p className="text-sm text-neutral-600 leading-relaxed">
                “{t.quote}”
              </p>

              <div className="mt-6 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-neutral-900">{t.name}</p>
                  <p className="text-xs text-neutral-500">{t.tag}</p>
                </div>
                <div className="h-10 w-10 rounded-2xl border border-neutral-200 bg-neutral-50 grid place-items-center">
                  ✦
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* small trust strip */}
        <div className="mt-14 rounded-3xl border border-neutral-200 bg-white p-6 text-center">
          <p className="text-sm text-neutral-600">
            One standard across all units: <span className="font-semibold text-neutral-900">Clean • Premium • Reliable</span>
          </p>
        </div>
      </div>
    </section>
  );
}
