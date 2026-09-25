import { createAdminClient } from "@/lib/supabase/admin";

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const admin = createAdminClient();

  let query = admin
    .from("profiles")
    .select("id, full_name, created_at")
    .order("created_at", { ascending: false })
    .limit(50);
  if (q) query = query.ilike("full_name", `%${q}%`);

  const { data: users, error } = await query;

  return (
    <div>
      <h1 style={{ fontSize: 22, marginBottom: 18 }}>Users</h1>
      <form style={{ marginBottom: 18 }}>
        <input
          name="q"
          defaultValue={q ?? ""}
          placeholder="Search by name"
          style={{ padding: 9, border: "1px solid var(--line)", borderRadius: 8, width: 260 }}
        />
      </form>
      {error && <p className="error">{error.message}</p>}
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14.5 }}>
        <thead>
          <tr style={{ textAlign: "left", color: "var(--text-3)", fontSize: 13 }}>
            <th style={{ paddingBottom: 8 }}>Name</th>
            <th>Signed up</th>
            <th>User ID</th>
          </tr>
        </thead>
        <tbody>
          {users?.map((u) => (
            <tr key={u.id} style={{ borderTop: "1px solid var(--line)" }}>
              <td style={{ padding: "9px 0" }}>{u.full_name ?? "—"}</td>
              <td>{new Date(u.created_at).toLocaleDateString()}</td>
              <td style={{ fontFamily: "monospace", fontSize: 12, color: "var(--text-3)" }}>{u.id}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {/* Feature locks (toggling rows in `entitlements` per workspace) and
          the audit log view are the next two pieces to add here. */}
    </div>
  );
}
