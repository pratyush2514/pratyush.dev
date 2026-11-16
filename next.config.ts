import type { NextConfig } from "next";
import {
  POSTHOG_ASSETS_HOST,
  POSTHOG_INGEST_HOST,
  POSTHOG_RELAY_PATH,
} from "./src/config/analytics";

const isDev = process.env.NODE_ENV === "development";

// Design media and the resume live in Supabase Storage. Admin uploads PUT
// straight to a signed Supabase URL from the browser.
const supabase = (process.env.SUPABASE_URL ?? "https://nqysiprpmxxombsdvdkh.supabase.co").replace(/\/$/, "");

// PostHog ingestion and its asset CDN, for both US and EU clouds.
const posthog =
  "https://us.i.posthog.com https://us-assets.i.posthog.com https://eu.i.posthog.com https://eu-assets.i.posthog.com";

const securityHeaders = [
  { key: "X-DNS-Prefetch-Control", value: "on" },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""} https://va.vercel-scripts.com ${posthog}`,
      "style-src 'self' 'unsafe-inline'",
      `img-src 'self' data: blob: ${supabase} https://avatars.githubusercontent.com https://github.com`,
      `media-src 'self' blob: ${supabase}`,
      "font-src 'self' data:",
      `connect-src 'self' ${supabase} https://api.github.com https://va.vercel-scripts.com https://vitals.vercel-insights.com ${posthog}`,
      // The craft gallery embeds its own static HTML demos from /public/craft.
      "frame-src 'self'",
      "frame-ancestors 'self'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  // PostHog endpoints end in a slash (/e/, /flags/). Without this, Next.js
  // answers every event batch with a 308 first. Pages set canonical URLs, so
  // a trailing-slash variant of a page never competes in search.
  skipTrailingSlashRedirect: true,
  async rewrites() {
    // Reverse proxy for PostHog. The specific asset rules must come before the
    // catch-all, which would otherwise match them first.
    return [
      {
        source: `${POSTHOG_RELAY_PATH}/static/:path*`,
        destination: `${POSTHOG_ASSETS_HOST}/static/:path*`,
      },
      {
        source: `${POSTHOG_RELAY_PATH}/array/:path*`,
        destination: `${POSTHOG_ASSETS_HOST}/array/:path*`,
      },
      {
        source: `${POSTHOG_RELAY_PATH}/:path*`,
        destination: `${POSTHOG_INGEST_HOST}/:path*`,
      },
    ];
  },
  outputFileTracingIncludes: {
    "/**": ["./src/lib/fonts/**/*"],
    "/opengraph-image": ["./public/images/og/garden.png"],
  },
  images: {
    formats: ["image/avif", "image/webp"],
    // Resized copies stay cached for 31 days instead of the 4-hour default,
    // so repeat visits and new visitors hit the cache, not the optimizer.
    minimumCacheTTL: 60 * 60 * 24 * 31,
    remotePatterns: [
      { protocol: "https", hostname: new URL(supabase).hostname },
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
    ],
  },
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "react-icons",
      "date-fns",
      "motion",
      "radix-ui",
      "@hugeicons/react",
      "@hugeicons/core-free-icons",
    ],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
      {
        // Vercel serves files from /public with `max-age=0, must-revalidate`,
        // so every visit re-checks every image and sound. These rarely change:
        // cache them for 30 days and refresh in the background for a day after.
        source: "/:all*(svg|png|jpg|jpeg|webp|avif|gif|ico|mp3|woff2)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=2592000, stale-while-revalidate=86400",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
