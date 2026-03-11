"use client";

import Link from "next/link";
import { ArrowRight, ShieldCheck, Truck, BadgeCheck, Headset, RefreshCcw, Percent } from "lucide-react";

const POINTS = [
  {
    title: "Secure checkout",
    desc: "Payments designed to be safe and smooth (MoMo-ready when you connect backend).",
    icon: <ShieldCheck className="h-5 w-5" />,
  },
  {
    title: "Fast delivery",
    desc: "Delivery options built-in — you can wire zones & fees from your admin.",
    icon: <Truck className="h-5 w-5" />,
  },
  {
    title: "Verified sellers",
    desc: "Seller profiles, ratings and trust signals are planned for the backend.",
    icon: <BadgeCheck className="h-5 w-5" />,
  },
  {
    title: "Smart support",
    desc: "The assistant helps users choose faster and reduces abandoned carts.",
    icon: <Headset className="h-5 w-5" />,
  },
  {
    title: "Easy returns",
    desc: "Clear return policy flow — support tickets and status updates later.",
    icon: <RefreshCcw className="h-5 w-5" />,
  },
  {
    title: "Weekly deals",
    desc: "Deal logic is ready — scheduled promos from your dashboard later.",
    icon: <Percent className="h-5 w-5" />,
  },
];

export default function TrustRow() {
  return (
    <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:items-start">
      {/* Left narrative (fills space, feels premium) */}
      <div className="space-y-6">
        <p className="text-xs tracking-[0.35em] text-neutral-500 rise-in">
          TRUST · SPEED · SIMPLICITY
        </p>

        <h3 className="text-2xl md:text-4xl font-semibold tracking-tight rise-in rise-in-2">
          Built to feel clean,
          <br />
          and work like a real store.
        </h3>

        <p className="text-neutral-600 max-w-xl rise-in rise-in-3">
          Geonest Mart is structured for production: products, categories, deals, checkout, and
          admin integration. The UI stays minimal, but the system is ready to scale.
        </p>

        {/* “Proof strip” */}
        <div className="grid grid-cols-3 gap-3 max-w-xl rise-in rise-in-4">
          {[
            ["Admin-ready", "Inventory & pricing"],
            ["Chat-ready", "Guided buying"],
            ["Mobile-first", "Fast UI"],
          ].map(([a, b]) => (
            <div key={a} className="rounded-2xl bg-white px-4 py-3 ring-1 ring-neutral-200/70">
              <p className="text-sm font-semibold">{a}</p>
              <p className="text-xs text-neutral-500">{b}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-3 rise-in rise-in-4">
          <Link
            href="/mart/shop"
            className="inline-flex items-center gap-2 rounded-full bg-black px-7 py-3 text-sm text-white hover:bg-black/90 transition active:scale-[0.99]"
          >
            Explore products <ArrowRight className="h-4 w-4" />
          </Link>
          <a
            href="#assistant"
            className="inline-flex items-center gap-2 rounded-full bg-neutral-100 px-7 py-3 text-sm hover:bg-neutral-200 transition active:scale-[0.99]"
          >
            Ask assistant <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </div>

      {/* Right proof grid (animated hover) */}
      <div className="grid gap-4 sm:grid-cols-2">
        {POINTS.map((p, idx) => (
          <div
            key={p.title}
            className="group rounded-[28px] bg-white p-6 ring-1 ring-neutral-200/70 transition hover:-translate-y-1 hover:shadow-sm"
            style={{ animationDelay: `${idx * 70}ms` }}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-neutral-100 text-neutral-800 group-hover:bg-red-50 group-hover:text-red-700 transition">
                {p.icon}
              </div>

              {/* subtle highlight bar */}
              <div className="h-10 w-20 rounded-2xl bg-neutral-100/70 group-hover:bg-red-50 transition" />
            </div>

            <p className="mt-4 text-sm font-semibold text-neutral-900">{p.title}</p>
            <p className="mt-2 text-sm text-neutral-600">{p.desc}</p>

            <div className="mt-4 h-10 rounded-2xl bg-neutral-100 relative overflow-hidden">
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition bg-[radial-gradient(420px_160px_at_30%_30%,rgba(239,68,68,0.12),transparent_65%)]" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
