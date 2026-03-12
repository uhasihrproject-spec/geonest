"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { MartProduct } from "@/lib/mart/data";

type CartProductInput = Pick<MartProduct, "id" | "name" | "priceGHS"> & {
  image?: string;
  category?: string;
  categorySlug?: string;
};

export type CartItem = {
  productId: string;
  name: string;
  priceGHS: number;
  image?: string;
  qty: number;

  // ✅ add this (fixes your cart page + assistant optimizer)
  category?: string;
};

type MartState = {
  // wishlist
  wishlist: Record<string, true>;
  toggleWishlist: (productId: string) => void;
  isWishlisted: (productId: string) => boolean;

  // cart
  cart: Record<string, CartItem>;
  addToCart: (product: CartProductInput, qty?: number) => void;
  removeFromCart: (productId: string) => void;
  setQty: (productId: string, qty: number) => void;
  clearCart: () => void;

  cartCount: () => number;
  cartSubtotal: () => number;
};

export const useMartStore = create<MartState>()(
  persist(
    (set, get) => ({
      wishlist: {},
      toggleWishlist: (productId) =>
        set((state) => {
          const next = { ...state.wishlist };
          if (next[productId]) delete next[productId];
          else next[productId] = true;
          return { wishlist: next };
        }),
      isWishlisted: (productId) => !!get().wishlist[productId],

      cart: {},

      addToCart: (product, qty = 1) =>
        set((state) => {
          const existing = state.cart[product.id];
          const nextQty = (existing?.qty ?? 0) + qty;

          // ✅ support both category and categorySlug
          const category =
            (product as any).category ??
            (product as any).categorySlug ??
            existing?.category ??
            "other";

          return {
            cart: {
              ...state.cart,
              [product.id]: {
                productId: product.id,
                name: product.name,
                priceGHS: product.priceGHS,
                image: (product as any).image,
                category, // ✅ now saved
                qty: nextQty,
              },
            },
          };
        }),

      removeFromCart: (productId) =>
        set((state) => {
          const next = { ...state.cart };
          delete next[productId];
          return { cart: next };
        }),

      setQty: (productId, qty) =>
        set((state) => {
          const next = { ...state.cart };
          const item = next[productId];
          if (!item) return state;

          if (qty <= 0) delete next[productId];
          else next[productId] = { ...item, qty };

          return { cart: next };
        }),

      clearCart: () => set({ cart: {} }),

      cartCount: () =>
        Object.values(get().cart).reduce((sum, i) => sum + (i.qty || 0), 0),

      cartSubtotal: () =>
        Object.values(get().cart).reduce(
          (sum, i) => sum + (i.qty || 0) * (i.priceGHS || 0),
          0
        ),
    }),
    {
      name: "geonest-mart-store-v1",
      version: 2,

      // ✅ migrate old carts that didn't have category
      migrate: (persisted: any) => {
        if (!persisted) return persisted;
        const cart = persisted?.state?.cart || {};
        const nextCart: Record<string, CartItem> = {};

        for (const [k, v] of Object.entries(cart)) {
          const it = v as any;
          nextCart[k] = {
            productId: it.productId,
            name: it.name,
            priceGHS: it.priceGHS,
            image: it.image,
            qty: it.qty,
            category: it.category ?? "other",
          };
        }

        return {
          ...persisted,
          state: {
            ...persisted.state,
            cart: nextCart,
          },
        };
      },
    }
  )
);
