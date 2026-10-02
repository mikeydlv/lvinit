import { test } from "node:test";
import assert from "node:assert/strict";

import { classifySpokenSentence, decayFamilies, verificationChecklist, analyzeClaims } from "../lib/claims.mjs";
import { TODAY } from "./helpers.mjs";

const c = (text) => classifySpokenSentence(text, { today: TODAY });

test("factual claim flags: a figure said on camera is a fact to verify", () => {
  const r = c("The median single-family price was $475,000 in August.");
  assert.equal(r.kind, "fact");
  assert.ok(r.needsVerification);
  assert.equal(r.transcriptSufficient, false);
});

test("freshness flags: rate", () => {
  assert.ok(c("Mortgage rates are sitting around 7% right now.").families.includes("rate"));
});

test("freshness flags: price", () => {
  assert.ok(c("Right now the typical starter home costs about $310,000.").families.includes("price"));
});

test("freshness flags: HOA", () => {
  const r = c("HOA dues out there run about $95 a month.");
  assert.ok(r.families.includes("hoa"));
  assert.ok(r.needsVerification);
});

test("freshness flags: incentives and development status", () => {
  assert.ok(decayFamilies("Builders are offering incentives right now.").includes("incentive"));
  assert.ok(c("The new community is under construction and should open by spring 2028.").families.some((f) => ["construction-timeline", "development-status"].includes(f)));
});

test("freshness flags: commute claim", () => {
  assert.ok(c("It's about a 25 minute drive to the Strip from there.").families.includes("commute"));
});

test("Mikey's opinion is separated from fact, and the transcript is enough for it", () => {
  const r = c("If I were moving here, I'd rent for six months first and learn the valley.");
  assert.equal(r.kind, "opinion");
  assert.equal(r.needsVerification, false);
  assert.equal(r.transcriptSufficient, true);
});

test("an opinion wrapped around a decaying figure still gets checked", () => {
  const r = c("I think rates around 7% right now are fine for most buyers.");
  assert.ok(r.needsVerification);
  assert.ok(r.families.includes("rate"));
});

test("sweeping statements are unclear, not facts", () => {
  const r = c("Everybody who moves here ends up in Henderson.");
  assert.equal(r.kind, "unclear");
  assert.ok(r.needsVerification);
});

test("spoken-language noise is not a fact: clock times, hypotheticals, hedged opinions", () => {
  // Advice about WHEN to drive, not a commute measurement.
  assert.equal(c("And there's a huge difference between looking at a commute on your phone at 11:00 in the morning and actually driving it at 5:00 on a Tuesday.").needsVerification, false);
  // A made-up example, not a statistic.
  assert.equal(c("Maybe you're 80% sure you want Summerlin, but you want to experience the commute.").needsVerification, false);
  // Hedged first-person judgement.
  assert.equal(c("But I also think always rent for a year when you relocate gets repeated way too much.").kind, "opinion");
  // A development category with no project in the sentence.
  assert.equal(c("Renting first doesn't automatically have to mean putting your life on hold for an entire year.").kind, "narrative");
  // …but a hypothetical that carries a market figure is still checked.
  assert.ok(c("Let's say rates drop to 6% next year.").needsVerification);
});

test("verification checklist: claim, reason, source type, transcript never sufficient, deduped", () => {
  const { sentences } = analyzeClaims(
    [
      { index: 0, text: "Mortgage rates are sitting around 7% right now.", timecode: "1:00" },
      { index: 1, text: "Mortgage rates are sitting around 7% right now.", timecode: "5:00" },
      { index: 2, text: "I'd learn the valley before I buy anything.", timecode: "2:00" },
    ],
    { today: TODAY }
  );
  const list = verificationChecklist(sentences);
  assert.equal(list.length, 1);
  const item = list[0];
  for (const k of ["claim", "reason", "preferredSourceType", "transcriptSufficient", "timecode"]) assert.ok(k in item, k);
  assert.equal(item.transcriptSufficient, false);
  assert.match(item.preferredSourceType, /Freddie Mac/);
});
