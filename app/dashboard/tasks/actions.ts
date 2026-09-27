"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function addTask(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: workspace } = await supabase.from("workspaces").select("id").single();
  if (!workspace) throw new Error("No workspace found");

  const title = formData.get("title") as string;
  const client_id = (formData.get("client_id") as string) || null;
  const due_date = (formData.get("due_date") as string) || null;
  const priority = (formData.get("priority") as string) || "medium";

  const { error } = await supabase.from("tasks").insert({
    workspace_id: workspace.id,
    title,
    client_id,
    due_date,
    priority,
  });
  if (error) throw new Error(error.message);

  revalidatePath("/dashboard/tasks");
}

export async function completeTask(taskId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("tasks")
    .update({ status: "completed", completed_at: new Date().toISOString() })
    .eq("id", taskId);
  if (error) throw new Error(error.message);

  revalidatePath("/dashboard/tasks");
}
