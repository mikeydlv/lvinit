// ---------------------------------------------------------------------------
// DESCRIBE — turn a file + its probe into something a producer can use
//
// "What is this clip?" answered from facts on disk only: folder, file name,
// camera tag, dimensions, duration, capture time. No vision, no guessing at
// what's in the frame. A clip named DJI_0285.MP4 in "Mesa Ridge park" is
// described as a drone clip at Mesa Ridge Park, and nothing more.
//
// Camera detection uses the encoder tag, not the file name: on Mikey's gear a
// DJI_YYYYMMDD… file can be the Mini 5 Pro drone OR the Osmo Pocket 3.
// ---------------------------------------------------------------------------

import { createHash } from "node:crypto";

import { norm } from "./privacy.mjs";
import { mediaType } from "./scan.mjs";

export function stableId(relPath) {
  return createHash("sha1").update(norm(relPath).toLowerCase()).digest("hex").slice(0, 10);
}

function longestPrefix(map, relPath) {
  const p = norm(relPath).toLowerCase();
  let best = null;
  for (const [prefix, value] of Object.entries(map)) {
    const k = prefix.toLowerCase();
    if ((p === k || p.startsWith(k + "/")) && (!best || k.length > best.k.length)) best = { k, prefix, value };
  }
  return best ? { prefix: best.prefix, ...best.value } : null;
}

export function detectCamera({ name, encoder, relPath }) {
  const enc = String(encoder ?? "");
  if (/mini ?\d|mavic|\bair ?\d|avata|\bfpv\b|matrice|phantom/i.test(enc)) return "drone";
  if (/osmo ?pocket|osmopocket|osmo ?action|osmoaction/i.test(enc)) return "handheld";
  if (/^\d{8}_\d{6}/.test(name)) return "phone";
  if (/^DJI_\d{4}\./i.test(name)) return "drone"; // legacy DJI drone naming
  // An edited export ("…Drone Tour of…mp4") is a finished cut, whatever its name says.
  if (/lavf|davinci|blackmagic|premiere|capcut|opus/i.test(enc)) return "edited";
  if (norm(relPath).split("/").some((s) => /^drone$/i.test(s)) || /\bdrone\b|flyover|aerial/i.test(name)) return "drone";
  return "unknown";
}

export function orientationOf(width, height) {
  if (!width || !height) return null;
  const r = width / height;
  if (r < 0.9) return "vertical";
  if (r > 1.1) return "horizontal";
  return "square";
}

/** "gvr-the-district-walkthrough.MP4" → "gvr the district walkthrough". Camera-default names → null. */
export function subjectOf(name) {
  const stem = name.replace(/\.[^.]+$/, "");
  if (/^(DJI_[\d_]+(_D)?|\d{8}_\d{6}|IMG_\d+|MVI_\d+|GX\d+|PXL_[\d_]+|ai-expand.*|Short-#?\d+|drive|intro|outro|unpack)$/i.test(stem)) return null;
  const s = stem
    .replace(/\.(mp4|mov|m)$/i, "")
    .replace(/[_=]+/g, " ")
    .replace(/-/g, " ")
    .replace(/\s*\(\d+\)$/, "")
    .replace(/\s+\d$/, "")
    .replace(/\s+/g, " ")
    .trim();
  return s.length >= 3 ? s : null;
}

/** Hour in Las Vegas → a bucket a producer thinks in. */
export function timeOfDay(iso) {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  const h = Number(new Intl.DateTimeFormat("en-US", { timeZone: "America/Los_Angeles", hour: "numeric", hour12: false }).format(d)) % 24;
  if (h < 5 || h >= 20) return "night";
  if (h < 8) return "sunrise";
  if (h < 11) return "morning";
  if (h < 15) return "midday";
  if (h < 17) return "afternoon";
  return "golden-hour";
}

function pacificDate(d) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Los_Angeles", year: "numeric", month: "2-digit", day: "2-digit" }).format(d);
}

export function captureDate({ creationTime, name, mtimeMs }) {
  if (creationTime) {
    const d = new Date(creationTime);
    // Edited exports often carry 1904/1970 epochs or the export time; only trust plausible camera dates.
    if (!Number.isNaN(d.getTime()) && d.getUTCFullYear() >= 2015) return { date: pacificDate(d), source: "camera" };
  }
  const m = name.match(/(20\d{2})(\d{2})(\d{2})[_]?\d{6}/);
  if (m) return { date: `${m[1]}-${m[2]}-${m[3]}`, source: "filename" };
  return { date: mtimeMs ? pacificDate(new Date(mtimeMs)) : null, source: "file-modified" };
}

function roleOf({ top, type, name, camera, durationSec, orientation, relPath, project }) {
  const lower = name.toLowerCase();
  const inFolder = (re) => norm(relPath).split("/").slice(0, -1).some((s) => re.test(s));
  if (type === "document") return project ? "script" : "document";
  if (type === "image") {
    if (/thumbnail|cover|banner/.test(lower)) return "thumbnail";
    if (top === "Images") return "library-photo";
    if (top === "Graphics" || /\.png$/.test(lower) || inFolder(/chapter|placeholder/i)) return "graphic";
    return "photo";
  }
  // video
  if (/a-?roll|selfie|home-office|^intro\.|^outro\./.test(lower) || inFolder(/a&b roll|a-roll/i)) return "a-roll";
  if (top === "Videos" && (camera === "edited" || camera === "unknown")) {
    // A Short is vertical. A landscape export sitting in a Shorts folder is a cut.
    const shortish = /short|clip/.test(lower) || inFolder(/shorts|opusclip/i);
    if (orientation === "horizontal" && shortish) return "cut";
    if (shortish || (orientation === "vertical" && (durationSec ?? 999) <= 180)) return "short";
    if ((durationSec ?? 0) >= 150) return "long-form";
    return "cut";
  }
  return "b-roll";
}

/** One catalog entry. Includes privacy status; sanitize.mjs decides what leaves the PC. */
export function describe(file, probe, privacyResult, config) {
  const rel = norm(file.rel);
  const name = rel.split("/").pop();
  const top = rel.split("/")[0];
  const type = mediaType(file.ext, config);
  const p = probe && !probe.error ? probe : {};
  const camera = type === "video" ? detectCamera({ name, encoder: p.encoder, relPath: rel }) : type === "image" && /^DJI_/i.test(name) ? "drone" : type === "image" && /^\d{8}_\d{6}/.test(name) ? "phone" : null;
  const orientation = orientationOf(p.width, p.height);
  const place = longestPrefix(config.areas, rel);
  const project = longestPrefix(config.projects, rel);
  const when = captureDate({ creationTime: p.creationTime, name, mtimeMs: file.mtimeMs });
  return {
    id: stableId(rel),
    path: rel,
    folder: rel.split("/").slice(0, -1).join("/"),
    type,
    role: roleOf({ top, type, name, camera, durationSec: p.durationSec, orientation, relPath: rel, project }),
    camera,
    orientation,
    width: p.width ?? null,
    height: p.height ?? null,
    fps: p.fps ?? null,
    durationSec: type === "video" ? p.durationSec ?? null : null,
    captureDate: when.date,
    captureDateSource: when.source,
    timeOfDay: when.source === "camera" ? timeOfDay(p.creationTime) : null,
    area: project?.area ?? place?.area ?? null,
    place: place?.label ?? null,
    caution: place?.caution ?? null,
    project: project ? { folder: project.prefix, youtubeId: project.youtubeId } : null,
    subject: subjectOf(name),
    sizeMB: Math.round((file.size / 1_048_576) * 10) / 10,
    probeError: probe?.error ?? null,
    privacy: privacyResult,
    _dupKey: `${name.toLowerCase()}|${file.size}`,
  };
}

/** Same file copied into several folders (e.g. a 215 clip in Media/215 and Media/Henderson). */
export function markDuplicates(entries) {
  const first = new Map();
  for (const e of entries) {
    if (first.has(e._dupKey)) e.duplicateOf = first.get(e._dupKey);
    else first.set(e._dupKey, e.id);
  }
  return entries;
}
