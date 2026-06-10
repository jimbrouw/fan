create table if not exists public.capture_sessions (
  id uuid primary key,
  user_id uuid references auth.users(id) on delete set null,
  status text not null check (status in ('capturing', 'ready', 'generating', 'complete', 'failed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  avatar_url text,
  provider text not null default 'google',
  credits integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.user_notification_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email_enabled boolean not null default true,
  push_enabled boolean not null default false,
  web_push_subscription jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.captures (
  id uuid primary key,
  session_id uuid not null references public.capture_sessions(id) on delete cascade,
  type text not null,
  image_url text not null,
  validation_status text not null,
  validation_results jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (session_id, type)
);

create table if not exists public.generation_jobs (
  id uuid primary key,
  session_id uuid not null references public.capture_sessions(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  team_name text not null,
  kit_notes text not null,
  target_poster_url text not null,
  provider_job_id text,
  status text not null check (status in ('queued', 'processing', 'completed', 'failed')),
  output_url text,
  error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.video_jobs (
  id uuid primary key,
  generation_job_id uuid not null references public.generation_jobs(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  source_poster_url text not null,
  provider text not null,
  provider_job_id text,
  status text not null check (status in ('queued', 'processing', 'completed', 'failed')),
  output_url text,
  error text,
  duration_seconds integer not null default 4,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.purchase_orders (
  stripe_session_id text primary key,
  generation_job_id uuid not null references public.generation_jobs(id) on delete cascade,
  option_id text not null,
  status text not null check (status in ('processing', 'fulfilled', 'failed')),
  amount_total integer,
  currency text,
  customer_email text,
  customer_message text,
  printful_order_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.credit_purchases (
  stripe_session_id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  credits integer not null,
  amount_total integer,
  currency text,
  created_at timestamptz not null default now()
);

create table if not exists public.notifications (
  id uuid primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  event_key text not null unique,
  channel text not null check (channel in ('in_app', 'email', 'push')),
  type text not null check (type in ('image_completed', 'image_failed', 'video_completed', 'video_failed')),
  title text not null,
  body text not null,
  action_url text,
  read_at timestamptz,
  sent_at timestamptz,
  error text,
  created_at timestamptz not null default now()
);

create table if not exists public.generation_analytics (
  id uuid primary key default gen_random_uuid(),
  generation_job_id uuid not null references public.generation_jobs(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  team_name text,
  kit_variant text,
  poster_style text,
  model text,
  status text not null check (status in ('processing', 'completed', 'failed')),
  duration_seconds integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists captures_session_id_idx on public.captures(session_id);
create index if not exists capture_sessions_user_id_idx on public.capture_sessions(user_id);
create index if not exists generation_jobs_session_id_idx on public.generation_jobs(session_id);
create index if not exists generation_jobs_user_id_idx on public.generation_jobs(user_id);
create index if not exists generation_jobs_provider_job_id_idx on public.generation_jobs(provider_job_id);
create index if not exists video_jobs_generation_job_id_idx on public.video_jobs(generation_job_id);
create index if not exists video_jobs_user_id_idx on public.video_jobs(user_id);
create index if not exists video_jobs_provider_job_id_idx on public.video_jobs(provider_job_id);
create index if not exists purchase_orders_generation_job_id_idx on public.purchase_orders(generation_job_id);
create index if not exists credit_purchases_user_id_idx on public.credit_purchases(user_id);
create index if not exists notifications_user_id_created_at_idx on public.notifications(user_id, created_at desc);
create index if not exists generation_analytics_created_at_idx on public.generation_analytics(created_at desc);
create index if not exists generation_analytics_team_name_idx on public.generation_analytics(team_name);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Atomically spend one credit. Returns the new balance, or null if the
-- user had no credits to spend. Guards against negative balances.
create or replace function public.consume_user_credit(p_user_id uuid)
returns integer
language sql
as $$
  update public.users
  set credits = credits - 1
  where id = p_user_id and credits > 0
  returning credits;
$$;

-- Atomically grant credits after a successful purchase. Returns the new balance.
create or replace function public.add_user_credits(p_user_id uuid, p_amount integer)
returns integer
language sql
as $$
  update public.users
  set credits = credits + p_amount
  where id = p_user_id
  returning credits;
$$;

drop trigger if exists set_capture_sessions_updated_at on public.capture_sessions;
create trigger set_capture_sessions_updated_at
before update on public.capture_sessions
for each row execute function public.set_updated_at();

drop trigger if exists set_users_updated_at on public.users;
create trigger set_users_updated_at
before update on public.users
for each row execute function public.set_updated_at();

drop trigger if exists set_user_notification_preferences_updated_at on public.user_notification_preferences;
create trigger set_user_notification_preferences_updated_at
before update on public.user_notification_preferences
for each row execute function public.set_updated_at();

drop trigger if exists set_captures_updated_at on public.captures;
create trigger set_captures_updated_at
before update on public.captures
for each row execute function public.set_updated_at();

drop trigger if exists set_generation_jobs_updated_at on public.generation_jobs;
create trigger set_generation_jobs_updated_at
before update on public.generation_jobs
for each row execute function public.set_updated_at();

drop trigger if exists set_video_jobs_updated_at on public.video_jobs;
create trigger set_video_jobs_updated_at
before update on public.video_jobs
for each row execute function public.set_updated_at();

drop trigger if exists set_purchase_orders_updated_at on public.purchase_orders;
create trigger set_purchase_orders_updated_at
before update on public.purchase_orders
for each row execute function public.set_updated_at();

alter table public.capture_sessions enable row level security;
alter table public.users enable row level security;
alter table public.user_notification_preferences enable row level security;
alter table public.captures enable row level security;
alter table public.generation_jobs enable row level security;
alter table public.video_jobs enable row level security;
alter table public.purchase_orders enable row level security;
alter table public.credit_purchases enable row level security;
alter table public.notifications enable row level security;
alter table public.generation_analytics enable row level security;

grant usage on schema public to anon, authenticated;
grant select, insert, update on public.users to authenticated;
grant select, insert, update on public.user_notification_preferences to authenticated;
grant select, insert, update on public.capture_sessions to authenticated;
grant select, insert, update on public.captures to authenticated;
grant select, insert, update on public.generation_jobs to authenticated;
grant select, insert, update on public.video_jobs to authenticated;
grant select on public.purchase_orders to authenticated;
grant select on public.credit_purchases to authenticated;
grant select, update on public.notifications to authenticated;
grant select on public.generation_analytics to authenticated;

drop policy if exists "Users can read own profile" on public.users;
create policy "Users can read own profile"
on public.users for select
using (auth.uid() = id);

drop policy if exists "Users can insert own profile" on public.users;
create policy "Users can insert own profile"
on public.users for insert
with check (auth.uid() = id);

drop policy if exists "Users can update own profile" on public.users;
create policy "Users can update own profile"
on public.users for update
using (auth.uid() = id)
with check (auth.uid() = id);

drop policy if exists "Users can read own notification preferences" on public.user_notification_preferences;
create policy "Users can read own notification preferences"
on public.user_notification_preferences for select
using (auth.uid() = user_id);

drop policy if exists "Users can insert own notification preferences" on public.user_notification_preferences;
create policy "Users can insert own notification preferences"
on public.user_notification_preferences for insert
with check (auth.uid() = user_id);

drop policy if exists "Users can update own notification preferences" on public.user_notification_preferences;
create policy "Users can update own notification preferences"
on public.user_notification_preferences for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can read own capture sessions" on public.capture_sessions;
create policy "Users can read own capture sessions"
on public.capture_sessions for select
using (auth.uid() = user_id);

drop policy if exists "Users can update own capture sessions" on public.capture_sessions;
create policy "Users can update own capture sessions"
on public.capture_sessions for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can read own captures" on public.captures;
create policy "Users can read own captures"
on public.captures for select
using (
  exists (
    select 1 from public.capture_sessions
    where capture_sessions.id = captures.session_id
      and capture_sessions.user_id = auth.uid()
  )
);

drop policy if exists "Users can read own generation jobs" on public.generation_jobs;
create policy "Users can read own generation jobs"
on public.generation_jobs for select
using (auth.uid() = user_id);

drop policy if exists "Users can read own video jobs" on public.video_jobs;
create policy "Users can read own video jobs"
on public.video_jobs for select
using (auth.uid() = user_id);

drop policy if exists "Users can read own purchase orders" on public.purchase_orders;
create policy "Users can read own purchase orders"
on public.purchase_orders for select
using (
  exists (
    select 1
    from public.generation_jobs
    where generation_jobs.id = purchase_orders.generation_job_id
      and generation_jobs.user_id = auth.uid()
  )
);

drop policy if exists "Users can read own credit purchases" on public.credit_purchases;
create policy "Users can read own credit purchases"
on public.credit_purchases for select
using (auth.uid() = user_id);

drop policy if exists "Users can read own notifications" on public.notifications;
create policy "Users can read own notifications"
on public.notifications for select
using (auth.uid() = user_id);

drop policy if exists "Users can mark own notifications read" on public.notifications;
create policy "Users can mark own notifications read"
on public.notifications for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'fan-hero-captures',
  'fan-hero-captures',
  false,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Public read fan hero captures" on storage.objects;
