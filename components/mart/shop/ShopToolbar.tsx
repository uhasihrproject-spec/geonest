"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Search, SlidersHorizontal } from "lucide-react";
import * as React from "react";

type Category = { slug: string; name: string };

export default function ShopToolbar({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const sp = useSearchParams();

  const [q, setQ] = React.useState(sp.get("q") ?? "");
  const [category, setCategory] = React.useState(sp.get("category") ?? "");
  const [sort, setSort] = React.useState(sp.get("sort") ?? "featured");
  const [min, setMin] = React.useState(sp.get("min") ?? "");
  const [max, setMax] = React.useState(sp.get("max") ?? "");

  React.useEffect(() => {
    setQ(sp.get("q") ?? "");
    setCategory(sp.get("category") ?? "");
    setSort(sp.get("sort") ?? "featured");
    setMin(sp.get("min") ?? "");
    setMax(sp.get("max") ?? "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sp]);

  function apply(next?: Partial<{ q: string; category: string; sort: string; min: string; max: string }>) {
    const params = new URLSearchParams(sp.toString());

    const merged = {
      q,
      category,
      sort,
      min,
      max,
      ...next,
    };

    // set or delete cleanly
    (Object.keys(merged) as (keyof typeof merged)[]).forEach((k) => {
      const v = merged[k];
      if (!v) params.delete(k);
      else params.set(k, v);
    });

    router.push(`/mart/shop?${params.toString()}`);
  }

  function clearAll() {
    router.push("/mart/shop");
  }

  return (
    <div className="rounded-[28px] bg-white ring-1 ring-neutral-200/70 p-4 md:p-5">
      {/* filters */}
      <div className="mt-4 grid gap-3 md:grid-cols-4">
        <div className="rounded-2xl bg-white ring-1 ring-neutral-200/70 px-3 py-2">
          <p className="text-xs text-neutral-500 mb-1 flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4" />
            Category
          </p>
          <select
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              apply({ category: e.target.value });
            }}
            className="w-full bg-transparent text-sm outline-none"
          >
            <option value="">All</option>
            {categories.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="rounded-2xl bg-white ring-1 ring-neutral-200/70 px-3 py-2">
          <p className="text-xs text-neutral-500 mb-1">Sort</p>
          <select
            value={sort}
            onChange={(e) => {
              setSort(e.target.value);
              apply({ sort: e.target.value });
            }}
            className="w-full bg-transparent text-sm outline-none"
          >
            <option value="featured">Featured</option>
            <option value="price-asc">Price: low → high</option>
            <option value="price-desc">Price: high → low</option>
            <option value="name">Name</option>
          </select>
        </div>

        <div className="rounded-2xl bg-white ring-1 ring-neutral-200/70 px-3 py-2">
          <p className="text-xs text-neutral-500 mb-1">Min price (GHS)</p>
          <input
            value={min}
            onChange={(e) => setMin(e.target.value)}
            onBlur={() => apply({ min })}
            className="w-full bg-transparent text-sm outline-none"
            placeholder="e.g. 100"
            inputMode="numeric"
          />
        </div>

        <div className="rounded-2xl bg-white ring-1 ring-neutral-200/70 px-3 py-2">
          <p className="text-xs text-neutral-500 mb-1">Max price (GHS)</p>
          <input
            value={max}
            onChange={(e) => setMax(e.target.value)}
            onBlur={() => apply({ max })}
            className="w-full bg-transparent text-sm outline-none"
            placeholder="e.g. 3000"
            inputMode="numeric"
          />
        </div>
      </div>
    </div>
  );
}
