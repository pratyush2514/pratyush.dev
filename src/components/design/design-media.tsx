"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

type MediaProps = {
  src: string;
  poster?: string;
  kind: "image" | "gif" | "video";
  alt: string;
  className?: string;
  /** Lightbox mode: video gets controls and sound is allowed. */
  full?: boolean;
};

const reducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * Screen recordings play, muted and looping, only while they are on screen,
 * so a page full of them stays light. With reduced motion they wait for a
 * click (in the lightbox, where they get controls).
 */
export function DesignMedia({ src, poster, kind, alt, className, full }: MediaProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || full || reducedMotion()) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) video.play().catch(() => {});
        else video.pause();
      },
      { threshold: 0.35 }
    );
    io.observe(video);
    return () => io.disconnect();
  }, [full]);

  const fade = cn(
    "transition-opacity duration-700 ease-out-expo",
    loaded ? "opacity-100" : "opacity-0",
    className
  );

  if (kind === "video") {
    return (
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        muted={!full}
        loop
        playsInline
        autoPlay={full && !reducedMotion()}
        controls={full}
        preload={full ? "auto" : "metadata"}
        aria-label={alt}
        onLoadedData={() => setLoaded(true)}
        className={cn(fade, poster && "opacity-100")}
      />
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element -- GIFs must stay animated, and Storage already serves the original
    <img
      src={src}
      alt={alt}
      loading={full ? "eager" : "lazy"}
      decoding="async"
      draggable={false}
      onLoad={() => setLoaded(true)}
      ref={(el) => {
        if (el?.complete) setLoaded(true);
      }}
      className={fade}
    />
  );
}
