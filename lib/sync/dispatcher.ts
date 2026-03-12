import { listDueSyncEvents, markSyncEvent } from "@/lib/sync/store";
import { signPayload } from "@/lib/sync/signature";

const MAX_RETRIES = 5;

function retryDelayMs(retries: number) {
  return Math.min(60_000, 1000 * 2 ** retries);
}

export async function processOutboundSyncQueue() {
  const target = process.env.MANAGEMENT_WEBHOOK_URL || process.env.CORE_ADMIN_SYNC_WEBHOOK_URL;
  const secret = process.env.SYNC_SHARED_SECRET;
  if (!target || !secret) {
    return { processed: 0, skipped: true, reason: "Missing MANAGEMENT_WEBHOOK_URL (or CORE_ADMIN_SYNC_WEBHOOK_URL) or SYNC_SHARED_SECRET" };
  }

  const due = listDueSyncEvents().filter((e) => e.source === "website");
  let processed = 0;

  for (const event of due) {
    processed += 1;
    markSyncEvent(event.event_id, { status: "processing" });
    const body = JSON.stringify({ ...event, emitted_at: new Date().toISOString() });

    try {
      const res = await fetch(target, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-sync-signature": signPayload(body, secret),
          "x-sync-event-id": event.event_id,
        },
        body,
      });

      if (!res.ok) {
        throw new Error(`Webhook returned ${res.status}`);
      }

      markSyncEvent(event.event_id, { status: "done", last_error: null, next_retry_at: null });
    } catch (error) {
      const retries = event.retries + 1;
      markSyncEvent(event.event_id, {
        status: retries >= MAX_RETRIES ? "failed" : "pending",
        retries,
        last_error: error instanceof Error ? error.message : "Unknown sync error",
        next_retry_at: new Date(Date.now() + retryDelayMs(retries)).toISOString(),
      });
    }
  }

  return { processed, skipped: false };
}
