import { NextResponse } from "next/server";
import { processOutboundSyncQueue } from "@/lib/sync/dispatcher";

export async function POST() {
  const result = await processOutboundSyncQueue();
  return NextResponse.json(result);
}
