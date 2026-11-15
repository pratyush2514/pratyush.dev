import { flushSync } from "react-dom";

/**
 * Switches the theme inside a View Transition, so the change reads as one
 * calm motion instead of a hard cut:
 * - from a click: the new theme grows out of the pointer as a soft circle
 * - from the keyboard or the command palette: a short crossfade
 *
 * Falls back to an instant switch when the browser has no View Transitions
 * or the visitor prefers reduced motion. Styles live in globals.css under
 * "Theme transition".
 */
export function switchThemeWithTransition(
  apply: () => void,
  origin?: { x: number; y: number },
) {
  if (
    typeof document === "undefined" ||
    !document.startViewTransition ||
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  ) {
    apply();
    return;
  }

  const root = document.documentElement;
  if (origin) {
    const radius = Math.hypot(
      Math.max(origin.x, window.innerWidth - origin.x),
      Math.max(origin.y, window.innerHeight - origin.y),
    );
    root.style.setProperty("--theme-x", `${origin.x}px`);
    root.style.setProperty("--theme-y", `${origin.y}px`);
    root.style.setProperty("--theme-r", `${Math.ceil(radius)}px`);
    root.dataset.themeTransition = "reveal";
  } else {
    root.dataset.themeTransition = "fade";
  }

  // next-themes applies the class in an effect; flushSync makes it land inside
  // the transition callback so the browser captures the new state.
  const transition = document.startViewTransition(() => flushSync(apply));
  transition.finished.finally(() => {
    delete root.dataset.themeTransition;
  });
}

/** Centre of the element that was clicked, or undefined for keyboard activation. */
export function originFromEvent(event?: { currentTarget: EventTarget | null; detail?: number }) {
  // detail === 0 means the "click" came from Enter or Space.
  if (!event || event.detail === 0 || !(event.currentTarget instanceof Element)) return undefined;
  const rect = event.currentTarget.getBoundingClientRect();
  return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
}
