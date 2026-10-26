"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

// Hosts a Hairline figure (public/hairline/<name>.js) the way the package's
// bench does: the kernel is a classic script that defines window.HL, and each
// figure is a module that registers itself through window.hairline().

type Figure = {
  name: string;
  means: string;
  range: [number, number, number];
  tour: ([number, number] | null)[] | null;
  mount: (
    host: { stage: HTMLElement; svg: SVGSVGElement; read: { textContent: string } },
    value: number
  ) => { set: (v: number) => void; destroy: () => void };
};

type HLGlobal = {
  inject: (root: Document) => void;
  mk: (tag: string, attrs: Record<string, string>, parent: Element) => SVGSVGElement;
  tour: (stage: HTMLElement, stops: Figure["tour"], onStop?: (i: number) => void) => { stop: () => void };
  LAP: Figure["tour"];
};

declare global {
  interface Window {
    HL?: HLGlobal;
    hairline?: (figure: Figure) => void;
    __hairlineFigures?: Record<string, Figure>;
  }
}

const loaded = new Map<string, Promise<void>>();

const loadScript = (src: string, module = false) => {
  if (!loaded.has(src)) {
    loaded.set(
      src,
      new Promise<void>((resolve, reject) => {
        const el = document.createElement("script");
        el.src = src;
        if (module) el.type = "module";
        el.onload = () => resolve();
        el.onerror = () => reject(new Error(`hairline: failed to load ${src}`));
        document.head.appendChild(el);
      })
    );
  }
  return loaded.get(src)!;
};

const loadFigure = async (name: string): Promise<Figure> => {
  await loadScript("/hairline/kernel.js");
  if (!window.__hairlineFigures) {
    const registry: Record<string, Figure> = {};
    window.__hairlineFigures = registry;
    window.hairline = (figure) => {
      registry[figure.name] = figure;
    };
  }
  await loadScript(`/hairline/${name}.js`, true);
  const figure = window.__hairlineFigures[name];
  if (!figure) throw new Error(`hairline: ${name} did not register`);
  return figure;
};

export function HairlineFigure({
  name,
  caption,
  autoplay = false,
  className,
  stageClassName,
}: {
  name: string;
  caption?: string;
  autoplay?: boolean;
  className?: string;
  stageClassName?: string;
}) {
  const stageRef = useRef<HTMLDivElement>(null);
  const [read, setRead] = useState("rest");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let teardown = () => {};

    loadFigure(name)
      .then((figure) => {
        const stage = stageRef.current;
        const HL = window.HL;
        if (cancelled || !stage || !HL) return;

        HL.inject(document);
        stage.setAttribute("aria-label", figure.means);
        const svg = HL.mk("svg", { viewBox: "0 0 400 320", "aria-hidden": "true" }, stage);
        let text = "rest";
        const readOut = {
          get textContent() {
            return text;
          },
          set textContent(v: string) {
            text = v == null ? "" : String(v);
            setRead(text);
          },
        };
        const handle = figure.mount({ stage, svg, read: readOut }, figure.range[1]);
        // The page plays the figure's lap until a hand arrives; the kernel
        // pauses it offscreen and skips it under reduced motion.
        const lap = autoplay ? HL.tour(stage, figure.tour || HL.LAP) : null;
        setReady(true);

        teardown = () => {
          lap?.stop();
          handle.destroy();
          svg.remove();
        };
      })
      .catch(() => {
        // The figure is decoration; the page reads fine without it.
      });

    return () => {
      cancelled = true;
      teardown();
    };
  }, [name, autoplay]);

  return (
    <figure className={cn("relative", className)}>
      <div
        ref={stageRef}
        data-hairline={name}
        role="img"
        className={cn(
          "transition-opacity duration-1000 ease-out",
          ready ? "opacity-100" : "opacity-0",
          stageClassName
        )}
      />
      {caption && (
        <figcaption className="mt-2 flex items-center justify-between gap-4 font-mono text-[11px] text-text-tertiary">
          <span>{caption}</span>
          <span
            className={cn(
              "tabular-nums transition-colors duration-300",
              read === "rest" ? "text-text-tertiary" : "text-emerald-600 dark:text-emerald-400"
            )}
            aria-hidden="true"
          >
            {read}
          </span>
        </figcaption>
      )}
    </figure>
  );
}
