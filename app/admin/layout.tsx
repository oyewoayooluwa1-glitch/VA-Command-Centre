import Link from "next/link";
import { requireAdmin } from "@/lib/admin/require-admin";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin(); // redirects before anything below ever renders

  return (
    <div style={{ display: "grid", gridTemplateColumns: "200px 1fr", minHeight: "100vh" }}>
      <aside style={{ background: "#000", color: "#a1a1aa", padding: 20 }}>
        <div style={{ color: "#fff", fontWeight: 600, marginBottom: 20 }}>Admin</div>
        <nav style={{ display: "grid", gap: 6, fontSize: 14.5 }}>
          <Link href="/admin" style={{ color: "inherit" }}>Overview</Link>
          <Link href="/admin/users" style={{ color: "inherit" }}>Users</Link>
        </nav>
      </aside>
      <main style={{ padding: 28 }}>{children}</main>
    </div>
  );
}
