import { getDesigns } from "@/lib/designs/storage";
import { orderForShowcase } from "@/lib/designs/types";
import { Home } from "./home";

// Static, rebuilt in the background at most hourly, and immediately after a
// change in the admin panel.
export const revalidate = 3600;

export default async function Page() {
  const designs = orderForShowcase(await getDesigns());
  return <Home designs={designs.slice(0, 5)} designCount={designs.length} />;
}
