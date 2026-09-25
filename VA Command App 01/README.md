# VA Command Center — starter (Milestone 0)

This is the deployment test, not the product: sign up, confirm your
email, sign in, and see your workspace name pulled live from Postgres
through Row Level Security. Once this works end to end on Cloudflare,
every later feature is built the same way.

**Get this running with Claude Code** — open this folder in Claude Code
and say "set this up and get it running locally" the first time, then
work through the steps below together. This README is written so both
of you can follow it.

## 1. Supabase (database + auth)

1. Create a project at supabase.com.
2. Open the SQL Editor, paste in `sql/0001_init.sql`, and run it.
3. Go to Project Settings → API and copy the **Project URL** and
   **anon public key**.
4. Go to Authentication → Emails and confirm "Confirm email" is on
   (it is by default) — this is what sends the verification link.

## 2. Local setup

```bash
npm install
cp .env.example .env.local
# paste your Supabase URL and anon key into .env.local
npm run dev
```

Visit `localhost:3000`, create an account, confirm the email Supabase
sends you, sign in, and confirm `/dashboard` shows your business name.

Then work through `sql/isolation_test.md` with two accounts before
trusting this with anything real.

## 3. GitHub

```bash
git init
git add .
git commit -m "Milestone 0: auth, workspaces, RLS"
gh repo create va-command-center --private --source=. --push
```
(Or create the repo on github.com and follow its "push an existing
repo" instructions.) The CI workflow in `.github/workflows/ci.yml`
will run automatically on every push.

## 4. Cloudflare

```bash
npm install -g wrangler
wrangler login
```

Add your Supabase values as Worker vars (not secrets — the anon key is
safe to expose; every table it touches is RLS-protected):

```bash
wrangler secret put NEXT_PUBLIC_SUPABASE_URL
wrangler secret put NEXT_PUBLIC_SUPABASE_ANON_KEY
```

Then build and deploy:

```bash
npm run cf:deploy
```

This prints a `*.workers.dev` URL. Repeat the sign-up flow there. Once
it works, connect a custom domain in the Cloudflare dashboard
(Workers & Pages → your worker → Domains).

For automatic deploys on every push to `main`, connect the GitHub repo
in the Cloudflare dashboard (Workers & Pages → Create → connect to Git)
instead of running `cf:deploy` by hand.

## What's deliberately not here yet

No Tailwind or shadcn/ui, no clients/tasks/payments tables, no admin
panel, no Hyperdrive binding. `app/globals.css` carries the design
tokens from the brand kit so the real UI has a consistent base to build
on. Everything else comes feature by feature, per the roadmap.
