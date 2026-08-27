// ---------------------------------------------------------------------------
// LVINIT AREA MAP — shared toolkit
//
// The parts every area map needs and none of them should reimplement: the
// projection, the brand palette, the label primitive with its halo, and the SVG
// document wrapper. The per-area generators
// (generate-area-map.mjs, generate-summerlin-map.mjs) own the geography and the
// composition; this file owns the mechanics.
//
// PROJECTION. Plain equirectangular, scaled by cos(36 N). Over the ~30 km
// windows these maps use, the distortion is negligible, so relative positions
// are trustworthy. Every coordinate that goes in is a real WGS84 lat/lon — no
// map is ever traced or eyeballed from someone else's artwork.
// ---------------------------------------------------------------------------

export const KM_PER_DEG_LAT = 111.0;
export const KM_PER_DEG_LON = 90.1; // 111.32 * cos(36 deg)

export function round(n) {
  return Math.round(n * 10) / 10;
}

/**
 * Build a projection for one map frame.
 * @param {{west:number,east:number,south:number,north:number}} bounds
 * @param {number} pxPerKm
 */
export function createProjection(bounds, pxPerKm) {
  const W = round((bounds.east - bounds.west) * KM_PER_DEG_LON * pxPerKm);
  const H = round((bounds.north - bounds.south) * KM_PER_DEG_LAT * pxPerKm);

  const x = (lon) => round((lon - bounds.west) * KM_PER_DEG_LON * pxPerKm);
  const y = (lat) => round((bounds.north - lat) * KM_PER_DEG_LAT * pxPerKm);
  /** [lon, lat][] -> "x,y x,y ..." */
  const pts = (coords) => coords.map(([lon, lat]) => x(lon) + "," + y(lat)).join(" ");

  return { W, H, x, y, pts, bounds, pxPerKm };
}

// --- palette (docs/02-visual-design-system.md) ------------------------------

export const C = {
  black: "#111111",
  warm: "#6E6A63",
  light: "#E8E6E1",
  blue: "#2B6CB0",
  gold: "#C8A46A",
  paper: "#FFFFFF",
  road: "#DAD7D1",
};

// Inter cannot load inside an <img>-embedded SVG, so name a real fallback
// stack rather than pretending the brand face will render.
export const FONT = "Inter, 'Helvetica Neue', Helvetica, Arial, sans-serif";

// --- text -------------------------------------------------------------------

export function esc(s) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/'/g, "&apos;");
}

/**
 * A map label. Painted with a paper-colored stroke *under* the glyphs
 * (`paint-order="stroke"`) so type sitting on a road or a boundary stays
 * readable without a solid box behind it.
 */
export function label(text, px, py, opts) {
  const o = opts || {};
  const size = o.size || 16;
  const fill = o.fill || C.warm;
  const anchor = o.anchor || "start";
  const weight = o.weight || 500;
  const spacing = o.spacing ? ' letter-spacing="' + o.spacing + '"' : "";
  const halo = o.halo ?? 3.5;
  // `rotate` spins the label about its own anchor point — used for north-south
  // arterials, which are a mile apart and would otherwise collide.
  const transform = o.rotate
    ? ' transform="rotate(' + o.rotate + " " + px + " " + py + ')"'
    : "";
  return (
    '<text x="' + px + '" y="' + py + '" font-family="' + FONT + '" font-size="' + size +
    '" font-weight="' + weight + '" fill="' + fill + '" text-anchor="' + anchor + '"' + spacing +
    transform +
    ' paint-order="stroke" stroke="' + C.paper + '" stroke-width="' + halo +
    '" stroke-linejoin="round">' +
    esc(text) + "</text>"
  );
}

// --- anchoring labels to real roads ------------------------------------------

/**
 * Find the point where a named road crosses a given latitude or longitude, so a
 * road label can be pinned to the road it actually names.
 *
 * WHY THIS EXISTS. The obvious way to place a road label — type an approximate
 * x and y — silently lies. The first draft of the Summerlin map put "Far Hills
 * Ave" neatly on top of Summerlin Parkway, because the two roads pass close and
 * the hand-typed latitude happened to land on the wrong one. Here you name the
 * road and ONE coordinate along it; the other coordinate is read out of the
 * road's own geometry, so the label cannot end up on a different road.
 *
 * The crossing is interpolated along the segment rather than snapped to a
 * vertex, because the committed paths are simplified to roughly 24 m and
 * consecutive vertices can be a kilometer apart.
 *
 * Throws rather than nudging if the road never reaches the given coordinate: a
 * label pinned where the road does not run is a silent lie about the geography,
 * and a build failure is much cheaper than a wrong map.
 *
 * @param {Array} roads  the `roads` array from a committed geometry file
 * @param {string} id    the road's id in that file
 * @param {"lat"|"lon"} along which coordinate is being specified
 * @param {number} at    the value of that coordinate
 * @returns {{lon:number, lat:number}}
 */
export function anchorOnRoad(roads, id, along, at) {
  const road = roads.find((r) => r.id === id);
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

  throw new Error(
    `road ${id} does not cross ${along} ${at} — nearest point is ${bestD.toFixed(4)} deg ` +
      `away at ${best?.[0]},${best?.[1]}`
  );
}

/** The LVI/NIT wordmark, top-right of the frame. */
export function wordmark(W, opts) {
  const o = opts || {};
  const y = o.y ?? 34;
  const size = o.size ?? 19;
  return [
    label("LVI", W - 78, y, { size, fill: C.black, weight: 800, spacing: 2 }),
    label("NIT", W - 42, y, { size, fill: C.gold, weight: 800, spacing: 2 }),
  ].join("\n");
}

/**
 * Wrap the drawn parts in a standalone, accessible SVG document.
 * `title`/`desc` are what a screen reader and an image-search crawler read, so
 * they describe the map's actual contents rather than saying "a map".
 */
export function svgDocument({ W, H, title, desc, parts }) {
  return (
    '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + W + " " + H + '" width="' + W +
    '" height="' + H + '" role="img" aria-labelledby="mapTitle mapDesc">\n' +
    '<title id="mapTitle">' + esc(title) + "</title>\n" +
    '<desc id="mapDesc">' + esc(desc) + "</desc>\n" +
    parts.join("\n") +
    "\n</svg>\n"
  );
}
