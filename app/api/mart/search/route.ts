import { NextResponse } from "next/server";
// Option A: search your in-memory PRODUCTS for now
import { PRODUCTS } from "@/lib/mart/data";

// If you later move to DB, replace the filter logic with a DB query.

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") ?? "").trim().toLowerCase();
  const limit = Math.min(Number(searchParams.get("limit") ?? "6"), 20);

  if (!q) {
    return NextResponse.json({ items: [] });
  }

  const items = PRODUCTS.filter((p) => {
    const name = p.name?.toLowerCase?.() ?? "";
    const cat = p.category?.toLowerCase?.() ?? "";
    const tags = ((p as any).tags ?? []).join(" ").toLowerCase();
    return name.includes(q) || cat.includes(q) || tags.includes(q);
  })
    .slice(0, limit)
    .map((p) => ({
      id: p.id,
      name: p.name,
      priceGHS: p.priceGHS,
      category: p.category,
      image: p.image,
    }));

  return NextResponse.json({ items });
}
