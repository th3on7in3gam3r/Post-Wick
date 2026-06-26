import { getOrCreateUser, incrementUserRefineUsage, syncUserRefineUsagePeriod } from "@/lib/db";
import { getRefineLimit, type SubscriptionTier } from "@/lib/plans";

export const REFINE_LIMIT_MESSAGE =
  "You've used your refine credits for this month. Upgrade to get more.";

export class RefineLimitError extends Error {
  constructor() {
    super(REFINE_LIMIT_MESSAGE);
    this.name = "RefineLimitError";
  }
}

function currentUsagePeriod(now = new Date()) {
  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

export type RefineUsageSnapshot = {
  used: number;
  limit: number;
  period: string;
  tier: SubscriptionTier;
};

export async function getRefineUsage(userId: string): Promise<RefineUsageSnapshot> {
  let user = await getOrCreateUser(userId);
  const period = currentUsagePeriod();

  if (user.refineUsagePeriod !== period) {
    user = await syncUserRefineUsagePeriod(userId, period);
  }

  const tier = user.subscriptionTier;
  return {
    used: user.refineUsageCount,
    limit: getRefineLimit(tier),
    period,
    tier,
  };
}

export async function assertRefineAllowed(userId: string): Promise<RefineUsageSnapshot> {
  const usage = await getRefineUsage(userId);
  if (usage.used >= usage.limit) {
    throw new RefineLimitError();
  }
  return usage;
}

export async function recordRefineUsage(userId: string) {
  const period = currentUsagePeriod();
  await incrementUserRefineUsage(userId, period);
}
