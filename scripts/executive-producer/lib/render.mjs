// ---------------------------------------------------------------------------
// RENDER — finished post media in the approved LVINIT social style
//
//   * the ORIGINAL photo or an extracted video frame, full-bleed. Never
//     regenerated, never AI-altered. Only cropped and scaled.
//   * simple white text directly on the image with a subtle shadow. No
//     panels, gradients, boxes, or decorative graphics.
//   * a small LVINIT wordmark (LVI white, NIT gold #C8A46A).
//
// Carousel slides: 1080x1350 (4:5) JPEG. Montage: 1080x1920 (9:16) H.264 MP4,
// silent, so Mikey can add audio in-app.
//
// Frames come straight from the source file via ffmpeg at the timestamp the
// post spec names, so every image in a post traces back to one file and one
// moment.
// ---------------------------------------------------------------------------

import { execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync, mkdtempSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { tmpdir } from "node:os";

const FONT_DIR = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "fonts").replace(/\\/g, "/");

/** Point fontconfig at the vendored Inter/Playfair before sharp loads (same as the cover generator). */
function useVendoredFonts() {
  const confDir = join(tmpdir(), "lvinit-fontconfig-social");
  mkdirSync(join(confDir, "cache"), { recursive: true });
  const confPath = join(confDir, "fonts.conf");
  writeFileSync(
    confPath,
    `<?xml version="1.0"?>\n<fontconfig>\n  <dir>${FONT_DIR}</dir>\n  <cachedir>${join(confDir, "cache").replace(/\\/g, "/")}</cachedir>\n</fontconfig>\n`,
  );
  process.env.FONTCONFIG_FILE = confPath;
}
useVendoredFonts();
const { default: sharp } = await import("sharp");

export const GOLD = "#C8A46A";
const SANS = "Inter";

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** Greedy wrap by estimated glyph width (Inter ≈ 0.54em average at bold). */
export function wrap(text, fontSize, maxWidth, factor = 0.54) {
  const maxChars = Math.max(8, Math.floor(maxWidth / (fontSize * factor)));
  const lines = [];
  for (const para of String(text).split("\n")) {
    let line = "";
    for (const word of para.split(/\s+/).filter(Boolean)) {
      if (!line) line = word;
      else if ((line + " " + word).length <= maxChars) line += " " + word;
      else {
        lines.push(line);
        line = word;
      }
    }
    lines.push(line);
  }
  return lines;
}

/** Load the source: a still, or one frame of a video at `t` seconds. Returns a Buffer. */
export function loadSource({ path, t }) {
  if (t === undefined || t === null) return path;
  return execFileSync("ffmpeg", ["-loglevel", "error", "-ss", String(t), "-i", path, "-frames:v", "1", "-f", "image2pipe", "-vcodec", "png", "-"], { maxBuffer: 256 * 1024 * 1024 });
}

/** Crop to WxH around a focal point (fx, fy in 0–1) without distorting. */
async function coverCrop(input, W, H, focus) {
  const img = sharp(input).rotate();
  const meta = await img.metadata();
  let { width, height } = meta;
  if ([5, 6, 7, 8].includes(meta.orientation)) [width, height] = [height, width];
  const scale = Math.max(W / width, H / height);
  const sw = Math.round(width * scale);
  const sh = Math.round(height * scale);
  const fx = focus?.x ?? 0.5;
  const fy = focus?.y ?? 0.5;
  const left = Math.min(Math.max(0, Math.round(sw * fx - W / 2)), sw - W);
  const top = Math.min(Math.max(0, Math.round(sh * fy - H / 2)), sh - H);
  return sharp(await img.resize(sw, sh).toBuffer()).extract({ left, top, width: W, height: H });
}

/**
 * Text overlay SVG. `position`: top | center | bottom. `size`: headline px.
 * The shadow is deliberately soft (a legibility aid, not a look).
 */
export function overlaySvg({ W, H, headline = "", body = "", position = "bottom", size = 64, brand = true, margin = 84, counter = null }) {
  const maxW = W - margin * 2;
  const hLines = headline ? wrap(headline, size, maxW) : [];
  const bSize = Math.round(size * 0.58);
  const bLines = body ? wrap(body, bSize, maxW, 0.5) : [];
  const hLead = Math.round(size * 1.16);
  const bLead = Math.round(bSize * 1.4);
  const gap = hLines.length && bLines.length ? Math.round(size * 0.45) : 0;
  const blockH = hLines.length * hLead + gap + bLines.length * bLead;
  const brandZone = brand ? 90 : 0;
  let y0;
  if (position === "top") y0 = margin + 20;
  else if (position === "center") y0 = Math.round((H - blockH) / 2);
  else y0 = H - margin - brandZone - blockH;
  const parts = [];
  let y = y0 + size;
  for (const l of hLines) {
    parts.push(`<text x="${margin}" y="${y}" font-family="${SANS}" font-weight="700" font-size="${size}" fill="#FFFFFF" filter="url(#s)">${esc(l)}</text>`);
    y += hLead;
  }
  y += gap - hLead + bLead;
  if (!hLines.length) y = y0 + bSize;
  for (const l of bLines) {
    parts.push(`<text x="${margin}" y="${y}" font-family="${SANS}" font-weight="600" font-size="${bSize}" fill="#FFFFFF" filter="url(#s)">${esc(l)}</text>`);
    y += bLead;
  }
  if (brand) {
    const by = H - 52;
    parts.push(
      `<text x="${margin}" y="${by}" font-family="${SANS}" font-weight="800" font-size="34" letter-spacing="3" filter="url(#s)"><tspan fill="#FFFFFF">LVI</tspan><tspan fill="${GOLD}">NIT</tspan></text>`,
    );
    if (counter) parts.push(`<text x="${W - margin}" y="${by}" text-anchor="end" font-family="${SANS}" font-weight="600" font-size="26" fill="#FFFFFF" opacity="0.9" filter="url(#s)">${esc(counter)}</text>`);
  }
  return Buffer.from(
    `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg"><defs><filter id="s" x="-10%" y="-40%" width="120%" height="180%"><feDropShadow dx="0" dy="2" stdDeviation="6" flood-color="#000" flood-opacity="0.72"/></filter></defs>${parts.join("")}</svg>`,
  );
}

/** The cropped image before any text: what near-duplicate checks compare. */
export async function baseCrop(src, focus, { W = 1080, H = 1350 } = {}) {
  return (await coverCrop(loadSource(src), W, H, focus)).jpeg({ quality: 80 }).toBuffer();
}

/** One finished carousel slide (1080x1350 JPEG). */
export async function renderSlide(slide, outPath, { W = 1080, H = 1350, counter = null } = {}) {
  const base = await coverCrop(loadSource(slide.src), W, H, slide.focus);
  const buf = await base.toBuffer();
  const svg = overlaySvg({ W, H, headline: slide.headline, body: slide.body, position: slide.position ?? "bottom", size: slide.size ?? 64, counter });
  mkdirSync(dirname(outPath), { recursive: true });
  await sharp(buf).composite([{ input: svg }]).jpeg({ quality: 90, mozjpeg: true }).toFile(outPath);
  return outPath;
}

/**
 * A short vertical montage: each segment is a clip range, center-cropped to
 * 9:16 (or around focus.x), with its own text overlay. Silent H.264.
 */
export async function renderMontage(segments, outPath, { W = 1080, H = 1920, fps = 30 } = {}) {
  const tmp = mkdtempSync(join(tmpdir(), "lvinit-montage-"));
  try {
    const args = ["-loglevel", "error", "-y"];
    const filters = [];
    for (const s of segments) args.push("-ss", String(s.start), "-t", String(s.dur), "-i", s.path);
    // Overlays as a second set of inputs.
    for (const [i, s] of segments.entries()) {
      const png = join(tmp, `o${i}.png`);
      await sharp({ create: { width: W, height: H, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
        .composite([{ input: overlaySvg({ W, H, headline: s.headline, body: s.body, position: s.position ?? "center", size: s.size ?? 72 }) }])
        .png()
        .toFile(png);
      args.push("-i", png);
    }
    const n = segments.length;
    segments.forEach((s, i) => {
      const fx = s.focus?.x ?? 0.5;
      filters.push(
        `[${i}:v]fps=${fps},scale=${W}:${H}:force_original_aspect_ratio=increase,crop=${W}:${H}:(iw-${W})*${fx}:(ih-${H})/2,setsar=1,format=yuv420p[v${i}]`,
        `[v${i}][${n + i}:v]overlay=0:0,format=yuv420p[c${i}]`,
      );
    });
    filters.push(`${segments.map((_, i) => `[c${i}]`).join("")}concat=n=${n}:v=1:a=0[out]`);
    mkdirSync(dirname(outPath), { recursive: true });
    execFileSync("ffmpeg", [...args, "-filter_complex", filters.join(";"), "-map", "[out]", "-c:v", "libx264", "-preset", "medium", "-crf", "19", "-pix_fmt", "yuv420p", "-movflags", "+faststart", "-an", outPath]);
    // A cover frame for previews.
    execFileSync("ffmpeg", ["-loglevel", "error", "-y", "-ss", "0.8", "-i", outPath, "-frames:v", "1", "-q:v", "3", outPath.replace(/\.mp4$/, "-cover.jpg")]);
    return outPath;
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
}
