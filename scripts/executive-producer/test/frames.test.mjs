import test from "node:test";
import assert from "node:assert/strict";

import { candidatesFor, closestItems } from "../lib/frames.mjs";

const catalog = {
  items: [
    { path: "Images/las-vegas-mortgage-rates-valley-homes.png", folder: "Images", type: "image", role: "library-photo", subject: "las vegas mortgage rates valley homes" },
    { path: "Images/lvinit-city-of-henderson-sign.png", folder: "Images", type: "image", role: "library-photo", subject: "lvinit city of henderson sign" },
    { path: "Images/chapter-card.png", folder: "Images", type: "image", role: "graphic", subject: "mortgage rates valley homes card" },
    { path: "Drone/summerlin-overlook.mp4", folder: "Drone", type: "video", role: "b-roll", durationSec: 40, subject: "summerlin overlook drone" },
  ],
};

test("a subject line used as a path resolves to the real file", () => {
  const c = candidatesFor({ folder: "Images/las vegas mortgage rates valley homes", want: "homes across the valley" }, catalog, "C:/x");
  assert.equal(c[0].path, "Images/las-vegas-mortgage-rates-valley-homes.png");
  assert.ok(!c.some((x) => x.path === "Images/chapter-card.png"), "graphics are never candidates");
});

test("a made-up clip resolves to spaced frames of the closest approved clip", () => {
  const c = candidatesFor({ clip: "Drone/summerlin overlook golden.mp4", want: "Summerlin from above" }, catalog, "C:/x");
  assert.deepEqual(c.map((x) => x.t), [10, 20, 30]);
});

test("nothing close enough still fails clearly", () => {
  assert.equal(closestItems({ folder: "Images/strip at night", want: "neon" }, catalog.items).length, 0);
  assert.throws(() => candidatesFor({ folder: "Images/strip at night", want: "neon" }, catalog, "C:/x"), /No approved footage/);
});
