"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  Bell,
  Clock,
  Flame,
  Sparkles,
  Tag,
  ShoppingCart,
  Heart,
} from "lucide-react";
import { getProducts, syncProductsFromServer } from "@/lib/mart/productsLocal";
import { askAssistant } from "@/lib/mart/assistant/controller";
import { useMartStore } from "@/lib/mart/store";

/* ---------------- TYPES ---------------- */

type DealType = "all" | "flash" | "weekly" | "clearance";

type DealProduct = import("@/lib/mart/productsLocal").Product & {
  originalPriceGHS?: number;
  dealType?: "flash" | "weekly" | "clearance";
  dealEndsAt?: string; // ISO date for countdown (recommended)
};

/* ---------------- ANALYTICS (LOCAL + BACKEND READY) ---------------- */

const ANALYTICS_KEY = "gm_deals_analytics_v1";

function track(event: string, payload: any = {}) {
  const record = { event, payload, ts: Date.now() };

  try {
    const raw = localStorage.getItem(ANALYTICS_KEY);
    const logs = raw ? JSON.parse(raw) : [];
    logs.push(record);
    localStorage.setItem(ANALYTICS_KEY, JSON.stringify(logs));
  } catch {}

  // Backend-ready (optional)
  // fetch("/api/mart/analytics", { method: "POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify(record) }).catch(()=>{});
}

/* ---------------- NOTIFICATIONS PREFS (LOCAL) ---------------- */

const NOTIF_KEY = "gm_deals_notif_v1";

type NotifPrefs = {
  enabled: boolean;
  types: { flash: boolean; weekly: boolean; clearance: boolean };
};

function readNotifPrefs(): NotifPrefs {
  try {
    const raw = localStorage.getItem(NOTIF_KEY);
    if (!raw) {
      return { enabled: false, types: { flash: true, weekly: true, clearance: true } };
    }
    return JSON.parse(raw);
  } catch {
    return { enabled: false, types: { flash: true, weekly: true, clearance: true } };
  }
}

function saveNotifPrefs(p: NotifPrefs) {
  try {
    localStorage.setItem(NOTIF_KEY, JSON.stringify(p));
  } catch {}
}

/* ---------------- HELPERS ---------------- */

function pctOff(original?: number, price?: number) {
  if (!original || !price || original <= price) return null;
  return Math.round(((original - price) / original) * 100);
}

function formatTime(ms: number) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

/* ---------------- COUNTDOWN ---------------- */

function DealCountdown({ endsAt }: { endsAt?: string }) {
  const [left, setLeft] = useState<number | null>(null);

  useEffect(() => {
    if (!endsAt) return;

    const end = new Date(endsAt).getTime();
    const tick = () => setLeft(end - Date.now());
    tick();

    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [endsAt]);

  if (!endsAt || left === null) return null;

  const isOver = left <= 0;

  return (
    <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-red-50 px-3 py-1 text-xs text-red-700 ring-1 ring-red-100">
      <Clock className="h-3.5 w-3.5" />
      {isOver ? "Deal ended" : `Ends in ${formatTime(left)}`}
    </div>
  );
}

/* ---------------- PAGE ---------------- */

export default function DealsPage() {
  const [filter, setFilter] = useState<DealType>("all");
  const [notif, setNotif] = useState<NotifPrefs | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  // ✅ Use real store
  const addToCart = useMartStore((s) => s.addToCart);
  const toggleWishlist = useMartStore((s) => s.toggleWishlist);
  const isWishlisted = useMartStore((s) => s.isWishlisted);

  // Products from local override store
  const [products, setProducts] = useState<DealProduct[]>([]);

  // Initial load + auto refresh (same tab + other tabs)
  useEffect(() => {
    setNotif(readNotifPrefs());
    track("deals_page_view");

    const refresh = () => setProducts(getProducts() as DealProduct[]);
    refresh();

    // other tabs
    const onStorage = (e: StorageEvent) => {
      if (e.key && e.key.includes("gm_products_override_v1")) refresh();
    };
    window.addEventListener("storage", onStorage);

    // same tab (admin page edits) — refresh when page regains focus
    const onFocus = () => refresh();
    window.addEventListener("focus", onFocus);

    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("focus", onFocus);
    };
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2200);
    return () => clearTimeout(t);
  }, [toast]);

  // Deals = products with originalPriceGHS
  const deals = useMemo(() => {
    return products.filter((p) => p.originalPriceGHS && p.originalPriceGHS > p.priceGHS);
  }, [products]);

  const filtered = useMemo(() => {
    if (filter === "all") return deals;
    return deals.filter((d) => d.dealType === filter);
  }, [filter, deals]);

  const featured = useMemo(() => filtered.slice(0, 3), [filtered]);

  function onAskDeal(product: DealProduct) {
    track("deal_ask_ai", { productId: product.id, name: product.name });
    askAssistant(
      `Tell me if this deal is worth it, and compare it with other similar options: ${product.name}`,
      { page: "/mart/deals", product }
    );
  }

  function onAdd(product: DealProduct) {
    try {
      addToCart(product, 1);
      track("deal_add_to_cart", { productId: product.id, name: product.name, ok: true });
      setToast("Added to cart ✅");
    } catch {
      track("deal_add_to_cart", { productId: product.id, name: product.name, ok: false });
      setToast("Could not add to cart");
    }
  }

  function onSave(product: DealProduct) {
    const nextSaved = !isWishlisted(product.id);
    toggleWishlist(product.id);
    track("deal_save_toggle", { productId: product.id, saved: nextSaved });
    setToast(nextSaved ? "Saved ❤️" : "Removed from saved");
  }

  function toggleNotifEnabled() {
    if (!notif) return;
    const next = { ...notif, enabled: !notif.enabled };
    setNotif(next);
    saveNotifPrefs(next);
    track("deals_notif_toggle", { enabled: next.enabled });

    askAssistant(
      next.enabled
        ? "I enabled deal notifications. Explain how I’ll get updates and what to do when I see a deal."
        : "I disabled deal notifications. Explain how I can re-enable it later.",
      { page: "/mart/deals" }
    );
  }

  function toggleNotifType(type: "flash" | "weekly" | "clearance") {
    if (!notif) return;
    const next = { ...notif, types: { ...notif.types, [type]: !notif.types[type] } };
    setNotif(next);
    saveNotifPrefs(next);
    track("deals_notif_type_toggle", { type, value: next.types[type] });
  }

  return (
    <div className="py-10">
      <div className="mx-auto max-w-7xl px-4">
        {/* Toast */}
        {toast && (
          <div className="fixed top-5 left-1/2 z-[90] -translate-x-1/2 rounded-full bg-black px-4 py-2 text-xs text-white shadow-xl">
            {toast}
          </div>
        )}

        {/* HERO */}
        <div className="rounded-[32px] bg-gradient-to-br from-red-50 to-white p-8 ring-1 ring-red-100">
          <p className="text-xs tracking-[0.35em] text-red-600">DEALS</p>

          <div className="mt-2 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-3xl md:text-5xl font-semibold tracking-tight">
                Hot Deals & Discounts
              </h1>
              <p className="mt-2 max-w-2xl text-neutral-600">
                Limited-time offers across top items. Add to cart, save, ask the assistant, or subscribe to alerts.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => {
                  track("deals_ask_ai_global");
                  askAssistant(
                    "Show me the best deals available right now and why they’re good value.",
                    { page: "/mart/deals" }
                  );
                }}
                className="inline-flex items-center gap-2 rounded-full bg-black px-4 py-2 text-sm text-white hover:bg-black/90"
              >
                <Sparkles className="h-4 w-4" />
                Ask assistant
              </button>

              <Link
                href="/mart/shop"
                onClick={() => track("deals_to_shop")}
                className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm ring-1 ring-neutral-200 hover:bg-neutral-50"
              >
                Browse all products
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* Notifications panel */}
          {notif && (
            <div className="mt-6 rounded-2xl bg-white/80 p-4 ring-1 ring-red-100">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Bell className="h-4 w-4 text-red-600" />
                  <p className="text-sm font-semibold">Deal notifications</p>
                  <span className="text-xs text-neutral-500">(local preferences for now)</span>
                </div>

                <button
                  onClick={toggleNotifEnabled}
                  className={`rounded-full px-4 py-2 text-xs transition ${
                    notif.enabled ? "bg-black text-white hover:bg-black/90" : "bg-neutral-100 hover:bg-neutral-200"
                  }`}
                >
                  {notif.enabled ? "Enabled" : "Enable"}
                </button>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {(["flash", "weekly", "clearance"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => toggleNotifType(t)}
                    className={`rounded-full px-4 py-2 text-xs transition ${
                      notif.types[t] ? "bg-red-600 text-white hover:bg-red-700" : "bg-neutral-100 hover:bg-neutral-200"
                    }`}
                    disabled={!notif.enabled}
                    title={!notif.enabled ? "Enable notifications first" : ""}
                  >
                    {t === "flash" ? "Flash deals" : t === "weekly" ? "This week" : "Clearance"}
                  </button>
                ))}
              </div>

              <p className="mt-3 text-xs text-neutral-600">
                Tip: When backend is ready, connect this to real push/email/SMS alerts.
              </p>
            </div>
          )}
        </div>

        {/* FILTERS */}
        <div className="mt-8 flex flex-wrap gap-2">
          <FilterButton label="All deals" active={filter === "all"} onClick={() => setFilter("all")} />
          <FilterButton label="Flash deals" icon={<Clock className="h-4 w-4" />} active={filter === "flash"} onClick={() => setFilter("flash")} />
          <FilterButton label="This week" icon={<Flame className="h-4 w-4" />} active={filter === "weekly"} onClick={() => setFilter("weekly")} />
          <FilterButton label="Clearance" icon={<Tag className="h-4 w-4" />} active={filter === "clearance"} onClick={() => setFilter("clearance")} />
        </div>

        {/* FEATURED */}
        {featured.length > 0 && (
          <div className="mt-10">
            <h2 className="mb-4 text-xl font-semibold">Featured deals</h2>
            <div className="grid gap-6 md:grid-cols-3">
              {featured.map((p) => (
                <DealCard
                  key={p.id}
                  product={p}
                  featured
                  isSaved={isWishlisted(p.id)}
                  onAsk={onAskDeal}
                  onAdd={onAdd}
                  onSave={onSave}
                />
              ))}
            </div>
          </div>
        )}

        {/* ALL DEALS */}
        <div className="mt-12">
          <div className="mb-4 flex items-end justify-between gap-3">
            <h2 className="text-xl font-semibold">All deals</h2>
            <p className="text-xs text-neutral-500">{filtered.length} deals</p>
          </div>

          {filtered.length === 0 ? (
            <p className="text-sm text-neutral-500">No deals found for this category.</p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {filtered.map((p) => (
                <DealCard
                  key={p.id}
                  product={p}
                  isSaved={isWishlisted(p.id)}
                  onAsk={onAskDeal}
                  onAdd={onAdd}
                  onSave={onSave}
                />
              ))}
            </div>
          )}
        </div>

        <p className="mt-10 text-xs text-neutral-500">
          Deal prices are subject to change while stock lasts. Delivery time is estimated.
        </p>
      </div>
    </div>
  );
}

/* ---------------- UI PIECES ---------------- */

function FilterButton({
  label,
  icon,
  active,
  onClick,
}: {
  label: string;
  icon?: React.ReactNode;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={() => {
        track("deals_filter_click", { label });
        onClick();
      }}
      className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm transition ${
        active ? "bg-black text-white" : "bg-neutral-100 hover:bg-neutral-200"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

function DealCard({
  product,
  featured,
  isSaved,
  onAsk,
  onAdd,
  onSave,
}: {
  product: DealProduct;
  featured?: boolean;
  isSaved: boolean;
  onAsk: (p: DealProduct) => void;
  onAdd: (p: DealProduct) => void;
  onSave: (p: DealProduct) => void;
}) {
  const off = pctOff(product.originalPriceGHS, product.priceGHS);

  return (
    <div
      className={`group rounded-2xl bg-white p-4 ring-1 ring-neutral-200 transition hover:shadow-sm ${
        featured ? "ring-red-200" : ""
      }`}
      onMouseEnter={() => track("deal_card_hover", { id: product.id })}
    >
      {/* IMAGE */}
      <div className="relative mb-3 aspect-square overflow-hidden rounded-xl bg-neutral-100">
        {!product.image ? (
          <div className="absolute inset-0 bg-[radial-gradient(450px_180px_at_30%_30%,rgba(239,68,68,0.12),transparent_65%)]" />
        ) : (
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover transition duration-300 group-hover:scale-[1.02]"
            sizes="(max-width: 768px) 50vw, 25vw"
            priority={featured}
          />
        )}

        {/* SAVE */}
        <button
          type="button"
          onClick={() => onSave(product)}
          className={`absolute right-3 top-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/90 ring-1 ring-neutral-200/70 transition hover:bg-neutral-50 ${
            isSaved ? "text-red-600" : "text-neutral-900"
          }`}
          aria-label={isSaved ? "Remove from wishlist" : "Save to wishlist"}
        >
          <Heart className="h-4 w-4" fill={isSaved ? "currentColor" : "none"} />
        </button>

        {product.dealType && (
          <span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs ring-1 ring-neutral-200/70">
            {product.dealType === "flash" ? "Flash" : product.dealType === "weekly" ? "Weekly" : "Clearance"}
          </span>
        )}
      </div>

      <p className="font-medium leading-snug">{product.name}</p>

      <div className="mt-1 flex flex-wrap items-center gap-2 text-sm">
        <span className="font-semibold text-red-600">GHS {product.priceGHS}</span>
        <span className="text-neutral-400 line-through">GHS {product.originalPriceGHS}</span>
        {off !== null && (
          <span className="rounded-full bg-red-50 px-2 py-0.5 text-xs text-red-700 ring-1 ring-red-100">
            -{off}%
          </span>
        )}
      </div>

      {product.dealType === "flash" && <DealCountdown endsAt={product.dealEndsAt} />}

      <div className="mt-4 flex gap-2">
        <button
          onClick={() => {
            track("deal_add_click", { id: product.id });
            onAdd(product);
          }}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-black px-3 py-2 text-xs text-white hover:bg-black/90 transition active:scale-[0.99]"
        >
          <ShoppingCart className="h-4 w-4" />
          Add
        </button>

        <button
          onClick={() => onAsk(product)}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-neutral-100 px-3 py-2 text-xs hover:bg-neutral-200 transition active:scale-[0.99]"
        >
          <Sparkles className="h-4 w-4" />
          Ask
        </button>
      </div>

      <button
        onClick={() => {
          track("deal_notify_ai", { id: product.id });
          askAssistant(
            `I want deal notifications for items like "${product.name}". Explain how to get notified and what to do when I see a deal.`,
            { page: "/mart/deals", product }
          );
        }}
        className="mt-2 w-full rounded-xl bg-white px-3 py-2 text-xs ring-1 ring-neutral-200 hover:bg-neutral-50 transition active:scale-[0.99]"
      >
        <span className="inline-flex items-center justify-center gap-2">
          <Bell className="h-4 w-4 text-red-600" />
          Notify me about similar deals
        </span>
      </button>
    </div>
  );
}
