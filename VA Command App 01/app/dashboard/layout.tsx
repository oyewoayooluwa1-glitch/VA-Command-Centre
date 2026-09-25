import Link from "next/link";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <nav
        style={{
          display: "flex",
          gap: 18,
          padding: "14px 20px",
          borderBottom: "1px solid var(--line)",
          fontSize: 14,
          fontWeight: 500,
        }}
      >
        <Link href="/dashboard">Dashboard</Link>
        <Link href="/dashboard/clients">Clients</Link>
        <Link href="/dashboard/tasks">Tasks</Link>
        <Link href="/dashboard/payments">Payments</Link>
        <Link href="/dashboard/billing" style={{ marginLeft: "auto" }}>Billing</Link>
      </nav>
      {children}
    </div>
  );
}
