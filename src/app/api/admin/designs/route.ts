import { randomUUID } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { guard } from "@/lib/admin/guard";
import { objectExists, readDesignsFresh, readManifest, writeManifest } from "@/lib/designs/storage";
import type { DesignItem } from "@/lib/designs/types";
import { createSchema, firstIssue } from "./schema";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const denied = await guard(req);
  if (denied) return denied;
  return NextResponse.json({ items: await readDesignsFresh() });
}

export async function POST(req: NextRequest) {
  const denied = await guard(req);
  if (denied) return denied;

  const parsed = createSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: firstIssue(parsed.error) }, { status: 400 });
  const { media, link, ...meta } = parsed.data;

  // Only accept files that actually made it to storage.
  const paths = [media.path, media.posterPath].filter((p): p is string => !!p);
  const present = await Promise.all(paths.map(objectExists));
  if (present.includes(false)) {
    return NextResponse.json({ error: "The upload did not finish. Try again." }, { status: 400 });
  }

  const item: DesignItem = {
    id: randomUUID(),
    ...meta,
    link: link || undefined,
    media,
    createdAt: new Date().toISOString(),
  };

  try {
    const manifest = await readManifest();
    manifest.items.unshift(item); // newest first, reorder in the panel
    await writeManifest(manifest);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Could not save. Check the storage settings." }, { status: 502 });
  }
  return NextResponse.json({ item }, { status: 201 });
}
