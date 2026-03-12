"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Bell, Clock, Flame, ShieldCheck, Truck, Tag } from "lucide-react";
import { getProducts, syncProductsFromServer } from "@/lib/mart/productsLocal";
import type { MartProduct } from "@/lib/mart/data";

type DealProduct = MartProduct & {
  originalPriceGHS?: number;
  dealType?: "flash" | "weekly" | "clearance";
  dealEndsAt?: string; // ISO
};

const FALLBACK_DEALS = [
  { title: "Groceries Combo", price: "GHS 149", hint: "Weekly essentials" },
  { title: "Wireless Earbuds", price: "GHS 399", hint: "Clean sound" },
  { title: "Skin Care Kit", price: "GHS 220", hint: "Glow up" },
  { title: "Smartphone Deals", price: "From GHS 999", hint: "Hot picks" },
];

function pad(n: number) {
  return String(Math.max(0, n)).padStart(2, "0");
}

function splitTime(ms: number) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return { h, m, s, done: total <= 0 };
}

export default function DealBand() {
  const [products, setProducts] = useState<DealProduct[]>([]);
  const [tick, setTick] = useState(0);

  // Load products + keep in sync with edits
  useEffect(() => {
    const refresh = () => setProducts(getProducts() as DealProduct[]);
    refresh();

    const onStorage = (e: StorageEvent) => {
      if (e.key && e.key.includes("gm_products_override_v1")) refresh();
    };
    window.addEventListener("storage", onStorage);

    const onFocus = () => refresh();
    window.addEventListener("focus", onFocus);

    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("focus", onFocus);
    };
  }, []);

  // 1-second tick for countdown
  useEffect(() => {
    const id = setInterval(() => setTick((x) => x + 1), 1000);
    return () => clearInterval(id);
  }, []);

  // Flash deals that are active (end time in the future)
  const activeFlash = useMemo(() => {
    const now = Date.now();

    const flash = products
      .filter((p) => p.dealType === "flash" && p.dealEndsAt)
      .map((p) => ({ p, end: new Date(p.dealEndsAt as string).getTime() }))
      .filter((x) => Number.isFinite(x.end) && x.end > now)
      .sort((a, b) => a.end - b.end);

    return flash[0] ?? null; // nearest ending flash deal
  }, [products, tick]);

  const countdown = useMemo(() => {
    if (!activeFlash) return null;
    const left = activeFlash.end - Date.now();
    const t = splitTime(left);
    if (t.done) return null;
    return t;
  }, [activeFlash, tick]);

  // Right column list: use real deals if available, else fallback
  const listDeals = useMemo(() => {
    const deals = products
      .filter((p) => p.originalPriceGHS && p.originalPriceGHS > p.priceGHS)
      .slice(0, 4)
      .map((p) => ({
        title: p.name,
        price: `GHS ${Number(p.priceGHS).toFixed(2)}`,
        hint:
          p.dealType === "flash"
            ? "Flash deal"
            : p.dealType === "weekly"
              ? "This week"
              : p.dealType === "clearance"
                ? "Clearance"
                : "Limited offer",
      }));

    return deals.length ? deals : FALLBACK_DEALS;
  }, [products]);

  // Ticker pills (no emoji)
  const ticker = [
    { icon: <Flame className="h-4 w-4 text-red-600" />, label: "Weekly deals" },
    { icon: <Truck className="h-4 w-4 text-red-600" />, label: "Fast delivery" },
    { icon: <ShieldCheck className="h-4 w-4 text-red-600" />, label: "Secure checkout" },
    { icon: <Bell className="h-4 w-4 text-red-600" />, label: "Smart assistant" },
  ];

  return (
    <div className="space-y-8">
      {/* Ticker */}
      <div className="overflow-hidden rounded-[28px] bg-white ring-1 ring-neutral-200/70">
        <div className="flex w-[200%] whitespace-nowrap marquee">
          {[...Array(2)].map((_, idx) => (
            <div key={idx} className="flex w-1/2 items-center justify-around py-3">
              {ticker.map((t) => (
                <span
                  key={t.label}
                  className="inline-flex items-center gap-2 rounded-full bg-neutral-100 px-5 py-2 text-sm text-neutral-700"
                >
                  {t.icon}
                  {t.label}
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Main layout */}
      <div className="grid gap-8 lg:grid-cols-[1.2fr_1fr] lg:items-stretch">
        {/* Left promo */}
        <div className="relative overflow-hidden rounded-[32px] bg-neutral-50/60 p-6 sm:p-8 md:p-10">
          <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-red-500/10 blur-3xl pulseSoft" />
          <div className="pointer-events-none absolute -right-24 -bottom-24 h-72 w-72 rounded-full bg-rose-500/10 blur-3xl" />

          <div className="relative">
            <p className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs ring-1 ring-neutral-200/70">
              <Flame className="h-4 w-4 text-red-600" />
              Deals of the week
            </p>

            <h3 className="mt-5 text-2xl md:text-4xl font-semibold tracking-tight">
              Save more with <span className="text-red-600">weekly offers</span>
            </h3>

            <p className="mt-3 max-w-xl text-neutral-600">
              Clean deals, simple checkout. Use the assistant if you want the best option for your budget.
            </p>

            {/* Real countdown */}
            <div className="mt-6">
              {countdown ? (
                <div className="flex flex-wrap gap-2">
                  {[
                    { label: "Hours", value: pad(countdown.h) },
                    { label: "Minutes", value: pad(countdown.m) },
                    { label: "Seconds", value: pad(countdown.s) },
                  ].map((x) => (
                    <div
                      key={x.label}
                      className="rounded-2xl bg-white px-4 py-3 text-sm ring-1 ring-neutral-200/70"
                    >
                      <p className="text-xs text-neutral-500">{x.label}</p>
                      <p className="text-lg font-semibold tabular-nums">{x.value}</p>
                    </div>
                  ))}

                  {/* Small label for context */}
                  <span className="inline-flex items-center gap-2 self-center rounded-full bg-white px-4 py-2 text-xs text-neutral-700 ring-1 ring-neutral-200/70">
                    <Clock className="h-4 w-4 text-red-600" />
                    Flash deal ends soon
                  </span>
                </div>
              ) : (
                <div className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs text-neutral-700 ring-1 ring-neutral-200/70">
                  <Tag className="h-4 w-4 text-red-600" />
                  No active flash deal right now
                </div>
              )}
            </div>

            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href="/mart/deals"
                className="inline-flex items-center gap-2 rounded-full bg-black px-7 py-3 text-sm text-white hover:bg-black/90 transition active:scale-[0.99]"
              >
                Browse deals <ArrowRight className="h-4 w-4" />
              </Link>

              <a
                href="#assistant"
                className="inline-flex items-center gap-2 rounded-full bg-white px-7 py-3 text-sm ring-1 ring-neutral-200/70 hover:bg-neutral-50 transition active:scale-[0.99]"
              >
                Ask assistant <ArrowRight className="h-4 w-4" />
              </a>
            </div>

            {/* image strip */}
            <div className="mt-10 grid grid-cols-3 gap-3">
              {["deal-1.jpg", "deal-2.jpg", "deal-3.jpg"].map((img) => (
                <div
                  key={img}
                  className="relative h-20 sm:h-24 rounded-2xl bg-white ring-1 ring-neutral-200/70 overflow-hidden"
                >
                  <Image
                    src={`/mart/deals/${img}`}
                    alt="Deal preview"
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 30vw, 10vw"
                  />
                </div>
              ))}
            </div>

            <p className="mt-3 text-xs text-neutral-500">
              Images path: <span className="font-medium">/public/mart/deals/*</span>
            </p>
          </div>
        </div>

        {/* Right deal list */}
        <div className="grid gap-4">
          {listDeals.map((d) => (
            <div
              key={d.title}
              className="group rounded-[28px] bg-white p-6 ring-1 ring-neutral-200/70 hover:-translate-y-1 hover:shadow-sm transition"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-sm font-semibold truncate">{d.title}</p>
                  <p className="mt-1 text-sm text-neutral-600">{d.hint}</p>
                </div>

                <span className="inline-flex shrink-0 items-center gap-2 rounded-full bg-neutral-100 px-4 py-2 text-sm">
                  <Tag className="h-4 w-4 text-red-600" />
                  {d.price}
                </span>
              </div>

              <div className="mt-4 h-20 rounded-2xl bg-neutral-100 relative overflow-hidden">
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition bg-[radial-gradient(450px_180px_at_30%_30%,rgba(239,68,68,0.12),transparent_65%)]" />
              </div>

              <div className="mt-4 flex items-center justify-between text-xs text-neutral-500">
                <span className="rounded-full bg-neutral-100 px-3 py-2">Limited time</span>
                <Link href="/mart/deals" className="hover:text-red-600 transition">
                  View <span aria-hidden>→</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
