"use client";

import Image from "next/image";
import { useMemo } from "react";
import { useMartStore } from "@/lib/mart/store";
import { askAssistant, openAssistant } from "@/lib/mart/assistant/controller";
import type { Product } from "@/lib/mart/productsLocal";
import { ShoppingCart, Sparkles, Tag, ArrowRight } from "lucide-react";

function money(n: number) {
  return `GHS ${Number(n || 0).toLocaleString()}`;
}

function normCategory(p: any) {
  return String(p.category ?? p.categorySlug ?? "").trim().toLowerCase();
}

function fallbackDesc(p: Product) {
  const cat = normCategory(p);
  const tags =
    Array.isArray((p as any).tags) && (p as any).tags.length
      ? (p as any).tags.slice(0, 4).join(", ")
      : null;

  return `A clean pick in ${cat || "our store"}.${tags ? ` Popular tags: ${tags}.` : ""}`;
}

function discountPct(price: number, original?: number) {
  if (!original || original <= price) return null;
  const pct = Math.round(((original - price) / original) * 100);
  return pct > 0 ? pct : null;
}

export default function ProductClient({
  product,
  more,
}: {
  product: Product;
  more: Product[];
}) {
  const addToCart = useMartStore((s) => s.addToCart);

  const img = product.image || "";
  const isDataUrl = img.startsWith("data:image/");
  const imageSrc = img || "/mart/placeholder.jpg";

  const desc = (product.description || "").trim() || fallbackDesc(product);

  const hasDeal =
    !!product.originalPriceGHS && product.originalPriceGHS > product.priceGHS;

  const pct = discountPct(product.priceGHS, product.originalPriceGHS);

  const assistantContext = useMemo(
    () => ({
      page: `/mart/product/${product.id}`,
      product: {
        id: product.id,
        name: product.name,
        priceGHS: product.priceGHS,
        originalPriceGHS: product.originalPriceGHS ?? null,
        dealType: product.dealType ?? null,
        category: (product as any).category ?? (product as any).categorySlug,
        tags: (product as any).tags ?? [],
        badge: (product as any).badge ?? null,
      },
      moreInCategory: more.slice(0, 6).map((p) => ({
        id: p.id,
        name: p.name,
        priceGHS: p.priceGHS,
      })),
    }),
    [product, more]
  );

  function handleAskAI() {
    openAssistant();
    askAssistant(
      "Should I buy this product? Compare it with similar items in this category and tell me the best value option.",
      assistantContext
    );
  }

  return (
    <div className="mt-6">
      {/* shell */}
      <div className="relative overflow-hidden rounded-[28px] sm:rounded-[34px] bg-neutral-50/70 ring-1 ring-neutral-200/70">
        {/* subtle glow */}
        <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-red-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -right-24 -bottom-24 h-72 w-72 rounded-full bg-emerald-500/10 blur-3xl" />

        <div className="grid gap-6 p-4 sm:p-6 lg:grid-cols-2 lg:gap-8 lg:p-7">
          {/* Image */}
          <div className="animate-in-up">
            <div className="relative overflow-hidden rounded-[24px] sm:rounded-[28px] bg-white ring-1 ring-neutral-200/70">
              <div className="absolute inset-0 bg-[radial-gradient(650px_260px_at_30%_20%,rgba(239,68,68,0.10),transparent_60%)]" />

              {isDataUrl ? (
                <img
                  src={imageSrc}
                  alt={product.name}
                  className="h-[260px] w-full object-cover sm:h-[340px] lg:h-[520px] transition duration-500 hover:scale-[1.02]"
                />
              ) : (
                <Image
                  src={imageSrc}
                  alt={product.name}
                  width={1400}
                  height={1100}
                  className="h-[260px] w-full object-cover sm:h-[340px] lg:h-[520px] transition duration-500 hover:scale-[1.02]"
                  priority
                />
              )}

              {/* badges */}
              <div className="absolute left-3 top-3 sm:left-4 sm:top-4 flex flex-wrap gap-2">
                {product.badge ? (
                  <span className="rounded-full bg-white/90 px-3 py-1 text-xs ring-1 ring-neutral-200/70">
                    {product.badge}
                  </span>
                ) : null}

                {hasDeal ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500 px-3 py-1 text-xs text-white">
                    <Tag className="h-3.5 w-3.5" />
                    Deal{pct ? ` · -${pct}%` : ""}
                  </span>
                ) : null}
              </div>
            </div>
          </div>

          {/* Info */}
          <div className="animate-in-up delay-1 lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-[24px] sm:rounded-[28px] bg-white p-5 sm:p-6 ring-1 ring-neutral-200/70">
              <p className="text-xs uppercase tracking-[0.25em] text-neutral-500">
                {normCategory(product) || "product"}
              </p>

              <h1 className="mt-2 text-xl sm:text-2xl lg:text-3xl font-semibold tracking-tight">
                {product.name}
              </h1>

              <div className="mt-4">
                <p className="text-sm text-neutral-500">Price</p>
                <p className="mt-1 text-2xl font-semibold">
                  {money(product.priceGHS)}
                </p>

                {hasDeal ? (
                  <p className="mt-1 text-sm text-red-600">
                    Was {money(product.originalPriceGHS!)} · {product.dealType || "deal"}
                    {pct ? ` · Save ${pct}%` : ""}
                  </p>
                ) : (
                  <p className="mt-1 text-sm text-neutral-500">
                    Best price available now.
                  </p>
                )}
              </div>

              <p className="mt-4 text-sm leading-relaxed text-neutral-700">
                {desc}
              </p>

              {/* tags */}
              {Array.isArray((product as any).tags) && (product as any).tags.length ? (
                <div className="mt-4 flex flex-wrap gap-2">
                  {(product as any).tags.slice(0, 10).map((t: string) => (
                    <span
                      key={t}
                      className="rounded-full bg-neutral-100 px-3 py-1 text-xs text-neutral-700"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              ) : null}

              {/* actions */}
              <div className="mt-6 grid gap-2 sm:grid-cols-2">
                <button
                  onClick={() => addToCart(product as any, 1)}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-black py-3 text-sm text-white transition hover:bg-black/90 active:scale-[0.99]"
                >
                  <ShoppingCart className="h-4 w-4" />
                  Add to cart
                </button>

                <button
                  onClick={handleAskAI}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-neutral-100 py-3 text-sm text-neutral-900 transition hover:bg-neutral-200 active:scale-[0.99]"
                >
                  <Sparkles className="h-4 w-4" />
                  Ask AI
                </button>
              </div>

              <p className="mt-4 text-xs text-neutral-500">
                Tip: Use Admin → Add New to add description & tags later.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* More in category */}
      <div className="mt-10">
        <div className="flex items-end justify-between gap-3">
          <h2 className="text-lg sm:text-xl font-semibold">More in this category</h2>
          <span className="text-sm text-neutral-500">{more.length} item(s)</span>
        </div>

        {more.length === 0 ? (
          <div className="mt-4 rounded-[24px] sm:rounded-[28px] bg-white p-7 ring-1 ring-neutral-200/70">
            <p className="text-sm font-medium">Nothing else here yet.</p>
            <p className="mt-1 text-sm text-neutral-600">
              Try another category or check back later.
            </p>
          </div>
        ) : (
          <>
            {/* Mobile: horizontal scroll */}
            <div className="mt-4 flex gap-3 overflow-x-auto pb-2 lg:hidden">
              {more.map((p) => {
                const mImg = p.image || "";
                const mData = mImg.startsWith("data:image/");
                const src = mImg || "/mart/placeholder.jpg";

                return (
                  <a
                    key={p.id}
                    href={`/mart/product/${p.id}`}
                    className="min-w-[220px] rounded-[22px] bg-white p-4 ring-1 ring-neutral-200/70 transition hover:ring-neutral-300"
                  >
                    <div className="overflow-hidden rounded-2xl bg-neutral-50 ring-1 ring-neutral-200">
                      {mData ? (
                        <img src={src} alt={p.name} className="h-36 w-full object-cover" />
                      ) : (
                        <Image src={src} alt={p.name} width={900} height={700} className="h-36 w-full object-cover" />
                      )}
                    </div>

                    <p className="mt-3 text-sm font-semibold line-clamp-1">{p.name}</p>
                    <div className="mt-1 flex items-center justify-between gap-2">
                      <p className="text-sm text-neutral-600">{money(p.priceGHS)}</p>
                      <span className="inline-flex items-center gap-1 text-xs text-neutral-500">
                        View <ArrowRight className="h-3.5 w-3.5" />
                      </span>
                    </div>
                  </a>
                );
              })}
            </div>

            {/* Desktop: grid */}
            <div className="mt-4 hidden lg:grid gap-4 lg:grid-cols-4">
              {more.map((p, i) => {
                const mImg = p.image || "";
                const mData = mImg.startsWith("data:image/");
                const src = mImg || "/mart/placeholder.jpg";

                return (
                  <a
                    key={p.id}
                    href={`/mart/product/${p.id}`}
                    className="group rounded-[26px] bg-white p-4 ring-1 ring-neutral-200/70 transition hover:-translate-y-1 hover:ring-neutral-300 hover:shadow-sm"
                    style={{ animationDelay: `${i * 40}ms` }}
                  >
                    <div className="overflow-hidden rounded-2xl bg-neutral-50 ring-1 ring-neutral-200">
                      {mData ? (
                        <img
                          src={src}
                          alt={p.name}
                          className="h-40 w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                        />
                      ) : (
                        <Image
                          src={src}
                          alt={p.name}
                          width={900}
                          height={700}
                          className="h-40 w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                        />
                      )}
                    </div>

                    <p className="mt-3 text-sm font-semibold line-clamp-1">{p.name}</p>
                    <div className="mt-1 flex items-center justify-between gap-2">
                      <p className="text-sm text-neutral-600">{money(p.priceGHS)}</p>
                      <span className="inline-flex items-center gap-1 text-xs text-neutral-500">
                        View <ArrowRight className="h-3.5 w-3.5" />
                      </span>
                    </div>
                  </a>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* animations */}
      <style jsx>{`
        .animate-in-up {
          opacity: 0;
          transform: translateY(10px);
          animation: inUp 420ms ease-out forwards;
        }
        .delay-1 {
          animation-delay: 90ms;
        }
        @keyframes inUp {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
