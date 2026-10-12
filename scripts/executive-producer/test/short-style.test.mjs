// The permanent short-video creative standard: treatments, variety, branding.
import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import * as ST from "../lib/short-style.mjs";

test("branding: exact tagline, phone, the full-color Scofield logo, compliance line kept", () => {
  assert.equal(ST.TAGLINE, "Living Las Vegas from the Inside");
  assert.equal(ST.BRAND.phone, "702-779-9780");
  assert.equal(ST.BRAND.brokerage, "The Scofield Group");
  assert.equal(ST.BRAND.license, "NV License S.0175577");
  assert.match(ST.SCOFIELD_LOGO, /The_Scofield_Group_Full_Colored\.png$/);
});

test("end card renders at 1080x1920 without warnings when the logo is present", async () => {
  const out = join(mkdtempSync(join(tmpdir(), "ec-")), "end.png");
  const r = await ST.endCard(out, { cta: "lvinit.com/guides/aries-henderson" });
  const sharp = (await import("sharp")).default;
  const m = await sharp(out).metadata();
  assert.deepEqual([m.width, m.height], [1080, 1920]);
  assert.deepEqual(r.warnings, []);
});

test("three shorts in a week get three different treatments, least recently used first", () => {
  const week = [{ treatment: "kinetic" }, { treatment: "kinetic" }, {}];
  ST.assignTreatments(week, ["editorial", "documentary"]);
  assert.equal(new Set(week.map((p) => p.treatment)).size, 3);
  assert.equal(week[0].treatment, "kinetic");
  const fresh = [{}, {}, {}];
  ST.assignTreatments(fresh, ["editorial"]);
  assert.notEqual(fresh[0].treatment, "editorial");
});

test("treatments change transitions and length; cuts are near-instant", () => {
  const segs = [3, 3, 3, 3].map((dur) => ({ dur }));
  const ed = ST.styledDuration(segs, "editorial");
  const doc = ST.styledDuration(segs, "documentary");
  assert.ok(doc > ed, "documentary cuts more, so it runs longer than editorial dissolves");
  assert.equal(ST.transitionFor([{}, { transition: "cut" }], 1, "editorial").dur, 0.067);
  assert.equal(ST.transitionFor([{}, { transition: "nonsense" }], 1, "documentary").type, "cut");
});

test("variety: repeated openings, CTAs and pacing, crowded text and sales talk are flagged", () => {
  const mk = (open, cta, durs, extra = {}) => ({ cta, caption: "", segments: durs.map((dur, k) => ({ dur, headline: k ? `Beat ${k}` : open })), ...extra });
  const a = mk("This used to be a mine.", "Full guide on LVINIT", [3, 2.5, 4]);
  const b = mk("This used to be a mine.", "Full guide on LVINIT", [3, 2.5, 4]);
  const msgs = ST.varietyIssues(b, [a, b], []).map((i) => i.message).join(" | ");
  assert.match(msgs, /opening/);
  assert.match(msgs, /CTA repeats/);
  assert.match(msgs, /shot lengths/);
  const recent = ST.varietyIssues(mk("New opening", "Different CTA", [2, 3]), [], [mk("New opening", "x", [1])]);
  assert.match(recent.map((i) => i.message).join(" "), /opening/);
  const loud = mk("Fresh hook", "Call now before it's gone!", [3, 3]);
  assert.match(ST.varietyIssues(loud, [loud], []).map((i) => i.message).join(" "), /Sales language/);
  const crowded = { cta: "c", segments: [{ dur: 3, headline: "one two three four five six seven", body: "eight nine ten eleven twelve thirteen fourteen fifteen sixteen seventeen" }] };
  assert.match(ST.varietyIssues(crowded, [crowded], []).map((i) => i.message).join(" "), /words on screen/);
  assert.equal(ST.varietyIssues(mk("Clean hook", "See the guide", [3, 2]), [], []).length, 0);
});

test("serif headlines wrap with Playfair widths and stay within three lines", () => {
  const f = ST.fitsTreatment("Now it's Aries, east Henderson.", "About 3,000 homes planned.", "editorial", true);
  assert.ok(f.fits);
  assert.ok(f.lines.length <= 3);
  assert.equal(ST.fitsTreatment("word ".repeat(40), "", "kinetic").fits, false);
});

test("validation fails a short whose picture ends before its audio", async () => {
  const { execFileSync } = await import("node:child_process");
  const { validateShort } = await import("../lib/shorts.mjs");
  const f = join(mkdtempSync(join(tmpdir(), "trunc-")), "short.mp4");
  execFileSync("ffmpeg", ["-v", "error", "-y", "-f", "lavfi", "-i", "testsrc2=size=1080x1920:rate=30:duration=4", "-f", "lavfi", "-i", "sine=frequency=440:duration=18", "-c:v", "libx264", "-pix_fmt", "yuv420p", "-c:a", "aac", f]);
  const v = validateShort(f);
  assert.equal(v.ok, false);
  assert.match(v.problems.join(" "), /video stream is 4\.\d+s but the file is 18\.\d+s/);
});

test("end-card link fits the card: shrinks, then breaks after the last slash", () => {
  assert.deepEqual(ST.ctaLines("lvinit.com/guides/aries-henderson"), [{ text: "lvinit.com/guides/aries-henderson", size: 38 }]);
  const long = ST.ctaLines("lvinit.com/guides/sandstone-tule-springs-north-las-vegas");
  assert.ok(long.every((l) => l.size >= 24));
  assert.equal(long.map((l) => l.text).join(""), "lvinit.com/guides/sandstone-tule-springs-north-las-vegas");
});
