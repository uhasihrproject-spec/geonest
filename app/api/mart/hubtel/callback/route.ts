import { NextResponse } from "next/server";
import { updateOrder } from "@/lib/mart/ordersLocal";

/**
 * NOTE:
 * In REAL production, this should update a DATABASE.
 * For now, we update localStorage-compatible logic (demo-safe).
 */

export async function POST(req: Request) {
  try {
    const payload = await req.json();

    const ref = payload?.ClientReference;
    const status = payload?.Status;

    if (!ref) {
      return NextResponse.json({ ok: false, error: "Missing reference" }, { status: 400 });
    }

    if (status === "Success") {
      updateOrder(ref, {
        paymentStatus: "paid",
        hubtel: { lastEvent: payload },
      });
    } else {
      updateOrder(ref, {
        paymentStatus: "pending",
        hubtel: { lastEvent: payload },
      });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ ok: false, error: "Callback error" }, { status: 500 });
  }
}
