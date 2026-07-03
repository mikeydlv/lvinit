// ---------------------------------------------------------------------------
// TEMPORARY placeholder image generator for LVINIT.
//
// Produces polished, on-brand SVG "photo-style" assets into /public/images so
// the homepage never shows empty/gray image blocks before real photography is
// shot. Every file is intentionally named after the shot it stands in for —
// swap any file for a real .jpg/.webp of the same name (and update the src in
// the matching component) once you have your own photos.
//
// Run:  node scripts/generate-placeholder-images.mjs
// These are original, generated vector scenes — no third-party/copyrighted art.
// ---------------------------------------------------------------------------

import { writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const OUT = join(dirname(fileURLToPath(import.meta.url)), "..", "public", "images");
mkdirSync(OUT, { recursive: true });

const W = 1600;
const H = 1200;
const HORIZON = 0.62 * H;

// Deterministic PRNG so every regen is byte-identical.
function rng(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

const PALETTES = {
  goldenHour: { sky: ["#37426a", "#8a5f73", "#d98a55"], glow: "#f4a962", sun: "#ffdda6", ridges: ["#c48f68", "#9a6b53", "#5e463c"] },
  dusk:       { sky: ["#26305a", "#574a76", "#b06d88"], glow: "#c77a8f", sun: "#ffd9c2", ridges: ["#7a6c88", "#4f4862", "#2c2838"] },
  morning:    { sky: ["#8aa9c4", "#c6d2cf", "#efe4cd"], glow: "#fff1d4", sun: "#fff6e2", ridges: ["#a6b39a", "#7c8a70", "#55604c"] },
  cityGlow:   { sky: ["#25263a", "#553b50", "#c56f3c"], glow: "#e08a44", sun: "#ffce8f", ridges: ["#3a3346", "#2a2533", "#191521"] },
  cinematic:  { sky: ["#171b2e", "#2f2c48", "#7a4f4a"], glow: "#c76a45", sun: "#f0a86a", ridges: ["#2a2b3d", "#1c1c2a", "#101018"] },
  soft:       { sky: ["#b9b3ab", "#d6cfc4", "#e8e2d6"], glow: "#efe7d8", sun: "#f3ece0", ridges: ["#c3bcae", "#a49c8f", "#837b6f"] },
};

function ridgePath(rand, baseY, amp) {
  const step = 190;
  const pts = [];
  for (let x = -40; x <= W + 40; x += step) {
    const y = baseY - rand() * amp - amp * 0.15;
    pts.push(`${x.toFixed(0)},${y.toFixed(0)}`);
  }
  return `M-40,${H} L${pts.join(" L")} L${W + 40},${H} Z`;
}

function trees(xs, baseY, color) {
  return xs
    .map((x) => {
      const r = 26 + (x % 5) * 3;
      return `<g fill="${color}"><rect x="${x - 3}" y="${baseY - 34}" width="6" height="40"/><circle cx="${x}" cy="${baseY - 40}" r="${r}"/><circle cx="${x - r * 0.6}" cy="${baseY - 30}" r="${r * 0.7}"/><circle cx="${x + r * 0.6}" cy="${baseY - 30}" r="${r * 0.7}"/></g>`;
    })
    .join("");
}

function house(x, baseY, color, warm) {
  // low desert-modern home silhouette with one warm-lit window
  return `<g><rect x="${x}" y="${baseY - 70}" width="230" height="72" fill="${color}"/><rect x="${x + 200}" y="${baseY - 96}" width="120" height="98" fill="${color}"/><rect x="${x + 30}" y="${baseY - 50}" width="34" height="30" fill="${warm}" opacity="0.85"/><rect x="${x + 236}" y="${baseY - 74}" width="30" height="30" fill="${warm}" opacity="0.7"/></g>`;
}

function figure(x, baseY, color) {
  return `<g fill="${color}"><circle cx="${x}" cy="${baseY - 132}" r="26"/><path d="M${x - 34},${baseY} C${x - 34},${baseY - 96} ${x + 34},${baseY - 96} ${x + 34},${baseY} Z"/></g>`;
}

function skyline(rand, baseY, ridges, accent) {
  let x = -20;
  const parts = [];
  while (x < W + 20) {
    const w = 60 + Math.floor(rand() * 90);
    const h = 90 + Math.floor(rand() * 300);
    const top = baseY - h;
    parts.push(`<rect x="${x}" y="${top}" width="${w}" height="${h + 40}" fill="${ridges[2]}"/>`);
    // lit windows
    const cols = Math.max(1, Math.floor(w / 26));
    const rows = Math.floor(h / 34);
    for (let c = 0; c < cols; c++) {
      for (let r = 0; r < rows; r++) {
        if (rand() > 0.72) {
          const wx = x + 8 + c * 26;
          const wy = top + 16 + r * 34;
          const lit = rand() > 0.85 ? accent : "#f4b978";
          parts.push(`<rect x="${wx}" y="${wy}" width="9" height="13" fill="${lit}" opacity="0.85"/>`);
        }
      }
    }
    x += w + 10;
  }
  return parts.join("");
}

function scene({ seed, palette, motif = "desert", sun = [0.5, 0.66, 190], overlays = {} }) {
  const p = PALETTES[palette];
  const rand = rng(seed);
  const [sx, sy, sr] = sun;
  const sunX = sx * W;
  const sunY = sy * H;

  const defs = `
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${p.sky[0]}"/>
      <stop offset="0.55" stop-color="${p.sky[1]}"/>
      <stop offset="1" stop-color="${p.sky[2]}"/>
    </linearGradient>
    <radialGradient id="glow" cx="${(sx * 100).toFixed(1)}%" cy="${(sy * 100).toFixed(1)}%" r="55%">
      <stop offset="0" stop-color="${p.glow}" stop-opacity="0.95"/>
      <stop offset="0.5" stop-color="${p.glow}" stop-opacity="0.35"/>
      <stop offset="1" stop-color="${p.glow}" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="vig" cx="50%" cy="42%" r="78%">
      <stop offset="0.55" stop-color="#0a0a0a" stop-opacity="0"/>
      <stop offset="1" stop-color="#0a0a0a" stop-opacity="0.34"/>
    </radialGradient>
    <filter id="soft"><feGaussianBlur stdDeviation="26"/></filter>
    <filter id="grain"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/></filter>`;

  const layers = [];
  layers.push(`<rect width="${W}" height="${H}" fill="url(#sky)"/>`);
  layers.push(`<rect width="${W}" height="${H}" fill="url(#glow)"/>`);
  // sun
  layers.push(`<circle cx="${sunX}" cy="${sunY}" r="${sr}" fill="${p.sun}" opacity="0.35" filter="url(#soft)"/>`);
  layers.push(`<circle cx="${sunX}" cy="${sunY}" r="${sr * 0.42}" fill="${p.sun}" opacity="0.95"/>`);

  // far + mid ranges (always)
  layers.push(`<path d="${ridgePath(rand, HORIZON - 40, 150)}" fill="${p.ridges[0]}" opacity="0.7"/>`);
  layers.push(`<path d="${ridgePath(rand, HORIZON + 30, 190)}" fill="${p.ridges[1]}" opacity="0.9"/>`);

  if (motif === "water") {
    const wy = HORIZON + 70;
    layers.push(`<rect x="0" y="${wy}" width="${W}" height="${H - wy}" fill="${p.ridges[2]}"/>`);
    layers.push(`<linearGradient id="wg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${p.sky[2]}" stop-opacity="0.5"/><stop offset="1" stop-color="${p.sky[0]}" stop-opacity="0.15"/></linearGradient>`);
    layers.push(`<rect x="0" y="${wy}" width="${W}" height="${H - wy}" fill="url(#wg)"/>`);
    layers.push(`<ellipse cx="${sunX}" cy="${wy + 120}" rx="${sr * 0.5}" ry="150" fill="${p.sun}" opacity="0.3" filter="url(#soft)"/>`);
  } else if (motif === "city") {
    layers.push(skyline(rand, HORIZON + 150, p.ridges, "#2B6CB0"));
  } else {
    // desert foreground ridge + overlays
    const baseY = HORIZON + 120;
    layers.push(`<path d="${ridgePath(rand, baseY, 210)}" fill="${p.ridges[2]}"/>`);
    if (overlays.trail) {
      layers.push(`<path d="M${W * 0.52},${H} Q${W * 0.4},${H * 0.86} ${W * 0.5},${baseY + 30}" stroke="${p.sun}" stroke-width="26" fill="none" opacity="0.28" stroke-linecap="round"/>`);
    }
    if (overlays.trees) layers.push(trees(overlays.trees, baseY + 60, p.ridges[2]));
    if (overlays.house) layers.push(house(W * 0.58, baseY + 40, p.ridges[2], "#f4b978"));
    if (overlays.figure) layers.push(figure(W * 0.5, baseY + 120, p.ridges[2]));
  }

  layers.push(`<rect width="${W}" height="${H}" fill="url(#vig)"/>`);
  layers.push(`<rect width="${W}" height="${H}" fill="#000" opacity="0.06" filter="url(#grain)"/>`);

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" preserveAspectRatio="xMidYMid slice"><defs>${defs}</defs>${layers.join("")}</svg>\n`;
}

const ASSETS = [
  // Hero
  ["hero-las-vegas-lifestyle.svg", { seed: 7, palette: "goldenHour", sun: [0.62, 0.6, 210], overlays: { house: true } }],

  // Neighborhood scenes (used by the Journey panels + the cards, keyed by slug)
  ["neighborhood-summerlin.svg", { seed: 11, palette: "goldenHour", sun: [0.44, 0.62, 190], overlays: { trail: true } }],
  ["neighborhood-henderson.svg", { seed: 23, palette: "morning", sun: [0.6, 0.68, 150], overlays: { trees: [220, 360, 520, 1180, 1340] } }],
  ["neighborhood-downtown-arts-district.svg", { seed: 31, palette: "cityGlow", motif: "city", sun: [0.5, 0.55, 170] }],
  ["neighborhood-green-valley.svg", { seed: 41, palette: "morning", sun: [0.4, 0.66, 160], overlays: { trees: [180, 300, 430, 900, 1050, 1250, 1420] } }],
  ["neighborhood-lake-las-vegas.svg", { seed: 53, palette: "dusk", motif: "water", sun: [0.52, 0.5, 200] }],

  // Breathing photo pauses
  ["breathing-downtown-arts-district.svg", { seed: 61, palette: "cityGlow", motif: "city", sun: [0.62, 0.52, 170] }],
  ["breathing-red-rock-trailhead.svg", { seed: 67, palette: "goldenHour", sun: [0.3, 0.6, 220], overlays: { trail: true } }],

  // Resident-voice quiet backdrop (component also dims this to ~40%)
  ["resident-voice-backdrop.svg", { seed: 73, palette: "soft", sun: [0.5, 0.64, 150] }],

  // Meet your guide — environmental portrait stand-in
  ["meet-your-guide-mikey-portrait.svg", { seed: 79, palette: "goldenHour", sun: [0.68, 0.58, 190], overlays: { figure: true } }],

  // Local guides (keyed by guide slug)
  ["guide-summerlin-vs-henderson.svg", { seed: 83, palette: "goldenHour", sun: [0.5, 0.62, 180], overlays: { trees: [1200, 1340] } }],
  ["guide-cost-of-living-2026.svg", { seed: 89, palette: "morning", sun: [0.55, 0.66, 150] }],
  ["guide-downtown-arts-district-guide.svg", { seed: 97, palette: "cityGlow", motif: "city", sun: [0.42, 0.54, 160] }],
  ["guide-first-summer-in-vegas.svg", { seed: 101, palette: "goldenHour", sun: [0.5, 0.58, 260] }],

  // Video posters (keyed by video id) — cinematic so the play button pops
  ["video-affordability.svg", { seed: 103, palette: "cinematic", sun: [0.6, 0.6, 170] }],
  ["video-heat.svg", { seed: 107, palette: "cinematic", sun: [0.5, 0.56, 260] }],
  ["video-rent-vs-buy.svg", { seed: 109, palette: "cinematic", motif: "city", sun: [0.44, 0.55, 160] }],
  ["video-schools.svg", { seed: 113, palette: "cinematic", sun: [0.56, 0.64, 150], overlays: { trees: [260, 1300] } }],
];

for (const [file, opts] of ASSETS) {
  writeFileSync(join(OUT, file), scene(opts));
}

console.log(`Generated ${ASSETS.length} placeholder images into public/images/`);
