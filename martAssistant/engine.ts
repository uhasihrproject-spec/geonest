import Fuse from "fuse.js";
import { MART_KNOWLEDGE, MartItem } from "./knowledge";

const fuse = new Fuse(MART_KNOWLEDGE, {
  threshold: 0.35,
  keys: ["tags", "questions", "answer"],
});

export function getMartReply(input: string): { item?: MartItem; reply: string } {
  const text = input.trim();
  if (!text) return { reply: "Ask me anything about Geonest Mart." };

  const res = fuse.search(text);
  const top = res[0]?.item;

  if (!top) {
    return {
      reply:
        "I don’t have that saved yet. Add it to martAssistant/knowledge.ts and I’ll answer it next time.",
    };
  }

  return { item: top, reply: top.answer };
}
