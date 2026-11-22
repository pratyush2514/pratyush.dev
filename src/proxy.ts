import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/admin/session";
import {
  CLASSIC_HOME_PATH,
  SITE_SWITCHED_COOKIE,
  SITE_SWITCH_PATH,
  SITE_VERSION_COOKIE,
  SWITCH_TARGETS,
  type SiteVersion,
} from "@/lib/site-version";

// --- Rate limiting for public API routes -----------------------------------
// Best-effort token bucket, per function instance (module state is not shared
// across instances). A first line of defence; use the Vercel Firewall for more.
const RATE_LIMIT = 30; // requests
const RATE_WINDOW_MS = 60_000; // per minute
const MAX_BUCKETS = 5000;
const BUCKET_TTL_MS = 300_000;
const buckets = new Map<string, { tokens: number; updatedAt: number }>();

function allowRequest(ip: string): boolean {
  const now = Date.now();
  if (buckets.size >= MAX_BUCKETS) {
    for (const [key, b] of buckets) {
      if (now - b.updatedAt > BUCKET_TTL_MS) buckets.delete(key);
    }
  }
  const bucket = buckets.get(ip);
  if (!bucket) {
    buckets.set(ip, { tokens: RATE_LIMIT - 1, updatedAt: now });
    return true;
  }
  bucket.tokens = Math.min(
    RATE_LIMIT,
    bucket.tokens + (now - bucket.updatedAt) * (RATE_LIMIT / RATE_WINDOW_MS),
  );
  bucket.updatedAt = now;
  if (bucket.tokens < 1) return false;
  bucket.tokens -= 1;
  return true;
}

// --- Admin session gate -----------------------------------------------------
// Everything under /admin and /api/admin needs a valid session, except the
// login page and the login endpoint. Route handlers check again on their own.
const OPEN = new Set(["/admin/login", "/api/admin/login"]);

async function guardAdmin(req: NextRequest): Promise<NextResponse> {
  const { pathname } = req.nextUrl;
  const signedIn = await verifySessionToken(req.cookies.get(SESSION_COOKIE)?.value);

  let res: NextResponse;
  if (OPEN.has(pathname)) {
    res =
      signedIn && pathname === "/admin/login"
        ? NextResponse.redirect(new URL("/admin", req.url))
        : NextResponse.next();
  } else if (signedIn) {
    res = NextResponse.next();
  } else if (pathname.startsWith("/api/")) {
    res = NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  } else {
    res = NextResponse.redirect(new URL("/admin/login", req.url));
  }
  res.headers.set("X-Robots-Tag", "noindex, nofollow");
  res.headers.set("Cache-Control", "private, no-store");
  return res;
}

// --- Classic / new home page ------------------------------------------------
// One URL, two home pages. Visitors see the classic portfolio until they pick
// the new one; the choice lives in a cookie and the address bar never changes.
const ONE_YEAR = 60 * 60 * 24 * 365;

function switchVersion(req: NextRequest): NextResponse {
  const version: SiteVersion = req.nextUrl.searchParams.get("v") === "new" ? "new" : "classic";
  const next = req.nextUrl.searchParams.get("next") ?? "/";
  const res = NextResponse.redirect(new URL(SWITCH_TARGETS.has(next) ? next : "/", req.url), 303);
  const secure = req.nextUrl.protocol === "https:";
  res.cookies.set(SITE_VERSION_COOKIE, version, { path: "/", maxAge: ONE_YEAR, sameSite: "lax", secure });
  // Readable by the page, which counts the switch in analytics and clears it.
  res.cookies.set(SITE_SWITCHED_COOKIE, version, { path: "/", maxAge: 60, sameSite: "lax", secure });
  res.headers.set("Cache-Control", "private, no-store");
  res.headers.set("X-Robots-Tag", "noindex");
  return res;
}

function homeFor(req: NextRequest): NextResponse {
  if (req.cookies.get(SITE_VERSION_COOKIE)?.value === "new") return NextResponse.next();
  return NextResponse.rewrite(new URL(CLASSIC_HOME_PATH, req.url));
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname === SITE_SWITCH_PATH) return switchVersion(req);
  if (pathname === "/") return homeFor(req);
  // /classic is internal; a direct visit picks the classic version instead.
  if (pathname === CLASSIC_HOME_PATH) {
    const url = new URL(SITE_SWITCH_PATH, req.url);
    url.searchParams.set("v", "classic");
    return NextResponse.redirect(url, 307);
  }

  // Rate-limit the public API surface. Admin routes are gated by session instead.
  if (pathname.startsWith("/api/") && !pathname.startsWith("/api/admin/")) {
    const ip =
      req.headers.get("x-forwarded-for")?.split(",").at(-1)?.trim() ||
      req.headers.get("x-real-ip") ||
      "unknown";
    if (!allowRequest(ip)) {
      return NextResponse.json(
        { error: "Too many requests. Please slow down." },
        { status: 429, headers: { "Retry-After": "60" } },
      );
    }
    return NextResponse.next();
  }

  if (pathname === "/admin" || pathname.startsWith("/admin/") || pathname.startsWith("/api/admin/")) {
    return guardAdmin(req);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/__site", "/classic", "/admin", "/admin/:path*", "/api/:path*"],
};
