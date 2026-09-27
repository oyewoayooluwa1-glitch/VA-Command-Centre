# Two-user isolation test

This is the gate for Milestone 0: prove user A cannot read user B's
workspace, however the request is made. Do this by hand for now; a
scripted version (Vitest hitting the real Supabase REST API with two
logged-in test users) should replace it before the private beta.

1. Sign up as `a@test.com` and `b@test.com` (use the app's real sign-up
   flow once it exists, or Supabase Auth's dashboard for now).
2. In the SQL Editor, confirm each got their own workspace:
   ```sql
   select w.id, w.name, w.owner_id from public.workspaces w;
   ```
3. In the Supabase dashboard, go to **API docs → Authentication** and
   grab a JWT for user A (or sign in as A in the running app and read
   the access token from the browser's dev tools).
4. Call the REST API directly as user A, asking for ALL workspaces:
   ```bash
   curl "https://YOUR-PROJECT.supabase.co/rest/v1/workspaces?select=*" \
     -H "apikey: YOUR_ANON_KEY" \
     -H "Authorization: Bearer USER_A_JWT"
   ```
   **Expected:** only A's workspace comes back — never B's — even
   though the query itself didn't filter by workspace. That's RLS
   doing the filtering, not application code.
5. Repeat step 4 asking for B's workspace **by ID** (guess or copy it
   from step 2): `...workspaces?id=eq.<B's id>`. **Expected:** empty
   result, not an error — Postgres behaves as if the row doesn't exist.
6. Repeat for `workspace_members` and `entitlements` once those have
   real rows.

If any of these return another user's data, do not proceed past
Milestone 0 — fix the policy first.
