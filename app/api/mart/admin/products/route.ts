import { NextRequest, NextResponse } from "next/server";
import { PRODUCTS } from "@/lib/mart/data";
import { createSyncEvent, readStore, upsertProduct } from "@/lib/sync/store";
import { processOutboundSyncQueue } from "@/lib/sync/dispatcher";
import { fetchDbDeals, fetchDbProducts, insertDbProduct } from "@/lib/sync/db";

function fallbackProducts() {
  return (PRODUCTS || []).map((p: any) => ({
    id: String(p.id),
    name: String(p.name),
    sku: String((p as any).sku ?? p.id),
    price: Number((p as any).priceGHS ?? 0),
    is_active: true,
    updated_at: new Date().toISOString(),
    source_system: "website" as const,
    external_ref: null,
    category: (p as any).category ?? (p as any).categorySlug ?? "general",
    image: (p as any).image ?? null,
    badge: (p as any).badge ?? null,
    tags: Array.isArray((p as any).tags) ? (p as any).tags : [],
    description: (p as any).description ?? null,
  }));
}

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
  const [dbProducts, dbDeals] = await Promise.all([fetchDbProducts(), fetchDbDeals()]);
  const products = mergedProducts(fallbackProducts(), dbProducts || [], store.products || []);
  const deals = [...(dbDeals || []), ...store.deals].reduce((acc: any[], d) => {
    if (!acc.some((x) => x.id === d.id)) acc.push(d);
    return acc;
  }, []);
  return NextResponse.json({ products, deals });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const payload = {
    id: body.id,
    name: body.name,
    sku: body.sku ?? body.id,
    price: Number(body.price),
    is_active: body.is_active ?? true,
    external_ref: body.external_ref ?? null,
  };

  upsertProduct(payload, "website");
  await insertDbProduct({ ...payload, updated_at: new Date().toISOString(), source_system: "website" });

  createSyncEvent({
    entity_type: "product",
    entity_id: body.id,
    action: "created",
    source: "website",
    payload: body,
  });
  await processOutboundSyncQueue();
  return NextResponse.json({ ok: true });
}
