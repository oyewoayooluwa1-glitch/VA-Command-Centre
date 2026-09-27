-- App-level subscription billing (Paystack) — this gates use of VA
-- Command Center itself. Separate from `clients`, which is about the
-- VA's own client businesses.

alter table public.workspaces
  add column subscription_status text not null default 'trialing'
    check (subscription_status in ('trialing','active','past_due','canceled')),
  add column subscription_plan text
    check (subscription_plan in ('basic','advanced','professional')),
  add column trial_ends_at timestamptz,
  add column current_period_end timestamptz,
  add column paystack_customer_code text,
  add column paystack_subscription_code text;

-- New workspaces now start a 7-day trial automatically.
create or replace function public.handle_new_user()
returns trigger as $$
declare
  new_workspace_id uuid;
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data ->> 'full_name');

  insert into public.workspaces (name, owner_id, trial_ends_at)
  values (
    coalesce(new.raw_user_meta_data ->> 'business_name', 'My workspace'),
    new.id,
    now() + interval '7 days'
  )
  returning id into new_workspace_id;

  insert into public.workspace_members (workspace_id, user_id, role)
  values (new_workspace_id, new.id, 'owner');

  return new;
end;
$$ language plpgsql security definer set search_path = public;

-- Your own existing workspace was created before this migration, so it has
-- no trial_ends_at and would otherwise get blocked by the new gate. Run
-- this once, for your own workspace only, so you're never paywalled out
-- of your own product:
--
--   update public.workspaces set subscription_status = 'active'
--   where owner_id = 'your-own-user-id';
--
-- (Find your user id the same way as sql/0002_make_first_admin.sql.)
