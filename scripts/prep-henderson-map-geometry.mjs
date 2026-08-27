// HENDERSON MAP GEOMETRY — fetch and reduce.
//
//   node scripts/prep-henderson-map-geometry.mjs
//   -> scripts/data/henderson-map-geometry.json   (commit the result)
//
// Pulls the three things the Henderson map is built from, reduces them, and
// writes the compact file scripts/generate-henderson-map.mjs reads. The output
// is committed so the map — and therefore `next build` — needs no network
// access. Re-run this only when the underlying geography actually changes.
//
// ---------------------------------------------------------------------------
// 1. THE CITY BOUNDARY — the whole reason this map exists
// ---------------------------------------------------------------------------
// Henderson is an incorporated city, so unlike Summerlin it HAS a real, public,
// governmental boundary, and there is no excuse for approximating one. This
// script takes it from the City of Henderson's own ArcGIS Server:
//
//   https://maps.cityofhenderson.com/arcgis/rest/services/public/
//     OpenDataAdministrativeBoundaries/MapServer/1   ("City Boundary")
//
// That is the city's own GIS infrastructure, published through its open-data
// portal at gis-hendersonnv.opendata.arcgis.com. The layer is requested in
// WGS84 (outSR=4326) and carries the city's own ACRES / SQMILES attributes,
// which are written into the output for provenance.
//
// A second, slightly older copy of the same layer is hosted on Esri's cloud at
// services2.arcgis.com/naGsY5NZWVbd6bwD/.../CITY_LIMITS/FeatureServer/0. It was
// last edited 2023-07-05 and measures ~77,800 acres against the city server's
// ~78,056. We take the city's own server as authoritative.
//
// WHAT WE DO NOT SUBSTITUTE, ever: ZIP-code boundaries, MLS areas, Google Maps
// neighborhood shading, a hand-drawn polygon, or a generic southeast-valley
// blob. If the official line makes an awkward shape, that is the shape.
//
// THE HOLES ARE REAL. The polygon comes back as one outer ring plus 22 interior
// rings — unincorporated Clark County pockets that the city has grown around
// but not annexed. Every one of them is kept. Most are far too small to see at
// this scale and simply won't render; none is removed, because removing them
// would quietly redraw the city's border.
//
// ---------------------------------------------------------------------------
// 2. ROADS — OpenStreetMap
// ---------------------------------------------------------------------------
// Real centerlines, reduced by scripts/lib/osm-geometry.mjs. Road NAMES were
// checked against OSM's own `ref` tags rather than assumed:
//   · the freeway through Henderson is tagged I 11;US 93;US 95 — I-515 was
//     decommissioned when I-11 was extended through the valley in May 2024
//   · the beltway east of I-15 is tagged I 215 (not CC-215, which is the
//     county-maintained designation on the western leg)
//   · St. Rose Pkwy is SR 146, Boulder Hwy is SR 582, Lake Mead Pkwy is SR 564
//
// ---------------------------------------------------------------------------
// 3. SLOAN CANYON NCA — OpenStreetMap
// ---------------------------------------------------------------------------
// A real federal boundary (BLM), and the reason Henderson stops climbing into
// the McCullough Range on its southern side. Same role Red Rock plays on the
// Summerlin map.
//
// LICENSE: everything from Overpass is OpenStreetMap data and the output
// carries an ODbL attribution field. That attribution is rendered onto the map
// and repeated in the page sources. It is a license condition. Do not strip it.

import { writeFileSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";
import {
  overpass,
  chain,
  clip,
  simplify,
  round5,
  lengthKm,
  makeInside,
  reduceRoad,
} from "./lib/osm-geometry.mjs";

// A little wider than the map's own frame so clipped lines run off-canvas
// cleanly rather than stopping short of the edge.
const CLIP = { west: -115.30, east: -114.83, south: 35.84, north: 36.20 };
const BBOX = "35.84,-115.30,36.20,-114.83";
const inside = makeInside(CLIP);

const HENDERSON_BOUNDARY_URL =
  "https://maps.cityofhenderson.com/arcgis/rest/services/public/" +
  "OpenDataAdministrativeBoundaries/MapServer/1/query";

// OSM name -> how we draw it. Several names collapse onto one id where OSM
// splits a single road by directional prefix ("North …" / "South …").
//
// `cls` is how the road is DRAWN (freeway gets a casing and a heavier stroke).
// `reduce` is how its OSM ways are turned into a line, and the two are separate
// on purpose. Henderson is not a grid city the way the west valley is: most of
// what matters here — St. Rose, Lake Mead Pkwy, Horizon Ridge, Anthem Pkwy,
// Lake Las Vegas Pkwy — curves around terrain. Median-binning a curving or
// looping road averages its two sides together and draws a zigzag that is not a
// road, so anything that isn't a straight grid arterial is reduced by chaining.
// See the note on reduceRoad() in scripts/lib/osm-geometry.mjs.
//
// DELIBERATELY NOT INCLUDED: Seven Hills Drive and Sun City Anthem Drive. Both
// are internal community loops. They add no orientation value a community
// marker doesn't already give, and a loop is the one shape this pipeline
// genuinely cannot reduce into an honest single line.
const KEEP = {
  // --- freeways ---
  "Purple Heart Highway": { id: "i11", label: "I-11 / US-93 / US-95", cls: "freeway", reduce: "chain" },
  "Boulder City Bypass": { id: "i11", label: "I-11 / US-93 / US-95", cls: "freeway", reduce: "chain" },
  "Bruce Woodbury Beltway": { id: "i215", label: "I-215", cls: "freeway", reduce: "chain" },
  "Las Vegas Freeway": { id: "i15", label: "I-15", cls: "freeway", reduce: "chain" },

  // --- state routes ---
  "Saint Rose Parkway": { id: "st-rose", label: "St. Rose Pkwy (SR-146)", cls: "arterial", reduce: "chain" },
  "Boulder Highway": { id: "boulder-hwy", label: "Boulder Hwy (SR-582)", cls: "arterial", reduce: "bin" },
  "North Boulder Highway": { id: "boulder-hwy", label: "Boulder Hwy (SR-582)", cls: "arterial", reduce: "bin" },
  "South Boulder Highway": { id: "boulder-hwy", label: "Boulder Hwy (SR-582)", cls: "arterial", reduce: "bin" },
  "East Lake Mead Parkway": { id: "lake-mead-pkwy", label: "Lake Mead Pkwy (SR-564)", cls: "arterial", reduce: "chain" },
  "West Lake Mead Parkway": { id: "lake-mead-pkwy", label: "Lake Mead Pkwy (SR-564)", cls: "arterial", reduce: "chain" },

  // --- grid arterials (straight along one axis) ---
  "North Green Valley Parkway": { id: "green-valley-pkwy", label: "Green Valley Pkwy", cls: "arterial", reduce: "bin" },
  "South Green Valley Parkway": { id: "green-valley-pkwy", label: "Green Valley Pkwy", cls: "arterial", reduce: "bin" },
  "Green Valley Parkway": { id: "green-valley-pkwy", label: "Green Valley Pkwy", cls: "arterial", reduce: "bin" },
  "North Eastern Avenue": { id: "eastern", label: "Eastern Ave", cls: "arterial", reduce: "bin" },
  "South Eastern Avenue": { id: "eastern", label: "Eastern Ave", cls: "arterial", reduce: "bin" },
  "Eastern Avenue": { id: "eastern", label: "Eastern Ave", cls: "arterial", reduce: "bin" },
  "East Sunset Road": { id: "sunset", label: "Sunset Rd", cls: "arterial", reduce: "bin" },
  "West Sunset Road": { id: "sunset", label: "Sunset Rd", cls: "arterial", reduce: "bin" },
  "East Warm Springs Road": { id: "warm-springs", label: "Warm Springs Rd", cls: "arterial", reduce: "bin" },
  "West Warm Springs Road": { id: "warm-springs", label: "Warm Springs Rd", cls: "arterial", reduce: "bin" },
  "North Stephanie Street": { id: "stephanie", label: "Stephanie St", cls: "arterial", reduce: "bin" },
  "South Stephanie Street": { id: "stephanie", label: "Stephanie St", cls: "arterial", reduce: "bin" },
  "Stephanie Street": { id: "stephanie", label: "Stephanie St", cls: "arterial", reduce: "bin" },
  "South Las Vegas Boulevard": { id: "las-vegas-blvd", label: "Las Vegas Blvd", cls: "arterial", reduce: "bin" },
  "College Drive": { id: "college", label: "College Dr", cls: "arterial", reduce: "bin" },
  "North Gibson Road": { id: "gibson", label: "Gibson Rd", cls: "arterial", reduce: "bin" },
  "South Gibson Road": { id: "gibson", label: "Gibson Rd", cls: "arterial", reduce: "bin" },
  "Gibson Road": { id: "gibson", label: "Gibson Rd", cls: "arterial", reduce: "bin" },
  "East Windmill Lane": { id: "windmill", label: "Windmill Ln", cls: "arterial", reduce: "bin" },
  "West Windmill Lane": { id: "windmill", label: "Windmill Ln", cls: "arterial", reduce: "bin" },
  "North Pecos Road": { id: "pecos", label: "Pecos Rd", cls: "arterial", reduce: "bin" },
  "South Pecos Road": { id: "pecos", label: "Pecos Rd", cls: "arterial", reduce: "bin" },
  "Pecos Road": { id: "pecos", label: "Pecos Rd", cls: "arterial", reduce: "bin" },

  // --- curving parkways (terrain-following, so chained not binned) ---
  "West Horizon Ridge Parkway": { id: "horizon-ridge", label: "Horizon Ridge Pkwy", cls: "arterial", reduce: "chain" },
  "East Horizon Ridge Parkway": { id: "horizon-ridge", label: "Horizon Ridge Pkwy", cls: "arterial", reduce: "chain" },
  "Anthem Parkway": { id: "anthem-pkwy", label: "Anthem Pkwy", cls: "arterial", reduce: "chain" },
  "Volunteer Boulevard": { id: "volunteer", label: "Volunteer Blvd", cls: "arterial", reduce: "chain" },
  "Via Inspirada": { id: "via-inspirada", label: "Via Inspirada", cls: "arterial", reduce: "chain" },
  "Lake Las Vegas Parkway": { id: "llv-pkwy", label: "Lake Las Vegas Pkwy", cls: "arterial", reduce: "chain" },
  "Paseo Verde Parkway": { id: "paseo-verde", label: "Paseo Verde Pkwy", cls: "arterial", reduce: "chain" },
  "Sunridge Heights Parkway": { id: "sunridge", label: "Sunridge Heights Pkwy", cls: "arterial", reduce: "chain" },
  "Bicentennial Parkway": { id: "bicentennial", label: "Bicentennial Pkwy", cls: "arterial", reduce: "chain" },
  "North Water Street": { id: "water-street", label: "Water St", cls: "arterial", reduce: "chain" },
  "South Water Street": { id: "water-street", label: "Water St", cls: "arterial", reduce: "chain" },
  "East Galleria Drive": { id: "galleria", label: "Galleria Dr", cls: "arterial", reduce: "chain" },
  "West Galleria Drive": { id: "galleria", label: "Galleria Dr", cls: "arterial", reduce: "chain" },
};

const TOL = 0.00022; // ~24 m

// --- 1. city boundary -------------------------------------------------------

console.error("fetching City of Henderson boundary...");

const boundaryParams = new URLSearchParams({
  where: "1=1",
  outFields: "*",
  outSR: "4326",
  returnGeometry: "true",
  f: "geojson",
});

const boundaryRes = await fetch(HENDERSON_BOUNDARY_URL, {
  method: "POST",
  headers: {
    "Content-Type": "application/x-www-form-urlencoded",
    "User-Agent": "LVINIT-map-build/1.0 (https://www.lvinit.com)",
  },
  body: boundaryParams.toString(),
  signal: AbortSignal.timeout(120000),
});
const boundaryJson = await boundaryRes.json();
if (boundaryJson.error) {
  throw new Error("city boundary request failed: " + JSON.stringify(boundaryJson.error));
}
if (!boundaryJson.features?.length) {
  throw new Error("city boundary request returned no features");
}
if (boundaryJson.features.length > 1) {
  throw new Error(
    "expected one city-limits polygon, got " + boundaryJson.features.length + " features"
  );
}

const boundaryFeature = boundaryJson.features[0];
const boundaryProps = boundaryFeature.properties ?? {};
const rawRings =
  boundaryFeature.geometry.type === "Polygon"
    ? boundaryFeature.geometry.coordinates
    : boundaryFeature.geometry.coordinates.flat();

// Simplify each ring on its own. The rings are CLOSED, so they are simplified
// in two halves — Douglas-Peucker anchors on the first and last point, and on a
// closed ring those are the same point, which would collapse the whole thing.
function simplifyRing(ring, tol) {
  if (ring.length < 8) return round5(ring);
  const half = Math.floor(ring.length / 2);
  const a = simplify(ring.slice(0, half + 1), tol);
  const b = simplify(ring.slice(half), tol);
  const joined = a.slice(0, -1).concat(b);
  // Re-close if simplification dropped the closing point.
  const first = joined[0];
  const last = joined[joined.length - 1];
  if (first[0] !== last[0] || first[1] !== last[1]) joined.push(first);
  return round5(joined);
}

const cityRings = rawRings.map((r) => simplifyRing(r, TOL)).filter((r) => r.length > 3);

// --- 2. roads ---------------------------------------------------------------

// Every road name here is a plain street name, but escape anyway rather than
// trust that — an unescaped "." in a future entry would silently widen the match.
const nameFilter = Object.keys(KEEP)
  .map((n) => n.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
  .join("|");

// ONE query for all three OSM layers. Three separate round trips got rate
// limited mid-run and fell through to a mirror that answered 200-with-nothing
// for the lake, which is the worst possible failure: it looks like success.
console.error("fetching roads, Sloan Canyon NCA and Lake Las Vegas (one query)...");
const raw = await overpass(`
[out:json][timeout:240];
(
  way["highway"]["name"~"^(${nameFilter})$"](${BBOX});
  way["natural"="water"]["name"="Lake Las Vegas"](${BBOX});
);
out geom tags;
rel["leisure"="nature_reserve"]["name"="Sloan Canyon National Conservation Area"];
out geom;
`);

const byId = new Map();
for (const el of raw.elements) {
  if (el.type !== "way" || !el.geometry) continue;
  const meta = KEEP[el.tags?.name];
  if (!meta) continue;
  if (!byId.has(meta.id)) byId.set(meta.id, { meta, ways: [], names: new Set(), refs: new Set() });
  const bucket = byId.get(meta.id);
  bucket.ways.push(el.geometry.map((g) => [g.lon, g.lat]));
  bucket.names.add(el.tags.name);
  if (el.tags.ref) bucket.refs.add(el.tags.ref);
}

const roads = [];
for (const [id, { meta, ways, names, refs }] of byId) {
  const paths = reduceRoad(ways, meta.reduce, {
    inside,
    tol: TOL,
    // Freeway fragments are long; a chained city parkway can legitimately be
    // short (Bicentennial is under 2 km end to end), so it needs a lower floor
    // or it drops out of the file entirely.
    minChainKm: meta.cls === "freeway" ? 1.5 : 0.6,
  });
  if (!paths.length) continue;
  roads.push({
    id,
    label: meta.label,
    cls: meta.cls,
    // Recorded so scripts/check-henderson-map.mjs knows which reduction to hold
    // each road to: a binned road that wanders off its own axis is a bug, a
    // chained road that curves is just a curving road.
    reduce: meta.reduce,
    osmNames: [...names].sort(),
    osmRefs: [...refs].sort(),
    paths,
  });
}
roads.sort((a, b) => a.id.localeCompare(b.id));

const missing = [...new Set(Object.values(KEEP).map((m) => m.id))].filter(
  (id) => !roads.some((r) => r.id === id)
);
if (missing.length) console.error("  WARNING: no geometry for " + missing.join(", "));

// --- 3. Sloan Canyon NCA ----------------------------------------------------

// The relation comes back with its member ways' geometry inline, which is what
// keeps it distinguishable from the road ways in the same response.
const sloanMembers = raw.elements
  .filter((e) => e.type === "relation")
  .flatMap((rel) => (rel.members ?? []).filter((m) => m.geometry))
  .map((m) => m.geometry.map((g) => [g.lon, g.lat]));

const sloan = [];
for (const line of chain(sloanMembers)) {
  for (const run of clip(line, inside)) {
    const s = round5(simplify(run, TOL));
    if (s.length > 1 && lengthKm(s) > 0.3) sloan.push(s);
  }
}
sloan.sort((a, b) => lengthKm(b) - lengthKm(a));

// --- 4. Lake Las Vegas ------------------------------------------------------

const lakeLasVegas = raw.elements
  .filter((e) => e.type === "way" && e.geometry && e.tags?.natural === "water")
  .map((e) => round5(simplify(e.geometry.map((g) => [g.lon, g.lat]), 0.00008)))
  .filter((r) => r.length > 3);

// --- guard rails ------------------------------------------------------------
//
// Overpass mirrors disagree with each other under load, and an empty answer
// looks exactly like "this feature no longer exists". Every layer below is
// known to exist, so an empty result is a failed fetch, not news. Fail loudly
// rather than quietly committing a map with a missing lake.

if (cityRings.length < 1) throw new Error("city boundary reduced to nothing");
if (roads.length < 20) throw new Error("only " + roads.length + " roads survived reduction");
if (!sloan.length) throw new Error("Sloan Canyon NCA boundary came back empty — retry");
if (!lakeLasVegas.length) throw new Error("Lake Las Vegas came back empty — retry");

// --- write ------------------------------------------------------------------

const payload = {
  _comment:
    "Geometry for the LVINIT Henderson area map. `city` is the OFFICIAL City of Henderson " +
    "municipal boundary, taken from the city's own ArcGIS Server in WGS84 — one outer ring " +
    "followed by interior rings for the unincorporated Clark County pockets inside it. Roads, " +
    "the Sloan Canyon NCA boundary and Lake Las Vegas come from OpenStreetMap, clipped to the " +
    "map frame and simplified to about 24 m. Arterials are median-binned centerlines of both " +
    "carriageways; freeways are a single carriageway. Accurate enough to orient by, not survey " +
    "geometry.",
  retrieved: new Date().toISOString().slice(0, 10),
  clip: CLIP,
  city: {
    source: "City of Henderson GIS, OpenDataAdministrativeBoundaries/MapServer/1 (City Boundary)",
    sourceUrl: HENDERSON_BOUNDARY_URL.replace("/query", ""),
    portal: "https://gis-hendersonnv.opendata.arcgis.com/",
    // The city's own attributes, carried through unmodified for provenance.
    acres: boundaryProps.ACRES ?? null,
    sqMiles: boundaryProps.SQMILES ?? null,
    rings: cityRings,
  },
  attribution:
    "Roads, Sloan Canyon NCA boundary and Lake Las Vegas: © OpenStreetMap contributors, " +
    "ODbL 1.0 — https://www.openstreetmap.org/copyright. City boundary: City of Henderson GIS.",
  roads,
  sloanCanyonNca: sloan,
  lakeLasVegas,
};

const OUT = "scripts/data/henderson-map-geometry.json";
mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, JSON.stringify(payload, null, 0) + "\n", "utf8");

console.log(
  `\ncity boundary: ${cityRings.length} ring(s), ` +
    `${cityRings.reduce((a, r) => a + r.length, 0)} points, ` +
    `${boundaryProps.SQMILES} sq mi / ${boundaryProps.ACRES} acres (city's own figures)`
);
let pts = 0;
for (const r of roads) {
  for (const p of r.paths) pts += p.length;
  console.log(
    `  ${r.id.padEnd(19)} ${r.cls.padEnd(9)} ` +
      r.paths.map((p) => `${p.length}pt/${lengthKm(p).toFixed(1)}km`).join("  ")
  );
}
console.log(`\nroads: ${roads.length}, ${pts} points`);
console.log(`sloanCanyonNca: ${sloan.length} path(s), ${sloan.reduce((a, p) => a + p.length, 0)} points`);
console.log(`lakeLasVegas: ${lakeLasVegas.length} ring(s), ${lakeLasVegas.reduce((a, p) => a + p.length, 0)} points`);
console.log("wrote " + OUT);
