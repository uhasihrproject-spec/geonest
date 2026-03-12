import assert from 'node:assert/strict';

const storeMod = await import('../lib/sync/store.ts');
const signMod = await import('../lib/sync/signature.ts');

const {
  upsertProduct,
  upsertDeal,
  createSyncEvent,
  hasEvent,
  markSyncEvent,
  readStore,
  writeStore,
} = storeMod;

writeStore({ products: [], deals: [], sync_events: [], price_history: [] });

// website -> management create/update/deactivate product
upsertProduct({ id: 'p-1', name: 'Rice', sku: 'SKU-RICE', price: 30, is_active: true }, 'website');
createSyncEvent({ entity_type: 'product', entity_id: 'p-1', action: 'created', source: 'website', payload: { id: 'p-1' } });
upsertProduct({ id: 'p-1', name: 'Rice', sku: 'SKU-RICE', price: 35, is_active: true }, 'website');
createSyncEvent({ entity_type: 'product', entity_id: 'p-1', action: 'updated', source: 'website', payload: { id: 'p-1', price: 35 } });
upsertProduct({ id: 'p-1', name: 'Rice', sku: 'SKU-RICE', price: 35, is_active: false }, 'website');
createSyncEvent({ entity_type: 'product', entity_id: 'p-1', action: 'deactivated', source: 'website', payload: { id: 'p-1' } });

// deals mirror flow
upsertDeal({ id: 'd-1', product_id: 'p-1', title: 'flash', discount_type: 'fixed', discount_value: 5, starts_at: new Date().toISOString(), ends_at: null, is_active: true });
createSyncEvent({ entity_type: 'deal', entity_id: 'd-1', action: 'created', source: 'website', payload: { id: 'd-1' } });
upsertDeal({ id: 'd-1', product_id: 'p-1', title: 'weekly', discount_type: 'fixed', discount_value: 3, starts_at: new Date().toISOString(), ends_at: null, is_active: true });
createSyncEvent({ entity_type: 'deal', entity_id: 'd-1', action: 'updated', source: 'website', payload: { id: 'd-1' } });
upsertDeal({ id: 'd-1', product_id: 'p-1', title: 'weekly', discount_type: 'fixed', discount_value: 3, starts_at: new Date().toISOString(), ends_at: null, is_active: false });
createSyncEvent({ entity_type: 'deal', entity_id: 'd-1', action: 'deactivated', source: 'website', payload: { id: 'd-1' } });

// management -> website idempotent / dedupe
const inboundEventId = 'core-evt-1';
assert.equal(hasEvent(inboundEventId), false);
createSyncEvent({ event_id: inboundEventId, entity_type: 'product', entity_id: 'p-2', action: 'created', source: 'core_admin', payload: { id: 'p-2' } });
assert.equal(hasEvent(inboundEventId), true);
createSyncEvent({ event_id: inboundEventId, entity_type: 'product', entity_id: 'p-2', action: 'created', source: 'core_admin', payload: { id: 'p-2' } });

// retry handling state
markSyncEvent(inboundEventId, { status: 'failed', retries: 2, last_error: 'timeout', next_retry_at: new Date().toISOString() });

// signature verification
const body = JSON.stringify({ event_id: 'x' });
const sig = signMod.signPayload(body, 'secret');
assert.equal(signMod.verifySignature(body, sig, 'secret'), true);
assert.equal(signMod.verifySignature(body, sig, 'wrong'), false);

const store = readStore();
assert.ok(store.price_history.length >= 1, 'price history should be written on price change');
assert.equal(store.sync_events.filter((e) => e.event_id === inboundEventId).length, 1, 'event dedupe failed');
assert.equal(store.products.find((p) => p.id === 'p-1')?.is_active, false, 'soft delete should mark inactive');
assert.equal(store.deals.find((d) => d.id === 'd-1')?.is_active, false, 'deal deactivate should mark inactive');

console.log('sync validation passed');
