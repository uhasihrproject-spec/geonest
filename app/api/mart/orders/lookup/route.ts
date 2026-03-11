import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const ref = url.searchParams.get("ref");
  const phone = url.searchParams.get("phone");

  if (!ref || !phone) {
    return NextResponse.json({ ok: false, error: "Missing ref or phone" }, { status: 400 });
  }

  // ✅ Stub for now (DB later)
  // Later: query your Orders table where orderRef=ref AND phone=phone
  // Return the order + status
  return NextResponse.json({ ok: true, order: null });
}
