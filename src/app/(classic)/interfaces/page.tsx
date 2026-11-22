/* eslint-disable @next/next/no-html-link-for-pages -- "/" is picked per visitor by src/proxy.ts (classic or new home), so these are full page loads on purpose. */
import type { Metadata } from "next";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { ClassicVersionSwitch } from "@/components/classic/version-switch";
import { DesignGallery } from "@/components/design/design-gallery";
import { MotionShell } from "@/components/design/motion-shell";
import { ThemeToggleButton } from "@/components/theme-toggle";
import { getDesigns } from "@/lib/designs/storage";
import { orderForShowcase } from "@/lib/designs/types";
import { SITE } from "@/lib/site";
import { CLASSIC_DESIGN_PATH, NEW_DESIGN_PATH } from "@/lib/site-version";

/*
 * The classic site's UI / UX gallery, on its own page. The new site's twin is
 * /design; the version switch moves between the two.
 */

// Static, rebuilt in the background at most hourly, and immediately after a
// change in the admin panel.
export const revalidate = 3600;

export const metadata: Metadata = {
  title: { absolute: `Interface craft — ${SITE.name}` },
  description: `Interfaces, flows and motion designed by ${SITE.name}: screen recordings, prototypes and shots.`,
  // Same work as /design, so search engines treat that one as the original.
  alternates: { canonical: NEW_DESIGN_PATH },
  openGraph: { url: CLASSIC_DESIGN_PATH, title: `Interface craft — ${SITE.name}` },
};

export default async function ClassicInterfacesPage() {
  const designs = orderForShowcase(await getDesigns());

  return (
    <MotionShell>
      <main className="relative min-h-screen overflow-x-clip">
        <header className="fixed inset-x-0 top-0 z-50 flex justify-center px-3 pt-3 sm:px-4 sm:pt-4">
          <nav
            aria-label="Primary"
            className="flex w-full max-w-6xl items-center justify-between gap-4 rounded-full border border-border/80 bg-bg/70 py-1.5 pl-5 pr-1.5 backdrop-blur-xl backdrop-saturate-150"
          >
            <a href="/" className="py-2.5 text-sm font-semibold tracking-tight">
              pratyush<span className="text-text-tertiary">.dev</span>
            </a>
            <div className="flex items-center gap-1">
              <a
                href="/#work"
                className="hidden rounded-full px-3.5 py-2 text-[13px] text-text-secondary transition-colors hover:text-text sm:block"
              >
                Engineering work
              </a>
              <a
                href="/#contact"
                className="rounded-full px-3.5 py-2 text-[13px] text-text-secondary transition-colors hover:text-text"
              >
                Contact
              </a>
              <ThemeToggleButton className="ml-1 size-10" />
            </div>
          </nav>
        </header>

        <section className="mx-auto max-w-6xl px-6 pb-24 pt-32 md:px-10 md:pb-32 md:pt-44">
          <a
            href="/"
            className="group mb-10 inline-flex items-center gap-2 text-sm text-text-secondary transition-colors hover:text-text"
          >
            <ArrowLeft size={15} className="transition-transform duration-300 group-hover:-translate-x-0.5" />
            Back to the portfolio
          </a>

          <div className="mb-12 flex flex-col gap-6 border-t border-border pt-5 md:mb-20 md:flex-row md:items-end md:justify-between">
            <div>
              <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-text-tertiary">
                UI / UX · {String(designs.length).padStart(2, "0")} pieces
              </span>
              <h1 className="mt-6 text-balance font-serif text-[clamp(3rem,8vw,6.5rem)] leading-[0.92] tracking-[-0.02em]">
                Interface <span className="italic text-text-secondary">craft</span>
              </h1>
            </div>
            <p className="max-w-sm text-pretty text-text-secondary">
              The design side of what I build: product screens, flows, and the small
              interactions that make them feel right. Recordings play as you scroll;
              click any piece to see it full size.
            </p>
          </div>

          {designs.length ? (
            <DesignGallery designs={designs} filterable />
          ) : (
            <div className="rounded-xl border border-dashed border-border px-6 py-24 text-center">
              <p className="font-serif text-3xl">New work is on its way.</p>
              <p className="mt-3 text-sm text-text-secondary">Check back soon.</p>
            </div>
          )}

          <div className="mt-24 flex flex-col items-start gap-5 border-t border-border pt-10 md:flex-row md:items-center md:justify-between">
            <p className="font-serif text-3xl md:text-4xl">
              Need someone who designs <span className="italic text-text-secondary">and</span> ships?
            </p>
            <a
              href={SITE.calendar}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full bg-text px-5 py-3 text-sm font-medium text-bg transition-transform duration-300 hover:-translate-y-0.5"
            >
              Book a call <ArrowUpRight size={15} />
            </a>
          </div>
        </section>

        <ClassicVersionSwitch next={NEW_DESIGN_PATH} />
      </main>
    </MotionShell>
  );
}
