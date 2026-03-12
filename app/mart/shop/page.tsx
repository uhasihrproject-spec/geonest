// app/mart/shop/page.tsx (or wherever this ShopPage is)
"use client";

import { useEffect, useMemo, useState } from "react";
import { CATEGORIES } from "@/lib/mart/data";
import ShopToolbar from "@/components/mart/shop/ShopToolbar";
import ProductGrid from "@/components/mart/shop/ProductGrid";
import { getProducts, syncProductsFromServer, type Product } from "@/lib/mart/productsLocal";

type SearchParams = {
  q?: string;
  category?: string;
  sort?: string;
  min?: string;
  max?: string;
};

function normalize(v = "") {
  return v.trim().toLowerCase();
}

function toNumber(v?: string) {
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}

export default function ShopPage({ searchParams }: { searchParams: SearchParams }) {
  const [all, setAll] = useState<Product[]>([]);

  useEffect(() => {
    setAll(getProducts());
    void syncProductsFromServer().then(setAll);
    const onStorage = () => setAll(getProducts());
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const q = normalize(searchParams.q);
  const category = normalize(searchParams.category);
  const sort = normalize(searchParams.sort || "featured");
  const min = toNumber(searchParams.min);
  const max = toNumber(searchParams.max);

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

  const title = category
    ? CATEGORIES.find((c) => c.slug === category)?.name ?? "Products"
    : "All products";

  return (
    <div className="py-10">
      <h1 className="text-2xl md:text-4xl font-semibold tracking-tight">{title}</h1>

      <div className="mt-6">
        <ShopToolbar categories={CATEGORIES} />
      </div>

      <div className="mt-8">
        <ProductGrid
          products={products}
          context={{
            page: "/mart/shop",
            filters: { q, category, sort, min, max },

            // ✅ THIS IS THE FIX: send real products (so AI never invents)
            // Use the filtered list (what user is seeing) — best grounding.
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
