import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { TrialCountdown } from "@/components/TrialCountdown";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // No workspace_id filter here on purpose — Row Level Security is what
  // limits this to the signed-in user's own workspace (see sql/0001_init.sql
  // and sql/isolation_test.md). If RLS is misconfigured, this either
  // returns nothing or errors — it can never silently return someone else's row.
  const { data: workspace, error } = await supabase
    .from("workspaces")
    .select("name, currencies, timezone, subscription_status, trial_ends_at, current_period_end")
    .single();

  const isTrialing = workspace?.subscription_status === "trialing";
  const countdownEndsAt = isTrialing ? workspace?.trial_ends_at : workspace?.current_period_end;

  return (
    <main className="wrap">
      <div className="card" style={{ marginBottom: 16 }}>
        <h1 style={{ fontSize: 20, marginBottom: 8 }}>
          {error ? "Couldn't load your workspace" : workspace?.name}
        </h1>
        {error ? (
          <p className="error">{error.message}</p>
        ) : (
          <p style={{ color: "var(--text-3)" }}>
            Signed in as {user.email}. This name came from your own row in the{" "}
            <code>workspaces</code> table — Postgres, not the app, decided you
            were allowed to see it.
          </p>
        )}
      </div>

      {countdownEndsAt && (
        <div className="card">
          <TrialCountdown
            endsAt={countdownEndsAt}
            totalDays={isTrialing ? 7 : 30}
            label={isTrialing ? "Free trial" : "Current plan"}
          />
        </div>
      )}
    </main>
  );
}
