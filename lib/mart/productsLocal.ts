import { PRODUCTS } from "@/lib/mart/data";

export type DealType = "flash" | "weekly" | "clearance";

export type Product = (typeof PRODUCTS)[number] & {
  originalPriceGHS?: number;
  dealType?: DealType;
  dealEndsAt?: string; // ISO string

  // optional extras for created products
  description?: string;
  tags?: string[];
  createdAt?: string;

  // image can be /path OR data:image/... base64
  image?: string;
};

const OVERRIDE_KEY = "gm_products_override_v1"; // ✅ keep as-is
const CUSTOM_KEY = "gm_products_custom_v1"; // ✅ new products bucket

function safeParse<T>(v: string | null, fallback: T): T {
  try {
    return v ? (JSON.parse(v) as T) : fallback;
  } catch {
    return fallback;
  }
}

function getOverrides(): Record<string, Partial<Product>> {
  if (typeof window === "undefined") return {};
  return safeParse<Record<string, Partial<Product>>>(localStorage.getItem(OVERRIDE_KEY), {});
}

function setOverrides(next: Record<string, Partial<Product>>) {
  if (typeof window === "undefined") return;
  localStorage.setItem(OVERRIDE_KEY, JSON.stringify(next));
}

function getCustom(): Product[] {
  if (typeof window === "undefined") return [];
  return safeParse<Product[]>(localStorage.getItem(CUSTOM_KEY), []);
}

function setCustom(next: Product[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(CUSTOM_KEY, JSON.stringify(next));
}

export function getProducts(): Product[] {
  // base products
  const base = (PRODUCTS as Product[]) || [];

  // client-side: add custom products + apply overrides
  if (typeof window === "undefined") return base;

  const overrides = getOverrides();
  const custom = getCustom();

  const baseMerged = base.map((p) => ({
    ...p,
    ...(overrides[p.id] || {}),
  }));

  // Also apply overrides to custom products (optional but nice)
  const customMerged = custom.map((p) => ({
    ...p,
    ...(overrides[p.id] || {}),
  }));

  // show custom products first
  return [...customMerged, ...baseMerged];
}

export function updateProduct(id: string, patch: Partial<Product>) {
  if (typeof window === "undefined") return;

  // 1) If it's a custom product, update it directly (so edits persist even without override)
  const custom = getCustom();
  const idx = custom.findIndex((p) => p.id === id);
  if (idx !== -1) {
    custom[idx] = { ...custom[idx], ...patch };
    setCustom(custom);
    return;
  }

  // 2) Otherwise store as override for base products
  const overrides = getOverrides();
  overrides[id] = { ...(overrides[id] || {}), ...patch };
  setOverrides(overrides);
}

export function clearProductOverride(id: string) {
  if (typeof window === "undefined") return;

  const overrides = getOverrides();
  delete overrides[id];
  setOverrides(overrides);
}

/** ✅ Add new product that will appear in shop */
export function addProduct(p: Product) {
  if (typeof window === "undefined") return;

  const base = PRODUCTS as Product[];
  const custom = getCustom();

  if (base.some((x) => x.id === p.id) || custom.some((x) => x.id === p.id)) {
    throw new Error("Product ID already exists");
  }

  setCustom([{ ...p, createdAt: p.createdAt || new Date().toISOString() }, ...custom]);
}

/** ✅ Remove a custom product (optional, useful later) */
export function deleteCustomProduct(id: string) {
  if (typeof window === "undefined") return;
  const custom = getCustom();
  setCustom(custom.filter((p) => p.id !== id));
}

/** ✅ Read custom only (optional) */
export function getCustomProducts(): Product[] {
  if (typeof window === "undefined") return [];
  return getCustom();
}
