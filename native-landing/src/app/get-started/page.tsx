import { redirect } from "next/navigation";

export default function GetStartedPage({
  searchParams,
}: {
  searchParams: { ref?: string };
}) {
  const params = new URLSearchParams();
  params.set("redirect_url", "/onboarding");

  if (searchParams.ref?.trim()) {
    params.set("ref", searchParams.ref.trim());
  }

  redirect(`/sign-up?${params.toString()}`);
}
