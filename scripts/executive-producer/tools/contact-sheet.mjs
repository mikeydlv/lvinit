// contact sheets: stills (index labels) — scratch helper
import sharp from "sharp";
import { readdirSync } from "node:fs";
import { join } from "node:path";
const [dir, out, filter=""] = process.argv.slice(2);
const files = readdirSync(dir).filter(f => /\.(jpe?g|png)$/i.test(f) && f.toLowerCase().includes(filter)).sort();
const W = 300, H = 300, cols = 6;
const tiles = await Promise.all(files.map(async (f, i) => {
  const img = await sharp(join(dir, f)).rotate().resize(W, H, { fit: "cover" }).jpeg().toBuffer();
  const label = Buffer.from(`<svg width="${W}" height="${H}"><rect x="0" y="0" width="${W}" height="28" fill="black" opacity="0.65"/><text x="6" y="20" font-size="16" fill="yellow" font-family="Arial">${i}: ${f.slice(0,30)}</text></svg>`);
  return sharp(img).composite([{ input: label }]).toBuffer();
}));
const rows = Math.ceil(tiles.length / cols);
await sharp({ create: { width: cols * W, height: rows * H, channels: 3, background: "#222" } })
  .composite(tiles.map((t, i) => ({ input: t, left: (i % cols) * W, top: Math.floor(i / cols) * H })))
  .jpeg({ quality: 70 }).toFile(out);
console.log(out, files.length);
