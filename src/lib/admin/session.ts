// The admin session: one HttpOnly cookie holding an expiry and an HMAC of it.
// Uses Web Crypto only, so the same code runs in middleware (edge) and in
// route handlers (node). Rotating ADMIN_SESSION_SECRET signs every device out.

export const SESSION_COOKIE = "pd_admin";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // seconds

const encoder = new TextEncoder();

function secret(): string | null {
  const s = process.env.ADMIN_SESSION_SECRET;
  // Fail closed: without a strong secret, nobody gets in.
  return s && s.length >= 32 ? s : null;
}

async function hmacKey(s: string) {
  return crypto.subtle.importKey("raw", encoder.encode(s), { name: "HMAC", hash: "SHA-256" }, false, [
    "sign",
    "verify",
  ]);
}

function toB64url(buf: ArrayBuffer): string {
  let bin = "";
  for (const b of new Uint8Array(buf)) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromB64url(s: string): Uint8Array<ArrayBuffer> | null {
  try {
    const bin = atob(s.replace(/-/g, "+").replace(/_/g, "/"));
    const out = new Uint8Array(new ArrayBuffer(bin.length));
    for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
    return out;
  } catch {
    return null;
  }
}

export async function createSessionToken(): Promise<string> {
  const s = secret();
  if (!s) throw new Error("ADMIN_SESSION_SECRET must be set and at least 32 characters");
  const payload = `v1.${Math.floor(Date.now() / 1000) + SESSION_MAX_AGE}`;
  const sig = await crypto.subtle.sign("HMAC", await hmacKey(s), encoder.encode(payload));
  return `${payload}.${toB64url(sig)}`;
}

export async function verifySessionToken(token: string | undefined | null): Promise<boolean> {
  const s = secret();
  if (!s || !token) return false;
  const parts = token.split(".");
  if (parts.length !== 3 || parts[0] !== "v1") return false;
  const exp = Number(parts[1]);
  if (!Number.isFinite(exp) || exp < Date.now() / 1000) return false;
  const sig = fromB64url(parts[2]);
  if (!sig) return false;
  // crypto.subtle.verify compares in constant time.
  return crypto.subtle.verify("HMAC", await hmacKey(s), sig, encoder.encode(`${parts[0]}.${parts[1]}`));
}
