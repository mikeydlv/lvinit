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

import { overlaySvg, GOLD } from "./render.mjs";
import { detectCamera } from "./describe.mjs";

const { default: sharp } = await import("sharp");

export const W = 1080;
export const H = 1920;
export const FPS = 30;
export const XFADE = 0.35; // seconds of cross dissolve between segments
export const END_CARD = 2.5; // seconds
export const LIMITS = { min: 15, max: 30 };
export const MUSIC_DIR = process.env.LVINIT_MUSIC_DIR ?? "C:\\LVINIT\\Music\\Licensed";
export const USAGE_FILE = join(homedir(), ".lvinit", "executive-producer", "footage-usage.json");
const REPO = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
export const SCOFIELD_LOGO = join(REPO, "public", "images", "logos", "the-scofield-group.webp");
// The approved brokerage line, exactly as on Mikey's closing card and the site footer.
export const BROKERAGE = { name: "Mikey Del Rosario", line: "The Scofield Group", license: "NV License S.0175577" };

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

/** Total length after cross dissolves (segments + end card). */
export function shortDuration(segments, endCard = END_CARD) {
  const durs = [...segments.map((s) => s.dur), endCard];
  return durs.reduce((a, b) => a + b, 0) - XFADE * (durs.length - 1);
}

/** Steady branding for the whole video: LVINIT bottom-left, The Scofield Group bottom-right. */
async function brandPng(path) {
  const svg = `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg"><defs><filter id="s" x="-20%" y="-80%" width="140%" height="260%"><feGaussianBlur in="SourceAlpha" stdDeviation="3" result="t"/><feOffset in="t" dy="2" result="o"/><feFlood flood-color="#000" flood-opacity="0.75"/><feComposite in2="o" operator="in" result="sh"/><feMerge><feMergeNode in="sh"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
<text x="72" y="${H - 96}" font-family="Inter" font-weight="800" font-size="40" letter-spacing="3" filter="url(#s)"><tspan fill="#FFFFFF">LVI</tspan><tspan fill="${GOLD}">NIT</tspan></text>
<text x="${W - 72}" y="${H - 98}" text-anchor="end" font-family="Inter" font-weight="600" font-size="26" letter-spacing="1.5" fill="#FFFFFF" opacity="0.92" filter="url(#s)">THE SCOFIELD GROUP</text></svg>`;
  await sharp(Buffer.from(svg)).png().toFile(path);
}

/** End card over a darkened, blurred frame of Mikey's own footage. */
async function endCardPng(path, bgFrame, { cta = "lvinit.com" } = {}) {
  const bg = await sharp(bgFrame).resize(W, H, { fit: "cover" }).blur(18).modulate({ brightness: 0.45 }).toBuffer();
  // The Scofield Group logo, recolored white (as on the long-form closing card).
  const logoW = 720;
  let logo = null;
  if (existsSync(SCOFIELD_LOGO)) {
    const a = await sharp(SCOFIELD_LOGO).resize(logoW).ensureAlpha().extractChannel(3).raw().toBuffer({ resolveWithObject: true });
    logo = await sharp({ create: { width: a.info.width, height: a.info.height, channels: 3, background: "#FFFFFF" } })
      .joinChannel(a.data, { raw: { width: a.info.width, height: a.info.height, channels: 1 } })
      .png()
      .toBuffer();
  }
  const t = (y, size, weight, text, extra = "") => `<text x="${W / 2}" y="${y}" text-anchor="middle" font-family="Inter" font-weight="${weight}" font-size="${size}" fill="#FFFFFF" ${extra}>${String(text).replace(/&/g, "&amp;").replace(/</g, "&lt;")}</text>`;
  const svg = `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
<text x="${W / 2}" y="640" text-anchor="middle" font-family="Inter" font-weight="800" font-size="150" letter-spacing="10"><tspan fill="#FFFFFF">LVI</tspan><tspan fill="${GOLD}">NIT</tspan></text>
<rect x="${W / 2 - 180}" y="690" width="360" height="3" fill="${GOLD}"/>
${t(780, 44, 600, "Living Las Vegas from the inside")}
${t(1010, 60, 700, BROKERAGE.name)}
${t(1080, 38, 500, BROKERAGE.line)}
${t(1135, 34, 500, BROKERAGE.license, 'opacity="0.9"')}
${t(1640, 44, 700, cta)}
</svg>`;
  const layers = [{ input: Buffer.from(svg) }];
  if (logo) layers.push({ input: logo, left: Math.round((W - logoW) / 2), top: 1220 });
  await sharp(bg).composite(layers).png().toFile(path);
}

/**
 * segments: [{ path (absolute), start, dur, headline?, body?, position?, focus? }]
 * music: { path } | null. Returns { path, duration, music: bool }.
 */
export async function renderShort(segments, outPath, { music = null, cta } = {}) {
  if (!segments.length) throw new Error("A short needs at least one segment.");
  const total = shortDuration(segments);
  if (total < LIMITS.min || total > LIMITS.max) throw new Error(`Planned length ${total.toFixed(1)}s is outside ${LIMITS.min}–${LIMITS.max}s.`);
  const tmp = mkdtempSync(join(tmpdir(), "lvinit-short-"));
  try {
    const args = ["-loglevel", "error", "-y"];
    const f = [];
    // Video inputs.
    segments.forEach((s) => args.push("-ss", String(s.start), "-t", String(s.dur), "-i", s.path));
    // Text overlays (one PNG per segment), the end card and the steady brand layer.
    for (const [i, s] of segments.entries()) {
      const png = join(tmp, `t${i}.png`);
      const size = i === 0 ? 84 : 72;
      await sharp({ create: { width: W, height: H, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
        .composite([{ input: overlaySvg({ W, H, headline: s.headline ?? "", body: s.body ?? "", position: s.position ?? (i === 0 ? "center" : "top"), size, brand: false, margin: 84 }) }])
        .png()
        .toFile(png);
      args.push("-loop", "1", "-t", String(s.dur), "-i", png);
    }
    const bgFrame = join(tmp, "bg.png");
    execFileSync("ffmpeg", ["-loglevel", "error", "-y", "-ss", String(segments[0].start + segments[0].dur / 2), "-i", segments[0].path, "-frames:v", "1", bgFrame]);
    const card = join(tmp, "end.png");
    await endCardPng(card, bgFrame, { cta });
    args.push("-loop", "1", "-t", String(END_CARD), "-i", card);
    const brand = join(tmp, "brand.png");
    await brandPng(brand);
    args.push("-loop", "1", "-t", String(total + 1), "-i", brand);
    const n = segments.length;
    const cardIdx = 2 * n;
    const brandIdx = 2 * n + 1;
    let audioIdx = null;
    if (music) {
      args.push("-stream_loop", "-1", "-i", music.path);
      audioIdx = 2 * n + 2;
    } else {
      args.push("-f", "lavfi", "-t", String(total), "-i", "anullsrc=channel_layout=stereo:sample_rate=48000");
      audioIdx = 2 * n + 2;
    }
    // Each segment: crop to 9:16 around the focus, 30 fps, text fades in.
    segments.forEach((s, i) => {
      const fx = s.focus?.x ?? 0.5;
      f.push(`[${i}:v]fps=${FPS},scale=${W}:${H}:force_original_aspect_ratio=increase,crop=${W}:${H}:(iw-${W})*${fx}:(ih-${H})/2,setsar=1,format=yuv420p,trim=duration=${s.dur},setpts=PTS-STARTPTS[b${i}]`);
      f.push(`[${n + i}:v]format=rgba,fade=t=in:st=${i === 0 ? 0.1 : XFADE}:d=0.35:alpha=1[o${i}]`);
      f.push(`[b${i}][o${i}]overlay=0:0:shortest=1,format=yuv420p[s${i}]`);
    });
    f.push(`[${cardIdx}:v]fps=${FPS},scale=${W}:${H},setsar=1,format=yuv420p,trim=duration=${END_CARD},setpts=PTS-STARTPTS[s${n}]`);
    // Cross dissolves.
    let prev = "s0";
    let length = segments[0].dur;
    const durs = [...segments.map((s) => s.dur), END_CARD];
    for (let k = 1; k <= n; k++) {
      const offset = (length - XFADE).toFixed(3);
      const out = k === n ? "joined" : `x${k}`;
      f.push(`[${prev}][s${k}]xfade=transition=fade:duration=${XFADE}:offset=${offset}[${out}]`);
      prev = out;
      length = length + durs[k] - XFADE;
    }
    if (n === 0) f.push(`[s0]null[joined]`);
    // Brand layer over everything except the end card (which carries its own branding).
    const brandEnd = (total - END_CARD + XFADE / 2).toFixed(3);
    f.push(`[joined][${brandIdx}:v]overlay=0:0:enable='lt(t,${brandEnd})':shortest=1,trim=duration=${total.toFixed(3)},format=yuv420p[v]`);
    // Music: trimmed to the video, faded in/out, normalized to a social-safe level.
    if (music) f.push(`[${audioIdx}:a]atrim=duration=${total.toFixed(3)},asetpts=PTS-STARTPTS,afade=t=in:st=0:d=0.4,afade=t=out:st=${Math.max(0, total - 1.6).toFixed(3)}:d=1.6,loudnorm=I=-16:TP=-1.5:LRA=11,aresample=48000[a]`);
    else f.push(`[${audioIdx}:a]atrim=duration=${total.toFixed(3)}[a]`);
    mkdirSync(dirname(outPath), { recursive: true });
    execFileSync("ffmpeg", [...args, "-filter_complex", f.join(";"), "-map", "[v]", "-map", "[a]", "-r", String(FPS), "-c:v", "libx264", "-preset", "medium", "-crf", "20", "-maxrate", "10M", "-bufsize", "20M", "-profile:v", "high", "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "192k", "-ar", "48000", "-movflags", "+faststart", "-t", total.toFixed(3), outPath], { maxBuffer: 64 * 1024 * 1024 });
    execFileSync("ffmpeg", ["-loglevel", "error", "-y", "-ss", "1.0", "-i", outPath, "-frames:v", "1", "-q:v", "3", outPath.replace(/\.mp4$/, "-cover.jpg")]);
    return { path: outPath, duration: total, music: Boolean(music) };
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
    info = JSON.parse(execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration,size:stream=codec_type,codec_name,width,height,avg_frame_rate,pix_fmt,channels", "-of", "json", file], { encoding: "utf8" }));
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
