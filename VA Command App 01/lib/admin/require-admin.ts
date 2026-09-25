import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

// The ONLY gate for every /admin page. Being a workspace owner — even a
// paying customer with dozens of clients in the app — does not make
// someone an admin. Only a user_id listed in platform_admins does. That
// table has zero RLS policies for normal users (see sql/0001_init.sql),
// so it can never be granted through the product itself — only by hand,
// once, via sql/0002_make_first_admin.sql.
export async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const admin = createAdminClient();
  const { data: isAdmin } = await admin
    .from("platform_admins")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();

  // Redirect to /dashboard, not a 403 page — a 403 confirms /admin exists
  // and is worth probing. A quiet redirect gives an outsider nothing.
  if (!isAdmin) redirect("/dashboard");

  return user;
}
