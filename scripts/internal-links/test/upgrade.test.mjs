// The 2026-09-22 upgrade: link context (contextual / citation / card), the
// sourcing-section guard, the Content Brief signal, lifecycle history that a
// dry run cannot poison, human vetoes, the trial mode, and the clean-rebase
// path. Everything is synthetic; nothing reads LVINIT's real content.

import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

import {
  extractLinks,
  isSourcingHeading,
  LINK_CONTEXTS,
} from "../lib/source.mjs";
import {
  findCandidates,
  classifyAndRank,
  buildHistory,
  REVIEW_REASONS,
  NEUTRAL_BRIEF_SIGNAL,
} from "../lib/opportunities.mjs";
import { loadBriefSignal } from "../lib/signals.mjs";
import { analyze } from "../lib/analyze.mjs";
import { buildMarkdownReport, buildJsonReport } from "../lib/report.mjs";
import { rebaseOntoRemote, pathsAreClean, inspectDiff } from "../lib/git.mjs";
import { readPreviousReports } from "../run.mjs";
import {
  graphFrom,
  testConfig,
  storyPage,
  section,
  neutralGsc,
  permissiveFactDecay,
  TODAY,
} from "./helpers.mjs";

const WSD = "/guides/water-street-district-henderson";
const SVH = "/guides/summerlin-vs-henderson";
const PARAGRAPH =
  "Henderson is not one master plan. Most people move to one specific corner of it, and the Water Street District is Henderson&rsquo;s historic downtown, with older bones than any of the newer master-planned areas on either side of the valley.";

function site({ sourceBody, destinationBody } = {}) {
  return [
    {
      route: SVH,
      title: "Summerlin vs. Henderson: Where Should You Actually Move?",
      category: "Comparisons",
      publishedAt: "2026-08-19",
      source: storyPage(sourceBody ?? section("One master plan vs a dozen", PARAGRAPH)),
    },
    {
      route: WSD,
      title: "Henderson's Water Street District Just Survived a Bankruptcy",
      category: "Local Feature",
      publishedAt: "2026-09-15",
      source: storyPage(
        destinationBody ?? section("The district", "Everything on this synthetic page exists only to be a link destination.")
      ),
    },
  ];
}

function classify(records, { config = testConfig(), briefSignal, history } = {}) {
  const graph = graphFrom(records, config);
  const candidates = findCandidates({ graph, config });
  return {
    graph,
    config,
    ...classifyAndRank({
      graph,
      candidates,
      config,
      gscSignal: neutralGsc,
      factDecaySignal: permissiveFactDecay,
      briefSignal,
      history,
      reportDate: TODAY,
    }),
  };
}

// --- Link context ------------------------------------------------------------

test("links are classified as contextual prose, citation or card", () => {
  const source = storyPage(
    [
      section("The district", `Read <Link href="${WSD}" className={linkCls}>the Water Street guide</Link> first.`),
      `      <StorySection heading="Sources">
        <ul>
          <li>Full detail and sourcing in <Link href="/guides/a" className={linkCls}>our July coverage</Link>.</li>
        </ul>
      </StorySection>`,
      `      <Button href="/guides/b">See the numbers</Button>`,
    ].join("\n")
  ).replace(
    'hero={{ headline: "Test" }}',
    'hero={{ headline: "Test" }} relatedStories={{ stories: [{ name: "C", href: "/guides/c" }] }}'
  );
  const byHref = Object.fromEntries(extractLinks(source).map((l) => [l.href, l.context]));
  assert.equal(byHref[WSD], LINK_CONTEXTS.CONTEXTUAL);
  assert.equal(byHref["/guides/a"], LINK_CONTEXTS.CITATION, "a link under a Sources heading is a citation");
  assert.equal(byHref["/guides/b"], LINK_CONTEXTS.CARD, "a Button href is a CTA");
  assert.equal(byHref["/guides/c"], LINK_CONTEXTS.CARD, "a relatedStories entry is a card");
});

test("a page reachable only from cards and citations is an orphan, with those referrers shown", () => {
  const records = site();
  records.push({
    route: "/guides/card-only",
    title: "Card Only Page",
    publishedAt: "2026-09-01",
    source: storyPage(section("Anything", "Nothing links here from prose.")),
  });
  records[0].source = records[0].source.replace(
    'hero={{ headline: "Test" }}',
    'hero={{ headline: "Test" }} relatedStories={{ stories: [{ name: "Card", href: "/guides/card-only" }] }}'
  );
  const { graph } = classify(records);
  const page = graph.pages.get("/guides/card-only");
  assert.equal(page.isOrphan, true, "a Keep-reading card is not contextual support");
  assert.deepEqual(page.cardReferrers, [SVH]);
  assert.deepEqual(page.uniqueReferrers, []);
  assert.equal(page.allReferrers.length, 1, "the card link is still recorded");
});

test("repeat links are counted in prose only — Sources citations do not count", () => {
  const cite = (n) => `<li>Source ${n}: <Link href="${WSD}" className={linkCls}>our coverage</Link>.</li>`;
  const body = [
    section("Prose", `One <Link href="${WSD}" className={linkCls}>Water Street</Link> link in the copy.`),
    `      <StorySection heading="Sources">\n        <ul>\n          ${cite(1)}\n          ${cite(2)}\n          ${cite(3)}\n        </ul>\n      </StorySection>`,
  ].join("\n");
  const { graph } = classify(site({ sourceBody: body }));
  assert.equal(graph.duplicateLinks.length, 0, "three citations of one report are not repetition");
  const prose = [1, 2, 3].map((n) => section(`P${n}`, `Link ${n} to <Link href="${WSD}" className={linkCls}>the district</Link>.`)).join("\n");
  const { graph: g2 } = classify(site({ sourceBody: prose }));
  assert.equal(g2.duplicateLinks.filter((d) => d.occurrence >= 3).length, 1, "three prose links to one page are");
});

test("the density gate still counts every in-page link, so it never gets looser", () => {
  const cards = Array.from({ length: 12 }, (_, i) => `{ name: "C${i}", href: "${WSD}" }`).join(", ");
  const records = site();
  records.push({ route: "/guides/x", title: "X", publishedAt: "2026-01-01", source: storyPage(section("x", "x")) });
  records[0].source = records[0].source.replace(
    'hero={{ headline: "Test" }}',
    `hero={{ headline: "Test" }} relatedStories={{ stories: [${Array.from({ length: 12 }, (_, i) => `{ name: "C${i}", href: "/guides/x" }`).join(", ")}] }}`
  );
  void cards;
  const { graph } = classify(records);
  const source = graph.pages.get(SVH);
  assert.equal(source.outgoingContextualCount, 0);
  assert.equal(source.outgoingEditorialCount, 12, "cards still count toward the page's density");
});

// --- Sourcing copy -------------------------------------------------------------

test("a bare “Sources” section is never an edit location", () => {
  const sourcesSection = `      <StorySection heading="Sources">
        <p>
          ${PARAGRAPH}
        </p>
      </StorySection>`;
  const { autoExecuted, needsReview } = classify(site({ sourceBody: sourcesSection }));
  assert.equal(autoExecuted.length, 0);
  const item = needsReview.find((c) => c.to === WSD);
  assert.ok(item, "reported, not silently dropped");
  assert.ok(item.blockers.some((b) => b.code === REVIEW_REASONS.COMPLIANCE_COPY));
});

test("isSourcingHeading matches the whole heading, not any use of the word", () => {
  for (const h of ["Sources", "Sources:", "Sources and methodology", "Methodology", "How this was reported"]) {
    assert.equal(isSourcingHeading(h), true, h);
  }
  for (const h of ["Where the new sources of supply are", "Open sources of water", "", null]) {
    assert.equal(isSourcingHeading(h), false, String(h));
  }
});

// --- Content Brief signal --------------------------------------------------------

function briefDir(reports) {
  const root = mkdtempSync(join(tmpdir(), "lvinit-links-briefs-"));
  for (const [rel, body] of Object.entries(reports)) {
    const full = join(root, "reports/content-briefs", rel);
    mkdirSync(join(full, ".."), { recursive: true });
    writeFileSync(full, JSON.stringify(body), "utf8");
  }
  return { root, cleanup: () => rmSync(root, { recursive: true, force: true }) };
}

const briefReport = (overrides = {}) => ({
  reportDate: TODAY,
  fixtureData: false,
  inventory: { coverage: { "local-development": { routes: [WSD, SVH] }, relocation: { routes: [SVH] } } },
  opportunities: [
    { id: "BRIEF-1", action: "INTERNAL_LINK_ONLY", target: WSD, cluster: "local-development", leadQuery: "water street" },
    { id: "BRIEF-2", action: "NEW_ARTICLE", target: null, proposedRoute: "/guides/not-yet-written" },
  ],
  handoff: { mode: "dry-run", queue: [{ briefId: "BRIEF-1", action: "UPDATE_EXISTING", targetRoute: SVH }] },
  ...overrides,
});

test("the Brief signal reads clusters and named targets, and absence is exactly neutral", () => {
  const { root, cleanup } = briefDir({ [`content-opportunities-${TODAY}.json`]: briefReport() });
  try {
    const signal = loadBriefSignal({ repoRoot: root, config: testConfig({ briefs: { enabled: true } }), today: TODAY });
    assert.equal(signal.available, true);
    assert.deepEqual(signal.sharedClusters(SVH, WSD), ["local-development"]);
    assert.equal(signal.multiplierFor(WSD).value, 1.1, "INTERNAL_LINK_ONLY is the strongest ask");
    assert.equal(signal.multiplierFor(SVH).value, 1, "not a brief target: neutral, never a penalty");
    assert.equal(signal.multiplierFor("/guides/not-yet-written").value, 1, "a proposed page gets nothing");
    assert.equal(signal.pendingEditFor(SVH), null, "a dry-run queue is not real Publisher work");
  } finally {
    cleanup();
  }
});

test("the Brief signal skips fixture reports, ignores stale ones, and sees a LIVE handoff", () => {
  const live = briefDir({
    [`content-opportunities-${TODAY}.json`]: briefReport({ handoff: { mode: "live", queue: [{ briefId: "BRIEF-9", action: "UPDATE_EXISTING", targetRoute: SVH }] } }),
    [`fixtures/content-opportunities-2026-12-31.json`]: briefReport({ fixtureData: true }),
  });
  const stale = briefDir({ ["content-opportunities-2026-07-01.json"]: briefReport({ reportDate: "2026-07-01" }) });
  const onlyFixture = briefDir({ ["fixtures/content-opportunities-2026-09-17.json"]: briefReport({ fixtureData: true }) });
  try {
    const config = testConfig({ briefs: { enabled: true } });
    const s = loadBriefSignal({ repoRoot: live.root, config, today: TODAY });
    assert.equal(s.reportDate, TODAY, "the newer fixture file was skipped for the real one");
    assert.deepEqual(s.pendingEditFor(SVH), { briefId: "BRIEF-9", action: "UPDATE_EXISTING" });
    assert.equal(loadBriefSignal({ repoRoot: stale.root, config, today: TODAY }).available, false);
    const f = loadBriefSignal({ repoRoot: onlyFixture.root, config, today: TODAY });
    assert.equal(f.available, false);
    assert.match(f.reason, /FIXTURE/);
  } finally {
    live.cleanup();
    stale.cleanup();
    onlyFixture.cleanup();
  }
});

test("a brief target moves up the queue but never changes confidence or safety", () => {
  const plain = classify(site());
  const boosted = classify(site(), {
    briefSignal: {
      ...NEUTRAL_BRIEF_SIGNAL,
      available: true,
      multiplierFor: (route) => ({ value: route === WSD ? 1.1 : 1, basis: "test", briefId: "BRIEF-1" }),
      sharedClusters: () => ["local-development"],
    },
  });
  const a = plain.evaluated.find((c) => c.to === WSD);
  const b = boosted.evaluated.find((c) => c.to === WSD);
  assert.equal(b.confidence, a.confidence, "confidence is untouched");
  assert.equal(b.autoExecutable, a.autoExecutable, "safety is untouched");
  assert.ok(b.priority > a.priority, "only the ordering moved");
  assert.deepEqual(b.brief.sharedClusters, ["local-development"]);
});

test("a source page with a LIVE Publisher handoff is not edited", () => {
  const { autoExecuted, needsReview } = classify(site(), {
    briefSignal: { ...NEUTRAL_BRIEF_SIGNAL, pendingEditFor: (r) => (r === SVH ? { briefId: "BRIEF-9", action: "UPDATE_EXISTING" } : null) },
  });
  assert.equal(autoExecuted.length, 0);
  assert.ok(needsReview[0].blockers.some((b) => b.code === REVIEW_REASONS.PUBLISHER_EDIT_PENDING));
});

// --- Human decisions and history -------------------------------------------------

test("a link this agent shipped and a person later removed is never put back", () => {
  const first = classify(site());
  const fp = first.autoExecuted[0].fingerprint;
  const history = buildHistory([
    {
      reportDate: "2026-09-10",
      mode: "apply",
      execution: { committed: true, pushAttempted: true, pushed: true },
      autoExecuted: [{ id: "LINK-2026-09-10-001", fingerprint: fp }],
      needsReview: [],
    },
  ]);
  const { autoExecuted, needsReview } = classify(site(), { history });
  assert.equal(autoExecuted.length, 0);
  assert.ok(needsReview[0].blockers.some((b) => b.code === REVIEW_REASONS.PREVIOUSLY_AUTO_FIXED));
});

test("a dry-run's proposal is NOT treated as a shipped link, so it stays auto-executable", () => {
  const first = classify(site());
  const fp = first.autoExecuted[0].fingerprint;
  const history = buildHistory([
    { reportDate: "2026-09-17", mode: "dry-run", execution: { committed: false }, autoExecuted: [{ id: "L", fingerprint: fp }], needsReview: [] },
  ]);
  assert.equal(classify(site(), { history }).autoExecuted.length, 1);
});

test("a vetoed fingerprint is never auto-executed and never re-listed for review", () => {
  const fp = classify(site()).autoExecuted[0].fingerprint;
  const config = testConfig({ decisions: { rejected: [{ fingerprint: fp, note: "not this one", date: TODAY }] } });
  const { autoExecuted, needsReview, vetoed } = classify(site(), { config });
  assert.equal(autoExecuted.length, 0);
  assert.equal(needsReview.length, 0);
  assert.equal(vetoed.length, 1);
});

test("history is read from the output dir and CI run folders, one report per date, fixtures skipped", () => {
  const root = mkdtempSync(join(tmpdir(), "lvinit-links-hist-"));
  const write = (rel, body) => {
    mkdirSync(join(root, rel, ".."), { recursive: true });
    writeFileSync(join(root, rel), JSON.stringify(body), "utf8");
  };
  try {
    write("out/internal-links-2026-09-10.json", { reportDate: "2026-09-10", mode: "dry-run" });
    write("hist/run-1/internal-links-2026-09-10.json", { reportDate: "2026-09-10", mode: "apply" });
    write("hist/run-2/internal-links-2026-09-03.json", { reportDate: "2026-09-03", mode: "dry-run" });
    write("out/fixtures/internal-links-2026-09-15.json", { reportDate: "2026-09-15", fixtureData: true });
    write(`out/internal-links-${TODAY}.json`, { reportDate: TODAY, mode: "dry-run" });
    const reports = readPreviousReports([join(root, "out"), join(root, "hist")], { excludeDate: TODAY });
    assert.deepEqual(reports.map((r) => [r.reportDate, r.mode]), [["2026-09-03", "dry-run"], ["2026-09-10", "apply"]]);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("an unchanged review item is listed once under Still open instead of written up again", () => {
  const config = testConfig({ relevance: { autoExecuteMinConfidence: 0.99 } });
  const graph = graphFrom(site(), config);
  const base = { graph, config, reportDate: TODAY, gscSignal: neutralGsc, factDecaySignal: permissiveFactDecay };
  const firstRun = analyze(base);
  const item = firstRun.needsReview[0];
  const earlier = ["2026-09-03", "2026-09-10"].map((reportDate) => ({
    reportDate,
    mode: "dry-run",
    autoExecuted: [],
    needsReview: [{ id: "X", fingerprint: item.fingerprint, confidence: item.confidence, blockers: item.blockers.map((b) => ({ code: b.code })) }],
  }));
  const later = analyze({ ...base, graph: graphFrom(site(), config), previousReports: earlier });
  assert.equal(later.quietReview.length, 1);
  assert.equal(later.shownReview.length, 0);
  assert.equal(later.needsReview[0].status, "PERSISTING");
  later.execution = { validation: { summary: "", results: [] } };
  const md = buildMarkdownReport({ analysis: later, config, meta: { dataSource: "repository-scan", origin: "x" } });
  assert.match(md, /### Still open \(not repeated\)/);
  const json = buildJsonReport({ analysis: later, config, meta: { dataSource: "repository-scan", origin: "x" } });
  assert.equal(json.needsReview[0].shownInFull, false, "next week's run can count how often it was shown");
  assert.equal(json.needsReview[0].disposition, "REVIEW_REQUIRED");
});

test("an auto-executed item's report lists every safety gate it passed", () => {
  const config = testConfig();
  const analysis = analyze({ graph: graphFrom(site(), config), config, reportDate: TODAY, gscSignal: neutralGsc, factDecaySignal: permissiveFactDecay });
  analysis.execution = { validation: { summary: "", results: [] } };
  const md = buildMarkdownReport({ analysis, config, meta: { dataSource: "repository-scan", origin: "x" } });
  assert.match(md, /Every safety gate it passed/);
  for (const gate of ["Fair Housing", "Fact-Decay", "does not already link", "exactly one destination", "no metadata, schema"]) {
    assert.ok(md.includes(gate), gate);
  }
});

// --- Git: trial precondition and the clean-rebase path ----------------------------

function repoWithRemote() {
  const root = mkdtempSync(join(tmpdir(), "lvinit-links-rb-"));
  const remote = mkdtempSync(join(tmpdir(), "lvinit-links-rb-remote-"));
  const other = mkdtempSync(join(tmpdir(), "lvinit-links-rb-other-"));
  const g = (cwd, ...args) => spawnSync("git", args, { cwd, encoding: "utf8" });
  spawnSync("git", ["init", "--bare", "-b", "main", remote], { encoding: "utf8" });
  for (const dir of [root]) {
    g(dir, "init", "-b", "main");
    g(dir, "config", "user.email", "t@example.com");
    g(dir, "config", "user.name", "T");
  }
  mkdirSync(join(root, "app/guides/x"), { recursive: true });
  mkdirSync(join(root, "app/guides/y"), { recursive: true });
  writeFileSync(join(root, "app/guides/x/page.tsx"), storyPage(section("One", PARAGRAPH)), "utf8");
  writeFileSync(join(root, "app/guides/y/page.tsx"), "export default function Y() { return null; }\n", "utf8");
  g(root, "add", ".");
  g(root, "commit", "-m", "initial");
  g(root, "remote", "add", "origin", remote);
  g(root, "push", "origin", "main");
  const oldHead = g(root, "rev-parse", "HEAD").stdout.trim();
  // Someone else pushes to the remote while the agent is "working".
  spawnSync("git", ["clone", remote, other], { encoding: "utf8" });
  g(other, "config", "user.email", "o@example.com");
  g(other, "config", "user.name", "O");
  const otherPush = (file, text) => {
    writeFileSync(join(other, file), text, "utf8");
    g(other, "add", ".");
    g(other, "commit", "-m", "someone else");
    g(other, "push", "origin", "main");
  };
  // The agent's own commit.
  const agentCommit = () => {
    const file = join(root, "app/guides/x/page.tsx");
    writeFileSync(file, readFileSync(file, "utf8").replace("Water Street District", '<Link href="/w" className={linkCls}>Water Street District</Link>'), "utf8");
    g(root, "commit", "-am", "chore: improve LVINIT internal linking");
  };
  const newHead = () => {
    g(root, "fetch", "origin", "main");
    return g(root, "rev-parse", "origin/main").stdout.trim();
  };
  const cleanup = () => [root, remote, other].forEach((d) => rmSync(d, { recursive: true, force: true }));
  return { root, oldHead, otherPush, agentCommit, newHead, g, cleanup };
}

test("the remote moved on an unrelated file: the agent's one commit rebases cleanly", () => {
  const r = repoWithRemote();
  try {
    r.otherPush("app/guides/y/page.tsx", "export default function Y() { return 1; }\n");
    r.agentCommit();
    const result = rebaseOntoRemote({
      repoRoot: r.root,
      config: testConfig(),
      oldRemoteHead: r.oldHead,
      newRemoteHead: r.newHead(),
      editedPaths: ["app/guides/x/page.tsx"],
    });
    assert.equal(result.ok, true, result.reason);
    const diff = inspectDiff({ repoRoot: r.root, config: testConfig(), range: "HEAD~1..HEAD" });
    assert.equal(diff.onlyLinkWrappers, true, "the rebased commit is still only a <Link> wrapper");
    assert.deepEqual(diff.paths, ["app/guides/x/page.tsx"]);
  } finally {
    r.cleanup();
  }
});

test("the remote moved on a file the agent edited: it refuses to rebase (source changed between analysis and edit)", () => {
  const r = repoWithRemote();
  try {
    r.otherPush("app/guides/x/page.tsx", storyPage(section("One", "Rewritten by the Content Publisher.")));
    r.agentCommit();
    const before = r.g(r.root, "rev-parse", "HEAD").stdout.trim();
    const result = rebaseOntoRemote({
      repoRoot: r.root,
      config: testConfig(),
      oldRemoteHead: r.oldHead,
      newRemoteHead: r.newHead(),
      editedPaths: ["app/guides/x/page.tsx"],
    });
    assert.equal(result.ok, false);
    assert.match(result.reason, /also edited/);
    assert.equal(r.g(r.root, "rev-parse", "HEAD").stdout.trim(), before, "nothing was rewritten");
  } finally {
    r.cleanup();
  }
});

test("rebase refuses when HEAD is not exactly the agent's one commit", () => {
  const r = repoWithRemote();
  try {
    r.otherPush("app/guides/y/page.tsx", "export default function Y() { return 2; }\n");
    const result = rebaseOntoRemote({
      repoRoot: r.root,
      config: testConfig(),
      oldRemoteHead: r.oldHead,
      newRemoteHead: r.newHead(),
      editedPaths: ["app/guides/x/page.tsx"],
    });
    assert.equal(result.ok, false, "zero commits of ours on top — nothing to rebase, nothing to push");
  } finally {
    r.cleanup();
  }
});

test("a trial's diff inspection is scoped to the files it edited; a real run's is the whole tree", () => {
  const r = repoWithRemote();
  try {
    const page = join(r.root, "app/guides/x/page.tsx");
    writeFileSync(page, readFileSync(page, "utf8").replace("Water Street District", '<Link href="/w" className={linkCls}>Water Street District</Link>'), "utf8");
    writeFileSync(join(r.root, "app/guides/y/page.tsx"), "// unrelated work in progress\n", "utf8");
    const whole = inspectDiff({ repoRoot: r.root, config: testConfig() });
    assert.equal(whole.onlyLinkWrappers, false, "a real run sees the unrelated change and refuses");
    const scoped = inspectDiff({ repoRoot: r.root, config: testConfig(), paths: ["app/guides/x/page.tsx"] });
    assert.equal(scoped.onlyLinkWrappers, true);
    assert.deepEqual(scoped.paths, ["app/guides/x/page.tsx"]);
  } finally {
    r.cleanup();
  }
});

test("the trial precondition only cares whether the files it will edit are clean", () => {
  const r = repoWithRemote();
  try {
    writeFileSync(join(r.root, "untracked-elsewhere.txt"), "someone's notes\n", "utf8");
    assert.equal(pathsAreClean(r.root, ["app/guides/x/page.tsx"]).ok, true, "unrelated untracked files do not matter");
    writeFileSync(join(r.root, "app/guides/x/page.tsx"), "// mid-edit\n", "utf8");
    const dirty = pathsAreClean(r.root, ["app/guides/x/page.tsx"]);
    assert.equal(dirty.ok, false);
    assert.equal(dirty.dirty.length, 1);
  } finally {
    r.cleanup();
  }
});
