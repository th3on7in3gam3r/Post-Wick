"use client";

import Link from "next/link";
import { useState } from "react";
import { TextureButton } from "@/components/ui/texture-button";
import { PRICING_SIGN_UP_HREF } from "@/lib/auth-routes";
import { PLAN_LIMITS } from "@/lib/plans";
import { formatAnnualCharge, plans, YEARLY_SAVE_LABEL } from "@/lib/pricing";
import { cn } from "@/lib/utils";

const ACTIVE_CHANNELS = ["Facebook", "Instagram", "LinkedIn", "Pinterest"] as const;
const COMING_SOON_CHANNELS = ["X", "TikTok", "Reddit", "Bluesky"] as const;

type BillingCycle = "monthly" | "yearly";

export function Pricing() {
  const [billing, setBilling] = useState<BillingCycle>("yearly");

  const proPrice =
    billing === "yearly" ? plans.pro.yearlyPerMonth : plans.pro.monthly;
  const maxPrice =
    billing === "yearly" ? plans.max.yearlyPerMonth : plans.max.monthly;
  const billingNote =
    billing === "yearly"
      ? "per month, billed yearly"
      : "per month, billed monthly · excl. tax";

  return (
    <section id="pricing" className="scroll-mt-32 bg-cream-dark px-10 py-24">
      <div className="mx-auto max-w-[1200px]">
        <div className="relative overflow-hidden rounded-3xl">
          <div
            className="absolute inset-0 bg-cover bg-[50%_35%] bg-no-repeat"
            style={{ backgroundImage: "url('/images/pricing-autopilot-watercolor.png')" }}
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#1E1035]/20 via-[#3D2463]/10 to-cream-dark/92" />

          <div className="relative z-10 px-6 py-12 md:px-12 md:py-16">
            <p className="step-label text-[#E9D5FF]">Pricing</p>
            <h2 className="mt-3 font-playfair text-[clamp(2rem,4vw,3rem)] italic text-[#F2EBD9] drop-shadow-md">
              One plan for autopilot.
            </h2>
            <p className="body-copy mt-3 max-w-xl text-[#EDE8F5]">
              Pick the batch size that matches your posting rhythm. Free includes{" "}
              {PLAN_LIMITS.free.generateMax} posts to try the workflow.
            </p>

            <div className="mt-6 inline-flex gap-1 rounded-full bg-white/90 p-1 text-sm shadow-card backdrop-blur-sm">
              <TextureButton
                type="button"
                variant={billing === "monthly" ? "primary" : "minimal"}
                size="sm"
                onClick={() => setBilling("monthly")}
              >
                Monthly
              </TextureButton>
              <TextureButton
                type="button"
                variant={billing === "yearly" ? "primary" : "minimal"}
                size="sm"
                onClick={() => setBilling("yearly")}
              >
                Yearly
                <span className="text-gold"> · {YEARLY_SAVE_LABEL}</span>
              </TextureButton>
            </div>

            <div className="mt-12 grid gap-6 md:grid-cols-2">
              <div className="rounded-2xl border-2 border-gold bg-white/95 p-8 shadow-card backdrop-blur-sm">
                <p className="text-[0.7rem] font-semibold uppercase tracking-[0.15em] text-gold">
                  Best for growth
                </p>
                <h3 className="mt-2 font-playfair text-2xl italic">Pro</h3>
                <p className="mt-2 text-sm text-gray-body">
                  Up to {PLAN_LIMITS.pro.generateMax} posts per generation batch.
                </p>
                <p className="mt-6 font-playfair text-5xl italic text-near-black">
                  ${proPrice}
                </p>
                <p className="text-sm text-gray-label">{billingNote}</p>
                {billing === "yearly" ? (
                  <p className="mt-0.5 text-sm text-gray-label">
                    {formatAnnualCharge("pro")}
                  </p>
                ) : null}
                <ul className="mt-6 space-y-2 text-sm text-gray-body">
                  <li>
                    Up to {PLAN_LIMITS.pro.generateMax} posts per batch, ready for approval
                  </li>
                  <li>Up to {PLAN_LIMITS.pro.postsPerWeek} posts/week on autopilot</li>
                  <li>Tailored to your tone and industry</li>
                  <li>Live publishing: Facebook, Instagram, LinkedIn</li>
                  <li>Auto-publishing once you approve</li>
                  <li>Post history and publishing status</li>
                </ul>
                <TextureButton asChild variant="primary" size="lg" className="mt-8 flex w-full">
                  <Link href={PRICING_SIGN_UP_HREF} className="w-full">
                    See your own posts
                  </Link>
                </TextureButton>
              </div>

              <div className="rounded-2xl border border-black/[0.06] bg-white/95 p-8 shadow-card backdrop-blur-sm">
                <p className="text-[0.7rem] font-semibold uppercase tracking-[0.15em] text-gray-label">
                  For teams scaling
                </p>
                <h3 className="mt-2 font-playfair text-2xl italic">Max</h3>
                <p className="mt-2 text-sm text-gray-body">
                  Up to {PLAN_LIMITS.max.generateMax} posts per generation batch.
                </p>
                <p className="mt-6 font-playfair text-5xl italic text-near-black">
                  ${maxPrice}
                </p>
                <p className="text-sm text-gray-label">{billingNote}</p>
                {billing === "yearly" ? (
                  <p className="mt-0.5 text-sm text-gray-label">
                    {formatAnnualCharge("max")}
                  </p>
                ) : null}
                <ul className="mt-6 space-y-2 text-sm text-gray-body">
                  <li>Everything in Pro, plus</li>
                  <li>
                    Up to {PLAN_LIMITS.max.generateMax} posts per batch (
                    {PLAN_LIMITS.max.postsPerWeek}/week on autopilot)
                  </li>
                  <li>Priority support</li>
                  <li>Early access to new features</li>
                </ul>
                <TextureButton asChild variant="secondary" size="lg" className="mt-8 flex w-full">
                  <Link href={PRICING_SIGN_UP_HREF} className="w-full">
                    Get started with Max
                  </Link>
                </TextureButton>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 rounded-2xl border border-black/[0.08] bg-white/80 p-8 shadow-card">
          <p className="text-center text-sm text-gray-body">
            Live publishing is available on the channels marked active. Others are on the roadmap.
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-3">
            {ACTIVE_CHANNELS.map((channel) => (
              <TextureButton
                key={channel}
                type="button"
                variant="secondary"
                size="sm"
                className="pointer-events-none"
              >
                {channel}
              </TextureButton>
            ))}
            {COMING_SOON_CHANNELS.map((channel) => (
              <span
                key={channel}
                className={cn(
                  "inline-flex items-center gap-2 rounded-full border border-black/[0.08]",
                  "bg-white px-4 py-2 text-sm text-gray-body shadow-sm",
                )}
              >
                {channel}
                <span className="rounded-full bg-cream px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wide text-gray-label">
                  Coming soon
                </span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
