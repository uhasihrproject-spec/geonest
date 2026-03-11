"use client";

import { Star, BadgeCheck, ArrowRight } from "lucide-react";
import Link from "next/link";
import { TESTIMONIALS } from "@/lib/mart/data";

const RATING = 4.8;
const COUNT = 1247;

const BREAKDOWN = [
  { stars: 5, pct: 78 },
  { stars: 4, pct: 16 },
  { stars: 3, pct: 4 },
  { stars: 2, pct: 1 },
  { stars: 1, pct: 1 },
];

function StarsRow({ value }: { value: number }) {
  const full = Math.floor(value);
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`h-4 w-4 ${i <= full ? "text-red-600" : "text-neutral-300"}`}
          fill={i <= full ? "currentColor" : "none"}
        />
      ))}
    </div>
  );
}

export default function TestimonialsSection() {
  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_1.2fr] lg:items-start">
      {/* LEFT: Summary (fills space, feels legit) */}
      <div className="space-y-6">
        <div className="rise-in">
          <p className="text-xs tracking-[0.35em] text-neutral-500">
            VERIFIED REVIEWS
          </p>

          <div className="mt-4 flex items-end gap-4">
            <p className="text-5xl font-semibold tracking-tight">{RATING}</p>
            <div className="pb-1">
              <StarsRow value={RATING} />
              <p className="mt-1 text-sm text-neutral-600">
                Based on <span className="font-medium">{COUNT.toLocaleString()}</span> purchases
              </p>
            </div>
          </div>
        </div>

        {/* Breakdown bars */}
        <div className="space-y-3 rise-in rise-in-2">
          {BREAKDOWN.map((b) => (
            <div key={b.stars} className="flex items-center gap-3">
              <span className="w-10 text-sm text-neutral-600">{b.stars}★</span>
              <div className="h-2 flex-1 rounded-full bg-neutral-200 overflow-hidden">
                <div
                  className="h-full rounded-full bg-red-600"
                  style={{ width: `${b.pct}%` }}
                />
              </div>
              <span className="w-10 text-right text-sm text-neutral-500">
                {b.pct}%
              </span>
            </div>
          ))}
        </div>

        {/* “Trust chips” */}
        <div className="flex flex-wrap gap-2 rise-in rise-in-3">
          {[
            "Fast checkout",
            "Mobile-first",
            "Clean UI",
            "Assistant support",
            "Trusted sellers",
          ].map((t) => (
            <span
              key={t}
              className="rounded-full bg-white px-4 py-2 text-xs ring-1 ring-neutral-200/70"
            >
              {t}
            </span>
          ))}
        </div>

        <div className="rise-in rise-in-4">
          <Link
            href="/mart/reviews"
            className="inline-flex items-center gap-2 rounded-full bg-neutral-100 px-7 py-3 text-sm hover:bg-neutral-200 transition active:scale-[0.99]"
          >
            Read all reviews <ArrowRight className="h-4 w-4" />
          </Link>
          <p className="mt-2 text-xs text-neutral-500">
            Backend-ready: reviews will come from database later.
          </p>
        </div>
      </div>

      {/* RIGHT: Review cards */}
      <div className="grid gap-4 sm:grid-cols-2">
        {TESTIMONIALS.slice(0, 4).map((t, idx) => (
          <article
            key={t.name}
            className="group rounded-[28px] bg-white p-6 ring-1 ring-neutral-200/70 transition hover:-translate-y-1 hover:shadow-sm"
            style={{ animationDelay: `${idx * 80}ms` }}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold">{t.name}</p>
                <p className="text-xs text-neutral-500">{t.role}</p>
              </div>

              <span className="inline-flex items-center gap-2 rounded-full bg-neutral-100 px-4 py-2 text-xs text-neutral-700 group-hover:bg-red-50 group-hover:text-red-700 transition">
                <BadgeCheck className="h-4 w-4" />
                Verified purchase
              </span>
            </div>

            <div className="mt-4">
              <StarsRow value={5} />
              <p className="mt-3 text-sm text-neutral-700 leading-relaxed">
                “{t.quote}”
              </p>
            </div>

            {/* Image-ready mini strip (optional later) */}
            <div className="mt-5 h-12 rounded-2xl bg-neutral-100 relative overflow-hidden">
              {/* Later you can put:
                  public/mart/reviews/r1.jpg etc
                  and render an <Image /> here.
              */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition bg-[radial-gradient(420px_160px_at_30%_30%,rgba(239,68,68,0.12),transparent_65%)]" />
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
