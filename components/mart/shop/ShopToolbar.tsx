"use client";

import { SlidersHorizontal } from "lucide-react";

type Category = { slug: string; name: string };

type ShopFilters = {
  q: string;
  category: string;
  sort: string;
  min: string;
  max: string;
};

export default function ShopToolbar({
  categories,
  filters,
  onChange,
}: {
  categories: Category[];
  filters: ShopFilters;
  onChange: (patch: Partial<ShopFilters>) => void;
}) {
  return (
    <div className="rounded-[28px] bg-white ring-1 ring-neutral-200/70 p-4 md:p-5">
      <div className="mt-4 grid gap-3 md:grid-cols-4">
        <div className="rounded-2xl bg-white ring-1 ring-neutral-200/70 px-3 py-2">
          <p className="text-xs text-neutral-500 mb-1 flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4" />
            Category
          </p>
          <select
            value={filters.category}
            onChange={(e) => onChange({ category: e.target.value })}
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
            value={filters.sort}
            onChange={(e) => onChange({ sort: e.target.value })}
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
            value={filters.min}
            onChange={(e) => onChange({ min: e.target.value })}
            className="w-full bg-transparent text-sm outline-none"
            placeholder="e.g. 100"
            inputMode="numeric"
          />
        </div>

        <div className="rounded-2xl bg-white ring-1 ring-neutral-200/70 px-3 py-2">
          <p className="text-xs text-neutral-500 mb-1">Max price (GHS)</p>
          <input
            value={filters.max}
            onChange={(e) => onChange({ max: e.target.value })}
            className="w-full bg-transparent text-sm outline-none"
            placeholder="e.g. 3000"
            inputMode="numeric"
          />
        </div>
      </div>
    </div>
  );
}
