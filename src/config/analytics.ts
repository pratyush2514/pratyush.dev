// PostHog is served through this site's own domain (Next.js rewrites in
// next.config.ts), so ad blockers that filter by analytics domain don't drop
// events. The path is deliberately unremarkable: blocklists catch names like
// /analytics, /posthog or /ingest.
export const POSTHOG_RELAY_PATH = "/sp";

/** Ingestion host for your PostHog region, e.g. https://us.i.posthog.com. */
export const POSTHOG_INGEST_HOST = (
  process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com"
).replace(/\/$/, "");

/** Static assets and remote config live on the matching -assets host. */
export const POSTHOG_ASSETS_HOST = POSTHOG_INGEST_HOST.replace(
  ".i.posthog.com",
  "-assets.i.posthog.com",
);

/** The PostHog app itself, so toolbar and replay links open the real UI. */
export const POSTHOG_UI_HOST = POSTHOG_INGEST_HOST.replace(".i.posthog.com", ".posthog.com");
