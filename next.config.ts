import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";

// Design media and the resume live in Supabase Storage. Admin uploads PUT
// straight to a signed Supabase URL from the browser.
const supabase = (process.env.SUPABASE_URL ?? "https://nqysiprpmxxombsdvdkh.supabase.co").replace(/\/$/, "");

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
      `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""} https://va.vercel-scripts.com`,
      "style-src 'self' 'unsafe-inline'",
      `img-src 'self' data: blob: ${supabase} https://avatars.githubusercontent.com https://github.com`,
      `media-src 'self' blob: ${supabase}`,
      "font-src 'self' data:",
      `connect-src 'self' ${supabase} https://api.github.com https://va.vercel-scripts.com https://vitals.vercel-insights.com`,
      // The craft gallery embeds its own static HTML demos from /public/craft.
      "frame-src 'self'",
      "frame-ancestors 'self'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  outputFileTracingIncludes: {
    "/**": ["./src/lib/fonts/**/*"],
    "/opengraph-image": ["./public/images/og/garden.png"],
  },
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      { protocol: "https", hostname: new URL(supabase).hostname },
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
    ],
  },
  experimental: {
    optimizePackageImports: ["lucide-react", "react-icons", "date-fns"],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
