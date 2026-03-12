export type SyncSource = "website" | "core_admin";
export type SyncEntityType = "product" | "deal";
export type SyncAction = "created" | "updated" | "deactivated";

export type ProductRecord = {
  id: string;
  name: string;
  sku: string;
  price: number;
  is_active: boolean;
  updated_at: string;
  source_system: SyncSource;
  external_ref?: string | null;
};

export type DealRecord = {
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

export type SyncEventStatus = "pending" | "processing" | "done" | "failed";

export type SyncEventRecord = {
  event_id: string;
  entity_type: SyncEntityType;
  entity_id: string;
  action: SyncAction;
  source: SyncSource;
  payload: unknown;
  status: SyncEventStatus;
  retries: number;
  last_error?: string | null;
  next_retry_at?: string | null;
  created_at: string;
  updated_at: string;
};

export type PriceHistoryRecord = {
  id: string;
  product_id: string;
  old_price: number;
  new_price: number;
  source: SyncSource;
  changed_at: string;
};

export type SyncStore = {
  products: ProductRecord[];
  deals: DealRecord[];
  sync_events: SyncEventRecord[];
  price_history: PriceHistoryRecord[];
};
