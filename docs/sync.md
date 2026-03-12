# Product + Deal Sync (Website repo)

## Environment variables

- `CORE_ADMIN_SYNC_WEBHOOK_URL`: Core admin inbound webhook URL.
- `WEBSITE_SYNC_WEBHOOK_URL`: Website inbound webhook URL (`/api/sync/webhook`).
- `SYNC_SHARED_SECRET`: Shared HMAC secret used by both repos.

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
