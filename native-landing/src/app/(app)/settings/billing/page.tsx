import { AppHeader } from "@/components/app/app-header";
import { BillingClient } from "@/components/app/billing-client";
import { getOrCreateUser } from "@/lib/db";
import { requireUserId } from "@/lib/server/app-data";
import { isStripeConfigured } from "@/lib/stripe";

function flashMessage(searchParams: { success?: string; canceled?: string }) {
  if (searchParams.success) {
    return "Subscription updated. Your new plan limits are active.";
  }
  if (searchParams.canceled) {
    return "Checkout canceled. You can upgrade anytime.";
  }
  return null;
}

export default async function BillingPage({
  searchParams,
}: {
  searchParams: { success?: string; canceled?: string };
}) {
  const userId = await requireUserId();
  const user = getOrCreateUser(userId);

  return (
    <>
      <AppHeader title="Billing" description="Plan and subscription management." />
      <div className="flex-1 space-y-6 p-6 md:p-8">
        <BillingClient
          currentTier={user.subscriptionTier}
          stripeConfigured={isStripeConfigured()}
          flash={flashMessage(searchParams)}
        />
      </div>
    </>
  );
}
