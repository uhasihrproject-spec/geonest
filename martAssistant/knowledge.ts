export type MartAction =
  | { type: "navigate"; to: string }
  | { type: "openCart" }
  | { type: "openProduct"; productId: string }
  | { type: "filterCategory"; category: string }
  | { type: "none" };

export type MartItem = {
  id: string;
  tags: string[];
  questions: string[];
  answer: string;
  action?: MartAction;
};

export const MART_KNOWLEDGE: MartItem[] = [
  {
    id: "delivery",
    tags: ["delivery", "deliver", "shipping", "courier", "how long"],
    questions: ["Do you deliver?", "How long does delivery take?"],
    answer:
      "Yes, we deliver. Delivery time depends on your location in Ghana. If you want, tell me your area and I’ll show the delivery option we use.",
    action: { type: "none" },
  },
  {
    id: "payment",
    tags: ["payment", "pay", "momo", "card", "cash"],
    questions: ["How can I pay?", "Do you accept MoMo?"],
    answer:
      "You can pay with Mobile Money and other options shown at checkout. Want me to take you to checkout?",
    action: { type: "navigate", to: "/mart/checkout" },
  },
  {
    id: "returns",
    tags: ["return", "refund", "exchange"],
    questions: ["Can I return an item?", "Refund policy?"],
    answer:
      "Yes. Items can be returned if they are in original condition. The exact rules are on the Returns page.",
    action: { type: "navigate", to: "/mart/returns" },
  },
];
