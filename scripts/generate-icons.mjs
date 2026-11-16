// Regenerates every browser/app icon from the navbar logo's pixel data.
//
//   node scripts/generate-icons.mjs
//
// Writes into public/: favicon.svg, favicon.ico, apple-touch-icon.png,
// android-chrome-192x192.png and android-chrome-512x512.png. Run it again
// whenever src/lib/logo-pixels.ts changes. Uses the copy of `sharp` that
// ships with Next.js, so there is nothing extra to install.

import { createRequire } from "node:module";
import { writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const requireFromNext = createRequire(
  createRequire(path.join(root, "package.json")).resolve("next/package.json"),
);
const sharp = requireFromNext("sharp");

const { LOGO_PATHS, LOGO_SHADES, LOGO_GRID } = await import(
  pathToFileURL(path.join(root, "src/lib/logo-pixels.ts")).href
);

// Resolved values of --footer-earth-* in src/app/globals.css.
const COLORS = {
  deep: "19 54 103",
  ocean: "35 112 190",
  light: "169 220 249",
  cloud: "246 251 255",
};
const TILE = "#0b1424"; // near-black navy: reads on light and dark tab strips

// Tight bounds of the mark, so it can be centred and scaled to fill the tile.
const bounds = { x0: LOGO_GRID, y0: LOGO_GRID, x1: 0, y1: 0 };
for (const d of LOGO_PATHS) {
  for (const [, x, y, w] of d.matchAll(/M(\d+) (\d+)h(\d+)/g).map((m) => m.map(Number))) {
    bounds.x0 = Math.min(bounds.x0, x);
    bounds.y0 = Math.min(bounds.y0, y);
    bounds.x1 = Math.max(bounds.x1, x + w);
    bounds.y1 = Math.max(bounds.y1, y + 1);
  }
}
const markW = bounds.x1 - bounds.x0;
const markH = bounds.y1 - bounds.y0;
const markCx = (bounds.x0 + bounds.x1) / 2;
const markCy = (bounds.y0 + bounds.y1) / 2;

/** @param {number} fill  share of the tile the mark's longer side occupies */
function svg({ fill = 0.66, radius = 0.22, tile = true } = {}) {
  const scale = (32 * fill) / Math.max(markW, markH);
  const tx = 16 - markCx * scale;
  const ty = 16 - markCy * scale;
  const paths = LOGO_SHADES.map(
    (shade, i) => `<path d="${LOGO_PATHS[i]}" fill="rgb(${COLORS[shade].replaceAll(" ", ",")})"/>`,
  ).join("");
  const bg = tile ? `<rect width="32" height="32" rx="${32 * radius}" fill="${TILE}"/>` : "";
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">${bg}` +
    `<g transform="translate(${tx.toFixed(3)} ${ty.toFixed(3)}) scale(${scale.toFixed(4)})" shape-rendering="crispEdges">${paths}</g></svg>`
  );
}

async function png(markup, size) {
  return sharp(Buffer.from(markup), { density: (72 * size) / 32 })
    .resize(size, size)
    .png({ compressionLevel: 9 })
    .toBuffer();
}

/** An .ico that embeds PNG images (supported by every browser since IE9). */
function ico(images) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(1, 2); // type: icon
  header.writeUInt16LE(images.length, 4);
  let offset = 6 + images.length * 16;
  const entries = images.map(({ size, data }) => {
    const entry = Buffer.alloc(16);
    entry.writeUInt8(size >= 256 ? 0 : size, 0);
    entry.writeUInt8(size >= 256 ? 0 : size, 1);
    entry.writeUInt16LE(1, 4); // colour planes
    entry.writeUInt16LE(32, 6); // bits per pixel
    entry.writeUInt32LE(data.length, 8);
    entry.writeUInt32LE(offset, 12);
    offset += data.length;
    return entry;
  });
  return Buffer.concat([header, ...entries, ...images.map((i) => i.data)]);
}

const out = (name, data) => {
  writeFileSync(path.join(root, "public", name), data);
  console.log(`wrote public/${name} (${data.length} bytes)`);
};

// Small tab sizes get a bigger mark: padding costs more at 16px than at 512px.
const tab = svg({ fill: 0.78, radius: 0.2 });
const app = svg({ fill: 0.6, radius: 0.22 });
// Home-screen icons are masked by the OS, so they go full-bleed with no corners.
const bleed = svg({ fill: 0.56, radius: 0 });

out("favicon.svg", Buffer.from(tab));
out(
  "favicon.ico",
  ico([
    { size: 16, data: await png(tab, 16) },
    { size: 32, data: await png(tab, 32) },
    { size: 48, data: await png(tab, 48) },
  ]),
);
out("apple-touch-icon.png", await png(bleed, 180));
out("android-chrome-192x192.png", await png(app, 192));
out("android-chrome-512x512.png", await png(app, 512));
