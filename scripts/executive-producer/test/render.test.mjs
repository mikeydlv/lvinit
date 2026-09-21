import test from "node:test";
import assert from "node:assert/strict";

import { wrap, overlaySvg } from "../lib/render.mjs";

test("text wraps inside the safe margins", () => {
  const lines = wrap("The closest thing Vegas has to a walk-everywhere neighborhood.", 64, 912);
  assert.ok(lines.length >= 2 && lines.length <= 4);
  assert.ok(lines.every((l) => l.length <= Math.floor(912 / (64 * 0.54))));
});

test("the approved style: white text, soft shadow, small wordmark, and no panels or backgrounds", () => {
  const svg = overlaySvg({ W: 1080, H: 1350, headline: "Headline", body: "Body copy", counter: "1/7" }).toString();
  assert.doesNotMatch(svg, /<rect|<path|<circle|linearGradient|radialGradient/);
  assert.match(svg, /fill="#FFFFFF"/);
  assert.match(svg, /feDropShadow[^>]*flood-opacity="0\.\d+"/);
  assert.match(svg, /<tspan fill="#FFFFFF">LVI<\/tspan><tspan fill="#C8A46A">NIT<\/tspan>/);
});

test("text blocks stay clear of the wordmark at the bottom", () => {
  const svg = overlaySvg({ W: 1080, H: 1350, headline: "A long headline that wraps onto more than one line here", position: "bottom" }).toString();
  const ys = [...svg.matchAll(/<text x="\d+" y="(\d+)" font-family="Inter" font-weight="700"/g)].map((m) => Number(m[1]));
  assert.ok(Math.max(...ys) < 1350 - 90);
});
