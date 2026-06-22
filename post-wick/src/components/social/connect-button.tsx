"use client";

import { Button } from "@/components/ui/button";
import { PlatformBadge } from "./platform-badge";

interface ConnectButtonProps {
  platform: string;
  brandId: string;
  connected?: boolean;
}

export function ConnectButton({
  platform,
  brandId,
  connected = false,
}: ConnectButtonProps) {
  function handleConnect() {
    window.location.href = `/api/social/${platform}/connect?brandId=${brandId}`;
  }

  return (
    <div className="flex items-center justify-between rounded-md border border-brand-border p-4">
      <PlatformBadge platform={platform} />
      <Button
        variant={connected ? "secondary" : "primary"}
        size="sm"
        onClick={handleConnect}
        disabled={connected}
      >
        {connected ? "Connected" : "Connect"}
      </Button>
    </div>
  );
}
