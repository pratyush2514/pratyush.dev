/*
 * Which version of the home page a visitor sees. Shared by src/proxy.ts and
 * the two version switches.
 *
 * - no cookie, or "classic": the original portfolio (/classic)
 * - "new": the redesigned home page
 */
export const SITE_VERSION_COOKIE = "site-version";
/** One-shot marker so the page can count a switch in analytics. */
export const SITE_SWITCHED_COOKIE = "site-version-switched";
/** GET /__site?v=new|classic[&next=/path] sets the cookie and redirects. */
export const SITE_SWITCH_PATH = "/__site";
/** Internal route the classic home page renders from. */
export const CLASSIC_HOME_PATH = "/classic";

export type SiteVersion = "classic" | "new";

/** The classic site's UI / UX gallery, on its own page. */
export const CLASSIC_DESIGN_PATH = "/interfaces";
/** The new site's UI / UX gallery. */
export const NEW_DESIGN_PATH = "/design";

/**
 * Where the switch may send a visitor afterwards. A fixed list, so the switch
 * can't be used as an open redirect.
 */
export const SWITCH_TARGETS = new Set(["/", CLASSIC_DESIGN_PATH, NEW_DESIGN_PATH]);