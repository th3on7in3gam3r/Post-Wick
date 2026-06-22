"use client";

import { useState } from "react";
import { Check, CreditCard, Loader2 } from "lucide-react";
import { PanelCard } from "@/components/app/panel-card";
import { TextureButton } from "@/components/ui/texture-button";
import { getPlanLimits, PLAN_LIMITS, type SubscriptionTier } from "@/lib/plans";
import { STRIPE_PLANS } from "@/lib/stripe";

export function BillingClient({
  currentTier,
  stripeConfigured,
  flash,
}: {
  currentTier: SubscriptionTier;
  stripeConfigured: boolean;
  flash?: string | null;
}) {
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const current = getPlanLimits(currentTier);

  async function startCheckout(plan: "pro" | "max") {
    setLoadingPlan(plan);
    try {
      const response = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const data = await response.json();
      if (!response.ok || !data.url) {
        throw new Error(data.error ?? "Checkout failed");
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

      <div className="grid gap-4 md:grid-cols-2">
        {(["pro", "max"] as const).map((plan) => {
          const limits = PLAN_LIMITS[plan];
          const pricing = STRIPE_PLANS[plan];
          const isCurrent = currentTier === plan;

          return (
            <article
              key={plan}
              className="rounded-2xl border border-black/[0.06] bg-white p-6 shadow-card"
            >
              <p className="font-playfair text-2xl italic text-near-black">{limits.label}</p>
              <p className="mt-2 text-sm text-gray-body">
                From ${pricing.yearlyPerMonth}/mo billed yearly
              </p>
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
          Stripe is not configured in this environment. Add `STRIPE_SECRET_KEY`, `STRIPE_PRO_PRICE_ID`,
          and `STRIPE_MAX_PRICE_ID` to enable checkout.
        </p>
      ) : null}
    </div>
  );
}
