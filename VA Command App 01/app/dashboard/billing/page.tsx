import { createClient } from "@/lib/supabase/server";
import { TrialCountdown } from "@/components/TrialCountdown";
import { PLANS } from "@/lib/paystack/plans";
import { subscribeToPlan } from "./actions";

export default async function BillingPage() {
  const supabase = await createClient();
  const { data: workspace } = await supabase
    .from("workspaces")
    .select("subscription_status, subscription_plan, trial_ends_at, current_period_end")
    .single();

  const isTrialing = workspace?.subscription_status === "trialing";
  const endsAt = isTrialing ? workspace?.trial_ends_at : workspace?.current_period_end;

  return (
    <main className="wrap" style={{ maxWidth: 640 }}>
      <div className="card" style={{ marginBottom: 16 }}>
        <h1 style={{ fontSize: 20, marginBottom: 14 }}>Billing</h1>

        {endsAt && (
          <TrialCountdown
            endsAt={endsAt}
            totalDays={isTrialing ? 7 : 30}
            label={isTrialing ? "Free trial" : "Current plan"}
          />
        )}

        {workspace?.subscription_status === "active" && (
          <p style={{ marginTop: 14, color: "var(--text-3)" }}>
            You&apos;re on the {workspace.subscription_plan} plan.
          </p>
        )}
        {workspace?.subscription_status === "past_due" && (
          <p className="error" style={{ marginTop: 14 }}>
            Your last payment failed. Pick a plan below to keep access.
          </p>
        )}
      </div>

      <div style={{ display: "grid", gap: 12 }}>
        {(Object.keys(PLANS) as (keyof typeof PLANS)[]).map((key) => (
          <form
            key={key}
            action={subscribeToPlan.bind(null, key)}
            className="card"
            style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
          >
            <div>
              <div style={{ fontWeight: 600 }}>{PLANS[key].label}</div>
              <div className="num" style={{ color: "var(--text-3)", fontSize: 14 }}>
                ₦{PLANS[key].amountNaira.toLocaleString()}/month
              </div>
            </div>
            <button type="submit" style={{ width: "auto", padding: "9px 16px" }}>
              {workspace?.subscription_plan === key ? "Current plan" : "Choose"}
            </button>
          </form>
        ))}
      </div>
    </main>
  );
}
