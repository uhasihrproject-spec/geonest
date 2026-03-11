"use client";

import { useEffect, useMemo, useState } from "react";

export default function Hero() {
  // change words to reflect ABOUT / ecosystem (not services)
  const words = useMemo(
    () => ["systems", "experience", "technology", "growth"],
    []
  );
  const [i, setI] = useState(0);

  // slower morph (calm, premium)
  useEffect(() => {
    const t = setInterval(() => setI((p) => (p + 1) % words.length), 2800);
    return () => clearInterval(t);
  }, [words.length]);

  return (
    <section className="relative overflow-hidden bg-white">
      {/* Inspo-like overlay mood (unchanged) */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-40 -left-40 h-[640px] w-[640px] rounded-full bg-yellow-300/18 blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -right-40 h-[720px] w-[720px] rounded-full bg-neutral-900/6 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_38%,rgba(0,0,0,0.06),transparent_52%)]" />
        <div className="absolute inset-0 opacity-[0.05] bg-[linear-gradient(to_right,black_1px,transparent_1px),linear-gradient(to_bottom,black_1px,transparent_1px)] bg-[size:64px_64px]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 py-16 md:py-24">
        <div className="max-w-3xl mx-auto text-center">
          {/* badge – updated */}
          <p className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-3 py-1 text-xs text-neutral-600">
            <span className="h-2 w-2 rounded-full bg-yellow-400" />
            Geonest . About
          </p>

          {/* headline – updated meaning */}
          <h1 className="mt-5 text-3xl md:text-5xl font-semibold tracking-tight leading-[1.1] text-neutral-900">
            Geonest Ventures, built on{" "}
            <span className="relative inline-block">
              <span className="capitalize">{words[i]}</span>
              <span className="absolute -bottom-2 left-0 h-2 w-full bg-yellow-300/65 blur-[1px]" />
            </span>
            .
          </h1>

          {/* description – updated */}
          <p className="mt-5 text-base md:text-lg text-neutral-600 leading-relaxed max-w-2xl mx-auto">
            Geonest Ventures is a parent company that builds and manages independent
            brands across essential industries — using clean operations, smart
            technology, and premium customer experience as the foundation.
          </p>

          {/* CTAs – unchanged */}
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href="/companies"
              className="rounded-2xl px-5 py-3 text-sm font-medium bg-neutral-900 text-white hover:bg-neutral-500 transition active:scale-[0.98]"
            >
              Explore Companies
            </a>
            <a
              href="/services"
              className="rounded-2xl text-black px-5 py-3 text-sm font-medium border border-neutral-300 bg-white hover:bg-neutral-50 transition active:scale-[0.98]"
            >
              View Services
            </a>
          </div>

          {/* accent line – unchanged */}
          <div className="mt-10 h-[2px] w-20 bg-yellow-400/70 mx-auto" />
        </div>
      </div>
    </section>
  );
}
