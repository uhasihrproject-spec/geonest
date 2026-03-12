import Link from "next/link";
import { CATEGORIES, PRODUCTS } from "@/lib/mart/data";
import {
  ArrowRight,
  LayoutGrid,
  Flame,
  Tag,
  Sparkles,
  Search,
} from "lucide-react";

type SearchParams = { q?: string };

function normalize(s: string) {
  return s.trim().toLowerCase();
}

function catCount(slug: string) {
  return PRODUCTS.filter((p) => p.category === slug).length;
}

const ICONS: Record<string, any> = {
  electronics: Sparkles,
  phones: Flame,
  groceries: Tag,
};

export default function CategoriesPage({ searchParams }: { searchParams: SearchParams }) {
  const q = searchParams.q ? normalize(searchParams.q) : "";

  const categories = CATEGORIES.map((c) => ({
    ...c,
    count: catCount(c.slug),
  }))
    .filter((c) => (q ? normalize(c.name).includes(q) || normalize(c.slug).includes(q) : true))
    .sort((a, b) => b.count - a.count);

  const featured = categories.slice(0, 4);

  return (
    <div className="py-10">
      <div className="mx-auto max-w-7xl px-4">
        {/* HERO */}
        <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-red-50 to-white p-8 ring-1 ring-red-100">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(900px_420px_at_20%_25%,rgba(239,68,68,0.10),transparent_60%)]" />
          <div className="relative">
            <p className="text-xs tracking-[0.35em] text-red-600">CATEGORIES</p>
            <div className="mt-2 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <h1 className="text-3xl md:text-5xl font-semibold tracking-tight">
                  Browse by category
                </h1>
                <p className="mt-2 max-w-2xl text-neutral-600">
                  Pick a category to see products instantly. This page is backend-ready — swap the
                  in-memory counts for DB queries later.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <Link
                  href="/mart/shop"
                  className="inline-flex items-center gap-2 rounded-full bg-black px-4 py-2 text-sm text-white hover:bg-black/90"
                >
                  View all products <ArrowRight className="h-4 w-4" />
                </Link>

                <Link
                  href="/mart/deals"
                  className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm ring-1 ring-neutral-200 hover:bg-neutral-50"
                >
                  Deals <Tag className="h-4 w-4 text-red-600" />
                </Link>
              </div>
            </div>

            {/* Search */}
            <div className="mt-6 flex items-center gap-3">
              <form action="/mart/categories" className="relative w-full max-w-xl">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                <input
                  defaultValue={searchParams.q ?? ""}
                  name="q"
                  placeholder="Search categories…"
                  className="w-full rounded-2xl bg-white px-9 py-3 text-sm outline-none ring-1 ring-neutral-200/70 focus:ring-2 focus:ring-red-500/20"
                />
              </form>

              <Link
                href="/mart"
                className="hidden sm:inline-flex rounded-2xl bg-white px-4 py-3 text-sm ring-1 ring-neutral-200/70 hover:bg-neutral-50"
              >
                Back to Mart
              </Link>
            </div>
          </div>
        </div>

        {/* FEATURED STRIP */}
        <div className="mt-10">
          <div className="mb-4 flex items-end justify-between gap-3">
            <h2 className="text-xl font-semibold">Featured categories</h2>
            <p className="text-xs text-neutral-500">{categories.length} categories</p>
          </div>

          <div className="grid gap-4 md:grid-cols-4">
            {featured.map((c) => {
              const Icon = ICONS[c.slug] || LayoutGrid;
              return (
                <Link
                  key={c.slug}
                  href={`/mart/shop?category=${encodeURIComponent(c.slug)}`}
                  className="group relative overflow-hidden rounded-[28px] bg-white p-5 ring-1 ring-neutral-200/70 transition hover:-translate-y-1 hover:shadow-sm"
                >
                  <div className="pointer-events-none absolute inset-0 opacity-0 transition group-hover:opacity-100 bg-[radial-gradient(450px_180px_at_30%_30%,rgba(239,68,68,0.10),transparent_65%)]" />
                  <div className="relative flex items-start justify-between gap-3">
                    <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-neutral-100 group-hover:bg-red-50 transition">
                      <Icon className="h-5 w-5 text-neutral-900 group-hover:text-red-600 transition" />
                    </div>
                    <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs text-neutral-700">
                      {c.count} items
                    </span>
                  </div>

                  <p className="relative mt-4 text-sm font-semibold">{c.name}</p>
                  <p className="relative mt-1 text-xs text-neutral-600">
                    Tap to explore products in {c.name.toLowerCase()}.
                  </p>

                  <div className="relative mt-4 inline-flex items-center gap-2 text-xs text-neutral-500 group-hover:text-red-600 transition">
                    Browse <ArrowRight className="h-3.5 w-3.5" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* ALL CATEGORIES GRID */}
        <div className="mt-12">
          <div className="mb-4 flex items-end justify-between gap-3">
            <h2 className="text-xl font-semibold">All categories</h2>
            <Link
              href="/mart/shop"
              className="text-sm text-neutral-600 hover:text-red-600 transition"
            >
              Open Shop →
            </Link>
          </div>

          {categories.length === 0 ? (
            <div className="rounded-2xl bg-neutral-50/60 p-6 text-sm text-neutral-600">
              No categories match your search.
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {categories.map((c) => (
                <Link
                  key={c.slug}
                  href={`/mart/shop?category=${encodeURIComponent(c.slug)}`}
                  className="group rounded-[28px] bg-white p-5 ring-1 ring-neutral-200/70 transition hover:-translate-y-1 hover:shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold">{c.name}</p>
                      <p className="mt-1 text-xs text-neutral-600">
                        {c.count} products available
                      </p>
                    </div>

                    <span className="inline-flex items-center gap-2 rounded-full bg-neutral-100 px-3 py-1 text-xs text-neutral-700 group-hover:bg-red-50 group-hover:text-red-700 transition">
                      Explore <ArrowRight className="h-3.5 w-3.5" />
                    </span>
                  </div>

                  <div className="mt-4 h-20 rounded-2xl bg-neutral-100 relative overflow-hidden">
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition bg-[radial-gradient(450px_180px_at_30%_30%,rgba(239,68,68,0.10),transparent_65%)]" />
                    <div className="absolute inset-0 grid place-items-center text-[11px] text-neutral-400">
                      Add category image later
                    </div>
                  </div>

                  <p className="mt-3 text-[11px] text-neutral-500">
                    Optional image path:{" "}
                    <span className="font-medium">
                      /public/mart/categories/{c.slug}.jpg
                    </span>
                  </p>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* CTA */}
        <div className="mt-12 rounded-[32px] bg-white p-8 ring-1 ring-neutral-200/70">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs tracking-[0.35em] text-neutral-500">NEED HELP?</p>
              <h3 className="mt-2 text-2xl font-semibold tracking-tight">
                Not sure what to buy?
              </h3>
              <p className="mt-2 text-neutral-600">
                Tell the assistant your budget and it will recommend the best picks.
              </p>
            </div>

            <Link
              href="/mart/chat"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-black px-6 py-3 text-sm text-white hover:bg-black/90"
            >
              <Sparkles className="h-4 w-4" />
              Open Assistant
            </Link>
          </div>
        </div>

        {/* Footer note */}
        <p className="mt-10 text-xs text-neutral-500">
          Backend-ready: categories and counts can come from your database later (Prisma/Supabase).
        </p>
      </div>
    </div>
  );
}
