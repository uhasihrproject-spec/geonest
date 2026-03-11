"use client";

import React from "react";
import { useMartAssistant } from "@/martAssistant/store";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  assistantEvent?:
    | { type: "add_to_cart"; productName: string }
    | { type: "buy_now"; productName: string }
    | { type: "view_product"; productName: string }
    | { type: "open_cart" }
    | { type: "checkout" };
};

export default function SmartButton({ assistantEvent, onClick, ...props }: Props) {
  const { onEvent } = useMartAssistant();

  return (
    <button
      {...props}
      onClick={(e) => {
        onClick?.(e);
        if (assistantEvent) onEvent(assistantEvent);
      }}
    />
  );
}
