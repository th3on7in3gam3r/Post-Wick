"use client";

import Link from "next/link";
import type { ComponentProps } from "react";
import { trackPulseEvent, type PulseGrowthEvent, type PulseProperties } from "@/lib/pulse";

type PulseTrackedLinkProps = ComponentProps<typeof Link> & {
  pulseEvent: PulseGrowthEvent;
  pulseProperties?: PulseProperties;
};

export function PulseTrackedLink({
  pulseEvent,
  pulseProperties,
  onClick,
  ...props
}: PulseTrackedLinkProps) {
  return (
    <Link
      {...props}
      onClick={(event) => {
        trackPulseEvent(pulseEvent, pulseProperties);
        onClick?.(event);
      }}
    />
  );
}
