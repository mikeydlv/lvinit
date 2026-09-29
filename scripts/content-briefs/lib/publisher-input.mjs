// ---------------------------------------------------------------------------
// CONTENT BRIEFS → PUBLISHER HANDOFF (public)
//
// Turns one Brief Generator run (content-opportunities-YYYY-MM-DD.json plus
// its briefs/*.json) into reports/content-briefs/publisher-input.json on the
// PUBLIC lvinit-agent-state branch.
//
// Only what the Publisher needs to weigh a brief: the recommended action, the
// target or proposed route, the intent in fixed vocabulary, the questions the
// piece should answer, the duplicate check, confidence and provenance.
//
// Briefs are built from Search Console queries, so the same rule as the GSC
// handoff applies: no raw query string is published. The full brief files
// (with their gscEvidence) stay in the workflow artifact. The builder refuses
// (throws) if any raw query from the source report would appear in its output.
// ---------------------------------------------------------------------------

import { assertNoRawQueries, staticVocabulary } from "../../gsc/lib/publisher-input.mjs";
import { tokenize } from "../../gsc/lib/text.mjs";
import { ENTITIES } from "./intent.mjs";
import { HANDOFF_SCHEMA_VERSION, INPUTS, validateHandoff } from "../../publisher-inputs/contract.mjs";

/** Actions the Publisher can act on. Monitor-only and rejections stay in the artifact. */
export const PUBLISHER_ACTIONS = new Set(["UPDATE_EXISTING", "EXPAND_EXISTING", "NEW_ARTICLE", "NEW_COMPARISON", "INTERNAL_LINK_ONLY"]);

const QUERY_KEYS = new Set(["query", "leadQuery"]);
const QUERY_LIST_KEYS = new Set(["sourceQueries"]);

/** Every raw query string anywhere in a brief report or brief file. */
export function collectBriefQueries(...docs) {
  const out = new Set();
  const walk = (v) => {
    if (Array.isArray(v)) return v.forEach(walk);
    if (!v || typeof v !== "object") return;
    for (const [k, x] of Object.entries(v)) {
      if (QUERY_KEYS.has(k) && typeof x === "string" && x.trim()) out.add(x.trim().toLowerCase());
      else if (QUERY_LIST_KEYS.has(k) && Array.isArray(x)) x.forEach((q) => typeof q === "string" && q.trim() && out.add(q.trim().toLowerCase()));
      else walk(x);
    }
  };
  docs.forEach(walk);
  return out;
}

/**
 * Key questions minus any that quote a searcher. The Brief generator appends
 * question-shaped queries verbatim ("Searchers literally ask: ..."); those stay
 * in the private artifact.
 */
export function publicKeyQuestions(questions, rawQueries = new Set()) {
  if (!Array.isArray(questions)) return [];
  // A query made only of fixed vocabulary ("summerlin") is our own word, not a quote.
  const vocab = briefVocabulary();
  const raw = [...rawQueries].filter((r) => !tokenize(r).every((t) => vocab.has(t)));
  return questions.filter(
    (q) => typeof q === "string" && !/^searcherss+literallys+ask/i.test(q) && !raw.some((r) => r.length >= 3 && q.toLowerCase().includes(r))
  );
}

let vocabCache = null;
const briefVocabulary = () => (vocabCache ??= staticVocabulary(ENTITIES.map((e) => e.label)));

const level = (c) => (["low", "medium", "high"].includes(String(c).toLowerCase()) ? String(c).toLowerCase() : "low");

export function briefItem(opp, briefFile, { gscValid, rawQueries = new Set() }) {
  const dc = opp.duplicateCheck ?? {};
  const related = (briefFile?.relevantExistingPages ?? opp.rankingPages ?? [])
    .filter((p) => typeof p?.route === "string")
    .slice(0, 6)
    .map((p) => ({ route: p.route, relation: p.relation ?? "ranking", overlap: typeof p.overlap === "number" ? p.overlap : null }));

  return {
    id: String(opp.id),
    fingerprint: String(opp.fingerprint),
    intentKey: opp.intentKey ?? null,
    workingTitle: opp.workingTitle ?? briefFile?.workingTitle ?? null,
    primaryQuestion: briefFile?.primarySearchQuestion ?? null,
    intent: briefFile?.underlyingIntent?.intent ?? opp.shape ?? null,
    cluster: opp.cluster ?? "general",
    contentType: typeof briefFile?.contentType === "string" ? briefFile.contentType : briefFile?.contentType?.label ?? null,
    recommendedAction: String(opp.action),
    target: opp.target ?? null,
    proposedRoute: opp.proposedRoute ?? null,
    keyQuestions: publicKeyQuestions(briefFile?.keyQuestions, rawQueries),
    relatedPages: related,
    duplicateCheck: {
      verdict: dc.verdict ?? null,
      ambiguous: Boolean(dc.ambiguous),
      bestMatch: dc.bestMatch?.route ? { route: dc.bestMatch.route, overlap: dc.bestMatch.overlap ?? null, relation: dc.bestMatch.relation ?? null } : null,
      cannibalization: dc.cannibalization?.status ?? null,
    },
    flags: Array.isArray(opp.flags) ? opp.flags.filter((f) => typeof f === "string") : [],
    score: Number.isFinite(opp.score) ? opp.score : 0,
    confidence: level(opp.confidence),
    status: opp.status ?? null,
    handoffStatus: opp.handoffStatus ?? null,
    persistenceRuns: Number.isFinite(opp.persistenceRuns) ? opp.persistenceRuns : null,
    sourceGscReportDate: opp.sourceGscReportDate ?? null,
    fairHousingFlag: briefFile?.fairHousing?.clean === false,
    sourceValidation: gscValid ? "ok" : "failed",
  };
}

/**
 * @param {object} report       content-opportunities-YYYY-MM-DD.json
 * @param {Map<string,object>} briefFiles  brief id -> briefs/<id>.json
 */
export function buildBriefPublisherInput(report, briefFiles = new Map(), { generatedAt = new Date().toISOString() } = {}) {
  if (!report || typeof report !== "object") throw new Error("no brief report to build from");
  const fixture = Boolean(report.fixtureData);
  const gsc = report.inputs?.gsc ?? {};
  const gscValid = Boolean(gsc.available) && !fixture;

  const rawQueries = collectBriefQueries(report, ...briefFiles.values());
  const actionable = (report.opportunities ?? []).filter((o) => PUBLISHER_ACTIONS.has(o.action));
  const items = actionable.map((o) => briefItem(o, briefFiles.get(o.id), { gscValid, rawQueries }));
  const skipped = {};
  for (const o of report.opportunities ?? []) if (!PUBLISHER_ACTIONS.has(o.action)) skipped[o.action] = (skipped[o.action] ?? 0) + 1;

  const doc = {
    schema_version: HANDOFF_SCHEMA_VERSION,
    agent: INPUTS.briefs.agent,
    generatedAt,
    reportDate: report.reportDate ?? null,
    sourceGeneratedAt: report.generatedAt ?? null,
    fixture,
    status: fixture ? "fixture" : items.length ? "ok" : "empty",
    source: {
      gscReportDate: gsc.reportDate ?? null,
      gscAvailable: Boolean(gsc.available),
      gscLowVolume: gsc.lowVolume ?? null,
      handoffMode: report.summary?.handoffMode ?? report.handoff?.mode ?? null,
    },
    scope: "Publisher actions only. Monitor-only and rejected intents are left out; the full report stays in the content-briefs artifact.",
    skippedByAction: skipped,
    privacy: {
      rawQueriesIncluded: false,
      policy: "This file is public. Grouped Search Console queries and brief gscEvidence stay in the private workflow artifact.",
    },
    publisherNote:
      "Briefs are inference from search demand. Research and confirm every fact before publishing; never publish Search Console figures as editorial facts.",
    items,
  };

  // Entity labels ("moving to Las Vegas", "property tax") are the Brief agent's own
  // fixed vocabulary; generated titles and questions are built from them.
  assertNoRawQueries(doc, rawQueries, { extraVocabulary: ENTITIES.map((e) => e.label) });
  const { valid, problems } = validateHandoff("briefs", doc);
  if (!valid) throw new Error(`Brief handoff failed its own schema: ${problems.join("; ")}`);
  return doc;
}
