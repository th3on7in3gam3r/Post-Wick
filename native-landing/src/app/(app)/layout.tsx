import { AppLayoutClient } from "@/components/app/app-layout-client";
import { getAccountPlan } from "@/lib/server/account-plan";
import { getClientsForUser } from "@/lib/server/clients";
import { requireUserId } from "@/lib/server/app-data";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const userId = await requireUserId();
  const [clients, plan] = await Promise.all([
    getClientsForUser(userId),
    getAccountPlan(userId),
  ]);

  return (
    <AppLayoutClient clients={clients} plan={plan}>
      {children}
    </AppLayoutClient>
  );
}
