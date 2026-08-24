// ---------------------------------------------------------------------------
// LVINIT EDITORIAL COVER GENERATOR
//
// Draws a branded, non-photographic cover for a guide that has no authentic
// photograph, and writes it as an optimized WebP:
//
//   node scripts/generate-guide-cover.mjs \
//     --slug first-summer-in-vegas \
//     --category "Moving Here" \
//     --subject "Las Vegas Summer"
//   -> public/images/covers/las-vegas-summer-editorial-cover.webp
//
// WHY THIS EXISTS. LVINIT never fills an empty image slot with a stand-in
// photo (CLAUDE.md -> Imagery). The runtime fallback in components/GuideCard.tsx
// keeps such a card honest, but it is the same gray panel every time. This
// generator gives those pieces an intentional editorial cover instead —
// obviously drawn, never mistakable for photography.
//
// WHAT IT WILL NOT DRAW — this is the integrity contract, not a style note:
//   * no houses, streets, skylines, people, or anything photographic
//   * no numbers of any kind — no prices, temperatures, tax figures, dates,
//     percentages, or chart values. Every motif below is pure geometry, so
//     there is no code path that can emit a fabricated figure.
//   * no real geography. The neighborhood motif is an abstract orthogonal
//     grid, not a map — accurate LVINIT maps come from
//     scripts/generate-area-map.mjs, which is built on real WGS84 coordinates.
//   * no seals, forms, letterheads, or logos other than the LVINIT wordmark.
//
// TYPOGRAPHY. Playfair Display and Inter ship in scripts/fonts (both SIL OFL
// 1.1, licenses alongside them) and are fed to the renderer through a
// generated fontconfig file. That is deliberate: neither face is a system font
// on a typical machine, and without this the covers would silently rasterize in
// Georgia/Arial and drift between whoever regenerated them last. Vendoring the
// files makes the output identical on any machine, offline.
//
// DETERMINISM. Every irregular placement is driven by a PRNG seeded from the
// slug, so re-running this command reproduces the same artwork byte for byte.
// ---------------------------------------------------------------------------

import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { tmpdir } from "node:os";

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(SCRIPT_DIR, "..");

// --- brand tokens (docs/02-visual-design-system.md) -------------------------

const C = {
  black: "#111111",
  warm: "#6E6A63",
  light: "#E8E6E1",
  blue: "#2B6CB0",
  gold: "#C8A46A",
  paper: "#FFFFFF",
};

const SERIF = "'Playfair Display', Georgia, serif";
const SANS = "Inter, 'Helvetica Neue', Helvetica, Arial, sans-serif";

// --- canvas -----------------------------------------------------------------
// 1200x900 is 4:3, matching the `aspect-[4/3]` media box in GuideCard.tsx. It
// is also ~3x the widest place a card is actually drawn, so the WebP stays
// crisp on a retina phone without shipping anything oversized.

const W = 1200;
const H = 900;
const M = 84; // outer margin

// Minimum stroke width and line spacing. A 1px hairline in a 1200px master
// lands near a third of a pixel once the browser scales the card down to
// ~380px, which either disappears or shimmers; tight line fields moire for the
// same reason. Nothing below these floors gets drawn.
const HAIRLINE = 2;
const MIN_SPACING = 26;

// --- helpers ----------------------------------------------------------------

function esc(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function round(n) {
  return Math.round(n * 10) / 10;
}

/** Deterministic PRNG so the same slug always yields the same artwork. */
function seededRandom(seed) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return function next() {
    h += 0x6d2b79f5;
    let t = h;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function line(x1, y1, x2, y2, { stroke = C.light, width = HAIRLINE, opacity = 1, dash = null } = {}) {
  return (
    `<line x1="${round(x1)}" y1="${round(y1)}" x2="${round(x2)}" y2="${round(y2)}" ` +
    `stroke="${stroke}" stroke-width="${width}"` +
    (opacity !== 1 ? ` stroke-opacity="${opacity}"` : "") +
    (dash ? ` stroke-dasharray="${dash}"` : "") +
    ' stroke-linecap="butt"/>'
  );
}

function rect(x, y, w, h, { fill = "none", stroke = null, width = HAIRLINE, fillOpacity = 1, strokeOpacity = 1 } = {}) {
  return (
    `<rect x="${round(x)}" y="${round(y)}" width="${round(w)}" height="${round(h)}" fill="${fill}"` +
    (fillOpacity !== 1 ? ` fill-opacity="${fillOpacity}"` : "") +
    (stroke ? ` stroke="${stroke}" stroke-width="${width}"` : "") +
    (stroke && strokeOpacity !== 1 ? ` stroke-opacity="${strokeOpacity}"` : "") +
    "/>"
  );
}

function circle(cx, cy, r, { fill = "none", stroke = null, width = HAIRLINE, fillOpacity = 1, strokeOpacity = 1 } = {}) {
  return (
    `<circle cx="${round(cx)}" cy="${round(cy)}" r="${round(r)}" fill="${fill}"` +
    (fillOpacity !== 1 ? ` fill-opacity="${fillOpacity}"` : "") +
    (stroke ? ` stroke="${stroke}" stroke-width="${width}"` : "") +
    (stroke && strokeOpacity !== 1 ? ` stroke-opacity="${strokeOpacity}"` : "") +
    "/>"
  );
}

function text(str, x, y, { font = SANS, size = 30, weight = 400, fill = C.black, spacing = 0, anchor = "start" } = {}) {
  return (
    `<text x="${round(x)}" y="${round(y)}" font-family="${font}" font-size="${size}" ` +
    `font-weight="${weight}" fill="${fill}"` +
    (spacing ? ` letter-spacing="${spacing}"` : "") +
    (anchor !== "start" ? ` text-anchor="${anchor}"` : "") +
    `>${esc(str)}</text>`
  );
}

// --- category motifs --------------------------------------------------------
// Each returns SVG for the middle band only (roughly y 200-660). The chassis
// around it — blue top rule, eyebrow, subject line, wordmark — is identical for
// every category, which is what keeps one coherent LVINIT system while letting
// the covers differ at a glance.
//
// These are visual directions, not data. None of them reads a metric.

const BAND = { top: 208, bottom: 648, left: M, right: W - M };

/**
 * Moving Here — climate and direction. A cropped sun, horizontal strata
 * crossing it as heat shimmer, a horizon, and dry desert ticks below.
 */
function motifDesertSun() {
  const out = [];
  const cx = 1000;
  const cy = 352;
  const r = 234;
  const horizon = 648;

  // A high sun, cropped by the right edge and held well clear of the horizon.
  // Deliberately not a sun sitting on the skyline — that is the tourism-poster
  // sunset, and it is also the wrong idea: a Las Vegas summer is about the sun
  // overhead at four in the afternoon. Cropping keeps it an editorial mark
  // rather than a centred icon.
  out.push(circle(cx, cy, r + 92, { stroke: C.gold, width: HAIRLINE, strokeOpacity: 0.28 }));
  out.push(circle(cx, cy, r + 46, { stroke: C.gold, width: HAIRLINE, strokeOpacity: 0.38 }));
  out.push(circle(cx, cy, r, { fill: C.gold, fillOpacity: 0.8 }));

  // Heat haze: paper-coloured bands cut across everything, opening up toward
  // the bottom so the disc breaks apart the way it does through July air.
  // Drawn full width — over white they are invisible, so the effect appears
  // only where there is something to cut.
  let y = cy - r + 16;
  let gap = 50;
  let band = 5;
  while (y < horizon) {
    out.push(rect(0, y, W, band, { fill: C.paper }));
    y += gap + band;
    gap = Math.max(15, gap - 3.6);
    band += 1.2;
  }

  // Horizon, with the ground left as negative space.
  out.push(line(M, horizon, W - M, horizon, { stroke: C.blue, width: 4 }));

  return out;
}

/**
 * Cost of Living — ownership and assessment. A parcel/plat abstraction with one
 * parcel picked out in Scofield Blue: the unit that changes hands. Deliberately
 * irregular so it reads as land division, and deliberately unlabeled so it can
 * never be mistaken for a real plat or an assessor's record.
 */
function motifParcelGrid(rand) {
  const out = [];
  const x0 = M;
  const y0 = BAND.top - 4;
  const x1 = W - M;
  const y1 = BAND.bottom + 44;

  // Recursive binary subdivision — the standard way land actually gets carved,
  // which is why it reads as parcels rather than as a chart.
  const cells = [];
  (function split(x, y, w, h, depth) {
    const MIN_W = 128;
    const MIN_H = 96;
    if (depth === 0 || (w < MIN_W * 2 && h < MIN_H * 2)) {
      cells.push({ x, y, w, h });
      return;
    }
    const vertical = w >= h ? rand() < 0.82 : rand() < 0.18;
    const t = 0.36 + rand() * 0.28; // never a dead-center cut
    if (vertical && w >= MIN_W * 2) {
      const cut = Math.round(w * t);
      split(x, y, cut, h, depth - 1);
      split(x + cut, y, w - cut, h, depth - 1);
    } else if (h >= MIN_H * 2) {
      const cut = Math.round(h * t);
      split(x, y, w, cut, depth - 1);
      split(x, y + cut, w, h - cut, depth - 1);
    } else {
      cells.push({ x, y, w, h });
    }
  })(x0, y0, x1 - x0, y1 - y0, 4);

  for (const c of cells) {
    out.push(rect(c.x, c.y, c.w, c.h, { stroke: C.warm, width: HAIRLINE, strokeOpacity: 0.5 }));
  }

  // The one parcel that changes hands.
  const picked = cells[Math.floor(rand() * cells.length)];
  out.push(
    rect(picked.x, picked.y, picked.w, picked.h, {
      fill: C.blue,
      fillOpacity: 0.12,
      stroke: C.blue,
      width: 4,
    })
  );

  // A dashed rule through the highlighted parcel: the line of transfer.
  const my = picked.y + picked.h / 2;
  out.push(line(x0, my, x1, my, { stroke: C.blue, width: HAIRLINE, opacity: 0.45, dash: "10 14" }));

  return out;
}

/**
 * Market Watch — architectural strata. Stepped horizontal bars of varying
 * length. Intentionally NOT a chart: no axis, no scale, no values, and the
 * lengths are seeded noise rather than any figure.
 */
function motifStrata(rand) {
  const out = [];
  const rows = 9;
  const gap = (BAND.bottom - BAND.top) / rows;
  for (let i = 0; i < rows; i++) {
    const y = BAND.top + gap * i + gap / 2;
    const len = (0.34 + rand() * 0.62) * (W - M * 2);
    const accent = i === Math.floor(rows / 2);
    out.push(
      line(M, y, M + len, y, {
        stroke: accent ? C.blue : C.warm,
        width: accent ? 5 : 3,
        opacity: accent ? 1 : 0.42,
      })
    );
  }
  out.push(line(M, BAND.top, M, BAND.bottom, { stroke: C.black, width: HAIRLINE, opacity: 0.55 }));
  return out;
}

/**
 * Comparisons — a split composition. One centre rule, two mirrored fields that
 * differ in weight so the halves read as genuinely different options.
 */
function motifSplit(rand) {
  const out = [];
  const mid = W / 2;
  out.push(line(mid, BAND.top - 8, mid, BAND.bottom + 8, { stroke: C.blue, width: 4 }));

  for (let i = 0; i < 7; i++) {
    const y = BAND.top + 24 + i * ((BAND.bottom - BAND.top - 48) / 6);
    const l = (0.3 + rand() * 0.6) * (mid - M - 26);
    const r = (0.3 + rand() * 0.6) * (W - M - mid - 26);
    out.push(line(mid - 26 - l, y, mid - 26, y, { stroke: C.warm, width: 3, opacity: 0.45 }));
    out.push(line(mid + 26, y, mid + 26 + r, y, { stroke: C.gold, width: 3, opacity: 0.7 }));
  }
  return out;
}

/**
 * Neighborhoods — an orthogonal street-grid abstraction. NOT a map: no real
 * coordinates, no street names, no boundaries. Real LVINIT geography is drawn
 * by scripts/generate-area-map.mjs from actual WGS84 anchors; this is texture.
 */
function motifStreetGrid(rand) {
  const out = [];
  const xs = [];
  const ys = [];
  for (let x = M; x <= W - M; x += 74) xs.push(x);
  for (let y = BAND.top; y <= BAND.bottom; y += 74) ys.push(y);

  for (const x of xs) {
    out.push(line(x, BAND.top, x, BAND.bottom, { stroke: C.warm, width: HAIRLINE, opacity: 0.32 }));
  }
  for (const y of ys) {
    out.push(line(M, y, W - M, y, { stroke: C.warm, width: HAIRLINE, opacity: 0.32 }));
  }

  // One arterial and one block picked out, so the grid has a subject.
  const ay = ys[1 + Math.floor(rand() * (ys.length - 2))];
  out.push(line(M, ay, W - M, ay, { stroke: C.blue, width: 5 }));
  const bx = xs[1 + Math.floor(rand() * (xs.length - 3))];
  out.push(rect(bx, ay - 74, 74, 74, { fill: C.gold, fillOpacity: 0.22 }));
  return out;
}

/** Local Feature and anything uncategorized — a quiet arc-and-rule composition. */
function motifEditorial(rand) {
  const out = [];
  const cy = (BAND.top + BAND.bottom) / 2;
  for (let i = 0; i < 5; i++) {
    out.push(
      circle(W - M - 40, cy, 110 + i * 62, {
        stroke: i === 1 ? C.blue : C.warm,
        width: i === 1 ? 4 : HAIRLINE,
        strokeOpacity: i === 1 ? 1 : 0.34,
      })
    );
  }
  for (let i = 0; i < 4; i++) {
    const y = BAND.top + 40 + i * 118;
    out.push(line(M, y, M + 150 + rand() * 190, y, { stroke: C.black, width: 3, opacity: 0.5 }));
  }
  return out;
}

const MOTIFS = {
  "moving here": motifDesertSun,
  "cost of living": motifParcelGrid,
  "market watch": motifStrata,
  "buyer guide": motifStrata,
  comparisons: motifSplit,
  neighborhoods: motifStreetGrid,
  "local feature": motifEditorial,
};

function motifFor(category) {
  return MOTIFS[String(category).trim().toLowerCase()] ?? motifEditorial;
}

// --- the cover ---------------------------------------------------------------

function buildSvg({ slug, category, subject }) {
  const rand = seededRandom(slug);
  const parts = [];

  // Ground.
  parts.push(rect(0, 0, W, H, { fill: C.paper }));
  // Top rule — the same Scofield Blue edge the runtime fallback panel carries,
  // so a generated cover and the fallback read as one family.
  parts.push(rect(0, 0, W, 9, { fill: C.blue }));

  parts.push(...motifFor(category)(rand));

  // Eyebrow, top left.
  parts.push(
    text(String(category).toUpperCase(), M, 148, {
      font: SANS,
      size: 29,
      weight: 700,
      fill: C.blue,
      spacing: 5,
    })
  );

  // Bottom row: subject left, wordmark right, sharing a baseline over a
  // hairline rule. The card prints the real headline underneath the image, so
  // the cover carries a short subject at most — never the full title.
  const baseline = H - M + 4;
  parts.push(line(M, baseline - 62, W - M, baseline - 62, { stroke: C.light, width: 3 }));

  if (subject) {
    parts.push(text(subject, M, baseline, { font: SERIF, size: 58, weight: 700, fill: C.black }));
  }

  // LVINIT wordmark: LVI near-black, NIT gold.
  parts.push(text("NIT", W - M, baseline, { font: SANS, size: 30, weight: 800, fill: C.gold, spacing: 3, anchor: "end" }));
  parts.push(text("LVI", W - M - 71, baseline, { font: SANS, size: 30, weight: 800, fill: C.black, spacing: 3, anchor: "end" }));

  const title = `${category} — an LVINIT editorial cover`;
  const desc =
    `Abstract editorial cover artwork for the LVINIT ${category} category. ` +
    `Geometric linework in the LVINIT palette with the category label` +
    (subject ? ` and the words "${subject}"` : "") +
    `. Drawn artwork, not a photograph, and it depicts no real place or figure.`;

  return (
    '<?xml version="1.0" encoding="UTF-8"?>\n' +
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" ` +
    'role="img" aria-labelledby="coverTitle coverDesc">\n' +
    `<title id="coverTitle">${esc(title)}</title>\n` +
    `<desc id="coverDesc">${esc(desc)}</desc>\n` +
    parts.join("\n") +
    "\n</svg>\n"
  );
}

// --- font wiring -------------------------------------------------------------

/**
 * Point the renderer's fontconfig at scripts/fonts before sharp loads, so
 * "Playfair Display" and "Inter" resolve to the vendored files instead of
 * silently falling back to a system serif. Must run before sharp is imported —
 * libvips reads this on initialization.
 */
function useVendoredFonts() {
  const fontDir = join(SCRIPT_DIR, "fonts").replace(/\\/g, "/");
  const confDir = join(tmpdir(), "lvinit-fontconfig");
  mkdirSync(join(confDir, "cache"), { recursive: true });
  const confPath = join(confDir, "fonts.conf");
  writeFileSync(
    confPath,
    '<?xml version="1.0"?>\n<fontconfig>\n' +
      `  <dir>${esc(fontDir)}</dir>\n` +
      `  <cachedir>${esc(join(confDir, "cache").replace(/\\/g, "/"))}</cachedir>\n` +
      "</fontconfig>\n",
    "utf8"
  );
  process.env.FONTCONFIG_FILE = confPath;
}

// --- CLI ---------------------------------------------------------------------

function parseArgs(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith("--")) continue;
    const key = a.slice(2);
    const next = argv[i + 1];
    if (next === undefined || next.startsWith("--")) {
      out[key] = true;
    } else {
      out[key] = next;
      i++;
    }
  }
  return out;
}

const USAGE = `
LVINIT editorial cover generator

  node scripts/generate-guide-cover.mjs --slug <slug> --category <category> [options]

Required
  --slug <slug>          Registry slug from lib/content.ts. Seeds the artwork,
                         so the same slug always regenerates the same cover.
  --category <name>      Editorial category, e.g. "Moving Here". Selects the
                         motif. Unknown categories get the neutral editorial one.

Optional
  --subject <words>      A SHORT line set in Playfair, e.g. "Las Vegas Summer".
                         The card already prints the headline underneath the
                         image — never pass the full article title here.
  --out <filename>       Output filename. Default: <slug>-editorial-cover.webp
  --dir <path>           Output directory. Default: public/images/covers
  --svg <path>           Also write the source SVG here, for inspection. Not
                         committed — the WebP is the shipped asset.
  --quality <n>          WebP quality, 1-100. Default 92.

Categories with a dedicated motif
  Moving Here, Cost of Living, Market Watch, Buyer Guide, Comparisons,
  Neighborhoods, Local Feature
`;

async function main() {
  const args = parseArgs(process.argv.slice(2));

  if (args.help || args.h) {
    console.log(USAGE);
    return;
  }

  const slug = typeof args.slug === "string" ? args.slug : null;
  const category = typeof args.category === "string" ? args.category : null;
  if (!slug || !category) {
    console.error("Error: --slug and --category are both required.\n" + USAGE);
    process.exitCode = 1;
    return;
  }

  const subject = typeof args.subject === "string" ? args.subject : "";
  if (subject.length > 28) {
    console.error(
      `Error: --subject is ${subject.length} characters. Keep it under 28 — the card\n` +
        "prints the real headline under the image, so the cover must not repeat it."
    );
    process.exitCode = 1;
    return;
  }

  const outDir = typeof args.dir === "string" ? args.dir : join(REPO_ROOT, "public/images/covers");
  const outName = typeof args.out === "string" ? args.out : `${slug}-editorial-cover.webp`;
  const outPath = join(outDir, outName);
  const quality = args.quality ? Number(args.quality) : 92;

  const svg = buildSvg({ slug, category, subject });

  if (typeof args.svg === "string") {
    mkdirSync(dirname(args.svg), { recursive: true });
    writeFileSync(args.svg, svg, "utf8");
    console.log(`wrote ${args.svg}`);
  }

  useVendoredFonts();
  const { default: sharp } = await import("sharp");

  mkdirSync(outDir, { recursive: true });
  // Render at 2x, then downsample to the master size. librsvg antialiases well
  // on its own, but supersampling keeps the Playfair serifs and the hairline
  // rules clean at the size a card actually draws them. density 144 is 2x the
  // SVG's 72dpi user unit, so the intermediate is exactly 2400x1800.
  const info = await sharp(Buffer.from(svg), { density: 144 })
    .resize(W, H, { fit: "fill", kernel: "lanczos3" })
    .webp({ quality, effort: 6 })
    .toFile(outPath);

  console.log(
    `wrote ${outPath}  (${info.width}x${info.height}, ${(info.size / 1024).toFixed(1)} KB)`
  );
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
