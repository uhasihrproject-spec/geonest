"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { findOrder, updateOrder } from "@/lib/mart/ordersLocal";

declare global {
  interface Window {
    CheckoutSdk?: any;
  }
}

export default function HubtelPayPage() {
  const sp = useSearchParams();
  const ref = (sp.get("ref") || "").toUpperCase();
  const method = (sp.get("method") as "momo" | "card" | "cash" | null) || "momo";

  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const order = ref ? findOrder(ref) : null;

  useEffect(() => {
    if (!ref) setErr("Missing order reference.");
    if (ref && !order) setErr("Order not found on this device.");
  }, [ref, order]);

  async function start() {
    setErr(null);
    if (!order) return setErr("Order not found.");

    // COD: no Hubtel payment, just confirm and go back to tracking
    if (method === "cash") {
      updateOrder(order.orderRef, {
        paymentMethod: "cash",
        paymentStatus: "cod",
      });
      window.location.href = `/mart/track`;
      return;
    }

    setBusy(true);

    // If Hubtel script isn't available, show a friendly error
    const CheckoutSdk = window.CheckoutSdk;
    if (!CheckoutSdk) {
      setBusy(false);
      setErr("Hubtel checkout script not loaded.");
      return;
    }

    // Hubtel SDK usage: openModal({ purchaseInfo, config, callBacks })
    const checkout = new CheckoutSdk();

    const purchaseInfo = {
      amount: order.amounts.total,
      purchaseDescription: `Geonest Mart Order ${order.orderRef}`,
      customerPhoneNumber: order.customer.phone,
      clientReference: order.orderRef,
    };

    const config = {
      branding: "enabled",
      callbackUrl: process.env.NEXT_PUBLIC_HUBTEL_CALLBACK_URL || "",
      merchantAccount: Number(process.env.NEXT_PUBLIC_HUBTEL_MERCHANT_ACCOUNT || "0"),
      basicAuth: process.env.NEXT_PUBLIC_HUBTEL_BASIC_AUTH || "",
    };

    if (!config.callbackUrl || !config.merchantAccount || !config.basicAuth) {
      setBusy(false);
      setErr("Missing Hubtel config (env vars).");
      return;
    }

    checkout.openModal({
      purchaseInfo,
      config,
      callBacks: {
        onPaymentSuccess: (payload: any) => {
          updateOrder(order.orderRef, {
            paymentMethod: method,
            paymentStatus: "paid",
            hubtel: { lastEvent: payload },
          });
          window.location.href = `/mart/track`;
        },
        onPaymentFailure: (payload: any) => {
          updateOrder(order.orderRef, {
            paymentMethod: method,
            paymentStatus: "pending",
            hubtel: { lastEvent: payload },
          });
          setBusy(false);
          setErr("Payment failed or cancelled. Try again.");
        },
        onClose: () => setBusy(false),
      },
    });
  }

  return (
    <div className="py-16">
      <p className="text-xs tracking-[0.35em] text-neutral-500">HUBTEL CHECKOUT</p>
      <h1 className="mt-2 text-2xl md:text-4xl font-semibold tracking-tight">Complete payment</h1>

      <p className="mt-3 text-neutral-600">
        Order: <span className="font-semibold">{ref || "—"}</span>
      </p>

      <div className="mt-8 rounded-[28px] bg-white p-6 ring-1 ring-neutral-200/70 max-w-xl">
        {err && <p className="text-sm text-red-600">{err}</p>}

        <button
          onClick={start}
          disabled={busy || !!err}
          className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-black px-5 py-3 text-sm text-white hover:bg-black/90 disabled:opacity-50"
        >
          {method === "cash" ? "Confirm Cash on Delivery" : "Pay now (Hubtel)"}
          <ArrowRight className="h-4 w-4" />
        </button>

        <Link
          href="/mart/track"
          className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm ring-1 ring-neutral-200/70 hover:bg-neutral-50"
        >
          Back to Track <ArrowRight className="h-4 w-4" />
        </Link>

        <p className="mt-4 text-xs text-neutral-500">
          Hubtel Checkout supports web integration via checkout flows and SDK methods like openModal.
        </p>
      </div>
    </div>
  );
}
