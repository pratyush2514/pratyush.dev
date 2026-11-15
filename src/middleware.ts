import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/admin/session";

// Everything under /admin and /api/admin needs a valid session, except the
// login page and the login endpoint. Route handlers check again on their own.
const OPEN = new Set(["/admin/login", "/api/admin/login"]);

export async function middleware(req: NextRequest) {
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

export const config = {
  matcher: ["/admin", "/admin/:path*", "/api/admin/:path*"],
};
