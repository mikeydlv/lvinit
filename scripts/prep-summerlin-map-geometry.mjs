// SUMMERLIN MAP GEOMETRY — fetch and reduce.
//
//   node scripts/prep-summerlin-map-geometry.mjs
//   -> scripts/data/summerlin-map-geometry.json   (commit the result)
//
// Pulls road centerlines and the Red Rock Canyon National Conservation Area
// boundary from OpenStreetMap via Overpass, reduces them, and writes the
// compact file scripts/generate-summerlin-map.mjs reads. The output is
// committed so the map builds without network access; re-run this only when the
// underlying geography actually changes.
//
// LICENSE: the output is derived from OpenStreetMap and carries an ODbL
// attribution field. That attribution is rendered onto the map and repeated in
// the page sources. It is a license condition. Do not strip it.
//
// Two different reductions, because two different problems:
//
//  ARTERIALS are divided roads on a strict grid, so OSM carries them as two
//  parallel carriageways plus dozens of short service stubs sharing the name.
//  Chaining those produces doubled-back spaghetti. Instead we bin every point
//  along the road's dominant axis and average the cross-axis coordinate, which
//  collapses both carriageways into one honest centerline and drops the stubs.
//
//  FREEWAYS curve and turn corners, so axis-binning would cut the corner. For
//  those we chain the fragments and keep the single longest carriageway, which
//  is a real centerline of a real roadway rather than an average of two.
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";

// A little wider than the map's own bounds so clipped lines run off-canvas
// cleanly rather than stopping short of the edge.
const CLIP = { west: -115.47, east: -115.225, south: 36.045, north: 36.255 };

const KEEP = {
  "Bruce Woodbury Beltway": { id: "cc215", label: "CC-215", cls: "freeway" },
  "Summerlin Parkway": { id: "summerlin-pkwy", label: "Summerlin Parkway", cls: "freeway" },
  "Purple Heart Highway": { id: "us95", label: "US-95", cls: "freeway" },
  "West Charleston Boulevard": { id: "charleston", label: "W Charleston Blvd", cls: "arterial" },
  "Blue Diamond Road": { id: "sr159", label: "SR-159", cls: "arterial" },
  "West Sahara Avenue": { id: "sahara", label: "W Sahara Ave", cls: "arterial" },
  "Far Hills Avenue": { id: "far-hills", label: "Far Hills Ave", cls: "arterial" },
  "West Lake Mead Boulevard": { id: "lake-mead", label: "W Lake Mead Blvd", cls: "arterial" },
  "West Cheyenne Avenue": { id: "cheyenne", label: "W Cheyenne Ave", cls: "arterial" },
  "Alta Drive": { id: "alta", label: "Alta Dr", cls: "arterial" },
  "West Flamingo Road": { id: "flamingo", label: "W Flamingo Rd", cls: "arterial" },
  "West Russell Road": { id: "russell", label: "W Russell Rd", cls: "arterial" },
  "West Sky Vista Drive": { id: "sky-vista", label: "Sky Vista Dr", cls: "arterial" },
  "North Town Center Drive": { id: "town-center", label: "Town Center Dr", cls: "arterial" },
  "South Town Center Drive": { id: "town-center", label: "Town Center Dr", cls: "arterial" },
  "North Rampart Boulevard": { id: "rampart", label: "Rampart Blvd", cls: "arterial" },
  "South Rampart Boulevard": { id: "rampart", label: "Rampart Blvd", cls: "arterial" },
  "North Hualapai Way": { id: "hualapai", label: "Hualapai Way", cls: "arterial" },
  "South Hualapai Way": { id: "hualapai", label: "Hualapai Way", cls: "arterial" },
  "North Desert Foothills Drive": { id: "foothills", label: "Desert Foothills Dr", cls: "arterial" },
  "South Desert Foothills Drive": { id: "foothills", label: "Desert Foothills Dr", cls: "arterial" },
  "North Buffalo Drive": { id: "buffalo", label: "Buffalo Dr", cls: "arterial" },
  "South Buffalo Drive": { id: "buffalo", label: "Buffalo Dr", cls: "arterial" },
  "North Durango Drive": { id: "durango", label: "Durango Dr", cls: "arterial" },
  "South Durango Drive": { id: "durango", label: "Durango Dr", cls: "arterial" },
};

const KM_LON = 90.1; // 111.32 * cos(36 N)
const KM_LAT = 111.0;

// --- generic helpers -------------------------------------------------------

const key = (p) => `${p[0].toFixed(7)},${p[1].toFixed(7)}`;

function chain(ways) {
  const pool = ways.map((w) => w.slice());
  const out = [];
  while (pool.length) {
    let line = pool.shift();
    let grew = true;
    while (grew) {
      grew = false;
      for (let i = 0; i < pool.length; i++) {
        const w = pool[i];
        const a = key(line[0]);
        const b = key(line[line.length - 1]);
        const c = key(w[0]);
        const d = key(w[w.length - 1]);
        if (b === c) line = line.concat(w.slice(1));
        else if (b === d) line = line.concat(w.slice(0, -1).reverse());
        else if (a === d) line = w.slice(0, -1).concat(line);
        else if (a === c) line = w.slice(1).reverse().concat(line);
        else continue;
        pool.splice(i, 1);
        grew = true;
        break;
      }
    }
    out.push(line);
  }
  return out;
}

const inside = (p) =>
  p[0] >= CLIP.west && p[0] <= CLIP.east && p[1] >= CLIP.south && p[1] <= CLIP.north;

function clip(line) {
  const runs = [];
  let cur = [];
  for (let i = 0; i < line.length; i++) {
    if (inside(line[i])) {
      if (!cur.length && i > 0) cur.push(line[i - 1]);
      cur.push(line[i]);
    } else if (cur.length) {
      cur.push(line[i]);
      runs.push(cur);
      cur = [];
    }
  }
  if (cur.length) runs.push(cur);
  return runs.filter((r) => r.length > 1);
}

const LON_SCALE = Math.cos((36 * Math.PI) / 180);
function perp(p, a, b) {
  const px = (p[0] - a[0]) * LON_SCALE;
  const py = p[1] - a[1];
  const bx = (b[0] - a[0]) * LON_SCALE;
  const by = b[1] - a[1];
  const len2 = bx * bx + by * by;
  if (len2 === 0) return Math.hypot(px, py);
  const t = Math.max(0, Math.min(1, (px * bx + py * by) / len2));
  return Math.hypot(px - t * bx, py - t * by);
}
function simplify(line, tol) {
  if (line.length < 3) return line;
  let maxD = 0;
  let idx = 0;
  for (let i = 1; i < line.length - 1; i++) {
    const d = perp(line[i], line[0], line[line.length - 1]);
    if (d > maxD) {
      maxD = d;
      idx = i;
    }
  }
  if (maxD <= tol) return [line[0], line[line.length - 1]];
  return simplify(line.slice(0, idx + 1), tol).slice(0, -1).concat(simplify(line.slice(idx), tol));
}

const TOL = 0.00022; // ~24 m
const round = (line) => line.map(([lon, lat]) => [+lon.toFixed(5), +lat.toFixed(5)]);

function lengthKm(line) {
  let km = 0;
  for (let i = 1; i < line.length; i++) {
    km += Math.hypot(
      (line[i][0] - line[i - 1][0]) * KM_LON,
      (line[i][1] - line[i - 1][1]) * KM_LAT
    );
  }
  return km;
}

/**
 * Collapse every point of a divided grid road into one centerline: bin along
 * the dominant axis, average the cross axis, break where a run of bins is
 * empty (a real gap in the road, not a gap in the data).
 */
function centerline(points) {
  const lons = points.map((p) => p[0]);
  const lats = points.map((p) => p[1]);
  const spanX = (Math.max(...lons) - Math.min(...lons)) * KM_LON;
  const spanY = (Math.max(...lats) - Math.min(...lats)) * KM_LAT;
  const horizontal = spanX >= spanY;

  const BIN_KM = 0.12;
  const binDeg = horizontal ? BIN_KM / KM_LON : BIN_KM / KM_LAT;
  const along = (p) => (horizontal ? p[0] : p[1]);
  const across = (p) => (horizontal ? p[1] : p[0]);

  const bins = new Map();
  for (const p of points) {
    const b = Math.round(along(p) / binDeg);
    if (!bins.has(b)) bins.set(b, []);
    bins.get(b).push(across(p));
  }

  const keys = [...bins.keys()].sort((a, b) => a - b);
  const runs = [];
  let cur = [];
  for (let i = 0; i < keys.length; i++) {
    if (i > 0 && keys[i] - keys[i - 1] > 3) {
      if (cur.length > 1) runs.push(cur);
      cur = [];
    }
    const vals = bins.get(keys[i]).slice().sort((a, b) => a - b);
    // Median, not mean: a stray service road shouldn't drag the centerline.
    const mid = vals[Math.floor(vals.length / 2)];
    cur.push(horizontal ? [keys[i] * binDeg, mid] : [mid, keys[i] * binDeg]);
  }
  if (cur.length > 1) runs.push(cur);
  return runs;
}

// --- fetch ------------------------------------------------------------------

const ENDPOINTS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.osm.ch/api/interpreter",
  "https://overpass.private.coffee/api/interpreter",
];

async function overpass(query) {
  let lastError = "no endpoint tried";
  for (const endpoint of ENDPOINTS) {
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "User-Agent": "LVINIT-map-build/1.0 (https://www.lvinit.com)",
        },
        body: "data=" + encodeURIComponent(query),
        signal: AbortSignal.timeout(180000),
      });
      const text = await res.text();
      // Overpass answers a rate limit or a timeout with an HTML error page.
      if (!text.trimStart().startsWith("{")) {
        lastError = endpoint + " -> HTTP " + res.status + ": " + text.slice(0, 120).replace(/s+/g, " ");
        console.error("  " + lastError);
        continue;
      }
      console.error("  ok via " + endpoint);
      return JSON.parse(text);
    } catch (e) {
      lastError = endpoint + " -> " + e.message;
      console.error("  " + lastError);
    }
  }
  throw new Error("every Overpass endpoint failed. Last: " + lastError);
}

const BBOX = "36.04,-115.46,36.26,-115.24";
// Every road name is a plain street name, but escape anyway rather than trust
// that — an unescaped "." in a future entry would silently widen the match.
const nameFilter = Object.keys(KEEP)
  .map((n) => n.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
  .join("|");

console.error("fetching roads...");
const raw = await overpass(`
[out:json][timeout:180];
way["highway"]["name"~"^(${nameFilter})$"](${BBOX});
out geom tags;
`);

console.error("fetching Red Rock Canyon NCA boundary...");
const ncaRaw = await overpass(`
[out:json][timeout:180];
rel["boundary"="protected_area"]["name"="Red Rock Canyon National Conservation Area"];
way(r);
out geom;
`);

// --- roads -----------------------------------------------------------------

const byId = new Map();
for (const el of raw.elements) {
  if (el.type !== "way" || !el.geometry) continue;
  const meta = KEEP[el.tags?.name];
  if (!meta) continue;
  if (!byId.has(meta.id)) byId.set(meta.id, { meta, ways: [], names: new Set() });
  const bucket = byId.get(meta.id);
  bucket.ways.push(el.geometry.map((g) => [g.lon, g.lat]));
  bucket.names.add(el.tags.name);
}

const roads = [];
for (const [id, { meta, ways, names }] of byId) {
  let paths = [];

  if (meta.cls === "freeway") {
    for (const line of chain(ways)) {
      for (const run of clip(line)) paths.push(round(simplify(run, TOL)));
    }
    paths.sort((a, b) => lengthKm(b) - lengthKm(a));
    // One carriageway is the road. Keep the longest, plus anything that is not
    // simply a shadow of it (checked by sampling against the kept lines).
    const kept = [];
    const near = (pt, line) =>
      line.some(
        (q) => Math.hypot((q[0] - pt[0]) * KM_LON, (q[1] - pt[1]) * KM_LAT) < 0.25
      );
    for (const p of paths) {
      if (lengthKm(p) < 1.5) continue;
      const covered =
        p.filter((pt) => kept.some((k) => near(pt, k))).length / p.length;
      if (covered < 0.75) kept.push(p);
    }
    paths = kept;
  } else {
    const pts = ways.flat().filter(inside);
    if (!pts.length) continue;
    paths = centerline(pts)
      .map((r) => round(simplify(r, TOL)))
      .filter((r) => r.length > 1 && lengthKm(r) > 0.4);
  }

  if (!paths.length) continue;
  roads.push({
    id,
    label: meta.label,
    cls: meta.cls,
    osmNames: [...names].sort(),
    paths,
  });
}
roads.sort((a, b) => a.id.localeCompare(b.id));

// --- Red Rock Canyon NCA boundary ------------------------------------------

const nca = [];
for (const line of chain(ncaRaw.elements.filter((e) => e.geometry).map((e) => e.geometry.map((g) => [g.lon, g.lat])))) {
  for (const run of clip(line)) {
    const s = round(simplify(run, TOL));
    if (s.length > 1 && lengthKm(s) > 0.3) nca.push(s);
  }
}
nca.sort((a, b) => lengthKm(b) - lengthKm(a));

// --- write -----------------------------------------------------------------

const payload = {
  _comment:
    "Road centerlines and the Red Rock Canyon National Conservation Area boundary for the LVINIT " +
    "Summerlin map. Derived from OpenStreetMap, retrieved 2026-08-20, clipped to the map frame and " +
    "simplified to about 24 m. Arterials are median-binned centerlines of both carriageways; " +
    "freeways are a single carriageway. Accurate enough to orient by, not survey geometry.",
  attribution:
    "\u00A9 OpenStreetMap contributors, ODbL 1.0 \u2014 https://www.openstreetmap.org/copyright",
  retrieved: "2026-08-20",
  clip: CLIP,
  roads,
  redRockNca: nca,
};

const OUT = "scripts/data/summerlin-map-geometry.json";
mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, JSON.stringify(payload, null, 0) + "\n", "utf8");

let pts = 0;
for (const r of roads) {
  for (const p of r.paths) pts += p.length;
  console.log(
    `  ${r.id.padEnd(15)} ${r.cls.padEnd(9)} ` +
      r.paths.map((p) => `${p.length}pt/${lengthKm(p).toFixed(1)}km`).join("  ")
  );
}
console.log(`\nroads: ${roads.length}, ${pts} points`);
console.log(`redRockNca: ${nca.length} path(s), ${nca.reduce((a, p) => a + p.length, 0)} points`);
console.log("wrote " + OUT);
