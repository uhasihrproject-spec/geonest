"use client";

import { enrichAssistantContext } from "./enrichContext";

type Payload =
  | { type: "OPEN" }
  | { type: "CLOSE" }
  | { type: "TOGGLE" }
  | { type: "ASK"; message: string; context?: any }
  | { type: "SYNC"; open?: boolean };

const CHANNEL = "geonest-mart-assistant";

function emit(payload: Payload) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(CHANNEL, { detail: payload }));
}

export function openAssistant() {
  emit({ type: "OPEN" });
}

export function closeAssistant() {
  emit({ type: "CLOSE" });
}

export function toggleAssistant() {
  emit({ type: "TOGGLE" });
}

export function askAssistant(message: string, context?: any) {
  // ✅ always attach products (so it works everywhere)
  const enriched = enrichAssistantContext(context || {});
  emit({ type: "OPEN" });
  emit({ type: "ASK", message, context: enriched });
}

export function subscribeAssistant(handler: (payload: Payload) => void) {
  const listener = (e: Event) => {
    const ce = e as CustomEvent<Payload>;
    handler(ce.detail);
  };
  window.addEventListener(CHANNEL, listener);
  return () => window.removeEventListener(CHANNEL, listener);
}
