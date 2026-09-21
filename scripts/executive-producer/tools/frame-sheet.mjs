// Frame contact sheet: N evenly spaced, timestamp-labelled frames per clip.
//   node frame-sheet.mjs <mediaRoot> <out.jpg> <framesPerClip> <relPath>...
import sharp from "sharp";
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
const [root, out, nStr, ...clips] = process.argv.slice(2);
const n = Number(nStr);
const tmp = mkdtempSync(join(tmpdir(), "fs-"));
const W = 320, H = 320;
const tiles = [];
const mmss = (t) => `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, "0")}`;
for (const [ci, rel] of clips.entries()) {
  const abs = join(root, rel);
  const dur = Number(execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", abs]).toString().trim());
  for (let k = 0; k < n; k++) {
    const t = Math.max(0.5, (dur * (k + 0.5)) / n);
    const f = join(tmp, `${ci}-${k}.jpg`);
    execFileSync("ffmpeg", ["-loglevel", "error", "-y", "-ss", t.toFixed(2), "-i", abs, "-frames:v", "1", "-vf", "scale=480:-1", f]);
    const img = await sharp(readFileSync(f)).resize(W, H, { fit: "cover" }).toBuffer();
    const label = Buffer.from(`<svg width="${W}" height="${H}"><rect width="${W}" height="26" fill="black" opacity="0.7"/><text x="5" y="19" font-size="15" fill="yellow" font-family="Arial">C${ci} @${mmss(t)} ${rel.split("/").pop().slice(0, 22)}</text></svg>`);
    tiles.push(await sharp(img).composite([{ input: label }]).toBuffer());
  }
  console.log(`C${ci} ${rel} (${dur.toFixed(0)}s)`);
}
const cols = n;
await sharp({ create: { width: cols * W, height: Math.ceil(tiles.length / cols) * H, channels: 3, background: "#222" } })
  .composite(tiles.map((t, i) => ({ input: t, left: (i % cols) * W, top: Math.floor(i / cols) * H })))
  .jpeg({ quality: 68 }).toFile(out);
