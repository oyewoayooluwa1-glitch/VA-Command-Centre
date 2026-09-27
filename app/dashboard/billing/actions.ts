"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PLANS, type PlanKey } from "@/lib/paystack/plans";

export async function subscribeToPlan(plan: PlanKey) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: workspace } = await supabase.from("workspaces").select("id").single();
  if (!workspace) throw new Error("No workspace found");

  const planCode = process.env[PLANS[plan].envVar];
  if (!planCode) {
    throw new Error(
      `Missing ${PLANS[plan].envVar} — create this plan in your Paystack dashboard first, then set its plan code as this env var.`
    );
  }

  const res = await fetch("https://api.paystack.co/transaction/initialize", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: user.email,
      plan: planCode,
      // metadata comes back on the webhook event — this is how we know
      // which workspace and plan a payment belongs to.
      metadata: { workspace_id: workspace.id, plan_key: plan },
      callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing`,
    }),
  });

  const json = (await res.json()) as {
    status: boolean;
    data?: { authorization_url: string };
    message?: string;
  };
  if (!json.status || !json.data) {
    throw new Error(json.message ?? "Could not start checkout");
  }

  redirect(json.data.authorization_url);
}
