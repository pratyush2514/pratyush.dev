import { createHash, timingSafeEqual } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { sameOrigin } from "@/lib/admin/guard";
import { SESSION_COOKIE, SESSION_MAX_AGE, createSessionToken } from "@/lib/admin/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Failed attempts per IP. Per server instance only, so it slows guessing
// rather than stopping it; the password's length is what really protects you.
const WINDOW_MS = 15 * 60 * 1000;
const MAX_FAILS = 5;
const fails = new Map<string, { count: number; first: number }>();

const digest = (s: string) => createHash("sha256").update(s, "utf8").digest();

export async function POST(req: NextRequest) {
  if (!sameOrigin(req)) return NextResponse.json({ error: "Bad origin" }, { status: 403 });

  const expected = process.env.ADMIN_PASSWORD;
  if (!expected || expected.length < 12 || (process.env.ADMIN_SESSION_SECRET ?? "").length < 32) {
    return NextResponse.json({ error: "Admin is not configured on this server." }, { status: 503 });
  }

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  const now = Date.now();
  const entry = fails.get(ip);
  if (entry && now - entry.first < WINDOW_MS && entry.count >= MAX_FAILS) {
    return NextResponse.json({ error: "Too many attempts. Try again in a few minutes." }, { status: 429 });
  }

  let password = "";
  try {
    const body = (await req.json()) as { password?: unknown };
    if (typeof body.password === "string") password = body.password.slice(0, 512);
  } catch {}

  if (!timingSafeEqual(digest(password), digest(expected))) {
    const fresh = !entry || now - entry.first >= WINDOW_MS;
    fails.set(ip, { count: fresh ? 1 : entry.count + 1, first: fresh ? now : entry.first });
    await new Promise((r) => setTimeout(r, 700));
    return NextResponse.json({ error: "Wrong password." }, { status: 401 });
  }

  fails.delete(ip);
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, await createSessionToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
  return res;
}
