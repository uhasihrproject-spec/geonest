import type { DealRecord, ProductRecord } from "@/lib/sync/types";

type DbResult<T> = { data: T | null; error: string | null; configured: boolean };

function cfg() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return { url: url.replace(/\/$/, ""), key };
}

export function isDbConfigured() {
  return Boolean(cfg());
}

async function dbFetch(path: string, init: RequestInit = {}) {
  const c = cfg();
  if (!c) return { res: null, error: "Supabase DB not configured", configured: false };

  try {
    const res = await fetch(`${c.url}/rest/v1/${path}`, {
      ...init,
      headers: {
        apikey: c.key,
        Authorization: `Bearer ${c.key}`,
        "Content-Type": "application/json",
        Prefer: "return=representation",
        ...(init.headers || {}),
      },
      cache: "no-store",
    });

    if (!res.ok) {
      const t = await res.text();
      return { res: null, error: `Supabase error ${res.status}: ${t.slice(0, 200)}`, configured: true };
    }

    return { res, error: null, configured: true };
  } catch (e) {
    return { res: null, error: e instanceof Error ? e.message : "Supabase request failed", configured: true };
  }
}

export async function fetchDbProducts(): Promise<DbResult<Array<ProductRecord & Record<string, unknown>>>> {
  const r = await dbFetch("products?select=id,name,sku,price,is_active,updated_at,source_system,external_ref");
  if (!r.res) return { data: null, error: r.error, configured: r.configured };
  return { data: (await r.res.json()) as Array<ProductRecord & Record<string, unknown>>, error: null, configured: true };
}

export async function fetchDbProductById(id: string): Promise<DbResult<(ProductRecord & Record<string, unknown>) | null>> {
  const r = await dbFetch(`products?id=eq.${encodeURIComponent(id)}&select=id,name,sku,price,is_active,updated_at,source_system,external_ref&limit=1`);
  if (!r.res) return { data: null, error: r.error, configured: r.configured };
  const list = (await r.res.json()) as Array<ProductRecord & Record<string, unknown>>;
  return { data: list[0] ?? null, error: null, configured: true };
}

export async function fetchDbDeals(): Promise<DbResult<DealRecord[]>> {
  const r = await dbFetch("deals?select=id,product_id,title,discount_type,discount_value,starts_at,ends_at,is_active,updated_at");
  if (!r.res) return { data: null, error: r.error, configured: r.configured };
  return { data: (await r.res.json()) as DealRecord[], error: null, configured: true };
}

export async function fetchDbDealById(id: string): Promise<DbResult<DealRecord | null>> {
  const r = await dbFetch(`deals?id=eq.${encodeURIComponent(id)}&select=id,product_id,title,discount_type,discount_value,starts_at,ends_at,is_active,updated_at&limit=1`);
  if (!r.res) return { data: null, error: r.error, configured: r.configured };
  const list = (await r.res.json()) as DealRecord[];
  return { data: list[0] ?? null, error: null, configured: true };
}

export async function upsertDbProduct(product: Partial<ProductRecord> & { id: string }) {
  await dbFetch("products?id=eq." + encodeURIComponent(product.id), {
    method: "PATCH",
    body: JSON.stringify(product),
  });
}

export async function insertDbProduct(product: Partial<ProductRecord> & { id: string }) {
  await dbFetch("products", {
    method: "POST",
    headers: { Prefer: "resolution=merge-duplicates,return=representation" },
    body: JSON.stringify(product),
  });
}

export async function upsertDbDeal(deal: Partial<DealRecord> & { id: string }) {
  await dbFetch("deals?id=eq." + encodeURIComponent(deal.id), {
    method: "PATCH",
    body: JSON.stringify(deal),
  });
}

export async function insertDbDeal(deal: Partial<DealRecord> & { id: string }) {
  await dbFetch("deals", {
    method: "POST",
    headers: { Prefer: "resolution=merge-duplicates,return=representation" },
    body: JSON.stringify(deal),
  });
}
