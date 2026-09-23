import test from "node:test";
import assert from "node:assert/strict";

import { matchKnownEntity, extractProjectName, legistarApplicant, legistarPlanningArea, resolveEntities } from "../lib/entity.mjs";
import { buildKnownEntities, parseRoster, coverageFor, loadCoverage } from "../lib/coverage.mjs";
import { readItem, observe, detectChanges, changeClass, fingerprint } from "../lib/events.mjs";
import { buildEvents } from "../lib/analyze.mjs";
import { scoreEvent } from "../lib/score.mjs";
import { SEED_ENTITIES } from "../entities.mjs";
import { config, item, entity, coverage, emptyState, published, TODAY } from "./helpers.mjs";

const run = (items, { known = [], state = emptyState(), cov = coverage(), pub = published() } = {}) =>
  buildEvents(items, { config, today: TODAY, known: new Map(known.map((e) => [e.id, e])), state, coverage: cov, published: pub }).events;

test("entity: aliases are one project; ordinary words are not a project", () => {
  const sport = entity({ id: "DEV-HSS", name: "Henderson Sport & Social", aliases: ["Henderson Sport & Social", "Henderson Sport and Social", "West Henderson Fieldhouse"] });
  const life = entity({ id: "DEV-LT", name: "Life Time", aliases: [], contextAliases: [{ alias: "Life Time", requires: /\b(Durango|Sunset)\b/ }] });
  assert.equal(matchKnownEntity({ title: "West Henderson Fieldhouse sets opening date" }, [sport])?.entity.id, "DEV-HSS");
  assert.equal(matchKnownEntity({ title: "Henderson Sport and Social opens Oct. 16" }, [sport])?.entity.id, "DEV-HSS");
  assert.equal(matchKnownEntity({ title: "A life time of memories in Summerlin" }, [life]), null, "case-sensitive: an ordinary phrase is not the gym");
  assert.equal(matchKnownEntity({ title: "Life Time opens in Las Vegas" }, [life]), null, "context alias needs its context");
  assert.equal(matchKnownEntity({ title: "Life Time opens at Durango and Sunset" }, [life])?.entity.id, "DEV-LT");
});

test("entity: names from sources, Clark County applicants, and provisional grouping", () => {
  assert.equal(extractProjectName({ title: "Crews break ground on Fixture Ridge, a 350-home community in Skye Canyon" }), "Fixture Ridge");
  assert.equal(extractProjectName({ title: "Proposed redevelopment project aims to revive Las Vegas’ historic Commercial Center" }), "Commercial Center");
  assert.equal(extractProjectName({ title: "Las Vegas-to-Phoenix interchange project now 80% complete" }), null, "two places are not a name");
  assert.equal(extractProjectName({ title: "Las Vegas City Council approves new homes project" }), null);
  assert.equal(extractProjectName({ title: "Wayne Newton’s former compound penciled for housing development", snippet: "Wayne Newton’s former Casa de Shenandoah near Sunset Park, could be turned into homes. The Casa de Shenandoah project is proposed." }), "Casa de Shenandoah");
  assert.equal(extractProjectName({ title: "Downtown intersection closed", snippet: "Casino Center and Las Vegas boulevards are recommended detours." }), null, "a street is not a project");
  assert.equal(extractProjectName({ title: "Mystery warehouse project planned near homes" }), null, "sentence case is not a name");
  assert.equal(extractProjectName({ title: "Intersection closed", snippet: "The Charleston Boulevard storm drain project closes lanes." }), null, "a street is not a project");
  const t = "TM-26-500098-ROOHANI KHUSROW FAMILY TRUST ET AL: TENTATIVE MAP for 113 lots. Generally located west of Dean Martin Drive within Enterprise. JJ/rg";
  assert.equal(legistarApplicant(t), "ROOHANI KHUSROW FAMILY TRUST ET AL");
  assert.equal(legistarPlanningArea(t), "Enterprise");
  const a = item({ title: "Mystery warehouse project planned near homes in Southwest Las Vegas", areas: ["southwest"], topics: ["employment"] });
  const b = item({ title: "Southwest Las Vegas warehouse project planned near homes, county says", areas: ["southwest"], topics: ["employment"] });
  const { assignments } = resolveEntities([a, b], new Map());
  assert.equal(assignments.get(a.id).entityId, assignments.get(b.id).entityId, "same story, two outlets → one provisional project");
  assert.match(assignments.get(a.id).entityId, /^DEV-P-/);
});

test("roster parsing and existing-content matching against the real site", () => {
  const src = `export const developmentProjects: DevelopmentProject[] = [\n  {\n    name: "Test Park",\n    status: "planned",\n    where: "Somewhere",\n    what: "A park.",\n    source: {\n      label: "City",\n      url: "https://example.gov/park",\n    },\n  },\n];`;
  assert.deepEqual(parseRoster(src).map((r) => [r.name, r.status, r.source.url]), [["Test Park", "planned", "https://example.gov/park"]]);

  const cov = loadCoverage({ repoRoot: process.cwd(), today: TODAY });
  const known = buildKnownEntities({ seeds: SEED_ENTITIES, rosters: cov.rosters });
  const mh = coverageFor(known.get("DEV-MONUMENT-HILLS"), cov);
  assert.equal(mh[0].route, "/guides/monument-hills-northwest-las-vegas");
  assert.equal(mh[0].kind, "dedicated");
  const station = coverageFor(known.get("DEV-INSPIRADA-STATION"), cov);
  assert.equal(station[0].kind, "roster");
  assert.equal(station[0].route, "/neighborhoods/henderson");
  assert.equal(station[0].publishedStatus, "planned");
  assert.equal(known.get("DEV-HENDERSON-SPORT-SOCIAL").baseline.status, "under construction", "roster status is the baseline");
});

test("fingerprint: same state → same fingerprint; any material fact change → new one", () => {
  const f = fingerprint("DEV-X", { status: "approved", units: 1500, targetYear: 2028 });
  assert.equal(f, fingerprint("DEV-X", { status: "approved", units: 1501, targetYear: 2028 }), "rounding noise is not a change");
  assert.notEqual(f, fingerprint("DEV-X", { status: "under construction", units: 1500, targetYear: 2028 }));
  assert.notEqual(f, fingerprint("DEV-X", { status: "approved", units: 2000, targetYear: 2028 }));
  assert.notEqual(f, fingerprint("DEV-X", { status: "approved", units: 1500, targetYear: 2029 }));
  assert.match(f, /^[0-9a-f]{12}$/);
});

test("dedupe: four outlets on one approval become ONE event with four sources", () => {
  const known = [entity({ id: "DEV-RIDGE", name: "Fixture Ridge", aliases: ["Fixture Ridge"] })];
  const items = [
    item({ title: "Council approves Fixture Ridge homes in Summerlin", sourceName: "City of Las Vegas newsroom", authority: 1, via: "city-lv-news" }),
    item({ title: "Fixture Ridge approved by council", sourceName: "Las Vegas Review-Journal" }),
    item({ title: "Fixture Ridge gets approval", sourceName: "KTNV" }),
    item({ title: "Fixture Ridge approved in Summerlin", sourceName: "8 News Now" }),
  ];
  const events = run(items, { known });
  assert.equal(events.length, 1);
  assert.equal(events[0].sources.length, 4);
  assert.equal(events[0].sources[0].authority, 1, "the primary source is listed first");
});

test("change detection: new, duplicate, status change, scale change, timeline change", () => {
  const base = entity({ id: "DEV-M", name: "Fixture Mesa", aliases: ["Fixture Mesa"], baseline: { status: "approved", units: 800, targetYear: 2028, targetKind: "opening", from: "/guides/x", origin: "dedicated article" } });
  const one = (it) => run([item(it)], { known: [base] })[0];

  assert.equal(run([item({ title: "Brand New Place, a 300-home community, approved in Summerlin" })])[0].changeClass, "NEW");
  assert.equal(one({ title: "Fixture Mesa was approved for 800 homes in Summerlin" }).changeClass, "DUPLICATE");
  const up = one({ title: "Crews broke ground this week on Fixture Mesa in Summerlin", snippet: "Crews broke ground this week on Fixture Mesa." });
  assert.equal(up.changeClass, "MATERIAL_UPDATE");
  assert.equal(up.priorStatus, "approved");
  assert.equal(up.status, "under construction");
  const scale = one({ title: "Fixture Mesa increased to 1,200 homes in Summerlin", sourceName: "City of Las Vegas newsroom", authority: 1 });
  assert.ok(scale.changes.some((c) => c.kind === "SCALE_CHANGED"));
  const later = one({ title: "Fixture Mesa first homes now expected in 2030", snippet: "First homes are now expected to open in 2030." });
  assert.ok(later.changes.some((c) => c.kind === "TIMELINE_CHANGED" && c.to === 2030));
  assert.equal(later.eventType, "delay");
});

test("conflicts: preserved, confidence Low, manual research", () => {
  const events = run([
    item({ title: "Fixture Heights approved for 1,200 homes in Summerlin", sourceName: "8 News Now" }),
    item({ title: "Fixture Heights approved with 2,000 homes in Summerlin", sourceName: "News 3" }),
  ], { known: [entity({ id: "DEV-FH", name: "Fixture Heights", aliases: ["Fixture Heights"] })] });
  const ev = events[0];
  assert.equal(ev.changeClass, "CONFLICT");
  assert.equal(ev.confidence, "Low");
  assert.equal(ev.action, "MANUAL_RESEARCH_REQUIRED");
  assert.equal(ev.conflicts[0].sides.length, 2, "both sides preserved");
  const status = run([
    item({ title: "Fixture Plaza construction halted in Summerlin", snippet: "Construction is on hold.", sourceName: "RJ" }),
    item({ title: "Fixture Plaza under construction in Summerlin", snippet: "Fixture Plaza is under construction.", sourceName: "KTNV" }),
  ], { known: [entity({ id: "DEV-FP", name: "Fixture Plaza", aliases: ["Fixture Plaza"] })] })[0];
  assert.equal(status.changeClass, "CONFLICT");
});

test("scoring: a certain neighborhood change can outscore a giant, distant one", () => {
  const obs = (o) => ({ status: "approved", units: null, acres: null, dollars: null, conflicts: [], ...o });
  const park = scoreEvent({ entity: { type: "park" }, obs: obs({}), changeClass: "NEW", eventType: "approval", topics: ["park"], areaTier: 1, coverage: [{ kind: "roster" }], pillar: true, bestAuthority: 1, evidenceClass: "primary-body" });
  const resort = scoreEvent({ entity: { type: "casino-resort" }, obs: obs({ dollars: "$3 billion", acres: 40 }), changeClass: "NEW", eventType: "announcement", topics: ["casino-resort"], areaTier: 2, coverage: [], pillar: false, bestAuthority: 8, evidenceClass: "news-headline" });
  assert.ok(park.score > resort.score, `${park.score} > ${resort.score}`);
  assert.equal(Object.values(park.components).reduce((a, b) => a + b, 0), park.score);
});

test("confidence is separate from score: primary High, news Medium, headline Low, early capped", () => {
  const e = entity({ id: "DEV-C", name: "Fixture Crossing", aliases: ["Fixture Crossing"] });
  const one = (it) => run([item(it)], { known: [e] })[0];
  assert.equal(one({ title: "Fixture Crossing approved in Summerlin", snippet: "The City Council approved Fixture Crossing on Tuesday.", sourceName: "City of Las Vegas newsroom", authority: 1 }).confidence, "High");
  assert.equal(one({ title: "Fixture Crossing news in Summerlin", snippet: "The City Council approved Fixture Crossing on Tuesday.", sourceName: "RJ" }).confidence, "Medium");
  assert.equal(one({ title: "Fixture Crossing now open in Summerlin", sourceName: "RJ" }).confidence, "Low", "headline-only opening claim");
  assert.equal(one({ title: "Fixture Crossing application filed in Summerlin", snippet: "An application was filed for Fixture Crossing.", sourceName: "Clark County", authority: 2 }).confidence, "Medium", "early filing is capped");
});

test("classification: update vs new vs neighborhood guide vs brief input vs monitor", () => {
  const cov = coverage({ pages: [{ route: "/guides/fixture-mesa", title: "Fixture Mesa guide" }] });
  const covered = entity({ id: "DEV-CM", name: "Fixture Mesa", aliases: ["Fixture Mesa"], routes: ["/guides/fixture-mesa"], baseline: { status: "approved", from: "/guides/fixture-mesa", origin: "dedicated article" } });
  const upd = run([item({ title: "Fixture Mesa breaks ground in Summerlin", snippet: "Crews broke ground on Fixture Mesa this week.", sourceName: "City of Las Vegas newsroom", authority: 1 })], { known: [covered], cov })[0];
  assert.equal(upd.action, "UPDATE_EXISTING_ARTICLE");
  assert.equal(upd.target, "/guides/fixture-mesa");

  const early = run([item({ title: "Fixture Point, a 900-home community, proposed in Summerlin", snippet: "Developers proposed Fixture Point, a 900-home community.", sourceName: "City of Las Vegas newsroom", authority: 1 })], { cov })[0];
  assert.ok(["CONTENT_BRIEF_INPUT", "MONITOR_ONLY"].includes(early.action), "too early for new content");
  assert.notEqual(early.action, "NEW_DEVELOPMENT_ARTICLE");

  const guide = run([item({ title: "Fixture Trail, a new park, approved in Summerlin", snippet: "The City Council approved Fixture Trail, a new park.", topics: ["park"], sourceName: "City of Las Vegas newsroom", authority: 1 })], { cov })[0];
  assert.equal(guide.action, "ADD_TO_NEIGHBORHOOD_GUIDE");
  assert.equal(guide.target, "/neighborhoods/summerlin");

  const low = run([item({ title: "Something Summerlin approval rumored", areas: ["summerlin"] })], { cov })[0];
  assert.ok(["MONITOR_ONLY", "REJECT_LOW_VALUE"].includes(low.action));
});

test("low value is rejected; monitor-only never hands off", () => {
  const far = run([item({ title: "Pressure washing company expands to Las Vegas homes", areas: ["las-vegas"], topics: ["residential"], sourceName: "StreetInsider", authority: 9 })])[0];
  assert.equal(far.action, "REJECT_LOW_VALUE");
  assert.equal(far.handoff.eligible, false);
});

test("Fair Housing: a protected-class project is reported objectively but never handed off; our own text is checked too", () => {
  const ev = run([item({ title: "Council approves Fixture Gardens, a 55+ active adult community of 600 homes in Henderson", snippet: "The City Council approved Fixture Gardens, an age-restricted 55+ community of 600 homes.", areas: ["henderson"], sourceName: "City of Henderson newsroom", authority: 1 })])[0];
  assert.equal(ev.fairHousing.sensitiveSubject, true);
  assert.ok(ev.handoff.blockers.includes("FAIR_HOUSING_SUBJECT"));
  assert.equal(ev.fairHousing.framingClean, true, "the interpretation never describes who a place is for");
  assert.doesNotMatch(`${ev.interpretation} ${ev.recommendation}`, /famil|safe|school|senior|retire/i);
});

test("promotional builder posts never establish construction or opening", () => {
  const ev = run([item({ title: "Fixture Vista homes now selling in Henderson with limited-time incentives", snippet: "Fixture Vista is now open for sales. Join the VIP list.", areas: ["henderson"], sourceName: "Cadence news", authority: 5, via: "cadence-news" })])[0];
  assert.equal(ev.promotionalOnly, true);
  assert.equal(ev.confidence, "Low");
  assert.ok(ev.handoff.blockers.includes("PROMOTIONAL_ONLY"));
});

test("queue eligibility and duplicate-handoff prevention", () => {
  const cov = coverage();
  const make = () => item({ title: "TM-26-1-BIG HOMES LLC: TENTATIVE MAP consisting of 420 single-family residential lots on 61 acres within Enterprise.", snippet: "Clark County Zoning Commission agenda: Approved (Pass).", via: "legistar", authority: 2, sourceName: "Clark County Zoning Commission", areas: ["southwest"], topics: ["residential", "land"], valleyByConstruction: true });
  const ev = run([make()], { cov })[0];
  assert.equal(ev.confidence, "High");
  assert.equal(ev.handoff.eligible, true, ev.handoff.reasons.join("; "));
  const again = run([make()], { cov, pub: published([ev.fingerprint]) })[0];
  assert.equal(again.handoff.eligible, false);
  assert.ok(again.handoff.blockers.includes("ALREADY_PUBLISHED"));
  assert.equal(again.lifecycle, "PUBLISHED");
  const noGit = run([make()], { cov, pub: { available: false, fingerprints: new Map() } })[0];
  assert.ok(noGit.handoff.blockers.includes("PUBLISHER_STATUS_UNVERIFIED"));
});

test("readItem/observe: headline evidence is labelled as headline even with punctuation", () => {
  const it = item({ title: "Fore Property Breaks Ground on Jewel, New Luxury Mixed-Use Community in Southwest Las Vegas" });
  const r = readItem(it, entity());
  assert.equal(r.status, "under construction");
  assert.equal(r.evidenceIn, "headline");
  const withBody = readItem({ ...it, excerpt: "Fore Property broke ground Tuesday on Jewel in Southwest Las Vegas." }, entity());
  assert.equal(withBody.evidenceIn, "body", "article text preferred");
  const obs = observe(entity(), [it], new Map([[it.id, r]]), config);
  const { changes } = detectChanges(entity(), null, obs, { itemsById: new Map([[it.id, it]]), config });
  assert.equal(changeClass(changes), "NEW");
});
