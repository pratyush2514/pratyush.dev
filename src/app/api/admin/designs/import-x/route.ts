import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { guard } from "@/lib/admin/guard";
import { readManifest, removeObjects, writeManifest } from "@/lib/designs/storage";
import { ImportError, importPost } from "@/lib/designs/x-import";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
// Downloading a long video from X and re-uploading it can take a while.
export const maxDuration = 60;

const bodySchema = z.object({
  url: z.string().trim().min(1).max(500),
  featured: z.boolean().default(false),
});

/** Paste an X post link: its photos and videos are downloaded and published. */
export async function POST(req: NextRequest) {
  const denied = await guard(req);
  if (denied) return denied;

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Paste an X post link." }, { status: 400 });

  let uploaded: string[] = [];
  try {
    const result = await importPost(parsed.data.url);
    uploaded = result.uploaded;
    const items = result.items.map((item) => ({ ...item, featured: parsed.data.featured }));

    const manifest = await readManifest();
    manifest.items.unshift(...items); // newest first, in the post's order
    await writeManifest(manifest);
    return NextResponse.json({ items }, { status: 201 });
  } catch (error) {
    // Don't leave orphaned files in the bucket after a failed import.
    const partial = (error as { uploaded?: string[] }).uploaded ?? uploaded;
    await removeObjects(partial);
    if (error instanceof ImportError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("X import failed", error);
    return NextResponse.json({ error: "Import failed. Check the storage settings and try again." }, { status: 502 });
  }
}
