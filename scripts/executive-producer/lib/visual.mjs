// ---------------------------------------------------------------------------
// VISUAL — local image checks and the review strip Claude looks at
//
//   bandStats     brightness and busyness of the area where text will sit
//   bestPosition  top or bottom, whichever gives white text the calmer, darker band
//   reviewStrip   the finished slides of one post side by side, numbered, low-res
// ---------------------------------------------------------------------------

export async function bandStats(sharp, buf, position = "top") {
  const W = 216;
  const H = 270;
  const px = await sharp(buf).resize(W, H, { fit: "cover" }).grayscale().raw().toBuffer();
  const [y0, y1] = position === "bottom" ? [Math.floor(H * 0.6), Math.floor(H * 0.9)] : [Math.floor(H * 0.04), Math.floor(H * 0.36)];
  let sum = 0;
  let sq = 0;
  let n = 0;
  for (let y = y0; y < y1; y++) for (let x = 0; x < W; x++) {
    const v = px[y * W + x];
    sum += v;
    sq += v * v;
    n++;
  }
  const mean = sum / n;
  return { mean: Math.round(mean), std: Math.round(Math.sqrt(Math.max(0, sq / n - mean * mean))) };
}

/** White text with a soft shadow reads on mean ≲ 215 and std ≲ 62. Lower is better. */
export const badness = ({ mean, std }) => Math.max(0, mean - 205) / 10 + Math.max(0, std - 55) / 8;

export async function bestPosition(sharp, buf, preferred = "top") {
  const top = await bandStats(sharp, buf, "top");
  const bottom = await bandStats(sharp, buf, "bottom");
  const bt = badness(top);
  const bb = badness(bottom);
  const pick = bt === bb ? preferred : bt < bb ? "top" : "bottom";
  const stats = pick === "top" ? top : bottom;
  return { position: pick, stats, readable: badness(stats) < 1.5 };
}

export async function reviewStrip(sharp, files, out, tileW = 300) {
  const tiles = [];
  for (const [i, f] of files.entries()) {
    const img = await sharp(f).resize(tileW).jpeg({ quality: 72 }).toBuffer();
    const meta = await sharp(img).metadata();
    const label = Buffer.from(`<svg width="${tileW}" height="${meta.height}"><rect width="34" height="30" fill="black"/><text x="8" y="22" font-size="20" fill="yellow" font-family="Arial">${i + 1}</text></svg>`);
    tiles.push({ buf: await sharp(img).composite([{ input: label }]).toBuffer(), h: meta.height });
  }
  const H = Math.max(...tiles.map((t) => t.h));
  await sharp({ create: { width: tileW * tiles.length, height: H, channels: 3, background: "#000" } })
    .composite(tiles.map((t, i) => ({ input: t.buf, left: i * tileW, top: 0 })))
    .jpeg({ quality: 75 })
    .toFile(out);
  return out;
}
