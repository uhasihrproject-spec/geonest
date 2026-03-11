"use client";

import { getProducts } from "@/lib/mart/productsLocal";

type VisibleProduct = {
  id: string;
  name: string;
  priceGHS: number;
  category: string;
  tags?: string[];
  specs?: any;
  badge?: any;
  description?: string;
  image?: string;
};

export function enrichAssistantContext(ctx: any = {}) {
  // If caller already passed visibleProducts, respect it.
  const hasVisible =
    Array.isArray(ctx?.visibleProducts) && ctx.visibleProducts.length > 0;

  if (hasVisible) return ctx;

  // Fallback: always provide catalog from productsLocal (base + custom)
  const all = getProducts() as any[];

  const visibleProducts: VisibleProduct[] = all.map((p) => ({
    id: p.id,
    name: p.name,
    priceGHS: Number(p.priceGHS || 0),
    category: String(p.category ?? p.categorySlug ?? "").trim().toLowerCase(),
    tags: Array.isArray(p.tags) ? p.tags : [],
    specs: p.specs ?? null,
    badge: p.badge ?? null,
    description: (p.description || "").trim() || undefined,
    image: p.image || undefined,
  }));

  return {
    ...ctx,
    visibleProducts,
  };
}
