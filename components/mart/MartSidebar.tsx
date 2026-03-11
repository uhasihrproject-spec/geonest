"use client";

import Link from "next/link";
import {
  X,
  Smartphone,
  Laptop,
  ShoppingBasket,
  Headphones,
  Shirt,
  Sparkles,
  Home,
  ChevronRight,
} from "lucide-react";
import { CATEGORIES } from "@/lib/mart/data";

const iconBySlug: Record<string, React.ReactNode> = {
  phones: <Smartphone className="h-4 w-4" />,
  laptops: <Laptop className="h-4 w-4" />,
  groceries: <ShoppingBasket className="h-4 w-4" />,
  electronics: <Headphones className="h-4 w-4" />,
  fashion: <Shirt className="h-4 w-4" />,
  beauty: <Sparkles className="h-4 w-4" />,
  home: <Home className="h-4 w-4" />,
};

export default function MartSidebar({ onClose }: { onClose: () => void }) {
  return (
    <div className="h-full rounded-[28px] bg-white p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-semibold">Shop by Category</p>
          <p className="text-xs text-neutral-500">Quick filters • Deals • New drops</p>
        </div>
        <button
          onClick={onClose}
          className="inline-flex h-9 w-9 items-center justify-center rounded-2xl hover:bg-neutral-100"
          aria-label="Close sidebar"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-4 space-y-1">
        {CATEGORIES.map((c) => (
          <Link
            key={c.slug}
            href={`/mart/shop?category=${c.slug}`}
            className="flex items-center justify-between rounded-2xl px-3 py-2 text-sm text-neutral-700 hover:bg-red-50 hover:text-red-700 transition"
            onClick={onClose}
          >
            <span className="flex items-center gap-2">
              <span className="text-neutral-600">{iconBySlug[c.slug]}</span>
              {c.name}
            </span>
            <ChevronRight className="h-4 w-4 text-neutral-300" />
          </Link>
        ))}
      </div>

      <div className="mt-6 rounded-[22px] bg-neutral-50 p-4">
        <p className="text-sm font-semibold">Quick actions</p>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <Link
            href="/mart/deals"
            className="rounded-2xl bg-black px-4 py-2 text-center text-sm text-white hover:bg-black/90"
            onClick={onClose}
          >
            Deals
          </Link>
          <Link
            href="/mart/shop"
            className="rounded-2xl bg-white px-4 py-2 text-center text-sm shadow-sm hover:bg-neutral-50"
            onClick={onClose}
          >
            All
          </Link>
        </div>
        <p className="mt-2 text-xs text-neutral-500">
          Backend-ready: these pages can be wired later.
        </p>
      </div>
    </div>
  );
}
