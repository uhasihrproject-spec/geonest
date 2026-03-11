"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import ProductCard from "./ProductCard";
import { askAssistant } from "@/lib/mart/assistant/controller";
import type { MartProduct } from "@/lib/mart/data";

type ShopContext = {
  page: string;
  filters?: { q?: string; category?: string; sort?: string; min?: number; max?: number };
  visibleProducts?: Array<{
    id: string;
    name: string;
    priceGHS: number;
    category: string;
    tags?: string[];
    specs?: any;
    badge?: string;
    description?: string;
    image?: string;
  }>;
};

const ITEMS_PER_PAGE = 32;
const FADE_MS = 220;

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export default function ProductGrid({
  products,
  context,
}: {
  products: MartProduct[];
  context?: ShopContext;
}) {
  const topRef = useRef<HTMLDivElement | null>(null);

  const totalPages = Math.max(1, Math.ceil(products.length / ITEMS_PER_PAGE));

  const [page, setPage] = useState(1);
  const [renderPage, setRenderPage] = useState(1);
  const [phase, setPhase] = useState<"idle" | "out" | "in">("idle");

  // Clamp page when filters/search changes
  useEffect(() => {
    const next = clamp(page, 1, totalPages);
    if (next !== page) setPage(next);
    if (phase === "idle") setRenderPage(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [products.length, totalPages]);

  // animate out -> swap -> animate in
  useEffect(() => {
    if (phase !== "out") return;
    const t = window.setTimeout(() => {
      setRenderPage(page);
      setPhase("in");
    }, FADE_MS);
    return () => window.clearTimeout(t);
  }, [phase, page]);

  useEffect(() => {
    if (phase !== "in") return;
    const t = window.setTimeout(() => setPhase("idle"), FADE_MS);
    return () => window.clearTimeout(t);
  }, [phase]);

  const paginated = useMemo(() => {
    const start = (renderPage - 1) * ITEMS_PER_PAGE;
    return products.slice(start, start + ITEMS_PER_PAGE);
  }, [products, renderPage]);

  // Always provide visibleProducts for assistant (fallback if not provided)
  const visibleProducts = useMemo(() => {
    if (context?.visibleProducts?.length) return context.visibleProducts;
    // build minimal catalog from current list
    return products.map((p: any) => ({
      id: p.id,
      name: p.name,
      priceGHS: p.priceGHS,
      category: p.category,
      tags: Array.isArray(p.tags) ? p.tags : [],
      specs: p.specs ?? null,
      badge: p.badge,
      description: p.description,
      image: p.image,
    }));
  }, [context?.visibleProducts, products]);

  const goTo = (nextPage: number) => {
    const next = clamp(nextPage, 1, totalPages);
    if (next === page || phase !== "idle") return;

    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });

    setPage(next);
    setPhase("out");
  };

  const startItem = products.length === 0 ? 0 : (renderPage - 1) * ITEMS_PER_PAGE + 1;
  const endItem = Math.min(renderPage * ITEMS_PER_PAGE, products.length);

  const motionClass =
    phase === "out" ? "opacity-0 translate-y-2" : "opacity-100 translate-y-0";

  const pages = useMemo(() => {
    const out: (number | "…")[] = [];
    if (totalPages <= 8) {
      for (let i = 1; i <= totalPages; i++) out.push(i);
      return out;
    }

    out.push(1);

    const left = Math.max(2, page - 1);
    const right = Math.min(totalPages - 1, page + 1);

    if (page > 4) out.push("…");

    for (let i = left; i <= right; i++) out.push(i);

    if (page < totalPages - 3) out.push("…");

    out.push(totalPages);
    return out;
  }, [page, totalPages]);

  return (
    <div ref={topRef} className="w-full">
      {/* Top info */}
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-neutral-600">
          Showing{" "}
          <span className="font-medium text-neutral-900">{startItem}</span>–
          <span className="font-medium text-neutral-900">{endItem}</span> of{" "}
          <span className="font-medium text-neutral-900">{products.length}</span>
        </p>

        {products.length > 0 && (
          <p className="text-sm text-neutral-500">
            Page <span className="font-medium text-neutral-900">{renderPage}</span>{" "}
            of <span className="font-medium text-neutral-900">{totalPages}</span>
          </p>
        )}
      </div>

      {/* Grid (fade + slide) */}
      <div
        className={`transition-all ease-out ${motionClass}`}
        style={{ transitionDuration: `${FADE_MS}ms` }}
      >
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {paginated.map((product, idx) => (
            <ProductCard
              key={product.id}
              product={product}
              delayMs={Math.min(idx * 18, 140)}
              onAskAI={(p) =>
                askAssistant(
                  `Help me decide on "${p.name}". Give me 2-3 close alternatives from this shop and tell me the best pick.`,
                  {
                    ...(context ?? { page: "/mart/shop" }),
                    product: p,
                    visibleProducts,
                  }
                )
              }
            />
          ))}
        </div>
      </div>

      {/* Pagination */}
      {products.length > ITEMS_PER_PAGE && (
        <div className="mt-10 flex flex-wrap items-center justify-center gap-2">
          <button
            disabled={phase !== "idle" || page === 1}
            onClick={() => goTo(page - 1)}
            className="rounded-full bg-white px-4 py-2 text-sm ring-1 ring-neutral-200/70 hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Prev
          </button>

          {pages.map((p, i) =>
            p === "…" ? (
              <span key={`dots-${i}`} className="px-2 text-sm text-neutral-400">
                …
              </span>
            ) : (
              <button
                key={p}
                disabled={phase !== "idle"}
                onClick={() => goTo(p)}
                className={`rounded-full px-4 py-2 text-sm ring-1 transition disabled:cursor-not-allowed disabled:opacity-60 ${
                  page === p
                    ? "bg-black text-white ring-black"
                    : "bg-white ring-neutral-200/70 hover:bg-neutral-50"
                }`}
              >
                {p}
              </button>
            )
          )}

          <button
            disabled={phase !== "idle" || page === totalPages}
            onClick={() => goTo(page + 1)}
            className="rounded-full bg-white px-4 py-2 text-sm ring-1 ring-neutral-200/70 hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
