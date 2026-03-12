import { NextRequest, NextResponse } from "next/server";
import { createSyncEvent, readStore, upsertProduct } from "@/lib/sync/store";
import { processOutboundSyncQueue } from "@/lib/sync/dispatcher";
import { fetchDbDeals, fetchDbProducts, insertDbProduct } from "@/lib/sync/db";

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
  const [dbProductsRes, dbDealsRes] = await Promise.all([fetchDbProducts(), fetchDbDeals()]);
  const products = mergedProducts(dbProductsRes.data || [], store.products || []);
  const deals = [...(dbDealsRes.data || []), ...store.deals].filter(
    (d, i, arr) => arr.findIndex((x) => x.id === d.id) === i,
  );

  if (!products.length && dbProductsRes.configured && dbProductsRes.error) {
    return NextResponse.json(
      {
        products: [],
        deals,
        error: `Could not load products from Supabase: ${dbProductsRes.error}`,
        sync_status: "failed",
      },
      { status: 503 },
    );
  }

  return NextResponse.json({ products, deals, sync_status: "synced", error: null });
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
  return NextResponse.json({ ok: true, sync_status: "pending" });
}
