import { createClient } from "@/lib/supabase/server";
import { addPayment, markPaid } from "./actions";

export default async function PaymentsPage() {
  const supabase = await createClient();

  const [{ data: workspace }, { data: clients }, { data: payments, error }] = await Promise.all([
    supabase.from("workspaces").select("currencies").single(),
    supabase.from("clients").select("id, full_name").order("full_name"),
    supabase
      .from("payments")
      .select("id, amount, currency, status, due_date, paid_date, clients(full_name)")
      .order("due_date", { ascending: true, nullsFirst: false }),
  ]);

  const currencies = workspace?.currencies?.length ? workspace.currencies : ["NGN"];

  // Totals per currency, kept separate on purpose — never summed together.
  const paidThisMonth: Record<string, number> = {};
  const outstanding: Record<string, number> = {};
  const thisMonth = new Date().toISOString().slice(0, 7);
  payments?.forEach((p) => {
    if (p.status === "paid" && p.paid_date?.startsWith(thisMonth)) {
      paidThisMonth[p.currency] = (paidThisMonth[p.currency] ?? 0) + p.amount;
    }
    if (p.status === "pending" || p.status === "sent" || p.status === "overdue") {
      outstanding[p.currency] = (outstanding[p.currency] ?? 0) + p.amount;
    }
  });

  return (
    <main className="wrap" style={{ maxWidth: 640 }}>
      <div className="card" style={{ marginBottom: 16 }}>
        <h2 style={{ fontSize: 16, marginBottom: 10 }}>Paid this month</h2>
        {Object.keys(paidThisMonth).length === 0 && <p style={{ color: "var(--text-3)", fontSize: 14 }}>Nothing yet.</p>}
        {Object.entries(paidThisMonth).map(([cur, amt]) => (
          <div key={cur} className="num" style={{ fontSize: 20, fontWeight: 600 }}>{cur} {amt.toLocaleString()}</div>
        ))}
        <h2 style={{ fontSize: 16, margin: "14px 0 10px" }}>Outstanding</h2>
        {Object.keys(outstanding).length === 0 && <p style={{ color: "var(--text-3)", fontSize: 14 }}>Nothing outstanding.</p>}
        {Object.entries(outstanding).map(([cur, amt]) => (
          <div key={cur} className="num" style={{ fontSize: 20, fontWeight: 600, color: "var(--danger)" }}>{cur} {amt.toLocaleString()}</div>
        ))}
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <h1 style={{ fontSize: 20, marginBottom: 14 }}>Add a payment</h1>
        <form action={addPayment}>
          <label htmlFor="client_id">Client</label>
          <select id="client_id" name="client_id" required style={{ width: "100%", padding: 10, marginBottom: 14, border: "1px solid var(--line)", borderRadius: 8, background: "var(--canvas)", color: "var(--text)" }}>
            <option value="">Select a client</option>
            {clients?.map((c) => (
              <option key={c.id} value={c.id}>{c.full_name}</option>
            ))}
          </select>
          <label htmlFor="amount">Amount</label>
          <input id="amount" name="amount" type="number" step="0.01" required />
          <label htmlFor="currency">Currency</label>
          <select id="currency" name="currency" required style={{ width: "100%", padding: 10, marginBottom: 14, border: "1px solid var(--line)", borderRadius: 8, background: "var(--canvas)", color: "var(--text)" }}>
            {currencies.map((cur: string) => (
              <option key={cur} value={cur}>{cur}</option>
            ))}
          </select>
          <label htmlFor="due_date">Due date</label>
          <input id="due_date" name="due_date" type="date" />
          <button type="submit">Add payment</button>
        </form>
      </div>

      <div className="card">
        <h2 style={{ fontSize: 16, marginBottom: 10 }}>All payments</h2>
        {error && <p className="error">{error.message}</p>}
        {payments?.length === 0 && <p style={{ color: "var(--text-3)" }}>No payments yet.</p>}
        {payments?.map((p) => (
          <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 0", borderTop: "1px solid var(--line)" }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              {/* @ts-expect-error Supabase's embedded-relation typing doesn't infer this shape automatically */}
              <strong>{p.clients?.full_name}</strong>
              <span className="num" style={{ color: "var(--text-3)", marginLeft: 8 }}>{p.currency} {p.amount.toLocaleString()}</span>
            </div>
            {p.due_date && <span style={{ fontSize: 12, color: "var(--text-3)" }}>Due {p.due_date}</span>}
            {p.status === "paid" ? (
              <span style={{ fontSize: 12, color: "var(--success)" }}>Paid</span>
            ) : (
              <form action={markPaid.bind(null, p.id)}>
                <button type="submit" style={{ width: "auto", padding: "5px 10px", fontSize: 12.5 }}>Mark paid</button>
              </form>
            )}
          </div>
        ))}
      </div>
    </main>
  );
}
