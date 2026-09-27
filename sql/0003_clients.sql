-- The VA's own clients (the businesses they do VA work for) — not to be
-- confused with subscription billing in 0004_subscriptions.sql, which is
-- about paying for VA Command Center itself.

create table public.clients (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  full_name text not null,
  company text,
  email text,
  phone text,
  website text,
  status text not null default 'prospect'
    check (status in ('prospect','onboarding','active','paused','completed','archived')),
  services text[] not null default '{}',
  fee_amount numeric,
  fee_currency text,
  billing_frequency text,
  notes text,
  tags text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.clients enable row level security;

create policy "members read workspace clients" on public.clients
  for select using (
    workspace_id in (select workspace_id from public.workspace_members where user_id = auth.uid())
  );
create policy "members insert workspace clients" on public.clients
  for insert with check (
    workspace_id in (select workspace_id from public.workspace_members where user_id = auth.uid())
  );
create policy "members update workspace clients" on public.clients
  for update using (
    workspace_id in (select workspace_id from public.workspace_members where user_id = auth.uid())
  );
create policy "members delete workspace clients" on public.clients
  for delete using (
    workspace_id in (select workspace_id from public.workspace_members where user_id = auth.uid())
  );

create index clients_workspace_id_idx on public.clients (workspace_id);
