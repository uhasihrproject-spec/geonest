import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json();

  // ✅ For now: accept and return OK (no user DB required)
  // Later: store in DB table "orders" only (no users table).
  // You can also forward to email/Slack/Webhook here.
  console.log("New order:", body?.orderRef);

  return NextResponse.json({ ok: true, orderRef: body?.orderRef ?? null });
}
