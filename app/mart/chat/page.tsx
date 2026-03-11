"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Sparkles, Flame, Clock, Shuffle } from "lucide-react";
import { askAssistant, openAssistant } from "@/lib/mart/assistant/controller";

/* ---------------- STORAGE KEYS ---------------- */

const KEY_TAPS_TODAY = "gm_assistant_taps_today_v1";
const KEY_TAPS_DATE = "gm_assistant_taps_date_v1";
const KEY_RECENT = "gm_assistant_recent_v1";
const KEY_DAILY_SEED = "gm_assistant_daily_seed_v1";
const KEY_DAILY_SEED_DATE = "gm_assistant_daily_seed_date_v1";

/* ---------------- RECOMMENDED QUESTIONS BANK ---------------- */

const BANK = {
  shopping: [
    "What should I buy today?",
    "Recommend products under 2000 GHS",
    "Recommend products under 500 GHS",
    "What are the best products for students?",
    "Suggest something affordable and reliable",
    "Help me choose between two products",
    "Which product gives the best value for money?",
    "What should I buy as a gift?",
    "What products are trending right now?",
    "Recommend something for home essentials",
  ],

  products: [
    "Why should I buy this product?",
    "Is this product worth the price?",
    "Compare this product with others",
    "What are the pros and cons of this item?",
    "Which one lasts longer?",
    "What’s the difference between these two products?",
    "Which one is better for my budget?",
    "Give me the best option and why",
  ],

  payment: [
    "How do I pay on Geonest Mart?",
    "How does Hubtel payment work?",
    "Can I pay with Mobile Money?",
    "Can I pay with card?",
    "Can I pay cash on delivery?",
    "I chose cash but want to pay now",
    "What is manual payment verification?",
    "How do I know my payment was successful?",
    "My payment failed — what should I do?",
  ],

  orders: [
    "How do I track my order?",
    "What do I need to track my order?",
    "Where is my order now?",
    "My order says processing — what does that mean?",
    "What does ‘on route’ mean?",
    "What does ‘preparing’ mean?",
    "My order is delayed — what next?",
    "How do I cancel an order?",
  ],

  delivery: [
    "When will my order arrive?",
    "How long does delivery take?",
    "Do you deliver the same day?",
    "Does delivery depend on my location?",
    "Who delivers my order?",
    "Can I change my delivery location?",
    "Can I schedule delivery time?",
  ],

  refunds: [
    "Can I return an item?",
    "How do refunds work?",
    "What if I received the wrong item?",
    "What if my item is damaged?",
    "How long does a refund take?",
    "My package never arrived — what should I do?",
  ],

  help: [
    "Explain how Geonest Mart works",
    "I’m new here — help me get started",
    "What can you help me with?",
    "Talk to me like a human assistant",
    "Give me a quick guide to shopping here",
  ],
} as const;

/* ---------------- HELPERS ---------------- */

function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
}

function getQueryParam(name: string) {
  if (typeof window === "undefined") return "";
  return new URLSearchParams(window.location.search).get(name) || "";
}

function stableDailySeed(): number {
  // stable seed per day (so "daily shuffle" is consistent for the same day)
  const t = todayKey();
  try {
    const savedDate = localStorage.getItem(KEY_DAILY_SEED_DATE);
    const savedSeed = localStorage.getItem(KEY_DAILY_SEED);

    if (savedDate === t && savedSeed) return Number(savedSeed);

    const seed = Math.floor(Math.random() * 1_000_000_000);
    localStorage.setItem(KEY_DAILY_SEED_DATE, t);
    localStorage.setItem(KEY_DAILY_SEED, String(seed));
    return seed;
  } catch {
    return Math.floor(Math.random() * 1_000_000_000);
  }
}

function seededShuffle<T>(arr: T[], seed: number) {
  // deterministic shuffle (simple LCG)
  const a = [...arr];
  let s = seed % 2147483647;
  const rand = () => (s = (s * 48271) % 2147483647) / 2147483647;

  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function flattenBank() {
  const all: { section: string; q: string }[] = [];
  Object.entries(BANK).forEach(([section, qs]) => {
    qs.forEach((q) => all.push({ section, q }));
  });
  return all;
}

function readJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJSON(key: string, value: any) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

/* ---------------- COMPONENT ---------------- */

export default function MartChatPage() {
  const [ready, setReady] = useState(false);
  const [recent, setRecent] = useState<string[]>([]);
  const [tapCounts, setTapCounts] = useState<Record<string, number>>({});
  const [refreshTick, setRefreshTick] = useState(0);

  // context-aware topic from URL
  // examples:
  // /mart/chat?topic=payment
  // /mart/chat?topic=delivery
  // /mart/chat?from=checkout
  const topic = useMemo(() => {
    const t = getQueryParam("topic").toLowerCase();
    if (t && (BANK as any)[t]) return t;
    return "";
  }, [refreshTick]);

  const from = useMemo(() => getQueryParam("from").toLowerCase(), [refreshTick]);

  useEffect(() => {
    setReady(true);
    openAssistant();

    // Load recent + taps, reset taps if date changed
    const t = todayKey();
    try {
      const storedDate = localStorage.getItem(KEY_TAPS_DATE);
      if (storedDate !== t) {
        localStorage.setItem(KEY_TAPS_DATE, t);
        localStorage.setItem(KEY_TAPS_TODAY, JSON.stringify({}));
      }
    } catch {}

    setTapCounts(readJSON(KEY_TAPS_TODAY, {}));
    setRecent(readJSON(KEY_RECENT, []));

    // Ensure memos use updated search params
    setRefreshTick((x) => x + 1);
  }, []);

  function recordTap(q: string) {
    // update most asked today
    const updated = { ...tapCounts, [q]: (tapCounts[q] || 0) + 1 };
    setTapCounts(updated);
    writeJSON(KEY_TAPS_TODAY, updated);

    // update recent last 3
    const nextRecent = [q, ...recent.filter((x) => x !== q)].slice(0, 3);
    setRecent(nextRecent);
    writeJSON(KEY_RECENT, nextRecent);
  }

  function ask(q: string) {
    recordTap(q);
    askAssistant(q, { page: "/mart/chat", topic: topic || undefined, from: from || undefined });
  }

  /* ---------------- (1) DAILY SHUFFLE ---------------- */
  const dailyQuestions = useMemo(() => {
    const seed = stableDailySeed();
    const all = flattenBank();

    // Context-aware weighting:
    // if a topic is set, show that section first.
    const prioritized = topic
      ? [
          ...all.filter((x) => x.section === topic),
          ...all.filter((x) => x.section !== topic),
        ]
      : all;

    // If coming from checkout/cart, prioritize payment/orders naturally
    const fromBoost =
      from.includes("checkout") || from.includes("cart") || from.includes("pay")
        ? [
            ...prioritized.filter((x) => x.section === "payment"),
            ...prioritized.filter((x) => x.section === "orders"),
            ...prioritized.filter((x) => x.section !== "payment" && x.section !== "orders"),
          ]
        : prioritized;

    // time-of-day gentle hint (morning: shopping, evening: delivery/orders)
    const hour = new Date().getHours();
    const timeBoost =
      hour < 12
        ? [
            ...fromBoost.filter((x) => x.section === "shopping"),
            ...fromBoost.filter((x) => x.section !== "shopping"),
          ]
        : [
            ...fromBoost.filter((x) => x.section === "orders" || x.section === "delivery"),
            ...fromBoost.filter((x) => x.section !== "orders" && x.section !== "delivery"),
          ];

    const shuffled = seededShuffle(timeBoost, seed);

    // pick 40 daily suggestions
    return shuffled.slice(0, 40);
  }, [topic, from]);

  /* ---------------- (2) MOST ASKED TODAY ---------------- */
  const mostAskedToday = useMemo(() => {
    const entries = Object.entries(tapCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([q]) => q);
    return entries;
  }, [tapCounts]);

  function refreshDaily() {
    // refresh by resetting seed (still “daily”, but user can reshuffle on demand)
    try {
      localStorage.removeItem(KEY_DAILY_SEED);
      localStorage.removeItem(KEY_DAILY_SEED_DATE);
    } catch {}
    setRefreshTick((x) => x + 1);
  }

  return (
    <div className="py-10">
      <div className="mx-auto max-w-5xl px-4">
        {/* HEADER */}
        <div className="flex items-center justify-between gap-3">
          <Link
            href="/mart"
            className="inline-flex items-center gap-2 rounded-full bg-neutral-100 px-4 py-2 text-sm hover:bg-neutral-200 transition"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Mart
          </Link>

          <div className="flex items-center gap-2">
            <button
              onClick={refreshDaily}
              className="inline-flex items-center gap-2 rounded-full bg-neutral-100 px-4 py-2 text-sm hover:bg-neutral-200 transition"
              title="Shuffle suggestions"
            >
              <Shuffle className="h-4 w-4" />
              Shuffle
            </button>

            <button
              onClick={() =>
                ask(
                  "Hi Assistant — explain how Geonest Mart works from shopping to payment and delivery."
                )
              }
              className="inline-flex items-center gap-2 rounded-full bg-black px-4 py-2 text-sm text-white hover:bg-black/90 transition"
            >
              <Sparkles className="h-4 w-4" />
              Start guide
            </button>
          </div>
        </div>

        {/* HERO */}
        <div className="mt-6 rounded-[32px] bg-white ring-1 ring-neutral-200/70 p-6">
          <p className="text-xs tracking-[0.35em] text-neutral-500">CHAT</p>
          <h1 className="mt-2 text-2xl md:text-4xl font-semibold tracking-tight">
            Geonest Mart Assistant
          </h1>
          <p className="mt-2 text-neutral-600">
            Tap a question to instantly start chatting. Suggestions refresh daily and adapt to what you’re doing.
          </p>

          <div className="mt-4 rounded-2xl bg-neutral-50/60 p-4 text-sm text-neutral-700">
            {ready
              ? "Your assistant widget is open at the bottom-right. Tap a question below to continue instantly."
              : "Loading chat…"}
          </div>

          {/* (4) RECENT (LAST 3) */}
          {recent.length > 0 && (
            <div className="mt-6">
              <div className="mb-2 flex items-center gap-2 text-sm font-semibold">
                <Clock className="h-4 w-4 text-neutral-500" />
                Recent
              </div>
              <div className="flex flex-wrap gap-2">
                {recent.map((q) => (
                  <button
                    key={q}
                    onClick={() => ask(q)}
                    className="rounded-full bg-neutral-100 px-4 py-2 text-xs hover:bg-neutral-200 transition"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* (2) MOST ASKED TODAY */}
          {mostAskedToday.length > 0 && (
            <div className="mt-6">
              <div className="mb-2 flex items-center gap-2 text-sm font-semibold">
                <Flame className="h-4 w-4 text-red-600" />
                Most asked today
              </div>
              <div className="flex flex-wrap gap-2">
                {mostAskedToday.map((q) => (
                  <button
                    key={q}
                    onClick={() => ask(q)}
                    className="rounded-full bg-neutral-100 px-4 py-2 text-xs hover:bg-neutral-200 transition"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* (1) DAILY RANDOMIZED SUGGESTIONS (40) + (3) CONTEXT-AWARE */}
          <div className="mt-8">
            <div className="mb-3 flex items-center justify-between gap-2">
              <div className="text-sm font-semibold">
                Recommended questions {topic ? `· ${topic}` : ""}
              </div>
              <div className="text-xs text-neutral-500">
                {dailyQuestions.length} suggestions
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {dailyQuestions.map((item) => (
                <button
                  key={`${item.section}-${item.q}`}
                  onClick={() => ask(item.q)}
                  className="rounded-full bg-neutral-100 px-4 py-2 text-xs hover:bg-neutral-200 transition"
                  title={item.section}
                >
                  {item.q}
                </button>
              ))}
            </div>

            <div className="mt-4 text-xs text-neutral-500">
              Tip: You can deep-link topics like{" "}
              <span className="font-medium">/mart/chat?topic=payment</span> or{" "}
              <span className="font-medium">/mart/chat?from=checkout</span>.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
