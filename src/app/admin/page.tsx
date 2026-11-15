import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/admin/guard";
import { readDesignsFresh } from "@/lib/designs/storage";
import type { PublicDesign } from "@/lib/designs/types";
import { AdminDashboard } from "./dashboard";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  // Middleware already checks, this is the second lock.
  if (!(await isAdmin())) redirect("/admin/login");

  let designs: PublicDesign[] = [];
  let setupError: string | null = null;
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    setupError = "SUPABASE_SERVICE_ROLE_KEY is not set, so uploads are disabled.";
  } else {
    try {
      designs = await readDesignsFresh();
    } catch (error) {
      setupError = error instanceof Error ? error.message : "Could not read from storage.";
    }
  }

  return <AdminDashboard initial={designs} setupError={setupError} />;
}
