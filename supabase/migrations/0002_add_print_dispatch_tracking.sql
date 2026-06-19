alter table public.purchase_orders
  add column if not exists dispatch_email_sent_at timestamptz,
  add column if not exists tracking_carrier text,
  add column if not exists tracking_number text,
  add column if not exists tracking_url text;

create index if not exists purchase_orders_printful_order_id_idx
  on public.purchase_orders(printful_order_id);
