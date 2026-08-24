// ---------------------------------------------------------------------------
// LVINIT SUMMERLIN AREA MAP
//
//   node scripts/generate-summerlin-map.mjs
//   node scripts/check-summerlin-map.mjs      <- run this after, every time
//   -> public/images/maps/summerlin-las-vegas-map-lvinit.svg
//
// Same job as scripts/generate-area-map.mjs (Southwest) and the same shared
// toolkit in scripts/lib/area-map.mjs, but Summerlin poses a different mapping
// problem, so this map answers it differently. Read this header before editing.
//
// ---------------------------------------------------------------------------
// WHY THERE IS NO SUMMERLIN BOUNDARY ON THIS MAP
// ---------------------------------------------------------------------------
// Summerlin is a private master-planned community. Its extent is defined by the
// developer's own plan, and Howard Hughes publishes that extent as the official
// Summerlin Border Map — copyrighted artwork we are not going to copy, trace,
// modify or redraw. Summerlin's line is Summerlin's.
//
// Nor is there a government boundary that stands in for it. Summerlin is not a
// city, not a Clark County town, and not a census place. The nearest official
// geographies are all narrower than the community:
//   · Clark County's Summerlin South land-use planning area (~7,099 acres)
//   · the Summerlin South census-designated place
//   · the City of Las Vegas Summerlin PC zoning district
// None of those is "Summerlin," and drawing any of them under that label would
// mislead more than it explains.
//
// So this map asserts no boundary. It plots verified points, draws real roads,
// and lets the shape of the community emerge from where its villages actually
// are. What it CAN show honestly, it shows precisely:
//   · villages at their real coordinates
//   · the CC-215, the line locals actually divide by — the City of Las Vegas
//     Summerlin Development Standards themselves write rules for "areas west of
//     the 215 Beltway"
//   · the Red Rock Canyon NCA boundary: a real federal line, and the hard
//     western limit on how far the community can ever grow
//
// That is a deliberate trade of tidiness for accuracy. A clean invented outline
// would look better and teach something false.
//
// ---------------------------------------------------------------------------
// WHERE THE GEOMETRY COMES FROM
// ---------------------------------------------------------------------------
// scripts/data/summerlin-map-geometry.json — road centerlines and the Red Rock
// Canyon National Conservation Area boundary, derived from OpenStreetMap
// (© OpenStreetMap contributors, ODbL), retrieved 2026-08-20. Regenerate with
// scripts/prep-summerlin-map-geometry.mjs. The attribution is rendered onto the
// map and repeated in the page's sources — it is a license condition, not a
// courtesy. Do not remove it.
//
// Village coordinates below are OSM place records, checked against Summerlin's
// own published descriptions of where each village sits. Every one is a real
// WGS84 point; nothing here is eyeballed off someone else's map.
//
// ---------------------------------------------------------------------------
// WHY ONLY SOME VILLAGES ARE LABELED
// ---------------------------------------------------------------------------
// Summerlin has far more villages than fit legibly in a frame this narrow — the
// community is roughly 14 km wide and 18 km tall, so a true-scale map is always
// going to be a tall strip with everything crowded into the middle of it. Two
// tight pairs (Kestrel/Kestrel Commons, Redpoint/Redpoint Square) share one
// label between two dots; the smaller southern villages are named in the page's
// map key and villages section instead of here. An orientation map that can be
// read beats a complete one that can't.
// ---------------------------------------------------------------------------

import { writeFileSync, mkdirSync, readFileSync } from "node:fs";
import { dirname } from "node:path";
import { createProjection, svgDocument, wordmark, label, C } from "./lib/area-map.mjs";

// --- frame ------------------------------------------------------------------
// North past Reverence and Sun City, south to The Cliffs (Summerlin's
// southernmost village), west far enough into the conservation area to show
// what stops the community, east to Rampart and the Summerlin Parkway run-out.

const BOUNDS = { west: -115.412, east: -115.258, south: 36.068, north: 36.228 };
const PX_PER_KM = 58;

const { W, H, x, y, pts } = createProjection(BOUNDS, PX_PER_KM);

const GEO = JSON.parse(
  readFileSync(new URL("./data/summerlin-map-geometry.json", import.meta.url), "utf8")
);

// --- villages ---------------------------------------------------------------
//
// `selling` marks the villages Summerlin itself listed as actively selling on
// summerlin.com/actively-selling as of 2026-08-20. That list moves; re-check it
// rather than trusting this comment.
//
// `also` is a second dot sharing one label — the two halves of a pair that sit
// too close together to letter separately at this scale.

const VILLAGES = [
  // --- Summerlin West: everything west of the CC-215 ---
  { name: "Reverence", lon: -115.3403, lat: 36.2131, dx: 14, dy: 5 },
  {
    name: "Kestrel & Kestrel Commons",
    lon: -115.35,
    lat: 36.204,
    also: { lon: -115.3516, lat: 36.1995 },
    selling: true,
    dx: -15,
    dy: -4,
    anchor: "end",
  },
  { name: "La Madre Peaks", lon: -115.3773, lat: 36.1956, selling: true, dx: 15, dy: -8 },
  { name: "Grand Park", lon: -115.368, lat: 36.1893, selling: true, dx: -15, dy: -8, anchor: "end" },
  {
    name: "Redpoint & Redpoint Square",
    lon: -115.3521,
    lat: 36.1884,
    also: { lon: -115.3522, lat: 36.1862 },
    selling: true,
    dx: 16,
    dy: 3,
  },
  { name: "The Vistas", lon: -115.3468, lat: 36.175, dx: 15, dy: 22 },
  { name: "The Paseos", lon: -115.361, lat: 36.1742, dx: -15, dy: 5, anchor: "end" },
  { name: "Stonebridge", lon: -115.3727, lat: 36.157, dx: 15, dy: 5 },

  // --- Summerlin North: east of the CC-215, north of Charleston ---
  { name: "Sun City Summerlin", lon: -115.3177, lat: 36.2111, dx: 15, dy: 5 },
  { name: "The Hills", lon: -115.2919, lat: 36.2008, dx: 15, dy: 5 },
  { name: "The Trails", lon: -115.3119, lat: 36.1985, dx: 15, dy: 18 },
  { name: "The Arbors", lon: -115.3334, lat: 36.1795, dx: 15, dy: -6 },
  { name: "The Canyons", lon: -115.3093, lat: 36.1763, dx: -15, dy: 5, anchor: "end" },

  // --- Summerlin South: south of Charleston ---
  { name: "Summerlin Centre", lon: -115.33, lat: 36.1608, selling: true, dx: 16, dy: -6 },
  { name: "Downtown Summerlin", lon: -115.3339, lat: 36.1513, dx: 16, dy: 7, big: true },
  { name: "The Willows", lon: -115.3207, lat: 36.1367, dx: 15, dy: 5 },
  { name: "The Ridges", lon: -115.3406, lat: 36.1139, dx: -15, dy: 5, anchor: "end" },
  { name: "The Cliffs", lon: -115.3189, lat: 36.0752, dx: 15, dy: 5 },
];

// Road labels. Each names the road it belongs to and one coordinate along it;
// `anchorOnRoad` below reads the other coordinate straight out of the geometry,
// so a label always lands on its own road rather than on whatever happens to
// run past the latitude someone typed. (The first draft of this map had "Far
// Hills Ave" sitting neatly on top of Summerlin Parkway for exactly that
// reason.) `dy`/`dx` then nudge it clear of the line. Verified by
// scripts/check-summerlin-map.mjs.
const ROAD_LABELS = [
  { road: "cc215", along: "lat", at: 36.2245, text: "CC-215", size: 17, weight: 700, fill: C.black, dx: 11 },
  { road: "cc215", along: "lat", at: 36.0935, text: "CC-215", size: 17, weight: 700, fill: C.black, dx: 12 },
  { road: "summerlin-pkwy", along: "lon", at: -115.27, text: "Summerlin Parkway", size: 16, weight: 700, fill: C.black, dy: -12, anchor: "end" },
  { road: "charleston", along: "lon", at: -115.36, text: "W Charleston Blvd", size: 15, dy: -9 },
  { road: "sahara", along: "lon", at: -115.34, text: "W Sahara Ave", size: 15, dy: -9 },
  { road: "far-hills", along: "lon", at: -115.36, text: "Far Hills Ave", size: 15, dy: -9, dx: -6, anchor: "end" },
  { road: "lake-mead", along: "lon", at: -115.36, text: "W Lake Mead Blvd", size: 15, dy: 19 },
  { road: "cheyenne", along: "lon", at: -115.301, text: "W Cheyenne Ave", size: 15, dy: -9 },
  { road: "flamingo", along: "lon", at: -115.283, text: "W Flamingo Rd", size: 15, dy: -9 },
  { road: "russell", along: "lon", at: -115.283, text: "W Russell Rd", size: 15, dy: -9 },
  { road: "town-center", along: "lat", at: 36.1215, text: "Town Center Dr", size: 15, rotate: -90, dx: -6 },
  { road: "hualapai", along: "lat", at: 36.094, text: "Hualapai Way", size: 15, rotate: -90, dx: -6 },
  { road: "rampart", along: "lat", at: 36.162, text: "Rampart Blvd", size: 15, rotate: -90, dx: -6 },
];

/**
 * The point on a named road where it crosses the given lon (or lat),
 * interpolated along the segment rather than snapped to a vertex — the paths
 * are simplified to ~24 m, so consecutive vertices can be a kilometer apart.
 */
function anchorOnRoad(id, along, at) {
  const road = GEO.roads.find((r) => r.id === id);
  if (!road) throw new Error("no road in geometry: " + id);
  const i = along === "lat" ? 1 : 0;
  let best = null;
  let bestD = Infinity;

  for (const path of road.paths) {
    for (let k = 1; k < path.length; k++) {
      const a = path[k - 1];
      const b = path[k];
      const lo = Math.min(a[i], b[i]);
      const hi = Math.max(a[i], b[i]);
      if (at >= lo && at <= hi) {
        const span = b[i] - a[i];
        const t = span === 0 ? 0 : (at - a[i]) / span;
        return { lon: a[0] + (b[0] - a[0]) * t, lat: a[1] + (b[1] - a[1]) * t };
      }
      for (const p of [a, b]) {
        const d = Math.abs(p[i] - at);
        if (d < bestD) {
          bestD = d;
          best = p;
        }
      }
    }
  }

  // A label pinned where the road never runs would be a silent lie about the
  // geography, so this is a hard failure rather than a nudge.
  throw new Error(
    `road ${id} does not cross ${along} ${at} — nearest point is ${bestD.toFixed(4)} deg ` +
      `away at ${best?.[0]},${best?.[1]}`
  );
}

// --- composition ------------------------------------------------------------

const parts = [];
const push = (s) => parts.push(s);

push('<rect width="' + W + '" height="' + H + '" fill="' + C.paper + '"/>');

// 1. Red Rock Canyon NCA. A real federal boundary, so it gets the only hard
//    line on the map — a soft band under a solid stroke. The band is drawn
//    symmetrically rather than only on the conservation side, because an
//    offset fill would mean asserting exactly where the interior lies at the
//    frame edges, and the label does that job honestly instead.
//    Only the long runs are drawn. The conservation area's western lobes clip
//    the frame edge as two- and three-point stubs that read as stray marks
//    rather than as a boundary; leaving them out loses no information, since
//    everything west of the drawn line is conservation land anyway.
const NCA = GEO.redRockNca.filter((path) => {
  let km = 0;
  for (let i = 1; i < path.length; i++) {
    km += Math.hypot(
      (path[i][0] - path[i - 1][0]) * 90.1,
      (path[i][1] - path[i - 1][1]) * 111
    );
  }
  return km >= 4;
});

for (const path of NCA) {
  push(
    '<polyline points="' + pts(path) + '" fill="none" stroke="' + C.gold +
    '" stroke-opacity="0.13" stroke-width="13" stroke-linecap="round" stroke-linejoin="round"/>'
  );
}
for (const path of NCA) {
  push(
    '<polyline points="' + pts(path) + '" fill="none" stroke="' + C.gold +
    '" stroke-opacity="0.85" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>'
  );
}

// 2. Roads: arterials first, freeways over them with a paper casing.
for (const road of GEO.roads) {
  if (road.cls !== "arterial") continue;
  for (const path of road.paths) {
    push(
      '<polyline points="' + pts(path) + '" fill="none" stroke="' + C.road +
      '" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>'
    );
  }
}
for (const pass of ["casing", "line"]) {
  for (const road of GEO.roads) {
    if (road.cls !== "freeway") continue;
    for (const path of road.paths) {
      push(
        '<polyline points="' + pts(path) + '" fill="none" stroke="' +
        (pass === "casing" ? C.light : C.warm) + '" stroke-width="' +
        (pass === "casing" ? 8 : 3.2) +
        '" stroke-linecap="round" stroke-linejoin="round"/>'
      );
    }
  }
}

// 3. Region type, set in the empty south-west — which is itself conservation
//    land, so the label sits on the ground it describes.
push(
  label("RED ROCK CANYON", 18, 604, { size: 21, fill: C.gold, weight: 700, spacing: 2.4 })
);
push(label("National Conservation Area", 18, 628, { size: 15 }));
push(label("Federal land, managed by the BLM.", 18, 656, { size: 13 }));
push(label("The gold line is its boundary, and", 18, 673, { size: 13 }));
push(label("the hard western limit on how far", 18, 690, { size: 13 }));
push(label("Summerlin can ever grow.", 18, 707, { size: 13 }));

push(label("Spring Mountains", 18, 330, { size: 15 }));
push(label("Toward the Strip →", W - 14, 560, { size: 15, anchor: "end" }));
push(label("US-95, downtown →", W - 14, 214, { size: 15, anchor: "end" }));

// 4. Road labels.
for (const r of ROAD_LABELS) {
  const at = anchorOnRoad(r.road, r.along, r.at);
  push(
    label(r.text, x(at.lon) + (r.dx ?? 0), y(at.lat) + (r.dy ?? 0), {
      size: r.size,
      weight: r.weight,
      fill: r.fill,
      anchor: r.anchor,
      rotate: r.rotate,
    })
  );
}

// 5. Villages.
const dot = (cx, cy, selling) =>
  selling
    ? '<circle cx="' + cx + '" cy="' + cy + '" r="6.5" fill="' + C.blue + '"/>'
    : '<circle cx="' + cx + '" cy="' + cy + '" r="6" fill="' + C.paper +
      '" stroke="' + C.blue + '" stroke-width="2.6"/>';

for (const v of VILLAGES) {
  const cx = x(v.lon);
  const cy = y(v.lat);
  push(dot(cx, cy, v.selling));
  if (v.also) push(dot(x(v.also.lon), y(v.also.lat), v.selling));
  push(
    label(v.name, cx + v.dx, cy + v.dy, {
      size: v.big ? 19 : 16,
      fill: C.black,
      weight: v.big ? 700 : 600,
      anchor: v.anchor,
    })
  );
}

// 6. Legend. Bottom-left, below the Red Rock note, in the one large clear
//    block of the frame. Carries the honesty note and the OSM attribution the
//    data license requires.
const LX = 14;
const LY = H - 236;
push(
  '<rect x="' + LX + '" y="' + LY + '" width="418" height="212" fill="' + C.paper +
  '" fill-opacity="0.95" stroke="' + C.light + '" stroke-width="1.5"/>'
);
push(label("HOW TO READ THIS MAP", LX + 18, LY + 28, { size: 13, fill: C.warm, weight: 700, spacing: 1.6 }));
push('<circle cx="' + (LX + 26) + '" cy="' + (LY + 52) + '" r="6.5" fill="' + C.blue + '"/>');
push(label("Selling new homes, August 2026", LX + 46, LY + 57, { size: 15, fill: C.black }));
push('<circle cx="' + (LX + 26) + '" cy="' + (LY + 80) + '" r="6" fill="' + C.paper + '" stroke="' + C.blue + '" stroke-width="2.6"/>');
push(label("Established village, resale only", LX + 46, LY + 85, { size: 15, fill: C.black }));
push(label("No Summerlin boundary is drawn here. It is a private", LX + 18, LY + 118, { size: 13 }));
push(label("master plan, not a city and not a census place, and its", LX + 18, LY + 135, { size: 13 }));
push(label("official border map belongs to Summerlin. Villages are", LX + 18, LY + 152, { size: 13 }));
push(label("plotted at real coordinates; the CC-215 is the line", LX + 18, LY + 169, { size: 13 }));
push(label("locals actually divide the community by.", LX + 18, LY + 186, { size: 13 }));

push(
  label("Roads and conservation-area boundary © OpenStreetMap contributors (ODbL)", LX + 2, H - 8, {
    size: 12,
  })
);

push(wordmark(W));

// --- write ------------------------------------------------------------------

const TITLE = "Summerlin Las Vegas: an LVINIT area map";
const DESC =
  "Map of Summerlin, Las Vegas, showing its villages plotted at their real locations along the western edge of " +
  "the valley. West of the CC-215 Beltway, in Summerlin West: Reverence, Kestrel, Kestrel Commons, La Madre " +
  "Peaks, Grand Park, Redpoint, Redpoint Square, The Vistas, The Paseos and Stonebridge. East of the beltway, in " +
  "Summerlin North: Sun City Summerlin, The Hills, The Trails, The Arbors and The Canyons. To the south: " +
  "Summerlin Centre, Downtown Summerlin, The Willows, The Ridges and The Cliffs. The CC-215 Beltway, Summerlin " +
  "Parkway, Charleston Boulevard, Sahara Avenue, Far Hills Avenue, Sky Vista Drive, Lake Mead Boulevard, " +
  "Cheyenne Avenue, Flamingo Road, Russell Road, Town Center Drive, Hualapai Way and Rampart Boulevard are " +
  "drawn, with the boundary of the Red Rock Canyon National Conservation Area running down the western side. " +
  "Villages currently selling new homes are marked with a solid dot. No Summerlin boundary line is drawn, " +
  "because the community is a private master plan with no public boundary.";

const svg = svgDocument({ W, H, title: TITLE, desc: DESC, parts });

const OUT = "public/images/maps/summerlin-las-vegas-map-lvinit.svg";
mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, svg, "utf8");
console.log("wrote " + OUT + "  (" + W + " x " + H + ")");
