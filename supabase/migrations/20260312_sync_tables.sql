create table if not exists products (
  id text primary key,
  name text not null,
  sku text not null,
  price numeric not null,
  is_active boolean not null default true,
  updated_at timestamptz not null default now(),
  source_system text not null check (source_system in ('website','core_admin')),
  external_ref text
);

create table if not exists deals (
  id text primary key,
  product_id text not null references products(id),
  title text not null,
  discount_type text not null check (discount_type in ('percent','fixed')),
  discount_value numeric not null,
  starts_at timestamptz not null,
  ends_at timestamptz,
  is_active boolean not null default true,
  updated_at timestamptz not null default now()
);

create table if not exists sync_events (
  event_id text primary key,
  entity_type text not null check (entity_type in ('product','deal')),
  entity_id text not null,
  action text not null check (action in ('created','updated','deactivated')),
  source text not null check (source in ('website','core_admin')),
  payload jsonb not null,
  status text not null check (status in ('pending','processing','done','failed')),
  retries integer not null default 0,
  last_error text,
  next_retry_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists price_history (
  id text primary key,
  product_id text not null references products(id),
  old_price numeric not null,
  new_price numeric not null,
  source text not null check (source in ('website','core_admin')),
  changed_at timestamptz not null default now()
);
