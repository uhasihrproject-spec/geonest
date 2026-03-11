import type { Metadata } from "next";
import MartShell from "@/components/mart/MartShell";

export const metadata: Metadata = {
  title: "Geonest Mart",
  description: "Modern e-commerce with a smart shopping assistant.",
};

export default function MartLayout({ children }: { children: React.ReactNode }) {
  return <MartShell>{children}</MartShell>;
}
