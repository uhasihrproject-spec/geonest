"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Sparkles } from "lucide-react";
import { BLOG_POSTS } from "@/lib/mart/data";

export default function BlogCtaSection() {
  return (
    <div className="grid gap-8 lg:grid-cols-[1.2fr_0.9fr] lg:items-start">
      {/* BLOG LIST */}
      <div className="rise-in">
        <div className="flex items-end justify-between gap-6">
          <div>
            <p className="text-xs tracking-[0.35em] text-neutral-500">BLOG</p>
            <h3 className="mt-3 text-2xl md:text-4xl font-semibold tracking-tight">
              Tips, deals & buying guides
            </h3>
            <p className="mt-3 max-w-2xl text-neutral-600">
              Short reads that help users shop faster and smarter — perfect for trust-building.
            </p>
          </div>

          <Link
            href="/mart/blog"
            className="hidden sm:inline-flex items-center gap-2 rounded-full bg-neutral-100 px-6 py-3 text-sm hover:bg-neutral-200 transition active:scale-[0.99]"
          >
            View blog <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Posts grid */}
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {BLOG_POSTS.slice(0, 4).map((p, idx) => (
            <Link
              key={p.id}
              href={`/mart/blog/${p.id}`}
              className="group rounded-[28px] bg-white p-6 ring-1 ring-neutral-200/70 transition hover:-translate-y-1 hover:shadow-sm"
              style={{ animationDelay: `${idx * 70}ms` }}
            >
              <div className="flex items-center justify-between gap-3">
                <span className="rounded-full bg-neutral-100 px-4 py-2 text-xs text-neutral-700 group-hover:bg-red-50 group-hover:text-red-700 transition">
                  {p.tag}
                </span>
                <span className="text-xs text-neutral-500">{p.date}</span>
              </div>

              <p className="mt-4 text-base font-semibold text-neutral-900">
                {p.title}
              </p>
              <p className="mt-2 text-sm text-neutral-600 leading-relaxed">
                {p.desc}
              </p>

              {/* Optional image (ready later) */}
              <div className="mt-5 h-24 rounded-2xl bg-neutral-100 overflow-hidden relative">
                {/* Put images later in: public/mart/blog/b1.jpg ... b4.jpg */}
                <Image
                  src={p.cover}
                  alt={p.title}
                  fill
                  className="object-cover opacity-0 group-hover:opacity-100 transition"
                />
                <div className="absolute inset-0 opacity-100 group-hover:opacity-0 transition bg-[radial-gradient(450px_180px_at_30%_30%,rgba(239,68,68,0.12),transparent_65%)]" />
              </div>

              <div className="mt-4 flex items-center justify-between text-xs text-neutral-500">
                <span className="rounded-full bg-neutral-100 px-3 py-2">Read in 2 min</span>
                <span className="group-hover:text-red-600 transition">Read →</span>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-6 sm:hidden">
          <Link
            href="/mart/blog"
            className="inline-flex items-center gap-2 rounded-full bg-neutral-100 px-6 py-3 text-sm hover:bg-neutral-200 transition active:scale-[0.99]"
          >
            View blog <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* CTA STACK */}
      <div className="space-y-4 rise-in rise-in-2">
        {/* Main CTA */}
        <div className="relative overflow-hidden rounded-[32px] bg-black p-8 text-white">
          <div className="pointer-events-none absolute -right-28 -top-28 h-80 w-80 rounded-full bg-red-500/25 blur-3xl" />
          <p className="text-xs tracking-[0.35em] text-white/70">CALL TO ACTION</p>

          <h4 className="mt-4 text-2xl md:text-3xl font-semibold tracking-tight">
            Ready to shop without stress?
          </h4>

          <p className="mt-3 text-sm text-white/70">
            Tell the assistant what you want — budget, category, brand — and get a clean shortlist.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/mart/shop"
              className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-medium text-black hover:bg-white/90 transition active:scale-[0.99]"
            >
              Start shopping <ArrowRight className="h-4 w-4" />
            </Link>

            <a
              href="#assistant"
              className="inline-flex items-center gap-2 rounded-full bg-white/10 px-6 py-3 text-sm text-white ring-1 ring-white/15 hover:bg-white/15 transition active:scale-[0.99]"
            >
              <Sparkles className="h-4 w-4" />
              Open assistant
            </a>
          </div>

          <div className="mt-6 flex flex-wrap gap-2 text-xs text-white/70">
            <span className="rounded-full bg-white/10 px-4 py-2 ring-1 ring-white/10">Phones under GHS 3000</span>
            <span className="rounded-full bg-white/10 px-4 py-2 ring-1 ring-white/10">Groceries for the week</span>
            <span className="rounded-full bg-white/10 px-4 py-2 ring-1 ring-white/10">Best laptop for school</span>
          </div>
        </div>

        {/* Secondary CTA (newsletter style but clean) */}
        <div className="rounded-[32px] bg-neutral-50/60 p-7">
          <p className="text-xs tracking-[0.35em] text-neutral-500">NEWSLETTER</p>
          <h5 className="mt-3 text-xl font-semibold">New drops & deals — weekly</h5>
          <p className="mt-2 text-sm text-neutral-600">
            Keep it simple: just email capture now, connect backend later.
          </p>

          <div className="mt-5 flex gap-2">
            <input
              placeholder="your@email.com"
              className="h-11 w-full rounded-2xl bg-white px-4 text-sm outline-none ring-1 ring-neutral-200/70 focus:ring-2 focus:ring-red-500/20"
            />
            <button className="h-11 rounded-2xl bg-black px-5 text-sm text-white hover:bg-black/90 active:scale-[0.99] transition">
              Join
            </button>
          </div>

          <p className="mt-2 text-xs text-neutral-500">
            Backend-ready: wire to Mailchimp/Resend later.
          </p>
        </div>
      </div>
    </div>
  );
}
