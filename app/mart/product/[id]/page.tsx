"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getProducts, type Product } from "@/lib/mart/productsLocal";
import ProductClient from "./ProductClient";

function normCategory(p: any) {
  return String(p.category ?? p.categorySlug ?? "").trim().toLowerCase();
}

export default function ProductPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params?.id;

  const [all, setAll] = useState<Product[] | null>(null);

  useEffect(() => {
    // load from localStorage-aware source
    setAll(getProducts());

    // if another tab updates products, refresh
    const onStorage = () => setAll(getProducts());
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const product = useMemo(() => all?.find((p) => p.id === id), [all, id]);

  const more = useMemo(() => {
    if (!all || !product) return [];
    const cat = normCategory(product);
    return all
      .filter((p) => p.id !== product.id && normCategory(p) === cat)
      .slice(0, 8);
  }, [all, product]);

  if (!id) {
    return (
      <div className="py-16 text-center">
        <p className="text-neutral-600">Invalid product link.</p>
        <Link href="/mart/shop" className="mt-4 inline-block underline">
          Back to shop
        </Link>
      </div>
    );
  }

  if (all === null) {
    return (
      <div className="py-16">
        <div className="mx-auto max-w-6xl px-4">
          <div className="h-10 w-40 rounded-xl bg-neutral-100 animate-pulse" />
          <div className="mt-6 grid gap-8 lg:grid-cols-2">
            <div className="h-[420px] rounded-[28px] bg-neutral-100 animate-pulse" />
            <div className="h-[320px] rounded-[28px] bg-neutral-100 animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="py-16">
        <div className="mx-auto max-w-6xl px-4">
          <p className="text-xs tracking-[0.35em] text-neutral-500">NOT FOUND</p>
          <h1 className="mt-2 text-2xl font-semibold">Product not found</h1>
          <p className="mt-2 text-neutral-600">
            This product may have been removed or its ID changed.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/mart/shop"
              className="rounded-full bg-black px-7 py-3 text-sm text-white hover:bg-black/90"
            >
              Back to shop
            </Link>
            <button
              onClick={() => router.back()}
              className="rounded-full bg-neutral-100 px-7 py-3 text-sm hover:bg-neutral-200"
            >
              Go back
            </button>
          </div>
        </div>
      </div>
    );
  }

  const cat = normCategory(product);

  return (
    <div className="py-10">
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/mart/shop"
            className="inline-flex items-center rounded-full bg-neutral-100 px-4 py-2 text-sm hover:bg-neutral-200 transition"
          >
            ← Back to shop
          </Link>

          {cat ? (
            <Link
              href={`/mart?category=${encodeURIComponent(cat)}`}
              className="text-sm text-neutral-700 hover:underline"
            >
              More in this category →
            </Link>
          ) : null}
        </div>

        <ProductClient product={product} more={more} />
      </div>
    </div>
  );
}
