import { createAdminClient } from "@/lib/supabase/admin";

export default async function AdminOverview() {
  const admin = createAdminClient();

  const [{ count: totalUsers }, { count: totalWorkspaces }] = await Promise.all([
    admin.from("profiles").select("*", { count: "exact", head: true }),
    admin.from("workspaces").select("*", { count: "exact", head: true }),
  ]);

  return (
    <div>
      <h1 style={{ fontSize: 22, marginBottom: 18 }}>Overview</h1>
      <div style={{ display: "flex", gap: 14 }}>
        <div className="card">
          <div style={{ fontSize: 13, color: "var(--text-3)" }}>Registered users</div>
          <div style={{ fontSize: 28, fontWeight: 600 }}>{totalUsers ?? 0}</div>
        </div>
        <div className="card">
          <div style={{ fontSize: 13, color: "var(--text-3)" }}>Workspaces</div>
          <div style={{ fontSize: 28, fontWeight: 600 }}>{totalWorkspaces ?? 0}</div>
        </div>
      </div>
      {/* Churn, plan distribution, and revenue belong here once billing
          exists — they're meaningless before then (see chat: Paystack). */}
    </div>
  );
}
