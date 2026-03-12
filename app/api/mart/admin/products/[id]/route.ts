import { NextRequest, NextResponse } from "next/server";
import { createSyncEvent, readStore, upsertProduct } from "@/lib/sync/store";
import { processOutboundSyncQueue } from "@/lib/sync/dispatcher";
import { fetchDbProductById, upsertDbProduct } from "@/lib/sync/db";

export async function PATCH(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const body = await req.json();
  const local = readStore().products.find((p) => p.id === id);
  const db = (await fetchDbProductById(id)).data;
  const existing = local || db;
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const next = {
    ...existing,
    name: body.name ?? existing.name,
    sku: body.sku ?? existing.sku,
    price: body.price ?? existing.price,
    is_active: body.is_active ?? existing.is_active,
    external_ref: body.external_ref ?? existing.external_ref,
  };
  upsertProduct(next, "website");
  await upsertDbProduct({ ...next, updated_at: new Date().toISOString(), source_system: "website" });
  createSyncEvent({ entity_type: "product", entity_id: id, action: "updated", source: "website", payload: next });
  await processOutboundSyncQueue();
  return NextResponse.json({ ok: true, sync_status: "pending" });
}

export async function DELETE(_req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const local = readStore().products.find((p) => p.id === id);
  const db = (await fetchDbProductById(id)).data;
  const existing = local || db;
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const next = { ...existing, is_active: false };
  upsertProduct(next, "website");
  await upsertDbProduct({ ...next, updated_at: new Date().toISOString(), source_system: "website" });
  createSyncEvent({ entity_type: "product", entity_id: id, action: "deactivated", source: "website", payload: next });
  await processOutboundSyncQueue();
  return NextResponse.json({ ok: true, sync_status: "pending" });
}
