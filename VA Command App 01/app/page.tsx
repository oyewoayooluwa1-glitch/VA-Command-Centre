import Link from "next/link";

export default function Home() {
  return (
    <main className="wrap">
      <div className="card">
        <h1 style={{ fontSize: 22, marginBottom: 8 }}>VA Command Center</h1>
        <p style={{ color: "var(--text-3)", marginBottom: 20 }}>
          Deployment test build.
        </p>
        <Link href="/sign-up">
          <button style={{ marginBottom: 10 }}>Create an account</button>
        </Link>
        <Link href="/login">
          <button style={{ background: "transparent", color: "var(--text)", border: "1px solid var(--line)" }}>
            Sign in
          </button>
        </Link>
      </div>
    </main>
  );
}
