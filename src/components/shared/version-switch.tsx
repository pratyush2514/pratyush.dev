"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { trackEvent } from "@/lib/analytics";
import {
  CLASSIC_DESIGN_PATH,
  NEW_DESIGN_PATH,
  SITE_SWITCHED_COOKIE,
  SITE_SWITCH_PATH,
} from "@/lib/site-version";

/*
 * Switch back to the classic home page. The link hits the switch path in
 * src/proxy.ts, which sets the version cookie and sends the visitor to "/".
 */

function readCookie(name: string): string | undefined {
  return document.cookie
    .split("; ")
    .find((part) => part.startsWith(`${name}=`))
    ?.slice(name.length + 1);
}

export function VersionSwitch() {
  // The gallery has a classic twin; everywhere else goes back to the classic home.
  const pathname = usePathname();
  const next = pathname === NEW_DESIGN_PATH ? "&next=" + encodeURIComponent(CLASSIC_DESIGN_PATH) : "";

  // The switch endpoint leaves a one-shot cookie behind, so the arrival is
  // counted here, where analytics is set up. The classic page has none.
  useEffect(() => {
    const switched = readCookie(SITE_SWITCHED_COOKIE);
    if (!switched) return;
    document.cookie = `${SITE_SWITCHED_COOKIE}=; Max-Age=0; Path=/`;
    trackEvent("site_version_switch", { to: switched });
  }, []);

  return (
    <nav
      aria-label="Site version"
      className="fixed bottom-[max(1.5rem,env(safe-area-inset-bottom))] left-1/2 z-[60] flex -translate-x-1/2 items-center gap-0.5 rounded-full border border-border/70 bg-background/70 p-1 text-xs shadow-sm backdrop-blur-md md:left-6 md:translate-x-0"
    >
      <a
        href={`${SITE_SWITCH_PATH}?v=classic${next}`}
        onClick={() => trackEvent("site_version_switch", { to: "classic" })}
        className="rounded-full px-3 py-1.5 text-muted-foreground micro-transition hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      >
        Classic
      </a>
      <span aria-current="true" className="rounded-full bg-secondary px-3 py-1.5 text-foreground">
        New
      </span>
    </nav>
  );
}
