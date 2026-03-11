export function extractBudget(text: string): number | null {
  const match = (text || "").match(/(\d{3,6})/);
  return match ? Number(match[1]) : null;
}

export function recommendFromVisible(products: any[], budget?: number | null) {
  const list = Array.isArray(products) ? products : [];
  if (!list.length) {
    return {
      reply:
        "I can recommend, but I don’t see any products on this page yet. Open the shop and try again.",
      quickActions: [{ label: "Open shop", action: "GO_TO", payload: { href: "/mart/shop" } }],
    };
  }

  const filtered = budget ? list.filter((p) => p.priceGHS <= budget) : list;
  const top = [...filtered].sort((a, b) => a.priceGHS - b.priceGHS).slice(0, 3);

  if (!top.length) {
    return {
      reply: "I couldn’t find anything within that budget from what you’re viewing.",
      quickActions: [{ label: "Change filters", action: "GO_TO", payload: { href: "/mart/shop" } }],
    };
  }

  return {
    reply:
      "Based on what you’re viewing, here are strong picks:\n\n" +
      top.map((p) => `• ${p.name} — GHS ${p.priceGHS}`).join("\n") +
      "\n\nTell me what matters most: price, quality, or brand?",
    quickActions: top.map((p) => ({
      label: `Ask about ${p.name}`,
      action: "GO_TO",
      payload: { href: "/mart/shop?q=" + encodeURIComponent(p.name) },
    })),
  };
}

export function compareFromVisible(products: any[], message: string) {
  const list = Array.isArray(products) ? products : [];
  if (list.length < 2) {
    return {
      reply: "I need at least two products visible to compare. Try opening a category with multiple items.",
      quickActions: [{ label: "Open shop", action: "GO_TO", payload: { href: "/mart/shop" } }],
    };
  }

  const [a, b] = list.slice(0, 2);

  return {
    reply:
      `Here’s a quick comparison:\n\n` +
      `${a.name} — GHS ${a.priceGHS}\n• Best if you want value for money\n\n` +
      `${b.name} — GHS ${b.priceGHS}\n• Best if you want a different feature focus\n\n` +
      `What matters more to you: price, performance, or features?`,
    quickActions: [
      { label: "Ask about first item", action: "GO_TO", payload: { href: "/mart/shop?q=" + encodeURIComponent(a.name) } },
      { label: "Ask about second item", action: "GO_TO", payload: { href: "/mart/shop?q=" + encodeURIComponent(b.name) } },
    ],
  };
}
