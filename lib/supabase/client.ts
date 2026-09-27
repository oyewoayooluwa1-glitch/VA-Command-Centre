import { createBrowserClient } from "@supabase/ssr";

// Used in Client Components only. Holds the anon key — safe to expose,
// since every table it can reach is protected by Row Level Security.
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
