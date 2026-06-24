import { AppLayoutClient } from "@/components/app/app-layout-client";
import { getClientsForUser } from "@/lib/server/clients";
import { requireUserId } from "@/lib/server/app-data";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const userId = await requireUserId();
  const clients = await getClientsForUser(userId);

  return <AppLayoutClient clients={clients}>{children}</AppLayoutClient>;
}
