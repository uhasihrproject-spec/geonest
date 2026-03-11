"use client";

import * as React from "react";
import { MessageCircle, X, Send, Mic, Sparkles, Minus } from "lucide-react";
import { useRouter } from "next/navigation";
import { subscribeAssistant } from "@/lib/mart/assistant/controller";
import { useMartStore } from "@/lib/mart/store";
import { getProducts } from "@/lib/mart/productsLocal";

/* ---------------- TYPES ---------------- */

type QuickAction = {
  label: string;
  action:
    | "GO_TO"
    | "OPEN_CART"
    | "TRACK_ORDER"
    | "START_PAYMENT"
    | "OPEN_MANUAL_PAYMENT"
    | "ADD_TO_CART"
    | "REMOVE_FROM_CART"
    | "SET_QTY"
    | "CLEAR_CART"
    | "REPLACE_CART_ITEM";
  payload?: any;
};

type Msg = {
  role: "user" | "assistant";
  content: string;
  actions?: QuickAction[];
};

const STORAGE_KEY = "geonest_mart_chat_v1";

/* ---------------- SAFE ROUTES ---------------- */

const ALLOWED_ROUTES = [
  "/mart",
  "/mart/shop",
  "/mart/cart",
  "/mart/checkout",
  "/mart/track",
  "/mart/deals",
  "/mart/chat",
  "/mart/admin",
  "/mart/admin/orders",
  "/mart/admin/products",
  "/mart/admin/new",
];

function isSafeHref(href?: string) {
  if (!href) return false;
  if (!href.startsWith("/mart")) return false;
  if (/^\/mart\/product\/[a-z0-9\-]+$/i.test(href)) return true;
  return ALLOWED_ROUTES.includes(href);
}

/* ---------------- HELPERS ---------------- */

function safeJsonParse<T>(s: string, fallback: T): T {
  try {
    return JSON.parse(s) as T;
  } catch {
    return fallback;
  }
}

function money(n: number) {
  return `GHS ${Number(n || 0).toFixed(2)}`;
}

/* ---------------- COMPONENT ---------------- */

export default function MartAssistant() {
  const router = useRouter();

  const addToCart = useMartStore((s) => s.addToCart);
  const removeFromCart = useMartStore((s) => s.removeFromCart);
  const setQty = useMartStore((s) => s.setQty);
  const clearCart = useMartStore((s) => s.clearCart);

  const [open, setOpen] = React.useState(false);
  const [minimized, setMinimized] = React.useState(false);
  const [input, setInput] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [thinkingDots, setThinkingDots] = React.useState("•");
  const [listening, setListening] = React.useState(false);

  const inputRef = React.useRef<HTMLInputElement>(null);
  const bottomRef = React.useRef<HTMLDivElement>(null);
  const recognitionRef = React.useRef<any>(null);
  const lastContext = React.useRef<any>(null);

  /* ---------------- CHAT MEMORY (cross session) ---------------- */
  const [msgs, setMsgs] = React.useState<Msg[]>(() => {
    if (typeof window === "undefined") return [];
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return safeJsonParse(saved, []);
    return [
      {
        role: "assistant",
        content:
          "Hi 👋 I’m your Geonest Mart assistant. Tell me what you want (and your budget). I can also optimize your cart for value.",
        actions: [
          { label: "Shop", action: "GO_TO", payload: { href: "/mart/shop" } },
          { label: "Open cart", action: "OPEN_CART" },
          { label: "Track order", action: "TRACK_ORDER" },
        ],
      },
    ];
  });

  const msgsRef = React.useRef<Msg[]>(msgs);
  React.useEffect(() => {
    msgsRef.current = msgs;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(msgs));
    } catch {}
  }, [msgs]);

  /* ---------------- AUTOSCROLL ---------------- */
  React.useEffect(() => {
    if (!open || minimized) return;
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs, loading, open, minimized]);

  /* ---------------- THINKING DOTS ---------------- */
  React.useEffect(() => {
    if (!loading) return;
    const t = setInterval(() => {
      setThinkingDots((d) => (d.length >= 7 ? "•" : d + " •"));
    }, 330);
    return () => clearInterval(t);
  }, [loading]);

  /* ---------------- VOICE INPUT ---------------- */
  React.useEffect(() => {
    if (typeof window === "undefined") return;

    const SR =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return;

    const rec = new SR();
    rec.lang = "en-GB";
    rec.interimResults = true;
    rec.continuous = false;

    rec.onresult = (event: any) => {
      let transcript = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      setInput(transcript.trim());
    };

    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);
    recognitionRef.current = rec;
  }, []);

  function toggleVoice() {
    const rec = recognitionRef.current;
    if (!rec) {
      alert("Voice input not supported on this browser.");
      return;
    }
    if (listening) {
      rec.stop();
      setListening(false);
    } else {
      rec.start();
      setListening(true);
    }
  }

  function feedback(type: "send" | "receive") {
    try {
      if (navigator.vibrate) navigator.vibrate(12);
      const audio = new Audio(type === "send" ? "/sounds/send.mp3" : "/sounds/receive.mp3");
      audio.volume = 0.35;
      audio.play().catch(() => {});
    } catch {}
  }

  function pushUserMessage(text: string) {
    feedback("send");
    setMsgs((m) => [...m, { role: "user", content: text }]);
  }

  function pushAssistantMessage(text: string, actions?: QuickAction[]) {
    feedback("receive");
    setMsgs((m) => [...m, { role: "assistant", content: text, actions: actions?.slice(0, 6) }]);
  }

  /* ---------------- CONTEXT BUILDERS ---------------- */

  function getCartSnapshot() {
    const state = useMartStore.getState();
    const cart = state.cart || {};
    const items = Object.values(cart).map((it: any) => ({
      productId: it.productId,
      name: it.name,
      priceGHS: it.priceGHS,
      qty: it.qty,
      category: it.category ?? it.categorySlug ?? "other",
      image: it.image ?? null,
      lineTotal: Number(it.priceGHS || 0) * Number(it.qty || 1),
    }));

    const subtotal =
      typeof state.cartSubtotal === "function"
        ? state.cartSubtotal()
        : items.reduce((a, x) => a + Number(x.lineTotal || 0), 0);

    const count =
      typeof state.cartCount === "function"
        ? state.cartCount()
        : items.reduce((a, x) => a + Number(x.qty || 0), 0);

    return { items, subtotal, count };
  }

  function getVisibleProductsSafe() {
    // Use your real products (includes admin-added products saved in localStorage)
    try {
      const prods = getProducts();
      if (Array.isArray(prods) && prods.length) return prods;
    } catch {}
    return [];
  }

  /* ---------------- SEND ---------------- */

  async function send(textOverride?: string, context?: any) {
    const text = (textOverride ?? input).trim();
    if (!text || loading) return;

    if (!textOverride) {
      pushUserMessage(text);
      setInput("");
    }

    setLoading(true);

    try {
      const history = msgsRef.current.map(({ role, content }) => ({ role, content }));

      // Always attach cart + products so the assistant can answer from YOUR mart
      const mergedContext = {
        ...(lastContext.current || {}),
        ...(context || {}),
        page: context?.page ?? lastContext.current?.page ?? window.location.pathname,
        cart: getCartSnapshot(),
        visibleProducts: context?.visibleProducts?.length
          ? context.visibleProducts
          : getVisibleProductsSafe(),
      };

      lastContext.current = mergedContext;

      const res = await fetch("/api/mart/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: history.concat({ role: "user", content: text }),
          context: mergedContext,
        }),
      });

      const data = await res.json();

      // Normalize shape
      const reply = typeof data?.reply === "string" ? data.reply : "Tell me more 🙂";
      const actions = Array.isArray(data?.quickActions) ? data.quickActions : [];

      setMsgs((m) => [...m, { role: "assistant", content: reply, actions }]);
      feedback("receive");
    } catch {
      pushAssistantMessage("Network issue. Try again for me 🙂");
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 120);
    }
  }

  /* ---------------- ACTIONS ---------------- */

  function handleAction(a: QuickAction) {
    if (!a) return;

    if (a.action === "GO_TO") {
      const href = a.payload?.href;
      if (!isSafeHref(href)) {
        pushAssistantMessage(
          "That link isn’t available yet. Try Shop, Cart, Deals, or Track 🙂",
          [
            { label: "Shop", action: "GO_TO", payload: { href: "/mart/shop" } },
            { label: "Open cart", action: "OPEN_CART" },
            { label: "Track order", action: "TRACK_ORDER" },
          ]
        );
        return;
      }
      router.push(href);
      return;
    }

    if (a.action === "OPEN_CART") {
      router.push("/mart/cart");
      return;
    }

    if (a.action === "TRACK_ORDER") {
      router.push("/mart/track");
      return;
    }

    if (a.action === "START_PAYMENT" && a.payload?.ref) {
      router.push(
        `/mart/pay/hubtel?ref=${encodeURIComponent(a.payload.ref)}&method=${encodeURIComponent(
          a.payload.method || "momo"
        )}`
      );
      return;
    }

    if (a.action === "OPEN_MANUAL_PAYMENT" && a.payload?.ref) {
      router.push(`/mart/pay/manual?ref=${encodeURIComponent(a.payload.ref)}`);
      return;
    }

    if (a.action === "ADD_TO_CART" && a.payload?.product) {
      addToCart(a.payload.product, a.payload.qty ?? 1);
      pushAssistantMessage(`✅ Added ${a.payload.product?.name || "item"} to your cart.`, [
        { label: "Open cart", action: "OPEN_CART" },
      ]);
      return;
    }

    if (a.action === "REMOVE_FROM_CART" && a.payload?.productId) {
      removeFromCart(String(a.payload.productId));
      pushAssistantMessage("✅ Removed that item from your cart.", [{ label: "Open cart", action: "OPEN_CART" }]);
      return;
    }

    if (a.action === "SET_QTY" && a.payload?.productId) {
      const qty = Math.max(1, Number(a.payload?.qty ?? 1));
      setQty(String(a.payload.productId), qty);
      pushAssistantMessage(`✅ Updated quantity to ${qty}.`, [{ label: "Open cart", action: "OPEN_CART" }]);
      return;
    }

    if (a.action === "CLEAR_CART") {
      clearCart();
      pushAssistantMessage("✅ Cart cleared.", [{ label: "Shop", action: "GO_TO", payload: { href: "/mart/shop" } }]);
      return;
    }

    if (a.action === "REPLACE_CART_ITEM" && a.payload?.removeProductId && a.payload?.addProduct) {
      const qty = Math.max(1, Number(a.payload?.qty ?? 1));
      removeFromCart(String(a.payload.removeProductId));
      addToCart(a.payload.addProduct, qty);
      pushAssistantMessage(`✅ Swapped it. Added ${a.payload.addProduct?.name || "the replacement"}.`, [
        { label: "Open cart", action: "OPEN_CART" },
      ]);
      return;
    }
  }

  /* ---------------- FIX “#assistant” BUTTON WITHOUT PAGE EDITS ---------------- */
  React.useEffect(() => {
    if (typeof window === "undefined") return;

    const run = () => {
      if (window.location.hash !== "#assistant") return;

      setOpen(true);
      setMinimized(false);

      const prompt =
        "Optimize my cart: remove items that are not good value, then suggest replacements from the SAME category we have in the shop. Keep it simple and tell me what you changed.";

      lastContext.current = { page: window.location.pathname };
      pushUserMessage("Optimize my cart");
      send(prompt, { page: window.location.pathname });
    };

    run();
    window.addEventListener("hashchange", run);
    return () => window.removeEventListener("hashchange", run);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ---------------- CONTROLLER EVENTS ---------------- */
  React.useEffect(() => {
    return subscribeAssistant((payload) => {
      if (payload.type === "OPEN") {
        setOpen(true);
        setMinimized(false);
        setTimeout(() => inputRef.current?.focus(), 120);
      }
      if (payload.type === "CLOSE") setOpen(false);
      if (payload.type === "TOGGLE") setOpen((v) => !v);

      if (payload.type === "ASK") {
        setOpen(true);
        setMinimized(false);

        // keep their context + also ensure we add products/cart
        lastContext.current = {
          ...(payload.context || {}),
          page: payload.context?.page ?? window.location.pathname,
        };

        pushUserMessage(payload.message);
        send(payload.message, payload.context);
      }
    });
  }, []);

  const canSend = input.trim().length > 0 && !loading;

  return (
    <>
      {/* FLOAT BUTTON */}
      <button
        onClick={() => {
          setOpen((v) => !v);
          setMinimized(false);
          setTimeout(() => inputRef.current?.focus(), 150);
        }}
        className="fixed bottom-6 right-6 z-[90] group flex items-center gap-2 rounded-full bg-black px-4 py-3 text-white shadow-xl hover:bg-black/90 transition active:scale-[0.99]"
      >
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500/60" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
        </span>
        <MessageCircle className="h-5 w-5" />
        <span className="text-sm font-medium">Assistant</span>
      </button>

      {open && (
        <div className="fixed bottom-24 right-6 z-[90] w-[92vw] max-w-sm">
          <div className="overflow-hidden rounded-[28px] bg-white shadow-2xl ring-1 ring-black/5">
            {/* Header */}
            <div className="relative px-4 py-3">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(600px_200px_at_20%_0%,rgba(239,68,68,0.12),transparent_60%)]" />
              <div className="relative flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="grid h-9 w-9 place-items-center rounded-2xl bg-neutral-100">
                    <Sparkles className="h-4 w-4 text-red-600" />
                  </div>
                  <div className="leading-tight">
                    <p className="text-sm font-semibold">
                      Geonest <span className="text-red-600">Assistant</span>
                    </p>
                    <p className="text-[11px] text-neutral-500">
                      Products · cart · payments · tracking
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setMinimized((v) => !v)}
                    className="rounded-xl p-2 hover:bg-neutral-100 transition"
                    aria-label={minimized ? "Expand" : "Minimize"}
                    title={minimized ? "Expand" : "Minimize"}
                  >
                    <Minus className="h-4 w-4" />
                  </button>

                  <button
                    onClick={() => setOpen(false)}
                    className="rounded-xl p-2 hover:bg-neutral-100 transition"
                    aria-label="Close"
                    title="Close"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {!minimized && (
              <>
                <div className="max-h-[360px] space-y-3 overflow-auto px-4 pb-4 pt-2">
                  {msgs.map((m, i) => (
                    <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                      <div className="max-w-[85%]">
                        <div
                          className={`rounded-2xl px-3 py-2 text-sm leading-relaxed shadow-sm ${
                            m.role === "user"
                              ? "bg-black text-white"
                              : "bg-neutral-100 text-neutral-900"
                          }`}
                        >
                          {m.content}
                        </div>

                        {m.actions?.length ? (
                          <div className="mt-2 flex flex-wrap gap-2">
                            {m.actions.map((a, j) => (
                              <button
                                key={j}
                                onClick={() => handleAction(a)}
                                className="rounded-full bg-white px-3 py-1 text-xs ring-1 ring-neutral-200 hover:bg-neutral-50 transition active:scale-[0.99]"
                              >
                                {a.label}
                              </button>
                            ))}
                          </div>
                        ) : null}
                      </div>
                    </div>
                  ))}

                  {loading && (
                    <div className="text-xs italic text-neutral-500">
                      Thinking {thinkingDots}
                    </div>
                  )}

                  <div ref={bottomRef} />
                </div>

                {/* Input */}
                <div className="flex items-center gap-2 px-3 py-3 ring-1 ring-black/5">
                  <input
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && send()}
                    placeholder="Ask me anything…"
                    className="h-10 w-full rounded-2xl px-3 text-sm ring-1 ring-black/5 focus:outline-none focus:ring-2 focus:ring-red-500/20"
                  />

                  <button
                    onClick={toggleVoice}
                    className={`inline-flex h-10 w-10 items-center justify-center rounded-2xl transition ${
                      listening
                        ? "bg-red-600 text-white animate-pulse"
                        : "bg-neutral-100 hover:bg-neutral-200"
                    }`}
                    aria-label="Voice input"
                    title="Voice input"
                  >
                    <Mic className="h-4 w-4" />
                  </button>

                  <button
                    onClick={() => send()}
                    disabled={!canSend}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-black text-white transition hover:bg-black/90 disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.99]"
                    aria-label="Send"
                    title="Send"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </div>
              </>
            )}

            {minimized && (
              <button
                onClick={() => {
                  setMinimized(false);
                  setTimeout(() => inputRef.current?.focus(), 150);
                }}
                className="w-full px-4 py-3 text-left text-sm text-neutral-700 hover:bg-neutral-50 transition"
              >
                Tap to continue chat…
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
}
