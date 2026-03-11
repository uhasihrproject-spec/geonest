"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Tag,
  Trash2,
  Search,
  ClipboardList,
  Package,
  PlusCircle,
} from "lucide-react";
import {
  getProducts,
  updateProduct,
  type DealType,
} from "@/lib/mart/productsLocal";

const AUTH_KEY = "geonest_admin_auth";

const DEALS: Array<{
  key: DealType;
  label: string;
  tone: "primary" | "soft";
  hint: string;
}> = [
  { key: "flash", label: "Flash", tone: "primary", hint: "Ends in 6h" },
  { key: "weekly", label: "Weekly", tone: "soft", hint: "7 days" },
  { key: "clearance", label: "Clearance", tone: "soft", hint: "Until removed" },
];

function money(n: number) {
  return `GHS ${Number(n || 0).toLocaleString()}`;
}

function discountPercent(price: number, original?: number) {
  if (!original || original <= price) return null;
  const pct = Math.round(((original - price) / original) * 100);
  return pct > 0 ? pct : null;
}

export default function AdminProductsPage() {
  const [authed, setAuthed] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [toast, setToast] = useState<string | null>(null);

  const [q, setQ] = useState("");
  const [onlyDeals, setOnlyDeals] = useState(false);

  useEffect(() => {
    setAuthed(sessionStorage.getItem(AUTH_KEY) === "true");
    setProducts(getProducts());
  }, []);

  function reload() {
    setProducts(getProducts());
  }

  function showToast(msg: string) {
    setToast(msg);
    window.clearTimeout((showToast as any)._t);
    (showToast as any)._t = window.setTimeout(() => setToast(null), 2000);
  }

  function makeDeal(id: string, type: DealType) {
    const p = products.find((x) => x.id === id);
    if (!p) return;

    // If originalPrice not set, default to +20%
    const original = p.originalPriceGHS ?? Math.round(p.priceGHS * 1.2);

    updateProduct(id, {
      originalPriceGHS: original,
      dealType: type,
      dealEndsAt:
        type === "flash"
          ? new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString()
          : undefined,
    });

    reload();
    showToast("Deal saved ✅");
  }

  function removeDeal(id: string) {
    updateProduct(id, {
      originalPriceGHS: undefined,
      dealType: undefined,
      dealEndsAt: undefined,
    });

    reload();
    showToast("Deal removed ✅");
  }

  // If not authed, kick back to /mart/admin (single login handler)
  useEffect(() => {
    if (!authed) {
      // small delay so it doesn't feel like a flash
      const t = setTimeout(() => {
        window.location.href = "/mart/admin";
      }, 350);
      return () => clearTimeout(t);
    }
  }, [authed]);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return products
      .filter((p) => {
        const isDeal = p.originalPriceGHS && p.originalPriceGHS > p.priceGHS;
        if (onlyDeals && !isDeal) return false;

        if (!query) return true;
        const hay = `${p.name ?? ""} ${p.category ?? ""} ${(p.tags ?? []).join(
          " "
        )}`.toLowerCase();
        return hay.includes(query);
      })
      .sort((a, b) => (a.name ?? "").localeCompare(b.name ?? ""));
  }, [products, q, onlyDeals]);

  if (!authed) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="w-full max-w-sm rounded-[28px] bg-white p-6 ring-1 ring-neutral-200/70">
          <p className="text-sm font-medium">Admin session required</p>
          <p className="mt-1 text-sm text-neutral-600">
            Redirecting to admin login…
          </p>
          <div className="mt-5 h-2 w-full overflow-hidden rounded-full bg-neutral-100">
            <div className="h-full w-1/2 animate-pulse rounded-full bg-red-600/30" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-10">
      <div className="mx-auto max-w-6xl px-4">
        {/* Toast */}
        {toast && (
          <div className="mb-4 rounded-xl bg-neutral-900 px-4 py-2 text-xs text-white">
            {toast}
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-neutral-500">
              Geonest Mart
            </p>
            <h1 className="mt-2 text-2xl font-semibold">Admin · Products</h1>
            <p className="mt-1 text-sm text-neutral-600">
              Set deals quickly — they show up on the Deals page.
            </p>
          </div>

          {/* Mini admin nav */}
          <div className="flex flex-wrap gap-2">
            <Link
              href="/mart/admin/orders"
              className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm ring-1 ring-neutral-200/70 hover:bg-neutral-50"
            >
              <ClipboardList className="h-4 w-4" />
              Orders
            </Link>
            <Link
              href="/mart/admin/products"
              className="inline-flex items-center gap-2 rounded-full bg-neutral-900 px-4 py-2 text-sm text-white hover:bg-neutral-800"
            >
              <Package className="h-4 w-4" />
              Products
            </Link>
            <Link
              href="/mart/admin/new"
              className="inline-flex items-center gap-2 rounded-full bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700"
            >
              <PlusCircle className="h-4 w-4" />
              Add New
            </Link>
          </div>
        </div>

        {/* Controls */}
        <div className="mt-6 grid gap-3 rounded-[28px] bg-white p-4 ring-1 ring-neutral-200/70 sm:grid-cols-[1fr_auto] sm:items-center">
          <div className="flex items-center gap-2 rounded-2xl bg-neutral-50 px-3 ring-1 ring-neutral-200">
            <Search className="h-4 w-4 text-neutral-500" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search products…"
              className="h-11 w-full bg-transparent text-sm outline-none"
            />
          </div>

          <button
            onClick={() => setOnlyDeals((v) => !v)}
            className={`h-11 rounded-2xl px-4 text-sm ring-1 transition ${
              onlyDeals
                ? "bg-neutral-900 text-white ring-neutral-900"
                : "bg-white ring-neutral-200 hover:bg-neutral-50"
            }`}
          >
            {onlyDeals ? "Showing deals" : "Show deals only"}
          </button>
        </div>

        {/* Grid */}
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => {
            const isDeal = p.originalPriceGHS && p.originalPriceGHS > p.priceGHS;
            const pct = discountPercent(p.priceGHS, p.originalPriceGHS);

            return (
              <div
                key={p.id}
                className="group rounded-[28px] bg-white p-5 ring-1 ring-neutral-200/70 hover:ring-neutral-300 transition"
              >
                {/* Top row */}
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{p.name}</p>
                    <p className="mt-1 text-xs text-neutral-500">
                      {p.category ? (
                        <span className="rounded-full bg-neutral-100 px-2 py-1">
                          {p.category}
                        </span>
                      ) : (
                        <span className="text-neutral-400">No category</span>
                      )}
                    </p>
                  </div>

                  {isDeal ? (
                    <span className="shrink-0 rounded-full bg-red-600 px-3 py-1 text-xs text-white">
                      Deal{pct ? ` · -${pct}%` : ""}
                    </span>
                  ) : (
                    <span className="shrink-0 rounded-full bg-neutral-100 px-3 py-1 text-xs text-neutral-600">
                      No deal
                    </span>
                  )}
                </div>

                {/* Pricing */}
                <div className="mt-4 rounded-2xl bg-neutral-50 p-4 ring-1 ring-neutral-200">
                  <p className="text-xs text-neutral-500">Current price</p>
                  <p className="mt-1 text-lg font-semibold">
                    {money(p.priceGHS)}
                  </p>

                  {isDeal ? (
                    <p className="mt-1 text-xs text-red-600">
                      Was {money(p.originalPriceGHS)} · {p.dealType || "deal"}
                      {p.dealType === "flash" && p.dealEndsAt ? " (flash)" : ""}
                    </p>
                  ) : (
                    <p className="mt-1 text-xs text-neutral-500">
                      Tap a deal type below to activate.
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="mt-4 flex flex-wrap gap-2">
                  {DEALS.map((d) => {
                    const active = p.dealType === d.key && isDeal;
                    const cls =
                      d.tone === "primary"
                        ? `rounded-full px-3 py-1.5 text-xs inline-flex items-center gap-2 transition ${
                            active
                              ? "bg-red-700 text-white"
                              : "bg-red-600 text-white hover:bg-red-700"
                          }`
                        : `rounded-full px-3 py-1.5 text-xs transition ring-1 ${
                            active
                              ? "bg-neutral-900 text-white ring-neutral-900"
                              : "bg-white ring-neutral-200 hover:bg-neutral-50"
                          }`;

                    return (
                      <button
                        key={d.key}
                        onClick={() => makeDeal(p.id, d.key)}
                        className={cls}
                        title={d.hint}
                      >
                        {d.key === "flash" ? (
                          <Tag className="h-3.5 w-3.5" />
                        ) : null}
                        {d.label}
                      </button>
                    );
                  })}

                  {isDeal && (
                    <button
                      onClick={() => removeDeal(p.id)}
                      className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-xs ring-1 ring-neutral-200 hover:bg-neutral-50"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Remove
                    </button>
                  )}
                </div>

                {/* Small footer */}
                <div className="mt-4 flex items-center justify-between text-xs text-neutral-500">
                  <span>ID: {p.id}</span>
                  <span className="opacity-0 transition group-hover:opacity-100">
                    Backend-ready
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty state */}
        {filtered.length === 0 && (
          <div className="mt-10 rounded-[28px] bg-white p-10 text-center ring-1 ring-neutral-200/70">
            <p className="text-sm font-medium">No products found</p>
            <p className="mt-1 text-sm text-neutral-600">
              Try a different search or turn off “deals only”.
            </p>
          </div>
        )}

        <p className="mt-8 text-xs text-neutral-500">
          Backend-ready: swap <span className="font-mono">productsLocal</span>{" "}
          with DB calls later.
        </p>
      </div>
    </div>
  );
}
