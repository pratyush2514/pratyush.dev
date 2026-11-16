"use client";

import { HeaderActions } from "@/components/shared/header-actions";
import { Logo } from "@/components/shared/logo";
import { siteNavigationItems, isNavigationItemActive } from "@/components/shared/site-navigation";
import { navigationConfig } from "@/config/navigation";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, useScroll, useSpring } from "motion/react";
import { revealOnMount } from "@/lib/motion";
import { useEffect, useRef, useState, type RefObject } from "react";
import styles from "./site-header.module.css";

/** Past this, the bar picks up its frosted surface. */
const SCROLLED_AT = 8;
/** Never hide while the hero is still in view. */
const HIDE_AFTER = 200;
/** Scroll this far in one direction before the bar reacts, so small
 *  trackpad jitters and momentum wobble don't make it flicker. */
const DIRECTION_TOLERANCE = 12;

function useHeaderScroll(headerRef: RefObject<HTMLElement | null>) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let lastY = window.scrollY;
    let travel = 0;
    let frame = 0;

    const update = () => {
      frame = 0;
      const y = Math.max(0, window.scrollY);
      const delta = y - lastY;
      lastY = y;

      setScrolled(y > SCROLLED_AT);

      // Keyboard users tabbing through the bar, and anyone who prefers less
      // motion, always keep it in place.
      const focusInside = headerRef.current?.contains(document.activeElement) ?? false;
      if (reducedMotion.matches || focusInside || y < HIDE_AFTER) {
        travel = 0;
        setHidden(false);
        return;
      }

      // Reset the accumulated distance whenever the direction flips.
      travel = Math.sign(delta) === Math.sign(travel) ? travel + delta : delta;
      if (travel > DIRECTION_TOLERANCE) setHidden(true);
      else if (travel < -DIRECTION_TOLERANCE) setHidden(false);
    };

    const onScroll = () => {
      if (frame === 0) frame = requestAnimationFrame(update);
    };

    const onFocusIn = () => setHidden(false);
    const header = headerRef.current;

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    header?.addEventListener("focusin", onFocusIn);

    return () => {
      if (frame !== 0) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      header?.removeEventListener("focusin", onFocusIn);
    };
    // Re-sync on navigation: the new page starts at the top with the bar shown.
  }, [headerRef, pathname]);

  return { scrolled, hidden };
}

export function SiteHeader() {
  const pathname = usePathname();
  const headerRef = useRef<HTMLElement>(null);
  const { scrolled, hidden } = useHeaderScroll(headerRef);
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 260, damping: 40, restDelta: 0.001 });

  return (
    <header
      ref={headerRef}
      data-scrolled={scrolled}
      data-hidden={hidden}
      className={cn(
        "pointer-events-none sticky top-[max(0.75rem,env(safe-area-inset-top))] z-40 mx-auto -mb-11 h-11 w-full max-w-[var(--frame-max-w)] px-3 sm:top-4",
        styles.header,
      )}
    >
      <div className={styles.bar}>
        <div aria-hidden="true" className={styles.surface}>
          <motion.span className={styles.progress} style={{ scaleX: progress }} />
        </div>

        <motion.nav
          {...revealOnMount({ y: -10 })}
          aria-label={navigationConfig.label}
          className="pointer-events-auto flex items-center gap-2"
        >
          <Link
            href="/"
            aria-label="Home"
            aria-current={pathname === "/" ? "page" : undefined}
            className={cn(
              "flex size-11 shrink-0 items-center justify-center rounded-xl outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
              styles.homeLink,
            )}
          >
            <span aria-hidden="true" className={styles.logoStage}>
              <Logo size={34} />
            </span>
          </Link>

          <div className="hidden items-center gap-1.5 md:flex">
            <svg
              viewBox="0 0 16 16"
              aria-hidden="true"
              focusable="false"
              className="mx-0.5 size-4 shrink-0 text-muted-foreground/60"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="3" cy="4" r="1.25" fill="currentColor" stroke="none" />
              <path d="M7.5 4H13M3 9v3h5" />
              <circle
                cx="12.5"
                cy="12"
                r="1.25"
                className="fill-primary/70"
                stroke="none"
              />
            </svg>
            {siteNavigationItems.filter((item) => item.id !== "home").map((item) => {
              const active = isNavigationItemActive(item, pathname);
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  aria-current={active ? "location" : undefined}
                  data-active={active}
                  className={cn(styles.tab, item.id === "components" && styles.accent)}
                >
                  <span className={styles.label}>{item.label}</span>
                  <span aria-hidden="true" className={styles.tile}>
                    <item.Icon className="text-foreground" />
                  </span>
                </Link>
              );
            })}
          </div>
        </motion.nav>
        <HeaderActions />
      </div>
    </header>
  );
}
