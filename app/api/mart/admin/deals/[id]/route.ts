import { NextRequest, NextResponse } from "next/server";
import { createSyncEvent, readStore, upsertDeal } from "@/lib/sync/store";
import { processOutboundSyncQueue } from "@/lib/sync/dispatcher";
import { fetchDbDealById, upsertDbDeal } from "@/lib/sync/db";

export async function PATCH(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const body = await req.json();
  const local = readStore().deals.find((d) => d.id === id);
  const db = (await fetchDbDealById(id)).data;
  const existing = local || db;
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const next = { ...existing, ...body };
  upsertDeal(next);
  await upsertDbDeal({ ...next, updated_at: new Date().toISOString() });
  createSyncEvent({ entity_type: "deal", entity_id: id, action: "updated", source: "website", payload: next });
  await processOutboundSyncQueue();
  return NextResponse.json({ ok: true, sync_status: "pending" });
}

export async function DELETE(_req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const local = readStore().deals.find((d) => d.id === id);
  const db = (await fetchDbDealById(id)).data;
  const existing = local || db;
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const next = { ...existing, is_active: false };
  upsertDeal(next);
  await upsertDbDeal({ ...next, updated_at: new Date().toISOString() });
  createSyncEvent({ entity_type: "deal", entity_id: id, action: "deactivated", source: "website", payload: next });
  await processOutboundSyncQueue();
  return NextResponse.json({ ok: true, sync_status: "pending" });
}
