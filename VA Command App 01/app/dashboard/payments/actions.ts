"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function addPayment(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: workspace } = await supabase.from("workspaces").select("id").single();
  if (!workspace) throw new Error("No workspace found");

  const client_id = formData.get("client_id") as string;
  const amount = Number(formData.get("amount"));
  const currency = formData.get("currency") as string;
  const due_date = (formData.get("due_date") as string) || null;

  const { error } = await supabase.from("payments").insert({
    workspace_id: workspace.id,
    client_id,
    amount,
    currency,
    due_date,
  });
  if (error) throw new Error(error.message);

  revalidatePath("/dashboard/payments");
}

export async function markPaid(paymentId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("payments")
    .update({ status: "paid", paid_date: new Date().toISOString().slice(0, 10) })
    .eq("id", paymentId);
  if (error) throw new Error(error.message);

  revalidatePath("/dashboard/payments");
}
