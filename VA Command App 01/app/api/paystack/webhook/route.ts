import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "edge";

// Web Crypto, not Node's crypto module — portable on Cloudflare Workers
// without relying on nodejs_compat covering every crypto API.
async function verifySignature(body: string, signature: string, secret: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-512" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(body));
  const hex = Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return hex === signature;
}

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get("x-paystack-signature") ?? "";
  const valid = await verifySignature(body, signature, process.env.PAYSTACK_SECRET_KEY!);
  if (!valid) return new Response("Invalid signature", { status: 401 });

  const event = JSON.parse(body);
  const admin = createAdminClient();

  // NOTE: this covers the two events the checkout flow needs to function.
  // Once you're testing against a real Paystack account, use their
  // dashboard's webhook log to check the exact shape of each event —
  // Paystack's payloads for subscription events have shifted before, and
  // this is written from documentation, not a live test.
  if (event.event === "charge.success" || event.event === "subscription.create") {
    const workspaceId = event.data?.metadata?.workspace_id;
    const planKey = event.data?.metadata?.plan_key;
    if (workspaceId) {
      await admin
        .from("workspaces")
        .update({
          subscription_status: "active",
          subscription_plan: planKey ?? null,
          paystack_customer_code: event.data?.customer?.customer_code ?? null,
          paystack_subscription_code:
            event.data?.subscription_code ?? event.data?.plan_object?.plan_code ?? null,
          current_period_end: event.data?.subscription?.next_payment_date ?? null,
        })
        .eq("id", workspaceId);
    }
  }

  if (event.event === "subscription.disable" || event.event === "invoice.payment_failed") {
    const subCode = event.data?.subscription_code ?? event.data?.subscription?.subscription_code;
    if (subCode) {
      await admin
        .from("workspaces")
        .update({ subscription_status: "past_due" })
        .eq("paystack_subscription_code", subCode);
    }
  }

  return new Response("ok", { status: 200 });
}
