/** Pulse Growth Intelligence — cookieless tracker for kerygmasocial.com. */

export const PULSE_SCRIPT_SRC = "https://pulse-5o1m.onrender.com/pulse.js";
export const PULSE_SITE_ID = "site_msxlvoq3";
export const PULSE_HOST = "https://pulse-5o1m.onrender.com";

export type PulseGrowthEvent =
  | "pageview"
  | "signup"
  | "trial_started"
  | "pricing_viewed"
  | "checkout_completed"
  | (string & {});

export type PulseProperties = Record<string, unknown>;

type PulseTracker = {
  track: (eventName: PulseGrowthEvent, properties?: PulseProperties) => void;
};

declare global {
  interface Window {
    Pulse?: PulseTracker;
  }
}

function sendPulse(eventName: PulseGrowthEvent, properties?: PulseProperties) {
  window.Pulse?.track(eventName, properties);
}

/**
 * Track high-value conversion actions. Safe on the server (no-op).
 * Retries once if the deferred Pulse snippet has not attached yet.
 */
export const trackPulseEvent = (
  eventName: PulseGrowthEvent,
  properties?: PulseProperties,
) => {
  if (typeof window === "undefined") return;

  if (window.Pulse) {
    sendPulse(eventName, properties);
    return;
  }

  window.setTimeout(() => sendPulse(eventName, properties), 400);
};

export function trackPulsePageview() {
  trackPulseEvent("pageview");
}
