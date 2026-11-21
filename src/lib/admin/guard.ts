import "server-only";
import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import { SITE } from "@/lib/site";
import { SESSION_COOKIE, verifySessionToken } from "./session";

export async function isAdmin(): Promise<boolean> {
  const jar = await cookies();
  return verifySessionToken(jar.get(SESSION_COOKIE)?.value);
}

/**
 * Returns a response to send back when the request is not allowed, or null
 * when it may proceed. Writes must also come from this site's own pages.
 */
export async function guard(req: NextRequest): Promise<NextResponse | null> {
  if (req.method !== "GET" && !sameOrigin(req)) {
    return NextResponse.json({ error: "Bad origin" }, { status: 403 });
  }
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}

export function sameOrigin(req: NextRequest): boolean {
  const origin = req.headers.get("origin");
  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
  if (!origin || !host) return false;
  try {
    const from = new URL(origin);
    // The classic site on `main` can serve this deployment on the canonical
    // domain, so the request arrives here under the deployment's own host.
    return from.host === host || from.origin === new URL(SITE.url).origin;
  } catch {
    return false;
  }
}
