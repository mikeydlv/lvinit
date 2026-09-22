import test from "node:test";
import assert from "node:assert/strict";

import { wrap, overlaySvg, textWidth, fitText, TYPE } from "../lib/render.mjs";

test("text wraps inside the safe margins", () => {
  const lines = wrap("The closest thing Vegas has to a walk-everywhere neighborhood.", 92, 920);
  assert.ok(lines.length >= 2 && lines.length <= 4);
  assert.ok(lines.every((l) => textWidth(l, 92) <= 920));
});

test("the type standard: large headline, phone-readable body, shrinks only to fit", () => {
  const short = fitText("Which rooms get afternoon sun?", "Notice the windows, shade, and rooms you'll use most.", 920);
  assert.equal(short.size, TYPE.headline);
  assert.equal(short.bSize, TYPE.body);
  assert.ok(short.fits);
  const long = fitText("A very long headline that keeps going well past what three lines at the full size can hold on one slide", "", 920);
  assert.ok(long.size < TYPE.headline && long.size >= TYPE.headlineMin);
});

test("the approved style: white text, soft shadow, small wordmark, and no panels or backgrounds", () => {
  const svg = overlaySvg({ W: 1080, H: 1350, headline: "Headline", body: "Body copy", counter: "1/7" }).toString();
  assert.doesNotMatch(svg, /<rect|<path|<circle|linearGradient|radialGradient/);
  assert.match(svg, /fill="#FFFFFF"/);
  // Shadows are built only from the letters themselves (SourceAlpha), never a shape behind them.
  assert.match(svg, /<feGaussianBlur in="SourceAlpha"/);
  assert.match(svg, /flood-opacity="0\.\d+"/);
  assert.doesNotMatch(svg, /BackgroundImage|feImage/);
  assert.match(svg, /<tspan fill="#FFFFFF">LVI<\/tspan><tspan fill="#C8A46A">NIT<\/tspan>/);
});

test("text blocks stay clear of the wordmark at the bottom", () => {
  const svg = overlaySvg({ W: 1080, H: 1350, headline: "A long headline that wraps onto more than one line here", position: "bottom" }).toString();
  const ys = [...svg.matchAll(/<text x="\d+" y="(\d+)" font-family="Inter" font-weight="700"/g)].map((m) => Number(m[1]));
  assert.ok(Math.max(...ys) < 1350 - 90);
});
