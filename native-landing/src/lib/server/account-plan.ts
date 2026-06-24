import { getOrCreateUser } from "@/lib/db";
import { getPlanLimits } from "@/lib/plans";

export async function getAccountPlan(userId: string) {
  const user = await getOrCreateUser(userId);
  return getPlanLimits(user.subscriptionTier);
}
