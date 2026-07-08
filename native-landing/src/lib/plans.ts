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

/** Monthly AI refine requests per subscription tier. */
export const REFINE_LIMITS: Record<SubscriptionTier, number> = {
  free: 5,
  pro: 50,
  max: 250,
};

export function getRefineLimit(tier: SubscriptionTier) {
  return REFINE_LIMITS[tier] ?? REFINE_LIMITS.free;
}

export type PostingFrequencyOption = 3 | 5 | 7;

/** Highest autopilot cadence (3/5/7) selectable for a plan. */
export function maxPostingFrequencyForTier(
  tier: SubscriptionTier,
): PostingFrequencyOption {
  const { postsPerWeek } = getPlanLimits(tier);
  if (postsPerWeek >= 7) return 7;
  if (postsPerWeek >= 5) return 5;
  return 3;
}

export function isPostingFrequencyAllowed(
  tier: SubscriptionTier,
  frequency: number,
): frequency is PostingFrequencyOption {
  const max = maxPostingFrequencyForTier(tier);
  return (
    (frequency === 3 || frequency === 5 || frequency === 7) && frequency <= max
  );
}

export function clampPostingFrequencyForTier(
  tier: SubscriptionTier,
  frequency: number,
): PostingFrequencyOption {
  const max = maxPostingFrequencyForTier(tier);
  if (frequency === 3 || frequency === 5 || frequency === 7) {
    return (frequency <= max ? frequency : max) as PostingFrequencyOption;
  }
  return max;
}
