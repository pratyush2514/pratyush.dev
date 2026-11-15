import type { Metadata } from "next";
import Link from "next/link";
import { DesignGallery } from "@/components/design/design-gallery";
import { MotionShell } from "@/components/design/motion-shell";
import { Footer } from "@/components/landing/footer";
import { ArrowRightIcon } from "@/components/shared/site-icons";
import { Button } from "@/components/ui/button";
import { getDesigns } from "@/lib/designs/storage";
import { orderForShowcase } from "@/lib/designs/types";
import { SITE } from "@/lib/site";

// Static, rebuilt in the background at most hourly, and immediately after a
// change in the admin panel.
export const revalidate = 3600;

export const metadata: Metadata = {
  title: "UI / UX design",
  description: `Interfaces, flows and motion designed by ${SITE.name}: screen recordings, prototypes and shots.`,
  alternates: { canonical: "/design" },
  openGraph: { url: "/design", title: `UI / UX design — ${SITE.name}` },
};

export default async function DesignPage() {
  const designs = orderForShowcase(await getDesigns());

  return (
    <>
      <main
        id="main-content"
        className="relative flex min-h-dvh flex-col gap-y-4 overflow-x-clip border-x bg-background pt-8"
      >
        <section className="px-6 pt-10">
          <p className="font-mono text-xs tracking-wider text-muted-foreground">
            UI / UX · {String(designs.length).padStart(2, "0")} pieces
          </p>
          <h1 className="mt-3 font-serif text-4xl italic tracking-tight sm:text-5xl">
            Interface craft
          </h1>
          <p className="mt-3 max-w-lg text-sm text-muted-foreground text-pretty">
            The design side of what I build: product screens, flows, and the small
            interactions that make them feel right. Click any piece to see it full
            size.
          </p>
        </section>

        <section className="border-t border-dashed px-6 pt-8 pb-10">
          {designs.length ? (
            <MotionShell>
              <DesignGallery designs={designs} filterable />
            </MotionShell>
          ) : (
            <div className="rounded-lg border border-dashed px-6 py-20 text-center">
              <p className="font-serif text-2xl italic">New work is on its way.</p>
              <p className="mt-2 text-sm text-muted-foreground">Check back soon.</p>
            </div>
          )}
        </section>

        <section className="flex flex-col items-start gap-4 border-t border-dashed px-6 py-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-serif text-2xl">
            Need someone who designs <span className="italic text-muted-foreground">and</span> ships?
          </p>
          <div className="flex gap-2">
            <Button asChild variant="outline">
              <Link href="/">Engineering work</Link>
            </Button>
            <Button asChild>
              <a href={SITE.calendar} target="_blank" rel="noopener noreferrer">
                Book a call <ArrowRightIcon className="size-3.5 -rotate-45" />
              </a>
            </Button>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
