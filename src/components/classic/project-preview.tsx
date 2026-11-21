import { cn } from "@/lib/utils";

// A browser window holding a full-page screenshot (public/projects/*.webp).
// On hover of the surrounding `group`, the shot scrolls slowly to its bottom,
// so the reader sees the whole page without leaving this one.

const FRAME = 10 / 16; // the window's height over its width

export function ProjectPreview({
  src,
  url,
  ratio,
  alt,
  className,
}: {
  src: string;
  url: string;
  /** The screenshot's height over its width. */
  ratio: number;
  alt: string;
  className?: string;
}) {
  // translateY(%) is measured against the image's own height.
  const travel = Math.max(0, (1 - FRAME / ratio) * 100);
  const host = url.replace(/^https?:\/\//, "").replace(/\/$/, "");

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border border-border bg-bg shadow-[0_1px_0_0_var(--color-border),0_24px_48px_-24px_rgb(0_0_0/0.18)] transition-[transform,box-shadow] duration-700 ease-out-expo group-hover:-translate-y-1 group-hover:shadow-[0_1px_0_0_var(--color-border),0_40px_80px_-32px_rgb(0_0_0/0.28)]",
        className
      )}
    >
      <div className="flex items-center gap-3 border-b border-border bg-bg-secondary px-3.5 py-2.5">
        <div className="flex gap-1.5" aria-hidden="true">
          <span className="size-2.5 rounded-full bg-border" />
          <span className="size-2.5 rounded-full bg-border" />
          <span className="size-2.5 rounded-full bg-border" />
        </div>
        <div className="mx-auto max-w-[70%] truncate rounded-md px-3 py-0.5 font-mono text-[11px] text-text-tertiary">
          {host}
        </div>
        <div className="w-[42px]" aria-hidden="true" />
      </div>
      <div className="relative overflow-hidden" style={{ aspectRatio: "16 / 10" }}>
        <img
          src={src}
          alt={alt}
          loading="lazy"
          decoding="async"
          draggable={false}
          className="preview-shot absolute inset-x-0 top-0 w-full select-none transition-transform duration-[1400ms] ease-out-expo group-hover:duration-[7000ms] group-hover:ease-in-out group-hover:[transform:translateY(var(--travel))] motion-reduce:!transform-none"
          style={{ ["--travel" as string]: `-${travel.toFixed(2)}%` }}
        />
      </div>
    </div>
  );
}
