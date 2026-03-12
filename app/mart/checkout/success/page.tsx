"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, BadgeCheck } from "lucide-react";
import { useMartStore } from "@/lib/mart/store";

const CHECKOUT_SUCCESS_KEY = "gm_checkout_success_v1";

export default function CheckoutSuccessPage() {
  const [ref, setRef] = useState<string | null>(null);
  const clearCart = useMartStore((s) => s.clearCart);

  useEffect(() => {
    const fromUrl = new URL(window.location.href).searchParams.get("ref");
    setRef(fromUrl);

    // ✅ Clear immediately (so cart is empty right away)
    clearCart();

    // ✅ Also set a flag so if user opens cart in another tab/session it still clears
    localStorage.setItem(
      CHECKOUT_SUCCESS_KEY,
      JSON.stringify({ ref: fromUrl, at: new Date().toISOString() }),
    );
  }, [clearCart]);

  return (
    <div className="py-16">
      <p className="text-xs tracking-[0.35em] text-neutral-500">ORDER COMPLETE</p>

      <div className="mt-4 flex items-center gap-3">
        <BadgeCheck className="h-6 w-6 text-red-600" />
        <h1 className="text-2xl md:text-4xl font-semibold tracking-tight">Order received</h1>
      </div>

      <p className="mt-3 text-neutral-600">
        Your order reference is <span className="font-semibold">{ref ?? "—"}</span>.
      </p>

      <div className="mt-7 flex flex-wrap gap-3">
        <Link
          href="/mart/track"
          className="inline-flex items-center gap-2 rounded-full bg-black px-7 py-3 text-sm text-white hover:bg-black/90 transition"
        >
          Track order <ArrowRight className="h-4 w-4" />
        </Link>

        <Link
          href="/mart/shop"
          className="inline-flex items-center gap-2 rounded-full bg-neutral-100 px-7 py-3 text-sm hover:bg-neutral-200 transition"
        >
          Continue shopping <ArrowRight className="h-4 w-4" />
        </Link>

        <Link
          href="/mart"
          className="inline-flex items-center gap-2 rounded-full bg-white px-7 py-3 text-sm ring-1 ring-neutral-200/70 hover:bg-neutral-50 transition"
        >
          Back home <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <p className="mt-6 text-xs text-neutral-500">Your cart was cleared automatically after checkout.</p>
    </div>
  );
}
