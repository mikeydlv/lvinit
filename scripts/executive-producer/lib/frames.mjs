// ---------------------------------------------------------------------------
// FRAMES — choose the exact image for every slide, unattended
//
// The plan names a source (a clip, a still, or a folder of stills) and what the
// slide should show. This module:
//
//   1. builds candidates locally: evenly spaced frames from a clip, or the
//      stills in a folder (never from held/excluded files: only paths in the
//      approved public catalog are accepted)
//   2. scores them locally: sharpness, a calm band where the text will sit,
//      and distance from every image already used this week (perceptual hash)
//   3. if vision is enabled, sends ONE low-resolution contact sheet of the top
//      candidates to Claude to pick the one that actually shows the subject
//      and has no house numbers, plates, builder signs or close-up faces
//
// Returns { src: { path, t? }, focus, reason } per slide.
// ---------------------------------------------------------------------------

import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";

import { dhash, hamming } from "./gate.mjs";

const IMG = /\.(jpe?g|png|webp)$/i;
// Graphics with their own printed text (maps, rate cards, charts, chapter cards)
// fight the white slide text and can contradict it. Never slide backgrounds.
export const TEXT_GRAPHIC = /(^|[^a-z])(map|maps|chart|rates?|card|infographic|graphic|logo|thumbnail|plate|exhibit|hero)([^a-z]|$)/i;
const usable = (c) => (c.type === "image" ? IMG.test(c.path) && c.role !== "graphic" && c.role !== "thumbnail" && !TEXT_GRAPHIC.test(c.path) : c.role === "b-roll");

export function durationOf(abs) {
  return Number(execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", abs]).toString().trim());
}

/** Candidate sources for one slide request. `catalog` is the PUBLIC catalog (only approved items). */
export function candidatesFor(want, catalog, mediaRoot, n = 8) {
  const items = catalog.items.filter((c) => !c.duplicateOf && !(want.exclude ?? []).includes(c.path));
  const norm = (p) => String(p).replace(/\\/g, "/").toLowerCase();
  const target = norm(want.clip ?? want.still ?? want.folder ?? "");
  const exact = items.find((c) => norm(c.path) === target);
  if (exact?.type === "video") {
    const dur = exact.durationSec ?? durationOf(join(mediaRoot, exact.path));
    return Array.from({ length: n }, (_, i) => ({ path: exact.path, t: Math.round(((dur * (i + 0.5)) / n) * 10) / 10 }));
  }
  if (exact && usable(exact)) return [{ path: exact.path }];
  const inFolder = items.filter((c) => norm(c.folder) === target && usable(c));
  const out = [];
  for (const c of inFolder) {
    if (c.type === "image") out.push({ path: c.path });
    else out.push({ path: c.path, t: Math.round(((c.durationSec ?? 10) / 2) * 10) / 10 });
  }
  if (out.length) return out; // the whole folder; chooseFrame filters first, then samples
  // The plan named something that isn't a real path (e.g. a subject line as a
  // file name). Resolve it to the closest approved item instead of failing.
  const near = closestItems(want, items);
  if (!near.length) throw new Error(`No approved footage matches "${want.clip ?? want.still ?? want.folder}".`);
  return near.flatMap((c) => (c.type === "video" ? [0.25, 0.5, 0.75].map((f) => ({ path: c.path, t: Math.round((c.durationSec ?? 10) * f * 10) / 10 })) : [{ path: c.path }]));
}

const STOP = new Set("the and for with from into las vegas lvinit livinit images image photo jpg jpeg png webp mov mp4 folder clip still shot view".split(" "));
const wordsOf = (s) => new Set(String(s ?? "").toLowerCase().replace(/[^a-z0-9]+/g, " ").split(" ").filter((w) => w.length > 2 && !STOP.has(w)));

/** Approved items whose path/subject best match the requested path and "want" (at least two shared words). */
export function closestItems(want, items, n = 6) {
  const target = wordsOf(`${want.clip ?? want.still ?? want.folder ?? ""} ${want.want ?? ""}`);
  const named = wordsOf(want.clip ?? want.still ?? want.folder ?? "");
  return items
    .filter(usable)
    .map((c) => {
      const w = wordsOf(`${c.path} ${c.subject ?? ""} ${c.place ?? ""}`);
      // Words from the named path count double: they're the plan's explicit intent.
      const score = [...target].filter((x) => w.has(x)).length + [...named].filter((x) => w.has(x)).length;
      return { c, score };
    })
    .filter((x) => x.score >= 2)
    .sort((a, b) => b.score - a.score)
    .slice(0, n)
    .map((x) => x.c);
}

/** Local score: sharp, calm where text goes, and not like anything already used. */
export async function scoreLocally(sharp, buf, usedHashes, textBand = "top") {
  const W = 216;
  const H = 270;
  const small = await sharp(buf).resize(W, H, { fit: "cover" }).grayscale().raw().toBuffer();
  let lap = 0;
  for (let y = 1; y < H - 1; y++) {
    for (let x = 1; x < W - 1; x++) {
      const i = y * W + x;
      const v = 4 * small[i] - small[i - 1] - small[i + 1] - small[i - W] - small[i + W];
      lap += v * v;
    }
  }
  const sharpness = lap / (W * H);
  const band = textBand === "bottom" ? [Math.floor(H * 0.62), Math.floor(H * 0.9)] : [Math.floor(H * 0.04), Math.floor(H * 0.34)];
  let sum = 0;
  let sq = 0;
  let n = 0;
  for (let y = band[0]; y < band[1]; y++) for (let x = 0; x < W; x++) {
    const v = small[y * W + x];
    sum += v;
    sq += v * v;
    n++;
  }
  const mean = sum / n;
  const std = Math.sqrt(Math.max(0, sq / n - mean * mean));
  const h = await dhash(sharp, buf);
  const nearest = usedHashes.length ? Math.min(...usedHashes.map((u) => hamming(u, h))) : 64;
  // White text wants a band that is not blinding and not busy.
  const bandScore = (mean > 225 ? -2 : 0) + (std > 55 ? -1.5 : std < 35 ? 1 : 0);
  const score = Math.min(3, Math.log10(1 + sharpness)) + bandScore + (nearest <= 8 ? -10 : nearest <= 14 ? -2 : 0);
  return { score, sharpness: Math.round(sharpness), bandMean: Math.round(mean), bandStd: Math.round(std), hash: h };
}

/**
 * Pick a frame for one slide. `loadCrop(src, focus)` returns the cropped
 * 1080x1350 buffer (from render.mjs), `pick` is the optional vision picker.
 */
/** "20260715_124601.jpg" → seconds since midnight, for burst detection. */
function shotSeconds(path) {
  const m = String(path).match(/(\d{8})_(\d{2})(\d{2})(\d{2})/);
  return m ? { day: m[1], s: Number(m[2]) * 3600 + Number(m[3]) * 60 + Number(m[4]) } : null;
}

/**
 * Variety rules the hash can miss: frames from the same clip must be far
 * apart in time, and photos shot within 12 s of a used photo (burst shots of
 * the same scene) are skipped.
 */
export function tooClose(c, usedSources, durations = {}, { burst = true } = {}) {
  for (const u of usedSources) {
    // A reserved photo belongs to the slide that named it: folder picks can't take it.
    if (u.path === c.path && u.reserved) {
      if (burst) return true;
      continue;
    }
    if (u.path === c.path) {
      if (c.t === undefined || u.t === undefined) return true;
      const gap = Math.max(8, (durations[c.path] ?? 0) * 0.2);
      if (Math.abs(c.t - u.t) < gap) return true;
    }
    const a = shotSeconds(c.path);
    const b = shotSeconds(u.path);
    if (burst && a && b && a.day === b.day && c.path !== u.path && Math.abs(a.s - b.s) <= 12 && c.path.split("/").slice(0, -1).join("/") === u.path.split("/").slice(0, -1).join("/")) return true;
  }
  return false;
}

export async function chooseFrame({ want, catalog, mediaRoot, sharp, loadCrop, usedHashes, usedSources = [], pick, textBand }) {
  const durations = Object.fromEntries(catalog.items.filter((c) => c.durationSec).map((c) => [c.path, c.durationSec]));
  // Burst rule only when the system is choosing; a still the plan named on purpose is kept.
  const cands = candidatesFor(want, catalog, mediaRoot).filter((c) => !tooClose(c, usedSources, durations, { burst: !want.still }));
  if (!cands.length) return { error: `Every candidate for "${want.want}" is too close to an image already used this week.` };
  // Sample what is left, spread across the folder, to keep scoring fast.
  const step = Math.max(1, Math.floor(cands.length / 16));
  cands.splice(0, cands.length, ...cands.filter((_, i) => i % step === 0).slice(0, 16));
  const scored = [];
  for (const c of cands) {
    const buf = await loadCrop({ ...c, path: join(mediaRoot, c.path) }, { x: 0.5, y: 0.5 });
    scored.push({ c, buf, ...(await scoreLocally(sharp, buf, usedHashes, textBand)) });
  }
  scored.sort((a, b) => b.score - a.score);
  const top = scored.slice(0, 6).filter((s) => s.score > -5);
  if (!top.length) return { error: `Every candidate for "${want.want}" repeats an image already used this week.` };
  let chosen = top[0];
  let reason = `local: sharpness ${chosen.sharpness}, text band mean ${chosen.bandMean}/std ${chosen.bandStd}`;
  let usd = 0;
  // Even a single named photo is checked: relevance and excluded content matter more than the plan's choice.
  if (pick && top.length >= 1) {
    const dir = mkdtempSync(join(tmpdir(), "lvinit-pick-"));
    try {
      const tileW = 270;
      const tileH = 338;
      const tiles = await Promise.all(top.map((s) => sharp(s.buf).resize(tileW, tileH).jpeg({ quality: 70 }).toBuffer()));
      const sheet = join(dir, "sheet.jpg");
      const label = (i) => Buffer.from(`<svg width="${tileW}" height="${tileH}"><rect width="40" height="34" fill="black"/><text x="8" y="25" font-size="24" fill="yellow" font-family="Arial">${i}</text></svg>`);
      const labelled = await Promise.all(tiles.map((t, i) => sharp(t).composite([{ input: label(i) }]).toBuffer()));
      await sharp({ create: { width: tileW * labelled.length, height: tileH, channels: 3, background: "#000" } })
        .composite(labelled.map((t, i) => ({ input: t, left: i * tileW, top: 0 })))
        .jpeg({ quality: 72 })
        .toFile(sheet);
      // A vision hiccup never stops the run: keep the best local candidate.
      const r = await pick({ sheetPath: sheet, want: want.want, headline: want.headline, avoid: want.avoid, candidates: top }).catch((e) => ({ pick: null, usd: e.usd ?? 0, reason: String(e.message).slice(0, 120) }));
      usd += r.usd ?? 0;
      if (r.pick === null) reason += ` (vision unavailable: ${r.reason})`;
      else if (r.pick >= 0 && r.pick < top.length) {
        chosen = top[r.pick];
        reason = `vision: ${r.reason}`;
      } else if (r.pick === -1) {
        return { error: `No candidate shows "${want.want}" cleanly (${r.reason}).`, usd };
      }
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  }
  usedHashes.push(chosen.hash);
  usedSources.push(chosen.c);
  return { src: chosen.c, focus: { x: 0.5, y: 0.5 }, reason, usd };
}

