import { createClient } from "@/lib/supabase/server";
import { addClient } from "./actions";

export default async function ClientsPage() {
  const supabase = await createClient();
  const { data: clients, error } = await supabase
    .from("clients")
    .select("id, full_name, company, status, created_at")
    .order("created_at", { ascending: false });

  return (
    <main className="wrap" style={{ maxWidth: 640 }}>
      <div className="card" style={{ marginBottom: 16 }}>
        <h1 style={{ fontSize: 20, marginBottom: 14 }}>Add a client</h1>
        <form action={addClient}>
          <label htmlFor="full_name">Client name</label>
          <input id="full_name" name="full_name" required />
          <label htmlFor="company">Company</label>
          <input id="company" name="company" />
          <label htmlFor="email">Email</label>
          <input id="email" name="email" type="email" />
          <button type="submit">Add client</button>
        </form>
      </div>

      <div className="card">
        <h2 style={{ fontSize: 16, marginBottom: 10 }}>Your clients</h2>
        {error && <p className="error">{error.message}</p>}
        {clients?.length === 0 && (
          <p style={{ color: "var(--text-3)" }}>No clients yet.</p>
        )}
        {clients?.map((c) => (
          <div key={c.id} style={{ padding: "9px 0", borderTop: "1px solid var(--line)" }}>
            <strong>{c.full_name}</strong>
            {c.company && <span style={{ color: "var(--text-3)" }}> — {c.company}</span>}
            <span style={{ float: "right", fontSize: 12, color: "var(--text-3)" }}>{c.status}</span>
          </div>
        ))}
      </div>
    </main>
  );
}
