"use client";

import { useSyncExternalStore } from "react";
import type { AboutGreetings } from "@/config/types";

// Re-check exactly on each minute boundary (so the greeting flips at 12:00,
// not up to a minute late), and when the tab regains focus or visibility.
function subscribe(onChange: () => void) {
  let timer = 0;
  const schedule = () => {
    const now = new Date();
    const msToNextMinute = 60_000 - (now.getSeconds() * 1000 + now.getMilliseconds());
    timer = window.setTimeout(() => {
      onChange();
      schedule();
    }, msToNextMinute + 50);
  };
  schedule();
  window.addEventListener("focus", onChange);
  document.addEventListener("visibilitychange", onChange);
  return () => {
    window.clearTimeout(timer);
    window.removeEventListener("focus", onChange);
    document.removeEventListener("visibilitychange", onChange);
  };
}

/** Uses the visitor's own clock and time zone. */
function getPeriod(): keyof AboutGreetings {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return "morning";
  if (hour >= 12 && hour < 17) return "afternoon";
  if (hour >= 17 && hour < 21) return "evening";
  return "night";
}

// Keep the server and first browser render identical until local time is known.
const getServerSnapshot = () => null;

export function AboutGreeting({
  fallback,
  greetings,
}: {
  fallback: string;
  greetings: AboutGreetings;
}) {
  const period = useSyncExternalStore(subscribe, getPeriod, getServerSnapshot);
  return period ? greetings[period] : fallback;
}
