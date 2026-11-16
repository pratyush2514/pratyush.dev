import { track } from "@vercel/analytics";
import type posthog from "posthog-js";
import { POSTHOG_RELAY_PATH, POSTHOG_UI_HOST } from "@/config/analytics";

type PostHog = typeof posthog;
type EventValue = string | number | boolean | null | undefined;

let posthogClient: Promise<PostHog | null> | null = null;

/**
 * Lazily loads and initialises PostHog the first time it is needed, so its
 * bundle never competes with hydration. Resolves to null when no key is
 * configured or the load fails; callers must treat it as optional.
 */
export function getPostHog(): Promise<PostHog | null> {
  if (typeof window === "undefined") return Promise.resolve(null);
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  if (!key) return Promise.resolve(null);

  if (!posthogClient) {
    posthogClient = import("posthog-js")
      .then((mod) => {
        mod.default.init(key, {
          api_host: POSTHOG_RELAY_PATH,
          ui_host: POSTHOG_UI_HOST,
          defaults: "2026-05-30",
          person_profiles: "identified_only",
          capture_pageview: false, // PostHogPageView captures App Router navigations
          capture_pageleave: true,
          autocapture: true,
        });
        return mod.default;
      })
      .catch(() => null);
  }
  return posthogClient;
}

/**
 * Sends a custom event to Vercel Analytics and, when configured, PostHog.
 * Fire-and-forget: analytics must never break an interaction.
 */
export function trackEvent(
  name: string,
  properties?: Record<string, EventValue>,
): void {
  if (typeof window === "undefined") return;
  const clean: Record<string, string | number | boolean | null> = {};
  for (const [key, value] of Object.entries(properties ?? {})) {
    if (value !== undefined) clean[key] = value;
  }
  try {
    track(name, clean);
  } catch {
    // ignore
  }
  void getPostHog().then((client) => client?.capture(name, clean));
}
