"use client";

import { useEffect, useMemo, useState } from "react";
import { CATEGORIES } from "@/lib/mart/data";
import ShopToolbar from "@/components/mart/shop/ShopToolbar";
import ProductGrid from "@/components/mart/shop/ProductGrid";
import { getProductSyncState, getProducts, syncProductsFromServer, type Product } from "@/lib/mart/productsLocal";

function normalize(v = "") {
  return v.trim().toLowerCase();
}

function toNumber(v?: string) {
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}

type FilterState = { q: string; category: string; sort: string; min: string; max: string };

function readFiltersFromUrl(): FilterState {
  if (typeof window === "undefined") {
    return { q: "", category: "", sort: "featured", min: "", max: "" };
  }
  const sp = new URL(window.location.href).searchParams;
  return {
    q: sp.get("q") ?? "",
    category: sp.get("category") ?? "",
    sort: sp.get("sort") ?? "featured",
    min: sp.get("min") ?? "",
    max: sp.get("max") ?? "",
  };
}

export default function ShopPage() {
  const [all, setAll] = useState<Product[]>([]);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterState>({ q: "", category: "", sort: "featured", min: "", max: "" });

  useEffect(() => {
    setAll(getProducts());
    void syncProductsFromServer().then((v) => { setAll(v); setSyncError(null); }).catch(() => setSyncError(getProductSyncState().error || "Sync failed"));
    setFilters(readFiltersFromUrl());

    const onStorage = () => setAll(getProducts());
    const onPopState = () => setFilters(readFiltersFromUrl());
    window.addEventListener("storage", onStorage);
    window.addEventListener("popstate", onPopState);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("popstate", onPopState);
    };
  }, []);

  function applyFilters(patch: Partial<FilterState>) {
    const next = { ...filters, ...patch };
    setFilters(next);

    const params = new URLSearchParams();
    if (next.q) params.set("q", next.q);
    if (next.category) params.set("category", next.category);
    if (next.sort && next.sort !== "featured") params.set("sort", next.sort);
    if (next.min) params.set("min", next.min);
    if (next.max) params.set("max", next.max);

    const qs = params.toString();
    const url = qs ? `/mart/shop?${qs}` : "/mart/shop";
    window.history.replaceState(null, "", url);
  }

  const q = normalize(filters.q);
  const category = normalize(filters.category);
  const sort = normalize(filters.sort || "featured");
  const min = toNumber(filters.min);
  const max = toNumber(filters.max);

  const products = useMemo(() => {
    let list = all.filter((p) => {
      const pCategory = normalize((p as any).category ?? (p as any).categorySlug ?? "");
      if (q && !normalize(p.name).includes(q)) return false;
      if (category && pCategory !== category) return false;
      if (min !== undefined && p.priceGHS < min) return false;
      if (max !== undefined && p.priceGHS > max) return false;
      return true;
    });

    if (sort === "price-asc") list = [...list].sort((a, b) => a.priceGHS - b.priceGHS);
    if (sort === "price-desc") list = [...list].sort((a, b) => b.priceGHS - a.priceGHS);
    if (sort === "name") list = [...list].sort((a, b) => a.name.localeCompare(b.name));

    return list;
  }, [all, q, category, min, max, sort]);

  const title = category ? CATEGORIES.find((c) => c.slug === category)?.name ?? "Products" : "All products";

  return (
    <div className="py-10">
      <h1 className="text-2xl md:text-4xl font-semibold tracking-tight">{title}</h1>

      <div className="mt-6">
        <ShopToolbar categories={CATEGORIES} filters={filters} onChange={applyFilters} />
      </div>


      {syncError && (
        <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {syncError}
          <button
            className="ml-3 rounded-full bg-amber-700 px-3 py-1 text-xs text-white"
            onClick={() => void syncProductsFromServer().then((v) => { setAll(v); setSyncError(null); }).catch(() => setSyncError(getProductSyncState().error || "Retry failed"))}
          >
            Retry sync
          </button>
        </div>
      )}

      <div className="mt-8">
        <ProductGrid
          products={products}
          context={{
            page: "/mart/shop",
            filters: { q, category, sort, min, max },
            visibleProducts: products.map((p) => ({
              id: p.id,
              name: p.name,
              priceGHS: p.priceGHS,
              category: (p as any).category ?? (p as any).categorySlug ?? "",
              badge: (p as any).badge ?? null,
              tags: Array.isArray((p as any).tags) ? (p as any).tags : [],
              description: (p as any).description ?? null,
              image: (p as any).image ?? null,
            })),
          }}
        />
      </div>
    </div>
  );
}
