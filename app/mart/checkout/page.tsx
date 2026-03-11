"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, HelpCircle, QrCode } from "lucide-react";
import { useMartStore } from "@/lib/mart/store";
import { upsertOrder, type OrderRecord } from "@/lib/mart/ordersLocal";

function makeCustomerId() {
  const n = Math.floor(100000 + Math.random() * 900000);
  return `GM-${n}`;
}
function makeOrderRef() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const n = Math.floor(100000 + Math.random() * 900000);
  return `ORD-${y}${m}${day}-${n}`;
}
function money(n: number) {
  return `GHS ${n.toFixed(2)}`;
}

function Modal({
  open,
  title,
  onClose,
  children,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[200]">
      <div
        className="absolute inset-0 bg-black/35 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="absolute left-1/2 top-1/2 w-[92vw] max-w-xl -translate-x-1/2 -translate-y-1/2">
        <div className="rounded-[28px] bg-white p-6 ring-1 ring-neutral-200/70">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs tracking-[0.35em] text-neutral-500">GUIDE</p>
              <p className="mt-2 text-lg font-semibold">{title}</p>
            </div>
            <button
              onClick={onClose}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-neutral-100 hover:bg-neutral-200"
            >
              ✕
            </button>
          </div>
          <div className="mt-5">{children}</div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  const cart = useMartStore((s) => s.cart);
  const items = Object.values(cart);
  const subtotal = useMartStore((s) => s.cartSubtotal());
  const clearCart = useMartStore((s) => s.clearCart);

  const deliveryFee = subtotal > 0 ? 25 : 0; // placeholder
  const total = subtotal + deliveryFee;

  const [customerId, setCustomerId] = useState("");
  useEffect(() => {
    const key = "geonest_mart_customer_id";
    const existing = localStorage.getItem(key);
    if (existing) setCustomerId(existing);
    else {
      const id = makeCustomerId();
      localStorage.setItem(key, id);
      setCustomerId(id);
    }
  }, []);

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [note, setNote] = useState("");

  const [paymentMethod, setPaymentMethod] = useState<"momo" | "card" | "cash">(
    "momo"
  );

  const [orderRef, setOrderRef] = useState<string>("");
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [payUrl, setPayUrl] = useState<string>("");

  const [showGuide, setShowGuide] = useState(false);

  const canCreateOrder = useMemo(() => {
    return items.length > 0 && phone.trim().length >= 8 && address.trim().length >= 6;
  }, [items.length, phone, address]);

  async function generateQrFor(url: string) {
    const res = await fetch(`/api/mart/qr?data=${encodeURIComponent(url)}`);
    const data = await res.json();
    if (data?.qr) setQrDataUrl(data.qr);
  }

  async function createOrderAndShowQr() {
    if (!canCreateOrder) return;

    const ref = makeOrderRef();
    setOrderRef(ref);

    const createdAt = new Date().toISOString();

    const order: OrderRecord = {
      orderRef: ref,
      customerId,
      createdAt,
      customer: { fullName: fullName.trim() || null, phone: phone.trim() },
      delivery: { address: address.trim(), note: note.trim() || null },
      paymentMethod,
      orderStatus: "preparing",
      paymentStatus: paymentMethod === "cash" ? "cod" : "pending",
      actions: {
        deliveryApproved: false,
        paymentApproved: paymentMethod !== "cash" ? true : false,
      },
      amounts: { subtotal, deliveryFee, total },
      items: items.map((i) => ({
        productId: i.productId,
        name: i.name,
        priceGHS: i.priceGHS,
        qty: i.qty,
      })),
    };

    upsertOrder(order);

    const url =
      paymentMethod === "cash"
        ? `${window.location.origin}/mart/pay/hubtel?ref=${encodeURIComponent(
            ref
          )}&method=cash`
        : `${window.location.origin}/mart/pay/hubtel?ref=${encodeURIComponent(
            ref
          )}&method=${paymentMethod}`;

    setPayUrl(url);
    await generateQrFor(url);
  }

  function resetAfterPaid() {
    clearCart();
  }

  if (items.length === 0 && !orderRef) {
    return (
      <div className="py-10">
        <p className="text-xs tracking-[0.35em] text-neutral-500">CHECKOUT</p>
        <h1 className="mt-2 text-2xl md:text-4xl font-semibold tracking-tight">
          Checkout
        </h1>
        <p className="mt-3 text-neutral-600">Your cart is empty.</p>
        <div className="mt-6 flex gap-3">
          <Link
            href="/mart/shop"
            className="rounded-full bg-black px-7 py-3 text-sm text-white"
          >
            Go to shop <ArrowRight className="inline h-4 w-4" />
          </Link>
          <Link
            href="/mart/cart"
            className="rounded-full bg-neutral-100 px-7 py-3 text-sm"
          >
            Back to cart
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="py-10">
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-2">
          <p className="text-xs tracking-[0.35em] text-neutral-500">CHECKOUT</p>
          <h1 className="text-2xl md:text-4xl font-semibold tracking-tight">
            Pay with Hubtel
          </h1>
          <p className="text-neutral-600">
            No passwords. Your device ID:{" "}
            <span className="font-semibold">{customerId || "…"}</span>
          </p>
        </div>

        <button
          onClick={() => setShowGuide(true)}
          className="inline-flex items-center gap-2 rounded-full bg-neutral-100 px-5 py-3 text-sm hover:bg-neutral-200"
        >
          <HelpCircle className="h-4 w-4" />
          How it works
        </button>
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
        {/* Form */}
        <div className="space-y-4">
          <div className="rounded-[28px] bg-white p-6 ring-1 ring-neutral-200/70">
            <p className="text-sm font-semibold">Delivery details</p>

            <div className="mt-5 grid gap-3 md:grid-cols-2">
              <div>
                <label className="text-xs text-neutral-500">
                  Full name (optional)
                </label>
                <input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="mt-1 h-11 w-full rounded-2xl bg-neutral-100/70 px-4 text-sm outline-none focus:ring-2 focus:ring-red-500/20"
                  placeholder="Your name"
                />
              </div>

              <div>
                <label className="text-xs text-neutral-500">
                  Phone number *
                </label>
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="mt-1 h-11 w-full rounded-2xl bg-neutral-100/70 px-4 text-sm outline-none focus:ring-2 focus:ring-red-500/20"
                  placeholder="e.g. 024xxxxxxx"
                />
              </div>

              <div className="md:col-span-2">
                <label className="text-xs text-neutral-500">
                  Delivery address *
                </label>
                <input
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="mt-1 h-11 w-full rounded-2xl bg-neutral-100/70 px-4 text-sm outline-none focus:ring-2 focus:ring-red-500/20"
                  placeholder="Area, street, landmark…"
                />
              </div>

              <div className="md:col-span-2">
                <label className="text-xs text-neutral-500">Note (optional)</label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="mt-1 min-h-[90px] w-full rounded-2xl bg-neutral-100/70 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-red-500/20"
                  placeholder="Gate color, call on arrival, etc."
                />
              </div>
            </div>
          </div>

          <div className="rounded-[28px] bg-white p-6 ring-1 ring-neutral-200/70">
            <p className="text-sm font-semibold">Payment method</p>

            <div className="mt-4 grid gap-3 md:grid-cols-3">
              {[
                { key: "momo", label: "Mobile Money" },
                { key: "card", label: "Card" },
                { key: "cash", label: "Cash on delivery" },
              ].map((p) => (
                <button
                  key={p.key}
                  type="button"
                  onClick={() => setPaymentMethod(p.key as any)}
                  className={`rounded-2xl px-4 py-4 text-sm ring-1 transition active:scale-[0.99]
                    ${
                      paymentMethod === p.key
                        ? "bg-black text-white ring-black"
                        : "bg-white text-neutral-900 ring-neutral-200/70 hover:bg-neutral-50"
                    }`}
                >
                  {p.label}
                </button>
              ))}
            </div>

            <p className="mt-3 text-xs text-neutral-500">
              Hubtel Online Checkout supports payments on web via checkout flows.
            </p>
          </div>

          {/* Create QR */}
          {!orderRef ? (
            <button
              onClick={createOrderAndShowQr}
              disabled={!canCreateOrder}
              className="w-full rounded-2xl bg-black px-5 py-3 text-sm text-white hover:bg-black/90 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Generate payment QR <QrCode className="inline h-4 w-4 ml-2" />
            </button>
          ) : (
            <div className="rounded-[28px] bg-white p-6 ring-1 ring-neutral-200/70">
              <p className="text-sm font-semibold">Scan to pay</p>
              <p className="mt-1 text-sm text-neutral-600">
                Order ref: <span className="font-semibold">{orderRef}</span>
              </p>

              <div className="mt-4 rounded-2xl bg-neutral-50/60 p-4">
                {qrDataUrl ? (
                  <img src={qrDataUrl} alt="Payment QR" className="w-full rounded-2xl" />
                ) : (
                  <div className="h-48 rounded-2xl bg-neutral-100 animate-pulse" />
                )}
              </div>

              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <a
                  href={payUrl}
                  className="rounded-2xl bg-black px-5 py-3 text-center text-sm text-white hover:bg-black/90"
                >
                  Open payment
                </a>

                <Link
                  href={`/mart/pay/manual?ref=${encodeURIComponent(orderRef)}`}
                  className="rounded-2xl bg-white px-5 py-3 text-center text-sm ring-1 ring-neutral-200/70 hover:bg-neutral-50"
                >
                  Manual payment
                </Link>
              </div>

              <div className="mt-4 flex gap-3">
                <Link
                  href={`/mart/track`}
                  onClick={resetAfterPaid}
                  className="rounded-2xl bg-neutral-100 px-5 py-3 text-sm hover:bg-neutral-200"
                >
                  Go to Track Order
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Summary */}
        <aside className="rounded-[32px] bg-neutral-50/60 p-7">
          <p className="text-xs tracking-[0.35em] text-neutral-500">SUMMARY</p>

          <div className="mt-5 space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-neutral-600">Subtotal</span>
              <span className="font-semibold">{money(subtotal)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-neutral-600">Delivery</span>
              <span className="font-semibold">{money(deliveryFee)}</span>
            </div>
            <div className="border-t border-neutral-200/70 pt-3 flex items-center justify-between">
              <span className="font-semibold">Total</span>
              <span className="font-semibold">{money(total)}</span>
            </div>
          </div>

          <p className="mt-4 text-xs text-neutral-500">
            Delivery fee is placeholder — later compute by zone.
          </p>
        </aside>
      </div>

      <Modal open={showGuide} title="How payments work" onClose={() => setShowGuide(false)}>
        <ol className="list-decimal pl-5 space-y-2 text-sm text-neutral-700">
          <li>Fill delivery details and choose payment method.</li>
          <li>Tap <b>Generate payment QR</b>.</li>
          <li>Scan QR (or tap Open payment) to launch Hubtel Checkout.</li>
          <li>After payment succeeds, your order shows as <b>Paid</b> in Track Order.</li>
          <li>
            When your package arrives, you tap <b>Approve Delivery</b>. If Cash on Delivery,
            also tap <b>Approve Payment</b>.
          </li>
        </ol>
      </Modal>
    </div>
  );
}
