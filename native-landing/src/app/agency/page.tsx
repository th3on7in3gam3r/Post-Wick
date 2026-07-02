import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getAgencyByOwnerUserId } from "@/lib/db";

export default async function AgencyIndexPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/agency/register");
  }

  const agency = await getAgencyByOwnerUserId(userId);
  redirect(agency ? "/agency/dashboard" : "/agency/register");
}
