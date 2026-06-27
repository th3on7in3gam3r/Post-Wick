"use client";

import { useMemo, useState } from "react";
import { Check, CreditCard, Loader2 } from "lucide-react";
import { PanelCard } from "@/components/app/panel-card";
import { TextureButton } from "@/components/ui/texture-button";
import { getPlanLimits, PLAN_LIMITS, type SubscriptionTier } from "@/lib/plans";
import { STRIPE_PLANS, type BillingInterval } from "@/lib/stripe";
import { cn } from "@/lib/utils";

export function BillingClient({
  currentTier,
  stripeConfigured,
  billingIntervals,
  flash,
}: {
  currentTier: SubscriptionTier;
  stripeConfigured: boolean;
  billingIntervals: BillingInterval[];
  flash?: string | null;
}) {
  const defaultInterval = useMemo(
    () => billingIntervals[0] ?? "yearly",
    [billingIntervals],
  );
  const [billing, setBilling] = useState<BillingInterval>(defaultInterval);
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const current = getPlanLimits(currentTier);

  const billingNote =
    billing === "yearly"
      ? "per month, billed yearly · excl. tax"
      : "per month, billed monthly · excl. tax";

  async function startCheckout(plan: "pro" | "max") {
    setLoadingPlan(plan);
    try {
      const response = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan, interval: billing }),
      });
      const data = await response.json();
      if (!response.ok || !data.url) {
        throw new Error(
          typeof data.error === "string" ? data.error : "Checkout failed",
        );
      }
      window.location.href = data.url;
    } catch (error) {
      alert(error instanceof Error ? error.message : "Checkout failed");
      setLoadingPlan(null);
    }
  }

  async function openPortal() {
    setLoadingPlan("portal");
    try {
      const response = await fetch("/api/billing/portal", { method: "POST" });
      const data = await response.json();
      if (!response.ok || !data.url) {
        throw new Error(data.error ?? "Billing portal unavailable");
      }
      window.location.href = data.url;
    } catch (error) {
      alert(error instanceof Error ? error.message : "Billing portal failed");
      setLoadingPlan(null);
    }
  }

  return (
    <div className="space-y-6">
      {flash ? (
        <div className="rounded-xl border border-gold/25 bg-cream/60 px-4 py-3 text-sm text-near-black">
          {flash}
        </div>
      ) : null}

      <PanelCard title="Current plan" description="Your autopilot limits are based on this plan.">
        <div className="flex items-start gap-4">
          <div className="rounded-full bg-cream p-3">
            <CreditCard className="h-5 w-5 text-gold" />
          </div>
          <div>
            <p className="font-playfair text-2xl italic text-near-black">{current.label}</p>
            <p className="mt-1 text-sm text-gray-body">
              Up to {current.generateMax} posts per generation · {current.postsPerWeek} posts/week
            </p>
            {currentTier !== "free" && stripeConfigured ? (
              <TextureButton
                type="button"
                variant="secondary"
                size="sm"
                className="mt-4"
                disabled={loadingPlan === "portal"}
                onClick={() => void openPortal()}
              >
                {loadingPlan === "portal" ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Manage subscription
              </TextureButton>
            ) : null}
          </div>
        </div>
      </PanelCard>

      {billingIntervals.length > 1 ? (
        <div className="inline-flex gap-1 rounded-full border border-black/[0.06] bg-white p-1 text-sm shadow-card">
          {billingIntervals.map((interval) => (
            <TextureButton
              key={interval}
              type="button"
              variant={billing === interval ? "primary" : "minimal"}
              size="sm"
              onClick={() => setBilling(interval)}
            >
              {interval === "monthly" ? "Monthly" : "Yearly"}
              {interval === "yearly" ? (
                <span className="ml-1 text-gold">−20%</span>
              ) : null}
            </TextureButton>
          ))}
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        {(["pro", "max"] as const).map((plan) => {
          const limits = PLAN_LIMITS[plan];
          const pricing = STRIPE_PLANS[plan];
          const isCurrent = currentTier === plan;
          const displayPrice =
            billing === "yearly" ? pricing.yearlyPerMonth : pricing.monthly;

          return (
            <article
              key={plan}
              className={cn(
                "rounded-2xl border bg-white p-6 shadow-card",
                plan === "pro" ? "border-gold/30" : "border-black/[0.06]",
              )}
            >
              <p className="font-playfair text-2xl italic text-near-black">{limits.label}</p>
              <p className="mt-4 font-playfair text-4xl italic text-near-black">${displayPrice}</p>
              <p className="mt-1 text-sm text-gray-label">{billingNote}</p>
              <ul className="mt-4 space-y-2 text-sm text-gray-body">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-gold" />
                  {limits.generateMax} posts per generation
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-gold" />
                  {limits.postsPerWeek} posts/week autopilot
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-gold" />
                  AI-powered copy when configured
                </li>
              </ul>
              <TextureButton
                type="button"
                variant={isCurrent ? "secondary" : "primary"}
                size="default"
                className="mt-6 w-full"
                disabled={isCurrent || !stripeConfigured || loadingPlan === plan}
                onClick={() => void startCheckout(plan)}
              >
                {loadingPlan === plan ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {isCurrent ? "Current plan" : `Upgrade to ${limits.label}`}
              </TextureButton>
            </article>
          );
        })}
      </div>

      {!stripeConfigured ? (
        <p className="text-sm text-gray-body">
          Stripe is not configured in this environment. Add `STRIPE_SECRET_KEY` and price IDs
          (`STRIPE_PRO_YEARLY_PRICE_ID`, `STRIPE_MAX_YEARLY_PRICE_ID`, or monthly equivalents) to
          enable checkout.
        </p>
      ) : null}
    </div>
  );
}
