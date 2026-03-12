import Link from "next/link";
import { CATEGORIES } from "@/lib/mart/data";
import { ArrowRight, LayoutGrid, Flame, Tag, Sparkles, Search } from "lucide-react";

type SearchParams = { q?: string };

type LiveProduct = { id: string; category?: string; categorySlug?: string; is_active?: boolean };

function normalize(s: string) {
  return s.trim().toLowerCase();
}

const ICONS: Record<string, any> = {
  electronics: Sparkles,
  phones: Flame,
  groceries: Tag,
};

export default async function CategoriesPage({ searchParams }: { searchParams: SearchParams }) {
  const q = searchParams.q ? normalize(searchParams.q) : "";

  let liveProducts: LiveProduct[] = [];
  try {
    const res = await fetch("/api/mart/products", { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      liveProducts = Array.isArray(data.products) ? data.products : [];
    }
  } catch {
    liveProducts = [];
  }

  function catCount(slug: string) {
    return liveProducts.filter((p) => (p.category || p.categorySlug || "").toLowerCase() === slug && p.is_active !== false).length;
  }

  const categories = CATEGORIES.map((c) => ({ ...c, count: catCount(c.slug) }))
    .filter((c) => (q ? normalize(c.name).includes(q) || normalize(c.slug).includes(q) : true))
    .sort((a, b) => b.count - a.count);

  const featured = categories.slice(0, 4);

  return (
    <div className="py-10">
      <div className="mx-auto max-w-7xl px-4">
        <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-red-50 to-white p-8 ring-1 ring-red-100">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(900px_420px_at_20%_25%,rgba(239,68,68,0.10),transparent_60%)]" />
          <div className="relative">
            <p className="text-xs tracking-[0.35em] text-red-600">CATEGORIES</p>
            <div className="mt-2 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <h1 className="text-3xl md:text-5xl font-semibold tracking-tight">Browse by category</h1>
                <p className="mt-2 max-w-2xl text-neutral-600">Live categories are computed from synced products.</p>
              </div>

              <div className="flex flex-wrap gap-2">
                <Link href="/mart/shop" className="inline-flex items-center gap-2 rounded-full bg-black px-4 py-2 text-sm text-white hover:bg-black/90">
                  View all products <ArrowRight className="h-4 w-4" />
                </Link>
                <Link href="/mart/deals" className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm ring-1 ring-neutral-200 hover:bg-neutral-50">
                  Deals <Tag className="h-4 w-4 text-red-600" />
                </Link>
              </div>
            </div>

            <div className="mt-6 flex items-center gap-3">
              <form action="/mart/categories" className="relative w-full max-w-xl">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                <input defaultValue={searchParams.q ?? ""} name="q" placeholder="Search categories…" className="w-full rounded-2xl bg-white px-9 py-3 text-sm outline-none ring-1 ring-neutral-200/70 focus:ring-2 focus:ring-red-500/20" />
              </form>

              <Link href="/mart" className="hidden sm:inline-flex rounded-2xl bg-white px-4 py-3 text-sm ring-1 ring-neutral-200/70 hover:bg-neutral-50">Back to Mart</Link>
            </div>
          </div>
        </div>

        <div className="mt-10">
          <div className="mb-4 flex items-end justify-between gap-3">
            <h2 className="text-xl font-semibold">Featured categories</h2>
            <p className="text-xs text-neutral-500">{categories.length} categories</p>
          </div>

          <div className="grid gap-4 md:grid-cols-4">
            {featured.map((c) => {
              const Icon = ICONS[c.slug] || LayoutGrid;
              return (
                <Link key={c.slug} href={`/mart/shop?category=${encodeURIComponent(c.slug)}`} className="group relative overflow-hidden rounded-[28px] bg-white p-5 ring-1 ring-neutral-200/70 transition hover:-translate-y-1 hover:shadow-sm">
                  <div className="relative flex items-start justify-between gap-3">
                    <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-neutral-100 group-hover:bg-red-50 transition"><Icon className="h-5 w-5 text-neutral-900 group-hover:text-red-600 transition" /></div>
                    <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs text-neutral-700">{c.count} items</span>
                  </div>
                  <p className="relative mt-4 text-sm font-semibold">{c.name}</p>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
