-- Migration 0001: fix schema drift and add the credits balance (Phase 2).
--
-- Safe to run multiple times. Run this in the Supabase SQL editor against the
-- live project. `create table if not exists` in schema.sql cannot add columns to
-- tables that already exist, so the column drift the app currently shims around
-- (generation_jobs.user_id, capture_sessions.user_id) is fixed here explicitly.
--
-- Recommended order on an existing project:
--   1. Run supabase/schema.sql   (creates any missing tables, policies, grants)
--   2. Run this migration         (adds drifted + credits columns, credit RPC)

-- 1. Ownership columns the application expects but older databases may lack.
alter table public.capture_sessions
  add column if not exists user_id uuid references auth.users(id) on delete set null;

alter table public.generation_jobs
  add column if not exists user_id uuid references auth.users(id) on delete set null;

create index if not exists capture_sessions_user_id_idx on public.capture_sessions(user_id);
create index if not exists generation_jobs_user_id_idx on public.generation_jobs(user_id);

-- 2. Phase 2: per-user credit balance. Defaults to 0; existing rows are untouched.
alter table public.users
  add column if not exists credits integer not null default 0;

-- 3. Atomic credit spend used by the generate route. Returns the new balance,
--    or null when the user had no credits to spend. Guards against going negative.
create or replace function public.consume_user_credit(p_user_id uuid)
returns integer
language sql
as $$
  update public.users
  set credits = credits - 1
  where id = p_user_id and credits > 0
  returning credits;
$$;
