import { NextResponse, type NextRequest } from "next/server";
import { guard } from "@/lib/admin/guard";
import { readManifest, removeObjects, writeManifest } from "@/lib/designs/storage";
import { firstIssue, patchSchema } from "../schema";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, { params }: Ctx) {
  const denied = await guard(req);
  if (denied) return denied;
  const { id } = await params;

  const parsed = patchSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: firstIssue(parsed.error) }, { status: 400 });

  const manifest = await readManifest();
  const item = manifest.items.find((d) => d.id === id);
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { link, ...rest } = parsed.data;
  Object.assign(item, rest);
  if (link !== undefined) item.link = link || undefined;
  await writeManifest(manifest);
  return NextResponse.json({ item });
}

export async function DELETE(req: NextRequest, { params }: Ctx) {
  const denied = await guard(req);
  if (denied) return denied;
  const { id } = await params;

  const manifest = await readManifest();
  const item = manifest.items.find((d) => d.id === id);
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });

  manifest.items = manifest.items.filter((d) => d.id !== id);
  await writeManifest(manifest);
  await removeObjects([item.media.path, item.media.posterPath].filter((p): p is string => !!p));
  return NextResponse.json({ ok: true });
}
