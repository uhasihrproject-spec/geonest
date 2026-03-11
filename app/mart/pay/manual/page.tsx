"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Info } from "lucide-react";
import { findOrder, updateOrder } from "@/lib/mart/ordersLocal";

export default function ManualPayPage() {
  const sp = useSearchParams();
  const ref = (sp.get("ref") || "").toUpperCase();

  const order = useMemo(() => (ref ? findOrder(ref) : null), [ref]);

  const [paidState, setPaidState] = useState<"paid" | "not_paid">("paid");
  const [note, setNote] = useState("");
  const [err, setErr] = useState<string | null>(null);

  function submit() {
    setErr(null);
    if (!order) return setErr("Order not found.");

    // If user says "I have paid" => DO NOT mark paid directly.
    // Put it under manual verification.
    if (paidState === "paid") {
      if (note.trim().length < 4) {
        setErr("Please add at least a short note (transaction ID / details).");
        return;
      }

      updateOrder(order.orderRef, {
        paymentStatus: "manual_review",
        hubtel: { lastEvent: { manualNote: note.trim(), at: new Date().toISOString() } },
      });

      window.location.href = "/mart/track";
      return;
    }

    // If user says "I have NOT paid" => revert to the correct unpaid state
    updateOrder(order.orderRef, {
      paymentStatus: order.paymentMethod === "cash" ? "cod" : "pending",
      hubtel: { lastEvent: { manualNote: "User marked as NOT PAID", at: new Date().toISOString() } },
    });

    window.location.href = "/mart/track";
  }

  if (!order) {
    return (
      <div className="py-16">
        <p className="text-xs tracking-[0.35em] text-neutral-500">MANUAL PAYMENT</p>
        <h1 className="mt-2 text-2xl md:text-4xl font-semibold tracking-tight">Submit proof</h1>

        <div className="mt-8 rounded-[28px] bg-neutral-50/60 p-6">
          <p className="text-sm font-semibold">Order not found</p>
          <p className="mt-2 text-sm text-neutral-600">
            This order reference doesn’t exist on this device. Try Track Order and use the “Recent orders” list.
          </p>

          <Link
            href="/mart/track"
            className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-black px-6 py-3 text-sm text-white hover:bg-black/90 transition"
          >
            Back to Track <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    );
  }

  const isCash = order.paymentMethod === "cash";

  return (
    <div className="py-16">
      <p className="text-xs tracking-[0.35em] text-neutral-500">MANUAL PAYMENT</p>
      <h1 className="mt-2 text-2xl md:text-4xl font-semibold tracking-tight">Payment status update</h1>

      <p className="mt-3 text-neutral-600">
        Order: <span className="font-semibold">{order.orderRef}</span>
      </p>

      <div className="mt-8 max-w-xl rounded-[28px] bg-white p-6 ring-1 ring-neutral-200/70">
        <div className="rounded-2xl bg-neutral-50/60 p-4">
          <p className="text-xs text-neutral-500 flex items-center gap-2">
            <Info className="h-4 w-4" />
            Quick note
          </p>
          <p className="mt-1 text-sm text-neutral-700">
            If you select <b>“I have paid”</b>, we’ll mark your payment as{" "}
            <b>Manual verification</b> until admin confirms.
            {isCash ? " If you’re paying cash, you can also just pay the rider on delivery." : ""}
          </p>
        </div>

        <p className="mt-5 text-sm font-semibold">Have you paid?</p>
        <div className="mt-3 space-y-2 text-sm text-neutral-700">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="paid"
              checked={paidState === "paid"}
              onChange={() => setPaidState("paid")}
            />
            I have already paid
          </label>

          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="paid"
              checked={paidState === "not_paid"}
              onChange={() => setPaidState("not_paid")}
            />
            I have not paid yet
          </label>
        </div>

        <div className="mt-5">
          <label className="text-xs text-neutral-500">
            Transaction details (required if “I have paid”)
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="mt-1 min-h-[110px] w-full rounded-2xl bg-neutral-100/70 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-red-500/20"
            placeholder="MoMo transaction ID / card reference / time / amount / network…"
          />
        </div>

        {err && <p className="mt-3 text-sm text-red-600">{err}</p>}

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <Link
            href="/mart/track"
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-neutral-100 px-5 py-3 text-sm hover:bg-neutral-200 transition"
          >
            Cancel <ArrowRight className="h-4 w-4" />
          </Link>

          <button
            onClick={submit}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-black px-5 py-3 text-sm text-white hover:bg-black/90 transition"
          >
            Save update <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
