export const KNOWLEDGE_BASE = {
  howItWorks: [
    "Browse products on Geonest Mart",
    "Add items to cart",
    "Checkout and choose payment method",
    "Pay via Hubtel or select Cash on Delivery",
    "Track order using reference and phone number",
    "Approve payment after delivery (COD)"
  ],

  payments: {
    methods: [
      "Mobile Money (Hubtel)",
      "Card (Hubtel)",
      "Cash on Delivery",
      "Manual Verification"
    ],
    manualVerification:
      "Manual payments are reviewed by admin before order proceeds."
  },

  tracking: {
    required: ["order reference", "phone number"],
    privacy:
      "Only recent orders linked to the phone number can be viewed."
  },

  refunds: {
    allowedIf:
      "Item is damaged, wrong, or undelivered",
    timeframe: "24–72 hours after verification"
  },

  delivery: {
    eta: "Same day or next day depending on location",
    note: "ETA is an estimate"
  },

  faq: [
    {
      q: "Can I pay cash?",
      a: "Yes. Choose Cash on Delivery during checkout."
    },
    {
      q: "How do I track my order?",
      a: "Use your order reference and phone number on the Track Order page."
    }
  ]
};
