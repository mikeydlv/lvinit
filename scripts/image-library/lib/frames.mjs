// ---------------------------------------------------------------------------
// FRAMES — read-only frame grabs and local quality checks
//
// Source videos are only ever opened for reading by ffmpeg. HDR / HLG footage
// is tone-mapped to ordinary SDR (bt709) so a still looks like the footage does
// on a normal screen: a format conversion, not an edit of the scene.
//
// Local checks run before anything is shown to Claude: sharpness (motion blur,
// soft focus), exposure (crushed or blown out), contrast (empty, low-information
// frames) and a perceptual hash for near-duplicates.
// ---------------------------------------------------------------------------

import { execFile } from "node:child_process";

import { dhash, hamming } from "../../executive-producer/lib/gate.mjs";

export { hamming };

function run(bin, args, { encoding = "buffer", timeout = 180_000 } = {}) {
  return new Promise((resolve, reject) => {
    execFile(bin, args, { encoding, maxBuffer: 512 * 1024 * 1024, windowsHide: true, timeout }, (err, stdout, stderr) => {
      if (err) return reject(new Error(`${bin} failed: ${String(stderr || err.message).slice(-300)}`));
      resolve(stdout);
    });
  });
}

/** Colour facts that decide tone mapping. */
export async function colorInfo(abs, ffprobe = "ffprobe") {
  const out = await run(ffprobe, ["-v", "error", "-select_streams", "v:0", "-show_entries", "stream=pix_fmt,color_transfer,color_primaries", "-of", "json", abs], { encoding: "utf8", timeout: 60_000 });
  const s = JSON.parse(out).streams?.[0] ?? {};
  return { pixFmt: s.pix_fmt ?? null, transfer: s.color_transfer ?? null, primaries: s.color_primaries ?? null };
}

export function isHdr(info) {
  return /smpte2084|arib-std-b67/.test(info?.transfer ?? "");
}

function toneMap(info) {
  if (!isHdr(info)) return "format=rgb24";
  return ["zscale=t=linear:npl=100", "format=gbrpf32le", "zscale=p=bt709", "tonemap=hable:desat=0", "zscale=t=bt709:m=bt709:r=tv", "format=rgb24"].join(",");
}

/** One frame at `sec` as a PNG buffer; `width` scales it down (never up). */
export async function grabFrame(abs, sec, { width = null, info = null, ffmpeg = "ffmpeg" } = {}) {
  const filters = [toneMap(info)];
  if (width) filters.unshift(`scale='min(${width},iw)':-2`);
  return run(ffmpeg, ["-v", "error", "-ss", String(Math.max(0, sec)), "-i", abs, "-frames:v", "1", "-vf", filters.join(","), "-f", "image2pipe", "-vcodec", "png", "-"]);
}

/** Sharpness, exposure and contrast of one frame (scaled to 640px wide grayscale). */
export async function frameMetrics(sharp, buf) {
  const W = 640;
  const { data, info } = await sharp(buf).resize(W).grayscale().raw().toBuffer({ resolveWithObject: true });
  const w = info.width;
  const h = info.height;
  let lap = 0;
  let sum = 0;
  let sq = 0;
  let clipped = 0;
  let crushed = 0;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const v = data[y * w + x];
      sum += v;
      sq += v * v;
      if (v >= 250) clipped++;
      if (v <= 12) crushed++;
      if (y > 0 && y < h - 1 && x > 0 && x < w - 1) {
        const i = y * w + x;
        const l = 4 * v - data[i - 1] - data[i + 1] - data[i - w] - data[i + w];
        lap += l * l;
      }
    }
  }
  const n = w * h;
  const mean = sum / n;
  return {
    sharpness: Math.round(lap / ((w - 2) * (h - 2))),
    mean: Math.round(mean),
    contrast: Math.round(Math.sqrt(Math.max(0, sq / n - mean * mean))),
    clipped: Math.round((clipped / n) * 1000) / 1000,
    crushed: Math.round((crushed / n) * 1000) / 1000,
  };
}

/** Local verdict: null when the frame passes, otherwise the rejection reason. */
export function localReject(m, q) {
  if (m.sharpness < q.minSharpness) return "blurry or motion-blurred";
  if (m.mean < q.minMean || m.crushed > q.maxCrushed) return "underexposed";
  if (m.mean > q.maxMean || m.clipped > q.maxClipped) return "overexposed";
  if (m.contrast < q.minContrast) return "low-information (flat frame)";
  return null;
}

export async function hashHex(sharp, buf) {
  return (await dhash(sharp, buf)).toString(16).padStart(16, "0");
}

export function hammingHex(a, b) {
  return hamming(BigInt("0x" + a), BigInt("0x" + b));
}

/** The closest of `hashes` to `h` (64 when there are none). */
export function nearest(h, hashes) {
  let best = 64;
  for (const x of hashes) {
    const d = hammingHex(h, x);
    if (d < best) best = d;
  }
  return best;
}

export function fmtTimestamp(sec) {
  const s = Math.max(0, Math.floor(sec));
  const hh = String(Math.floor(s / 3600)).padStart(2, "0");
  const mm = String(Math.floor((s % 3600) / 60)).padStart(2, "0");
  const ss = String(s % 60).padStart(2, "0");
  return `${hh}:${mm}:${ss}`;
}

/**
 * Sample times for one clip: an evenly spaced grid, offset differently on each
 * pass so later runs look between earlier samples, skipping anything within
 * `gap` seconds of a time already examined.
 */
export function sampleTimes(duration, examined = [], { min = 3, max = 10, gap = 4, edge = 0.8, pass = 0 } = {}) {
  if (!(duration > edge * 2 + 0.5)) return [];
  const span = duration - edge * 2;
  const n = Math.max(min, Math.min(max, Math.round(span / 6)));
  const step = span / n;
  const offset = (((pass * 0.618) % 1) + 0.5) % 1;
  const out = [];
  for (let i = 0; i < n; i++) {
    const t = Math.round((edge + step * (i + offset)) * 10) / 10;
    if (t > duration - edge) continue;
    if (examined.some((e) => Math.abs(e - t) < gap)) continue;
    out.push(t);
  }
  return out;
}
