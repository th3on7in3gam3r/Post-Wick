"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { trackPulseEvent, trackPulsePageview, type PulseGrowthEvent, type PulseProperties } from "@/lib/pulse";

/**
 * SPA route changes. Initial pageview is sent by the server-rendered Pulse snippet.
 */
export function PulseAnalytics() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isFirstLoad = useRef(true);

  useEffect(() => {
    if (isFirstLoad.current) {
      isFirstLoad.current = false;
      return;
    }

    trackPulsePageview();
  }, [pathname, searchParams]);

  return null;
}

/** Fire a Pulse event once when this tree mounts (e.g. /pricing viewed). */
export function PulseViewEvent({
  event,
  properties,
}: {
  event: PulseGrowthEvent;
  properties?: PulseProperties;
}) {
  useEffect(() => {
    trackPulseEvent(event, properties);
    // Intentionally once per mount; properties are snapshot at first render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [event]);

  return null;
}

/** Fire a Pulse event at most once per browser tab (e.g. trial started after sign-up). */
export function PulseOnceEvent({
  event,
  storageKey,
  properties,
}: {
  event: PulseGrowthEvent;
  storageKey: string;
  properties?: PulseProperties;
}) {
  useEffect(() => {
    try {
      if (sessionStorage.getItem(storageKey)) return;
      sessionStorage.setItem(storageKey, "1");
    } catch {
      // Private mode / blocked storage — still send once this session in memory.
    }
    trackPulseEvent(event, properties);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [event, storageKey]);

  return null;
}
