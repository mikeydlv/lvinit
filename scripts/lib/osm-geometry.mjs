// ---------------------------------------------------------------------------
// OSM GEOMETRY — fetch and reduce
//
// The parts every area-map GEOMETRY PREP script needs: an Overpass client with
// endpoint fallback, and the two different reductions that turn raw OSM ways
// into something a map can draw.
//
// This is the prep-time companion to scripts/lib/area-map.mjs, which owns
// draw-time mechanics (projection, palette, labels, SVG document). Nothing here
// runs during `next build` — prep scripts fetch, reduce, and commit their output
// to scripts/data/, and the generators read only from those committed files.
//
// WHY TWO REDUCTIONS, because they solve two different problems:
//
//  ARTERIALS are divided roads on a strict grid, so OSM carries them as two
//  parallel carriageways plus dozens of short service stubs sharing the name.
//  Chaining those produces doubled-back spaghetti. Instead `centerline()` bins
//  every point along the road's dominant axis and takes the median of the cross
//  axis, which collapses both carriageways into one honest centerline and drops
//  the stubs.
//
//  FREEWAYS curve and turn corners, so axis-binning would cut the corner. For
//  those we `chain()` the fragments and keep the single longest carriageway,
//  which is a real centerline of a real roadway rather than an average of two.
//
// PROVENANCE: everything fetched through here is OpenStreetMap data, which is
// licensed ODbL. Whatever you write out must carry the attribution, and the
// attribution must survive onto the rendered map. It is a license condition,
// not a courtesy.
//
// HISTORY: these routines were first written inline in
// scripts/prep-summerlin-map-geometry.mjs and were lifted here verbatim when
// the Henderson map needed the same behaviour. That script is deliberately left
// untouched: its output (scripts/data/summerlin-map-geometry.json) is committed
// and shipped, and not editing the script that produced it is the cheapest way
// to guarantee the shipped Summerlin map stays byte-identical. Point it at this
// module the next time its geometry is legitimately re-fetched.
// ---------------------------------------------------------------------------

export const KM_LON = 90.1; // 111.32 * cos(36 N)
export const KM_LAT = 111.0;

const LON_SCALE = Math.cos((36 * Math.PI) / 180);

// --- Overpass ---------------------------------------------------------------

const ENDPOINTS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.osm.ch/api/interpreter",
  "https://overpass.private.coffee/api/interpreter",
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * POST an Overpass QL query, trying each mirror in turn and retrying the whole
 * rotation with backoff.
 *
 * Two things make this fiddlier than it looks. Overpass answers a rate limit or
 * a timeout with an HTML error page rather than an HTTP error, so the response
 * is sniffed for JSON before parsing. And the mirrors do NOT agree with each
 * other: a mirror running behind, or with a narrower extract, can answer 200
 * with an empty element list for a feature that plainly exists. That is why
 * callers should assert on what they expected to get back, and why it is worth
 * waiting for the main endpoint rather than accepting the first 200 that
 * arrives. Prefer ONE combined query over several small ones — every extra
 * round trip is another chance to be rate limited mid-run.
 */
export async function overpass(query, { attempts = 3, backoffMs = 20000 } = {}) {
  let lastError = "no endpoint tried";
  for (let attempt = 0; attempt < attempts; attempt++) {
    if (attempt > 0) {
      const wait = backoffMs * attempt;
      console.error(`  all mirrors failed, waiting ${wait / 1000}s before retry ${attempt + 1}`);
      await sleep(wait);
    }
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
        if (!text.trimStart().startsWith("{")) {
          lastError =
            endpoint + " -> HTTP " + res.status + ": " + text.slice(0, 120).replace(/\s+/g, " ");
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
  }
  throw new Error("every Overpass endpoint failed. Last: " + lastError);
}

// --- generic line helpers ---------------------------------------------------

const key = (p) => `${p[0].toFixed(7)},${p[1].toFixed(7)}`;

/** Join way fragments that share an endpoint into continuous lines. */
export function chain(ways) {
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

/** Build an inside-the-clip-box test for a {west,east,south,north} box. */
export function makeInside(box) {
  return (p) =>
    p[0] >= box.west && p[0] <= box.east && p[1] >= box.south && p[1] <= box.north;
}

/**
 * Split a line into the runs that fall inside the box, keeping one point past
 * each edge so the drawn line runs off-canvas cleanly rather than stopping
 * short of it.
 */
export function clip(line, inside) {
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

/** Ramer-Douglas-Peucker, in degrees, with longitude scaled for latitude 36 N. */
export function simplify(line, tol) {
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
  return simplify(line.slice(0, idx + 1), tol)
    .slice(0, -1)
    .concat(simplify(line.slice(idx), tol));
}

export const round5 = (line) => line.map(([lon, lat]) => [+lon.toFixed(5), +lat.toFixed(5)]);

export function lengthKm(line) {
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
 * the dominant axis, take the median of the cross axis, and break where a run
 * of bins is empty (a real gap in the road, not a gap in the data).
 */
export function centerline(points, binKm = 0.12) {
  const lons = points.map((p) => p[0]);
  const lats = points.map((p) => p[1]);
  const spanX = (Math.max(...lons) - Math.min(...lons)) * KM_LON;
  const spanY = (Math.max(...lats) - Math.min(...lats)) * KM_LAT;
  const horizontal = spanX >= spanY;

  const binDeg = horizontal ? binKm / KM_LON : binKm / KM_LAT;
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

/**
 * Reduce a bag of OSM ways for one named road into drawable paths.
 *
 * `method` picks the reduction, and picking the wrong one is visible:
 *
 *   "chain" — join fragments end to end and keep the distinct carriageways.
 *     Correct for freeways and for any road that CURVES or LOOPS. Median
 *     binning a loop road averages the two sides of the loop together and
 *     produces a zigzag through the middle of it, which is not a road.
 *
 *   "bin" — median-bin both carriageways into one centerline. Correct only for
 *     roads that run straight along one axis, which in this valley means the
 *     one-mile arterial grid.
 *
 * The cheap tell for a mis-chosen method: divide the reduced path's length by
 * its bounding-box diagonal. A straight road lands near 1.0; a binned loop
 * lands well above 2. scripts/check-henderson-map.mjs enforces that ratio.
 */
export function reduceRoad(
  ways,
  method,
  { inside, tol = 0.00022, minKm = 0.4, minChainKm = 1.5 }
) {
  if (method === "chain") {
    let paths = [];
    for (const line of chain(ways)) {
      for (const run of clip(line, inside)) paths.push(round5(simplify(run, tol)));
    }
    paths.sort((a, b) => lengthKm(b) - lengthKm(a));
    // One carriageway is the road. Keep the longest, plus anything that is not
    // simply a shadow of it (checked by sampling against the kept lines).
    const kept = [];
    const near = (pt, line) =>
      line.some((q) => Math.hypot((q[0] - pt[0]) * KM_LON, (q[1] - pt[1]) * KM_LAT) < 0.25);
    for (const p of paths) {
      if (lengthKm(p) < minChainKm) continue;
      const covered = p.filter((pt) => kept.some((k) => near(pt, k))).length / p.length;
      if (covered < 0.75) kept.push(p);
    }
    return kept;
  }

  const pts = ways.flat().filter(inside);
  if (!pts.length) return [];
  return centerline(pts)
    .map((r) => round5(simplify(r, tol)))
    .filter((r) => r.length > 1 && lengthKm(r) > minKm);
}
