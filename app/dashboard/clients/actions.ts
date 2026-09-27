"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function addClient(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: workspace } = await supabase.from("workspaces").select("id").single();
  if (!workspace) throw new Error("No workspace found");

  const full_name = formData.get("full_name") as string;
  const company = formData.get("company") as string;
  const email = formData.get("email") as string;

  const { error } = await supabase.from("clients").insert({
    workspace_id: workspace.id,
    full_name,
    company: company || null,
    email: email || null,
  });
  if (error) throw new Error(error.message);

  revalidatePath("/dashboard/clients");
}
