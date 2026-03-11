"use client";
import Image from "next/image";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative min-h-screen overflow-hidden bg-[#0b0f14] text-neutral-200">
      {/* softer charcoal background + glow (NOT pure black) */}
      <div className="absolute inset-0 pointer-events-none">
        {/* top blend glow (matches undercover transition) */}
        <div className="absolute -top-28 left-1/2 -translate-x-1/2 h-80 w-[1100px] rounded-full blur-3xl bg-[rgba(214,199,161,0.18)] floaty" />

        {/* subtle side glows */}
        <div className="absolute -bottom-40 -left-40 h-[520px] w-[520px] rounded-full blur-3xl bg-[rgba(59,130,246,0.10)] floaty" />
        <div className="absolute -bottom-40 -right-40 h-[520px] w-[520px] rounded-full blur-3xl bg-[rgba(34,197,94,0.08)] floaty" />

        {/* soft texture grid */}
        <div className="absolute inset-0 opacity-[0.05] bg-[linear-gradient(to_right,white_1px,transparent_1px),linear-gradient(to_bottom,white_1px,transparent_1px)] bg-[size:110px_110px]" />
        <div className="absolute inset-0 opacity-[0.20] bg-[radial-gradient(circle_at_50%_10%,rgba(255,255,255,0.08),transparent_55%)]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 py-16 md:py-20 flex min-h-screen flex-col">
        {/* Top area */}
        <div className="grid gap-12 lg:grid-cols-12 items-start fade-up">
          {/* Brand block */}
          <div className="lg:col-span-4">
            <div className="flex items-center gap-3">
              {/* Logo */}
              <div className="h-12 w-12 rounded-2xl border border-white/10 bg-white/5 grid place-items-center overflow-hidden">
                <Image
                  src="/logo.svg"
                  alt="Geonest Ventures logo"
                  width={28}
                  height={28}
                  className="opacity-95"
                  priority={false}
                />
              </div>

              <div className="leading-tight">
                <p className="font-semibold tracking-tight text-white text-lg">
                  Geonest{" "}
                  <span className="text-[#d6c7a1]">Ventures</span>
                </p>
                <p className="text-xs text-neutral-400 -mt-0.5">
                  A premium group brand in Ghana
                </p>
              </div>
            </div>

            <p className="mt-6 text-sm text-neutral-400 leading-relaxed max-w-sm">
              A parent brand operating independent business units — each with a
              dedicated interface — unified by one standard of quality.
            </p>

            {/* Quick contacts (replace these later with real details) */}
            <div className="mt-7 space-y-2 text-sm">
              <a
                href="tel:+233000000000"
                className="inline-flex items-center gap-2 text-neutral-300 hover:text-white transition"
              >
                <span className="opacity-70">✦</span> +233 (0) 00 000 0000
              </a>
              <a
                href="mailto:info@geonest.com"
                className="inline-flex items-center gap-2 text-neutral-300 hover:text-white transition"
              >
                <span className="opacity-70">✦</span> info@geonest.com
              </a>
              <p className="text-neutral-500 text-xs mt-3">Accra, Ghana</p>
            </div>
          </div>

          {/* Links + Newsletter */}
          <div className="lg:col-span-8 grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
            {/* Company links */}
            <div className="hover:-translate-y-1 transition duration-300">
              <p className="text-xs uppercase tracking-[0.25em] text-neutral-500">
                Company
              </p>
              <ul className="mt-4 space-y-3 text-sm">
                <li>
                  <a href="#about" className="hover:text-white transition">
                    About Geonest
                  </a>
                </li>
                <li>
                  <a href="#services" className="hover:text-white transition">
                    Services
                  </a>
                </li>
                <li>
                  <a href="#companies" className="hover:text-white transition">
                    Companies
                  </a>
                </li>
                <li>
                  <a href="/contact" className="hover:text-white transition">
                    Contact
                  </a>
                </li>
              </ul>
            </div>

            {/* Units links */}
            <div className="hover:-translate-y-1 transition duration-300">
              <p className="text-xs uppercase tracking-[0.25em] text-neutral-500">
                Units
              </p>
              <ul className="mt-4 space-y-3 text-sm">
                <li>
                  <a href="/mart" className="hover:text-white transition">
                    Geonest Mart
                  </a>
                </li>
                <li>
                  <a href="/pharmacy" className="hover:text-white transition">
                    Geonest Pharmacy
                  </a>
                </li>
                <li>
                  <a href="/salon" className="hover:text-white transition">
                    Geonest Salon
                  </a>
                </li>
                <li>
                  <a href="/travels" className="hover:text-white transition">
                    Geonest Travels
                  </a>
                </li>
              </ul>
            </div>

            {/* Newsletter */}
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_18px_70px_rgba(0,0,0,0.30)] hover:-translate-y-2 transition-all duration-300">
              <p className="text-xs uppercase tracking-[0.25em] text-neutral-500">
                Newsletter
              </p>
              <p className="mt-3 text-sm font-semibold text-white">
                Subscribe for updates
              </p>
              <p className="mt-2 text-xs text-neutral-400 leading-relaxed">
                New offers, announcements, and important updates from Geonest units.
              </p>

              {/* Placeholder form (no backend yet) */}
              <form
                className="mt-5 flex flex-col gap-3"
                onSubmit={(e) => {
                  e.preventDefault();
                  // Later: connect to your email provider / API route
                }}
              >
                <input
                  type="email"
                  required
                  placeholder="Enter your email"
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-neutral-500 outline-none focus:border-white/20"
                />

                <button
                  type="submit"
                  className="relative overflow-hidden btn-shimmer inline-flex items-center justify-center rounded-2xl px-4 py-3 text-sm font-medium text-neutral-950 bg-white hover:bg-neutral-200 transition active:scale-[0.98]"
                >
                  Subscribe
                </button>
              </form>

              <p className="mt-3 text-[11px] text-neutral-500 leading-relaxed">
                By subscribing, you agree to receive occasional updates. You can unsubscribe anytime.
              </p>

              <div className="mt-6 h-[2px] w-20 bg-[#d6c7a1]/70" />
            </div>
          </div>
        </div>

        {/* Spacer pushes bottom row down for full-screen feel */}
        <div className="flex-1" />

        {/* Bottom row */}
        <div className="fade-up">
          <div className="h-px w-full bg-white/10" />

          <div className="mt-6 flex flex-col md:flex-row gap-4 items-center justify-between">
            <p className="text-xs text-neutral-500">
              © {year} Geonest Ventures. All rights reserved.
            </p>

            <div className="flex items-center gap-4 text-xs text-neutral-500">
              <a href="#" className="hover:text-neutral-200 transition">
                Privacy
              </a>
              <span className="opacity-30">•</span>
              <a href="#" className="hover:text-neutral-200 transition">
                Terms
              </a>
              <span className="opacity-30">•</span>
              <a href="/contact" className="hover:text-neutral-200 transition">
                Support
              </a>
            </div>
          </div>

          <div className="mt-6 h-[2px] w-24 bg-[#d6c7a1]/60" />
        </div>
      </div>
    </footer>
  );
}
