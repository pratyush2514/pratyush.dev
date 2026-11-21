"use client";

import { useEffect, useSyncExternalStore } from "react";
import { trackEvent } from "@/lib/analytics";

/*
 * Switch back to the classic site, which lives on the `main` branch.
 *
 * The classic deployment owns the domain. When its `site-version` cookie says
 * "revamp", its middleware serves this deployment on the same URL; the switch
 * path is handled there too, so it only exists when that proxy is in front.
 * Keep these names in sync with `src/middleware.ts` on `main`.
 */
const VERSION_COOKIE = "site-version";
const SWITCHED_COOKIE = "site-version-switched";
const SWITCH_PATH = "/__site";

function readCookie(name: string): string | undefined {
  return document.cookie
    .split("; ")
    .find((part) => part.startsWith(`${name}=`))
    ?.slice(name.length + 1);
}

const noSubscribe = () => () => {};
const isServedByClassic = () => readCookie(VERSION_COOKIE) === "revamp";
const onServer = () => false;

export function VersionSwitch() {
  // Hidden on this deployment's own URL, where the switch path doesn't exist.
  const visible = useSyncExternalStore(noSubscribe, isServedByClassic, onServer);

  // The classic site's switch endpoint leaves a one-shot cookie behind, so the
  // arrival is counted here, where analytics is set up.
  useEffect(() => {
    if (readCookie(SWITCHED_COOKIE) !== "revamp") return;
    document.cookie = `${SWITCHED_COOKIE}=; Max-Age=0; Path=/`;
    trackEvent("site_version_switch", { to: "revamp" });
  }, []);

  if (!visible) return null;

  return (
    <nav
      aria-label="Site version"
      className="fixed bottom-[max(1.5rem,env(safe-area-inset-bottom))] left-1/2 z-[60] flex -translate-x-1/2 items-center gap-0.5 rounded-full border border-border/70 bg-background/70 p-1 text-xs shadow-sm backdrop-blur-md md:left-6 md:translate-x-0"
    >
      <a
        href={`${SWITCH_PATH}?v=classic`}
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
