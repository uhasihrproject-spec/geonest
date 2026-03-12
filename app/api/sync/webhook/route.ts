import { NextRequest, NextResponse } from "next/server";
import { verifySignature } from "@/lib/sync/signature";
import { createSyncEvent, hasEvent, upsertDeal, upsertProduct } from "@/lib/sync/store";
import { insertDbDeal, insertDbProduct } from "@/lib/sync/db";

export async function POST(req: NextRequest) {
  const raw = await req.text();
  const secret = process.env.SYNC_SHARED_SECRET;
  if (!secret) return NextResponse.json({ error: "Server not configured" }, { status: 500 });

  const signature = req.headers.get("x-sync-signature");
  if (!verifySignature(raw, signature, secret)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const body = JSON.parse(raw);
  const eventId = body.event_id;
  if (!eventId) return NextResponse.json({ error: "Missing event_id" }, { status: 400 });
  if (hasEvent(eventId)) return NextResponse.json({ ok: true, deduped: true });
  if (body.source === "website") return NextResponse.json({ ok: true, ignored: "loop_prevention" });

  if (body.entity_type === "product") {
    const p = body.payload;
    const payload = {
      id: p.id,
      name: p.name,
      sku: p.sku,
      price: Number(p.price),
      is_active: Boolean(p.is_active),
      external_ref: p.external_ref ?? null,
    };
    upsertProduct(payload, "core_admin");
    await insertDbProduct({ ...payload, source_system: "core_admin", updated_at: new Date().toISOString() });
  }

  if (body.entity_type === "deal") {
    const d = body.payload;
    const payload = {
      id: d.id,
      product_id: d.product_id,
      title: d.title,
      discount_type: d.discount_type,
      discount_value: Number(d.discount_value),
      starts_at: d.starts_at,
      ends_at: d.ends_at ?? null,
      is_active: Boolean(d.is_active),
    };
    upsertDeal(payload);
    await insertDbDeal({ ...payload, updated_at: new Date().toISOString() });
  }

  createSyncEvent({
    event_id: eventId,
    entity_type: body.entity_type,
    entity_id: body.entity_id,
    action: body.action,
    source: "core_admin",
    payload: body.payload,
  });

  return NextResponse.json({ ok: true });
}
