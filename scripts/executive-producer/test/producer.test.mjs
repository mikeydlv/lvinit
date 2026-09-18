import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { loadConfig } from "../config.mjs";
import { buildCandidates, shortlist, areasFor, formatSignals } from "../lib/candidates.mjs";
import { matchFootage, reuseScore } from "../lib/footage.mjs";
import { numbersIn, numberInSource, validateJudgment, buildSystemPrompt, JUDGMENT_SCHEMA } from "../lib/judge.mjs";
import { finalize, selectPicks, weightedTotal, recordingMinutes } from "../lib/score.mjs";
import { judgeWithRules } from "../lib/heuristic.mjs";
import { fixtureInputs, fixtureJudgment, FIXTURE_CATALOG } from "../fixtures/fixture-inputs.mjs";
import { run } from "../run.mjs";

const config = loadConfig();
const TODAY = "2026-09-21";

function pipeline(judgment = fixtureJudgment) {
  const inputs = fixtureInputs(TODAY);
  const candidates = buildCandidates({ inputs, config, today: TODAY });
  const short = shortlist(candidates, config);
  const matches = new Map(short.map((c) => [c.id, matchFootage(c, inputs.catalog, config)]));
  const judged = validateJudgment(judgment, { shortlist: short, matches });
  const finalized = finalize(judged.assessments, matches, config);
  const byId = new Map(candidates.map((c) => [c.id, c]));
  return { inputs, candidates, short, matches, judged, finalized, byId, ...selectPicks(finalized, byId, config) };
}

test("areas and format signals come from the headline, not guesses", () => {
  assert.deepEqual(areasFor("Summerlin vs Henderson"), ["summerlin", "henderson"]);
  assert.deepEqual(areasFor("You Don't Need 20% Down"), ["valley-wide"]);
  assert.ok(formatSignals("Summerlin vs Henderson").some((s) => s.format === "neighborhood debate"));
  assert.ok(formatSignals("You Don't Need 20% Down").some((s) => s.format === "myth vs reality"));
});

test("comparisons outrank market updates; a recent pick is held back", () => {
  const inputs = fixtureInputs(TODAY);
  const c = buildCandidates({ inputs, config, today: TODAY });
  const rank = (id) => c.findIndex((x) => x.id === id);
  assert.ok(rank("page:/guides/fixture-ridge-vs-fixture-valley") < rank("page:/guides/fixture-market-update"));

  inputs.history = [{ date: "2026-09-14", picks: [{ candidateId: "page:/guides/fixture-down-payment", title: "x", sourceRoutes: ["/guides/fixture-down-payment"] }] }];
  const again = buildCandidates({ inputs, config, today: TODAY });
  const dp = again.find((x) => x.id === "page:/guides/fixture-down-payment");
  assert.equal(dp.recentlyPicked, "2026-09-14");
  assert.ok(!shortlist(again, config).some((x) => x.id === dp.id));
});

test("footage: every side of a comparison gets a clip; A-roll and Shorts are never offered as B-roll", () => {
  const cand = { id: "x", title: "Summerlin vs Henderson vs Southwest", areas: ["summerlin", "henderson", "southwest"], keywords: [], headings: [] };
  const m = matchFootage(cand, FIXTURE_CATALOG, config);
  const areas = new Set(m.clips.slice(0, 3).map((c) => c.area));
  assert.deepEqual([...areas].sort(), ["henderson", "southwest", "summerlin"]);
  assert.ok(!m.clips.some((c) => c.path.includes("Short-1")));
});

test("footage: topic words find the right clips, and cautions travel with them", () => {
  const rent = matchFootage({ id: "r", title: "Rent First or Buy First?", areas: ["valley-wide"], keywords: ["rent", "buy"], headings: [] }, FIXTURE_CATALOG, config);
  assert.equal(rent.clips[0].id, "eeeeeeeee1"); // the apartment-leasing clip
  const kb = matchFootage({ id: "k", title: "New build incentives", areas: ["valley-wide"], keywords: ["homes"], headings: [] }, { items: FIXTURE_CATALOG.items.filter((c) => c.id === "fffffffff1") }, config);
  assert.equal(kb.clips[0]?.caution, "Exterior shot shows a house number. Blur it before posting.");
});

test("numbers: found in the source pass, invented ones are caught", () => {
  const src = "FHA starts at 3.5% down with a 580 credit score. A program offers $20,000. Budget near $500,000. Henderson is 118.5 square miles.";
  const ok = (t) => numbersIn(t).every((n) => numberInSource(n, src));
  assert.ok(ok("FHA is 3.5% down with a 580 score and $20,000 in help."));
  assert.ok(ok("What $500K gets you."));
  assert.ok(ok("It covers 118.5 square miles."));
  assert.ok(ok("Three things. Seven beats.")); // words and small counts aren't claims
  assert.ok(!ok("Rates hit 6.71% this week."));
  assert.ok(!ok("Prices fell 12% last year."));
});

test("validation: spouse-test fails are dropped, invented ids/clips/routes/numbers are caught", () => {
  const { judged } = pipeline();
  assert.ok(judged.dropped.some((d) => d.candidateId === "page:/guides/fixture-market-update" && /spouse test/.test(d.reason)));
  assert.ok(judged.notes.some((n) => /wasn't given/.test(n)));
  const a1 = judged.assessments.find((a) => a.candidateId === "page:/guides/fixture-ridge-vs-fixture-valley");
  assert.ok(a1.flags.some((f) => /wasn't offered/.test(f)));
  assert.equal(a1.script[2].clip, null);
  const dp = judged.assessments.find((a) => a.candidateId === "page:/guides/fixture-down-payment");
  assert.deepEqual(dp.unverifiedNumbers, ["6.71%"]);
  const tax = judged.assessments.find((a) => a.candidateId === "page:/guides/fixture-tax-cap");
  assert.equal(tax.talkingPoints[0].sourceRoute, null);
});

test("new filming is refused when the library covers it, and allowed only when exceptional and uncovered", () => {
  const { finalized } = pipeline();
  const nb = finalized.find((a) => a.candidateId === "page:/guides/fixture-new-build-vs-resale");
  assert.equal(nb.newFilming.required, false);
  assert.equal(nb.scores.ease, 5);

  const req = { ...nb, newFilmingRequest: { needed: true, why: "once-a-year event", shots: ["x"] }, scores: { scroll_stop: 5, comment: 5, share: 5, save: 5, follow: 5, dm_lead: 5, trust: 5 } };
  const uncovered = new Map([[nb.candidateId, { clips: [], coverage: 0, covered: false, readyShorts: [], carousel: [] }]]);
  const [yes] = finalize([req], uncovered, config);
  assert.equal(yes.newFilming.required, true);
  assert.equal(yes.scores.ease, 2);
});

test("four picks: weighted by Mikey's priorities, no twins, news capped, inside the recording budget", () => {
  const { picks, minutes } = pipeline();
  assert.equal(picks.length, 4);
  assert.equal(picks[0].candidateId, "page:/guides/fixture-ridge-vs-fixture-valley");
  assert.ok(!picks.some((p) => p.isNews));
  assert.ok(picks.every((p) => p.newFilming.required === false));
  assert.ok(minutes <= config.producer.budget.max);
  // Comment potential outweighs reuse.
  const w = config.producer.weights;
  assert.ok(w.comment > w.share && w.share > w.save && w.save > w.dm_lead && w.trust > w.ease && w.ease > w.reuse);
  assert.equal(weightedTotal({ comment: 5, reuse: 5 }, { comment: 1, reuse: 1 }), 100);
  assert.equal(recordingMinutes(50), 11);
});

test("two versions of the same debate never both make the week", () => {
  const judgment = {
    assessments: [
      ...fixtureJudgment.assessments,
      { ...fixtureJudgment.assessments[0], candidate_id: "page:/guides/fixture-henderson-vs-southwest" },
    ],
  };
  const inputs = fixtureInputs(TODAY);
  inputs.pages = inputs.pages.map((p) => (p.route === "/guides/fixture-henderson-vs-southwest" ? { ...p, title: "Summerlin vs Henderson, Again (Fixture)" } : p));
  const candidates = buildCandidates({ inputs, config, today: TODAY });
  const short = shortlist(candidates, config);
  const matches = new Map(short.map((c) => [c.id, matchFootage(c, inputs.catalog, config)]));
  const judged = validateJudgment(judgment, { shortlist: short, matches });
  const { picks, skipped } = selectPicks(finalize(judged.assessments, matches, config), new Map(candidates.map((c) => [c.id, c])), config);
  assert.equal(picks.filter((p) => /summerlin|henderson/i.test(p.sourceTitle) && p.format === "neighborhood debate").length, 1);
  assert.ok(skipped.some((s) => /too close/.test(s.reason)));
});

test("rules-only: hooks are published headlines, no scores, and it says so", () => {
  const inputs = fixtureInputs(TODAY);
  const short = shortlist(buildCandidates({ inputs, config, today: TODAY }), config);
  const matches = new Map(short.map((c) => [c.id, matchFootage(c, inputs.catalog, config)]));
  const rules = judgeWithRules(short, matches);
  assert.ok(rules.every((a) => a.hook === a.sourceTitle && a.scores === null && a.rulesOnly));
  const [f] = finalize(rules.slice(0, 1), matches, config);
  assert.equal(f.total, null);
});

test("the model is told the integrity rules and the spouse test", () => {
  const s = buildSystemPrompt(config);
  assert.match(s, /spouse or partner/);
  assert.match(s, /Every number you write/);
  assert.match(s, /Fair Housing/);
  assert.match(s, /Summerlin vs Henderson/);
  assert.ok(JUDGMENT_SCHEMA.properties.assessments.items.required.includes("spouse_test"));
});

test("end to end (--fixtures): the email is in Mikey's format and all four files are written", async () => {
  const dir = mkdtempSync(join(tmpdir(), "lvinit-producer-"));
  const logs = [];
  const r = await run(["--fixtures", `--today=${TODAY}`, `--state-dir=${dir}`], { log: (m) => logs.push(m), repoRoot: dir });
  assert.equal(r.exitCode, 0, logs.join("\n"));
  const out = join(dir, "reports", "executive-producer", "fixtures");
  for (const f of ["brief.md", "brief.json", "email.txt", "email.md"]) assert.ok(existsSync(join(out, `${TODAY}-${f}`)), f);
  const email = readFileSync(join(out, `${TODAY}-email.txt`), "utf8");
  assert.match(email, /^LVINIT EXECUTIVE PRODUCER\nTHIS WEEK/);
  for (const n of [1, 2, 3, 4]) assert.match(email, new RegExp(`PRIORITY ${n}\\n`));
  for (const label of ["Hook:", "Why it should work:", "Existing B-roll:", "New filming required: NO", "Recording time:"]) assert.ok(email.includes(label), label);
  assert.match(email, /Full production sheets .*fixtures\/2026-09-21-brief\.md/);
  const json = JSON.parse(readFileSync(join(out, `${TODAY}-brief.json`), "utf8"));
  assert.equal(json.fixture, true);
  assert.equal(json.picks.length, 4);
});

test("no catalog → clear message, no brief", async () => {
  const dir = mkdtempSync(join(tmpdir(), "lvinit-producer-empty-"));
  const logs = [];
  const r = await run([`--today=${TODAY}`, `--state-dir=${dir}`, "--no-llm"], { log: (m) => logs.push(m) });
  assert.equal(r.exitCode, 2);
  assert.match(logs.join("\n"), /producer:catalog/);
});
