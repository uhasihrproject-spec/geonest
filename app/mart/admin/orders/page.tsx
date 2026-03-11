"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ClipboardList,
  Package,
  PlusCircle,
  RefreshCw,
  LogOut,
  CheckCircle2,
  XCircle,
  Clock,
} from "lucide-react";
import {
  getOrders,
  updateOrder,
  autoDeleteCompletedOrders,
  type OrderRecord,
  type OrderStatus,
} from "@/lib/mart/ordersLocal";

const AUTH_KEY = "geonest_admin_auth";
const ORDER_STORE_KEY = "geonest_mart_orders_v1";

const STATUSES: OrderStatus[] = [
  "preparing",
  "processing",
  "on_route",
  "delivered",
];

function badgeTone(s: string) {
  if (s === "paid") return "bg-emerald-600 text-white";
  if (s === "manual_review") return "bg-amber-500 text-white";
  return "bg-neutral-100 text-neutral-700";
}

function statusTone(s: OrderStatus) {
  if (s === "delivered") return "bg-neutral-900 text-white";
  if (s === "on_route") return "bg-neutral-100 text-neutral-800 ring-1 ring-neutral-200";
  return "bg-white text-neutral-700 ring-1 ring-neutral-200";
}

export default function AdminOrdersPage() {
  const router = useRouter();
  const [authed, setAuthed] = useState(false);

  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [toast, setToast] = useState<string | null>(null);

  const [q, setQ] = useState("");
  const [onlyManual, setOnlyManual] = useState(false);

  function showToast(msg: string) {
    setToast(msg);
    window.clearTimeout((showToast as any)._t);
    (showToast as any)._t = window.setTimeout(() => setToast(null), 2000);
  }

  function refresh() {
    // keepDays = 0 means remove completed history immediately
    autoDeleteCompletedOrders({ keepDays: 0 });
    setOrders(getOrders({ keepDays: 0 }));
  }

  /* ---------- AUTH GUARD + LIVE REFRESH ---------- */
  useEffect(() => {
    const ok = sessionStorage.getItem(AUTH_KEY) === "true";
    setAuthed(ok);

    if (!ok) {
      // ONE login handler
      router.replace("/mart/admin");
      return;
    }

    refresh();

    const onFocus = () => refresh();
    window.addEventListener("focus", onFocus);

    const onStorage = (e: StorageEvent) => {
      if (e.key === ORDER_STORE_KEY) refresh();
    };
    window.addEventListener("storage", onStorage);

    return () => {
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("storage", onStorage);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();

    return orders
      .filter((o) => {
        if (onlyManual && o.paymentStatus !== "manual_review") return false;

        if (!query) return true;
        const hay = `${o.orderRef ?? ""} ${o.orderStatus ?? ""} ${o.paymentStatus ?? ""}`.toLowerCase();
        return hay.includes(query);
      })
      // newest first
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [orders, q, onlyManual]);

  const counts = useMemo(() => {
    const total = orders.length;
    const manual = orders.filter((o) => o.paymentStatus === "manual_review").length;
    const paid = orders.filter((o) => o.paymentStatus === "paid").length;
    const pending = orders.filter((o) => o.paymentStatus === "pending").length;
    return { total, manual, paid, pending };
  }, [orders]);

  function setStatus(ref: string, status: OrderStatus) {
    updateOrder(ref, { orderStatus: status });
    refresh();
    showToast(`Status updated → ${status.replace("_", " ")}`);
  }

  function approveManualPayment(ref: string) {
    updateOrder(ref, {
      paymentStatus: "paid",
      actions: { deliveryApproved: true, paymentApproved: true },
    });
    refresh();
    showToast("Manual payment approved ✅");
  }

  function rejectManualPayment(ref: string) {
    updateOrder(ref, {
      paymentStatus: "pending",
      hubtel: { lastEvent: { rejected: true, at: new Date().toISOString() } },
      actions: { deliveryApproved: false, paymentApproved: false },
    });
    refresh();
    showToast("Manual payment rejected ❌");
  }

  function logout() {
    sessionStorage.removeItem(AUTH_KEY);
    router.replace("/mart/admin");
  }

  if (!authed) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="w-full max-w-sm rounded-[28px] bg-white p-6 ring-1 ring-neutral-200/70">
          <p className="text-sm font-medium">Checking access…</p>
          <p className="mt-1 text-sm text-neutral-600">
            Redirecting if needed…
          </p>
          <div className="mt-5 h-2 w-full overflow-hidden rounded-full bg-neutral-100">
            <div className="h-full w-1/2 animate-pulse rounded-full bg-red-600/30" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-10">
      <div className="mx-auto max-w-6xl px-4">
        {/* Toast */}
        {toast && (
          <div className="mb-4 rounded-xl bg-neutral-900 px-4 py-2 text-xs text-white">
            {toast}
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-neutral-500">
              Geonest Mart
            </p>
            <h1 className="mt-2 text-2xl font-semibold">Admin · Orders</h1>
            <p className="mt-1 text-sm text-neutral-600">
              Completed orders (Paid + Delivered) are auto-deleted.
            </p>
          </div>

          {/* Mini admin nav */}
          <div className="flex flex-wrap gap-2">
            <Link
              href="/mart/admin/orders"
              className="inline-flex items-center gap-2 rounded-full bg-neutral-900 px-4 py-2 text-sm text-white hover:bg-neutral-800"
            >
              <ClipboardList className="h-4 w-4" />
              Orders
            </Link>
            <Link
              href="/mart/admin/products"
              className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm ring-1 ring-neutral-200/70 hover:bg-neutral-50"
            >
              <Package className="h-4 w-4" />
              Products
            </Link>
            <Link
              href="/mart/admin/new"
              className="inline-flex items-center gap-2 rounded-full bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700"
            >
              <PlusCircle className="h-4 w-4" />
              Add New
            </Link>

            <button
              onClick={refresh}
              className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm ring-1 ring-neutral-200/70 hover:bg-neutral-50"
              title="Refresh"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh ({counts.total})
            </button>

            <button
              onClick={logout}
              className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm ring-1 ring-neutral-200/70 hover:bg-neutral-50"
              title="Logout"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        </div>

        {/* Stats row */}
        <div className="mt-6 grid gap-3 sm:grid-cols-4">
          <div className="rounded-[28px] bg-white p-4 ring-1 ring-neutral-200/70">
            <p className="text-xs text-neutral-500">Active</p>
            <p className="mt-1 text-xl font-semibold">{counts.total}</p>
          </div>
          <div className="rounded-[28px] bg-white p-4 ring-1 ring-neutral-200/70">
            <p className="text-xs text-neutral-500">Manual review</p>
            <p className="mt-1 text-xl font-semibold">{counts.manual}</p>
          </div>
          <div className="rounded-[28px] bg-white p-4 ring-1 ring-neutral-200/70">
            <p className="text-xs text-neutral-500">Paid</p>
            <p className="mt-1 text-xl font-semibold">{counts.paid}</p>
          </div>
          <div className="rounded-[28px] bg-white p-4 ring-1 ring-neutral-200/70">
            <p className="text-xs text-neutral-500">Pending</p>
            <p className="mt-1 text-xl font-semibold">{counts.pending}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="mt-5 grid gap-3 rounded-[28px] bg-white p-4 ring-1 ring-neutral-200/70 sm:grid-cols-[1fr_auto] sm:items-center">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by ref / payment / status…"
            className="h-11 w-full rounded-2xl bg-neutral-50 px-3 text-sm ring-1 ring-neutral-200 focus:outline-none focus:ring-2 focus:ring-red-500/30"
          />

          <button
            onClick={() => setOnlyManual((v) => !v)}
            className={`h-11 rounded-2xl px-4 text-sm ring-1 transition ${
              onlyManual
                ? "bg-neutral-900 text-white ring-neutral-900"
                : "bg-white ring-neutral-200 hover:bg-neutral-50"
            }`}
          >
            {onlyManual ? "Showing manual review" : "Show manual review only"}
          </button>
        </div>

        {/* Orders */}
        {filtered.length === 0 ? (
          <div className="mt-6 rounded-[28px] bg-white p-8 ring-1 ring-neutral-200/70">
            <p className="text-sm font-medium">No active orders.</p>
            <p className="mt-1 text-sm text-neutral-600">
              When customers place orders, they’ll appear here.
            </p>
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            {filtered.map((o) => {
              const created = new Date(o.createdAt);
              const pay = o.paymentStatus;
              const stat = o.orderStatus;

              return (
                <div
                  key={o.orderRef}
                  className="rounded-[28px] bg-white p-5 ring-1 ring-neutral-200/70"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-semibold">{o.orderRef}</p>

                        <span
                          className={`rounded-full px-3 py-1 text-xs ${badgeTone(
                            pay
                          )}`}
                        >
                          Payment: {String(pay).replace("_", " ")}
                        </span>

                        <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs text-neutral-700">
                          Status: {String(stat).replace("_", " ")}
                        </span>
                      </div>

                      <p className="mt-2 text-xs text-neutral-500">
                        {created.toLocaleString()}
                      </p>

                      <div className="mt-3 flex flex-wrap gap-2 text-xs">
                        {pay === "paid" ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-emerald-700 ring-1 ring-emerald-200">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Paid
                          </span>
                        ) : pay === "manual_review" ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-amber-700 ring-1 ring-amber-200">
                            <Clock className="h-3.5 w-3.5" />
                            Needs approval
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-neutral-50 px-3 py-1 text-neutral-700 ring-1 ring-neutral-200">
                            <Clock className="h-3.5 w-3.5" />
                            Pending
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Manual review actions */}
                    {pay === "manual_review" && (
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => approveManualPayment(o.orderRef)}
                          className="inline-flex items-center gap-2 rounded-2xl bg-neutral-900 px-4 py-3 text-sm text-white hover:bg-neutral-800 transition"
                        >
                          <CheckCircle2 className="h-4 w-4" />
                          Approve payment
                        </button>
                        <button
                          onClick={() => rejectManualPayment(o.orderRef)}
                          className="inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm ring-1 ring-neutral-200 hover:bg-neutral-50 transition"
                        >
                          <XCircle className="h-4 w-4" />
                          Reject
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Status buttons */}
                  <div className="mt-5 flex flex-wrap gap-2">
                    {STATUSES.map((s) => (
                      <button
                        key={s}
                        onClick={() => setStatus(o.orderRef, s)}
                        className={`rounded-full px-4 py-2 text-xs transition ${
                          o.orderStatus === s
                            ? "bg-neutral-900 text-white"
                            : statusTone(s)
                        }`}
                        title={
                          s === "delivered"
                            ? "Delivered (if also paid, it will auto-delete)"
                            : undefined
                        }
                      >
                        {s.replace("_", " ")}
                      </button>
                    ))}
                  </div>

                  <div className="mt-3 text-xs text-neutral-500">
                    Auto-delete rule:{" "}
                    <span className="font-medium">Paid + Delivered</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <p className="mt-8 text-xs text-neutral-500">
          Backend-ready: swap <span className="font-mono">ordersLocal</span> with
          DB updates later.
        </p>
      </div>
    </div>
  );
}
