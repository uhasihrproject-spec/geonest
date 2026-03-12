import { NextRequest, NextResponse } from "next/server";
import { PRODUCTS } from "@/lib/mart/data";
import { createSyncEvent, readStore, upsertProduct } from "@/lib/sync/store";
import { processOutboundSyncQueue } from "@/lib/sync/dispatcher";

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

export async function GET() {
  const store = readStore();
  const products = store.products.length ? store.products : fallbackProducts();
  return NextResponse.json({ products, deals: store.deals });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  upsertProduct(
    {
      id: body.id,
      name: body.name,
      sku: body.sku ?? body.id,
      price: Number(body.price),
      is_active: body.is_active ?? true,
      external_ref: body.external_ref ?? null,
    },
    "website",
  );
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
