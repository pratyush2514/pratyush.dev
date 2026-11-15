import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { guard } from "@/lib/admin/guard";
import { readManifest, writeManifest } from "@/lib/designs/storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const schema = z.object({ ids: z.array(z.string().uuid()).max(1000) });

export async function PUT(req: NextRequest) {
  const denied = await guard(req);
  if (denied) return denied;

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid order" }, { status: 400 });

  const manifest = await readManifest();
  const byId = new Map(manifest.items.map((d) => [d.id, d]));
  const ids = parsed.data.ids;
  if (ids.length !== byId.size || new Set(ids).size !== ids.length || !ids.every((id) => byId.has(id))) {
    return NextResponse.json({ error: "The list changed. Reload and try again." }, { status: 409 });
  }

  manifest.items = ids.map((id) => byId.get(id)!);
  await writeManifest(manifest);
  return NextResponse.json({ ok: true });
}
