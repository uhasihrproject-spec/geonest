import { NextResponse } from "next/server";
import { readStore } from "@/lib/sync/store";

export async function GET() {
  const store = readStore();
  const now = Date.now();
  const activeDeals = store.deals.filter(
    (d) => d.is_active && Date.parse(d.starts_at) <= now && (!d.ends_at || Date.parse(d.ends_at) >= now),
  );
  const products = store.products.filter((p) => p.is_active);
  return NextResponse.json({ products, deals: activeDeals });
}
