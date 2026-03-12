import { NextRequest, NextResponse } from "next/server";
import { createSyncEvent, readStore, upsertDeal } from "@/lib/sync/store";
import { processOutboundSyncQueue } from "@/lib/sync/dispatcher";

export async function GET() {
  return NextResponse.json({ deals: readStore().deals });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  upsertDeal({
    id: body.id,
    product_id: body.product_id,
    title: body.title,
    discount_type: body.discount_type,
    discount_value: Number(body.discount_value),
    starts_at: body.starts_at ?? new Date().toISOString(),
    ends_at: body.ends_at ?? null,
    is_active: body.is_active ?? true,
  });
  createSyncEvent({ entity_type: "deal", entity_id: body.id, action: "created", source: "website", payload: body });
  await processOutboundSyncQueue();
  return NextResponse.json({ ok: true });
}
