import { AppLayoutClient } from "@/components/app/app-layout-client";
import { getAccountPlan } from "@/lib/server/account-plan";
import { applyAgencyReferralFromCookie } from "@/lib/server/agency-referral";
import { getClientsForUser } from "@/lib/server/clients";
import { requireUserId } from "@/lib/server/app-data";
import { getAgencyByOwnerUserId } from "@/lib/db";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const userId = await requireUserId();
  await applyAgencyReferralFromCookie(userId);

  const [clients, plan, agency] = await Promise.all([
    getClientsForUser(userId),
    getAccountPlan(userId),
    getAgencyByOwnerUserId(userId),
  ]);

  return (
    <AppLayoutClient clients={clients} plan={plan} hasAgency={Boolean(agency)}>
      {children}
    </AppLayoutClient>
  );
}
