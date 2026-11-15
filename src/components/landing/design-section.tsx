import Link from "next/link";
import { DesignGallery } from "@/components/design/design-gallery";
import { MotionShell } from "@/components/design/motion-shell";
import { ArrowRightIcon } from "@/components/shared/site-icons";
import type { PublicDesign } from "@/lib/designs/types";

/** Home-page teaser for the UI / UX gallery. Hidden until there is work to show. */
export function DesignSection({
  designs,
  total,
}: {
  designs: PublicDesign[];
  total: number;
}) {
  if (!designs.length) return null;

  return (
    <section className="no-js-visible border-t border-dashed pt-6">
      <h2 className="section-heading mb-3">Design</h2>
      <p className="px-6 pb-6 text-sm text-muted-foreground">
        Screens, flows and motion I designed. Recordings play as you scroll; open
        any of them for the full view.
      </p>
      <div className="px-6 pb-6">
        <MotionShell>
          <DesignGallery designs={designs} />
        </MotionShell>
      </div>
      <Link
        href="/design"
        className="group micro-transition flex items-center justify-between border-t border-dashed px-6 py-4 text-sm text-muted-foreground hover:bg-muted/10 hover:text-foreground"
      >
        <span>{total > designs.length ? `See all ${total} designs` : "Open the design gallery"}</span>
        <ArrowRightIcon className="size-3.5 micro-transition group-hover:translate-x-0.5" />
      </Link>
    </section>
  );
}
