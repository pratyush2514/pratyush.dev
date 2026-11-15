import { track } from "@vercel/analytics";

type EventValue = string | number | boolean | null | undefined;

/**
 * Sends a custom event to Vercel Analytics. Fire-and-forget: analytics must
 * never break an interaction, so failures are swallowed.
 */
export function trackEvent(
  name: string,
  properties?: Record<string, EventValue>,
): void {
  if (typeof window === "undefined") return;
  try {
    const clean: Record<string, string | number | boolean | null> = {};
    for (const [key, value] of Object.entries(properties ?? {})) {
      if (value !== undefined) clean[key] = value;
    }
    track(name, clean);
  } catch {
    // ignore
  }
}
