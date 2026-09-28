import test from "node:test";
import assert from "node:assert/strict";

import { checkDuplicate, checkSuperlatives, checkFinancial, checkGeneric, checkRepeatedSources, tagsFor, primaryTags } from "../lib/gate.mjs";

const post = (o) => ({ day: "Mon", title: "", takeaway: "", caption: "", slides: [], sources: [], ...o });

test("duplicate: the pilot's new-build carousel is caught by Mikey's recent Reels", () => {
  const ledger = [{ date: "2026-09-11", source: "instagram", text: "A $500K new build and a $500K resale can look equal on paper. But one might still need landscaping" }];
  const p = post({ title: "A new build's price isn't the finished price", takeaway: "Compare finished cost and full monthly cost, not list prices." });
  assert.equal(checkDuplicate(p, ledger, "2026-09-28").length, 1);
});

test("duplicate: an area alone isn't a duplicate of a different angle, but a repeated batch topic is", () => {
  const ledger = [{ date: "2026-09-17", source: "instagram", text: "Monument Hills 6,000 homes in northwest Las Vegas" }];
  const p = post({ title: "What living next to Red Rock changes in Summerlin", takeaway: "A daily-life benefit and a tradeoff." });
  assert.equal(checkDuplicate(p, ledger, "2026-09-28").length, 0);
  const old = [{ date: "2026-08-01", source: "instagram", text: "new build vs resale" }];
  assert.equal(checkDuplicate(post({ title: "New build vs resale" }), old, "2026-09-28").length, 0); // outside 21 days
});

test("superlative: LVINIT's own claim isn't enough; the pilot's hooks are flagged", () => {
  const onlyOwnArticle = []; // gate passes official/news quotes only
  const arts = post({ slides: [{ headline: "The closest thing Vegas has to a walk-everywhere neighborhood." }] });
  assert.equal(checkSuperlatives(arts, onlyOwnArticle).length, 1);
  const sw = post({ slides: [{ headline: '"Southwest Las Vegas" isn\'t on any official map.' }] });
  assert.equal(checkSuperlatives(sw, onlyOwnArticle).length, 1);
});

test("superlative: supported when an official sentence says it about the same thing", () => {
  const p = post({ slides: [{ headline: "Henderson is Nevada's second-largest city." }] });
  assert.equal(checkSuperlatives(p, ["Henderson is the second-largest city in Nevada."]).length, 0);
  assert.equal(checkSuperlatives(p, ["Las Vegas is the largest city in Nevada."]).length, 1);
});

test("financial: needs an official or news source checked recently, and never implies availability", () => {
  const tax = post({ slides: [{ headline: "Nevada caps owner-occupied tax increases at 3% a year." }] });
  assert.equal(checkFinancial(tax, "2026-09-28").length, 1);
  tax.sources = [{ claim: "3% cap", url: "https://www.clarkcountynv.gov/...", authority: "official", checked: "2026-09-21" }];
  assert.equal(checkFinancial(tax, "2026-09-28").length, 0);
  tax.sources[0].checked = "2026-07-01";
  assert.equal(checkFinancial(tax, "2026-09-28").length, 1);
  const program = post({ slides: [{ headline: "$20,000 for essential workers, still available" }], sources: [{ claim: "program", url: "x", authority: "official", checked: "2026-09-27" }] });
  assert.ok(checkFinancial(program, "2026-09-28").some((i) => /available/.test(i.message)));
  const oldCount = post({ slides: [{ headline: "$20,000 program" }], sources: [{ claim: "81 of 900 funded", url: "x", authority: "news", checked: "2026-09-21", asOf: "2026-01-08" }] });
  assert.ok(checkFinancial(oldCount, "2026-09-28").some((i) => /older than 6 months/.test(i.message)));
});

test("generic: advice with no Las Vegas detail on the images is flagged", () => {
  assert.equal(checkGeneric(post({ slides: [{ headline: "Get pre-approved before you shop" }] })).length, 2);
  assert.equal(checkGeneric(post({ slides: [{ headline: "In Summerlin, the 215 is under construction" }] })).length, 0);
});

test("images: the same file and moment twice (this week or last week) is caught", () => {
  const week = {
    weekOf: "2026-09-28",
    posts: [
      { day: "Mon", slides: [{ src: { path: "Media/A/clip.MP4", t: 16 } }] },
      { day: "Fri", slides: [{ src: { path: "Media/A/clip.MP4", t: 18 } }, { src: { path: "Media/B/photo.jpg" } }] },
    ],
  };
  const prev = [{ weekOf: "2026-09-21", posts: [{ day: "Sat", slides: [{ src: { path: "Media/B/photo.jpg" } }] }] }];
  const issues = checkRepeatedSources(week, prev);
  assert.equal(issues.get("Fri").length, 2);
});

test("topic tags drive duplicate checks", () => {
  assert.deepEqual(tagsFor("HOA dues and SID assessments"), ["hoa-sid-lid"]);
  assert.ok(primaryTags(post({ title: "Your first Las Vegas summer", takeaway: "AC is a utility" })).includes("summer-heat"));
});
