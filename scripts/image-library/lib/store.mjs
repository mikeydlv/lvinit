// ---------------------------------------------------------------------------
// STORE — the permanent image index (in the repo) and local processing state
//
//   data/image-library/lvinit-image-library.json   PUBLIC, committed. One record
//        per published image: what it shows, where it came from, alt text,
//        topics, article matches, size, perceptual hash, GitHub status.
//        The Content Publisher queries this file instead of scanning folders.
//
//   ~/.lvinit/image-library/state.json   LOCAL. Every timestamp examined per
//        clip (accepted or rejected, and why) and a hash cache of existing
//        photos, so no run re-examines or re-saves the same frame.
// ---------------------------------------------------------------------------

import { readFileSync, writeFileSync, existsSync, mkdirSync, openSync, closeSync, unlinkSync, statSync } from "node:fs";
import { dirname, join } from "node:path";

import { SCHEMA_VERSION, AGENT } from "../config.mjs";

export function emptyIndex(config) {
  return {
    schemaVersion: SCHEMA_VERSION,
    agent: AGENT,
    description: "LVINIT Media Image Library: authentic, article-ready stills from Mikey Del Rosario's own LVINIT footage. Query by location/topics/category; use `altText` as a starting point; `usedOn` lists pages already using an image (one image, one use).",
    webBase: config.webBase,
    updatedAt: null,
    count: 0,
    images: [],
  };
}

export function loadIndex(config) {
  const file = join(config.repo, config.index);
  if (!existsSync(file)) return emptyIndex(config);
  const raw = JSON.parse(readFileSync(file, "utf8"));
  return { ...emptyIndex(config), ...raw, images: raw.images ?? [] };
}

export function saveIndex(config, index) {
  const file = join(config.repo, config.index);
  mkdirSync(dirname(file), { recursive: true });
  index.count = index.images.length;
  writeFileSync(file, JSON.stringify(index, null, 2) + "\n");
  return file;
}

/** Structural check before commit. Returns a list of problems (empty = valid). */
export function validateIndex(config, index) {
  const problems = [];
  const names = new Set();
  for (const img of index.images) {
    for (const k of ["filename", "webPath", "repoPath", "sourceVideo", "timestamp", "altText", "subject", "category", "width", "height", "hash"]) {
      if (img[k] === undefined || img[k] === null || img[k] === "") problems.push(`${img.filename ?? "?"}: missing ${k}`);
    }
    if (names.has(img.filename)) problems.push(`duplicate filename ${img.filename}`);
    names.add(img.filename);
    if (img.repoPath && !existsSync(join(config.repo, img.repoPath))) problems.push(`${img.filename}: ${img.repoPath} is missing from the repo`);
    if (img.webPath && img.repoPath && `public${img.webPath}` !== img.repoPath) problems.push(`${img.filename}: webPath and repoPath disagree`);
  }
  return problems;
}

export function loadState(config) {
  if (!existsSync(config.state)) return { examined: {}, hashCache: {}, runs: [] };
  const raw = JSON.parse(readFileSync(config.state, "utf8"));
  return { examined: raw.examined ?? {}, hashCache: raw.hashCache ?? {}, runs: raw.runs ?? [] };
}

export function saveState(config, state) {
  mkdirSync(dirname(config.state), { recursive: true });
  state.runs = (state.runs ?? []).slice(-120);
  writeFileSync(config.state, JSON.stringify(state) + "\n");
}

/** Record one examined timestamp for a clip. */
export function markExamined(state, rel, t, result, reason = null) {
  const list = (state.examined[rel] ??= []);
  list.push({ t, result, ...(reason ? { reason } : {}) });
}

/** Single-run lock; a lock older than 4 hours is stale (a crashed run). */
export function acquireLock(config) {
  mkdirSync(dirname(config.lock), { recursive: true });
  if (existsSync(config.lock)) {
    const age = Date.now() - statSync(config.lock).mtimeMs;
    if (age < 4 * 3600_000) throw new Error(`Another Image Library run holds ${config.lock} (started ${Math.round(age / 60000)} min ago).`);
    unlinkSync(config.lock);
  }
  closeSync(openSync(config.lock, "wx"));
  writeFileSync(config.lock, String(process.pid));
  return () => {
    try {
      unlinkSync(config.lock);
    } catch {}
  };
}
