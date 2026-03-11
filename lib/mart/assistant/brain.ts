import { detectIntent } from "./intents";
import { RESPONSES } from "./responses";
import { extractBudget, recommendFromVisible, compareFromVisible } from "./helpers";

export function runBrain({
  messages,
  context,
}: {
  messages: { role: string; content: string }[];
  context: any;
}) {
  const last = messages[messages.length - 1]?.content || "";
  const intent = detectIntent(last);

  if (intent === "WHAT_TO_BUY") {
    const budget = extractBudget(last);
    return recommendFromVisible(context?.visibleProducts, budget);
  }

  if (intent === "COMPARE_PRODUCTS") {
    return compareFromVisible(context?.visibleProducts, last);
  }

  if (intent === "GREETING") return RESPONSES.greeting;
  if (intent === "HOW_IT_WORKS") return RESPONSES.howItWorks;
  if (intent === "PAYMENT_METHODS") return RESPONSES.payments;
  if (intent === "TRACK_ORDER") return RESPONSES.track;
  if (intent === "DELIVERY") return RESPONSES.delivery;
  if (intent === "REFUND") return RESPONSES.refund;
  if (intent === "MANUAL_PAYMENT") return RESPONSES.manualPayment;

  return RESPONSES.fallback;
}
