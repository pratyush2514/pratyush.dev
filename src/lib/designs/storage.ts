import "server-only";
import { revalidatePath, revalidateTag } from "next/cache";
import type { DesignItem, DesignManifest, PublicDesign } from "./types";

// Designs live in Supabase Storage: the media files under designs/media/, and
// one manifest.json holding titles, order and metadata. Only the server talks
// to Storage with the service key; browsers upload through short-lived signed
// URLs and read media from the bucket's public URLs.

const BASE = (process.env.SUPABASE_URL ?? "https://nqysiprpmxxombsdvdkh.supabase.co").replace(/\/$/, "");
const BUCKET = process.env.DESIGNS_BUCKET ?? "portfolio";
const MANIFEST = "designs/manifest.json";
export const DESIGNS_TAG = "designs";

function serviceKey(): string {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set");
  return key;
}

function authHeaders(): Record<string, string> {
  const key = serviceKey();
  return { apikey: key, Authorization: `Bearer ${key}` };
}

export function publicUrl(path: string): string {
  return `${BASE}/storage/v1/object/public/${BUCKET}/${path}`;
}

function withUrls(item: DesignItem): PublicDesign {
  return {
    ...item,
    src: publicUrl(item.media.path),
    poster: item.media.posterPath ? publicUrl(item.media.posterPath) : undefined,
  };
}

async function fetchManifest(init: RequestInit & { next?: { tags?: string[]; revalidate?: number } }) {
  const res = await fetch(`${BASE}/storage/v1/object/authenticated/${BUCKET}/${MANIFEST}`, {
    ...init,
    headers: authHeaders(),
  });
  // Storage answers 400 or 404 for a missing object: nothing uploaded yet.
  if (res.status === 400 || res.status === 404) return { version: 1, items: [] } as DesignManifest;
  if (!res.ok) throw new Error(`Reading the design manifest failed: ${res.status}`);
  const data = (await res.json()) as DesignManifest;
  return { version: 1, items: Array.isArray(data.items) ? data.items : [] } as DesignManifest;
}

/** For public pages. Cached, and refreshed whenever the admin saves. */
export async function getDesigns(): Promise<PublicDesign[]> {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return [];
  try {
    const manifest = await fetchManifest({ next: { tags: [DESIGNS_TAG], revalidate: 3600 } });
    return manifest.items.map(withUrls);
  } catch (error) {
    // A storage hiccup should hide the section, not take the home page down.
    console.error(error);
    return [];
  }
}

/** For the admin panel and mutations: always the latest copy. */
export async function readManifest(): Promise<DesignManifest> {
  return fetchManifest({ cache: "no-store" });
}

export async function readDesignsFresh(): Promise<PublicDesign[]> {
  return (await readManifest()).items.map(withUrls);
}

export async function writeManifest(manifest: DesignManifest): Promise<void> {
  const res = await fetch(`${BASE}/storage/v1/object/${BUCKET}/${MANIFEST}`, {
    method: "POST",
    headers: {
      ...authHeaders(),
      "content-type": "application/json",
      "cache-control": "max-age=0",
      "x-upsert": "true",
    },
    body: JSON.stringify(manifest),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Saving the design manifest failed: ${res.status} ${await res.text()}`);
  revalidateTag(DESIGNS_TAG);
  revalidatePath("/");
  revalidatePath("/design");
}

/** A URL the browser can PUT one file to, valid for two hours. */
export async function signUpload(path: string): Promise<string> {
  const res = await fetch(`${BASE}/storage/v1/object/upload/sign/${BUCKET}/${path}`, {
    method: "POST",
    headers: { ...authHeaders(), "content-type": "application/json" },
    body: "{}",
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Signing the upload failed: ${res.status} ${await res.text()}`);
  const { url } = (await res.json()) as { url: string };
  return `${BASE}/storage/v1${url}`;
}

export async function objectExists(path: string): Promise<boolean> {
  const res = await fetch(`${BASE}/storage/v1/object/${BUCKET}/${path}`, {
    method: "HEAD",
    headers: authHeaders(),
    cache: "no-store",
  });
  return res.ok;
}

export async function removeObjects(paths: string[]): Promise<void> {
  if (!paths.length) return;
  const res = await fetch(`${BASE}/storage/v1/object/${BUCKET}`, {
    method: "DELETE",
    headers: { ...authHeaders(), "content-type": "application/json" },
    body: JSON.stringify({ prefixes: paths }),
    cache: "no-store",
  });
  if (!res.ok) console.error(`Removing ${paths.join(", ")} failed: ${res.status}`);
}
