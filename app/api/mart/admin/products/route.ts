import { NextRequest, NextResponse } from "next/server";
import { createSyncEvent, readStore, upsertProduct } from "@/lib/sync/store";
import { processOutboundSyncQueue } from "@/lib/sync/dispatcher";

export async function GET() {
  const store = readStore();
  return NextResponse.json({ products: store.products, deals: store.deals });
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
