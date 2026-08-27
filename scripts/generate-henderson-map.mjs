// ---------------------------------------------------------------------------
// LVINIT HENDERSON AREA MAP
//
//   node scripts/prep-henderson-map-geometry.mjs   <- only when geography moves
//   node scripts/generate-henderson-map.mjs
//   node scripts/check-henderson-map.mjs           <- run this after, every time
//   -> public/images/maps/henderson-neighborhoods-map-lvinit.svg
//
// Third map in the same system as scripts/generate-area-map.mjs (Southwest) and
// scripts/generate-summerlin-map.mjs, on the shared toolkit in
// scripts/lib/area-map.mjs. Henderson poses a different mapping problem from
// either of them, so read this before editing.
//
// ---------------------------------------------------------------------------
// THIS MAP DRAWS A REAL BOUNDARY, AND THAT IS THE POINT
// ---------------------------------------------------------------------------
// The Summerlin map deliberately draws no boundary, because Summerlin is a
// private master plan with no public line. Henderson is the opposite case: an
// incorporated city with a surveyed, governmental, published municipal
// boundary. So the boundary is the hero of this map, and it comes from the
// City of Henderson's own GIS — see the header of
// scripts/prep-henderson-map-geometry.mjs for the exact service.
//
// The city's own figures, carried through the geometry file: 78,056.45 acres,
// 121.96 square miles. The outline is one outer ring plus 22 interior rings,
// which are unincorporated Clark County pockets the city grew around without
// annexing. All 22 are drawn (evenodd fill); most are far too small to see.
//
// THE SHAPE IS AWKWARD ON PURPOSE. The official boundary runs about 17.6 miles
// east to west against 16.1 miles north to south, reaches west across I-15 to
// Las Vegas Boulevard, and pushes a long arm southeast through empty desert
// toward Railroad Pass. It is not the tidy blob people picture. Nothing here
// smooths, trims or "cleans up" that outline to make a prettier graphic — the
// awkwardness IS the story the page is telling, and it is handled in the copy
// and the legend instead.
//
// ---------------------------------------------------------------------------
// FOUR MARKER TYPES, BECAUSE THESE NAMES ARE NOT THE SAME KIND OF THING
// ---------------------------------------------------------------------------
// A relocation buyer hears "Green Valley", "Ascaya", "Water Street" and "West
// Henderson" in the same sentence and reasonably assumes they are four items on
// one list. They are four different categories, and flattening them into
// identical dots would teach the exact confusion this guide exists to fix:
//
//   solid dot   master-planned community  (Green Valley, Anthem, Cadence, …)
//   open dot    custom-home development   (MacDonald Highlands, Ascaya)
//   square      commercial district       (Water Street / Downtown Henderson)
//   area type   city planning area        (West Henderson) — no marker at all,
//               because it has no center to put one on
//
// ---------------------------------------------------------------------------
// WHY ONLY SOME COMMUNITIES ARE PLOTTED
// ---------------------------------------------------------------------------
// Henderson contains far more named communities than fit legibly. The ones here
// are the names a relocation buyer actually encounters. Whitney Ranch, Tuscany,
// Sun City Anthem, Anthem Country Club, Sun City MacDonald Ranch, Calico Ridge,
// Mission Hills and Madeira Canyon are named in the page's map key instead. A
// map that can be read beats a complete one that can't.
//
// EVERY COORDINATE IS REAL. Community positions are OpenStreetMap place records
// at real WGS84 coordinates, and every one was point-in-polygon tested against
// the official city boundary before being plotted — see
// scripts/check-henderson-map.mjs, which re-runs that test on every build.
// Nothing here is eyeballed off someone else's artwork.
// ---------------------------------------------------------------------------

import { writeFileSync, mkdirSync, readFileSync } from "node:fs";
import { dirname } from "node:path";
import { pathToFileURL } from "node:url";
import {
  createProjection,
  svgDocument,
  wordmark,
  label,
  anchorOnRoad,
  C,
} from "./lib/area-map.mjs";

// --- frame ------------------------------------------------------------------
// West far enough to show I-15 and the Las Vegas Blvd edge of the city, east to
// the Lake Las Vegas end and the start of the Lake Mead National Recreation
// Area, north past the I-215 and the Whitney edge, south past Inspirada,
// Anthem and into the Sloan Canyon conservation area.
//
// The southern edge runs further south than the city does, deliberately. East
// of longitude -115.00 the city bottoms out around latitude 35.925, so the band
// below that is genuinely empty desert — which is where the legend goes. The
// alternative was laying the legend over the city's south-eastern arm, and a
// map that hides its own subject to make room for its key is a bad map.

export const BOUNDS = { west: -115.245, east: -114.88, south: 35.842, north: 36.15 };
export const PX_PER_KM = 30;

const { W, H, x, y, pts } = createProjection(BOUNDS, PX_PER_KM);

const GEO = JSON.parse(
  readFileSync(new URL("./data/henderson-map-geometry.json", import.meta.url), "utf8")
);

// --- communities ------------------------------------------------------------
//
// `kind` drives the marker and says what type of thing the name refers to:
//   mpc     master-planned community
//   custom  custom-home / hillside development
//   district commercial district
//
// Coordinates are OSM place records. `dx`/`dy` nudge the label clear of its own
// marker and of its neighbours; `anchor: "end"` sets the label to the left of
// the marker instead of the right. Verified by scripts/check-henderson-map.mjs.

export const COMMUNITIES = [
  // --- the established Green Valley core, west-center ---
  { name: "Green Valley", kind: "mpc", lon: -115.0822, lat: 36.042, dx: -16, dy: -4, anchor: "end" },
  { name: "Green Valley Ranch", kind: "mpc", lon: -115.0836, lat: 36.0205, dx: -16, dy: 6, anchor: "end" },
  { name: "Whitney Ranch", kind: "mpc", lon: -115.0462, lat: 36.0637, dx: 14, dy: -6 },

  // --- the southern hillside run ---
  { name: "Seven Hills", kind: "mpc", lon: -115.1172, lat: 35.9805, dx: -15, dy: 4, anchor: "end" },
  { name: "Anthem", kind: "mpc", lon: -115.0933, lat: 35.9545, dx: 14, dy: 18 },
  { name: "Inspirada", kind: "mpc", lon: -115.133, lat: 35.9403, dx: -15, dy: 5, anchor: "end" },
  { name: "MacDonald Highlands", kind: "custom", lon: -115.0446, lat: 36.0077, dx: 15, dy: -5 },
  { name: "Ascaya", kind: "custom", lon: -115.0574, lat: 35.9927, dx: 15, dy: 14 },

  // --- the eastern half ---
  { name: "Water Street", kind: "district", lon: -114.9831, lat: 36.0324, dx: 15, dy: 16 },
  { name: "Cadence", kind: "mpc", lon: -114.974, lat: 36.0582, dx: 15, dy: -6 },
  { name: "Lake Las Vegas", kind: "mpc", lon: -114.9316, lat: 36.1023, dx: -16, dy: 5, anchor: "end" },
];

// Road labels. Each names the road it belongs to and ONE coordinate along it;
// anchorOnRoad() reads the other coordinate straight out of the committed
// geometry, so a label always lands on its own road rather than on whatever
// happens to run past a hand-typed latitude. `dy`/`dx` then nudge it clear of
// the line itself.
export const ROAD_LABELS = [
  { road: "i11", along: "lat", at: 36.115, text: "I-11", size: 17, weight: 700, fill: C.black, dx: -12, anchor: "end" },
  // Set to the LEFT of the freeway: at this latitude I-11 is already close to
  // the right edge of the frame, and a start-anchored label runs off canvas.
  { road: "i11", along: "lat", at: 35.972, text: "I-11 · US-93 · US-95", size: 15, weight: 700, fill: C.black, dx: -12, dy: -6, anchor: "end" },
  { road: "i11", along: "lat", at: 35.966, text: "→ Railroad Pass, Boulder City", size: 13, dx: -12, dy: 16, anchor: "end" },
  { road: "i215", along: "lon", at: -115.14, text: "I-215", size: 17, weight: 700, fill: C.black, dy: -11 },
  { road: "i15", along: "lat", at: 35.99, text: "I-15", size: 17, weight: 700, fill: C.black, dx: 11 },
  { road: "st-rose", along: "lon", at: -115.14, text: "St. Rose Pkwy (SR-146)", size: 14, dy: -10 },
  { road: "boulder-hwy", along: "lat", at: 36.09, text: "Boulder Hwy (SR-582)", size: 14, dx: 12, dy: -6 },
  { road: "lake-mead-pkwy", along: "lon", at: -115.02, text: "Lake Mead Pkwy (SR-564)", size: 14, dy: -10 },
  { road: "horizon-ridge", along: "lon", at: -115.101, text: "Horizon Ridge Pkwy", size: 14, dy: -10 },
  { road: "green-valley-pkwy", along: "lat", at: 36.062, text: "Green Valley Pkwy", size: 13, rotate: -90, dx: -6 },
  { road: "eastern", along: "lat", at: 36.075, text: "Eastern Ave", size: 13, rotate: -90, dx: -6 },
  { road: "sunset", along: "lon", at: -115.19, text: "Sunset Rd", size: 14, dy: -9 },
  { road: "warm-springs", along: "lon", at: -115.19, text: "Warm Springs Rd", size: 14, dy: -9 },
  { road: "windmill", along: "lon", at: -115.2, text: "Windmill Ln", size: 14, dy: -9 },
  // NO LAS VEGAS BLVD LABEL, deliberately. Las Vegas Blvd and I-15 run parallel
  // and only 20-24px apart at this scale across almost the whole frame (40px at
  // the very top edge, where a rotated label would clip). There is no latitude
  // where a reader could tell which of the two a label belonged to, so the road
  // is drawn unlabeled and named in the page's map key instead. Labeling it
  // anyway would look more complete and read as a lie about which road is which.
  // Anthem Pkwy and College Dr run essentially north-south, so they are pinned
  // by latitude; a longitude would be inside their own width.
  { road: "anthem-pkwy", along: "lat", at: 35.972, text: "Anthem Pkwy", size: 13, dx: 10, dy: 4 },
  { road: "volunteer", along: "lat", at: 35.962, text: "Volunteer Blvd", size: 13, dx: -11, dy: 4, anchor: "end" },
  { road: "via-inspirada", along: "lon", at: -115.175, text: "Via Inspirada", size: 13, dy: 18 },
  { road: "llv-pkwy", along: "lon", at: -114.935, text: "Lake Las Vegas Pkwy", size: 13, dy: -10 },
  { road: "college", along: "lat", at: 36.005, text: "College Dr", size: 13, rotate: -90, dx: -6 },
];

// --- composition ------------------------------------------------------------

const parts = [];
const push = (s) => parts.push(s);

push('<rect width="' + W + '" height="' + H + '" fill="' + C.paper + '"/>');

// 1. Sloan Canyon NCA. A real federal boundary, so it gets the same treatment
//    Red Rock gets on the Summerlin map: a soft band under a solid stroke. It
//    is the reason Henderson stops climbing the McCullough Range in the south.
//    Only the long runs are drawn; short stubs clipping the frame edge read as
//    stray marks rather than as a boundary.
const SLOAN = GEO.sloanCanyonNca.filter((path) => {
  let km = 0;
  for (let i = 1; i < path.length; i++) {
    km += Math.hypot(
      (path[i][0] - path[i - 1][0]) * 90.1,
      (path[i][1] - path[i - 1][1]) * 111
    );
  }
  return km >= 3;
});

for (const path of SLOAN) {
  push(
    '<polyline points="' + pts(path) + '" fill="none" stroke="' + C.gold +
    '" stroke-opacity="0.13" stroke-width="13" stroke-linecap="round" stroke-linejoin="round"/>'
  );
}
for (const path of SLOAN) {
  push(
    '<polyline points="' + pts(path) + '" fill="none" stroke="' + C.gold +
    '" stroke-opacity="0.85" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>'
  );
}

// 2. THE CITY BOUNDARY. One path, all rings, fill-rule evenodd so the
//    unincorporated county pockets inside the city read as holes rather than
//    being quietly filled over. Tinted fill under a solid stroke: this is a
//    real government line and it is allowed to look like one.
const ringPath = (ring) =>
  "M" + ring.map(([lon, lat]) => x(lon) + "," + y(lat)).join("L") + "Z";

const cityPath = GEO.city.rings.map(ringPath).join(" ");
const outerPath = ringPath(GEO.city.rings[0]);
const holesPath = GEO.city.rings.slice(1).map(ringPath).join(" ");

push(
  '<path d="' + cityPath + '" fill-rule="evenodd" fill="' + C.blue +
  '" fill-opacity="0.05" stroke="none"/>'
);

// 3. Roads: arterials first, freeways over them with a paper casing, everything
//    under the boundary stroke so the city line stays the strongest edge.
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
        (pass === "casing" ? 7.5 : 3) +
        '" stroke-linecap="round" stroke-linejoin="round"/>'
      );
    }
  }
}

// 4. Lake Las Vegas. Small at this scale, but it is the one piece of open water
//    in the valley and the single fastest way to find that end of the city.
for (const ring of GEO.lakeLasVegas) {
  push(
    '<polygon points="' + pts(ring) + '" fill="' + C.blue +
    '" fill-opacity="0.35" stroke="' + C.blue + '" stroke-opacity="0.5" stroke-width="1"/>'
  );
}

// 5. The city boundary stroke, drawn last of the geography so nothing crosses
//    over it. The city limits get the full weight; the unincorporated pockets
//    inside get a hairline. Stroked at the same 2.6px, the smallest pockets are
//    barely wider than the stroke itself and render as solid blue chips that
//    read as stray marks rather than as holes. Thinner is not quieter here, it
//    is more accurate: these are gaps in the city, and they should look like
//    gaps.
push(
  '<path d="' + outerPath + '" fill="none" stroke="' + C.blue +
  '" stroke-width="2.6" stroke-linejoin="round"/>'
);
push(
  '<path d="' + holesPath + '" fill="none" stroke="' + C.blue +
  '" stroke-opacity="0.55" stroke-width="1.1" stroke-linejoin="round"/>'
);

// 6. Region type. Sloan Canyon sits in the empty south-west, on the ground it
//    describes. The Lake Mead and Strip notes are directional rather than
//    placed, because neither is inside this frame.
push(label("SLOAN CANYON", 16, 888, { size: 18, fill: C.gold, weight: 700, spacing: 2.2 }));
push(label("National Conservation Area", 16, 910, { size: 14 }));
push(label("Federal land, managed by the BLM.", 16, 936, { size: 12 }));
push(label("The gold line is its boundary, and", 16, 952, { size: 12 }));
push(label("the southern limit on how far", 16, 968, { size: 12 }));
push(label("Henderson can grow.", 16, 984, { size: 12 }));

push(label("McCullough Range", 330, 956, { size: 14 }));

// Map title. The guide gives this map a heading of its own, but the SVG also
// ships as a standalone file and gets found on its own in image search, where
// nothing around it says what it is.
push(label("HENDERSON, NEVADA", 16, 46, { size: 22, fill: C.black, weight: 800, spacing: 2.4 }));
push(label("The official city limits, and the communities inside them", 16, 70, { size: 14 }));
push(label("← The Strip, airport", 16, 430, { size: 14 }));
push(label("← Southwest Las Vegas", 16, 500, { size: 14 }));
push(label("Lake Mead National", W - 14, 250, { size: 14, anchor: "end" }));
push(label("Recreation Area →", W - 14, 268, { size: 14, anchor: "end" }));

// WEST HENDERSON gets an area type and no marker, because it is a City of
// Henderson planning area rather than a community — there is no center to put a
// dot on, and giving it one would make it look like a subdivision.
push(label("WEST", 260, 616, { size: 17, fill: C.warm, weight: 700, spacing: 2 }));
push(label("HENDERSON", 260, 636, { size: 17, fill: C.warm, weight: 700, spacing: 2 }));
push(label("a city planning area,", 260, 656, { size: 12 }));
push(label("not a community", 260, 671, { size: 12 }));

// 7. Road labels, each pinned to its own road's geometry.
for (const r of ROAD_LABELS) {
  const at = anchorOnRoad(GEO.roads, r.road, r.along, r.at);
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

// 8. Communities.
const marker = (cx, cy, kind) => {
  if (kind === "district") {
    return (
      '<rect x="' + (cx - 5.5) + '" y="' + (cy - 5.5) + '" width="11" height="11" fill="' +
      C.blue + '"/>'
    );
  }
  if (kind === "custom") {
    return (
      '<circle cx="' + cx + '" cy="' + cy + '" r="6" fill="' + C.paper +
      '" stroke="' + C.blue + '" stroke-width="2.6"/>'
    );
  }
  return '<circle cx="' + cx + '" cy="' + cy + '" r="6.5" fill="' + C.blue + '"/>';
};

for (const c of COMMUNITIES) {
  const cx = x(c.lon);
  const cy = y(c.lat);
  push(marker(cx, cy, c.kind));
  push(
    label(c.name, cx + c.dx, cy + c.dy, {
      size: 16,
      fill: C.black,
      weight: 600,
      anchor: c.anchor,
    })
  );
}

// 9. Legend. Bottom-right, in the largest clear block of the frame — south-east
//    of the city, where the only thing on the map is empty desert toward
//    Railroad Pass. Carries the marker key, the honesty note about what the
//    boundary is, and the attribution the OSM license requires.
const LW = 384;
const LX = W - LW - 14;
const LY = H - 240;
push(
  '<rect x="' + LX + '" y="' + LY + '" width="' + LW + '" height="222" fill="' + C.paper +
  '" fill-opacity="0.95" stroke="' + C.light + '" stroke-width="1.5"/>'
);
push(label("HOW TO READ THIS MAP", LX + 18, LY + 26, { size: 12, fill: C.warm, weight: 700, spacing: 1.6 }));

push('<circle cx="' + (LX + 25) + '" cy="' + (LY + 48) + '" r="6.5" fill="' + C.blue + '"/>');
push(label("Master-planned community", LX + 44, LY + 53, { size: 14, fill: C.black }));

push('<circle cx="' + (LX + 25) + '" cy="' + (LY + 73) + '" r="6" fill="' + C.paper + '" stroke="' + C.blue + '" stroke-width="2.6"/>');
push(label("Custom-home development", LX + 44, LY + 78, { size: 14, fill: C.black }));

push('<rect x="' + (LX + 19.5) + '" y="' + (LY + 92.5) + '" width="11" height="11" fill="' + C.blue + '"/>');
push(label("Commercial district", LX + 44, LY + 103, { size: 14, fill: C.black }));

push('<rect x="' + (LX + 18) + '" y="' + (LY + 118) + '" width="14" height="10" fill="' + C.blue + '" fill-opacity="0.05" stroke="' + C.blue + '" stroke-width="2"/>');
push(label("City of Henderson limits", LX + 44, LY + 128, { size: 14, fill: C.black }));

push(label("The blue outline is the official City of Henderson", LX + 18, LY + 154, { size: 12 }));
push(label("boundary, from the city's own GIS. The polygon drawn", LX + 18, LY + 169, { size: 12 }));
push(label("here measures " + GEO.city.sqMiles.toFixed(2) + " sq mi. Gaps inside it are", LX + 18, LY + 184, { size: 12 }));
push(label("unincorporated county pockets. Nothing is smoothed.", LX + 18, LY + 199, { size: 12 }));

push(
  label(
    "City boundary © City of Henderson GIS · roads, Sloan Canyon and the lake © OpenStreetMap contributors (ODbL)",
    LX + LW,
    H - 8,
    { size: 11, anchor: "end" }
  )
);

push(wordmark(W));

// --- write ------------------------------------------------------------------

const TITLE = "Henderson, Nevada neighborhoods: an LVINIT area map";
const DESC =
  "Map of Henderson, Nevada, showing the official City of Henderson municipal boundary with its " +
  "communities plotted at their real locations. Henderson is an incorporated city of about 122 " +
  "square miles on the south-east side of the Las Vegas Valley, running roughly 17 miles east to " +
  "west. Master-planned communities shown: Green Valley and Green Valley Ranch in the established " +
  "center, Whitney Ranch to the north, Seven Hills, Anthem and Inspirada across the southern " +
  "hillsides, Cadence in the east and Lake Las Vegas in the north-east. MacDonald Highlands and " +
  "Ascaya are marked as custom-home developments, and the Water Street District is marked as " +
  "Henderson's downtown commercial district. West Henderson is labeled as a city planning area " +
  "rather than a community. Roads drawn include Interstate 11 with US-93 and US-95, Interstate " +
  "215, Interstate 15, St. Rose Parkway (SR-146), Boulder Highway (SR-582), Lake Mead Parkway " +
  "(SR-564), Horizon Ridge Parkway, Green Valley Parkway, Eastern Avenue, Sunset Road, Warm " +
  "Springs Road, Windmill Lane, Las Vegas Boulevard, Anthem Parkway, Volunteer Boulevard, Lake " +
  "Las Vegas Parkway and College Drive. The boundary of the Sloan Canyon National Conservation " +
  "Area runs along the southern edge, and the Lake Mead National Recreation Area lies to the east.";

const svg = svgDocument({ W, H, title: TITLE, desc: DESC, parts });

export const OUT = "public/images/maps/henderson-neighborhoods-map-lvinit.svg";

// Only WRITE when run directly. scripts/check-henderson-map.mjs imports this
// module for COMMUNITIES / ROAD_LABELS / BOUNDS rather than keeping a second
// copy of them that could quietly drift out of step with the map it checks.
const invokedAs = process.argv[1] ? pathToFileURL(process.argv[1]).href : "";
if (import.meta.url === invokedAs) {
  mkdirSync(dirname(OUT), { recursive: true });
  writeFileSync(OUT, svg, "utf8");
  console.log("wrote " + OUT + "  (" + W + " x " + H + ")");
}
