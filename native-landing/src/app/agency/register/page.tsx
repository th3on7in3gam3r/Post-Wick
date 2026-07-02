import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import {
  AgencyRegisterClient,
  AgencyRegisterGuest,
} from "@/components/agency/agency-register-client";
import { MarketingShell } from "@/components/marketing-shell";
import { getAgencyByOwnerUserId } from "@/lib/db";
import { createPageMetadata } from "@/lib/metadata";

const description =
  "Register as a Kerygma Social agency partner, get a referral link, and track referred clients.";

export const metadata = createPageMetadata({
  title: "Agency Registration",
  description,
  ogTitle: "Agency Partner Program | Kerygma Social",
  ogDescription: description,
  path: "/agency/register",
});

export default async function AgencyRegisterPage() {
  const { userId } = await auth();

  if (!userId) {
    return (
      <MarketingShell wide>
        <AgencyRegisterGuest />
      </MarketingShell>
    );
  }

  const agency = await getAgencyByOwnerUserId(userId);
  if (agency) {
    redirect("/agency/dashboard");
  }

  const clerkUser = await currentUser();
  const defaultEmail = clerkUser?.emailAddresses[0]?.emailAddress ?? null;

  return (
    <MarketingShell wide>
      <AgencyRegisterClient defaultEmail={defaultEmail} />
    </MarketingShell>
  );
}
