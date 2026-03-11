"use client";

import React, { createContext, useContext, useMemo, useState } from "react";

type AssistantEvent =
  | { type: "add_to_cart"; productName: string }
  | { type: "buy_now"; productName: string }
  | { type: "view_product"; productName: string }
  | { type: "open_cart" }
  | { type: "checkout" };

type MartAssistantState = {
  messages: { from: "user" | "bot"; text: string }[];
  pushBot: (text: string) => void;
  pushUser: (text: string) => void;
  onEvent: (event: AssistantEvent) => void;
};

const Ctx = createContext<MartAssistantState | null>(null);

export function MartAssistantProvider({ children }: { children: React.ReactNode }) {
  const [messages, setMessages] = useState<MartAssistantState["messages"]>([
    { from: "bot", text: "Hi! I’m your Geonest Mart assistant. Need help shopping?" },
  ]);

  const pushBot = (text: string) =>
    setMessages((m) => [...m, { from: "bot", text }]);

  const pushUser = (text: string) =>
    setMessages((m) => [...m, { from: "user", text }]);

  const onEvent = (event: AssistantEvent) => {
    if (event.type === "add_to_cart") {
      pushBot(`✅ Added "${event.productName}". Want to checkout or keep shopping?`);
      return;
    }
    if (event.type === "buy_now") {
      pushBot(`Great. You’re buying "${event.productName}". I can take you to checkout.`);
      return;
    }
    if (event.type === "view_product") {
      pushBot(`You’re viewing "${event.productName}". Want similar items or accessories?`);
      return;
    }
    if (event.type === "open_cart") {
      pushBot("Here’s your cart. Want to remove anything or proceed to checkout?");
      return;
    }
    if (event.type === "checkout") {
      pushBot("Checkout time ✅. Make sure your delivery location and payment method are correct.");
      return;
    }
  };

  const value = useMemo(
    () => ({ messages, pushBot, pushUser, onEvent }),
    [messages]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useMartAssistant() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useMartAssistant must be used inside MartAssistantProvider");
  return ctx;
}
