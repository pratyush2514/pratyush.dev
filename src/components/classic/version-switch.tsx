import { SITE_SWITCH_PATH } from "@/lib/site-version";

/*
 * Switch to the new version of the site. The link hits the switch path in
 * src/proxy.ts, which sets the version cookie and sends the visitor back to
 * "/". A plain link, so it works without JavaScript.
 */
export function ClassicVersionSwitch() {
  return (
    <nav
      aria-label="Site version"
      className="fixed bottom-[max(1.5rem,env(safe-area-inset-bottom))] left-4 z-30 flex items-center gap-0.5 rounded-full border border-border/80 bg-bg/70 p-1 text-xs backdrop-blur-xl backdrop-saturate-150 sm:left-6"
    >
      <span aria-current="true" className="rounded-full bg-bg-secondary px-3 py-1.5 text-text">
        Classic
      </span>
      <a
        href={`${SITE_SWITCH_PATH}?v=new`}
        className="rounded-full px-3 py-1.5 text-text-secondary transition-colors duration-300 hover:text-text"
      >
        New
      </a>
    </nav>
  );
}
