import { NextResponse } from "next/server";
import QRCode from "qrcode";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const data = url.searchParams.get("data");

  if (!data) {
    return NextResponse.json({ ok: false, error: "Missing data" }, { status: 400 });
  }

  const qr = await QRCode.toDataURL(data, { margin: 1, width: 520 });
  return NextResponse.json({ ok: true, qr });
}
