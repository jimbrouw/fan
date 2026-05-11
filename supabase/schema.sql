create table if not exists public.capture_sessions (
  id uuid primary key,
  status text not null check (status in ('capturing', 'ready', 'generating', 'complete', 'failed')),
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

create index if not exists captures_session_id_idx on public.captures(session_id);
create index if not exists generation_jobs_session_id_idx on public.generation_jobs(session_id);
create index if not exists generation_jobs_provider_job_id_idx on public.generation_jobs(provider_job_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_capture_sessions_updated_at on public.capture_sessions;
create trigger set_capture_sessions_updated_at
before update on public.capture_sessions
for each row execute function public.set_updated_at();

drop trigger if exists set_captures_updated_at on public.captures;
create trigger set_captures_updated_at
before update on public.captures
for each row execute function public.set_updated_at();

drop trigger if exists set_generation_jobs_updated_at on public.generation_jobs;
create trigger set_generation_jobs_updated_at
before update on public.generation_jobs
for each row execute function public.set_updated_at();

alter table public.capture_sessions enable row level security;
alter table public.captures enable row level security;
alter table public.generation_jobs enable row level security;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'fan-hero-captures',
  'fan-hero-captures',
  true,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Public read fan hero captures" on storage.objects;
create policy "Public read fan hero captures"
on storage.objects for select
using (bucket_id = 'fan-hero-captures');
