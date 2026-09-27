// Single source of truth for the three tiers. The Paystack plan codes
// (created once in your Paystack dashboard under Products → Plans) get
// set as env vars — see .env.example.
export const PLANS = {
  basic: { label: "Basic", amountNaira: 7500, envVar: "PAYSTACK_PLAN_BASIC" },
  advanced: { label: "Advanced", amountNaira: 10000, envVar: "PAYSTACK_PLAN_ADVANCED" },
  professional: { label: "Professional", amountNaira: 15000, envVar: "PAYSTACK_PLAN_PROFESSIONAL" },
} as const;

export type PlanKey = keyof typeof PLANS;
