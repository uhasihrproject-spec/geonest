import { NextResponse } from "next/server";
import { fetchDbProducts } from "@/lib/sync/db";
import { readStore } from "@/lib/sync/store";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") ?? "").trim().toLowerCase();
  const limit = Math.min(Number(searchParams.get("limit") ?? "6"), 20);

  if (!q) {
    return NextResponse.json({ items: [] });
  }

  const db = await fetchDbProducts();
  const base = db.data?.length
    ? db.data
    : readStore().products;

  const items = base
    .filter((p: any) => {
      const name = p.name?.toLowerCase?.() ?? "";
      const cat = (p.category ?? "general")?.toLowerCase?.() ?? "";
      const tags = ((p as any).tags ?? []).join(" ").toLowerCase();
      return p.is_active !== false && (name.includes(q) || cat.includes(q) || tags.includes(q));
    })
    .slice(0, limit)
    .map((p: any) => ({
      id: p.id,
      name: p.name,
      priceGHS: Number(p.price ?? p.priceGHS ?? 0),
      category: p.category ?? "general",
      image: p.image ?? null,
    }));

  return NextResponse.json({ items, error: db.error ?? null });
}
