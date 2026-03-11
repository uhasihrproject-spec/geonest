"use client";

export type OrderStatus =
  | "preparing"
  | "processing"
  | "on_route"
  | "delivered"
  | "cancelled";

export type PaymentStatus = "pending" | "paid" | "cod" | "manual_review";

export type OrderRecord = {
  orderRef: string;
  customerId: string;
  createdAt: string;

  customer: { fullName: string | null; phone: string };
  delivery: { address: string; note: string | null };

  paymentMethod: "momo" | "card" | "cash";
  orderStatus: OrderStatus;
  paymentStatus: PaymentStatus;

  amounts: { subtotal: number; deliveryFee: number; total: number };
  items: { productId: string; name: string; priceGHS: number; qty: number }[];

  actions: { deliveryApproved: boolean; paymentApproved: boolean };
  hubtel?: { lastEvent?: any };
};

const KEY = "geonest_mart_orders_v1";

/* ---------- CORE STORAGE ---------- */

function read(): OrderRecord[] {
  try {
    const raw = localStorage.getItem(KEY);
    const arr = JSON.parse(raw || "[]");
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

export function saveOrders(list: OrderRecord[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(list));
  } catch {}
}

/* ---------- COMPLETION RULE ---------- */

export function isOrderCompleted(o: OrderRecord) {
  const paid =
    o.paymentStatus === "paid" ||
    o.actions?.paymentApproved === true;

  const delivered = o.orderStatus === "delivered";

  return paid && delivered;
}

/**
 * ✅ Delete completed orders automatically.
 * keepDays=0  -> delete immediately
 * keepDays=7  -> keep completed orders for 7 days then delete
 */
export function autoDeleteCompletedOrders(opts?: { keepDays?: number }) {
  const keepDays = opts?.keepDays ?? 0;
  const keepMs = keepDays * 24 * 60 * 60 * 1000;
  const now = Date.now();

  const list = read();

  const next = list.filter((o) => {
    if (!isOrderCompleted(o)) return true;

    // immediate delete
    if (keepDays <= 0) return false;

    // keep for X days based on createdAt (you can change to deliveredAt if you store it later)
    const t = new Date(o.createdAt).getTime();
    return now - t < keepMs;
  });

  if (next.length !== list.length) saveOrders(next);
}

/* ---------- PUBLIC API ---------- */

export function getOrders(opts?: { keepDays?: number }): OrderRecord[] {
  autoDeleteCompletedOrders({ keepDays: opts?.keepDays ?? 0 });
  return read();
}

export function upsertOrder(order: OrderRecord) {
  const list = read();
  const ref = order.orderRef.toUpperCase();
  const idx = list.findIndex((o) => o.orderRef.toUpperCase() === ref);

  if (idx >= 0) list[idx] = order;
  else list.unshift(order);

  saveOrders(list);
  autoDeleteCompletedOrders({ keepDays: 0 });
}

export function findOrder(ref: string) {
  const r = ref.toUpperCase();
  autoDeleteCompletedOrders({ keepDays: 0 });
  return read().find((o) => o.orderRef.toUpperCase() === r) || null;
}

export function updateOrder(ref: string, patch: Partial<OrderRecord>) {
  const list = read();
  const r = ref.toUpperCase();
  const idx = list.findIndex((o) => o.orderRef.toUpperCase() === r);
  if (idx < 0) return null;

  const updated = { ...list[idx], ...patch } as OrderRecord;
  list[idx] = updated;

  saveOrders(list);
  autoDeleteCompletedOrders({ keepDays: 0 });

  return updated;
}

export function deleteOrder(ref: string) {
  const r = ref.toUpperCase();
  const list = read().filter((o) => o.orderRef.toUpperCase() !== r);
  saveOrders(list);
}
