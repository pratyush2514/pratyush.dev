"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * Renders `children` only once the placeholder is about to scroll into view.
 *
 * Pair it with `next/dynamic` so a heavy, below-the-fold widget costs nothing
 * (no JavaScript, no hydration, no main-thread work) until someone is near it:
 *
 *   const Heavy = dynamic(() => import("./heavy"), { ssr: false });
 *   <LazyMount><Heavy /></LazyMount>
 *
 * The wrapper has no box of its own beyond `h-full`, so give the parent a
 * fixed height to avoid layout shift when the content arrives.
 */
export function LazyMount({
  children,
  rootMargin = "600px 0px",
  fallback = null,
  className = "h-full",
}: {
  children: ReactNode;
  /** How far ahead of the viewport to start loading. */
  rootMargin?: string;
  fallback?: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    if (typeof IntersectionObserver === "undefined") {
      // Very old browsers: show it right away rather than never.
      const id = window.setTimeout(() => setShow(true), 0);
      return () => window.clearTimeout(id);
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setShow(true);
        observer.disconnect();
      },
      { rootMargin },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [rootMargin]);

  return (
    <div ref={ref} className={className}>
      {show ? children : fallback}
    </div>
  );
}
