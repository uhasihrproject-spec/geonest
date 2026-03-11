import { NextResponse } from "next/server";
import { FEATURED_PRODUCTS } from "@/lib/mart/data";

export async function GET() {
  // Later: swap for DB query (Prisma/Supabase/etc.)
  return NextResponse.json({ products: FEATURED_PRODUCTS });
}
