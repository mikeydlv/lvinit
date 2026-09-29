// ---------------------------------------------------------------------------
// PUBLISHER INPUT HANDOFF — the contract
//
// Three upstream agents each own ONE stable file on the lvinit-agent-state
// branch. The Content Publisher reads all three and writes none of them.
//
//   reports/gsc/publisher-input.json               GSC Opportunity Agent
//   reports/content-briefs/publisher-input.json    Content Brief Generator
//   reports/development-watch/publisher-input.json Development Watch
//
// This module is the single definition of those files: where they live, who
// writes them, what a valid one looks like, and when the Publisher may use one
// for prioritization. The writers validate against it before committing; the
// Publisher's reader (scripts/publisher-inputs/read.mjs) assesses against it.
//
// Pure functions only — no I/O. See docs/PUBLISHER_HANDOFF.md.
// ---------------------------------------------------------------------------

export const HANDOFF_SCHEMA_VERSION = 1;
export const STATE_BRANCH = "lvinit-agent-state";

export const INPUTS = {
  gsc: {
    path: "reports/gsc/publisher-input.json",
    agent: "gsc-opportunity-agent",
    writer: ".github/workflows/gsc-opportunity-agent.yml (publish-state job)",
    freshDays: 8,
    staleAfterDays: 15,
  },
  briefs: {
    path: "reports/content-briefs/publisher-input.json",
    agent: "content-brief-generator",
    writer: ".github/workflows/content-brief-generator.yml (publish-state job)",
    freshDays: 8,
    staleAfterDays: 15,
    // A brief is only as current as the search data behind it.
    maxSourceGscAgeDays: 15,
  },
  devwatch: {
    path: "reports/development-watch/publisher-input.json",
    agent: "development-watch",
    writer: ".github/workflows/local-trend-agent.yml (Development Watch module)",
    freshDays: 2,
    staleAfterDays: 7,
  },
};

export const STATUSES = ["ok", "empty", "fixture"];
export const CONFIDENCE_LEVELS = ["low", "medium", "high"];
export const DEVWATCH_CLASSIFICATIONS = ["ok", "needs_revalidation"];

/** Keys that must never appear anywhere in the public GSC or Brief handoff. */
export const FORBIDDEN_QUERY_KEYS = new Set([
  "query",
  "queries",
  "leadQuery",
  "sourceQueries",
  "topQuery",
  "rawQuery",
  "searchDemand",
  "excluded",
]);

// ---------------------------------------------------------------------------
// Dates
// ---------------------------------------------------------------------------

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function toDay(value) {
  if (typeof value !== "string" || !value) return null;
  const day = DATE_RE.test(value) ? value : value.slice(0, 10);
  if (!DATE_RE.test(day)) return null;
  const t = Date.parse(`${day}T00:00:00Z`);
  return Number.isFinite(t) ? t : null;
}

/** Whole days from `from` to `today` (both YYYY-MM-DD or ISO). null if either is unusable. */
export function ageInDays(from, today) {
  const a = toDay(from);
  const b = toDay(today);
  if (a === null || b === null) return null;
  return Math.round((b - a) / 86_400_000);
}

/** fresh | caution | stale for an age, using an input's thresholds. */
export function freshnessFor(kind, ageDays) {
  const spec = INPUTS[kind];
  if (ageDays === null || ageDays === undefined) return "stale";
  if (ageDays <= spec.freshDays) return "fresh";
  if (ageDays <= spec.staleAfterDays) return "caution";
  return "stale";
}

// ---------------------------------------------------------------------------
// Schema validation
// ---------------------------------------------------------------------------

const isObj = (v) => v !== null && typeof v === "object" && !Array.isArray(v);
const isNum = (v) => typeof v === "number" && Number.isFinite(v);
const isStr = (v) => typeof v === "string" && v.length > 0;
const isNumOrNull = (v) => v === null || isNum(v);
const isStrOrNull = (v) => v === null || typeof v === "string";

/** Every key path in a JSON value, for the forbidden-key scan. */
export function findForbiddenKeys(value, path = "$") {
  const hits = [];
  if (Array.isArray(value)) {
    value.forEach((v, i) => hits.push(...findForbiddenKeys(v, `${path}[${i}]`)));
  } else if (isObj(value)) {
    for (const [k, v] of Object.entries(value)) {
      if (FORBIDDEN_QUERY_KEYS.has(k)) hits.push(`${path}.${k}`);
      hits.push(...findForbiddenKeys(v, `${path}.${k}`));
    }
  }
  return hits;
}

function validateEnvelope(kind, doc, problems) {
  const spec = INPUTS[kind];
  if (!isObj(doc)) {
    problems.push("not a JSON object");
    return false;
  }
  if (doc.schema_version !== HANDOFF_SCHEMA_VERSION) problems.push(`schema_version must be ${HANDOFF_SCHEMA_VERSION}`);
  if (doc.agent !== spec.agent) problems.push(`agent must be "${spec.agent}"`);
  if (typeof doc.fixture !== "boolean") problems.push("fixture must be a boolean");
  if (!STATUSES.includes(doc.status)) problems.push(`status must be one of ${STATUSES.join(", ")}`);
  if (!Array.isArray(doc.items)) problems.push("items must be an array");
  // generatedAt / reportDate are checked for presence by assessInput, not here:
  // a file missing them is structurally readable but unusable for ranking.
  if (doc.generatedAt !== undefined && doc.generatedAt !== null && !isStr(doc.generatedAt)) problems.push("generatedAt must be a string");
  if (doc.reportDate !== undefined && doc.reportDate !== null && !isStr(doc.reportDate)) problems.push("reportDate must be a string");
  return Array.isArray(doc.items);
}

function validateGscItem(item, i, problems) {
  const p = (m) => problems.push(`items[${i}]: ${m}`);
  if (!isObj(item)) return p("not an object");
  if (!isStr(item.id)) p("id is required");
  if (!isStr(item.opportunityType)) p("opportunityType is required");
  if (!isStrOrNull(item.page)) p("page must be a route or null");
  if (!isObj(item.topic) || !isStr(item.topic.label)) p("topic.label is required");
  for (const k of ["impressions", "clicks"]) if (!isNum(item[k])) p(`${k} must be a number`);
  if (!isNumOrNull(item.position)) p("position must be a number or null");
  if (!isNum(item.score)) p("score must be a number");
  if (!CONFIDENCE_LEVELS.includes(item.confidence)) p("confidence must be low | medium | high");
  if (!isStr(item.recommendedAction)) p("recommendedAction is required");
}

function validateBriefItem(item, i, problems) {
  const p = (m) => problems.push(`items[${i}]: ${m}`);
  if (!isObj(item)) return p("not an object");
  if (!isStr(item.id)) p("id is required");
  if (!isStr(item.recommendedAction)) p("recommendedAction is required");
  if (!isStr(item.cluster)) p("cluster is required");
  if (!Array.isArray(item.keyQuestions)) p("keyQuestions must be an array");
  if (!Array.isArray(item.relatedPages)) p("relatedPages must be an array");
  if (!isObj(item.duplicateCheck)) p("duplicateCheck must be an object");
  if (!CONFIDENCE_LEVELS.includes(item.confidence)) p("confidence must be low | medium | high");
  if (!isStr(item.fingerprint)) p("fingerprint is required");
  if (!isStrOrNull(item.sourceGscReportDate)) p("sourceGscReportDate must be a date or null");
}

function validateDevwatchItem(item, i, problems) {
  const p = (m) => problems.push(`items[${i}]: ${m}`);
  if (!isObj(item)) return p("not an object");
  if (!isStr(item.id)) p("id is required");
  if (!isStr(item.project)) p("project is required");
  if (!isStr(item.type)) p("type is required");
  if (!Array.isArray(item.sourceUrls)) p("sourceUrls must be an array");
  if (!isNum(item.significance)) p("significance must be a number");
  if (!CONFIDENCE_LEVELS.includes(item.confidence)) p("confidence must be low | medium | high");
  if (typeof item.verified !== "boolean") p("verified must be a boolean");
  if (typeof item.provisional !== "boolean") p("provisional must be a boolean");
  if (!DEVWATCH_CLASSIFICATIONS.includes(item.classification)) p(`classification must be ${DEVWATCH_CLASSIFICATIONS.join(" | ")}`);
  if (!isStr(item.reportDate)) p("reportDate is required");
}

const ITEM_VALIDATORS = { gsc: validateGscItem, briefs: validateBriefItem, devwatch: validateDevwatchItem };

/**
 * Structural validation. Returns { valid, problems }.
 * The GSC and Brief files are also scanned for any query-bearing key.
 */
export function validateHandoff(kind, doc) {
  if (!INPUTS[kind]) throw new Error(`unknown handoff kind "${kind}"`);
  const problems = [];
  if (validateEnvelope(kind, doc, problems)) {
    doc.items.forEach((item, i) => ITEM_VALIDATORS[kind](item, i, problems));
  }
  if (kind === "gsc" || kind === "briefs") {
    for (const hit of findForbiddenKeys(doc)) problems.push(`forbidden query-bearing key at ${hit}`);
  }
  return { valid: problems.length === 0, problems };
}

// ---------------------------------------------------------------------------
// Usability — what the Publisher may rank on
// ---------------------------------------------------------------------------

/**
 * Item-level exclusions. An excluded item may be mentioned as background but
 * is never a reason to prioritize anything.
 */
export function itemExclusions(kind, item, { today } = {}) {
  const reasons = [];
  if (item.fixture === true) reasons.push("fixture item");
  if (item.fairHousingFlag === true) reasons.push("unresolved Fair Housing / compliance flag");
  if (item.sourceValidation === "failed") reasons.push("source validation failed");
  if (kind === "devwatch") {
    if (item.provisional === true) reasons.push("provisional entity");
    if (item.classification === "needs_revalidation") reasons.push("classification needs revalidation");
  }
  if (kind === "briefs") {
    const age = ageInDays(item.sourceGscReportDate, today);
    if (age === null) reasons.push("brief has no source GSC report date");
    else if (age > INPUTS.briefs.maxSourceGscAgeDays) reasons.push(`source GSC report is ${age} days old (> ${INPUTS.briefs.maxSourceGscAgeDays})`);
  }
  return reasons;
}

/**
 * Assess one handoff file for the Publisher.
 *
 * @param {"gsc"|"briefs"|"devwatch"} kind
 * @param {object|null} doc   parsed JSON, or null when the file is missing/unreadable
 * @param {{today:string, readError?:string}} opts
 * @returns {{
 *   kind, path, availability: "available"|"unavailable"|"invalid",
 *   freshness: "fresh"|"caution"|"stale"|null, ageDays: number|null,
 *   usableForPrioritization: boolean, reasons: string[],
 *   usableItems: object[], excludedItems: {id, reasons}[], lowConfidenceItems: string[],
 *   notes: string[]
 * }}
 */
export function assessInput(kind, doc, { today, readError } = {}) {
  const spec = INPUTS[kind];
  const base = {
    kind,
    path: spec.path,
    availability: "available",
    freshness: null,
    ageDays: null,
    usableForPrioritization: false,
    reasons: [],
    usableItems: [],
    excludedItems: [],
    lowConfidenceItems: [],
    notes: [],
  };

  if (doc === null || doc === undefined) {
    return { ...base, availability: "unavailable", reasons: [readError ?? "file not found on the state branch"] };
  }

  const { valid, problems } = validateHandoff(kind, doc);
  if (!valid) return { ...base, availability: "invalid", reasons: problems };

  const reasons = [];
  if (!isStr(doc.generatedAt)) reasons.push("generatedAt is missing");
  if (!isStr(doc.reportDate)) reasons.push("reportDate is missing");
  if (doc.fixture === true || doc.status === "fixture") reasons.push("fixture data");

  // Age runs from the OLDER of the two timestamps: re-publishing old data does
  // not make it fresh.
  const ages = [ageInDays(doc.generatedAt, today), ageInDays(doc.reportDate, today)].filter((a) => a !== null);
  const ageDays = ages.length ? Math.max(...ages) : null;
  const freshness = ageDays === null ? null : freshnessFor(kind, ageDays);
  if (freshness === "stale") reasons.push(`stale: ${ageDays} days old (> ${spec.staleAfterDays})`);
  if (ages.some((a) => a < -1)) reasons.push("timestamp is in the future");

  const notes = [];
  if (freshness === "caution") notes.push(`caution: ${ageDays} days old — usable, but say so in the run summary`);
  if (kind === "gsc" && doc.dataQuality?.lowVolume) {
    notes.push("low-volume Search Console data — treat as an early signal, not definitive search demand");
  }
  if (kind === "devwatch") {
    notes.push("re-verify each item's primary source before publishing any factual claim or prioritizing a time-sensitive story");
  }

  const usableItems = [];
  const excludedItems = [];
  const lowConfidenceItems = [];
  for (const item of doc.items) {
    const why = itemExclusions(kind, item, { today });
    if (why.length) {
      excludedItems.push({ id: item.id, reasons: why });
      continue;
    }
    usableItems.push(item);
    if (item.confidence === "low") lowConfidenceItems.push(item.id);
  }
  if (lowConfidenceItems.length) {
    notes.push("low-confidence items may support a decision but may never be its sole reason");
  }

  const usable = reasons.length === 0;
  return {
    ...base,
    freshness,
    ageDays,
    usableForPrioritization: usable,
    reasons,
    usableItems: usable ? usableItems : [],
    excludedItems,
    lowConfidenceItems: usable ? lowConfidenceItems : [],
    notes,
  };
}

/** Assess all three. `docs` maps kind -> parsed JSON or null. */
export function assessAll(docs, { today, readErrors = {} } = {}) {
  const inputs = Object.keys(INPUTS).map((kind) =>
    assessInput(kind, docs[kind] ?? null, { today, readError: readErrors[kind] })
  );
  const usable = inputs.filter((i) => i.usableForPrioritization).map((i) => i.kind);
  return {
    today,
    inputs,
    usable,
    // Missing inputs never block a run: the Publisher falls back to the repo,
    // the content cluster map and current factual research.
    canProceed: true,
    fallback:
      usable.length === 0
        ? "No upstream input is usable for prioritization. Proceed from current repository state, docs/LVINIT_CONTENT_CLUSTER_MAP.md and current factual research."
        : null,
  };
}
