import { NextRequest, NextResponse } from "next/server";
import { createSyncEvent, readStore, upsertDeal } from "@/lib/sync/store";
import { processOutboundSyncQueue } from "@/lib/sync/dispatcher";
import { fetchDbDeals, insertDbDeal } from "@/lib/sync/db";

export async function GET() {
  const dbDeals = await fetchDbDeals();
  const localDeals = readStore().deals;
  const deals = [...(dbDeals.data || []), ...localDeals].filter(
    (d, i, arr) => arr.findIndex((x) => x.id === d.id) === i,
  );

  if (!deals.length && dbDeals.configured && dbDeals.error) {
    return NextResponse.json({ deals: [], error: dbDeals.error, sync_status: "failed" }, { status: 503 });
  }

  return NextResponse.json({ deals, sync_status: "synced", error: null });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const payload = {
    id: body.id,
    product_id: body.product_id,
    title: body.title,
    discount_type: body.discount_type,
    discount_value: Number(body.discount_value),
    starts_at: body.starts_at ?? new Date().toISOString(),
    ends_at: body.ends_at ?? null,
    is_active: body.is_active ?? true,
  };

  upsertDeal(payload);
  await insertDbDeal({ ...payload, updated_at: new Date().toISOString() });
  createSyncEvent({ entity_type: "deal", entity_id: body.id, action: "created", source: "website", payload: body });
  await processOutboundSyncQueue();
  return NextResponse.json({ ok: true, sync_status: "pending" });
}
