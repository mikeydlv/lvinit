import test from "node:test";
import assert from "node:assert/strict";

import { gateItem, extractUnits, extractAcres, extractTarget, topicsOf } from "../lib/detect.mjs";
import { statusFromSentence, detectStatus, isStatusChange, fromRosterStatus, STATUS } from "../lib/status.mjs";
import { triage } from "../lib/analyze.mjs";
import { contentHash } from "../lib/state.mjs";
import { config, raw, TODAY } from "./helpers.mjs";

const gate = (over) => gateItem({ title: "", snippet: "", via: "rj-business", authority: 8, ...over }, config.trends);

test("source normalization: tracking params stripped, same URL from two passes counted once", () => {
  const a = raw({ title: "County approves 400 homes in Summerlin", url: "https://www.reviewjournal.com/x/?utm_source=rss" });
  const b = raw({ title: "County approves 400 homes in Summerlin", url: "https://reviewjournal.com/x", via: "google-news-dev" });
  const t = triage([a, b], { config, today: TODAY, seen: {}, knownEntities: new Map() });
  assert.equal(t.passing.length + t.rejected.length, 1);
  assert.equal(t.duplicatesInRun.length, 1);
  const kept = [...t.passing, ...t.rejected][0];
  assert.equal(kept.url, "https://reviewjournal.com/x");
  assert.equal(kept.authority, 8);
});

test("already-processed documents are skipped; changed ones are re-read", () => {
  const a = raw({ title: "County approves 400 homes in Summerlin", url: "https://example.com/a" });
  const first = triage([a], { config, today: TODAY, seen: {}, knownEntities: new Map() });
  const url = [...first.passing, ...first.rejected][0].url;
  const seen = { [url]: { h: contentHash({ ...a, url }) } };
  assert.equal(triage([a], { config, today: TODAY, seen, knownEntities: new Map() }).unchanged.length, 1);
  const edited = { ...a, snippet: "Now with a new paragraph." };
  assert.equal(triage([edited], { config, today: TODAY, seen, knownEntities: new Map() }).unchanged.length, 0);
});

test("gate: meaningful development passes; noise and weak items do not", () => {
  assert.equal(gate({ title: "Clark County approves 1,200-home community in Summerlin" }).pass, true);
  assert.equal(gate({ title: "New taqueria opens in Henderson's Water Street District" }).reason, "small tenant / restaurant opening");
  assert.equal(gate({ title: "Overnight lane restrictions on the 215 Beltway this weekend in Las Vegas" }).reason, "routine maintenance / short closure");
  assert.equal(gate({ title: "Police arrest suspect near new Las Vegas apartment complex" }).reason, "crime / public safety");
  assert.equal(gate({ title: "Summerlin community ranks among top-selling master plans in Las Vegas" }).reason, "ceremonial / promotional announcement");
  assert.equal(gate({ title: "Las Vegas median home price rose 3% in August" }).reason, "market statistics (not a development)");
  assert.equal(gate({ title: "Nearly half of Clark County homes are not owner-occupied" }).pass, false, "describes, no change");
  assert.equal(gate({ title: "Carrot Top rushed to hospital in Las Vegas" }).pass, false, "a hospital visit is not a hospital project");
  assert.equal(gate({ title: "Anyone know what they're building in Summerlin?", via: "reddit", authority: 10 }).reason, "community post — a lead at most, never evidence");
});

test("gate: geography — out-of-valley stories drop; a local outlet's own feed counts as the valley", () => {
  assert.equal(gate({ title: "Las Vegas-to-Phoenix interchange project now 80% complete", snippet: "The work near Kingman, Arizona continues." }).reason, "outside the Las Vegas Valley");
  const local = gate({ title: "Boyd sells former casino site after housing project lands approvals" });
  assert.equal(local.pass, true);
  assert.deepEqual(local.areas, ["las-vegas"]);
  const google = gateItem({ title: "Boyd sells former casino site after housing project lands approvals", via: "google-news", authority: 8 }, config.trends);
  assert.equal(google.pass, false, "a search result with no location is not assumed local");
});

test("facts: unit counts, ambiguity, acreage, target dates", () => {
  assert.equal(extractUnits("Up to 6,000 homes, including 300 workforce-housing units").units, 6000);
  assert.equal(extractUnits("Up to 6,000 homes, including 300 workforce-housing units").ambiguous, false, "a small component is not a rival");
  assert.equal(extractUnits("The 1,200 homes in phase one of a 2,000-home plan").ambiguous, true);
  assert.equal(extractUnits("In 2026 homes sold slowly").units, null, "a year is not a count");
  assert.equal(extractAcres("on a 14.92 acre portion of a 17.72 acre site"), 17.72);
  assert.deepEqual(extractTarget("First homes are expected in spring 2028."), { targetYear: 2028, targetText: "spring 2028" });
  assert.deepEqual(topicsOf("New freeway interchange"), ["road"]);
});

test("status: verbatim language only, with time guards", () => {
  assert.equal(statusFromSentence("The Henderson City Council approved the plan Tuesday."), STATUS.APPROVED);
  assert.notEqual(statusFromSentence("The council is expected to approve the plan next month."), STATUS.APPROVED);
  assert.equal(statusFromSentence("Crews broke ground this week on the project."), STATUS.UNDER_CONSTRUCTION);
  assert.notEqual(statusFromSentence("Construction is expected to begin in 2027."), STATUS.UNDER_CONSTRUCTION);
  assert.notEqual(statusFromSentence("The park is set to open in 2027."), STATUS.OPEN);
  assert.notEqual(statusFromSentence("The other tunnel, which opened last year, serves local traffic."), STATUS.OPEN);
  assert.notEqual(statusFromSentence("A grand opening is set for Oct. 16."), STATUS.OPEN);
  assert.equal(statusFromSentence("Fixture Station Park is now open to the public."), STATUS.OPEN);
  assert.equal(statusFromSentence("The project is 80% complete."), STATUS.UNDER_CONSTRUCTION);
  assert.equal(statusFromSentence("Demolition began in January on the old City Hall."), STATUS.PRE_CONSTRUCTION);
  assert.equal(statusFromSentence("The opening has been pushed back to 2028."), STATUS.DELAYED);
  assert.equal(statusFromSentence("Traffic delays expected on I-15."), STATUS.UNCLEAR, "traffic delays are not a project delay");
  assert.equal(statusFromSentence("The developer scrapped the project in August."), STATUS.CANCELLED);
  assert.equal(statusFromSentence("Commissioners denied the rezoning."), STATUS.DENIED);
  assert.equal(statusFromSentence("Construction is on hold."), STATUS.PAUSED);
});

test("status: marketing language never establishes construction; builder 'opens' a community = partially open", () => {
  assert.equal(detectStatus("Model homes coming soon. Join the VIP interest list.").status, STATUS.UNCLEAR);
  assert.equal(detectStatus("KB Home opens Sandstone, a new master-planned community.", { residentialCommunity: true }).status, STATUS.PARTIALLY_OPEN);
  assert.equal(detectStatus("Construction began in 2024. The project is now on hold.").status, STATUS.PAUSED, "a side state wins");
});

test("status change: up the ladder, side states, never down, roster labels", () => {
  assert.equal(isStatusChange("approved", "under construction"), true);
  assert.equal(isStatusChange("under construction", "approved"), false, "a vaguer later story never downgrades");
  assert.equal(isStatusChange("under construction", "delayed"), true);
  assert.equal(isStatusChange("paused", "under construction"), true, "work resumed");
  assert.equal(isStatusChange("planned", "approved"), false, "roster 'planned' already covers approval");
  assert.equal(isStatusChange("planned", "under construction"), true);
  assert.equal(fromRosterStatus("under-construction"), STATUS.UNDER_CONSTRUCTION);
});
