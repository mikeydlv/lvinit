// ---------------------------------------------------------------------------
// SUMMERLIN MAP — label collision check
//
//   node scripts/check-summerlin-map.mjs
//
// Parses the generated SVG and checks three things that make a dense map
// unreadable, all of which are easy to reintroduce by nudging one coordinate:
//
//   1. text vs text   — two labels overlapping
//   2. marker vs text — a village dot sitting inside someone else's label
//   3. clipping       — any label running off the canvas
//
// Exits non-zero on any failure. NOTE: passing this is necessary, not
// sufficient. It measures geometry; it cannot tell you the map reads well.
// Look at the thing in a browser before shipping it.
// ---------------------------------------------------------------------------

import { readFileSync } from "node:fs";

const SVG = "public/images/maps/summerlin-las-vegas-map-lvinit.svg";
const svg = readFileSync(SVG, "utf8");

const viewBox = svg.match(/viewBox="0 0 ([\d.]+) ([\d.]+)"/);
const W = Number(viewBox[1]);
const H = Number(viewBox[2]);

// Inter's average advance width is close to 0.52em across mixed-case text, and
// a little wider for the heavy weights. Deliberately generous — this check
// should complain early rather than pass a map that is actually tight.
const advance = (weight) => (weight >= 700 ? 0.58 : 0.53);

const texts = [];
const TEXT_RE =
  /<text x="([-\d.]+)" y="([-\d.]+)"[^>]*font-size="([\d.]+)" font-weight="(\d+)"[^>]*text-anchor="(\w+)"([^>]*)>([^<]*)<\/text>/g;

let m;
while ((m = TEXT_RE.exec(svg))) {
  const [, xs, ys, size, weight, anchor, rest, raw] = m;
  const text = raw
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&apos;/g, "'");
  const fs = Number(size);
  const rotate = /transform="rotate\((-?[\d.]+)/.exec(rest);
  const spacing = /letter-spacing="([\d.]+)"/.exec(rest);
  const extra = spacing ? Number(spacing[1]) * text.length : 0;
  const w = text.length * fs * advance(Number(weight)) + extra;
  const h = fs * 1.02;

  let x0 = Number(xs);
  const y0 = Number(ys);
  if (anchor === "end") x0 -= w;
  else if (anchor === "middle") x0 -= w / 2;

  // Rotated labels are set bottom-to-top about their anchor point.
  const box = rotate
    ? { x: y0 - h, y: y0, w: h, h: w, x0: Number(xs) - h * 0.8, y0: y0 - w }
    : null;

  texts.push({
    text,
    fs,
    rotated: Boolean(rotate),
    box: box
      ? { x: Number(xs) - h * 0.8, y: y0 - w, w: h, h: w }
      : { x: x0, y: y0 - h * 0.78, w, h },
  });
}

const circles = [];
const CIRCLE_RE = /<circle cx="([-\d.]+)" cy="([-\d.]+)" r="([\d.]+)"/g;
while ((m = CIRCLE_RE.exec(svg))) {
  circles.push({ x: Number(m[1]), y: Number(m[2]), r: Number(m[3]) });
}

const overlap = (a, b) =>
  a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;

const failures = [];

// 1. text vs text
for (let i = 0; i < texts.length; i++) {
  for (let j = i + 1; j < texts.length; j++) {
    const a = texts[i];
    const b = texts[j];
    // The legend and the Red Rock note are deliberately stacked lines; they are
    // set at a fixed leading and never collide with each other.
    if (a.fs <= 13 && b.fs <= 13) continue;
    // The LVI/NIT wordmark is one word set in two colors.
    if ((a.text === "LVI" && b.text === "NIT") || (a.text === "NIT" && b.text === "LVI")) continue;
    if (overlap(a.box, b.box)) {
      const ox =
        Math.min(a.box.x + a.box.w, b.box.x + b.box.w) - Math.max(a.box.x, b.box.x);
      const oy =
        Math.min(a.box.y + a.box.h, b.box.y + b.box.h) - Math.max(a.box.y, b.box.y);
      failures.push(
        `TEXT/TEXT  "${a.text}" x "${b.text}"  overlap ${ox.toFixed(1)} x ${oy.toFixed(1)}px`
      );
    }
  }
}

// 2. marker vs text — a dot printed through someone else's word
for (const c of circles) {
  for (const t of texts) {
    const box = { x: c.x - c.r, y: c.y - c.r, w: c.r * 2, h: c.r * 2 };
    // Every marker sits next to its own label by design; only flag a marker
    // that lands well inside a label rather than beside it.
    if (!overlap(box, t.box)) continue;
    const inset =
      c.x > t.box.x + 4 &&
      c.x < t.box.x + t.box.w - 4 &&
      c.y > t.box.y + 2 &&
      c.y < t.box.y + t.box.h - 2;
    if (inset) failures.push(`MARKER/TEXT  dot at ${c.x},${c.y} sits inside "${t.text}"`);
  }
}

// 3. clipping
for (const t of texts) {
  if (t.box.x < -1 || t.box.y < -1 || t.box.x + t.box.w > W + 1 || t.box.y + t.box.h > H + 1) {
    failures.push(
      `CLIPPED  "${t.text}"  box ${t.box.x.toFixed(1)},${t.box.y.toFixed(1)} ` +
        `${t.box.w.toFixed(1)}x${t.box.h.toFixed(1)} vs canvas ${W}x${H}`
    );
  }
}

console.log(`${SVG}  ${W} x ${H}`);
console.log(`${texts.length} labels, ${circles.length} markers`);

if (failures.length) {
  console.error(`\n${failures.length} problem(s):`);
  for (const f of failures) console.error("  " + f);
  process.exit(1);
}
console.log("\nno collisions, no clipping.");
