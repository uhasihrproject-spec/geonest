"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { LayoutGrid, Search, ShoppingCart, Sparkles, X } from "lucide-react";
import { useMartStore } from "@/lib/mart/store";

type SearchResult = {
  id: string;
  name: string;
  priceGHS: number;
  category: string;
  image?: string;
};

function cx(...classes: Array<string | false | undefined | null>) {
  return classes.filter(Boolean).join(" ");
}

export default function MartNavbar({ onOpenSidebar }: { onOpenSidebar: () => void }) {
  const router = useRouter();
  const pathname = usePathname();
  const cartCount = useMartStore((s) => s.cartCount());

  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [focused, setFocused] = useState(false);

  const [items, setItems] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  const inputRef = useRef<HTMLInputElement | null>(null);
  const desktopPanelRef = useRef<HTMLDivElement | null>(null); // DESKTOP ONLY
  const mobilePanelRef = useRef<HTMLDivElement | null>(null); // MOBILE ONLY

  // Keep search box in sync with /mart/shop?q=...
  useEffect(() => {
    if (typeof window === "undefined") return;
    const sp = new URLSearchParams(window.location.search);
    setQ(sp.get("q") ?? "");
  }, [pathname]);

  const showClear = useMemo(() => q.trim().length > 0, [q]);

  function goSearch() {
    const query = q.trim();
    router.push(query ? `/mart/shop?q=${encodeURIComponent(query)}` : "/mart/shop");
    setOpen(false);
    setFocused(false);
  }

  function openSearch() {
    setOpen(true);
    requestAnimationFrame(() => inputRef.current?.focus());
  }

  function closeSearch() {
    setOpen(false);
    setFocused(false);
  }

  // Desktop: click outside closes (NOT on mobile)
  useEffect(() => {
    function onDown(e: MouseEvent) {
      if (!open) return;
      // only do outside-click closing on md+ screens
      if (window.matchMedia("(min-width: 768px)").matches) {
        const t = e.target as Node;
        if (desktopPanelRef.current && !desktopPanelRef.current.contains(t)) {
          closeSearch();
        }
      }
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  // ESC closes + Ctrl/Cmd+K opens
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") closeSearch();
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        openSearch();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Backend suggestions (debounced)
  useEffect(() => {
    if (!open) return;

    const query = q.trim();
    if (!query) {
      setItems([]);
      setLoading(false);
      return;
    }

    const ctrl = new AbortController();
    const t = window.setTimeout(async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/mart/search?q=${encodeURIComponent(query)}&limit=6`, {
          signal: ctrl.signal,
        });
        if (!res.ok) throw new Error("Search failed");
        const data = (await res.json()) as { items: SearchResult[] };
        setItems(Array.isArray(data.items) ? data.items : []);
      } catch {
        // ignore abort/network errors
      } finally {
        setLoading(false);
      }
    }, 160);

    return () => {
      ctrl.abort();
      window.clearTimeout(t);
    };
  }, [q, open]);

  // consistent ring/glow style (same mobile + desktop)
  const fieldShell = cx(
    "relative w-full rounded-2xl bg-white ring-1 transition",
    focused
      ? "ring-red-500/25 shadow-[0_12px_30px_-22px_rgba(220,38,38,0.55)]"
      : "ring-neutral-200/70 hover:ring-neutral-300",
    "focus-within:ring-2 focus-within:ring-red-500/20"
  );

  const pillBtn =
    "inline-flex h-10 items-center justify-center rounded-2xl bg-white px-3 text-sm shadow-sm ring-1 ring-neutral-200/70 hover:bg-neutral-50 transition active:scale-[0.99]";

  const iconBtn =
    "inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-neutral-200/70 hover:bg-neutral-50 transition active:scale-[0.99]";

  return (
    <header className="sticky top-0 z-[70] bg-white/75 backdrop-blur border-b border-neutral-200/70">
      <div className="mx-auto max-w-7xl px-4">
        {/* ===== STRAIGHT NAVBAR (no rounded wrapper) ===== */}
        <div className="h-14 md:h-16 flex items-center gap-3">
          {/* Left */}
          <button onClick={onOpenSidebar} className={pillBtn} aria-label="Open categories">
            <LayoutGrid className="h-4 w-4" />
            <span className="ml-2 hidden md:inline">Categories</span>
          </button>

          <Link href="/mart" className="flex items-center gap-2 min-w-0">
            <Image
              src="/brands/geonest-mart.svg"
              alt="Geonest Mart"
              width={28}
              height={28}
              priority
            />
            <span className="font-semibold tracking-tight truncate">
              Geonest <span className="text-red-600">Mart</span>
            </span>
          </Link>

          {/* Search icon beside logo */}
          <button
            type="button"
            onClick={() => (open ? closeSearch() : openSearch())}
            className={cx(iconBtn, open && "ring-red-500/20")}
            aria-label="Search"
            title="Search (Ctrl/Cmd+K)"
          >
            <Search className="h-4 w-4 text-neutral-700" />
          </button>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Right */}
          <Link
            href="/"
            className="hidden lg:inline-flex h-10 items-center rounded-2xl px-3 text-sm text-neutral-700 hover:bg-neutral-100 transition"
          >
            Back Home
          </Link>

          <Link href="/mart/cart" className={cx(pillBtn, "relative")} aria-label="Cart">
            <ShoppingCart className="h-4 w-4" />
            <span className="ml-2 hidden sm:inline">Cart</span>
            {cartCount > 0 && (
              <span className="ml-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1.5 text-[11px] font-semibold text-white">
                {cartCount}
              </span>
            )}
          </Link>

          <Link
            href="/mart/chat"
            className="relative inline-flex h-10 items-center justify-center rounded-2xl bg-black px-4 text-sm text-white hover:bg-black/90 transition active:scale-[0.99]"
            aria-label="Assistant"
          >
            <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-red-500 animate-pulse" />
            <Sparkles className="h-4 w-4" />
            <span className="ml-2 hidden sm:inline">Assistant</span>
          </Link>
        </div>

        {/* ===== MOBILE: slide-down search panel (tap input WON'T close) ===== */}
        <div
          className={cx(
            "md:hidden overflow-hidden transition-[max-height,opacity,transform] duration-300 ease-out",
            open ? "max-h-[420px] opacity-100 translate-y-0 pb-3" : "max-h-0 opacity-0 -translate-y-1"
          )}
        >
          <div ref={mobilePanelRef} className="rounded-3xl bg-white shadow-md ring-1 ring-neutral-200/70">
            <div className="p-3">
              <div className={fieldShell}>
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                <input
                  ref={inputRef}
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && goSearch()}
                  onFocus={() => setFocused(true)}
                  onBlur={() => setFocused(false)}
                  className="w-full h-11 rounded-2xl bg-transparent px-9 pr-24 text-sm outline-none placeholder:text-neutral-400"
                  placeholder="Search products…"
                />

                {showClear && (
                  <button
                    type="button"
                    onClick={() => setQ("")}
                    className="absolute right-12 top-1/2 -translate-y-1/2 inline-flex h-9 w-9 items-center justify-center rounded-full hover:bg-neutral-100 transition active:scale-[0.98]"
                    aria-label="Clear search"
                  >
                    <X className="h-4 w-4 text-neutral-500" />
                  </button>
                )}

                <button
                  type="button"
                  onClick={goSearch}
                  className="absolute right-2 top-1/2 -translate-y-1/2 inline-flex h-9 items-center justify-center rounded-xl bg-neutral-900 px-3 text-xs font-medium text-white hover:bg-neutral-800 transition active:scale-[0.99]"
                >
                  Search
                </button>
              </div>

              <div className="mt-2 flex items-center justify-between text-[11px] text-neutral-400">
                <span>Try “phones under 3000”</span>
                <button onClick={closeSearch} className="hover:text-neutral-700 transition">
                  Close
                </button>
              </div>
            </div>

            <div className="border-t border-neutral-200/70">
              {loading && <div className="px-4 py-3 text-sm text-neutral-500">Searching…</div>}

              {!loading && q.trim().length > 0 && items.length === 0 && (
                <div className="px-4 py-3 text-sm text-neutral-500">No results.</div>
              )}

              {!loading && items.length > 0 && (
                <div className="p-2">
                  {items.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => {
                        router.push(`/mart/product/${p.id}`); // change if your route differs
                        closeSearch();
                      }}
                      className="w-full flex items-center gap-3 rounded-2xl px-3 py-2 hover:bg-neutral-50 transition text-left"
                    >
                      <div className="h-10 w-10 rounded-xl bg-neutral-100 overflow-hidden ring-1 ring-neutral-200/60">
                        {p.image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={p.image} alt="" className="h-full w-full object-cover" />
                        ) : null}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-medium text-neutral-900">{p.name}</div>
                        <div className="text-xs text-neutral-500">
                          {p.category} • GHS {p.priceGHS.toLocaleString()}
                        </div>
                      </div>
                    </button>
                  ))}
                  <div className="px-3 pb-2 pt-1">
                    <button
                      onClick={goSearch}
                      className="text-xs text-neutral-600 hover:text-neutral-900 transition"
                    >
                      View all results →
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ===== DESKTOP: overlay search panel (click outside closes) ===== */}
      <div
        className={cx(
          "hidden md:block fixed inset-0 z-[80]",
          open ? "pointer-events-auto" : "pointer-events-none"
        )}
        aria-hidden={!open}
      >
        <div className={cx("absolute inset-0 bg-black/10 transition-opacity", open ? "opacity-100" : "opacity-0")} />

        <div className="absolute left-0 right-0 top-[72px]">
          <div className="mx-auto max-w-3xl px-4">
            <div
              ref={desktopPanelRef}
              className={cx(
                "rounded-3xl bg-white shadow-lg ring-1 ring-neutral-200/70 overflow-hidden transition",
                open ? "translate-y-0 opacity-100" : "-translate-y-2 opacity-0"
              )}
            >
              <div className="p-3">
                <div className={fieldShell}>
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                  <input
                    ref={inputRef}
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && goSearch()}
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                    className="w-full h-11 rounded-2xl bg-transparent px-9 pr-24 text-sm outline-none placeholder:text-neutral-400"
                    placeholder="Search phones, groceries, beauty, electronics…"
                  />

                  {showClear && (
                    <button
                      type="button"
                      onClick={() => setQ("")}
                      className="absolute right-12 top-1/2 -translate-y-1/2 inline-flex h-9 w-9 items-center justify-center rounded-full hover:bg-neutral-100 transition active:scale-[0.98]"
                      aria-label="Clear search"
                    >
                      <X className="h-4 w-4 text-neutral-500" />
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={goSearch}
                    className="absolute right-2 top-1/2 -translate-y-1/2 inline-flex h-9 items-center justify-center rounded-xl bg-neutral-900 px-3 text-xs font-medium text-white hover:bg-neutral-800 transition active:scale-[0.99]"
                  >
                    Search
                  </button>
                </div>

                <div className="mt-2 flex items-center justify-between text-[11px] text-neutral-400">
                  <span>Enter to search • Esc to close</span>
                  <button onClick={closeSearch} className="hover:text-neutral-700 transition">
                    Close
                  </button>
                </div>
              </div>

              <div className="border-t border-neutral-200/70">
                {loading && <div className="px-4 py-3 text-sm text-neutral-500">Searching…</div>}

                {!loading && q.trim().length > 0 && items.length === 0 && (
                  <div className="px-4 py-3 text-sm text-neutral-500">No results.</div>
                )}

                {!loading && items.length > 0 && (
                  <div className="p-2">
                    {items.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => {
                          router.push(`/mart/product/${p.id}`); // change if your route differs
                          closeSearch();
                        }}
                        className="w-full flex items-center gap-3 rounded-2xl px-3 py-2 hover:bg-neutral-50 transition text-left"
                      >
                        <div className="h-10 w-10 rounded-xl bg-neutral-100 overflow-hidden ring-1 ring-neutral-200/60">
                          {p.image ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={p.image} alt="" className="h-full w-full object-cover" />
                          ) : null}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-sm font-medium text-neutral-900">{p.name}</div>
                          <div className="text-xs text-neutral-500">
                            {p.category} • GHS {p.priceGHS.toLocaleString()}
                          </div>
                        </div>
                      </button>
                    ))}
                    <div className="px-3 pb-2 pt-1">
                      <button
                        onClick={goSearch}
                        className="text-xs text-neutral-600 hover:text-neutral-900 transition"
                      >
                        View all results →
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
