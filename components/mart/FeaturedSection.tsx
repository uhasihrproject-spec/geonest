"use client";

import Link from "next/link";
import Image from "next/image";
import { useMemo } from "react";
import { ArrowRight, Heart, ShoppingCart, Sparkles } from "lucide-react";
import { FEATURED_PRODUCTS, type MartProduct } from "@/lib/mart/data";
import { useMartStore } from "@/lib/mart/store";
import { askAssistant } from "@/lib/mart/assistant/controller";

const TABS = ["Trending", "New", "Best Sellers", "Under GHS 500"];

export default function FeaturedSection() {
  const hero = FEATURED_PRODUCTS[0];
  const rest = FEATURED_PRODUCTS.slice(1, 7);

  // Store actions
  const addToCart = useMartStore((s) => s.addToCart);
  const toggleWishlist = useMartStore((s) => s.toggleWishlist);
  const isWishlisted = useMartStore((s) => s.isWishlisted);

  const heroSaved = useMemo(() => (hero ? isWishlisted(hero.id) : false), [hero, isWishlisted]);

  function onAskAI(p: MartProduct) {
    askAssistant(`Tell me if ${p.name} is worth it and why.`, { page: "/mart", productId: p.id });
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[1.2fr_1fr]">
      {/* LEFT: Big editorial product */}
      <div className="relative overflow-hidden rounded-[32px] bg-white ring-1 ring-neutral-200/70">
        {/* subtle accent wash */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(900px_420px_at_25%_20%,rgba(239,68,68,0.10),transparent_60%)]" />

        <div className="relative p-7 md:p-10">
          {/* Tabs row */}
          <div className="flex flex-wrap gap-2">
            {TABS.map((t, i) => (
              <button
                key={t}
                className={`rounded-full px-4 py-2 text-xs transition ${
                  i === 0
                    ? "bg-black text-white"
                    : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <div className="mt-8 grid gap-8 md:grid-cols-2 md:items-center">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs ring-1 ring-neutral-200/70">
                <Sparkles className="h-4 w-4 text-red-600" />
                Featured pick
              </p>

              <h3 className="mt-4 text-2xl md:text-3xl font-semibold tracking-tight">
                {hero?.name ?? "Featured Product"}
              </h3>

              <p className="mt-3 text-neutral-600">
                Clean design. Fast checkout. Built for smart buying — without stress.
              </p>

              <p className="mt-5 text-xl font-semibold">
                GHS {hero?.priceGHS?.toFixed(2) ?? "0.00"}
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                {/* ✅ Add to cart works */}
                <button
                  type="button"
                  onClick={() => hero && addToCart(hero, 1)}
                  disabled={!hero}
                  className="inline-flex items-center gap-2 rounded-full bg-black px-6 py-3 text-sm text-white hover:bg-black/90 transition active:scale-[0.99] disabled:opacity-50"
                >
                  <ShoppingCart className="h-4 w-4" />
                  Add to cart
                </button>

                {/* ✅ Save works */}
                <button
                  type="button"
                  onClick={() => hero && toggleWishlist(hero.id)}
                  disabled={!hero}
                  className={`inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm transition active:scale-[0.99] disabled:opacity-50 ${
                    heroSaved ? "bg-red-50 text-red-700 hover:bg-red-100" : "bg-neutral-100 hover:bg-neutral-200"
                  }`}
                >
                  <Heart className="h-4 w-4" fill={heroSaved ? "currentColor" : "none"} />
                  {heroSaved ? "Saved" : "Save"}
                </button>

                <button
                  type="button"
                  onClick={() => hero && onAskAI(hero)}
                  disabled={!hero}
                  className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm ring-1 ring-neutral-200/70 hover:bg-neutral-50 transition disabled:opacity-50"
                >
                  <Sparkles className="h-4 w-4 text-red-600" />
                  Ask AI
                </button>

                <Link
                  href="/mart/shop"
                  className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm ring-1 ring-neutral-200/70 hover:bg-neutral-50 transition"
                >
                  View all <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

              <div className="mt-7 flex flex-wrap gap-2 text-xs text-neutral-600">
                <span className="rounded-full bg-neutral-100 px-4 py-2">Secure checkout</span>
                <span className="rounded-full bg-neutral-100 px-4 py-2">Trusted sellers</span>
                <span className="rounded-full bg-neutral-100 px-4 py-2">Fast delivery</span>
              </div>
            </div>

            {/* IMAGE AREA */}
            <div className="relative">
              <div className="pointer-events-none absolute -inset-6 rounded-[28px] bg-[radial-gradient(500px_280px_at_50%_35%,rgba(239,68,68,0.14),transparent_62%)]" />

              {/* ✅ Image: uses hero.image if available, else fallback */}
              <div className="relative aspect-square w-full rounded-[28px] bg-neutral-100 overflow-hidden">
                <Image
                  src={hero?.image || "/mart/products/featured.png"}
                  alt={hero?.name || "Featured product image"}
                  fill
                  className="object-contain p-8"
                />
              </div>

              <p className="mt-3 text-xs text-neutral-500">
                Place image at:{" "}
                <span className="font-medium">
                  {hero?.image ? hero.image : "/public/mart/products/featured.png"}
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT: Grid list */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
        {rest.map((p, idx) => {
          const saved = isWishlisted(p.id);

          return (
            <div
              key={p.id}
              className="group rounded-[28px] bg-white p-5 ring-1 ring-neutral-200/70 transition hover:-translate-y-1 hover:shadow-sm"
              style={{ animationDelay: `${idx * 70}ms` }}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold">{p.name}</p>
                  <p className="mt-1 text-sm text-neutral-600">
                    GHS {p.priceGHS.toFixed(2)}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {/* ✅ Save works */}
                  <button
                    type="button"
                    onClick={() => toggleWishlist(p.id)}
                    className={`inline-flex h-10 w-10 items-center justify-center rounded-full transition ${
                      saved ? "bg-red-50 text-red-700" : "bg-neutral-100 hover:bg-neutral-200"
                    }`}
                    aria-label={saved ? "Remove from wishlist" : "Save to wishlist"}
                  >
                    <Heart className="h-4 w-4" fill={saved ? "currentColor" : "none"} />
                  </button>

                  {/* ✅ Quick add works */}
                  <button
                    type="button"
                    onClick={() => addToCart(p, 1)}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-neutral-100 hover:bg-neutral-200 transition"
                    aria-label="Add to cart"
                  >
                    <ShoppingCart className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* small image placeholder / optional image */}
              <div className="mt-4 h-24 rounded-2xl bg-neutral-100 relative overflow-hidden">
                {p.image ? (
                  <Image
                    src={p.image}
                    alt={p.name}
                    fill
                    className="object-cover opacity-95 group-hover:scale-[1.02] transition duration-300"
                  />
                ) : (
                  <div className="absolute inset-0 bg-[radial-gradient(450px_180px_at_30%_30%,rgba(239,68,68,0.12),transparent_65%)]" />
                )}
              </div>

              <div className="mt-4 flex items-center justify-between text-xs text-neutral-500">
                <span className="rounded-full bg-neutral-100 px-3 py-2">
                  Quick add
                </span>

                <button
                  type="button"
                  onClick={() => onAskAI(p)}
                  className="hover:text-red-600 transition"
                >
                  Ask AI →
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
