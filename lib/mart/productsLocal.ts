import { PRODUCTS } from "@/lib/mart/data";

export type DealType = "flash" | "weekly" | "clearance";

type RemoteProduct = {
  id: string;
  name: string;
  sku: string;
  price: number;
  is_active: boolean;
  updated_at: string;
  source_system: "website" | "core_admin";
  external_ref?: string | null;
};

type RemoteDeal = {
  id: string;
  product_id: string;
  title: string;
  discount_type: "percent" | "fixed";
  discount_value: number;
  starts_at: string;
  ends_at?: string | null;
  is_active: boolean;
  updated_at: string;
};

export type Product = (typeof PRODUCTS)[number] & {
  originalPriceGHS?: number;
  dealType?: DealType;
  dealEndsAt?: string;
  description?: string;
  tags?: string[];
  createdAt?: string;
  image?: string;
  is_active?: boolean;
  sku?: string;
  updated_at?: string;
};

const CACHE_KEY = "gm_products_cache_v2";
const DEALS_CACHE_KEY = "gm_deals_cache_v1";

function safeParse<T>(v: string | null, fallback: T): T {
  try {
    return v ? (JSON.parse(v) as T) : fallback;
  } catch {
    return fallback;
  }
}

function getCachedProducts(): Product[] {
  if (typeof window === "undefined") return (PRODUCTS as Product[]).map((p) => ({ ...p, is_active: true }));
  return safeParse<Product[]>(localStorage.getItem(CACHE_KEY), (PRODUCTS as Product[]).map((p) => ({ ...p, is_active: true })));
}

function setCachedProducts(items: Product[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(CACHE_KEY, JSON.stringify(items));
  window.dispatchEvent(new StorageEvent("storage", { key: CACHE_KEY }));
}

function mapDealType(title: string): DealType {
  const t = title.toLowerCase();
  if (t.includes("flash")) return "flash";
  if (t.includes("clear")) return "clearance";
  return "weekly";
}

function applyDeals(products: Product[], deals: RemoteDeal[]) {
  const now = Date.now();
  return products.map((p) => {
    const activeDeal = deals.find(
      (d) =>
        d.product_id === p.id &&
        d.is_active &&
        Date.parse(d.starts_at) <= now &&
        (!d.ends_at || Date.parse(d.ends_at) >= now),
    );
    if (!activeDeal) return { ...p, originalPriceGHS: undefined, dealType: undefined, dealEndsAt: undefined };

    const originalPrice = p.priceGHS;
    const discounted =
      activeDeal.discount_type === "percent"
        ? Math.max(0, Math.round(originalPrice * (1 - activeDeal.discount_value / 100)))
        : Math.max(0, Math.round(originalPrice - activeDeal.discount_value));

    return {
      ...p,
      priceGHS: discounted,
      originalPriceGHS: originalPrice,
      dealType: mapDealType(activeDeal.title),
      dealEndsAt: activeDeal.ends_at ?? undefined,
    };
  });
}

export function getProducts(): Product[] {
  return getCachedProducts().filter((p) => p.is_active !== false);
}

export async function syncProductsFromServer() {
  if (typeof window === "undefined") return [] as Product[];
  const res = await fetch("/api/mart/admin/products", { cache: "no-store" });
  if (!res.ok) return getProducts();
  const data = (await res.json()) as { products: RemoteProduct[]; deals: RemoteDeal[] };
  localStorage.setItem(DEALS_CACHE_KEY, JSON.stringify(data.deals));

  const mapped = data.products.map((p) => ({
    id: p.id,
    name: p.name,
    priceGHS: p.price,
    categorySlug: "general",
    sku: p.sku,
    is_active: p.is_active,
    updated_at: p.updated_at,
  })) as Product[];

  const next = applyDeals(mapped, data.deals);
  setCachedProducts(next);
  return next.filter((p) => p.is_active !== false);
}

export function updateProduct(id: string, patch: Partial<Product>) {
  const list = getCachedProducts();
  const i = list.findIndex((p) => p.id === id);
  if (i < 0) return;
  list[i] = { ...list[i], ...patch };
  setCachedProducts(list);

  const payload = {
    id,
    name: list[i].name,
    sku: list[i].sku ?? id,
    price: list[i].priceGHS,
    is_active: list[i].is_active ?? true,
    external_ref: null,
  };

  fetch(`/api/mart/admin/products/${id}`, {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (patch.dealType || patch.originalPriceGHS === undefined) {
    const discountValue = (list[i].originalPriceGHS ?? list[i].priceGHS) - list[i].priceGHS;
    const idDeal = `deal-${id}`;
    fetch(`/api/mart/admin/deals/${idDeal}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        id: idDeal,
        product_id: id,
        title: patch.dealType ?? "weekly",
        discount_type: "fixed",
        discount_value: Math.max(0, discountValue),
        starts_at: new Date().toISOString(),
        ends_at: patch.dealEndsAt ?? null,
        is_active: !!patch.dealType,
      }),
    }).catch(async () => {
      if (patch.dealType) {
        await fetch(`/api/mart/admin/deals`, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            id: idDeal,
            product_id: id,
            title: patch.dealType,
            discount_type: "fixed",
            discount_value: Math.max(0, discountValue),
            starts_at: new Date().toISOString(),
            ends_at: patch.dealEndsAt ?? null,
            is_active: true,
          }),
        });
      }
    });
  }
}

export function clearProductOverride(_id: string) {}

export function addProduct(p: Product) {
  const list = getCachedProducts();
  if (list.some((x) => x.id === p.id)) throw new Error("Product ID already exists");
  const next = [{ ...p, is_active: true }, ...list];
  setCachedProducts(next);
  fetch("/api/mart/admin/products", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      id: p.id,
      name: p.name,
      sku: p.sku ?? p.id,
      price: p.priceGHS,
      is_active: true,
      external_ref: null,
    }),
  });
}

export function deleteCustomProduct(id: string) {
  const list = getCachedProducts().map((p) => (p.id === id ? { ...p, is_active: false } : p));
  setCachedProducts(list);
  fetch(`/api/mart/admin/products/${id}`, { method: "DELETE" });
}

export function getCustomProducts(): Product[] {
  return getCachedProducts();
}
