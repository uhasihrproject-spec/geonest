# Product + Deal Sync (Website repo)

## Environment variables

### Website repo
- `SUPABASE_URL` (or `NEXT_PUBLIC_SUPABASE_URL`)
- `SUPABASE_SERVICE_ROLE_KEY` (server only)
- `SYNC_SHARED_SECRET`
- `MANAGEMENT_WEBHOOK_URL` (preferred; fallback: `CORE_ADMIN_SYNC_WEBHOOK_URL`)

### Management repo
- `SYNC_SHARED_SECRET`
- `WEBSITE_SYNC_WEBHOOK_URL` (this repo inbound endpoint: `/api/sync/webhook`)

## Webhook payload example

```json
{
  "event_id": "evt_01",
  "entity_type": "product",
  "entity_id": "prod_123",
  "action": "updated",
  "source": "website",
  "payload": {
    "id": "prod_123",
    "name": "Rice 5kg",
    "sku": "RICE-5KG",
    "price": 145,
    "is_active": true,
    "updated_at": "2026-03-12T10:01:05.999Z",
    "source_system": "website",
    "external_ref": null
  }
}
```

## Deal payload example

```json
{
  "event_id": "evt_02",
  "entity_type": "deal",
  "entity_id": "deal_123",
  "action": "created",
  "source": "core_admin",
  "payload": {
    "id": "deal_123",
    "product_id": "prod_123",
    "title": "flash",
    "discount_type": "percent",
    "discount_value": 15,
    "starts_at": "2026-03-12T10:01:05.999Z",
    "ends_at": "2026-03-13T10:01:05.999Z",
    "is_active": true,
    "updated_at": "2026-03-12T10:01:05.999Z"
  }
}
```
