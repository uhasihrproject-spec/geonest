export type Intent =
  | "GREETING"
  | "HOW_IT_WORKS"
  | "PAYMENT_METHODS"
  | "TRACK_ORDER"
  | "REFUND"
  | "DELIVERY"
  | "MANUAL_PAYMENT"
  | "PAYMENT_STATUS"
  | "WHAT_TO_BUY"
  | "COMPARE_PRODUCTS"
  | "UNKNOWN";

export function detectIntent(text: string): Intent {
  const t = (text || "").toLowerCase();

  if (/(^|\s)(hi|hello|hey|yo)(\s|$)/.test(t)) return "GREETING";
  if (/how.+(work|order|buy|shop)|process|steps/.test(t)) return "HOW_IT_WORKS";
  if (/pay|payment|momo|mobile money|card|cash|hubtel/.test(t)) return "PAYMENT_METHODS";
  if (/track|where.+order|order status|delivery status/.test(t)) return "TRACK_ORDER";
  if (/refund|return|cancel/.test(t)) return "REFUND";
  if (/delivery|arrive|eta|when/.test(t)) return "DELIVERY";
  if (/manual|proof|verification|verify/.test(t)) return "MANUAL_PAYMENT";
  if (/paid|payment status|has it gone through|deducted/.test(t)) return "PAYMENT_STATUS";
  if (/what.*buy|recommend|suggest|best.*for|which.*should/i.test(t)) return "WHAT_TO_BUY";
  if (/compare|vs|difference|better than/.test(t)) return "COMPARE_PRODUCTS";

  return "UNKNOWN";
}
