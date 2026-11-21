import { BottomNav } from "@/components/landing/bottom-nav";
import { BackToTop } from "@/components/shared/back-to-top";
import { FrameGutters } from "@/components/shared/frame-gutters";
import { SiteHeader } from "@/components/shared/site-header";
import { VersionSwitch } from "@/components/shared/version-switch";
import type { ReactNode } from "react";

/** The centred, bordered column every public page sits in. */
export function SiteFrame({ children }: { children: ReactNode }) {
  return (
    <>
      <SiteHeader />
      <FrameGutters />
      <div className="relative mx-auto w-full max-w-[var(--frame-max-w)]">
        <div className="relative w-full border-x bg-muted/20">{children}</div>
        <BottomNav />
        <BackToTop />
        <VersionSwitch />
      </div>
    </>
  );
}
