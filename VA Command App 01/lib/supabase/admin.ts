import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// SERVER-ONLY. Never import this from a "use client" file, and never let
// SUPABASE_SERVICE_ROLE_KEY get the NEXT_PUBLIC_ prefix — that prefix means
// "inline this into the browser bundle," and this key bypasses every Row
// Level Security policy in the database. If it ever reached the browser,
// any visitor could read or write any workspace's data.
//
// Set it with: wrangler secret put SUPABASE_SERVICE_ROLE_KEY
// (as a secret, not a Build variable — see the note in require-admin.ts)
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
