import { NextResponse } from "next/server";
import { PRODUCTS } from "@/lib/mart/data";
import { readStore } from "@/lib/sync/store";

function mergedProducts(storeProducts: any[], fallback: any[]) {
  const map = new Map(fallback.map((p) => [p.id, p]));
  for (const p of storeProducts || []) {
    const prev = map.get(p.id);
    map.set(p.id, { ...prev, ...p });
  }
  return Array.from(map.values());
}

export async function GET() {
  const store = readStore();
  const now = Date.now();
  const activeDeals = store.deals.filter(
    (d) => d.is_active && Date.parse(d.starts_at) <= now && (!d.ends_at || Date.parse(d.ends_at) >= now),
  );
  const fallback = (PRODUCTS || []).map((p: any) => ({
    id: p.id,
    name: p.name,
    sku: p.sku ?? p.id,
    price: p.priceGHS,
    is_active: true,
    updated_at: new Date().toISOString(),
    source_system: "website",
    external_ref: null,
    category: p.category ?? p.categorySlug ?? "general",
    image: p.image ?? null,
    badge: p.badge ?? null,
    tags: Array.isArray(p.tags) ? p.tags : [],
    description: p.description ?? null,
  }));
  const products = mergedProducts(store.products, fallback).filter((p) => p.is_active);
  return NextResponse.json({ products, deals: activeDeals });
}
