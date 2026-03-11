"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

export default function HeroInspo() {
  return (
    <section className="w-full pt-8 md:pt-10">
      {/* Local-only animations (no external CSS needed) */}
      <style jsx global>{`
        @keyframes gmRise {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes gmFloat {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-6px);
          }
        }
        @keyframes gmFloat2 {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        @keyframes gmShimmer {
          0% {
            transform: translateX(-120%);
          }
          100% {
            transform: translateX(320%);
          }
        }

        .gm-rise {
          animation: gmRise 0.55s ease-out both;
        }
        .gm-rise-2 {
          animation-delay: 0.08s;
        }
        .gm-rise-3 {
          animation-delay: 0.16s;
        }
        .gm-rise-4 {
          animation-delay: 0.24s;
        }

        .gm-float {
          animation: gmFloat 3.2s ease-in-out infinite;
        }
        .gm-float-2 {
          animation: gmFloat2 3.8s ease-in-out infinite;
        }
        .gm-shimmer {
          animation: gmShimmer 2.6s ease-in-out infinite;
        }
      `}</style>

      <div className="mx-auto max-w-7xl px-4">
        {/* Full-bleed white hero */}
        <div className="min-h-[78vh] md:min-h-[82vh] grid items-center gap-10 md:gap-12 md:grid-cols-2">
          {/* LEFT */}
          <div className="gm-rise">
            <p className="text-[11px] md:text-xs tracking-[0.35em] text-neutral-500">
              GEONEST MART · SUPPORT LOCAL EVERYTHING
            </p>

            <h1 className="mt-5 md:mt-6 text-[38px] leading-[1.05] md:text-6xl font-semibold tracking-tight">
              A modern
              <br />
              <span className="text-red-600">e-commerce</span>
              <br />
              experience
            </h1>

            <p className="mt-4 md:mt-6 max-w-md text-neutral-600 text-base md:text-lg">
              Groceries, electronics, fashion and essentials — designed to feel clean, fast, and
              premium.
            </p>

            <div className="mt-7 md:mt-8 flex flex-wrap gap-3 md:gap-4 gm-rise gm-rise-2">
              <Link
                href="/mart/shop"
                className="inline-flex items-center gap-3 rounded-full bg-black px-7 py-4 text-sm font-medium text-white hover:bg-black/90 transition active:scale-[0.99]"
              >
                Start Shopping
                <ArrowRight className="h-4 w-4" />
              </Link>

              <Link
                href="/mart/chat"
                className="inline-flex items-center gap-3 rounded-full bg-neutral-100 px-7 py-4 text-sm hover:bg-neutral-200 transition active:scale-[0.99]"
              >
                <Sparkles className="h-4 w-4" />
                Ask the Assistant
              </Link>
            </div>

            {/* “busy but clean” pills */}
            <div className="mt-8 md:mt-10 flex flex-wrap gap-2.5 text-xs text-neutral-600 gm-rise gm-rise-3">
              <span className="rounded-full bg-neutral-100 px-4 py-2">Fast checkout</span>
              <span className="rounded-full bg-neutral-100 px-4 py-2">Smart picks</span>
              <span className="rounded-full bg-neutral-100 px-4 py-2">Trusted sellers</span>
              <span className="rounded-full bg-neutral-100 px-4 py-2">Weekly deals</span>
            </div>

            {/* small stats row */}
            <div className="mt-6 md:mt-8 grid max-w-md grid-cols-3 gap-2.5 md:gap-3 gm-rise gm-rise-4">
              {[
                ["MoMo-ready", "Hubtel support"],
                ["Same-day", "Selected areas"],
                ["24/7", "Assistant help"],
              ].map(([a, b]) => (
                <div
                  key={a}
                  className="rounded-2xl bg-white px-3 md:px-4 py-3 ring-1 ring-neutral-200/70"
                >
                  <p className="text-sm font-semibold">{a}</p>
                  <p className="text-[11px] md:text-xs text-neutral-500">{b}</p>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT VISUAL */}
          <div className="relative gm-rise gm-rise-2">
            {/* subtle red spotlight ONLY behind product */}
            <div className="pointer-events-none absolute left-1/2 top-4 md:top-6 h-[340px] w-[340px] md:h-[420px] md:w-[420px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_30%_30%,rgba(239,68,68,0.14),transparent_65%)]" />

            {/* MAIN HERO IMAGE */}
            {/* Put file at: public/mart/hero/main.jpg */}
            <div className="relative mx-auto h-[330px] w-[330px] md:h-[460px] md:w-[460px] max-w-full rounded-full bg-neutral-100 overflow-hidden">
              <Image
                src="/mart/hero/main.jpg"
                alt="Featured product"
                fill
                priority
                className="object-contain p-7 md:p-8"
              />

              {/* subtle shimmer */}
              <div className="pointer-events-none absolute inset-0 opacity-20">
                <div className="absolute inset-y-0 w-1/3 bg-white/70 gm-shimmer" />
              </div>
            </div>

            {/* Floating labels (adaptive / safe on mobile) */}
            <div className="gm-float absolute right-2 md:right-2 top-6 md:top-10 rounded-full bg-white px-4 py-2 text-xs md:text-sm ring-1 ring-neutral-200/70">
              Minimal design
            </div>

            <div className="gm-float-2 absolute left-2 md:left-2 bottom-24 md:bottom-28 rounded-full bg-white px-4 py-2 text-xs md:text-sm ring-1 ring-neutral-200/70">
              Curated picks
            </div>

            <div className="gm-float absolute left-1/2 bottom-6 md:bottom-8 -translate-x-1/2 rounded-full bg-white px-4 py-2 text-xs md:text-sm ring-1 ring-neutral-200/70">
              Shop smart
            </div>

            {/* THUMBNAILS */}
            {/* public/mart/hero/thumb-1.jpg, thumb-2.jpg, thumb-3.jpg */}
            <div className="mt-6 md:mt-0 md:absolute md:right-0 md:top-32">
              {/* Mobile: horizontal strip */}
              <div className="flex md:hidden items-center justify-center gap-3">
                {["thumb-1.jpg", "thumb-2.jpg", "thumb-3.jpg"].map((img) => (
                  <div
                    key={img}
                    className="relative h-16 w-16 rounded-full bg-neutral-100 ring-1 ring-neutral-200/70 overflow-hidden active:scale-[0.98] transition"
                  >
                    <Image
                      src={`/mart/hero/${img}`}
                      alt="Preview"
                      fill
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>

              {/* Desktop: vertical stack */}
              <div className="hidden md:flex flex-col gap-4">
                {["thumb-1.jpg", "thumb-2.jpg", "thumb-3.jpg"].map((img) => (
                  <div
                    key={img}
                    className="relative h-20 w-20 rounded-full bg-neutral-100 ring-1 ring-neutral-200/70 overflow-hidden hover:scale-[1.03] transition"
                  >
                    <Image
                      src={`/mart/hero/${img}`}
                      alt="Preview"
                      fill
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Micro detail */}
            <div className="mt-5 md:mt-6 flex items-center justify-center md:justify-end gap-2 text-sm text-neutral-500">
              <span>Continue shopping</span>
              <ArrowRight className="h-4 w-4" />
            </div>

            {/* Image placement reminder */}
            <div className="mt-3 text-center md:text-right text-[11px] text-neutral-400">
              Images: <span className="font-medium">/public/mart/hero/</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
