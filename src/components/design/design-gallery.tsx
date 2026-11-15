"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { ArrowLeft, ArrowRight, ArrowUpRight, Play, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { PublicDesign } from "@/lib/designs/types";
import { cn } from "@/lib/utils";
import { DesignMedia } from "./design-media";

const KIND_LABEL = { video: "Motion", gif: "GIF", image: "" } as const;

function DesignCard({
  design,
  hero,
  onOpen,
}: {
  design: PublicDesign;
  hero?: boolean;
  onOpen: () => void;
}) {
  const portrait = design.media.height / design.media.width > 1.1;
  const kind = KIND_LABEL[design.media.kind];
  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label={`Open ${design.title}`}
      className={cn("group block w-full text-left", hero && "sm:col-span-2")}
    >
      <div className="relative overflow-hidden rounded-xl border border-border bg-bg-secondary shadow-[0_1px_0_0_var(--color-border),0_24px_48px_-24px_rgb(0_0_0/0.18)] transition-[transform,box-shadow] duration-700 ease-out-expo group-hover:-translate-y-1 group-hover:shadow-[0_1px_0_0_var(--color-border),0_40px_80px_-32px_rgb(0_0_0/0.28)]">
        {portrait && <div className="dot-grid absolute inset-0" aria-hidden="true" />}
        <div className="relative" style={{ aspectRatio: hero ? "16 / 9" : "4 / 3" }}>
          <DesignMedia
            src={design.src}
            poster={design.poster}
            kind={design.media.kind}
            alt={design.title}
            className={cn(
              "absolute inset-0 size-full transition-transform duration-[1400ms] ease-out-expo",
              portrait
                ? "object-contain p-5 drop-shadow-[0_18px_30px_rgb(0_0_0/0.18)] md:p-8"
                : "object-cover object-top group-hover:scale-[1.02]"
            )}
          />
        </div>
        {kind && (
          <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-black/45 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-white backdrop-blur-md">
            {design.media.kind === "video" && <Play size={9} className="fill-current" aria-hidden="true" />}
            {kind}
          </span>
        )}
        <span className="absolute bottom-3 right-3 inline-flex size-9 translate-y-1 items-center justify-center rounded-full bg-text text-bg opacity-0 transition-all duration-500 ease-out-expo group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:opacity-100">
          <ArrowUpRight size={16} aria-hidden="true" />
        </span>
      </div>
      <div className="mt-4 flex items-baseline justify-between gap-4">
        <div className="min-w-0">
          <h3 className={cn("truncate font-serif tracking-tight", hero ? "text-3xl md:text-4xl" : "text-2xl")}>
            {design.title}
          </h3>
          {design.category && <p className="mt-0.5 text-sm text-text-tertiary">{design.category}</p>}
        </div>
        {design.year && (
          <span className="shrink-0 font-mono text-[11px] uppercase tracking-[0.14em] text-text-tertiary">
            {design.year}
          </span>
        )}
      </div>
    </button>
  );
}

function Lightbox({
  designs,
  index,
  onChange,
}: {
  designs: PublicDesign[];
  index: number | null;
  onChange: (i: number | null) => void;
}) {
  const design = index === null ? null : designs[index];
  const step = useCallback(
    (d: number) => index !== null && onChange((index + d + designs.length) % designs.length),
    [index, designs.length, onChange]
  );

  useEffect(() => {
    if (index === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [index, step]);

  return (
    <Dialog.Root open={!!design} onOpenChange={(open) => !open && onChange(null)}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[60] bg-bg/85 backdrop-blur-xl" />
        <Dialog.Content className="fixed inset-0 z-[61] flex flex-col overflow-y-auto outline-none lg:overflow-hidden">
          {design && (
            <div className="mx-auto grid w-full max-w-7xl flex-1 gap-8 px-4 pb-10 pt-16 sm:px-6 lg:grid-cols-12 lg:gap-10 lg:py-14">
              {/* Auto margins centre short media; tall shots start at the top and scroll. */}
              <div className="flex min-h-0 flex-col lg:col-span-8 lg:h-full lg:overflow-y-auto lg:rounded-xl lg:border lg:border-border lg:bg-bg-secondary">
                <DesignMedia
                  key={design.id}
                  full
                  src={design.src}
                  poster={design.poster}
                  kind={design.media.kind}
                  alt={design.title}
                  className="h-auto w-full shrink-0 rounded-xl lg:my-auto lg:rounded-none"
                />
              </div>
              <div className="flex flex-col lg:col-span-4 lg:py-2">
                <div className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.14em] text-text-tertiary">
                  {design.category && <span>{design.category}</span>}
                  {design.category && design.year && <span className="h-px w-4 bg-border" aria-hidden="true" />}
                  {design.year && <span>{design.year}</span>}
                </div>
                <Dialog.Title className="mt-4 font-serif text-4xl leading-[1] tracking-tight md:text-5xl">
                  {design.title}
                </Dialog.Title>
                <Dialog.Description asChild>
                  <p className="mt-5 whitespace-pre-line text-pretty leading-relaxed text-text-secondary">
                    {design.summary || " "}
                  </p>
                </Dialog.Description>
                {design.tools.length > 0 && (
                  <ul className="mt-6 flex flex-wrap gap-1.5">
                    {design.tools.map((t) => (
                      <li
                        key={t}
                        className="rounded-full border border-border px-2.5 py-1 font-mono text-[11px] text-text-secondary"
                      >
                        {t}
                      </li>
                    ))}
                  </ul>
                )}
                {design.link && (
                  <a
                    href={design.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-8 inline-flex items-center gap-1.5 self-start rounded-full bg-text px-5 py-3 text-sm font-medium text-bg transition-transform duration-300 hover:-translate-y-0.5"
                  >
                    Open the file <ArrowUpRight size={15} />
                  </a>
                )}
                {designs.length > 1 && (
                  <div className="mt-auto flex items-center justify-between gap-3 border-t border-border pt-5 max-lg:mt-10">
                    <span className="font-mono text-[11px] text-text-tertiary">
                      {String(index! + 1).padStart(2, "0")} / {String(designs.length).padStart(2, "0")}
                    </span>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => step(-1)}
                        aria-label="Previous design"
                        className="inline-flex size-11 items-center justify-center rounded-full border border-border transition-colors hover:border-text-tertiary"
                      >
                        <ArrowLeft size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={() => step(1)}
                        aria-label="Next design"
                        className="inline-flex size-11 items-center justify-center rounded-full border border-border transition-colors hover:border-text-tertiary"
                      >
                        <ArrowRight size={16} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
          <Dialog.Close
            aria-label="Close"
            className="fixed right-4 top-4 inline-flex size-11 items-center justify-center rounded-full border border-border bg-bg/80 backdrop-blur transition-colors hover:border-text-tertiary"
          >
            <X size={18} />
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

/**
 * A grid of design cards that open in a lightbox. The first card spans both
 * columns. With `filterable`, chips above the grid narrow it by category.
 */
export function DesignGallery({
  designs,
  filterable,
}: {
  designs: PublicDesign[];
  filterable?: boolean;
}) {
  const [open, setOpen] = useState<number | null>(null);
  const [category, setCategory] = useState<string>("All");

  const categories = useMemo(
    () => ["All", ...Array.from(new Set(designs.map((d) => d.category).filter(Boolean)))],
    [designs]
  );
  const shown = useMemo(
    () => (category === "All" ? designs : designs.filter((d) => d.category === category)),
    [designs, category]
  );

  return (
    <>
      {filterable && categories.length > 2 && (
        <div role="group" aria-label="Filter by category" className="mb-10 flex flex-wrap gap-2">
          {categories.map((c) => (
            <button
              key={c}
              type="button"
              aria-pressed={category === c}
              onClick={() => setCategory(c)}
              className={cn(
                "rounded-full border px-4 py-2 text-[13px] transition-colors duration-300",
                category === c
                  ? "border-text bg-text text-bg"
                  : "border-border text-text-secondary hover:border-text-tertiary hover:text-text"
              )}
            >
              {c}
            </button>
          ))}
        </div>
      )}
      <div className="grid gap-x-6 gap-y-12 sm:grid-cols-2 md:gap-x-8 md:gap-y-16">
        {shown.map((d, i) => (
          <DesignCard key={d.id} design={d} hero={i === 0} onOpen={() => setOpen(i)} />
        ))}
      </div>
      <Lightbox designs={shown} index={open} onChange={setOpen} />
    </>
  );
}
