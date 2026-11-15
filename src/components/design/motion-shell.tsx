"use client";

import { LazyMotion, MotionConfig, domAnimation } from "framer-motion";

/** Loads the motion features for `m` components outside the home page. */
export function MotionShell({ children }: { children: React.ReactNode }) {
  return (
    <LazyMotion features={domAnimation}>
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </LazyMotion>
  );
}
