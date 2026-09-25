-- VA Command Center — initial schema (Milestone 0)
-- Run this in the Supabase SQL Editor on a fresh project.

create extension if not exists "pgcrypto";

-- One row per authenticated user, mirroring auth.users.
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  created_at timestamptz not null default now()
);

-- A VA's business. Every piece of data belongs to a workspace, never
-- directly to a user — this is what keeps user A's data away from user B.
create table public.workspaces (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  owner_id uuid not null references auth.users (id),
  currencies text[] not null default '{}',   -- e.g. {'NGN','GBP'} — VA picks these at setup
  timezone text not null default 'UTC',
  created_at timestamptz not null default now()
);

-- MVP: one row per workspace (the owner). The table exists now so
-- Phase 3 team invites are additive, not a migration that rewrites
-- every other table's ownership model.
create table public.workspace_members (
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  role text not null default 'owner' check (role in ('owner','admin','manager','assistant','viewer')),
  created_at timestamptz not null default now(),
  primary key (workspace_id, user_id)
);

-- Per-workspace feature flags, so the admin panel can lock a feature for
-- one user without a code change. Absence of a row = feature enabled.
create table public.entitlements (
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  feature_key text not null,
  enabled boolean not null default true,
  updated_at timestamptz not null default now(),
  primary key (workspace_id, feature_key)
);

-- Admins are their own table, separate from workspace_members, so a
-- workspace owner can never grant themselves admin by editing their own row.
create table public.platform_admins (
  user_id uuid primary key references auth.users (id),
  created_at timestamptz not null default now()
);

create table public.admin_audit_log (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid not null references auth.users (id),
  action text not null,
  target_workspace_id uuid references public.workspaces (id),
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);

-- ---------- Row Level Security ----------
-- Every table a normal user can reach is locked to their own workspace(s).
-- This is the backstop: even a bug in application code cannot leak data,
-- because Postgres itself refuses the query.

alter table public.profiles enable row level security;
alter table public.workspaces enable row level security;
alter table public.workspace_members enable row level security;
alter table public.entitlements enable row level security;
alter table public.platform_admins enable row level security;
alter table public.admin_audit_log enable row level security;

create policy "read own profile" on public.profiles
  for select using (id = auth.uid());
create policy "update own profile" on public.profiles
  for update using (id = auth.uid());

create policy "read own workspaces" on public.workspaces
  for select using (
    id in (select workspace_id from public.workspace_members where user_id = auth.uid())
  );
create policy "owner updates workspace" on public.workspaces
  for update using (owner_id = auth.uid());

create policy "read own membership" on public.workspace_members
  for select using (user_id = auth.uid());

create policy "read own entitlements" on public.entitlements
  for select using (
    workspace_id in (select workspace_id from public.workspace_members where user_id = auth.uid())
  );

-- platform_admins and admin_audit_log have NO policies for normal users —
-- RLS with zero policies means "no access", so only the service role
-- (used exclusively by admin-only server code) can read or write them.

-- ---------- New user -> profile + workspace, automatically ----------
create function public.handle_new_user()
returns trigger as $$
declare
  new_workspace_id uuid;
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data ->> 'full_name');

  insert into public.workspaces (name, owner_id)
  values (coalesce(new.raw_user_meta_data ->> 'business_name', 'My workspace'), new.id)
  returning id into new_workspace_id;

  insert into public.workspace_members (workspace_id, user_id, role)
  values (new_workspace_id, new.id, 'owner');

  return new;
end;
$$ language plpgsql security definer set search_path = public;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
