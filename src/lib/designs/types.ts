// Shared by the public gallery, the admin dashboard and the API routes.
// Safe to import from client components: no secrets live here.

export type DesignKind = "image" | "gif" | "video";

export type DesignMedia = {
  /** Object path inside the storage bucket, e.g. designs/media/<uuid>.mp4 */
  path: string;
  kind: DesignKind;
  width: number;
  height: number;
  /** A still frame for videos, so the card has something to show before it plays. */
  posterPath?: string;
};

export type DesignItem = {
  id: string;
  title: string;
  summary: string;
  category: string;
  tools: string[];
  year: string;
  /** Figma, Dribbble, Behance or a live prototype. */
  link?: string;
  featured: boolean;
  media: DesignMedia;
  createdAt: string;
};

/** A design with its public URLs resolved, ready to render. */
export type PublicDesign = DesignItem & { src: string; poster?: string };

export type DesignManifest = { version: 1; items: DesignItem[] };

export const MEDIA_TYPES: Record<string, { ext: string; kind: DesignKind }> = {
  "image/png": { ext: "png", kind: "image" },
  "image/jpeg": { ext: "jpg", kind: "image" },
  "image/webp": { ext: "webp", kind: "image" },
  "image/avif": { ext: "avif", kind: "image" },
  "image/gif": { ext: "gif", kind: "gif" },
  "video/mp4": { ext: "mp4", kind: "video" },
  "video/webm": { ext: "webm", kind: "video" },
  "video/quicktime": { ext: "mov", kind: "video" },
};

export const MEDIA_PATH = /^designs\/media\/[0-9a-f-]{36}\.(png|jpg|webp|avif|gif|mp4|webm|mov)$/;

/** Featured first, then in the order set in the admin panel. */
export function orderForShowcase<T extends DesignItem>(items: T[]): T[] {
  return [...items.filter((d) => d.featured), ...items.filter((d) => !d.featured)];
}
