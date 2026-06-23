"use client";

import Link from "next/link";
import { CookieSettingsTrigger } from "@/components/cookie-settings-trigger";

export function AuthPrivacyFooter() {
  return (
    <footer className="relative z-10 shrink-0 border-t border-black/[0.06] bg-white/60 px-4 py-4 text-center backdrop-blur-sm">
      <p className="text-xs leading-relaxed text-gray-body">
        By signing in or creating an account, you agree to our{" "}
        <Link
          href="/terms"
          className="font-medium text-near-black underline decoration-black/25 underline-offset-2 hover:decoration-black/50"
        >
          Terms of Service
        </Link>
        ,{" "}
        <Link
          href="/privacy"
          className="font-medium text-near-black underline decoration-black/25 underline-offset-2 hover:decoration-black/50"
        >
          Privacy Policy
        </Link>
        , and{" "}
        <Link
          href="/cookies"
          className="font-medium text-near-black underline decoration-black/25 underline-offset-2 hover:decoration-black/50"
        >
          Cookie Policy
        </Link>
        .{" "}
        <CookieSettingsTrigger className="font-medium text-near-black underline decoration-black/25 underline-offset-2 hover:decoration-black/50" />
      </p>
    </footer>
  );
}
