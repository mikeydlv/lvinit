import test from "node:test";
import assert from "node:assert/strict";

import { RUMORED, NOT_A_PROJECT, statusSupportedBy, validateStatus, detectStatus, mergeStatus } from "../lib/status.mjs";

const item = (over = {}) => ({
  id: "c-1",
  tier: "news",
  title: "Henderson council approves Fixture Ridge community",
  snippet: "The council voted to approve the project. Construction is set to begin next year.",
  excerpt: "",
  ...over,
});

test("each status needs its own language", () => {
  assert.equal(statusSupportedBy("Crews broke ground Monday on the project"), "UNDER CONSTRUCTION");
  assert.equal(statusSupportedBy("The council approved the plan 5-0"), "APPROVED");
  assert.equal(statusSupportedBy("The developer filed a site plan with the county"), "FILED");
  assert.equal(statusSupportedBy("The company unveiled plans for a resort"), "PROPOSED");
  assert.equal(statusSupportedBy("The store is now open on Monday"), "OPEN");
  assert.equal(statusSupportedBy("Residents are talking about the empty lot"), RUMORED);
});

test("a future opening is not OPEN", () => {
  assert.notEqual(statusSupportedBy("The park is set to open in 2027"), "OPEN");
  assert.notEqual(statusSupportedBy("Doors will open next spring"), "OPEN");
});

test("a dated past reference is not this project's status", () => {
  assert.notEqual(statusSupportedBy("Brazen Architecture, which opened in the Commercial Center in 2021, said the plaza thrived"), "OPEN");
  assert.equal(statusSupportedBy("Builder opens big new community at former mining site in Henderson"), "OPEN");
  assert.equal(statusSupportedBy("The store opened this week at the corner of Fixture and Main"), "OPEN");
});

test("a verbatim, supporting quote is accepted", () => {
  const it = item();
  const r = validateStatus({ status: "APPROVED", evidence: "The council voted to approve the project", evidenceId: "c-1" }, new Map([["c-1", it]]), [it]);
  assert.equal(r.status, "APPROVED");
  assert.equal(r.note, null);
});

test("a quote that is not in the source falls back to what the source states", () => {
  const it = item();
  const r = validateStatus({ status: "UNDER CONSTRUCTION", evidence: "Crews broke ground on Fixture Ridge", evidenceId: "c-1" }, new Map([["c-1", it]]), [it]);
  assert.equal(r.status, "APPROVED");
  assert.match(r.note, /not in the source text/);
  assert.ok(it.title.includes("approves") || it.snippet.includes(r.evidence));
});

test("a fallback never goes above the claimed status", () => {
  const it = item({ snippet: "Crews broke ground Monday." });
  const r = validateStatus({ status: "FILED", evidence: "invented quote that is not there", evidenceId: "c-1" }, new Map([["c-1", it]]), [it]);
  assert.ok(["FILED", "PROPOSED", RUMORED].includes(r.status));
});

test("no supporting text at all holds at RUMORED / UNCONFIRMED", () => {
  const it = item({ title: "People wonder about Fixture lot", snippet: "Nobody knows yet." });
  const r = validateStatus({ status: "APPROVED", evidence: "The council approved it", evidenceId: "c-1" }, new Map([["c-1", it]]), [it]);
  assert.equal(r.status, RUMORED);
  assert.equal(r.evidence, null);
});

test("social posts are never evidence", () => {
  const it = item({ tier: "social", title: "I heard the council approved Fixture Ridge" });
  const r = validateStatus({ status: "APPROVED", evidence: "I heard the council approved Fixture Ridge", evidenceId: "c-1" }, new Map([["c-1", it]]), [it]);
  assert.equal(r.status, RUMORED);
  assert.equal(detectStatus(it).status, RUMORED);
});

test("an unknown evidence id is rejected", () => {
  const r = validateStatus({ status: "OPEN", evidence: "now open", evidenceId: "c-nope" }, new Map(), []);
  assert.equal(r.status, RUMORED);
});

test("questions and trends are not projects", () => {
  assert.equal(validateStatus({ status: NOT_A_PROJECT }, new Map()).status, NOT_A_PROJECT);
});

test("watched status only ever moves up", () => {
  assert.deepEqual(mergeStatus("APPROVED", { status: "PROPOSED" }), { status: "APPROVED", changed: false });
  assert.deepEqual(mergeStatus("APPROVED", { status: "UNDER CONSTRUCTION" }), { status: "UNDER CONSTRUCTION", changed: true });
  assert.deepEqual(mergeStatus(null, { status: "FILED" }), { status: "FILED", changed: false });
});
