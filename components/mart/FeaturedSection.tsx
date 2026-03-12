"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Heart, ShoppingCart, Sparkles } from "lucide-react";
import { useMartStore } from "@/lib/mart/store";
import { askAssistant } from "@/lib/mart/assistant/controller";
import { getProducts, getProductSyncState, syncProductsFromServer, type Product } from "@/lib/mart/productsLocal";

const TABS = ["Trending", "New", "Best Sellers", "Under GHS 500"];

export default function FeaturedSection() {
  const [items, setItems] = useState<Product[]>([]);
  const [syncError, setSyncError] = useState<string | null>(null);

  const addToCart = useMartStore((s) => s.addToCart);
  const toggleWishlist = useMartStore((s) => s.toggleWishlist);
  const isWishlisted = useMartStore((s) => s.isWishlisted);

  useEffect(() => {
    const load = async () => {
      setItems(getProducts());
      try {
        setItems(await syncProductsFromServer());
        setSyncError(null);
      } catch {
        setItems(getProducts());
        setSyncError(getProductSyncState().error || "Could not sync featured products.");
      }
    };
    void load();
    const onStorage = () => setItems(getProducts());
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const hero = items[0];
  const rest = items.slice(1, 7);
  const heroSaved = useMemo(() => (hero ? isWishlisted(hero.id) : false), [hero, isWishlisted]);

  function onAskAI(p: { id: string; name: string }) {
    askAssistant(`Tell me if ${p.name} is worth it and why.`, { page: "/mart", productId: p.id });
  }

  if (!items.length) {
    return (
      <div className="rounded-[24px] bg-white p-8 ring-1 ring-neutral-200/70">
        <p className="text-sm font-medium">No products available yet.</p>
        <p className="mt-2 text-sm text-neutral-600">{syncError || "Waiting for product sync from Supabase."}</p>
        <button
          className="mt-4 rounded-full bg-black px-4 py-2 text-sm text-white"
          onClick={async () => {
            try {
              setItems(await syncProductsFromServer());
              setSyncError(null);
            } catch {
              setSyncError(getProductSyncState().error || "Retry failed.");
            }
          }}
        >
          Retry sync
        </button>
      </div>
    );
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[1.2fr_1fr]">
      <div className="relative overflow-hidden rounded-[32px] bg-white ring-1 ring-neutral-200/70">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(900px_420px_at_25%_20%,rgba(239,68,68,0.10),transparent_60%)]" />

        <div className="relative p-7 md:p-10">
          <div className="flex flex-wrap gap-2">
            {TABS.map((t, i) => (
              <button
                key={t}
                className={`rounded-full px-4 py-2 text-xs transition ${
                  i === 0 ? "bg-black text-white" : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
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

              <h3 className="mt-4 text-2xl md:text-3xl font-semibold tracking-tight">{hero?.name ?? "Featured Product"}</h3>
              <p className="mt-3 text-neutral-600">Live product synced from your database.</p>
              <p className="mt-5 text-xl font-semibold">GHS {hero?.priceGHS?.toFixed(2) ?? "0.00"}</p>

              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => hero && addToCart(hero, 1)}
                  disabled={!hero}
                  className="inline-flex items-center gap-2 rounded-full bg-black px-6 py-3 text-sm text-white hover:bg-black/90 transition active:scale-[0.99] disabled:opacity-50"
                >
                  <ShoppingCart className="h-4 w-4" />
                  Add to cart
                </button>

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
              </div>

              {syncError && <p className="mt-4 text-xs text-amber-700">Sync warning: {syncError}</p>}
            </div>

            <div className="relative">
              <div className="pointer-events-none absolute -inset-6 rounded-[28px] bg-[radial-gradient(500px_280px_at_50%_35%,rgba(239,68,68,0.14),transparent_62%)]" />
              <div className="relative aspect-square w-full rounded-[28px] bg-neutral-100 overflow-hidden">
                <Image src={hero?.image || "/mart/hero/main.jpg"} alt={hero?.name || "Featured product image"} fill className="object-contain p-8" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
        {rest.map((p) => {
          const saved = isWishlisted(p.id);
          return (
            <div key={p.id} className="group rounded-[28px] bg-white p-5 ring-1 ring-neutral-200/70 transition hover:-translate-y-1 hover:shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold">{p.name}</p>
                  <p className="mt-1 text-sm text-neutral-600">GHS {p.priceGHS.toFixed(2)}</p>
                </div>

                <div className="flex items-center gap-2">
                  <button type="button" onClick={() => toggleWishlist(p.id)} className={`inline-flex h-10 w-10 items-center justify-center rounded-full transition ${saved ? "bg-red-50 text-red-700" : "bg-neutral-100 hover:bg-neutral-200"}`}>
                    <Heart className="h-4 w-4" fill={saved ? "currentColor" : "none"} />
                  </button>
                  <button type="button" onClick={() => addToCart(p, 1)} className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-neutral-100 hover:bg-neutral-200 transition">
                    <ShoppingCart className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="mt-4 h-24 rounded-2xl bg-neutral-100 relative overflow-hidden">
                <Image src={p.image || "/mart/hero/thumb-1.jpg"} alt={p.name} fill className="object-cover opacity-95 group-hover:scale-[1.02] transition duration-300" />
              </div>

              <div className="mt-4 flex items-center justify-between text-xs text-neutral-500">
                <span className="rounded-full bg-neutral-100 px-3 py-2">Quick add</span>
                <button type="button" onClick={() => onAskAI(p)} className="hover:text-red-600 transition">Ask AI →</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
