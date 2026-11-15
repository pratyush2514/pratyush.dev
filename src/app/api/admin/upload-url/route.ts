import { randomUUID } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { guard } from "@/lib/admin/guard";
import { publicUrl, signUpload } from "@/lib/designs/storage";
import { MEDIA_TYPES } from "@/lib/designs/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Supabase's free plan caps each file at 50 MB; raise this on a paid plan.
const MAX_MB = Number(process.env.DESIGNS_MAX_UPLOAD_MB ?? 50);

// Files go straight from the browser to Storage, so a large screen recording
// never passes through (or hits the body limit of) a serverless function.
export async function POST(req: NextRequest) {
  const denied = await guard(req);
  if (denied) return denied;

  const body = (await req.json().catch(() => null)) as { contentType?: unknown; size?: unknown } | null;
  const type = typeof body?.contentType === "string" ? MEDIA_TYPES[body.contentType] : undefined;
  const size = typeof body?.size === "number" ? body.size : NaN;

  if (!type) {
    return NextResponse.json(
      { error: "Use PNG, JPG, WebP, AVIF, GIF, MP4, WebM or MOV." },
      { status: 415 }
    );
  }
  if (!(size > 0) || size > MAX_MB * 1024 * 1024) {
    return NextResponse.json({ error: `Files must be under ${MAX_MB} MB.` }, { status: 413 });
  }

  const path = `designs/media/${randomUUID()}.${type.ext}`;
  try {
    const uploadUrl = await signUpload(path);
    return NextResponse.json({ path, uploadUrl, publicUrl: publicUrl(path), kind: type.kind });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Storage refused the upload. Check the bucket settings." }, { status: 502 });
  }
}
