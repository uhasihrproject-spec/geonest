import { NextResponse } from "next/server";
import { PRODUCTS } from "@/lib/mart/data";
import { readStore } from "@/lib/sync/store";
import { fetchDbDeals, fetchDbProducts } from "@/lib/sync/db";

function mergedProducts(...sources: any[][]) {
  const map = new Map<string, any>();
  for (const src of sources) {
    for (const p of src || []) {
      const prev = map.get(p.id);
      map.set(p.id, { ...prev, ...p });
    }
  }
  return Array.from(map.values());
}

export async function GET() {
  const store = readStore();
  const now = Date.now();
  const [dbProducts, dbDeals] = await Promise.all([fetchDbProducts(), fetchDbDeals()]);

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

  const products = mergedProducts(fallback, dbProducts || [], store.products || []).filter((p) => p.is_active);

  const allDeals = [...(dbDeals || []), ...store.deals];
  const uniqueDeals = allDeals.filter((d, i) => allDeals.findIndex((x) => x.id === d.id) === i);
  const activeDeals = uniqueDeals.filter(
    (d) => d.is_active && Date.parse(d.starts_at) <= now && (!d.ends_at || Date.parse(d.ends_at) >= now),
  );

  return NextResponse.json({ products, deals: activeDeals });
}
