"use client";

import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/lib/mart/productsLocal";
import { ShoppingCart, Heart } from "lucide-react";
import { useMartStore } from "@/lib/mart/store";
import * as React from "react";

export default function ProductCard({
  product,
  delayMs = 0,
  onAskAI,
}: {
  product: Product;
  delayMs?: number;
  onAskAI?: (product: Product) => void;
}) {
  const addToCart = useMartStore((s) => s.addToCart);
  const toggleWishlist = useMartStore((s) => s.toggleWishlist);

  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  const isWishlisted = useMartStore((s) => (mounted ? s.isWishlisted(product.id) : false));

  return (
    <div
      className="group rounded-[28px] bg-white p-5 ring-1 ring-neutral-200/70 transition will-change-transform hover:-translate-y-1 hover:shadow-sm"
      style={{ animationDelay: `${delayMs}ms` }}
    >
      {/* Clickable area */}
      <Link href={`/mart/product/${product.id}`} className="block">
        <div className="relative aspect-square overflow-hidden rounded-2xl bg-neutral-100">
          {product.image ? (
            <Image
              src={product.image}
              alt={product.name}
              fill
              className="object-cover transition duration-300 group-hover:scale-[1.03]"
            />
          ) : (
            <div className="absolute inset-0 bg-[radial-gradient(450px_180px_at_30%_30%,rgba(239,68,68,0.12),transparent_65%)]" />
          )}

          {product.badge && (
            <span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs ring-1 ring-neutral-200/70">
              {product.badge}
            </span>
          )}
        </div>

        <p className="mt-4 text-sm font-semibold text-neutral-900 line-clamp-1">
          {product.name}
        </p>
        <p className="mt-1 text-sm text-neutral-600">
          GHS {Number(product.priceGHS).toFixed(2)}
        </p>
      </Link>

      {/* Wishlist (button must not navigate) */}
      <button
        type="button"
        onClick={() => toggleWishlist(product.id)}
        className={`mt-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-neutral-100 ring-1 ring-neutral-200/70 transition hover:bg-neutral-200 ${
          isWishlisted ? "text-red-600" : "text-neutral-900"
        }`}
        aria-label={isWishlisted ? "Remove from wishlist" : "Save to wishlist"}
      >
        <Heart className="h-4 w-4" fill={isWishlisted ? "currentColor" : "none"} />
      </button>

      <button
        type="button"
        onClick={() => addToCart(product as any, 1)}
        className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-black px-4 py-2 text-sm text-white hover:bg-black/90 transition active:scale-[0.99]"
      >
        <ShoppingCart className="h-4 w-4" />
        Add to cart
      </button>

      <button
        type="button"
        onClick={() => onAskAI?.(product)}
        className="mt-3 w-full rounded-2xl bg-neutral-100 px-4 py-2 text-xs hover:bg-neutral-200 transition active:scale-[0.99]"
      >
        Ask AI
      </button>
    </div>
  );
}
