import { redirect } from "next/navigation";
import { AgencyDashboardClient } from "@/components/agency/agency-dashboard-client";
import { AppHeader } from "@/components/app/app-header";
import {
  getAgencyByOwnerUserId,
  getAgencyDashboardStats,
  getAgencyReferrals,
} from "@/lib/db";
import { agencyReferralSignupUrl } from "@/lib/agency/referral";
import { requireUserId } from "@/lib/server/app-data";

export default async function AgencyDashboardPage() {
  const userId = await requireUserId();
  const agency = await getAgencyByOwnerUserId(userId);

  if (!agency) {
    redirect("/agency/register");
  }

  const [stats, referrals] = await Promise.all([
    getAgencyDashboardStats(agency.id),
    getAgencyReferrals(agency.id),
  ]);

  const referralUrl = agencyReferralSignupUrl(agency.referralCode);

  return (
    <>
      <AppHeader
        title="Agency dashboard"
        description={`${agency.name} · partner overview and referred clients`}
      />
      <div className="flex-1 space-y-6 p-6 md:p-8">
        <AgencyDashboardClient
          agency={agency}
          referralUrl={referralUrl}
          stats={stats}
          referrals={referrals}
        />
      </div>
    </>
  );
}
