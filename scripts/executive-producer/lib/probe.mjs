// ---------------------------------------------------------------------------
// PROBE — technical facts about a clip, via ffprobe
//
// Asks ffprobe for a fixed WHITELIST of fields only: duration, dimensions,
// rotation, frame rate, creation_time and encoder. Location tags are never
// requested, so GPS never enters this process's memory from here, let alone
// the catalog.
//
// Results are cached by path + size + modified time, so a weekly re-run only
// probes new or changed files.
// ---------------------------------------------------------------------------

import { execFile } from "node:child_process";
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";

const ENTRIES = [
  "format=duration",
  "format_tags=creation_time,encoder",
  "stream=codec_type,width,height,avg_frame_rate",
  "stream_tags=rotate",
  "stream_side_data=rotation",
].join(":");

export function parseProbe(json) {
  const data = typeof json === "string" ? JSON.parse(json) : json;
  const v = (data.streams ?? []).find((s) => s.codec_type === "video") ?? {};
  let width = Number(v.width) || null;
  let height = Number(v.height) || null;
  const rotation = Math.abs(Number(v.tags?.rotate ?? v.side_data_list?.find((d) => d.rotation !== undefined)?.rotation ?? 0));
  if (rotation === 90 || rotation === 270) [width, height] = [height, width];
  const [num, den] = String(v.avg_frame_rate ?? "0/0").split("/").map(Number);
  const fps = den ? Math.round((num / den) * 100) / 100 : null;
  const duration = Number(data.format?.duration);
  return {
    width,
    height,
    fps: fps && Number.isFinite(fps) && fps < 1000 ? fps : null,
    durationSec: Number.isFinite(duration) && duration > 0.05 ? Math.round(duration * 10) / 10 : null,
    creationTime: data.format?.tags?.creation_time ?? null,
    encoder: data.format?.tags?.encoder ?? null,
  };
}

function probeOne(ffprobe, file) {
  return new Promise((resolve) => {
    execFile(ffprobe, ["-v", "error", "-print_format", "json", "-show_entries", ENTRIES, file], { timeout: 60_000, windowsHide: true }, (err, stdout) => {
      if (err) return resolve({ error: String(err.code ?? err.message).slice(0, 120) });
      try {
        resolve(parseProbe(stdout));
      } catch (e) {
        resolve({ error: `unparseable ffprobe output` });
      }
    });
  });
}

export function loadProbeCache(file) {
  if (!existsSync(file)) return {};
  try {
    return JSON.parse(readFileSync(file, "utf8")).entries ?? {};
  } catch {
    return {};
  }
}

export function saveProbeCache(file, entries) {
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, JSON.stringify({ note: "LOCAL ONLY. ffprobe cache for the footage cataloger.", entries }) + "\n");
}

/** Probe every file that needs it, a few at a time. Mutates and returns the cache. */
export async function probeAll(files, { ffprobe, cache, concurrency = 6, onProgress = () => {}, probe = probeOne }) {
  const cacheKey = (f) => `${f.rel}|${f.size}|${f.mtimeMs}`;
  const todo = files.filter((f) => !cache[cacheKey(f)]);
  let done = 0;
  let next = 0;
  const worker = async () => {
    while (next < todo.length) {
      const f = todo[next++];
      cache[cacheKey(f)] = await probe(ffprobe, f.abs);
      done += 1;
      if (done % 50 === 0) onProgress(done, todo.length);
    }
  };
  await Promise.all(Array.from({ length: Math.min(concurrency, todo.length) }, worker));
  const results = new Map(files.map((f) => [f.rel, cache[cacheKey(f)] ?? null]));
  // Drop cache entries for files that no longer exist or changed.
  const live = new Set(files.map(cacheKey));
  for (const k of Object.keys(cache)) if (!live.has(k)) delete cache[k];
  return { results, probed: todo.length };
}
