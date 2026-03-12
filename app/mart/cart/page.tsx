"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo } from "react";
import { useMartStore } from "@/lib/mart/store";
import { Minus, Plus, Trash2, ArrowRight, Sparkles } from "lucide-react";
import { askAssistant, openAssistant } from "@/lib/mart/assistant/controller";
import { getProducts, syncProductsFromServer } from "@/lib/mart/productsLocal";

function money(n: number) {
  return `GHS ${Number(n || 0).toFixed(2)}`;
}

const CHECKOUT_SUCCESS_KEY = "gm_checkout_success_v1";

export default function CartPage() {
  const cart = useMartStore((s) => s.cart);
  const items = Object.values(cart);

  const productsIndex = useMemo(() => {
  const list = getProducts();
  const map = new Map<string, any>();
  for (const p of list) map.set(p.id, p);
  return map;
}, []);

  const setQty = useMartStore((s) => s.setQty);
  const removeFromCart = useMartStore((s) => s.removeFromCart);
  const clearCart = useMartStore((s) => s.clearCart);

  const subtotal = useMartStore((s) => s.cartSubtotal());
  const count = useMartStore((s) => s.cartCount());

  // backend-ready placeholders (you’ll compute from zones later)
  const deliveryFee = subtotal > 0 ? 25 : 0;
  const total = subtotal + deliveryFee;

  // ✅ Auto-clear cart after a successful checkout
  useEffect(() => {
    const flag = localStorage.getItem(CHECKOUT_SUCCESS_KEY);
    if (!flag) return;

    // clear cart and remove the flag so it doesn't repeat
    clearCart();
    localStorage.removeItem(CHECKOUT_SUCCESS_KEY);
  }, [clearCart]);

  const assistantContext = useMemo(() => {
  const cartItems = items.map((it) => {
    const p = productsIndex.get(it.productId);
    const category = String(p?.category ?? "unknown");

    return {
      productId: it.productId,
      name: it.name,
      priceGHS: it.priceGHS,
      qty: it.qty,
      category,
      lineTotal: it.priceGHS * it.qty,
    };
  });

  return {
    page: "/mart/cart",

    cart: { items: cartItems },

    totals: { subtotal, deliveryFee, total },

    // ✅ send ALL products so AI can suggest replacements properly
    visibleProducts: getProducts().map((p: any) => ({
      id: p.id,
      name: p.name,
      priceGHS: p.priceGHS,
      category: p.category,
      tags: Array.isArray(p.tags) ? p.tags : [],
      badge: p.badge ?? null,
      description: p.description ?? null,
    })),
  };
}, [items, subtotal, deliveryFee, total, productsIndex]);

  function askCartAssistant() {
    openAssistant();
    askAssistant(
      "Optimize my cart for best value. Suggest cheaper alternatives, bundles, and what to remove if I’m overpaying. Also estimate what category I’m spending most on.",
      assistantContext
    );
  }

  return (
    <div className="py-10">
      <div className="flex flex-col gap-2">
        <p className="text-xs tracking-[0.35em] text-neutral-500">CART</p>
        <h1 className="text-2xl md:text-4xl font-semibold tracking-tight">
          Your cart
        </h1>
        <p className="text-neutral-600">
          {count > 0 ? (
            <>
              You have <span className="font-medium">{count}</span> item(s) in your cart.
            </>
          ) : (
            <>Your cart is empty. Let’s fix that 🙂</>
          )}
        </p>
      </div>

      {items.length === 0 ? (
        <div className="mt-10 rounded-[32px] bg-neutral-50/60 p-10">
          <p className="text-lg font-semibold">Nothing here yet</p>
          <p className="mt-2 text-neutral-600 max-w-xl">
            Browse products and tap “Add to cart”. Your selections will show up here.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/mart/shop"
              className="inline-flex items-center gap-2 rounded-full bg-black px-7 py-3 text-sm text-white hover:bg-black/90 transition active:scale-[0.99]"
            >
              Go to shop <ArrowRight className="h-4 w-4" />
            </Link>

            <Link
              href="/mart"
              className="inline-flex items-center gap-2 rounded-full bg-white px-7 py-3 text-sm ring-1 ring-neutral-200/70 hover:bg-neutral-50 transition active:scale-[0.99]"
            >
              Back to home <ArrowRight className="h-4 w-4" />
            </Link>

            <Link
              href="/mart/track"
              className="inline-flex items-center gap-2 rounded-full bg-white px-7 py-3 text-sm ring-1 ring-neutral-200/70 hover:bg-neutral-50 transition active:scale-[0.99]"
            >
              Track your orders
            </Link>
          </div>
        </div>
      ) : (
        <div className="mt-10 grid gap-8 lg:grid-cols-[1.3fr_0.7fr] lg:items-start">
          {/* Items */}
          <div className="space-y-4">
            {items.map((it) => {
              const img = it.image || "";
              const isDataUrl = img.startsWith("data:image/");

              return (
                <div
                  key={it.productId}
                  className="rounded-[28px] bg-white p-5 ring-1 ring-neutral-200/70"
                >
                  <div className="flex gap-4">
                    {/* image */}
                    <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl bg-neutral-100">
                      {img ? (
                        isDataUrl ? (
                          <img
                            src={img}
                            alt={it.name}
                            className="absolute inset-0 h-full w-full object-cover"
                          />
                        ) : (
                          <Image
                            src={img}
                            alt={it.name}
                            fill
                            className="object-cover"
                          />
                        )
                      ) : (
                        <div className="absolute inset-0 bg-[radial-gradient(450px_180px_at_30%_30%,rgba(239,68,68,0.12),transparent_65%)]" />
                      )}
                    </div>

                    {/* details */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <Link
                            href={`/mart/product/${it.productId}`}
                            className="text-sm font-semibold hover:underline"
                          >
                            {it.name}
                          </Link>
                          <p className="mt-1 text-sm text-neutral-600">
                            {money(it.priceGHS)}
                          </p>
                        </div>

                        <button
                          onClick={() => removeFromCart(it.productId)}
                          className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-neutral-100 hover:bg-neutral-200 transition"
                          aria-label="Remove item"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      {/* qty controls */}
                      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                        <div className="inline-flex items-center gap-2 rounded-2xl bg-neutral-100 px-3 py-2">
                          <button
                            onClick={() => setQty(it.productId, it.qty - 1)}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-white hover:bg-neutral-50 transition active:scale-[0.99]"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="h-4 w-4" />
                          </button>

                          <span className="w-8 text-center text-sm font-semibold">
                            {it.qty}
                          </span>

                          <button
                            onClick={() => setQty(it.productId, it.qty + 1)}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-white hover:bg-neutral-50 transition active:scale-[0.99]"
                            aria-label="Increase quantity"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>

                        <p className="text-sm font-semibold">
                          {money(it.priceGHS * it.qty)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <button
                onClick={clearCart}
                className="inline-flex items-center gap-2 rounded-full bg-neutral-100 px-7 py-3 text-sm hover:bg-neutral-200 transition active:scale-[0.99]"
              >
                Clear cart
              </button>

              <Link
                href="/mart/shop"
                className="inline-flex items-center gap-2 rounded-full bg-white px-7 py-3 text-sm ring-1 ring-neutral-200/70 hover:bg-neutral-50 transition active:scale-[0.99]"
              >
                Continue shopping <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* Summary */}
          <aside className="rounded-[32px] bg-neutral-50/60 p-7">
            <p className="text-xs tracking-[0.35em] text-neutral-500">SUMMARY</p>

            <div className="mt-5 space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-neutral-600">Subtotal</span>
                <span className="font-semibold">{money(subtotal)}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-neutral-600">Delivery</span>
                <span className="font-semibold">{money(deliveryFee)}</span>
              </div>

              <div className="border-t border-neutral-200/70 pt-3 flex items-center justify-between">
                <span className="text-neutral-900 font-semibold">Total</span>
                <span className="text-neutral-900 font-semibold">{money(total)}</span>
              </div>

              <p className="text-xs text-neutral-500 pt-1">
                Delivery fee is placeholder — you’ll calculate by location/zone later.
              </p>
            </div>

            <Link
              href="/mart/checkout"
              className="mt-6 block w-full rounded-2xl bg-black px-5 py-3 text-center text-sm text-white hover:bg-black/90 transition active:scale-[0.99]"
            >
              Checkout
            </Link>

            <Link
              href="/mart/track"
              className="mt-3 block w-full rounded-2xl bg-black px-5 py-3 text-center text-sm text-white hover:bg-black/90 transition active:scale-[0.99]"
            >
              Track
            </Link>

            <button
              type="button"
              onClick={askCartAssistant}
              className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm ring-1 ring-neutral-200/70 hover:bg-neutral-50 transition active:scale-[0.99]"
            >
              <Sparkles className="h-4 w-4" />
              Ask assistant to optimize your cart
            </button>
          </aside>
        </div>
      )}
    </div>
  );
}
