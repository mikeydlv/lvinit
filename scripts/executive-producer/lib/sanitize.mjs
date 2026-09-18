// ---------------------------------------------------------------------------
// SANITIZE — the only thing that leaves the PC
//
// Builds the public footage catalog from PUBLIC entries only, copying a fixed
// whitelist of fields. Then a leak guard reads the serialized result and
// refuses to hand it back if it finds anything that should never leave:
// coordinates, location keys, absolute paths, or the name/path of any
// excluded or local-only item.
//
// If the guard trips, nothing is written or pushed. That is deliberate.
// ---------------------------------------------------------------------------

import { AGENT, SCHEMA_VERSION } from "../config.mjs";

const FIELDS = [
  "id", "path", "folder", "type", "role", "camera", "orientation", "width", "height", "fps",
  "durationSec", "captureDate", "timeOfDay", "area", "place", "project", "subject", "caution", "duplicateOf",
];

function pick(e, publicIds) {
  const out = {};
  for (const f of FIELDS) {
    if (e[f] === null || e[f] === undefined) continue;
    if (f === "duplicateOf" && !publicIds.has(e[f])) continue;
    out[f] = e[f];
  }
  return out;
}

const round1 = (n) => Math.round(n * 10) / 10;

/** Per-folder summary: what a producer scans first. */
export function summarizeFolders(entries) {
  const byFolder = new Map();
  for (const e of entries) {
    if (!byFolder.has(e.folder)) byFolder.set(e.folder, []);
    byFolder.get(e.folder).push(e);
  }
  return [...byFolder.entries()]
    .map(([folder, list]) => {
      const vids = list.filter((e) => e.type === "video" && !e.duplicateOf);
      const count = (pred) => vids.filter(pred).length;
      const dates = list.map((e) => e.captureDate).filter(Boolean).sort();
      const subjects = [...new Set(list.map((e) => e.subject).filter(Boolean))].slice(0, 25);
      return {
        folder,
        area: list.find((e) => e.area)?.area ?? null,
        place: list.find((e) => e.place)?.place ?? null,
        caution: list.find((e) => e.caution)?.caution ?? null,
        project: list.find((e) => e.project)?.project ?? null,
        videos: vids.length,
        photos: list.filter((e) => e.type === "image" && (e.role === "photo" || e.role === "library-photo")).length,
        graphics: list.filter((e) => e.type === "image" && (e.role === "graphic" || e.role === "thumbnail")).length,
        minutes: round1(vids.reduce((s, e) => s + (e.durationSec ?? 0), 0) / 60),
        drone: count((e) => e.camera === "drone"),
        handheld: count((e) => e.camera === "handheld"),
        vertical: count((e) => e.orientation === "vertical"),
        roles: Object.fromEntries(
          [...new Set(list.map((e) => e.role))].map((r) => [r, list.filter((e) => e.role === r && !e.duplicateOf).length]),
        ),
        goldenHour: count((e) => e.timeOfDay === "golden-hour" || e.timeOfDay === "sunrise"),
        dateRange: dates.length ? [dates[0], dates[dates.length - 1]] : null,
        subjects,
      };
    })
    .sort((a, b) => a.folder.localeCompare(b.folder));
}

export function buildPublicCatalog(entries, { generatedAt, excludedFolders }) {
  const pub = entries.filter((e) => e.privacy?.status === "public");
  const publicIds = new Set(pub.map((e) => e.id));
  const items = pub.map((e) => pick(e, publicIds));
  const localOnly = entries.filter((e) => e.privacy?.status === "local-only").length;
  return {
    schema_version: SCHEMA_VERSION,
    agent: AGENT,
    kind: "footage-catalog",
    generatedAt,
    note: "Sanitized catalog of Mikey's first-party LVINIT footage. Metadata only: no media, no GPS, no private folders.",
    totals: {
      public: items.length,
      videos: items.filter((e) => e.type === "video").length,
      videoMinutes: round1(items.filter((e) => e.type === "video" && !e.duplicateOf).reduce((s, e) => s + (e.durationSec ?? 0), 0) / 60),
      // Counts only. What they are stays on the PC.
      heldLocalOnly: localOnly,
      excludedFolders,
    },
    folders: summarizeFolders(items),
    items,
  };
}

const COORDS = [
  /[+-]\d{1,2}\.\d{3,}[+-]\d{1,3}\.\d{3,}/, // ISO 6709 "+36.1699-115.1398"
  /-?\b\d{1,3}\.\d{5,}\s*,\s*-?\d{1,3}\.\d{5,}\b/, // "36.16994, -115.13983"
];
const KEYS = /"(gps[a-z_]*|location|latitude|longitude|lat|lon|lng|iso6709|geo[a-z_]*|com\.apple\.quicktime\.location[^"]*)"\s*:/i;
// A drive letter ("C:\\", "C:/") or a home directory. The lookbehind and the
// single-slash rule keep "https://" from counting as a drive path.
const ABSOLUTE = /(?<![A-Za-z])[A-Za-z]:(?:\\\\|\/(?!\/))|\/Users\/|\/home\//;

/**
 * Throw if the serialized catalog contains anything private. `privateTerms`
 * are the excluded folder names plus every local-only path and file name.
 */
export function assertNoLeaks(serialized, privateTerms) {
  const problems = [];
  for (const re of COORDS) if (re.test(serialized)) problems.push("contains something that looks like GPS coordinates");
  if (KEYS.test(serialized)) problems.push("contains a location/GPS field");
  if (ABSOLUTE.test(serialized)) problems.push("contains an absolute file path");
  const hay = serialized.toLowerCase();
  for (const term of privateTerms) {
    const t = String(term).toLowerCase().trim();
    if (t.length >= 4 && hay.includes(t)) problems.push(`mentions a private item (${t.length} chars, withheld)`);
  }
  if (problems.length) {
    const err = new Error(`Leak guard refused the sanitized catalog:\n  - ${[...new Set(problems)].join("\n  - ")}`);
    err.code = "LEAK_GUARD";
    throw err;
  }
  return true;
}

/** Everything the guard must never see in public output. */
export function privateTermsFor(entries, privacy) {
  // A held item whose exact name is ALSO a public file or folder name (an
  // editor's nested export folder named after the Short inside it) reveals
  // nothing by that name, so it isn't a leak term. Anything merely containing
  // a private name is still caught.
  const publicNames = new Set();
  for (const e of entries) {
    if (e.privacy?.status !== "public") continue;
    for (const seg of e.path.split("/")) {
      publicNames.add(seg.toLowerCase());
      publicNames.add(seg.replace(/\.[^.]+$/, "").toLowerCase());
    }
  }
  const terms = new Set(privacy.excluded);
  const add = (t) => {
    if (t && !publicNames.has(String(t).toLowerCase())) terms.add(t);
  };
  for (const h of privacy.localOnly) add(h.path);
  for (const e of entries) {
    if (e.privacy?.status === "public") continue;
    add(e.path);
    // The file name alone too, unless it's a generic camera name that public clips share.
    const name = e.path.split("/").pop();
    if (!/^(DJI_[\d_]+(_D)?|\d{8}_\d{6})\.[a-z0-9]+$/i.test(name)) {
      add(name);
      // …and without its extension, since the catalog's `subject` drops it.
      add(name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " "));
    }
    const pending = e.privacy?.pendingFolder;
    if (pending) {
      add(pending);
      // The unapproved folder's own name, which is what could identify someone.
      add(pending.split("/").pop());
    }
  }
  return [...terms].filter(Boolean);
}
