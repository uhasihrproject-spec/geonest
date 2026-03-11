const faqs = [
  {
    q: "Is Geonest one business or multiple businesses?",
    a: "Geonest Ventures is the parent brand. Under it, each unit operates as its own business with a dedicated interface and customer experience.",
  },
  {
    q: "How do I contact a specific unit?",
    a: "Use the contact buttons under that service (e.g., Contact Pharmacy). It will take you to the contact page already set for that unit.",
  },
  {
    q: "Do all units share the same branding?",
    a: "Yes — they share the Geonest standard, but each unit has its own color identity and interface to match its purpose.",
  },
  {
    q: "Where are you located?",
    a: "We’re based in Ghana. Exact unit locations and working hours will be shown on each company’s dedicated page.",
  },
];

export default function FAQCTA() {
  return (
    <section id="contact" className="relative bg-white py-16 md:py-24 fade-up">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-2 items-start">
          {/* FAQs */}
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-neutral-500">
              FAQ
            </p>
            <h2 className="mt-3 text-3xl md:text-4xl font-semibold tracking-tight text-neutral-900">
              Quick answers
            </h2>
            <p className="mt-4 text-neutral-600 text-base md:text-lg leading-relaxed">
              Clear info, no confusion — here’s how Geonest works.
            </p>

            <div className="mt-10 space-y-3">
              {faqs.map((f) => (
                <details
                  key={f.q}
                  className="group rounded-3xl border border-neutral-200 bg-white p-6
                             shadow-[0_12px_40px_rgba(0,0,0,0.04)]
                             open:shadow-[0_22px_70px_rgba(0,0,0,0.10)]
                             transition-all"
                >
                  <summary className="cursor-pointer list-none flex items-center justify-between gap-4">
                    <span className="text-sm font-semibold text-neutral-900">
                      {f.q}
                    </span>
                    <span className="h-9 w-9 rounded-2xl border border-neutral-200 bg-neutral-50 grid place-items-center text-neutral-700 group-open:rotate-45 transition">
                      +
                    </span>
                  </summary>
                  <p className="mt-4 text-sm text-neutral-600 leading-relaxed">
                    {f.a}
                  </p>
                </details>
              ))}
            </div>
          </div>

          {/* CTA Card */}
          <div className="rounded-3xl border border-neutral-200 bg-neutral-50 p-8 md:p-10
                          shadow-[0_20px_70px_rgba(0,0,0,0.08)]
                          hover:-translate-y-2 transition-all duration-300">
            <p className="text-xs uppercase tracking-[0.25em] text-neutral-500">
              Contact
            </p>
            <h3 className="mt-3 text-3xl font-semibold tracking-tight text-neutral-900">
              Ready to reach Geonest?
            </h3>
            <p className="mt-4 text-neutral-600 leading-relaxed">
              Choose a unit (Mart, Pharmacy, Salon, Travels) and we’ll respond with the next steps.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <a
                href="/contact"
                className="relative overflow-hidden btn-shimmer inline-flex items-center justify-center rounded-2xl px-6 py-3 text-sm font-medium text-white bg-neutral-900 hover:bg-neutral-800 transition active:scale-[0.98]"
              >
                Open Contact Page
              </a>
              <a
                href="#services"
                className="inline-flex items-center justify-center rounded-2xl px-6 py-3 text-sm font-semibold border border-neutral-300 bg-white hover:bg-neutral-50 transition active:scale-[0.98]"
              >
                Browse Services
              </a>
            </div>

            <div className="mt-10 h-[2px] w-24 bg-yellow-400/70" />
          </div>
        </div>
      </div>
    </section>
    
  );
}
