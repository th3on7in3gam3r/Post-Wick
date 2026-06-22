import Stripe from "stripe";
import { plans } from "@/lib/pricing";

let stripeClient: Stripe | null = null;

export function isStripeConfigured() {
  return Boolean(
    process.env.STRIPE_SECRET_KEY &&
      process.env.STRIPE_PRO_PRICE_ID &&
      process.env.STRIPE_MAX_PRICE_ID,
  );
}

export function getStripe() {
  if (!stripeClient) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error("STRIPE_SECRET_KEY is not set");
    }
    stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY);
  }
  return stripeClient;
}

export const STRIPE_PLANS = {
  pro: {
    priceId: process.env.STRIPE_PRO_PRICE_ID ?? "",
    name: "Pro",
    monthly: plans.pro.monthly,
    yearlyPerMonth: plans.pro.yearlyPerMonth,
  },
  max: {
    priceId: process.env.STRIPE_MAX_PRICE_ID ?? "",
    name: "Max",
    monthly: plans.max.monthly,
    yearlyPerMonth: plans.max.yearlyPerMonth,
  },
} as const;

export type PaidPlan = keyof typeof STRIPE_PLANS;
