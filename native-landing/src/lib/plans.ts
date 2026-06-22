export type SubscriptionTier = "free" | "pro" | "max";

export const PLAN_LIMITS: Record<
  SubscriptionTier,
  { label: string; initialPosts: number; generateMax: number; postsPerWeek: number }
> = {
  free: { label: "Free", initialPosts: 8, generateMax: 8, postsPerWeek: 3 },
  pro: { label: "Pro", initialPosts: 21, generateMax: 21, postsPerWeek: 21 },
  max: { label: "Max", initialPosts: 50, generateMax: 50, postsPerWeek: 50 },
};

export function getPlanLimits(tier: SubscriptionTier) {
  return PLAN_LIMITS[tier] ?? PLAN_LIMITS.free;
}
