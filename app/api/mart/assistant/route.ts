// app/api/mart/assistant/route.ts
import { NextResponse } from "next/server";
import { PRODUCTS } from "@/lib/mart/data";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* ---------------- Types ---------------- */

type Msg = { role: "user" | "assistant" | "system"; content: string };

type QuickAction =
  | { label: string; action: "GO_TO"; payload: { href: string } }
  | { label: string; action: "OPEN_CART" }
  | { label: string; action: "TRACK_ORDER" }
  | {
      label: string;
      action: "START_PAYMENT";
      payload: { ref: string; method?: "momo" | "card" | "cash" };
    }
  | { label: string; action: "OPEN_MANUAL_PAYMENT"; payload: { ref: string } }
  | { label: string; action: "ADD_TO_CART"; payload: { product: any; qty?: number } }
  | { label: string; action: "REMOVE_FROM_CART"; payload: { productId: string } }
  | { label: string; action: "SET_QTY"; payload: { productId: string; qty: number } }
  | { label: string; action: "CLEAR_CART" }
  | {
      label: string;
      action: "REPLACE_CART_ITEM";
      payload: { removeProductId: string; addProduct: any; qty?: number };
    };

type AssistantJSON = {
  reply: string;
  quickActions?: QuickAction[];
  memory?: Record<string, any>;
};

/* ---------------- Utils ---------------- */

function safeStr(x: any) {
  return typeof x === "string" ? x : "";
}

function money(n: number) {
  return `GHS ${Number(n || 0).toLocaleString()}`;
}

function clamp(n: number, a: number, b: number) {
  return Math.min(b, Math.max(a, n));
}

function safeParseJSON<T>(s: string, fallback: T): T {
  try {
    return JSON.parse(s) as T;
  } catch {
    return fallback;
  }
}

// only allow safe internal mart links
const ALLOWED_ROUTES = new Set([
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
]);

function isSafeHref(href?: string) {
  if (!href || typeof href !== "string") return false;
  if (!href.startsWith("/mart")) return false;
  if (/^\/mart\/product\/[a-z0-9\-]+$/i.test(href)) return true;
  return ALLOWED_ROUTES.has(href);
}

function toQuickNav(): QuickAction[] {
  return [
    { label: "Shop", action: "GO_TO", payload: { href: "/mart/shop" } },
    { label: "Cart", action: "OPEN_CART" },
    { label: "Track order", action: "TRACK_ORDER" },
  ];
}

/* ---------------- Product grounding ----------------
   IMPORTANT: server can't read localStorage custom products.
   So we trust context.visibleProducts when sent from client.
----------------------------------------------------- */

function normalizeProducts(context: any) {
  const fromCtx = Array.isArray(context?.visibleProducts) ? context.visibleProducts : null;
  const list = fromCtx && fromCtx.length ? fromCtx : PRODUCTS;

  // normalize shape (id/name/priceGHS/category)
  return (list || [])
    .map((p: any) => ({
      ...p,
      id: String(p.id ?? ""),
      name: String(p.name ?? ""),
      priceGHS: Number(p.priceGHS ?? 0),
      category: String(p.category ?? p.categorySlug ?? "other"),
    }))
    .filter((p: any) => p.id && p.name && Number.isFinite(p.priceGHS) && p.priceGHS > 0);
}

/* ---------------- “Embedding-like” search (free) ---------------- */

function tokenize(s: string) {
  return (s || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
}

function hash32(str: string) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function vectorize(text: string, dims = 256) {
  const v = new Array(dims).fill(0);
  const words = tokenize(text);
  for (const w of words) {
    const grams = [w, w.slice(0, 4), w.slice(-4)];
    for (const g of grams) {
      if (!g) continue;
      const idx = hash32(g) % dims;
      v[idx] += 1;
    }
  }
  let norm = 0;
  for (const x of v) norm += x * x;
  norm = Math.sqrt(norm) || 1;
  return v.map((x) => x / norm);
}

function cosine(a: number[], b: number[]) {
  let s = 0;
  for (let i = 0; i < a.length; i++) s += a[i] * b[i];
  return s;
}

function productText(p: any) {
  return [
    p.name,
    p.category,
    p.categorySlug,
    p.badge,
    Array.isArray(p.tags) ? p.tags.join(" ") : "",
    p.description || "",
  ]
    .filter(Boolean)
    .join(" ");
}

function searchProducts(query: string, products: any[], topK = 6) {
  const qv = vectorize(query);
  return products
    .map((p) => ({ p, score: cosine(qv, vectorize(productText(p))) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)
    .map((x) => x.p);
}

/* ---------------- Groq / OpenRouter (optional) ---------------- */

async function callGroq(messages: Msg[]) {
  const key = process.env.GROQ_API_KEY;
  if (!key) return null;

  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: process.env.GROQ_MODEL || "llama-3.1-8b-instant",
      messages,
      temperature: 0.55,
      max_tokens: 650,
    }),
  });

  if (!res.ok) return null;
  const data = await res.json();
  return data?.choices?.[0]?.message?.content?.trim() || null;
}

async function callOpenRouter(messages: Msg[]) {
  const key = process.env.OPENROUTER_API_KEY;
  if (!key) return null;

  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      "HTTP-Referer": process.env.OPENROUTER_SITE_URL || "http://localhost:3000",
      "X-Title": process.env.OPENROUTER_APP_NAME || "Geonest Mart",
    },
    body: JSON.stringify({
      model: process.env.OPENROUTER_MODEL || "meta-llama/llama-3.1-8b-instruct",
      messages,
      temperature: 0.55,
      max_tokens: 650,
    }),
  });

  if (!res.ok) return null;
  const data = await res.json();
  return data?.choices?.[0]?.message?.content?.trim() || null;
}

/* ---------------- Intent detection ---------------- */

function detectBudget(text: string) {
  const m = text.match(/(\d{2,6})/);
  if (!m) return null;
  const n = Number(m[1]);
  return Number.isFinite(n) ? n : null;
}

function hasAny(text: string, re: RegExp) {
  return re.test(text);
}

function isAskHowItWorks(t: string) {
  return hasAny(t, /how.*(work|works)|explain.*(mart|geonest mart)|process from shopping/i);
}
function isAskPayments(t: string) {
  return hasAny(t, /pay|payment|momo|card|hubtel|cash on delivery|cod/i);
}
function isAskManualPayment(t: string) {
  return hasAny(t, /manual payment|verification|verify payment/i);
}
function isAskTrack(t: string) {
  return hasAny(t, /track|where.*order|order status|my order/i);
}
function isAskDelivery(t: string) {
  return hasAny(t, /deliver|delivery|rider|shipping|how long/i);
}
function isAskRefundDamage(t: string) {
  return hasAny(t, /refund|return|damaged|broken|missing|wrong item/i);
}
function isAskStatuses(t: string) {
  return hasAny(t, /preparing|processing|on route|delivered|status mean/i);
}
function isOptimizeCart(t: string) {
  return hasAny(t, /optimi[sz]e.*cart|best value|overpay|remove.*cart|cheaper alternative|bundle/i);
}
function isProductHelp(t: string) {
  return hasAny(
    t,
    /worth it|pros|cons|compare|should i buy|recommend|suggest|best|under\s*\d+|cheap|affordable/i
  );
}

/* ---------------- Cart optimizer ---------------- */

function getCartItems(context: any) {
  const items = Array.isArray(context?.cart?.items) ? context.cart.items : [];
  return items
    .map((it: any) => ({
      productId: String(it.productId ?? it.id ?? ""),
      name: String(it.name ?? ""),
      priceGHS: Number(it.priceGHS ?? 0),
      qty: Number(it.qty ?? 1),
      category: String(it.category ?? it.categorySlug ?? "other"),
    }))
    .filter((it: any) => it.productId && it.name && it.priceGHS > 0 && it.qty > 0);
}

function optimizeCart(context: any, products: any[]) {
  const items = getCartItems(context);

  if (!items.length) {
    return {
      reply: "Your cart is empty 🙂 Want me to recommend a few items based on your budget?",
      quickActions: toQuickNav(),
    } satisfies AssistantJSON;
  }

  // totals by category
  const byCat: Record<string, number> = {};
  for (const it of items) {
    const cat = it.category || "other";
    byCat[cat] = (byCat[cat] || 0) + it.priceGHS * it.qty;
  }
  const topCat = Object.entries(byCat).sort((a, b) => b[1] - a[1])[0]?.[0] || "mixed";

  const actions: QuickAction[] = [];
  const lines: string[] = [];

  // helper: cheapest options in a category
  function cheapestInCat(cat: string, excludeId?: string) {
    return products
      .filter((p) => String(p.category) === cat && (!excludeId || p.id !== excludeId))
      .sort((a, b) => Number(a.priceGHS) - Number(b.priceGHS));
  }

  for (const it of items) {
    const cat = it.category || "other";
    const candidates = cheapestInCat(cat, it.productId);

    // choose a cheaper replacement if we can save at least ~5%
    const cheaper = candidates.find((p) => Number(p.priceGHS) < it.priceGHS * 0.95);

    if (cheaper) {
      const saveEach = it.priceGHS - Number(cheaper.priceGHS);
      lines.push(
        `• Swap **${it.name}** (${money(it.priceGHS)}) → **${cheaper.name}** (${money(cheaper.priceGHS)})  (save ~${money(saveEach)} each)`
      );
      actions.push({
        label: `Swap to ${cheaper.name}`,
        action: "REPLACE_CART_ITEM",
        payload: { removeProductId: it.productId, addProduct: cheaper, qty: it.qty },
      });
    }
  }

  // If no swaps, propose one “best value” add-on from top category
  if (!lines.length) {
    const pick = cheapestInCat(topCat)[0];
    if (pick) {
      lines.push(`• Cheap add-on in **${topCat}**: **${pick.name}** (${money(pick.priceGHS)})`);
      actions.push({ label: `Add ${pick.name}`, action: "ADD_TO_CART", payload: { product: pick, qty: 1 } });
    }
  }

  // always include safe nav actions
  actions.push({ label: "Open cart", action: "OPEN_CART" });

  return {
    reply:
      `Alright 🙂 You’re spending most on **${topCat}**.\n\n` +
      lines.slice(0, 5).join("\n") +
      `\n\nIf you tell me your budget, I can make it even tighter.`,
    quickActions: actions.slice(0, 6),
  } satisfies AssistantJSON;
}

/* ---------------- Product recommendations ---------------- */

function recommendProducts(lastUser: string, products: any[]) {
  const budget = detectBudget(lastUser);
  const matches = searchProducts(lastUser, products, 12);

  const picks =
    budget != null ? matches.filter((p) => Number(p.priceGHS) <= budget).slice(0, 4) : matches.slice(0, 4);

  if (!picks.length) {
    return {
      reply:
        budget != null
          ? `I didn’t see a strong match under ${money(budget)} from what we currently have. Tell me what you want exactly (phone? laptop? groceries?) and your priority (battery, camera, storage).`
          : "Tell me what you’re buying and your budget 🙂 (example: “good phone under 2000”)",
      quickActions: toQuickNav(),
    } satisfies AssistantJSON;
  }

  const list = picks.map((p) => `• **${p.name}** — ${money(p.priceGHS)} (${p.category})`).join("\n");

  const actions: QuickAction[] = [
    ...picks.slice(0, 2).map((p) => ({
      label: `Add ${p.name}`,
      action: "ADD_TO_CART" as const,
      payload: { product: p, qty: 1 },
    })),
    { label: "Browse shop", action: "GO_TO", payload: { href: "/mart/shop" } },
    { label: "Open cart", action: "OPEN_CART" },
  ];

  return {
    reply:
      `Here are good options from our shop${budget != null ? ` under ${money(budget)}` : ""}:\n` +
      `${list}\n\n` +
      `Tell me what matters most (cheap, quality, battery, etc.) and I’ll pick the best one 🙂`,
    quickActions: actions.slice(0, 6),
  } satisfies AssistantJSON;
}

/* ---------------- Route ---------------- */

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const messages = (Array.isArray(body?.messages) ? body.messages : []) as Msg[];
    const context = (body?.context ?? {}) as any;

    const lastUser = safeStr([...messages].reverse().find((m) => m.role === "user")?.content).trim();
    const t = lastUser.toLowerCase();

    const products = normalizeProducts(context);

    // 1) Deterministic “Mart brain” (always correct, always safe)

    if (isAskHowItWorks(t)) {
      return NextResponse.json({
        reply:
          "Here’s how Geonest Mart works 🙂\n\n" +
          "1) **Shop** → pick products\n" +
          "2) **Add to cart**\n" +
          "3) **Checkout** → MoMo, Card, or Cash on Delivery\n" +
          "4) We prepare it (Preparing → Processing)\n" +
          "5) Rider delivers (On route → Delivered)\n" +
          "6) Use **Track Order** anytime.",
        quickActions: toQuickNav(),
      } satisfies AssistantJSON);
    }

    if (isAskStatuses(t)) {
      return NextResponse.json({
        reply:
          "These are the order statuses 🙂\n\n" +
          "• **Preparing**: we received your order\n" +
          "• **Processing**: packing / confirming\n" +
          "• **On route**: rider is coming\n" +
          "• **Delivered**: completed",
        quickActions: [{ label: "Track order", action: "TRACK_ORDER" }, { label: "Open cart", action: "OPEN_CART" }],
      } satisfies AssistantJSON);
    }

    if (isAskPayments(t) && !isOptimizeCart(t)) {
      return NextResponse.json({
        reply:
          "Payments are simple 🙂\n\n" +
          "• **Mobile Money / Card**: pay online with Hubtel\n" +
          "• **Cash on delivery**: pay when it arrives\n" +
          "• If you used **manual payment**, submit it in Track Order for admin approval.",
        quickActions: [
          { label: "Checkout", action: "GO_TO", payload: { href: "/mart/checkout" } },
          { label: "Track order", action: "TRACK_ORDER" },
        ],
      } satisfies AssistantJSON);
    }

    if (isAskManualPayment(t)) {
      return NextResponse.json({
        reply:
          "Manual payment verification is when you paid outside the normal checkout 🙂\n\n" +
          "Go to **Track Order**, open your order, then submit the payment details. Admin will approve it after confirmation.",
        quickActions: [{ label: "Track order", action: "TRACK_ORDER" }],
      } satisfies AssistantJSON);
    }

    if (isAskRefundDamage(t)) {
      return NextResponse.json({
        reply:
          "Sorry about that — we’ll sort you out 🙂\n\n" +
          "1) Go to **Track Order**\n" +
          "2) Open your order\n" +
          "3) Report the issue (add a photo if you can)\n\n" +
          "We’ll replace it or arrange a refund depending on the case.",
        quickActions: [{ label: "Track order", action: "TRACK_ORDER" }],
      } satisfies AssistantJSON);
    }

    if (isAskTrack(t)) {
      return NextResponse.json({
        reply:
          "To track your order 🙂\n\n" +
          "• Open **Track Order**\n" +
          "• Use your **order reference** (ORD-…)\n\n" +
          "If you just paid, give it a minute and refresh.",
        quickActions: [{ label: "Track order", action: "TRACK_ORDER" }],
      } satisfies AssistantJSON);
    }

    if (isAskDelivery(t)) {
      return NextResponse.json({
        reply:
          "Delivery depends on your location 🙂\n\n" +
          "Most orders arrive **same day or next day** in Accra areas, but it can vary.\n" +
          "When it shows **On route**, the rider is already moving with it.",
        quickActions: [{ label: "Track order", action: "TRACK_ORDER" }],
      } satisfies AssistantJSON);
    }

    if (isOptimizeCart(t)) {
      return NextResponse.json(optimizeCart(context, products));
    }

    // simple “add it” handling (grounded)
    if (hasAny(t, /add.*cart|add it|buy it now/i)) {
      const top = searchProducts(lastUser, products, 1)[0];
      if (top) {
        return NextResponse.json({
          reply: `Sure 🙂 I can add **${top.name}** to your cart.`,
          quickActions: [
            { label: `Add ${top.name}`, action: "ADD_TO_CART", payload: { product: top, qty: 1 } },
            { label: "Open cart", action: "OPEN_CART" },
          ],
        } satisfies AssistantJSON);
      }
    }

    if (isProductHelp(t)) {
      return NextResponse.json(recommendProducts(lastUser, products));
    }

    // 2) Hybrid layer: LLM for “nice talking”, but grounded with topMatches only
    //    If no API keys, fallback to deterministic helpful reply.

    const topMatches = searchProducts(lastUser, products, 6).map((p) => ({
      id: p.id,
      name: p.name,
      priceGHS: p.priceGHS,
      category: p.category,
      badge: p.badge ?? null,
      tags: Array.isArray(p.tags) ? p.tags.slice(0, 8) : [],
      description: p.description ?? null,
    }));

    const system: Msg = {
      role: "system",
      content:
        "You are Geonest Mart Assistant. Be warm, natural, and helpful.\n" +
        "IMPORTANT: Respond with ONE JSON object only. No extra text.\n\n" +
        'Schema: {"reply": string, "quickActions": QuickAction[]}\n\n' +
        "Rules:\n" +
        "- Never invent products.\n" +
        "- If you recommend, use only products from topMatches.\n" +
        "- Links must be /mart/... and valid.\n" +
        "- Keep it short.\n",
    };

    const ctx: Msg = {
      role: "system",
      content: `Context: ${JSON.stringify({
        page: context?.page ?? null,
        topMatches,
        allowedRoutes: Array.from(ALLOWED_ROUTES),
      })}`,
    };

    const trimmed = messages.slice(-10).filter((m) => m.role !== "system");
    const apiMessages: Msg[] = [system, ctx, ...trimmed];

    const raw = (await callGroq(apiMessages)) || (await callOpenRouter(apiMessages));

    if (!raw) {
      return NextResponse.json({
        reply: "Tell me what you need (and your budget) 🙂",
        quickActions: toQuickNav(),
      } satisfies AssistantJSON);
    }

    const parsed = safeParseJSON<any>(raw, null);

    if (!parsed || typeof parsed !== "object" || typeof parsed.reply !== "string") {
      return NextResponse.json({
        reply: "Tell me what you need (and your budget) 🙂",
        quickActions: toQuickNav(),
      } satisfies AssistantJSON);
    }

    let qa: QuickAction[] = Array.isArray(parsed.quickActions) ? parsed.quickActions : [];
    qa = qa
      .filter((a: any) => a && typeof a.label === "string" && typeof a.action === "string")
      .slice(0, 6)
      .map((a: any) => {
        // sanitize GO_TO links
        if (a.action === "GO_TO") {
          const href = a?.payload?.href;
          if (!isSafeHref(href)) {
            return { label: "Browse shop", action: "GO_TO", payload: { href: "/mart/shop" } } as QuickAction;
          }
        }
        return a as QuickAction;
      });

    return NextResponse.json({
      reply: parsed.reply.trim() || "Tell me what you need (and your budget) 🙂",
      quickActions: qa.length ? qa : toQuickNav(),
    } satisfies AssistantJSON);
  } catch {
    return NextResponse.json({
      reply: "Hmm, something small went wrong. Try again for me 🙂",
      quickActions: [{ label: "Shop", action: "GO_TO", payload: { href: "/mart/shop" } }],
    } satisfies AssistantJSON);
  }
}
