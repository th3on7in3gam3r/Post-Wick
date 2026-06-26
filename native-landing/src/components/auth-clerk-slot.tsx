"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const hasClerkKey = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

export function AuthClerkSlot({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const [clerkVisible, setClerkVisible] = useState(false);

  useEffect(() => {
    setMounted(true);

    const checkForClerk = () => {
      const hasClerkNode = Boolean(
        document.querySelector(".cl-rootBox, .cl-card, [data-clerk-component]"),
      );
      if (hasClerkNode) {
        setClerkVisible(true);
      }
    };

    checkForClerk();
    const observer = new MutationObserver(checkForClerk);
    observer.observe(document.body, { childList: true, subtree: true });

    const timeout = window.setTimeout(checkForClerk, 2500);

    return () => {
      observer.disconnect();
      window.clearTimeout(timeout);
    };
  }, []);

  if (!hasClerkKey) {
    return (
      <div className="w-full rounded-2xl border border-[#dddddd] bg-white/95 px-6 py-8 text-center shadow-[0_12px_48px_rgba(0,0,0,0.14)]">
        <p className="font-playfair text-lg italic text-near-black">Sign-in unavailable</p>
        <p className="mt-2 text-sm text-gray-body">
          Clerk authentication is not configured for this deployment. Add your production
          Clerk keys to the hosting environment.
        </p>
        <Link href="/" className="mt-4 inline-block text-sm font-medium text-gold hover:opacity-80">
          ← Back to homepage
        </Link>
      </div>
    );
  }

  return (
    <div className="relative w-full min-h-[380px]">
      {children}
      {mounted && !clerkVisible ? (
        <div
          className="absolute inset-0 flex items-center justify-center rounded-2xl border border-[#dddddd] bg-white/95 px-6 py-8 text-center shadow-[0_12px_48px_rgba(0,0,0,0.14)]"
          aria-live="polite"
        >
          <div>
            <p className="font-playfair text-lg italic text-near-black">Loading sign-in…</p>
            <p className="mt-2 text-sm text-gray-body">
              If this stays blank, confirm <strong className="font-medium">kerygmasocial.com</strong>{" "}
              is added in your Clerk dashboard under Domains and redirect URLs.
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
}
