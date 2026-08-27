// ---------------------------------------------------------------------------
// HENDERSON MAP — geometry and label checks
//
//   node scripts/check-henderson-map.mjs
//
// Six checks. The first three are the same readability checks the Summerlin map
// runs (scripts/check-summerlin-map.mjs) and catch the things that are easy to
// reintroduce by nudging one coordinate. The last three are Henderson's own,
// and they check something more important than readability: whether the map is
// telling the truth.
//
//   1. text vs text     — two labels overlapping
//   2. marker vs text   — a community dot sitting inside someone else's label
//   3. clipping         — any label running off the canvas
//   4. markers in city  — every plotted community is inside the OFFICIAL City of
//                         Henderson boundary, by point-in-polygon against the
//                         city's own GIS polygon, holes included
//   5. label on road    — every road label sits within a short distance of the
//                         road it names, measured against that road's real
//                         geometry after dx/dy nudging
//   6. binned roads     — a road reduced by median-binning still tracks its own
//                         axis. A binned loop draws a zigzag through the middle
//                         of the loop, which is not a road; the tell is a path
//                         much longer than its own bounding-box diagonal.
//
// Exits non-zero on any failure. NOTE: passing this is necessary, not
// sufficient. It measures geometry; it cannot tell you the map reads well.
// Look at the thing in a browser before shipping it.
// ---------------------------------------------------------------------------

import { readFileSync } from "node:fs";
import {
  COMMUNITIES,
  ROAD_LABELS,
  BOUNDS,
  PX_PER_KM,
  OUT as SVG_PATH,
} from "./generate-henderson-map.mjs";
import { createProjection } from "./lib/area-map.mjs";

const svg = readFileSync(SVG_PATH, "utf8");
const GEO = JSON.parse(
  readFileSync(new URL("./data/henderson-map-geometry.json", import.meta.url), "utf8")
);

const viewBox = svg.match(/viewBox="0 0 ([\d.]+) ([\d.]+)"/);
const W = Number(viewBox[1]);
const H = Number(viewBox[2]);

const { x, y } = createProjection(BOUNDS, PX_PER_KM);

const failures = [];

// --- parse the drawn labels and markers -------------------------------------

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

  texts.push({
    text,
    fs,
    rotated: Boolean(rotate),
    // Rotated labels are set bottom-to-top about their anchor point.
    box: rotate
      ? { x: Number(xs) - h * 0.8, y: y0 - w, w: h, h: w }
      : { x: x0, y: y0 - h * 0.78, w, h },
  });
}

const circles = [];
const CIRCLE_RE = /<circle cx="([-\d.]+)" cy="([-\d.]+)" r="([\d.]+)"/g;
while ((m = CIRCLE_RE.exec(svg))) {
  circles.push({ x: Number(m[1]), y: Number(m[2]), r: Number(m[3]) });
}

// The Water Street district marker is a rect, not a circle, so it needs picking
// up separately or check 2 would silently skip it.
const MARKER_RECT_RE = /<rect x="([-\d.]+)" y="([-\d.]+)" width="11" height="11"/g;
while ((m = MARKER_RECT_RE.exec(svg))) {
  circles.push({ x: Number(m[1]) + 5.5, y: Number(m[2]) + 5.5, r: 5.5 });
}

const overlap = (a, b) =>
  a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;

// --- 1. text vs text --------------------------------------------------------

for (let i = 0; i < texts.length; i++) {
  for (let j = i + 1; j < texts.length; j++) {
    const a = texts[i];
    const b = texts[j];
    // The legend and the Sloan Canyon / West Henderson notes are deliberately
    // stacked lines set at a fixed leading; they never collide with each other.
    if (a.fs <= 12 && b.fs <= 12) continue;
    // The LVI/NIT wordmark is one word set in two colors.
    if ((a.text === "LVI" && b.text === "NIT") || (a.text === "NIT" && b.text === "LVI")) continue;
    if (overlap(a.box, b.box)) {
      const ox = Math.min(a.box.x + a.box.w, b.box.x + b.box.w) - Math.max(a.box.x, b.box.x);
      const oy = Math.min(a.box.y + a.box.h, b.box.y + b.box.h) - Math.max(a.box.y, b.box.y);
      failures.push(
        `TEXT/TEXT  "${a.text}" x "${b.text}"  overlap ${ox.toFixed(1)} x ${oy.toFixed(1)}px`
      );
    }
  }
}

// --- 2. marker vs text ------------------------------------------------------

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
    if (inset) failures.push(`MARKER/TEXT  marker at ${c.x},${c.y} sits inside "${t.text}"`);
  }
}

// --- 3. clipping ------------------------------------------------------------

for (const t of texts) {
  if (t.box.x < -1 || t.box.y < -1 || t.box.x + t.box.w > W + 1 || t.box.y + t.box.h > H + 1) {
    failures.push(
      `CLIPPED  "${t.text}"  box ${t.box.x.toFixed(1)},${t.box.y.toFixed(1)} ` +
        `${t.box.w.toFixed(1)}x${t.box.h.toFixed(1)} vs canvas ${W}x${H}`
    );
  }
}

// --- 4. every community marker is inside the official city boundary ---------
//
// This is the check that matters most. The whole argument of the Henderson
// guide is that the city has a real, defensible boundary and that the places
// people name sit at real positions inside it. A marker outside the line would
// make the map assert something false about which city a community is in.

const rings = GEO.city.rings;

function inRing(pt, ring) {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const xi = ring[i][0];
    const yi = ring[i][1];
    const xj = ring[j][0];
    const yj = ring[j][1];
    if (yi > pt[1] !== yj > pt[1] && pt[0] < ((xj - xi) * (pt[1] - yi)) / (yj - yi) + xi) {
      inside = !inside;
    }
  }
  return inside;
}

// Ring 0 is the city; every later ring is an unincorporated county pocket, so a
// point inside one of those is NOT in the city.
function inCity(pt) {
  if (!inRing(pt, rings[0])) return false;
  for (let k = 1; k < rings.length; k++) if (inRing(pt, rings[k])) return false;
  return true;
}

for (const c of COMMUNITIES) {
  if (!inCity([c.lon, c.lat])) {
    failures.push(
      `OUTSIDE CITY  "${c.name}" at ${c.lat},${c.lon} is not inside the official ` +
        `City of Henderson boundary`
    );
  }
  if (
    c.lon < BOUNDS.west ||
    c.lon > BOUNDS.east ||
    c.lat < BOUNDS.south ||
    c.lat > BOUNDS.north
  ) {
    failures.push(`OUTSIDE FRAME  "${c.name}" at ${c.lat},${c.lon} falls outside the map bounds`);
  }
}

// --- 5. every road label sits on the road it names --------------------------
//
// anchorOnRoad() guarantees the ANCHOR is on the road. This checks that the
// dx/dy nudge afterwards didn't walk the label onto a different road, which is
// exactly how "Far Hills Ave" ended up on Summerlin Parkway in an early draft
// of that map.

const MAX_LABEL_OFFSET_PX = 46;

function distToPolylinePx(px, py, path) {
  let best = Infinity;
  for (let i = 1; i < path.length; i++) {
    const ax = x(path[i - 1][0]);
    const ay = y(path[i - 1][1]);
    const bx = x(path[i][0]);
    const by = y(path[i][1]);
    const dx = bx - ax;
    const dy = by - ay;
    const len2 = dx * dx + dy * dy;
    const t = len2 === 0 ? 0 : Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / len2));
    best = Math.min(best, Math.hypot(px - (ax + t * dx), py - (ay + t * dy)));
  }
  return best;
}

for (const r of ROAD_LABELS) {
  const road = GEO.roads.find((rd) => rd.id === r.road);
  if (!road) {
    failures.push(`NO SUCH ROAD  label "${r.text}" names road id "${r.road}", which is not in the geometry`);
    continue;
  }
  // Re-derive the anchor the generator used, then apply the same nudge.
  const i = r.along === "lat" ? 1 : 0;
  let anchor = null;
  for (const path of road.paths) {
    for (let k = 1; k < path.length && !anchor; k++) {
      const a = path[k - 1];
      const b = path[k];
      if (r.at >= Math.min(a[i], b[i]) && r.at <= Math.max(a[i], b[i])) {
        const span = b[i] - a[i];
        const t = span === 0 ? 0 : (r.at - a[i]) / span;
        anchor = { lon: a[0] + (b[0] - a[0]) * t, lat: a[1] + (b[1] - a[1]) * t };
      }
    }
    if (anchor) break;
  }
  if (!anchor) {
    failures.push(`NO ANCHOR  label "${r.text}" — road ${r.road} does not cross ${r.along} ${r.at}`);
    continue;
  }

  const px = x(anchor.lon) + (r.dx ?? 0);
  const py = y(anchor.lat) + (r.dy ?? 0);
  const d = Math.min(...road.paths.map((p) => distToPolylinePx(px, py, p)));
  if (d > MAX_LABEL_OFFSET_PX) {
    failures.push(
      `LABEL OFF ROAD  "${r.text}" sits ${d.toFixed(1)}px from ${r.road} ` +
        `(limit ${MAX_LABEL_OFFSET_PX}px)`
    );
  }

  // And check it isn't sitting closer to some OTHER road than to its own.
  for (const other of GEO.roads) {
    if (other.id === r.road) continue;
    const od = Math.min(...other.paths.map((p) => distToPolylinePx(px, py, p)));
    if (od < d - 4) {
      failures.push(
        `LABEL ON WRONG ROAD  "${r.text}" is ${od.toFixed(1)}px from ${other.id} ` +
          `but ${d.toFixed(1)}px from its own road ${r.road}`
      );
    }
  }
}

// --- 6. binned roads still track their own axis -----------------------------

const KM_LON = 90.1;
const KM_LAT = 111.0;
const MAX_BIN_RATIO = 1.6;

for (const road of GEO.roads) {
  if (road.reduce !== "bin") continue;
  road.paths.forEach((p, i) => {
    let km = 0;
    let lo = [Infinity, Infinity];
    let hi = [-Infinity, -Infinity];
    for (let k = 0; k < p.length; k++) {
      if (k > 0) {
        km += Math.hypot((p[k][0] - p[k - 1][0]) * KM_LON, (p[k][1] - p[k - 1][1]) * KM_LAT);
      }
      lo[0] = Math.min(lo[0], p[k][0]);
      lo[1] = Math.min(lo[1], p[k][1]);
      hi[0] = Math.max(hi[0], p[k][0]);
      hi[1] = Math.max(hi[1], p[k][1]);
    }
    const diag = Math.hypot((hi[0] - lo[0]) * KM_LON, (hi[1] - lo[1]) * KM_LAT);
    const ratio = km / diag;
    if (ratio > MAX_BIN_RATIO) {
      failures.push(
        `BINNED ZIGZAG  ${road.id} path ${i} is ${km.toFixed(1)}km along a ` +
          `${diag.toFixed(1)}km diagonal (ratio ${ratio.toFixed(2)}, limit ${MAX_BIN_RATIO}). ` +
          `It is probably a loop or a curve and should be reduce:"chain".`
      );
    }
  });
}

// --- report -----------------------------------------------------------------

console.log(`${SVG_PATH}  ${W} x ${H}`);
console.log(
  `${texts.length} labels, ${circles.length} markers, ${COMMUNITIES.length} communities, ` +
    `${ROAD_LABELS.length} road labels, ${GEO.roads.length} roads`
);
console.log(
  `city boundary: ${rings.length} ring(s) — 1 outer + ${rings.length - 1} unincorporated pockets, ` +
    `${GEO.city.sqMiles} sq mi per the City of Henderson`
);

if (failures.length) {
  console.error(`\n${failures.length} problem(s):`);
  for (const f of failures) console.error("  " + f);
  process.exit(1);
}
console.log("\nno collisions, no clipping, every community inside the city line.");
