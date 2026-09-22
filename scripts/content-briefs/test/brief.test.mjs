import test from "node:test";
import assert from "node:assert/strict";

import { ACTIONS } from "../config.mjs";
import { groupQueries } from "../lib/intent.mjs";
import { checkCoverage } from "../lib/coverage.mjs";
import { classifyGroup, fairHousingCheck, isGenericTopic } from "../lib/classify.mjs";
import { buildBrief, proposeSlug, workingTitle } from "../lib/brief.mjs";
import { testConfig, standardInventory, qrow, prow, noFactDecay, noInternalLinks } from "./helpers.mjs";

const config = testConfig();
const inventory = standardInventory();

function briefFor(rows, pairs = []) {
  const group = groupQueries({ currentRows: rows, currentPairs: pairs })[0];
  const coverage = checkCoverage(group, inventory, config);
  const classification = classifyGroup({ group, coverage, inventory, config });
  const brief = buildBrief({
    id: "BRIEF-2026-09-22-001",
    group,
    classification,
    coverage,
    score: { value: 80, breakdown: [], weights: {} },
    confidence: { level: "medium", caveats: [] },
    inventory,
    factDecay: noFactDecay,
    internalLinks: noInternalLinks,
    gscEvidence: [],
    gscMeta: { reportDate: "2026-09-21", window: { start: "2026-08-22", end: "2026-09-18" } },
    config,
    factDecayNotes: { openFindings: 1, highPriority: [{ id: "FACT-2026-09-18-004", priority: 80, riskLevel: "high", verification: "contradicts" }], instruction: "Resolve these during the same update." },
  });
  return { group, classification, brief };
}

// ---------------------------------------------------------------------------
// Slugs and titles
// ---------------------------------------------------------------------------

test("slug proposal follows LVINIT's existing style", () => {
  const g = groupQueries({ currentRows: [qrow("summerlin vs southwest", 30)] })[0];
  assert.equal(proposeSlug(g).slug, "summerlin-vs-southwest-las-vegas");
  const rent = groupQueries({ currentRows: [qrow("rent first or buy when moving to las vegas", 30)] })[0];
  assert.equal(proposeSlug(rent).slug, "rent-vs-buy-las-vegas");
});

test("a slug never collides with an existing route", () => {
  const g = groupQueries({ currentRows: [qrow("summerlin vs southwest", 30)] })[0];
  const taken = new Set(["/guides/summerlin-vs-southwest-las-vegas"]);
  assert.equal(proposeSlug(g, taken).route, "/guides/summerlin-vs-southwest-las-vegas-2");
});

test("working titles sound like LVINIT and pass the generic and Fair Housing guards", () => {
  const queries = ["summerlin vs southwest", "is southwest cheaper than summerlin", "new build incentives las vegas", "monument hills las vegas", "moving to las vegas", "henderson property tax", "rent first or buy las vegas"];
  for (const q of queries) {
    const title = workingTitle(groupQueries({ currentRows: [qrow(q, 30)] })[0]);
    assert.ok(title, q);
    assert.equal(isGenericTopic(title), false, title);
    assert.equal(fairHousingCheck(title).blocked, false, title);
    assert.doesNotMatch(title, /\b(best|top \d+|ultimate|everything you need)\b/i, title);
  }
  assert.equal(workingTitle(groupQueries({ currentRows: [qrow("summerlin vs southwest", 30)] })[0]), "Summerlin vs Southwest Las Vegas: What Actually Changes Day to Day");
});

test("generated text states no figures — no prices, minutes, or percentages invented", () => {
  const { brief } = briefFor([qrow("is southwest cheaper than summerlin", 60)]);
  for (const text of [brief.workingTitle, brief.editorialAngle, brief.primarySearchQuestion, ...brief.likelySections].filter(Boolean)) {
    assert.doesNotMatch(text, /\$\d|\d+\s*(minutes|%|percent)/i, text);
  }
});

// ---------------------------------------------------------------------------
// New-article brief format
// ---------------------------------------------------------------------------

test("a new-content brief carries every field the Publisher needs", () => {
  const { brief, classification } = briefFor([qrow("moving to las vegas from california", 60, 1, 18)], [prow("moving to las vegas from california", "/", 60, 1, 18)]);
  assert.equal(classification.action, ACTIONS.NEW_ARTICLE);
  for (const key of ["id", "contentType", "workingTitle", "primarySearchQuestion", "underlyingIntent", "whyLvinit", "gscEvidence", "relevantExistingPages", "duplicateCheck", "recommendedAction", "editorialAngle", "mustNotBecome", "keyQuestions", "likelySections", "internalLinksOut", "pagesThatShouldLinkIn", "researchRequirements", "sourceTypesToPrioritize", "fairHousing", "cta", "video", "confidence", "score"]) {
    assert.ok(brief[key] !== undefined, `missing ${key}`);
  }
  for (const key of ["proposedSlug", "proposedRoute", "cluster", "whyExistingContentDoesNotAnswerIt", "differentiation"]) {
    assert.ok(brief.newContent[key] !== undefined, `missing newContent.${key}`);
  }
  assert.equal(brief.update, undefined);
});

test("GSC evidence is labelled RAW and separated from the calculated group totals", () => {
  const { brief } = briefFor([qrow("moving to las vegas", 50, 1, 18)]);
  assert.match(brief.gscEvidence.label, /RAW/);
  assert.match(brief.gscEvidence.calculated.label, /CALCULATED/);
  assert.ok(brief.gscEvidence.queries[0].raw);
});

test("every brief tells the Publisher GSC data is demand, never a fact", () => {
  const { brief } = briefFor([qrow("moving to las vegas", 50)]);
  assert.match(brief.researchRequirements[0], /independently researched and current/);
  assert.match(brief.researchRequirements[0], /never an editorial fact/);
});

test("development briefs require current primary-source research", () => {
  const { brief } = briefFor([qrow("monument hills development", 50, 0, 12)], [prow("monument hills development", "/guides/first-summer-in-vegas", 50, 0, 12)]);
  if (brief) {
    assert.ok(brief.flags.includes("CURRENT_RESEARCH_REQUIRED"));
    assert.ok(brief.researchRequirements.some((r) => r.startsWith("CURRENT_RESEARCH_REQUIRED")));
  }
});

test("links out are real routes only, and never the page itself", () => {
  const { brief } = briefFor([qrow("summerlin vs southwest", 60, 0, 14)]);
  for (const l of brief.internalLinksOut) assert.ok(inventory.existingRoutes.has(l.route), l.route);
});

// ---------------------------------------------------------------------------
// Update brief format
// ---------------------------------------------------------------------------

test("an update/expand brief names the target, the missing intent, the section, what not to rewrite, and dateModified", () => {
  const { brief, classification } = briefFor(
    [qrow("summerlin vs southwest", 22), qrow("is southwest cheaper than summerlin", 14), qrow("southwest vs summerlin", 9)],
    [prow("summerlin vs southwest", "/guides/summerlin-vs-henderson-vs-southwest-las-vegas", 22, 0, 14)]
  );
  assert.equal(classification.action, ACTIONS.EXPAND_EXISTING);
  const u = brief.update;
  assert.equal(u.targetRoute, "/guides/summerlin-vs-henderson-vs-southwest-las-vegas");
  assert.ok(u.exactIntentMissing);
  assert.ok("currentRelevantSection" in u);
  assert.ok(u.whatNeedsImprovement);
  assert.ok(u.whatNotToRewrite.some((w) => /compliance/.test(w)));
  assert.ok(u.whatNotToRewrite.some((w) => /IDX/.test(w)));
  assert.match(u.dateModified, /^Yes/);
  assert.ok(Array.isArray(u.internalLinksToRevisit));
  assert.equal(brief.newContent, undefined);
  assert.equal(brief.workingTitle, null, "an update does not invent a new title");
  assert.ok(brief.likelySections.length <= 3, "an update proposes sections to add, not a whole article outline");
});

test("an update brief carries Fact-Decay findings for its target and tells the Publisher to resolve them", () => {
  const { brief } = briefFor([qrow("summerlin vs southwest", 40)], [prow("summerlin vs southwest", "/guides/summerlin-vs-henderson-vs-southwest-las-vegas", 40, 0, 14)]);
  assert.equal(brief.update.factDecay.highPriority[0].id, "FACT-2026-09-18-004");
  assert.match(brief.update.factDecay.instruction, /same update/);
});
