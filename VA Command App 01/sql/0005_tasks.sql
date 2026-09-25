create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  client_id uuid references public.clients (id) on delete set null,
  title text not null,
  description text,
  status text not null default 'todo'
    check (status in ('todo','in_progress','waiting_on_client','completed','cancelled')),
  priority text not null default 'medium'
    check (priority in ('low','medium','high','urgent')),
  due_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  completed_at timestamptz
);

alter table public.tasks enable row level security;

create policy "members read workspace tasks" on public.tasks
  for select using (
    workspace_id in (select workspace_id from public.workspace_members where user_id = auth.uid())
  );
create policy "members insert workspace tasks" on public.tasks
  for insert with check (
    workspace_id in (select workspace_id from public.workspace_members where user_id = auth.uid())
  );
create policy "members update workspace tasks" on public.tasks
  for update using (
    workspace_id in (select workspace_id from public.workspace_members where user_id = auth.uid())
  );
create policy "members delete workspace tasks" on public.tasks
  for delete using (
    workspace_id in (select workspace_id from public.workspace_members where user_id = auth.uid())
  );

create index tasks_workspace_id_idx on public.tasks (workspace_id);
create index tasks_client_id_idx on public.tasks (client_id);
