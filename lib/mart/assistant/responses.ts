export const RESPONSES = {
  greeting: {
    reply:
      "Hi 👋 Welcome to Geonest Mart. Tell me what you need: products, payment, or tracking.",
    quickActions: [
      { label: "Shop", action: "GO_TO", payload: { href: "/mart/shop" } },
      { label: "Cart", action: "OPEN_CART" },
      { label: "Track order", action: "TRACK_ORDER" },
    ],
  },

  howItWorks: {
    reply:
      "How Geonest Mart works:\n\n1) Browse products\n2) Add to cart\n3) Checkout\n4) Pay via Hubtel (MoMo/Card) or choose Cash on Delivery\n5) Track with order reference + phone\n6) Receive delivery\n7) For cash: approve payment after delivery\n\nWhich step are you on?",
    quickActions: [
      { label: "Open shop", action: "GO_TO", payload: { href: "/mart/shop" } },
      { label: "Checkout", action: "GO_TO", payload: { href: "/mart/checkout" } },
      { label: "Track order", action: "TRACK_ORDER" },
    ],
  },

  payments: {
    reply:
      "Payment options:\n• Mobile Money (Hubtel)\n• Card (Hubtel)\n• Cash on Delivery\n• Manual verification (admin confirms)\n\nOnline payment is confirmed only when your status shows PAID.",
    quickActions: [
      { label: "Checkout", action: "GO_TO", payload: { href: "/mart/checkout" } },
      { label: "Track order", action: "TRACK_ORDER" },
    ],
  },

  manualPayment: {
    reply:
      "Manual payment means you claim you’ve paid and admin must verify.\n\nSteps:\n1) Go to Manual Payment\n2) Submit note/transaction info\n3) Status becomes “Under verification”\n4) Admin confirms → status becomes PAID",
    quickActions: [
      { label: "Track order", action: "TRACK_ORDER" },
    ],
  },

  track: {
    reply:
      "To track your order, you need:\n• Order reference\n• Phone number confirmation\n\nOpen Track Order and pick from your recent references.",
    quickActions: [
      { label: "Open Track Order", action: "TRACK_ORDER" },
    ],
  },

  delivery: {
    reply:
      "Delivery is estimated based on location. Many orders arrive same day or next day, but it depends.\n\nIf your status is “On route”, it means the rider is moving with it.",
    quickActions: [
      { label: "Track order", action: "TRACK_ORDER" },
    ],
  },

  refund: {
    reply:
      "Refunds/returns apply when:\n• Item is damaged\n• Wrong item delivered\n• Delivery failed\n\nTell me your order reference and what happened.",
    quickActions: [
      { label: "Track order", action: "TRACK_ORDER" },
    ],
  },

  fallback: {
    reply:
      "I can help with products, payments, delivery, and tracking. What exactly do you want to do?",
    quickActions: [
      { label: "Shop", action: "GO_TO", payload: { href: "/mart/shop" } },
      { label: "Track", action: "TRACK_ORDER" },
      { label: "Payment help", action: "GO_TO", payload: { href: "/mart/checkout" } },
    ],
  },
} as const;
