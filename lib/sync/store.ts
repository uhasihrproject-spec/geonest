import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import type {
  DealRecord,
  PriceHistoryRecord,
  ProductRecord,
  SyncAction,
  SyncEntityType,
  SyncEventRecord,
  SyncSource,
  SyncStore,
} from "@/lib/sync/types";

const STORE_PATH = path.join(process.cwd(), ".data", "sync-store.json");

const emptyStore: SyncStore = { products: [], deals: [], sync_events: [], price_history: [] };

function ensureStore() {
  fs.mkdirSync(path.dirname(STORE_PATH), { recursive: true });
  if (!fs.existsSync(STORE_PATH)) {
    fs.writeFileSync(STORE_PATH, JSON.stringify(emptyStore, null, 2));
  }
}

export function readStore(): SyncStore {
  ensureStore();
  const raw = fs.readFileSync(STORE_PATH, "utf8");
  return JSON.parse(raw) as SyncStore;
}

export function writeStore(store: SyncStore) {
  ensureStore();
  fs.writeFileSync(STORE_PATH, JSON.stringify(store, null, 2));
}

function now() {
  return new Date().toISOString();
}

export function upsertProduct(input: Omit<ProductRecord, "updated_at" | "source_system"> & { updated_at?: string }, source: SyncSource) {
  const store = readStore();
  const i = store.products.findIndex((p) => p.id === input.id);
  const updated_at = input.updated_at ?? now();
  if (i >= 0) {
    const prev = store.products[i];
    if (prev.price !== input.price) {
      const ph: PriceHistoryRecord = {
        id: crypto.randomUUID(),
        product_id: input.id,
        old_price: prev.price,
        new_price: input.price,
        source,
        changed_at: updated_at,
      };
      store.price_history.unshift(ph);
    }
    store.products[i] = { ...prev, ...input, source_system: source, updated_at };
  } else {
    store.products.unshift({ ...input, source_system: source, updated_at });
  }
  writeStore(store);
}

export function upsertDeal(input: Omit<DealRecord, "updated_at"> & { updated_at?: string }) {
  const store = readStore();
  const i = store.deals.findIndex((d) => d.id === input.id);
  const updated_at = input.updated_at ?? now();
  if (i >= 0) {
    store.deals[i] = { ...store.deals[i], ...input, updated_at };
  } else {
    store.deals.unshift({ ...input, updated_at });
  }
  writeStore(store);
}

export function createSyncEvent(params: {
  entity_type: SyncEntityType;
  entity_id: string;
  action: SyncAction;
  source: SyncSource;
  payload: unknown;
  event_id?: string;
}) {
  const store = readStore();
  const event_id = params.event_id ?? crypto.randomUUID();
  if (store.sync_events.some((e) => e.event_id === event_id)) return event_id;
  const created_at = now();
  const evt: SyncEventRecord = {
    event_id,
    entity_type: params.entity_type,
    entity_id: params.entity_id,
    action: params.action,
    source: params.source,
    payload: params.payload,
    status: "pending",
    retries: 0,
    last_error: null,
    next_retry_at: created_at,
    created_at,
    updated_at: created_at,
  };
  store.sync_events.unshift(evt);
  writeStore(store);
  return event_id;
}

export function listDueSyncEvents() {
  const t = Date.now();
  return readStore().sync_events.filter(
    (e) => (e.status === "pending" || e.status === "failed") && (!e.next_retry_at || Date.parse(e.next_retry_at) <= t),
  );
}

export function markSyncEvent(event_id: string, patch: Partial<SyncEventRecord>) {
  const store = readStore();
  const i = store.sync_events.findIndex((e) => e.event_id === event_id);
  if (i < 0) return;
  store.sync_events[i] = { ...store.sync_events[i], ...patch, updated_at: now() };
  writeStore(store);
}

export function hasEvent(event_id: string) {
  return readStore().sync_events.some((e) => e.event_id === event_id);
}
