// Detection, gating, classification and the run limits.

import test from "node:test";
import assert from "node:assert/strict";

import {
  findCandidates,
  classifyAndRank,
  scoreCandidate,
  fingerprint,
  makeIdFactory,
  directionOf,
  discoveryMultiplier,
  buildHistory,
  statusFor,
  resolvedSince,
  sentenceAround,
  findBridgeSentenceOpportunities,
  REVIEW_REASONS,
} from "../lib/opportunities.mjs";
import {
  graphFrom,
  testConfig,
  storyPage,
  section,
  neutralGsc,
  permissiveFactDecay,
  blockingFactDecay,
  TODAY,
} from "./helpers.mjs";

/** The standard synthetic site used by most of these tests. */
function site(extra = []) {
  return [
    {
      route: "/guides/summerlin-vs-henderson",
      title: "Summerlin vs. Henderson: Where Should You Actually Move?",
      category: "Comparisons",
      publishedAt: "2026-08-19",
      source: storyPage(
        [
          section(
            "One master plan vs a dozen",
            "Henderson is not one master plan. Most people move to one specific corner of it, and the Water Street District is Henderson&rsquo;s historic downtown, with older bones than any of the newer master-planned areas on either side of the valley."
          ),
          section(
            "Who each suits",
            "Henderson tends to suit families who want the best schools and a safe street, which is the Water Street District angle this fixture uses to exercise the compliance gate rather than the linking one."
          ),
        ].join("\n\n")
      ),
    },
    {
      route: "/guides/water-street-district-henderson",
      title: "Henderson's Water Street District Just Survived a Bankruptcy",
      category: "Local Feature",
      publishedAt: "2026-09-15",
      source: storyPage(
        section("The district", "Everything on this synthetic page exists only to be a link destination for the tests.")
      ),
    },
    ...extra,
  ];
}

function run(records, configOverrides = {}, signals = {}) {
  const config = testConfig(configOverrides);
  const graph = graphFrom(records, config);
  const candidates = findCandidates({ graph, config });
  const result = classifyAndRank({
    graph,
    candidates,
    config,
    gscSignal: signals.gsc ?? neutralGsc,
    factDecaySignal: signals.factDecay ?? permissiveFactDecay,
    reportDate: TODAY,
  });
  return { config, graph, candidates, ...result };
}

test("a phrase the source already uses becomes a safe, auto-executable link", () => {
  const { autoExecuted } = run(site());
  const link = autoExecuted.find((c) => c.to === "/guides/water-street-district-henderson");
  assert.ok(link, "the obvious link was found");
  assert.equal(link.from, "/guides/summerlin-vs-henderson");
  assert.equal(link.anchor, "Water Street District");
  assert.ok(link.confidence >= 0.72);
  assert.deepEqual(link.blockers, []);
});

test("the anchor is always text that is already on the page", () => {
  const { evaluated } = run(site());
  for (const candidate of evaluated) {
    const source = candidate.source.documents[0].source;
    assert.ok(
      source.includes(candidate.anchor),
      `"${candidate.anchor}" is literally in ${candidate.from}`
    );
  }
});

test("a page that already links the destination produces no candidate", () => {
  const records = site();
  records[0].source = records[0].source.replace(
    "the Water Street District is",
    'the <Link href="/guides/water-street-district-henderson" className={linkCls}>Water Street District</Link> is'
  );
  const { evaluated } = run(records);
  assert.equal(
    evaluated.filter((c) => c.to === "/guides/water-street-district-henderson").length,
    0
  );
});

test("a generic word shared between two pages is not a link opportunity", () => {
  const records = [
    {
      route: "/guides/one-thing",
      title: "One Thing",
      publishedAt: "2026-01-01",
      source: storyPage(
        section(
          "Prices",
          "The Las Vegas real estate market is a market like any other market, and homes here are homes, which is the whole of what this paragraph says about anything at all."
        )
      ),
    },
    {
      route: "/guides/another-thing",
      title: "Another Thing",
      publishedAt: "2026-01-02",
      source: storyPage(section("Prices", "This page also talks about the Las Vegas real estate market and homes.")),
    },
  ];
  const { evaluated } = run(records);
  assert.equal(evaluated.length, 0, "shared generic vocabulary creates nothing");
});

test("Fair Housing language in the paragraph makes it report-only, never automatic", () => {
  const { evaluated, autoExecuted } = run(site(), {
    // Force the compliance paragraph to be the winning one by making the clean
    // paragraph unusable: shrink the per-page ceiling to one link.
    limits: { maxLinksAddedPerPage: 1 },
  });
  const compliance = evaluated.filter((c) =>
    c.blockers.some((b) => b.code === REVIEW_REASONS.FAIR_HOUSING_REVIEW)
  );
  for (const candidate of compliance) {
    assert.ok(!autoExecuted.includes(candidate), "a Fair Housing match is never auto-executed");
    assert.ok(candidate.handoff, "it carries a Content Publisher handoff");
  }
});

test("Fair Housing gating fires on an anchor in protected-class framing", () => {
  const records = [
    {
      route: "/guides/who-lives-where",
      title: "Who Lives Where",
      publishedAt: "2026-01-01",
      source: storyPage(
        section(
          "Fit",
          "The Water Street District is perfect for families with young children who want the best schools, and this sentence exists only to make the Fair Housing filter fire on a paragraph that also names the destination."
        )
      ),
    },
    ...site().slice(1),
  ];
  const { evaluated, autoExecuted } = run(records);
  const candidate = evaluated.find((c) => c.from === "/guides/who-lives-where");
  assert.ok(candidate, "the candidate was detected");
  assert.ok(candidate.blockers.some((b) => b.code === REVIEW_REASONS.FAIR_HOUSING_REVIEW));
  assert.equal(autoExecuted.includes(candidate), false);
});

test("compliance copy is never edited, even when it names the destination", () => {
  const records = [
    {
      route: "/guides/disclosure",
      title: "Disclosure",
      publishedAt: "2026-01-01",
      source: storyPage(
        section(
          "About this coverage",
          "Mikey Del Rosario, The Scofield Group, Nevada License S.0175577. Equal Housing Opportunity. The Water Street District in Henderson is named here only inside compliance copy that must never change."
        )
      ),
    },
    ...site().slice(1),
  ];
  const { evaluated, autoExecuted } = run(records);
  const candidate = evaluated.find((c) => c.from === "/guides/disclosure");
  if (candidate) {
    assert.ok(
      candidate.blockers.some(
        (b) => b.code === REVIEW_REASONS.COMPLIANCE_COPY || b.code === REVIEW_REASONS.FAIR_HOUSING_REVIEW
      )
    );
    assert.equal(autoExecuted.includes(candidate), false);
  }
  assert.equal(
    autoExecuted.some((c) => c.from === "/guides/disclosure"),
    false,
    "nothing from a compliance page ever ships"
  );
});

test("a Fact-Decay-blocked destination is reported, not linked", () => {
  const { evaluated, autoExecuted } = run(site(), {}, {
    factDecay: blockingFactDecay(["/guides/water-street-district-henderson"], "synthetic high-risk contradiction"),
  });
  const candidate = evaluated.find((c) => c.to === "/guides/water-street-district-henderson");
  assert.ok(candidate);
  assert.ok(candidate.blockers.some((b) => b.code === REVIEW_REASONS.DESTINATION_REQUIRES_REFRESH));
  assert.equal(autoExecuted.length, 0);
});

test("a page with no next/link import is never edited", () => {
  const records = site();
  records[0].source = storyPage(
    section(
      "One master plan vs a dozen",
      "Henderson is not one master plan. The Water Street District is Henderson&rsquo;s historic downtown, with older bones than any of the newer master-planned areas on either side of the valley."
    ),
    { withLinkImport: false }
  );
  const { evaluated, autoExecuted } = run(records);
  const candidate = evaluated.find((c) => c.to === "/guides/water-street-district-henderson");
  assert.ok(candidate);
  assert.ok(candidate.blockers.some((b) => b.code === REVIEW_REASONS.NO_LINK_IMPORT));
  assert.equal(autoExecuted.length, 0);
});

test("a paragraph that already carries a link does not get a second one", () => {
  const records = site();
  records[0].source = records[0].source.replace(
    "Henderson is not one master plan.",
    'Henderson is not <Link href="/neighborhoods/henderson" className={linkCls}>one master plan</Link>.'
  );
  records.push({
    route: "/neighborhoods/henderson",
    title: "Henderson",
    publishedAt: "2026-01-01",
    source: storyPage(section("Henderson", "A destination page for the test.")),
  });
  const { evaluated, autoExecuted } = run(records);
  const candidate = evaluated.find(
    (c) => c.from === "/guides/summerlin-vs-henderson" && c.to === "/guides/water-street-district-henderson"
  );
  assert.ok(candidate);
  assert.ok(candidate.blockers.some((b) => b.code === REVIEW_REASONS.PARAGRAPH_ALREADY_LINKED));
  assert.equal(autoExecuted.includes(candidate), false);
});

test("a page that is already linked well is left alone", () => {
  const { evaluated, autoExecuted } = run(site(), {
    density: { maxEditorialLinksPerPage: 0 },
  });
  assert.ok(evaluated.length > 0);
  assert.ok(evaluated.every((c) => c.blockers.some((b) => b.code === REVIEW_REASONS.PAGE_ALREADY_WELL_LINKED)));
  assert.equal(autoExecuted.length, 0);
});

test("run limits cap links per run, per page and pages per run", () => {
  const records = site([
    {
      route: "/guides/monument-hills-northwest",
      title: "Monument Hills, Northwest",
      publishedAt: "2026-09-03",
      source: storyPage(section("The site", "A second destination page for the limit tests.")),
    },
  ]);
  records[0].source = storyPage(
    [
      section(
        "One",
        "Henderson is not one master plan, and the Water Street District is Henderson&rsquo;s historic downtown, with older bones than any of the newer master-planned areas here."
      ),
      section(
        "Two",
        "Monument Hills is the northwest master-planned site, and this paragraph names Monument Hills so the agent has a second genuine destination to reach for on the same page."
      ),
    ].join("\n\n")
  );

  // The limits are what is under test, not the confidence line, so the line is
  // dropped far enough that both candidates qualify on relevance.
  const relaxed = { relevance: { autoExecuteMinConfidence: 0.6 } };

  const twoAllowed = run(records, relaxed);
  assert.equal(twoAllowed.autoExecuted.length, 2, "both links qualify when the limits allow it");

  const onePerPage = run(records, { ...relaxed, limits: { maxLinksAddedPerPage: 1 } });
  assert.equal(onePerPage.autoExecuted.length, 1);
  assert.ok(
    onePerPage.needsReview.some((c) => c.blockers.some((b) => b.code === REVIEW_REASONS.RUN_LIMIT_REACHED))
  );

  const onePerRun = run(records, { ...relaxed, limits: { maxLinksAddedPerRun: 1 } });
  assert.equal(onePerRun.autoExecuted.length, 1);

  const noPages = run(records, { ...relaxed, limits: { maxPagesModifiedPerRun: 0 } });
  assert.equal(noPages.autoExecuted.length, 0);
});

test("auto-execution can be switched off entirely", () => {
  const { autoExecuted, needsReview } = run(site(), { autoExecute: { enabled: false } });
  assert.equal(autoExecuted.length, 0);
  assert.ok(needsReview.some((c) => c.blockers.some((b) => b.code === REVIEW_REASONS.RUN_LIMIT_REACHED)));
});

test("repeating one exact anchor across the site is demoted to review", () => {
  const { evaluated, autoExecuted } = run(site(), { anchor: { maxSameAnchorSiteWide: 0 } });
  const candidate = evaluated.find((c) => c.to === "/guides/water-street-district-henderson");
  assert.ok(candidate.blockers.some((b) => b.code === REVIEW_REASONS.ANCHOR_REPETITION));
  assert.equal(autoExecuted.length, 0);
});

test("GSC is prioritization only: it reorders, it never creates or unblocks", () => {
  const boosting = {
    ...neutralGsc,
    available: true,
    namedInternalLinkRoutes: new Set(["/guides/water-street-district-henderson"]),
    multiplierFor: (route) =>
      route === "/guides/water-street-district-henderson"
        ? { value: 1.15, basis: "synthetic boost", named: true }
        : { value: 1, basis: "no signal", named: false },
  };
  const plain = run(site());
  const boosted = run(site(), {}, { gsc: boosting });

  const a = plain.evaluated.find((c) => c.to === "/guides/water-street-district-henderson");
  const b = boosted.evaluated.find((c) => c.to === "/guides/water-street-district-henderson");
  assert.equal(a.confidence, b.confidence, "traffic never changes how relevant a link is");
  assert.ok(b.priority > a.priority, "traffic changes only the ordering");
  assert.equal(plain.evaluated.length, boosted.evaluated.length, "traffic creates no new opportunity");
});

test("absence from the GSC report is neutral, never a penalty", () => {
  const withReport = {
    ...neutralGsc,
    available: true,
    multiplierFor: () => ({ value: 1, basis: "not in the report", named: false }),
  };
  const withoutReport = run(site());
  const withUnrelatedReport = run(site(), {}, { gsc: withReport });
  const a = withoutReport.evaluated.find((c) => c.to === "/guides/water-street-district-henderson");
  const b = withUnrelatedReport.evaluated.find((c) => c.to === "/guides/water-street-district-henderson");
  assert.equal(a.priority, b.priority, "a page missing from the GSC report is scored identically");
});

test("scoring components are all present and bounded", () => {
  const { evaluated } = run(site());
  for (const c of evaluated) {
    for (const [key, value] of Object.entries(c.components)) {
      assert.ok(value >= 0 && value <= 1, `${key} is within 0-1`);
    }
    assert.ok(c.confidence >= 0 && c.confidence <= 1);
  }
});

test("a paragraph that only mentions the anchor, with no supporting vocabulary, is skipped", () => {
  const records = [
    {
      route: "/guides/rates-now",
      title: "Mortgage Rates Now",
      publishedAt: "2026-09-01",
      source: storyPage(
        section(
          "Rates",
          "Rates moved again this week and buyers are recalculating, which has nothing whatever to do with Testburg beyond that one passing word right there."
        )
      ),
    },
    {
      route: "/guides/testburg-redevelopment-district",
      title: "Testburg Redevelopment District",
      publishedAt: "2026-09-10",
      source: storyPage(section("x", "A destination page.")),
    },
  ];
  const { evaluated } = run(records);
  assert.equal(evaluated.length, 0, "one incidental mention is not a link opportunity");
});

test("fingerprints are stable across runs and distinct across pairs", () => {
  const a = fingerprint({ from: "/a", to: "/b", anchor: "Water Street District" });
  const b = fingerprint({ from: "/a", to: "/b", anchor: "water  street—district" });
  const c = fingerprint({ from: "/a", to: "/c", anchor: "Water Street District" });
  assert.equal(a, b, "punctuation and case do not change identity");
  assert.notEqual(a, c);
  assert.equal(a.length, 12);
});

test("ids are sequential and carry the run date", () => {
  const next = makeIdFactory("2026-09-17");
  assert.equal(next(), "LINK-2026-09-17-001");
  assert.equal(next(), "LINK-2026-09-17-002");
});

test("history recognizes NEW, PERSISTING and RESOLVED findings, and records a shipped auto-fix", () => {
  const previous = [
    {
      reportDate: "2026-09-10",
      mode: "apply",
      execution: { committed: true, pushAttempted: true, pushed: true },
      autoExecuted: [{ id: "LINK-2026-09-10-001", fingerprint: "aaa" }],
      needsReview: [{ id: "LINK-2026-09-10-002", fingerprint: "bbb", from: "/a", to: "/b" }],
    },
  ];
  const history = buildHistory(previous);
  assert.equal(history.get("aaa").everAutoFixed, true);
  assert.equal(history.get("aaa").autoFixedId, "LINK-2026-09-10-001");
  assert.equal(statusFor({ fingerprint: "bbb" }, history).status, "PERSISTING");
  assert.equal(statusFor({ fingerprint: "ccc" }, history).status, "NEW");
  assert.deepEqual(
    resolvedSince(previous, ["aaa"]).map((r) => [r.fingerprint, r.status]),
    [["bbb", "RESOLVED"]],
    "a finding that no longer appears is resolved"
  );
});

test("a DRY-RUN report's would-add list is never mistaken for links the agent shipped", () => {
  const previous = [
    {
      reportDate: "2026-09-17",
      mode: "dry-run",
      execution: { committed: false },
      autoExecuted: [{ id: "LINK-2026-09-17-001", fingerprint: "aaa", from: "/a", to: "/b" }],
      needsReview: [],
    },
  ];
  const history = buildHistory(previous);
  assert.equal(history.get("aaa").everAutoFixed, false);
  assert.equal(history.get("aaa").lastOutcome, "proposed-auto");
  // Still open in a dry run, so if it is gone now it resolved (e.g. linked by hand).
  assert.deepEqual(resolvedSince(previous, []).map((r) => r.fingerprint), ["aaa"]);
  // An apply run whose push failed did not ship either.
  assert.equal(
    buildHistory([{ ...previous[0], mode: "apply", execution: { committed: true, pushAttempted: true, pushed: false } }])
      .get("aaa").everAutoFixed,
    false
  );
});

test("an unchanged review item goes quiet after being written up; a material change brings it back", () => {
  const config = testConfig();
  const item = { id: "X", fingerprint: "fff", confidence: 0.6, blockers: [{ code: "LOW_CONFIDENCE" }] };
  const reports = ["2026-09-03", "2026-09-10"].map((reportDate) => ({ reportDate, mode: "dry-run", autoExecuted: [], needsReview: [item] }));
  const history = buildHistory(reports);
  const same = statusFor({ fingerprint: "fff", confidence: 0.61, blockers: [{ code: "LOW_CONFIDENCE" }] }, history, config);
  assert.equal(same.status, "PERSISTING");
  assert.equal(same.quiet, true, "shown twice already, nothing changed");
  const moved = statusFor({ fingerprint: "fff", confidence: 0.7, blockers: [{ code: "LOW_CONFIDENCE" }] }, history, config);
  assert.equal(moved.quiet, false, "confidence moved by 0.1");
  const reblocked = statusFor({ fingerprint: "fff", confidence: 0.6, blockers: [{ code: "DESTINATION_REQUIRES_REFRESH" }] }, history, config);
  assert.equal(reblocked.quiet, false, "a different blocker is a material change");
  const once = statusFor({ fingerprint: "fff", confidence: 0.6, blockers: [{ code: "LOW_CONFIDENCE" }] }, buildHistory(reports.slice(0, 1)), config);
  assert.equal(once.quiet, false, "shown only once so far");
});

test("link direction is read off publication dates", () => {
  assert.equal(directionOf({ publishedAt: "2026-01-01" }, { publishedAt: "2026-02-01" }), "forward-to-newer");
  assert.equal(directionOf({ publishedAt: "2026-02-01" }, { publishedAt: "2026-01-01" }), "back-to-older");
  assert.equal(directionOf({ publishedAt: null }, { publishedAt: "2026-01-01" }), "unknown");
});

test("discovery weighting boosts an orphan and says why", () => {
  const config = testConfig();
  const orphan = discoveryMultiplier({ isOrphan: true, isWeaklyLinked: true, uniqueReferrers: [] }, "lateral", config);
  const linked = discoveryMultiplier({ isOrphan: false, isWeaklyLinked: false, uniqueReferrers: ["/a", "/b"] }, "lateral", config);
  assert.ok(orphan.value > linked.value);
  assert.match(orphan.basis, /no editorial page links to it/);
});

test("an orphan with no honest anchor becomes a Content Publisher handoff, not a link", () => {
  const records = [
    {
      route: "/guides/new-build-vs-resale",
      title: "New Build vs Resale",
      category: "Buyer Guide",
      publishedAt: "2026-09-10",
      source: storyPage(section("x", "The orphan destination. Nothing links to it.")),
    },
    {
      route: "/guides/las-vegas-new-home-sales",
      title: "New Home Sales",
      category: "Market Watch",
      publishedAt: "2026-08-25",
      source: storyPage(
        section(
          "Builders",
          "Builders closed more this month than last, which is a real shift in the pace of construction across the valley and worth watching closely over the next few months."
        )
      ),
    },
  ];
  const config = testConfig();
  const graph = graphFrom(records, config);
  const candidates = findCandidates({ graph, config });
  const handoffs = findBridgeSentenceOpportunities({ graph, candidates, config });
  assert.ok(handoffs.length >= 1);
  assert.equal(handoffs[0].to, "/guides/new-build-vs-resale");
  assert.match(handoffs[0].recommendation, /Content Publisher/);
});

test("sentenceAround picks the sentence the anchor is in", () => {
  const paragraph = "First sentence here. The Water Street District is downtown. Third one follows.";
  assert.equal(
    sentenceAround(paragraph, "Water Street District"),
    "The Water Street District is downtown."
  );
});

test("scoreCandidate does not punish a richer anchor for carrying the subject's words", () => {
  const config = testConfig();
  const source = { route: "/guides/a", title: "A", topics: [] };
  const destination = {
    route: "/guides/water-street-district-henderson",
    title: "Water Street District, Henderson",
    topics: [],
    coreTokens: ["water", "street", "district", "henderson"],
    tokens: ["water", "street", "district", "henderson"],
  };
  const paragraph = "The Water Street District is Henderson's historic downtown core.";
  const rich = scoreCandidate({ source, destination, anchor: "Water Street District", paragraphText: paragraph, structuralFit: 1, config });
  const thin = scoreCandidate({ source, destination, anchor: "Henderson", paragraphText: paragraph, structuralFit: 1, config });
  assert.ok(rich.confidence > thin.confidence, "the anchor that names more of the destination wins");
});
