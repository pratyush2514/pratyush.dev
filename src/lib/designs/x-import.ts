import "server-only";
import { randomUUID } from "node:crypto";
import { uploadObject } from "./storage";
import { MEDIA_TYPES, type DesignItem, type DesignMedia } from "./types";

/*
 * Imports the photos and videos of a public X (Twitter) post into the design
 * library. Reads X's public embed endpoint (the one embedded posts use), so no
 * API key is needed. Only the media is taken; the post text becomes an
 * editable title and summary.
 */

const MAX_MB = Number(process.env.DESIGNS_MAX_UPLOAD_MB ?? 50);
const MAX_BYTES = MAX_MB * 1024 * 1024;

// Media may only be downloaded from X's own CDNs.
const MEDIA_HOSTS = new Set(["pbs.twimg.com", "video.twimg.com"]);
const POST_HOSTS = new Set([
  "x.com",
  "www.x.com",
  "mobile.x.com",
  "twitter.com",
  "www.twitter.com",
  "mobile.twitter.com",
]);

export class ImportError extends Error {
  constructor(
    message: string,
    readonly status = 400,
  ) {
    super(message);
  }
}

type Variant = { content_type: string; url: string; bitrate?: number };
type Media = {
  type: "photo" | "video" | "animated_gif";
  media_url_https: string;
  original_info?: { width?: number; height?: number };
  video_info?: { variants?: Variant[]; aspect_ratio?: [number, number] };
};
type Post = {
  __typename?: string;
  id_str?: string;
  text?: string;
  created_at?: string;
  user?: { screen_name?: string };
  mediaDetails?: Media[];
};

/** The numeric post id from an x.com or twitter.com status link. */
export function parsePostId(input: string): string {
  let url: URL;
  try {
    url = new URL(input.trim());
  } catch {
    throw new ImportError("Paste a full link, like https://x.com/you/status/123…");
  }
  if (url.protocol !== "https:" || !POST_HOSTS.has(url.hostname.toLowerCase())) {
    throw new ImportError("That isn't an x.com or twitter.com link.");
  }
  const match = url.pathname.match(/^\/(?:[A-Za-z0-9_]{1,15}|i(?:\/web)?)\/status(?:es)?\/(\d{1,20})(?:\/|$)/);
  if (!match) throw new ImportError("That link doesn't point to a post.");
  return match[1];
}

// The embed endpoint wants a token derived from the id; this matches X's
// embed script (and the react-tweet library).
function embedToken(id: string): string {
  return ((Number(id) / 1e15) * Math.PI).toString(36).replace(/(0+|\.)/g, "");
}

async function fetchPost(id: string): Promise<Post> {
  const url = `https://cdn.syndication.twimg.com/tweet-result?id=${id}&lang=en&token=${embedToken(id)}`;
  let res: Response;
  try {
    res = await fetch(url, { cache: "no-store", signal: AbortSignal.timeout(10_000) });
  } catch {
    throw new ImportError("Couldn't reach X. Try again in a moment.", 502);
  }
  if (res.status === 404) throw new ImportError("Post not found. It may be deleted, private or age-restricted.", 404);
  if (!res.ok) throw new ImportError(`X answered ${res.status}. Try again in a moment.`, 502);
  const post = (await res.json().catch(() => null)) as Post | null;
  if (!post || post.__typename === "TweetTombstone") {
    throw new ImportError("Post not found. It may be deleted, private or age-restricted.", 404);
  }
  return post;
}

/** The best single file for one media item. */
function pickSource(media: Media): { url: string; kind: DesignMedia["kind"] } | null {
  if (media.type === "photo") {
    const url = new URL(media.media_url_https);
    url.searchParams.set("name", "orig"); // full resolution
    return { url: url.toString(), kind: "image" };
  }
  // Videos and X "GIFs" (which are MP4s): the highest-bitrate MP4.
  const mp4 = (media.video_info?.variants ?? [])
    .filter((v) => v.content_type === "video/mp4")
    .sort((a, b) => (b.bitrate ?? 0) - (a.bitrate ?? 0))[0];
  return mp4 ? { url: mp4.url, kind: "video" } : null;
}

/** Downloads one file from X's CDN, refusing other hosts and oversized files. */
async function download(src: string): Promise<{ bytes: Uint8Array; type: string }> {
  const url = new URL(src);
  if (url.protocol !== "https:" || !MEDIA_HOSTS.has(url.hostname)) {
    throw new ImportError("X returned media from an unexpected host.", 502);
  }
  const res = await fetch(url, { cache: "no-store", signal: AbortSignal.timeout(45_000) });
  const final = new URL(res.url || src);
  if (!MEDIA_HOSTS.has(final.hostname)) throw new ImportError("X redirected the media to an unexpected host.", 502);
  if (!res.ok || !res.body) throw new ImportError(`Downloading media failed (${res.status}).`, 502);

  const declared = Number(res.headers.get("content-length") ?? 0);
  if (declared > MAX_BYTES) throw new ImportError(`A file is over ${MAX_MB} MB.`, 413);

  const chunks: Uint8Array[] = [];
  let size = 0;
  const reader = res.body.getReader();
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > MAX_BYTES) {
      await reader.cancel();
      throw new ImportError(`A file is over ${MAX_MB} MB.`, 413);
    }
    chunks.push(value);
  }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  const type = (res.headers.get("content-type") ?? "").split(";")[0].trim().toLowerCase();
  return { bytes, type };
}

async function store(src: string): Promise<{ path: string; type: string }> {
  const { bytes, type } = await download(src);
  const known = MEDIA_TYPES[type];
  if (!known) throw new ImportError(`X sent an unsupported file type (${type || "unknown"}).`, 415);
  const path = `designs/media/${randomUUID()}.${known.ext}`;
  await uploadObject(path, bytes, type);
  return { path, type };
}

/** Post text without t.co links and surplus whitespace. */
function cleanText(text = ""): string {
  return text
    .replace(/https?:\/\/t\.co\/\w+/g, "")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function titleFrom(text: string, handle: string): string {
  const firstLine = text.split("\n").find((l) => l.trim())?.trim() ?? "";
  if (!firstLine) return `Post by @${handle}`;
  return firstLine.length > 80 ? `${firstLine.slice(0, 79).trimEnd()}…` : firstLine;
}

/**
 * Downloads every photo and video in the post into storage and returns one
 * design item per file, in the post's order. Nothing is saved to the manifest
 * here; the caller does that.
 */
export async function importPost(input: string): Promise<{ items: DesignItem[]; uploaded: string[] }> {
  const id = parsePostId(input);
  const post = await fetchPost(id);
  const media = post.mediaDetails ?? [];
  if (!media.length) throw new ImportError("That post has no photos or videos.");

  const handle = post.user?.screen_name ?? "i";
  const link = `https://x.com/${handle}/status/${post.id_str ?? id}`;
  const text = cleanText(post.text);
  const title = titleFrom(text, handle);
  const created = post.created_at ? new Date(post.created_at) : new Date();
  const year = String(Number.isNaN(created.getTime()) ? new Date().getFullYear() : created.getFullYear());

  const uploaded: string[] = [];
  const items: DesignItem[] = [];
  try {
    for (const [index, m] of media.entries()) {
      const source = pickSource(m);
      if (!source) continue;
      const file = await store(source.url);
      uploaded.push(file.path);

      let posterPath: string | undefined;
      if (source.kind === "video") {
        // The still X shows before playback; a missing poster isn't fatal.
        try {
          const poster = await store(m.media_url_https);
          uploaded.push(poster.path);
          posterPath = poster.path;
        } catch (error) {
          console.error("X import: poster skipped", error);
        }
      }

      const width = m.original_info?.width || m.video_info?.aspect_ratio?.[0] || 16;
      const height = m.original_info?.height || m.video_info?.aspect_ratio?.[1] || 9;
      items.push({
        id: randomUUID(),
        title: media.length > 1 ? `${title.slice(0, 110)} (${index + 1}/${media.length})` : title,
        summary: text.slice(0, 1000),
        category: "",
        tools: [],
        year,
        link,
        featured: false,
        media: { path: file.path, kind: source.kind, width, height, posterPath },
        createdAt: new Date().toISOString(),
      });
    }
  } catch (error) {
    // Hand back what was uploaded so the caller can clean it up.
    throw Object.assign(error instanceof Error ? error : new Error(String(error)), { uploaded });
  }
  if (!items.length) throw new ImportError("Couldn't find a downloadable file in that post.");
  return { items, uploaded };
}
