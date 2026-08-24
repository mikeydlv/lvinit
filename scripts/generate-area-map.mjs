// ---------------------------------------------------------------------------
// LVINIT AREA MAP GENERATOR
//
// Emits a standalone, self-contained SVG map of the Las Vegas Valley with one
// area guide's geography highlighted. Run it, commit the output, and point an
// <LVINITMap> component at the file:
//
//   node scripts/generate-area-map.mjs
//   -> public/images/maps/southwest-las-vegas-map-lvinit.svg
//
// WHY A FILE AND NOT INLINE SVG: the map is meant to be indexable as a
// standalone Google Images asset. Inline SVG is page markup, not an image
// resource -- a real file with a descriptive name, served through next/image
// with alt text, is what actually gets indexed.
//
// ACCURACY MODEL -- read before editing coordinates.
// Every position below is a real WGS84 lat/lon, projected with a plain
// equirectangular projection scaled by cos(36 N). Over a ~26 km window the
// distortion is negligible, so relative positions are trustworthy.
//
// Sources for the anchors (Wikipedia/GNIS coordinates, retrieved 2026-08-20):
//  - UnCommons 36.0639,-115.277      - Rhodes Ranch 36.04417,-115.28722
//  - Mountain's Edge 36.025,-115.2425 - Southern Highlands 35.9749,-115.1939
//  - Harry Reid Intl 36.0800,-115.15222 - Spring Valley 36.1125,-115.25028
//  - Enterprise 36.03139,-115.19806  - Summerlin 36.18333,-115.33333
//
// The Las Vegas arterial grid is a strict one-mile grid, so a north-south
// arterial is fully described by a single longitude and an east-west arterial
// by a single latitude. Those are derived from the anchors above at
// 1 mile = 0.01786 deg lon / 0.01450 deg lat.
//
// WHAT IS DELIBERATELY NOT DRAWN: the legal boundaries of Enterprise and
// Spring Valley. Clark County publishes those as land-use plan geometry we
// have not ingested, so drawing them by hand would be inventing a government
// boundary. They appear as placed labels only, and the map says so.
//
// The LVINIT area outlines are explicitly labeled approximate and are styled
// (dashed / dotted, no hard edge) so they can never be mistaken for official
// boundaries.
// ---------------------------------------------------------------------------

import { writeFileSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { createProjection, svgDocument, wordmark, label, C } from "./lib/area-map.mjs";

// --- projection ------------------------------------------------------------
//
// The projection, palette, label primitive and SVG wrapper are shared with
// every other area map — see scripts/lib/area-map.mjs. Only the geography and
// the composition below are Southwest's own.

const BOUNDS = { west: -115.37, east: -115.08, south: 35.955, north: 36.175 };
const PX_PER_KM = 40;

const { W, H, x, y, pts } = createProjection(BOUNDS, PX_PER_KM);

// --- base geography: the Las Vegas Valley -----------------------------------
// Reused by every future area guide. Only the highlight layer changes.

const NS_ARTERIALS = [
  { name: "Hualapai Way", lon: -115.313, from: 36.175, to: 36.02 },
  { name: "Fort Apache Rd", lon: -115.295, from: 36.175, to: 36.0 },
  { name: "Durango Dr", lon: -115.277, from: 36.175, to: 35.985 },
  { name: "Buffalo Dr", lon: -115.259, from: 36.175, to: 36.0 },
  { name: "Rainbow Blvd", lon: -115.2415, from: 36.175, to: 35.962 },
  { name: "Jones Blvd", lon: -115.2235, from: 36.175, to: 36.0 },
  { name: "Decatur Blvd", lon: -115.2055, from: 36.175, to: 35.962 },
];

const EW_ARTERIALS = [
  { name: "Tropicana Ave", lat: 36.1, from: -115.34, to: -115.1 },
  { name: "Russell Rd", lat: 36.0855, from: -115.33, to: -115.1 },
  { name: "Sunset Rd", lat: 36.071, from: -115.32, to: -115.1 },
  // Desert Flow sits exactly at Warm Springs & Fort Apache, so this label is
  // pushed west of its marker.
  { name: "Warm Springs Rd", lat: 36.0565, from: -115.31, to: -115.13, labelLon: -115.3065, labelAnchor: "end" },
  // labelLon/labelAnchor keep these two clear of the Rhodes Ranch and Nevada
  // Trails markers, which sit almost exactly on these latitudes.
  { name: "Windmill Ln", lat: 36.042, from: -115.3, to: -115.15, labelLon: -115.2985, labelAnchor: "end" },
  { name: "Silverado Ranch Blvd", lat: 36.0275, from: -115.28, to: -115.15, labelLon: -115.152, labelAnchor: "end" },
];

// Blue Diamond Rd (SR-160) is the one southwest arterial off the grid -- it
// runs WNW from I-15 toward the town of Blue Diamond (36.040, -115.413).
const BLUE_DIAMOND = [
  [-115.1955, 36.0135],
  [-115.2415, 36.0192],
  [-115.277, 36.023],
  [-115.313, 36.0273],
  [-115.37, 36.0344],
];

const I15 = [
  [-115.147, 36.175],
  [-115.156, 36.145],
  [-115.17, 36.115],
  [-115.177, 36.1],
  [-115.182, 36.086],
  [-115.186, 36.055],
  [-115.1875, 36.0165],
  [-115.188, 35.99],
  [-115.199, 35.955],
];

// CC-215 (Bruce Woodbury Beltway), west and south legs.
const CC215 = [
  [-115.327, 36.175],
  [-115.328, 36.13],
  [-115.327, 36.1],
  [-115.325, 36.088],
  [-115.319, 36.08],
  [-115.31, 36.0755],
  [-115.295, 36.0715],
  [-115.277, 36.067],
  [-115.259, 36.0605],
  [-115.2415, 36.0525],
  [-115.2235, 36.044],
  [-115.2055, 36.035],
  [-115.1955, 36.0255],
  [-115.1875, 36.0165],
];

// East of I-15 the same road carries the Interstate 215 designation.
const I215_EAST = [
  [-115.1875, 36.0165],
  [-115.17, 36.0205],
  [-115.15, 36.0265],
  [-115.12, 36.035],
  [-115.08, 36.045],
];

// --- highlight layer: Southwest Las Vegas -----------------------------------

// The area essentially everyone means by "Southwest." Approximate, by design.
const CORE = [
  [-115.317, 36.082],
  [-115.203, 36.082],
  [-115.197, 36.032],
  [-115.214, 36.0],
  [-115.266, 35.99],
  [-115.308, 36.0],
  [-115.319, 36.04],
];

// The wider envelope some people include -- Southern Highlands at the south
// end, the Spring Valley overlap at the north. Where agreement breaks down.
const EDGE = [
  [-115.33, 36.108],
  [-115.19, 36.108],
  [-115.176, 36.03],
  [-115.178, 35.966],
  [-115.25, 35.962],
  [-115.318, 35.985],
  [-115.334, 36.05],
];

const PLACES = [
  { name: "UnCommons / Durango Resort", lon: -115.277, lat: 36.0639, dx: 13, dy: -9, anchor: "start" },
  { name: "Rhodes Ranch", lon: -115.2872, lat: 36.0442, dx: -13, dy: -20, anchor: "end" },
  { name: "Nevada Trails", lon: -115.2715, lat: 36.0295, dx: 13, dy: -22, anchor: "start" },
  { name: "Mountain's Edge", lon: -115.267, lat: 36.0055, dx: -13, dy: 7, anchor: "end" },
  { name: "Southern Highlands", lon: -115.1939, lat: 35.9749, dx: 14, dy: 7, anchor: "start" },
  { name: "Desert Flow Bike Park", lon: -115.295, lat: 36.0565, dx: -13, dy: -30, anchor: "end" },
];

const REFERENCES = [
  { name: "Downtown Summerlin", lon: -115.328, lat: 36.166, dx: 14, dy: 6, anchor: "start" },
  { name: "The Strip", lon: -115.172, lat: 36.108, dx: 14, dy: 6, anchor: "start" },
  { name: "Harry Reid Intl Airport", lon: -115.152, lat: 36.08, dx: 14, dy: 6, anchor: "start" },
];

// Clark County towns -- labels only. Their legal boundaries are NOT drawn.
const TOWN_LABELS = [
  { name: "SPRING VALLEY", lon: -115.262, lat: 36.104 },
  { name: "ENTERPRISE", lon: -115.222, lat: 36.008 },
];

// --- composition ------------------------------------------------------------
//
// `label` rotates about its own anchor point, which is what keeps the
// north-south arterials legible here: they sit one mile (64px) apart and
// "Fort Apache Rd" alone is ~113px wide set horizontally.

const parts = [];
const push = (s) => parts.push(s);

push('<rect width="' + W + '" height="' + H + '" fill="' + C.paper + '"/>');

// Approximate-area fills sit under the road network so the roads stay readable.
push(
  '<polygon points="' + pts(EDGE) + '" fill="' + C.blue +
  '" fill-opacity="0.035" stroke="' + C.blue +
  '" stroke-opacity="0.4" stroke-width="2" stroke-dasharray="2 8" stroke-linejoin="round"/>'
);
push(
  '<polygon points="' + pts(CORE) + '" fill="' + C.blue +
  '" fill-opacity="0.07" stroke="' + C.blue +
  '" stroke-width="2.6" stroke-dasharray="10 7" stroke-linejoin="round"/>'
);

for (const r of NS_ARTERIALS) {
  push('<line x1="' + x(r.lon) + '" y1="' + y(r.from) + '" x2="' + x(r.lon) + '" y2="' + y(r.to) +
    '" stroke="' + C.road + '" stroke-width="1.8"/>');
}
for (const r of EW_ARTERIALS) {
  push('<line x1="' + x(r.from) + '" y1="' + y(r.lat) + '" x2="' + x(r.to) + '" y2="' + y(r.lat) +
    '" stroke="' + C.road + '" stroke-width="1.8"/>');
}

const HIGHWAYS = [BLUE_DIAMOND, I15, CC215, I215_EAST];
for (const line of HIGHWAYS) {
  push('<polyline points="' + pts(line) + '" fill="none" stroke="' + C.light +
    '" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>');
}
for (const line of HIGHWAYS) {
  push('<polyline points="' + pts(line) + '" fill="none" stroke="' + C.warm +
    '" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/>');
}

// Set vertically, reading bottom-to-top, in the clear band above Tropicana.
for (const r of NS_ARTERIALS) {
  push(label(r.name, x(r.lon) + 5, y(36.128), { size: 15, rotate: -90 }));
}
for (const r of EW_ARTERIALS) {
  const lon = r.labelLon ?? r.from;
  const anchor = r.labelAnchor ?? "start";
  const px = anchor === "end" ? x(lon) : x(lon) + 8;
  push(label(r.name, px, y(r.lat) - 7, { size: 15, anchor }));
}

push(label("Blue Diamond Rd (SR-160)", x(-115.352), y(36.0335) - 9, { size: 15 }));
push(label("I-15", x(-115.1855) + 9, y(36.062), { size: 17, fill: C.black, weight: 700 }));
push(label("CC-215 Beltway", x(-115.3255) + 10, y(36.118), { size: 17, fill: C.black, weight: 700 }));
push(label("CC-215", x(-115.2325), y(36.0505) - 10, { size: 17, fill: C.black, weight: 700 }));
push(label("I-215", x(-115.118), y(36.0345) - 11, { size: 17, fill: C.black, weight: 700 }));

for (const t of TOWN_LABELS) {
  push(label(t.name, x(t.lon), y(t.lat), {
    size: 30, fill: C.warm, weight: 700, spacing: 4, anchor: "middle",
  }));
  push(label("(Clark County town, boundary not drawn)", x(t.lon), y(t.lat) + 22, {
    size: 13, anchor: "middle",
  }));
}

push(label("Red Rock / Spring Mountains", 16, y(36.094), { size: 15 }));
push(label("Henderson", W - 16, y(36.052) + 26, { size: 16, fill: C.black, weight: 600, anchor: "end" }));

for (const p of REFERENCES) {
  push('<circle cx="' + x(p.lon) + '" cy="' + y(p.lat) + '" r="5" fill="' + C.black + '" fill-opacity="0.55"/>');
  push(label(p.name, x(p.lon) + p.dx, y(p.lat) + p.dy, { size: 16, fill: C.warm, anchor: p.anchor }));
}

for (const p of PLACES) {
  push('<circle cx="' + x(p.lon) + '" cy="' + y(p.lat) + '" r="6.5" fill="' + C.paper +
    '" stroke="' + C.blue + '" stroke-width="3"/>');
  push(label(p.name, x(p.lon) + p.dx, y(p.lat) + p.dy, { size: 18, fill: C.black, weight: 600, anchor: p.anchor }));
}

// Legend -- sits in the empty southwest corner of the frame.
const LX = 20;
const LY = H - 196;
push('<rect x="' + LX + '" y="' + LY + '" width="382" height="176" fill="' + C.paper +
  '" fill-opacity="0.94" stroke="' + C.light + '" stroke-width="1.5"/>');
push(label("WHAT THE OUTLINES MEAN", LX + 18, LY + 30, { size: 13, fill: C.warm, weight: 700, spacing: 1.6 }));
push('<line x1="' + (LX + 18) + '" y1="' + (LY + 55) + '" x2="' + (LX + 58) + '" y2="' + (LY + 55) +
  '" stroke="' + C.blue + '" stroke-width="2.6" stroke-dasharray="10 7"/>');
push(label("Southwest, as locals generally use it", LX + 70, LY + 60, { size: 15, fill: C.black }));
push('<line x1="' + (LX + 18) + '" y1="' + (LY + 84) + '" x2="' + (LX + 58) + '" y2="' + (LY + 84) +
  '" stroke="' + C.blue + '" stroke-opacity="0.4" stroke-width="2" stroke-dasharray="2 8"/>');
push(label("Sometimes included, sometimes not", LX + 70, LY + 89, { size: 15, fill: C.black }));
push(label("Both are LVINIT's reading of local usage. Neither", LX + 18, LY + 122, { size: 13 }));
push(label("is a government boundary. Enterprise and Spring", LX + 18, LY + 141, { size: 13 }));
push(label("Valley are labeled here, not outlined.", LX + 18, LY + 160, { size: 13 }));

push(wordmark(W));

const TITLE = "Southwest Las Vegas: an LVINIT area map";
const DESC =
  "Schematic map of the southwest Las Vegas Valley. A dashed outline marks the area locals generally mean by " +
  "Southwest Las Vegas, with a lighter dotted outline for the edges people disagree about. Mountain's Edge, " +
  "Rhodes Ranch, Nevada Trails, Southern Highlands, the UnCommons and Durango Resort corridor and Desert Flow " +
  "Bike Park are marked, along with the CC-215 Beltway, I-15, Blue Diamond Road, Durango Drive, Fort Apache Road, " +
  "Rainbow Boulevard, the Las Vegas Strip, Harry Reid International Airport, Downtown Summerlin and the direction " +
  "of Henderson. The Clark County towns of Enterprise and Spring Valley are labeled; their legal boundaries are " +
  "not drawn.";

const svg = svgDocument({ W, H, title: TITLE, desc: DESC, parts });

const OUT = "public/images/maps/southwest-las-vegas-map-lvinit.svg";
mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, svg, "utf8");
console.log("wrote " + OUT + "  (" + W + " x " + H + ")");
