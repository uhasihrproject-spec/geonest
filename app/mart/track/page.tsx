"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Search,
  BadgeCheck,
  Truck,
  Clock,
  XCircle,
  Package,
  Circle,
  MapPin,
  Phone,
  Receipt,
  X,
  ShieldCheck,
  CreditCard,
  Banknote,
  Info,
} from "lucide-react";
import {
  findOrder,
  getOrders,
  updateOrder,
  type OrderRecord,
  type OrderStatus,
  type PaymentStatus,
} from "@/lib/mart/ordersLocal";

/* ---------------- helpers ---------------- */

function money(n: number) {
  return `GHS ${n.toFixed(2)}`;
}

function formatDate(d: Date) {
  return d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
}

function estimateDelivery(createdAtISO: string) {
  const created = new Date(createdAtISO);
  const hour = created.getHours();
  const minDays = hour < 14 ? 1 : 2;
  const maxDays = hour < 14 ? 2 : 3;

  const min = new Date(created);
  min.setDate(min.getDate() + minDays);

  const max = new Date(created);
  max.setDate(max.getDate() + maxDays);

  return { min, max };
}

function maskPhone(phone: string) {
  const p = phone.replace(/\s+/g, "");
  if (p.length <= 4) return "****";
  const first2 = p.slice(0, 2);
  const last2 = p.slice(-2);
  return `${first2}${"*".repeat(Math.max(4, p.length - 4))}${last2}`;
}

function normalizeRef(ref: string) {
  return ref.trim().toUpperCase();
}
function normalizePhone(phone: string) {
  return phone.replace(/\s+/g, "");
}

function smartOrderStatusFallback(createdAtISO: string): OrderStatus {
  const created = new Date(createdAtISO).getTime();
  const now = Date.now();
  const hours = (now - created) / (1000 * 60 * 60);

  if (hours < 1) return "preparing";
  if (hours < 8) return "processing";
  if (hours < 48) return "on_route";
  return "delivered";
}

const ORDER_STEPS: { key: Exclude<OrderStatus, "cancelled">; label: string; icon: React.ReactNode }[] = [
  { key: "preparing", label: "Preparing", icon: <Package className="h-4 w-4" /> },
  { key: "processing", label: "Processing", icon: <Clock className="h-4 w-4" /> },
  { key: "on_route", label: "On route", icon: <Truck className="h-4 w-4" /> },
  { key: "delivered", label: "Delivered", icon: <BadgeCheck className="h-4 w-4" /> },
];

function stepIndex(s: OrderStatus) {
  if (s === "cancelled") return -1;
  return ORDER_STEPS.findIndex((x) => x.key === s);
}

function paymentLabel(p: PaymentStatus, method: OrderRecord["paymentMethod"]) {
  if (p === "paid") return "Paid";
  if (p === "pending") return "Pending payment";
  if (p === "cod") return "Cash on delivery";
  if (p === "manual_review") return "Manual verification";
  return method === "cash" ? "Cash on delivery" : "Pending payment";
}

function PaymentIcon({ status, method }: { status: PaymentStatus; method: OrderRecord["paymentMethod"] }) {
  if (status === "paid") return <ShieldCheck className="h-4 w-4 text-green-600" />;
  if (status === "manual_review") return <Info className="h-4 w-4 text-amber-600" />;
  if (status === "pending") return <Clock className="h-4 w-4 text-amber-600" />;
  if (status === "cod" || method === "cash") return <Banknote className="h-4 w-4 text-neutral-700" />;
  return <CreditCard className="h-4 w-4 text-neutral-700" />;
}

function Modal({
  open,
  title,
  children,
  onClose,
}: {
  open: boolean;
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[200]">
      <div className="absolute inset-0 bg-black/35 backdrop-blur-sm" onClick={onClose} />
      <div className="absolute left-1/2 top-1/2 w-[92vw] max-w-lg -translate-x-1/2 -translate-y-1/2">
        <div className="rounded-[28px] bg-white p-6 ring-1 ring-neutral-200/70">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs tracking-[0.35em] text-neutral-500">CONFIRM</p>
              <p className="mt-2 text-lg font-semibold">{title}</p>
            </div>
            <button
              onClick={onClose}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-neutral-100 hover:bg-neutral-200 transition"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-5">{children}</div>
        </div>
      </div>
    </div>
  );
}

/* ---------------- page ---------------- */

export default function TrackOrderPage() {
  // Manual search inputs
  const [orderRef, setOrderRef] = useState("");
  const [phone, setPhone] = useState("");

  // Result state
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<OrderRecord | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Recent orders
  const [recent, setRecent] = useState<OrderRecord[]>([]);

  // Confirm modal (for selecting from recent)
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pickedOrder, setPickedOrder] = useState<OrderRecord | null>(null);
  const [confirmPhone, setConfirmPhone] = useState("");

  // New user guide
  const [guideOpen, setGuideOpen] = useState(false);

  useEffect(() => {
    const orders = getOrders();
    const sorted = [...orders].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    setRecent(sorted.slice(0, 12));
    if (sorted?.[0]?.customer?.phone) setPhone(sorted[0].customer.phone);
  }, []);

  const canSearch = useMemo(() => {
    return orderRef.trim().length >= 6 && phone.trim().length >= 8;
  }, [orderRef, phone]);

  async function loadOrder(refRaw: string, phoneRaw: string) {
    setError(null);
    setResult(null);
    setLoading(true);

    const ref = normalizeRef(refRaw);
    const ph = normalizePhone(phoneRaw);

    // local lookup
    const o = findOrder(ref);
    if (o && normalizePhone(o.customer.phone) === ph) {
      // apply smart fallback for order status if needed
      const next = {
        ...o,
        orderStatus: o.orderStatus ?? smartOrderStatusFallback(o.createdAt),
      };
      setResult(next);
      setLoading(false);
      return;
    }

    // (optional) backend lookup later — keep your API call here if you add DB
    setLoading(false);
    setError("Order not found. Check the reference and phone number, then try again.");
  }

  function openConfirm(order: OrderRecord) {
    setPickedOrder(order);
    setConfirmPhone("");
    setConfirmOpen(true);
  }

  function confirmAndOpen() {
    if (!pickedOrder) return;

    const expected = normalizePhone(pickedOrder.customer.phone);
    const typed = normalizePhone(confirmPhone);

    if (typed !== expected) {
      setError("Phone number doesn’t match this order. Try again.");
      return;
    }

    setConfirmOpen(false);
    setOrderRef(pickedOrder.orderRef);
    setPhone(pickedOrder.customer.phone);
    loadOrder(pickedOrder.orderRef, pickedOrder.customer.phone);
  }

  // derived details
  const os: OrderStatus | null = result
    ? (result.orderStatus ?? smartOrderStatusFallback(result.createdAt))
    : null;

  const oi = os ? stepIndex(os) : -1;
  const eta = result ? estimateDelivery(result.createdAt) : null;

  // actions
  function approveDelivery() {
    if (!result) return;
    const updated = updateOrder(result.orderRef, {
      actions: { ...result.actions, deliveryApproved: true },
      orderStatus: "delivered",
    });
    if (updated) setResult(updated);
  }

  function approvePayment() {
    if (!result) return;
    const updated = updateOrder(result.orderRef, {
      paymentStatus: "paid",
      actions: { ...result.actions, paymentApproved: true },
    });
    if (updated) setResult(updated);
  }

  function refreshFromStorage() {
    if (!result) return;
    const latest = findOrder(result.orderRef);
    if (latest) setResult(latest);
  }

  const showApprovePayment =
    !!result &&
    (result.paymentMethod === "cash" || result.paymentStatus === "cod") &&
    result.paymentStatus !== "paid";

  const showApproveDelivery = !!result && result.actions?.deliveryApproved !== true;

  return (
    <div className="py-10">
      <div className="flex flex-col gap-2">
        <p className="text-xs tracking-[0.35em] text-neutral-500">TRACK ORDER</p>
        <h1 className="text-2xl md:text-4xl font-semibold tracking-tight">Track your order</h1>
        <p className="text-neutral-600 max-w-2xl">
          No account needed. Use <span className="font-medium">Recent orders</span> or type your{" "}
          <span className="font-medium">Order Reference + Phone</span>.
        </p>
      </div>

      {/* Top actions */}
      <div className="mt-6 flex flex-wrap gap-3">
        <button
          onClick={() => setGuideOpen(true)}
          className="inline-flex items-center gap-2 rounded-full bg-neutral-100 px-5 py-3 text-sm hover:bg-neutral-200 transition"
        >
          <Info className="h-4 w-4" />
          How it works
        </button>
        <Link
          href="/mart/shop"
          className="inline-flex items-center gap-2 rounded-full bg-neutral-100 px-5 py-3 text-sm hover:bg-neutral-200 transition"
        >
          Continue shopping <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {/* Recent Orders */}
      <div className="mt-6 rounded-[28px] bg-white p-6 ring-1 ring-neutral-200/70">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs tracking-[0.35em] text-neutral-500">RECENT</p>
            <p className="mt-2 text-lg font-semibold">Your recent orders</p>
            <p className="mt-1 text-sm text-neutral-600">
              Tap any reference — we’ll ask you to confirm your phone number.
            </p>
          </div>
        </div>

        {recent.length === 0 ? (
          <div className="mt-5 rounded-2xl bg-neutral-50/60 p-6">
            <p className="text-sm font-semibold">No recent orders on this device</p>
            <p className="mt-2 text-sm text-neutral-600">
              After checkout, your order reference will show here.
            </p>
          </div>
        ) : (
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {recent.map((o) => (
              <button
                key={o.orderRef}
                onClick={() => openConfirm(o)}
                className="text-left rounded-[22px] bg-neutral-50/60 p-4 ring-1 ring-neutral-200/70 hover:bg-neutral-50 transition active:scale-[0.99]"
              >
                <p className="text-xs tracking-[0.25em] text-neutral-500">ORDER</p>
                <p className="mt-2 text-sm font-semibold">{normalizeRef(o.orderRef)}</p>
                <p className="mt-1 text-xs text-neutral-600">
                  Confirm phone: <span className="font-medium">{maskPhone(o.customer.phone)}</span>
                </p>
                <p className="mt-2 text-xs text-neutral-500">{new Date(o.createdAt).toLocaleDateString()}</p>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Manual Search */}
      <div className="mt-6 rounded-[28px] bg-white p-6 ring-1 ring-neutral-200/70">
        <div className="grid gap-3 md:grid-cols-3">
          <div className="md:col-span-1">
            <label className="text-xs text-neutral-500">Order reference</label>
            <input
              value={orderRef}
              onChange={(e) => setOrderRef(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && canSearch && loadOrder(orderRef, phone)}
              className="mt-1 h-11 w-full rounded-2xl bg-neutral-100/70 px-4 text-sm outline-none focus:ring-2 focus:ring-red-500/20"
              placeholder="e.g. ORD-20260201-483921"
            />
          </div>

          <div className="md:col-span-1">
            <label className="text-xs text-neutral-500">Phone number</label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && canSearch && loadOrder(orderRef, phone)}
              className="mt-1 h-11 w-full rounded-2xl bg-neutral-100/70 px-4 text-sm outline-none focus:ring-2 focus:ring-red-500/20"
              placeholder="e.g. 024xxxxxxx"
            />
          </div>

          <div className="md:col-span-1 flex items-end gap-2">
            <button
              onClick={() => loadOrder(orderRef, phone)}
              disabled={!canSearch || loading}
              className="h-11 w-full rounded-2xl bg-black px-5 text-sm text-white hover:bg-black/90 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Searching..." : "Track"}
            </button>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-3 text-xs text-neutral-500">
          <span className="inline-flex items-center gap-2 rounded-full bg-neutral-100 px-4 py-2">
            <Search className="h-4 w-4" /> No login needed
          </span>

          <Link
            href="/mart/checkout"
            className="inline-flex items-center gap-2 rounded-full bg-neutral-100 px-4 py-2 hover:bg-neutral-200 transition"
          >
            New order / checkout <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mt-6 rounded-[28px] bg-neutral-50/60 p-6">
          <p className="text-sm font-semibold text-neutral-900">{error}</p>
          <p className="mt-2 text-sm text-neutral-600">
            Tip: use the “Recent orders” list if this order was placed on this device.
          </p>
        </div>
      )}

      {/* Result */}
      {result && (
        <div className="mt-8 grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-start">
          {/* Left: details */}
          <div className="rounded-[28px] bg-white p-6 ring-1 ring-neutral-200/70">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold flex items-center gap-2">
                  <Receipt className="h-4 w-4 text-red-600" />
                  Order {normalizeRef(result.orderRef)}
                </p>
                <p className="mt-1 text-sm text-neutral-600">
                  Placed: {new Date(result.createdAt).toLocaleString()}
                </p>
              </div>

              <div className="flex flex-col items-end gap-2">
                <div className="inline-flex items-center gap-2 rounded-full bg-neutral-100 px-4 py-2 text-sm">
                  <BadgeCheck className="h-4 w-4 text-red-600" />
                  <span className="font-medium">
                    Status: {os === "cancelled" ? "Cancelled" : ORDER_STEPS[Math.max(0, oi)]?.label || "Preparing"}
                  </span>
                </div>

                {eta && os !== "cancelled" && (
                  <p className="text-xs text-neutral-500">
                    Estimated delivery:{" "}
                    <span className="font-medium text-neutral-700">
                      {formatDate(eta.min)} – {formatDate(eta.max)}
                    </span>
                  </p>
                )}
              </div>
            </div>

            {/* Payment status block */}
 {/* PAYMENT STATUS */}
<div className="mt-6 rounded-2xl bg-neutral-50/60 p-4">
  <p className="text-xs text-neutral-500">Payment</p>

  <p className="mt-1 text-sm font-semibold">
    {result.paymentStatus === "paid" && "Paid"}
    {result.paymentStatus === "pending" && "Pending payment"}
    {result.paymentStatus === "cod" && "Cash on delivery"}
    {result.paymentStatus === "manual_review" && "Under manual verification"}
  </p>

  {/* Explanation */}
  {result.paymentStatus === "pending" && (
    <p className="mt-2 text-xs text-neutral-600">
      Payment not received yet. You can pay via Hubtel or submit a manual update.
    </p>
  )}

  {result.paymentStatus === "cod" && (
    <p className="mt-2 text-xs text-neutral-600">
      Pay the rider on delivery, then approve payment here.
    </p>
  )}

  {result.paymentStatus === "manual_review" && (
    <p className="mt-2 text-xs text-amber-700">
      You indicated that you’ve paid. Admin is verifying your payment.
    </p>
  )}

  {result.paymentStatus === "paid" && (
    <p className="mt-2 text-xs text-green-700">
      Payment confirmed. Thank you.
    </p>
  )}

  {/* ACTIONS */}
  <div className="mt-4 flex flex-wrap gap-2">
    {result.paymentStatus !== "paid" &&
      result.paymentMethod !== "cash" && (
        <a
          href={`/mart/pay/hubtel?ref=${result.orderRef}&method=${result.paymentMethod}`}
          className="rounded-full bg-black px-4 py-2 text-xs text-white"
        >
          Pay now (Hubtel)
        </a>
      )}

    {result.paymentStatus !== "paid" && (
      <a
        href={`/mart/pay/manual?ref=${result.orderRef}`}
        className="rounded-full bg-neutral-100 px-4 py-2 text-xs hover:bg-neutral-200"
      >
        Manual payment
      </a>
    )}

    {result.paymentStatus === "cod" && (
      <button
        onClick={() =>
          updateOrder(result.orderRef, { paymentStatus: "paid" })
        }
        className="rounded-full bg-black px-4 py-2 text-xs text-white"
      >
        Approve payment
      </button>
    )}
  </div>
</div>


            {/* Delivery/Contact */}
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <div className="rounded-2xl bg-neutral-50/60 p-4">
                <p className="text-xs text-neutral-500 flex items-center gap-2">
                  <MapPin className="h-4 w-4" /> Delivery
                </p>
                <p className="mt-1 text-sm font-semibold">{result.delivery.address}</p>
                {result.delivery.note && <p className="mt-1 text-sm text-neutral-600">{result.delivery.note}</p>}
              </div>

              <div className="rounded-2xl bg-neutral-50/60 p-4">
                <p className="text-xs text-neutral-500 flex items-center gap-2">
                  <Phone className="h-4 w-4" /> Contact
                </p>
                <p className="mt-1 text-sm font-semibold">{result.customer.phone}</p>
                <p className="mt-1 text-sm text-neutral-600">
                  Method:{" "}
                  <span className="font-medium">
                    {result.paymentMethod === "momo" ? "Mobile Money" : result.paymentMethod === "card" ? "Card" : "Cash"}
                  </span>
                </p>
              </div>
            </div>

            {/* Order progress timeline */}
            <div className="mt-6 rounded-2xl bg-white ring-1 ring-neutral-200/70 p-4">
              <p className="text-sm font-semibold">Order progress</p>

              {os === "cancelled" ? (
                <div className="mt-4 rounded-2xl bg-neutral-50/60 p-4">
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    <XCircle className="h-4 w-4 text-neutral-600" />
                    Order cancelled
                  </div>
                  <p className="mt-1 text-sm text-neutral-600">
                    If you think this is a mistake, contact support with your reference.
                  </p>
                </div>
              ) : (
                <div className="mt-4 grid gap-3 md:grid-cols-4">
                  {ORDER_STEPS.map((step, i) => {
                    const done = i < oi;
                    const active = i === oi;

                    const tileBg = active
                      ? "bg-red-50 ring-red-200/70"
                      : done
                      ? "bg-neutral-50/60 ring-neutral-200/70"
                      : "bg-white ring-neutral-200/70";

                    const iconBg = active
                      ? "bg-red-600 text-white"
                      : done
                      ? "bg-black text-white"
                      : "bg-neutral-100 text-neutral-700";

                    return (
                      <div key={step.key} className={`rounded-2xl px-4 py-4 ring-1 transition ${tileBg}`}>
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex h-9 w-9 items-center justify-center rounded-2xl ${iconBg}`}>
                            {active ? step.icon : done ? <BadgeCheck className="h-4 w-4" /> : <Circle className="h-4 w-4" />}
                          </span>

                          <div>
                            <p className="text-sm font-semibold">{step.label}</p>
                            <p className="text-xs text-neutral-500">
                              {active ? "In progress" : done ? "Completed" : "Pending"}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              <p className="mt-3 text-xs text-neutral-500">
                Backend-ready: admin updates these statuses when dispatching.
              </p>
            </div>

            {/* Items */}
            <div className="mt-6">
              <p className="text-sm font-semibold">Items</p>
              <div className="mt-3 divide-y divide-neutral-200/70 rounded-2xl bg-white ring-1 ring-neutral-200/70">
                {result.items.map((it) => (
                  <div key={it.productId} className="flex items-center justify-between gap-4 p-4">
                    <div>
                      <p className="text-sm font-semibold">{it.name}</p>
                      <p className="mt-1 text-sm text-neutral-600">
                        {money(it.priceGHS)} × {it.qty}
                      </p>
                    </div>
                    <p className="text-sm font-semibold">{money(it.priceGHS * it.qty)}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Approvals */}
            <div className="mt-6 flex flex-wrap gap-3">
              {showApproveDelivery && (
                <button
                  onClick={approveDelivery}
                  className="inline-flex items-center gap-2 rounded-full bg-black px-6 py-3 text-sm text-white hover:bg-black/90 transition active:scale-[0.99]"
                >
                  Approve delivery <BadgeCheck className="h-4 w-4" />
                </button>
              )}

              {showApprovePayment && (
                <button
                  onClick={approvePayment}
                  className="inline-flex items-center gap-2 rounded-full bg-neutral-100 px-6 py-3 text-sm hover:bg-neutral-200 transition active:scale-[0.99]"
                >
                  Approve payment <ShieldCheck className="h-4 w-4" />
                </button>
              )}

              <Link
                href="/mart/shop"
                className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm ring-1 ring-neutral-200/70 hover:bg-neutral-50 transition"
              >
                Continue shopping <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {/* Actions status notes */}
            <div className="mt-4 rounded-2xl bg-neutral-50/60 p-4 text-sm text-neutral-600">
              <p className="font-semibold text-neutral-900">What these buttons mean</p>
              <ul className="mt-2 space-y-1">
                <li>
                  • <span className="font-medium">Approve delivery</span>: confirm you received your package.
                </li>
                <li>
                  • <span className="font-medium">Approve payment</span>: only for Cash on Delivery — confirm you paid the rider.
                </li>
              </ul>
            </div>
          </div>

          {/* Right: summary */}
          <aside className="rounded-[32px] bg-neutral-50/60 p-7">
            <p className="text-xs tracking-[0.35em] text-neutral-500">SUMMARY</p>

            <div className="mt-5 space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-neutral-600">Subtotal</span>
                <span className="font-semibold">{money(result.amounts.subtotal)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-neutral-600">Delivery</span>
                <span className="font-semibold">{money(result.amounts.deliveryFee)}</span>
              </div>
              <div className="border-t border-neutral-200/70 pt-3 flex items-center justify-between">
                <span className="font-semibold">Total</span>
                <span className="font-semibold">{money(result.amounts.total)}</span>
              </div>
            </div>

            {eta && os !== "cancelled" && (
              <div className="mt-5 rounded-2xl bg-white p-4 ring-1 ring-neutral-200/70">
                <p className="text-xs text-neutral-500">Estimated delivery</p>
                <p className="mt-1 text-sm font-semibold">
                  {formatDate(eta.min)} – {formatDate(eta.max)}
                </p>
                <p className="mt-1 text-xs text-neutral-500">
                  This is an estimate. Later you can refine it by delivery zone.
                </p>
              </div>
            )}

            <div className="mt-6 grid gap-3">
              {result.paymentStatus !== "paid" && result.paymentMethod !== "cash" && (
                <Link
                  href={`/mart/pay/hubtel?ref=${encodeURIComponent(result.orderRef)}&method=${result.paymentMethod}`}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-black px-5 py-3 text-sm text-white hover:bg-black/90 transition"
                >
                  Pay now (Hubtel) <ArrowRight className="h-4 w-4" />
                </Link>
              )}

              {result.paymentStatus !== "paid" && (
                <Link
                  href={`/mart/pay/manual?ref=${encodeURIComponent(result.orderRef)}`}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm ring-1 ring-neutral-200/70 hover:bg-neutral-50 transition"
                >
                  Manual payment <ArrowRight className="h-4 w-4" />
                </Link>
              )}

              <Link
                href="/mart/checkout"
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-neutral-100 px-5 py-3 text-sm hover:bg-neutral-200 transition"
              >
                Place another order <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </aside>
        </div>
      )}

      {/* Confirm modal */}
      <Modal
        open={confirmOpen}
        title={pickedOrder ? `Confirm phone for ${normalizeRef(pickedOrder.orderRef)}` : "Confirm phone"}
        onClose={() => setConfirmOpen(false)}
      >
        {pickedOrder && (
          <>
            <p className="text-sm text-neutral-600">
              Type the phone number used for this order to view details.
            </p>

            <div className="mt-4 rounded-2xl bg-neutral-50/60 p-4">
              <p className="text-xs text-neutral-500">Masked phone</p>
              <p className="mt-1 text-sm font-semibold">{maskPhone(pickedOrder.customer.phone)}</p>
            </div>

            <label className="mt-4 block text-xs text-neutral-500">Enter full phone number</label>
            <input
              value={confirmPhone}
              onChange={(e) => setConfirmPhone(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && confirmAndOpen()}
              className="mt-1 h-11 w-full rounded-2xl bg-neutral-100/70 px-4 text-sm outline-none focus:ring-2 focus:ring-red-500/20"
              placeholder="e.g. 024xxxxxxx"
            />

            <div className="mt-5 flex gap-2">
              <button
                onClick={() => setConfirmOpen(false)}
                className="h-11 w-full rounded-2xl bg-neutral-100 px-4 text-sm hover:bg-neutral-200 transition"
              >
                Cancel
              </button>
              <button
                onClick={confirmAndOpen}
                className="h-11 w-full rounded-2xl bg-black px-4 text-sm text-white hover:bg-black/90 transition"
              >
                Confirm & view
              </button>
            </div>

            <p className="mt-3 text-xs text-neutral-500">
              This protects your order details on shared devices.
            </p>
          </>
        )}
      </Modal>

      {/* Guide modal */}
      <Modal open={guideOpen} title="How it works" onClose={() => setGuideOpen(false)}>
        <div className="space-y-3 text-sm text-neutral-700">
          <p className="font-semibold text-neutral-900">Simple payment + tracking</p>
          <ol className="list-decimal pl-5 space-y-2">
            <li>
              Checkout → choose payment method (MoMo/Card/Cash).
            </li>
            <li>
              If MoMo/Card: scan QR or tap “Pay now (Hubtel)” to complete payment.
            </li>
            <li>
              Track your order here: Preparing → Processing → On route → Delivered.
            </li>
            <li>
              When package arrives, tap <b>Approve delivery</b>.
            </li>
            <li>
              If Cash on Delivery, tap <b>Approve payment</b> after paying the rider.
            </li>
          </ol>

          <div className="rounded-2xl bg-neutral-50/60 p-4">
            <p className="text-xs text-neutral-500">Tip</p>
            <p className="mt-1">
              Your recent order references show at the top. Click one, confirm your phone, and you’re in.
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
}
