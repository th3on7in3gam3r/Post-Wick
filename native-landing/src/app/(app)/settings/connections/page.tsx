import { redirect } from "next/navigation";

export default function ConnectionsPage({
  searchParams,
}: {
  searchParams: { connected?: string; error?: string };
}) {
  const params = new URLSearchParams();
  if (searchParams.connected) {
    params.set("connected", searchParams.connected);
  }
  if (searchParams.error) {
    params.set("error", searchParams.error);
  }

  const query = params.toString();
  redirect(query ? `/settings/integrations?${query}` : "/settings/integrations");
}
