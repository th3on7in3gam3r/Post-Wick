"use client";

import Link from "next/link";
import { useEffect } from "react";
import { TextureButton } from "@/components/ui/texture-button";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-cream px-6 text-center">
      <h1 className="font-playfair text-2xl text-near-black">Something went wrong</h1>
      <p className="mt-3 max-w-md text-sm text-gray-body">
        The app could not load your dashboard. This usually means{" "}
        <code className="text-near-black">DATABASE_URL</code> is missing or invalid in
        Vercel environment variables.
      </p>
      <p className="mt-2 text-xs text-gray-label">
        Check <Link href="/api/health" className="text-gold underline">/api/health</Link>
        {error.digest ? ` · digest ${error.digest}` : null}
      </p>
      <div className="mt-6 flex gap-3">
        <TextureButton variant="primary" size="default" onClick={reset}>
          Try again
        </TextureButton>
        <TextureButton asChild variant="secondary" size="default">
          <Link href="/">Home</Link>
        </TextureButton>
      </div>
    </div>
  );
}
