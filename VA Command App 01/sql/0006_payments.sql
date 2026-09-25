create table public.payments (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  client_id uuid not null references public.clients (id) on delete cascade,
  amount numeric not null,
  currency text not null,
  status text not null default 'pending'
    check (status in ('sent','pending','paid','overdue','cancelled')),
  issue_date date not null default current_date,
  due_date date,
  paid_date date,
  method text,
  notes text,
  created_at timestamptz not null default now()
);

alter table public.payments enable row level security;

create policy "members read workspace payments" on public.payments
  for select using (
    workspace_id in (select workspace_id from public.workspace_members where user_id = auth.uid())
  );
create policy "members insert workspace payments" on public.payments
  for insert with check (
    workspace_id in (select workspace_id from public.workspace_members where user_id = auth.uid())
  );
create policy "members update workspace payments" on public.payments
  for update using (
    workspace_id in (select workspace_id from public.workspace_members where user_id = auth.uid())
  );
create policy "members delete workspace payments" on public.payments
  for delete using (
    workspace_id in (select workspace_id from public.workspace_members where user_id = auth.uid())
  );

create index payments_workspace_id_idx on public.payments (workspace_id);
create index payments_client_id_idx on public.payments (client_id);
