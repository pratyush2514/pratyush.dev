import type { Metadata } from "next";
import { ClassicHome } from "@/components/classic/classic-home";
import { getDesigns } from "@/lib/designs/storage";
import { orderForShowcase } from "@/lib/designs/types";
import { SITE } from "@/lib/site";

/*
 * The classic portfolio. Visitors never see /classic in the address bar:
 * src/proxy.ts rewrites "/" here unless they picked the new version.
 */

// Static, rebuilt in the background at most hourly, and immediately after a
// change in the admin panel.
export const revalidate = 3600;

export const metadata: Metadata = {
  title: { absolute: SITE.title },
  alternates: { canonical: "/" },
  openGraph: {
    type: "profile",
    url: "/",
    title: SITE.title,
    description: SITE.description,
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: `${SITE.title}. An isometric line drawing of a three-layer stack.`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE.title,
    description: SITE.description,
    images: ["/og.png"],
  },
};

export default async function ClassicPage() {
  const designs = orderForShowcase(await getDesigns());
  return <ClassicHome designs={designs.slice(0, 5)} designCount={designs.length} />;
}
