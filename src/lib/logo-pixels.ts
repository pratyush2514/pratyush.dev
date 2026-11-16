// The dithered "P" mark as pixel paths. Single source of truth: the navbar
// <Logo> renders it, and scripts/generate-icons.mjs bakes the same pixels into
// the favicon, apple-touch-icon and app icons, so they can never drift apart.
//
// Plain TypeScript with no path aliases on purpose: Node can import this file
// directly (type stripping), so the icon script needs no build step.

export const LOGO_GRID = 40;

/** Darkest to lightest. Colours come from the footer Earth CSS variables. */
export const LOGO_SHADES = ["deep", "ocean", "light", "cloud"] as const;

/** The same ordered 4 by 4 Bayer pattern as the footer Earth. */
const DITHER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];

// A "P": a vertical stem plus a ring-shaped bowl at the top right.
function insideMark(x: number, y: number) {
  const stem = x >= 9 && x < 15 && y >= 5 && y < 34;
  const dx = x - 19;
  const dy = y - 14;
  const r = Math.hypot(dx, dy);
  const bowl = x >= 12 && r <= 9.5 && (r >= 4 || x < 15);
  const bar = x >= 9 && x < 19 && ((y >= 5 && y < 9.5) || (y >= 18.5 && y < 23));
  return stem || (bowl && x >= 19) || bar;
}

/** shade index -> one SVG path covering every pixel of that shade. */
function buildPaths(): string[] {
  const rows: number[][][] = LOGO_SHADES.map(() => []);

  for (let y = 0; y < LOGO_GRID; y++) {
    for (let x = 0; x < LOGO_GRID; x++) {
      const front = insideMark(x + 0.5, y + 0.5);
      const side = insideMark(x - 1.5, y - 1.5);
      if (!front && !side) continue;

      const threshold = (DITHER[(y % 4) * 4 + (x % 4)] + 0.5) / 16;
      const light = 1 - ((x / LOGO_GRID) * 0.65 + (y / LOGO_GRID) * 0.35);
      if (front && threshold > 0.84 + light * 0.14) continue;

      const shade = front
        ? Math.min(3, Math.floor(0.45 + light * 2.5 + threshold))
        : threshold > 0.8
          ? 1
          : 0;
      rows[shade].push([x, y]);
    }
  }

  // Merge horizontal neighbours into single runs: same pixels, far fewer commands.
  return rows.map((pixels) => {
    let d = "";
    let i = 0;
    while (i < pixels.length) {
      const [x, y] = pixels[i];
      let run = 1;
      while (i + run < pixels.length && pixels[i + run][1] === y && pixels[i + run][0] === x + run) run++;
      d += `M${x} ${y}h${run}v1h-${run}z`;
      i += run;
    }
    return d;
  });
}

export const LOGO_PATHS = buildPaths();
