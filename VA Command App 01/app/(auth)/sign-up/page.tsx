"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function SignUpPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const supabase = createClient();

    // business_name is read by the handle_new_user() trigger (sql/0001_init.sql)
    // to name the workspace it creates automatically.
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { business_name: businessName } },
    });

    if (error) setError(error.message);
    else setSent(true);
  }

  if (sent) {
    return (
      <main className="wrap">
        <div className="card">
          <h1 style={{ fontSize: 20, marginBottom: 8 }}>Check your email</h1>
          <p style={{ color: "var(--text-3)" }}>
            We sent a confirmation link to {email}. Click it, then come back and sign in.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="wrap">
      <form className="card" onSubmit={handleSubmit}>
        <h1 style={{ fontSize: 20, marginBottom: 18 }}>Create an account</h1>
        {error && <p className="error">{error}</p>}
        <label htmlFor="biz">Business name</label>
        <input id="biz" value={businessName} onChange={(e) => setBusinessName(e.target.value)} required />
        <label htmlFor="email">Email</label>
        <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <label htmlFor="pw">Password</label>
        <input id="pw" type="password" minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} required />
        <button type="submit">Create account</button>
      </form>
    </main>
  );
}
