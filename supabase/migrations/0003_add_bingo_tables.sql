create table if not exists public.bingo_portraits (
  id uuid primary key default gen_random_uuid(),
  event_code text not null,
  player_name text not null,
  job_id text not null,
  output_url text,
  created_at timestamptz not null default now()
);
create index if not exists bingo_portraits_event_code_idx on public.bingo_portraits(event_code);

create table if not exists public.bingo_events (
  code text primary key,
  called_portrait_ids text[] not null default '{}',
  created_at timestamptz not null default now()
);
