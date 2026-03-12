import { NextResponse } from "next/server";
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
  const [dbProductsRes, dbDealsRes] = await Promise.all([fetchDbProducts(), fetchDbDeals()]);

  const products = mergedProducts(dbProductsRes.data || [], store.products || []).filter((p) => p.is_active);
  const allDeals = [...(dbDealsRes.data || []), ...store.deals];
  const uniqueDeals = allDeals.filter((d, i) => allDeals.findIndex((x) => x.id === d.id) === i);
  const activeDeals = uniqueDeals.filter(
    (d) => d.is_active && Date.parse(d.starts_at) <= now && (!d.ends_at || Date.parse(d.ends_at) >= now),
  );

  if (!products.length && dbProductsRes.configured && dbProductsRes.error) {
    return NextResponse.json(
      {
        products: [],
        deals: activeDeals,
        error: `Product sync unavailable: ${dbProductsRes.error}`,
        sync_status: "failed",
      },
      { status: 503 },
    );
  }

  return NextResponse.json({ products, deals: activeDeals, sync_status: "synced", error: null });
}
