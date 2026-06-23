import { BillingClient } from "@/components/app/billing-client";
import { SettingsShell } from "@/components/app/settings-shell";
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
  const user = await getOrCreateUser(userId);

  return (
    <SettingsShell title="Billing" description="Plan and subscription management.">
      <BillingClient
        currentTier={user.subscriptionTier}
        stripeConfigured={isStripeConfigured()}
        flash={flashMessage(searchParams)}
      />
    </SettingsShell>
  );
}
