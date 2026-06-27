"use client";

import { useUser } from "@clerk/nextjs";
import { sidebarWelcomeLabel, userFirstName } from "@/lib/user-greeting";

export function SidebarWelcome({ hasBrands }: { hasBrands: boolean }) {
  const { user, isLoaded } = useUser();

  if (!isLoaded) {
    return (
      <div className="px-2 pb-1" aria-hidden>
        <div className="h-4 w-32 animate-pulse rounded bg-white/10" />
      </div>
    );
  }

  const firstName = userFirstName(user?.firstName, user?.fullName);
  const label = sidebarWelcomeLabel(hasBrands, firstName);

  return (
    <p className="px-2 font-playfair text-[1.05rem] italic leading-snug text-cream">{label}</p>
  );
}
