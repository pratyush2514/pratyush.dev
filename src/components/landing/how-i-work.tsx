"use client";

import { siteConfig } from "@/config/site";
import type { WorkflowIcon } from "@/config/types";
import { PaperCutIcon } from "@/components/showcase/component-icons";
import { AccordionSection } from "@/components/ui/accordion-section";
import { reveal, revealDelay } from "@/lib/motion";
import { motion } from "motion/react";
import { Signature } from "./signature";

// Paper-cut icons in the site's sticker style, one per step. The accent walks
// from chart-1 to chart-2 so the sequence reads as a progression.
const workIcons: Record<WorkflowIcon, React.ReactElement> = {
  // A magnifier: is the problem real?
  validate: (
    <PaperCutIcon size={30} accent="var(--chart-1)" silhouette="M27 7a20 20 0 1 1 0 40 20 20 0 1 1 0-40Zm14 34 15 15">
      <circle cx="27" cy="27" r="13" />
      <path d="m37 37 16 16" strokeWidth="5" />
      <path d="M21 27l4 4 8-8" stroke="var(--cutout-accent)" strokeWidth="3" />
    </PaperCutIcon>
  ),
  // A mind map: one idea branching into the flow and the system.
  map: (
    <PaperCutIcon size={30} accent="var(--chart-1)" tilt={6} silhouette="M10 12h44v40H10Z">
      <path d="M32 32 18 20m14 12 14-12M32 32 18 44m14-12 14 12" strokeWidth="2" />
      <circle cx="32" cy="32" r="5" fill="var(--cutout-accent)" stroke="none" />
      <circle cx="18" cy="20" r="3" />
      <circle cx="46" cy="20" r="3" />
      <circle cx="18" cy="44" r="3" />
      <circle cx="46" cy="44" r="3" />
    </PaperCutIcon>
  ),
  // A spec sheet with a folded corner.
  docs: (
    <PaperCutIcon size={30} accent="var(--chart-2)" tilt={-6} silhouette="M15 7h24l11 11v39H15Z">
      <path d="M39 7v11h11" />
      <path d="M22 28h20M22 35h20M22 42h12" />
      <path d="M22 21h9" stroke="var(--cutout-accent)" strokeWidth="3" />
    </PaperCutIcon>
  ),
  // A shield: the safety net that catches mistakes.
  harness: (
    <PaperCutIcon size={30} accent="var(--chart-2)" tilt={4} silhouette="M32 6 52 13v17c0 13-9 22-20 28C21 52 12 43 12 30V13Z">
      <path d="M23 31l6 6 12-13" stroke="var(--cutout-accent)" strokeWidth="3.5" />
    </PaperCutIcon>
  ),
  // A pen nib: the polish pass.
  craft: (
    <PaperCutIcon size={30} accent="var(--chart-1)" tilt={-4} silhouette="M32 6 48 30 38 56H26L16 30Z">
      <path d="M32 6v24" />
      <circle cx="32" cy="34" r="4" fill="var(--cutout-accent)" stroke="none" />
      <path d="M26 56h12" strokeWidth="3" />
    </PaperCutIcon>
  ),
  // A paper plane: ship it, then keep flying it.
  ship: (
    <PaperCutIcon size={30} accent="var(--chart-2)" tilt={-5} silhouette="M52 10 12 28l17 6 5 15 8-12Z">
      <path d="M52 10 29 34" />
      <path d="M29 34l5 15 8-12Z" fill="var(--cutout-accent)" strokeWidth="1.5" />
    </PaperCutIcon>
  ),
};

export function HowIWork() {
  const { title, intro, items } = siteConfig.workflow;

  return (
    <AccordionSection title={title} defaultExpanded>
      <div className="flex flex-col gap-6 px-6">
        {intro && (
          <p className="max-w-prose text-sm leading-relaxed text-muted-foreground text-pretty">
            {intro}
          </p>
        )}

        <ol className="relative">
          {items.map((item, index) => {
            const isLast = index === items.length - 1;
            return (
              <motion.li
                key={item.label}
                {...reveal({ y: 10, delay: revealDelay(index, 0.05, 0.25) })}
                className="relative grid grid-cols-[2.5rem_1fr] gap-x-4 pb-7 last:pb-0"
              >
                {/* The rail: a dashed line joining each step to the next. */}
                {!isLast && (
                  <span
                    aria-hidden="true"
                    className="absolute top-11 bottom-1 left-5 -translate-x-1/2 border-l border-dashed border-border"
                  />
                )}

                <span
                  aria-hidden="true"
                  className="relative z-10 flex size-10 items-center justify-center rounded-xl bg-background ring-1 ring-inset ring-border"
                >
                  {item.icon && workIcons[item.icon]}
                </span>

                <div className="min-w-0 pt-0.5">
                  <h3 className="flex items-baseline gap-2 text-sm font-semibold text-foreground">
                    <span className="font-mono text-[11px] font-normal tabular-nums text-muted-foreground">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    {item.label}
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground text-pretty">
                    {item.description}
                  </p>
                  {item.outputs && item.outputs.length > 0 && (
                    <ul aria-label="What this step produces" className="mt-2.5 flex flex-wrap gap-1.5">
                      {item.outputs.map((output) => (
                        <li
                          key={output}
                          className="rounded-md border border-dashed px-2 py-0.5 font-mono text-[11px] text-muted-foreground"
                        >
                          {output}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </motion.li>
            );
          })}
        </ol>

        <div className="flex justify-end pr-4">
          <Signature
            className="h-auto w-32 text-foreground/85 sm:w-40"
            viewport={{ amount: 0.4 }}
          />
        </div>
      </div>
    </AccordionSection>
  );
}
