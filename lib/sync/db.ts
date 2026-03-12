import type { DealRecord, ProductRecord } from "@/lib/sync/types";

function cfg() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return { url: url.replace(/\/$/, ""), key };
}

async function dbFetch(path: string, init: RequestInit = {}) {
  const c = cfg();
  if (!c) return null;
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
  if (!res.ok) return null;
  return res;
}

export async function fetchDbProducts() {
  const res = await dbFetch("products?select=id,name,sku,price,is_active,updated_at,source_system,external_ref");
  if (!res) return null;
  return (await res.json()) as Array<ProductRecord & Record<string, unknown>>;
}

export async function fetchDbDeals() {
  const res = await dbFetch("deals?select=id,product_id,title,discount_type,discount_value,starts_at,ends_at,is_active,updated_at");
  if (!res) return null;
  return (await res.json()) as DealRecord[];
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
