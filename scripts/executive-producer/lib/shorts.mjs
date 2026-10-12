// ---------------------------------------------------------------------------
// SHORTS — finished 15–30 s vertical videos from Mikey's ORIGINAL footage only
//
// Four jobs, each a hard rule rather than a preference:
//
//   1. FOOTAGE POLICY   originalClips() / verifyOriginal()
//      Only camera-original b-roll from the APPROVED catalog: the file's own
//      metadata must identify one of Mikey's cameras (DJI drone, Osmo Pocket,
//      phone). Edited exports, OpusClip/AI-expanded files, anything with a
//      stock/download name, and anything whose origin can't be confirmed are
//      refused. There is no fallback to other footage: if the pool runs dry the
//      short is reported as an exception, never filled with something else.
//   2. MUSIC            pickTrack()
//      Only tracks listed in C:\LVINIT\Music\Licensed\licenses.json with a
//      recorded source and license. No list, no music: the short is delivered
//      with a silent audio track and says so.
//   3. RENDER           renderShort()
//      ffmpeg: 9:16 crop, 30 fps, text per segment (hook first), short cross
//      dissolves, LVINIT wordmark + The Scofield Group throughout, an end card
//      with the approved brokerage line, music trimmed/faded/normalized.
//   4. VALIDATE         validateShort()
//      ffprobe + a full decode: 1080x1920, H.264, ~30 fps, 15–30 s, AAC audio,
//      no decode errors, no long black stretches.
//
// Usage is recorded in ~/.lvinit/executive-producer/footage-usage.json so the
// same clip isn't reused in shorts week after week.
// ---------------------------------------------------------------------------

import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync, mkdirSync, mkdtempSync, rmSync } from "node:fs";
import { join, dirname, basename } from "node:path";
import { tmpdir, homedir } from "node:os";
import { fileURLToPath } from "node:url";

import * as ST from "./short-style.mjs";
import { detectCamera } from "./describe.mjs";

const { default: sharp } = await import("sharp");

export const W = 1080;
export const H = 1920;
export const FPS = 30;
export const END_CARD = ST.END_CARD;
export const BRAND_RESERVE = ST.BRAND_RESERVE;
// Readability over bright sky: pull the shot's exposure down a little, like an edit (never a
// panel), exactly as carousel slides do: automatic from the text band's brightness, plus
// review-requested steps (darken 1-2).
export const DARKEN = [1, 0.82, 0.72];

/** Mean and variation of the band a segment's text would cover, at the middle of the segment. */
export function textBandStats(path, t, position = "top", fx = 0.5) {
  const w = 108;
  const h = 192;
  const px = execFileSync("ffmpeg", ["-v", "error", "-ss", String(Math.max(0, t)), "-i", path, "-frames:v", "1", "-vf", `scale=${W}:${H}:force_original_aspect_ratio=increase,crop=${W}:${H}:(iw-${W})*${fx}:(ih-${H})/2,scale=${w}:${h},format=gray`, "-f", "rawvideo", "-"], { maxBuffer: 8 * 1024 * 1024 });
  const [y0, y1] = position === "bottom" ? [0.6, 0.88] : position === "center" ? [0.38, 0.62] : [0.05, 0.3];
  let sum = 0;
  let sq = 0;
  let n = 0;
  for (let y = Math.floor(h * y0); y < Math.floor(h * y1); y++) for (let x = 0; x < w; x++) {
    const v = px[y * w + x] ?? 0;
    sum += v;
    sq += v * v;
    n++;
  }
  const mean = n ? sum / n : 0;
  return { mean, std: n ? Math.sqrt(Math.max(0, sq / n - mean * mean)) : 0 };
}

/** How hard white text is to read over a band (lower is better). Busy texture counts most. */
// Bright but calm sky is fine (shadows + the exposure pull handle it); busy texture is not.
const bandBadness = ({ mean, std }) => std / 40 + (mean > 215 ? 1.2 : mean > 195 ? 0.3 : 0);

/**
 * Where a segment's text goes: the plan's position if it set one, otherwise the
 * treatment's default, unless that band is busy and another band is clearly calmer.
 */
export function placeText(s, treatment) {
  if (s.position) return s.position;
  const def = ST.TREATMENTS[treatment]?.position ?? "top";
  const alts = ["top", "center", "bottom"].filter((p) => p !== def);
  const t = s.start + s.dur / 2;
  const fx = s.focus?.x ?? 0.5;
  try {
    const d = bandBadness(textBandStats(s.path, t, def, fx));
    if (d < 0.9) return def;
    const best = alts.map((p) => ({ p, b: bandBadness(textBandStats(s.path, t, p, fx)) })).sort((a, b) => a.b - b.b)[0];
    return best.b < d - 0.3 ? best.p : def;
  } catch {
    return def;
  }
}

/** Mean luminance (0-255) of the band a segment's text covers, at the middle of the segment. */
export function textBandMean(path, t, position = "top") {
  const w = 108;
  const h = 192;
  const px = execFileSync("ffmpeg", ["-v", "error", "-ss", String(Math.max(0, t)), "-i", path, "-frames:v", "1", "-vf", `scale=${W}:${H}:force_original_aspect_ratio=increase,crop=${W}:${H},scale=${w}:${h},format=gray`, "-f", "rawvideo", "-"], { maxBuffer: 8 * 1024 * 1024 });
  const [y0, y1] = position === "bottom" ? [0.55, 0.88] : position === "center" ? [0.35, 0.65] : [0.03, 0.3];
  let sum = 0;
  let n = 0;
  for (let y = Math.floor(h * y0); y < Math.floor(h * y1); y++) for (let x = 0; x < w; x++) {
    sum += px[y * w + x] ?? 0;
    n++;
  }
  return n ? sum / n : 0;
}

/** Brightness factor for a segment: the carousel rule (never below 0.72). */
export function exposureFor(mean, darken = 0) {
  const auto = mean > 150 ? Math.max(0.74, 1 - (mean - 150) / 260) : 1;
  return Math.round(Math.min(auto, DARKEN[darken] ?? 1) * 100) / 100;
}
export const LIMITS = { min: 15, max: 30 };
export const MUSIC_DIR = process.env.LVINIT_MUSIC_DIR ?? "C:\\LVINIT\\Music\\Licensed";
export const USAGE_FILE = join(homedir(), ".lvinit", "executive-producer", "footage-usage.json");
export const SCOFIELD_LOGO = ST.SCOFIELD_LOGO;
// The brokerage block on every end card (Mikey, 2026-10-12).
export const BROKERAGE = { name: ST.BRAND.name, line: ST.BRAND.brokerage, phone: ST.BRAND.phone, license: ST.BRAND.license, tagline: ST.TAGLINE };

// Names that mean "not straight from Mikey's camera".
const NOT_ORIGINAL = /(^|[\\/_\- ])(ai[-_ ]?expand|ai[-_]|stock|pexels|pixabay|envato|storyblocks|artgrid|shutterstock|motionarray|videvo|mixkit|download(ed)?|opus ?clip|broll_cinematic)/i;
export const ORIGINAL_CAMERAS = new Set(["drone", "handheld", "phone"]);

// ---- 1. footage policy ---------------------------------------------------------

/** Clips a short may use: approved catalog + camera-original + present on disk. */
export function originalClips(catalog, mediaRoot, { exists = existsSync } = {}) {
  return catalog.items.filter(
    (c) =>
      c.type === "video" &&
      c.role === "b-roll" &&
      !c.duplicateOf &&
      ORIGINAL_CAMERAS.has(c.camera) &&
      !NOT_ORIGINAL.test(c.path) &&
      (c.durationSec ?? 0) >= 3 &&
      exists(join(mediaRoot, c.path)),
  );
}

const probeCache = new Map();
/** Re-reads the file's own metadata at render time; the catalog could be stale. */
export function verifyOriginal(abs, relPath, { probe } = {}) {
  if (probeCache.has(abs)) return probeCache.get(abs);
  let encoder = "";
  try {
    const out = probe
      ? probe(abs)
      : execFileSync("ffprobe", ["-v", "error", "-show_entries", "format_tags=encoder,com.apple.quicktime.model,model:stream_tags=encoder,handler_name", "-of", "json", abs], { encoding: "utf8" });
    const j = typeof out === "string" ? JSON.parse(out) : out;
    encoder = [j.format?.tags?.encoder, j.format?.tags?.["com.apple.quicktime.model"], j.format?.tags?.model, ...(j.streams ?? []).map((s) => s.tags?.encoder ?? s.tags?.handler_name)].filter(Boolean).join(" ");
  } catch (e) {
    const r = { ok: false, camera: "unknown", why: `metadata unreadable (${String(e.message).split("\n")[0].slice(0, 80)})` };
    probeCache.set(abs, r);
    return r;
  }
  const camera = detectCamera({ name: basename(abs), encoder, relPath });
  const r = ORIGINAL_CAMERAS.has(camera) && !NOT_ORIGINAL.test(relPath) ? { ok: true, camera } : { ok: false, camera, why: `not identifiable as camera-original (${camera}${encoder ? `: ${encoder.slice(0, 60)}` : ""})` };
  probeCache.set(abs, r);
  return r;
}

// ---- usage ledger --------------------------------------------------------------

export function loadUsage(file = USAGE_FILE) {
  try {
    return JSON.parse(readFileSync(file, "utf8"));
  } catch {
    return { schema_version: "1.0.0", agent: "executive-producer", note: "Original footage and music used in finished posts. Written after each finished week.", uses: [], music: [] };
  }
}

export function saveUsage(u, file = USAGE_FILE) {
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, JSON.stringify(u, null, 2));
}

const daysBetween = (a, b) => Math.round((new Date(`${b}T00:00:00Z`) - new Date(`${a}T00:00:00Z`)) / 86_400_000);
const key = (p) => String(p).replace(/\\/g, "/").toLowerCase();

/** Clip paths a short must not reuse: in a short within `days`, or used `cap`+ times in 90 days. */
export function overusedClips(usage, weekOf, { days = 28, cap = 3 } = {}) {
  const out = new Set();
  const count = new Map();
  for (const u of usage.uses ?? []) {
    if (u.weekOf >= weekOf) continue; // this week's own uses are handled live
    const age = daysBetween(u.weekOf, weekOf);
    if (u.kind === "short" && age < days) out.add(key(u.path));
    if (age < 90) count.set(key(u.path), (count.get(key(u.path)) ?? 0) + 1);
  }
  for (const [p, n] of count) if (n >= cap) out.add(p);
  return out;
}

/** A moved file keeps its reuse history: old paths in the ledger become the new ones. */
export function remapUsage(usage, moved = []) {
  const to = new Map(moved.map((m) => [key(m.from), m.to]));
  let n = 0;
  for (const u of usage.uses ?? []) {
    const t = to.get(key(u.path));
    if (t) {
      u.path = t;
      n++;
    }
  }
  return n;
}

/** Records a finished week's footage and music (replacing any earlier record of the same week). */
export function recordWeek(usage, weekOf, posts) {
  usage.uses = (usage.uses ?? []).filter((u) => u.weekOf !== weekOf);
  usage.music = (usage.music ?? []).filter((m) => m.weekOf !== weekOf);
  for (const p of posts) {
    for (const s of p.segments ?? []) usage.uses.push({ weekOf, day: p.day, kind: "short", title: p.title, path: s.path, start: s.start, dur: s.dur });
    for (const s of p.slides ?? []) if (s.src?.t !== undefined) usage.uses.push({ weekOf, day: p.day, kind: "carousel", title: p.title, path: s.src.path, start: s.src.t, dur: 0 });
    if (p.music?.file) usage.music.push({ weekOf, day: p.day, file: p.music.file });
  }
  return usage;
}

// ---- 2. licensed music -----------------------------------------------------------

/** Tracks with a recorded license whose file exists. */
export function licensedTracks(dir = MUSIC_DIR) {
  const manifest = join(dir, "licenses.json");
  if (!existsSync(manifest)) return [];
  const m = JSON.parse(readFileSync(manifest, "utf8"));
  return (m.tracks ?? []).filter((t) => t.file && t.license && t.source && t.url && existsSync(join(dir, t.file))).map((t) => ({ ...t, path: join(dir, t.file) }));
}

/** Least-recently-used licensed track, never the one used by the previous short this week. */
export function pickTrack(tracks, usage, usedThisWeek = []) {
  if (!tracks.length) return null;
  const last = new Map();
  for (const m of usage.music ?? []) last.set(m.file, m.weekOf > (last.get(m.file) ?? "") ? m.weekOf : last.get(m.file));
  const ranked = tracks
    .map((t) => ({ t, week: usedThisWeek.filter((f) => f === t.file).length, last: last.get(t.file) ?? "" }))
    .sort((a, b) => a.week - b.week || a.last.localeCompare(b.last));
  const prev = usedThisWeek.at(-1);
  return (ranked.find((r) => r.t.file !== prev) ?? ranked[0]).t;
}

// ---- 3. render --------------------------------------------------------------------
// The look lives in lib/short-style.mjs (treatments, typography, transitions, end card).

/** Total length after transitions (segments + end card), for a treatment. */
export function shortDuration(segments, treatment = "editorial") {
  return ST.styledDuration(segments, treatment);
}

/**
 * segments: [{ path (absolute), start, dur, headline?, body?, position?, focus?, transition?, darken? }]
 * music: { path } | null. treatment: editorial | documentary | kinetic.
 * Returns { path, duration, music, treatment, warnings }.
 */
export async function renderShort(segments, outPath, { music = null, cta, treatment = "editorial" } = {}) {
  if (!segments.length) throw new Error("A short needs at least one segment.");
  if (!ST.TREATMENTS[treatment]) treatment = "editorial";
  const total = shortDuration(segments, treatment);
  if (total < LIMITS.min || total > LIMITS.max) throw new Error(`Planned length ${total.toFixed(1)}s is outside ${LIMITS.min}–${LIMITS.max}s.`);
  const tmp = mkdtempSync(join(tmpdir(), "lvinit-short-"));
  try {
    const args = ["-loglevel", "error", "-y"];
    const f = [];
    const n = segments.length;
    segments.forEach((s) => args.push("-ss", String(s.start), "-t", String(s.dur), "-i", s.path));
    // Text layers (one per segment; they stop above the brand line), end card, brand line.
    for (const [i, s] of segments.entries()) {
      s.position = placeText(s, treatment);
      const png = join(tmp, `t${i}.png`);
      const l = await ST.textLayer(s, treatment, i === 0, png);
      s.position = l.position;
      args.push("-loop", "1", "-t", String(s.dur), "-i", png);
    }
    const card = join(tmp, "end.png");
    const { warnings } = await ST.endCard(card, { cta });
    args.push("-loop", "1", "-t", String(ST.END_CARD), "-i", card);
    const brand = join(tmp, "brand.png");
    await ST.brandLayer(brand);
    args.push("-loop", "1", "-t", String(total + 1), "-i", brand);
    const cardIdx = 2 * n;
    const brandIdx = 2 * n + 1;
    const audioIdx = 2 * n + 2;
    if (music) args.push("-stream_loop", "-1", "-i", music.path);
    else args.push("-f", "lavfi", "-t", String(total), "-i", "anullsrc=channel_layout=stereo:sample_rate=48000");
    // Text over bright sky or pavement: pull that shot's exposure down, as the carousels do.
    for (const s of segments) {
      try {
        s.exposure = exposureFor(textBandMean(s.path, s.start + s.dur / 2, s.position ?? "top"), s.darken ?? 0);
      } catch {
        s.exposure = DARKEN[s.darken ?? 0] ?? 1;
      }
    }
    segments.forEach((s, i) => {
      const fx = s.focus?.x ?? 0.5;
      // Text appears after the incoming transition has mostly played.
      const m = ST.textMotion(treatment, i === 0, i === 0 ? 0 : ST.transitionFor(segments, i, treatment).dur);
      f.push(`[${i}:v]fps=${FPS},scale=${W}:${H}:force_original_aspect_ratio=increase,crop=${W}:${H}:(iw-${W})*${fx}:(ih-${H})/2,setsar=1,format=yuv420p${s.exposure && s.exposure < 1 ? `,lutyuv=y=val*${s.exposure}` : ""},trim=duration=${s.dur},setpts=PTS-STARTPTS[b${i}]`);
      f.push(`[${n + i}:v]format=rgba,fade=t=in:st=${m.delay}:d=${m.fade}:alpha=1[o${i}]`);
      f.push(`[b${i}][o${i}]overlay=x=0:y='${m.y}':shortest=1,format=yuv420p[s${i}]`);
    });
    f.push(`[${cardIdx}:v]fps=${FPS},scale=${W}:${H},setsar=1,format=yuv420p,trim=duration=${ST.END_CARD},setpts=PTS-STARTPTS[s${n}]`);
    // Transitions vary by treatment (and by segment, when the plan asks for one).
    let prev = "s0";
    let length = segments[0].dur;
    const durs = [...segments.map((s) => s.dur), ST.END_CARD];
    let lastT = 0;
    for (let k = 1; k <= n; k++) {
      const tr = ST.transitionFor(segments, k, treatment);
      const type = tr.type === "cut" ? "fade" : tr.type;
      const out = k === n ? "joined" : `x${k}`;
      f.push(`[${prev}][s${k}]xfade=transition=${type}:duration=${tr.dur}:offset=${(length - tr.dur).toFixed(3)}[${out}]`);
      prev = out;
      length = length + durs[k] - tr.dur;
      if (k === n) lastT = tr.dur;
    }
    // Brand line over the footage only (the end card carries the full branding).
    const brandEnd = (total - ST.END_CARD + lastT / 2).toFixed(3);
    f.push(`[joined][${brandIdx}:v]overlay=0:0:enable='lt(t,${brandEnd})':shortest=1,trim=duration=${total.toFixed(3)},format=yuv420p[v]`);
    if (music) f.push(`[${audioIdx}:a]atrim=duration=${total.toFixed(3)},asetpts=PTS-STARTPTS,afade=t=in:st=0:d=0.4,afade=t=out:st=${Math.max(0, total - 1.8).toFixed(3)}:d=1.8,loudnorm=I=-16:TP=-1.5:LRA=11,aresample=48000[a]`);
    else f.push(`[${audioIdx}:a]atrim=duration=${total.toFixed(3)}[a]`);
    mkdirSync(dirname(outPath), { recursive: true });
    execFileSync("ffmpeg", [...args, "-filter_complex", f.join(";"), "-map", "[v]", "-map", "[a]", "-r", String(FPS), "-c:v", "libx264", "-preset", "medium", "-crf", "20", "-maxrate", "10M", "-bufsize", "20M", "-profile:v", "high", "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "192k", "-ar", "48000", "-movflags", "+faststart", "-t", total.toFixed(3), outPath], { maxBuffer: 64 * 1024 * 1024 });
    execFileSync("ffmpeg", ["-loglevel", "error", "-y", "-ss", "1.0", "-i", outPath, "-frames:v", "1", "-strict", "-1", "-q:v", "3", outPath.replace(/\.mp4$/, "-cover.jpg")]);
    return { path: outPath, duration: total, music: Boolean(music), treatment, warnings };
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
}

// ---- 4. validate ------------------------------------------------------------------

export function validateShort(file, { expectMusic = null } = {}) {
  const problems = [];
  if (!existsSync(file)) return { ok: false, problems: ["file missing"] };
  let info;
  try {
    info = JSON.parse(execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration,size:stream=codec_type,codec_name,width,height,avg_frame_rate,pix_fmt,channels,duration", "-of", "json", file], { encoding: "utf8" }));
  } catch (e) {
    return { ok: false, problems: [`ffprobe failed: ${String(e.message).split("\n")[0]}`] };
  }
  const v = info.streams.find((s) => s.codec_type === "video");
  const a = info.streams.find((s) => s.codec_type === "audio");
  const dur = Number(info.format.duration);
  const [num, den] = String(v?.avg_frame_rate ?? "0/1").split("/").map(Number);
  const fps = den ? num / den : 0;
  if (!v) problems.push("no video stream");
  else {
    if (v.codec_name !== "h264") problems.push(`video codec ${v.codec_name}, expected h264`);
    if (v.width !== W || v.height !== H) problems.push(`${v.width}x${v.height}, expected ${W}x${H}`);
    if (Math.abs(fps - FPS) > 0.5) problems.push(`${fps.toFixed(2)} fps, expected ${FPS}`);
    if (v.pix_fmt !== "yuv420p") problems.push(`pixel format ${v.pix_fmt}`);
  }
  if (!(dur >= LIMITS.min - 0.05 && dur <= LIMITS.max + 0.05)) problems.push(`duration ${dur.toFixed(2)}s, expected ${LIMITS.min}–${LIMITS.max}s`);
  if (!a || a.codec_name !== "aac") problems.push("no AAC audio track");
  // The picture must run the whole length (a broken transition can end the video early under full-length audio).
  const vDur = Number(v?.duration);
  if (v && Number.isFinite(vDur) && Math.abs(vDur - dur) > 0.3) problems.push(`video stream is ${vDur.toFixed(2)}s but the file is ${dur.toFixed(2)}s`);
  // Full decode: catches truncated or corrupt output that probes fine.
  const dec = spawnSync("ffmpeg", ["-v", "error", "-i", file, "-f", "null", "-"], { encoding: "utf8", maxBuffer: 16 * 1024 * 1024 });
  if (dec.status !== 0 || dec.stderr.trim()) problems.push(`decode errors: ${dec.stderr.trim().split("\n")[0]?.slice(0, 120) ?? dec.status}`);
  // Long black stretches (a failed crop or a bad source frame).
  const bd = spawnSync("ffmpeg", ["-v", "info", "-i", file, "-vf", "blackdetect=d=0.6:pix_th=0.06", "-an", "-f", "null", "-"], { encoding: "utf8", maxBuffer: 16 * 1024 * 1024 });
  const blacks = [...String(bd.stderr).matchAll(/black_start:([\d.]+) black_end:([\d.]+)/g)].map((m) => [Number(m[1]), Number(m[2])]);
  if (blacks.length) problems.push(`black frames at ${blacks.map(([s, e]) => `${s.toFixed(1)}–${e.toFixed(1)}s`).join(", ")}`);
  // Silence check only when a music track was supposed to be there.
  if (expectMusic && a) {
    const vd = spawnSync("ffmpeg", ["-v", "info", "-i", file, "-af", "volumedetect", "-vn", "-f", "null", "-"], { encoding: "utf8", maxBuffer: 16 * 1024 * 1024 });
    const mean = Number((String(vd.stderr).match(/mean_volume: (-?[\d.]+) dB/) ?? [])[1]);
    if (!(mean > -45)) problems.push(`music track is near-silent (mean ${mean} dB)`);
  }
  return { ok: !problems.length, problems, info: { duration: Math.round(dur * 100) / 100, width: v?.width, height: v?.height, fps: Math.round(fps * 100) / 100, audio: a?.codec_name ?? null, bytes: Number(info.format.size) } };
}
