import { getOrCreateUser } from "@/lib/db";
import { getPlanLimits, type SubscriptionTier } from "@/lib/plans";

export type AccountPlan = ReturnType<typeof getPlanLimits> & {
  tier: SubscriptionTier;
};

export async function getAccountPlan(userId: string): Promise<AccountPlan> {
  const user = await getOrCreateUser(userId);
  return {
    tier: user.subscriptionTier,
    ...getPlanLimits(user.subscriptionTier),
  };
}
