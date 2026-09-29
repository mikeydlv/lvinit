// ---------------------------------------------------------------------------
// GSC → PUBLISHER HANDOFF (sanitized, public)
//
// Turns a full GSC opportunity report into reports/gsc/publisher-input.json on
// the PUBLIC lvinit-agent-state branch. The full report (raw queries and all)
// stays in the workflow artifact for Mikey; this file must never carry a raw
// Search Console query string.
//
// How a finding is described without its query:
//   * the LVINIT page it concerns (a route on our own site), and
//   * a topic built ONLY from fixed vocabulary — the GSC agent's topic cluster,
//     its editorial-priority keys, and a closed list of place names.
// Nothing the searcher typed is copied through.
//
// A finding is omitted from the handoff when:
//   * its query looks like an address, phone number or email (address-like)
//   * its query is Fair Housing blocked (defence in depth — the agent already
//     excludes these from findings)
//   * it cannot be represented without the query: no LVINIT page owns it and
//     the vocabulary finds no topic or place
//
// Last line of defence: buildGscPublisherInput() refuses (throws) if any raw
// query from the source report appears in its output, or if any query-bearing
// key does. Better no handoff than a leaked query.
// ---------------------------------------------------------------------------

import { checkFairHousing } from "./fair-housing.mjs";
import { EDITORIAL_SIGNALS } from "./editorial.mjs";
import { tokenize } from "./text.mjs";
import { HANDOFF_SCHEMA_VERSION, INPUTS, findForbiddenKeys, validateHandoff } from "../../publisher-inputs/contract.mjs";

/** Closed place vocabulary. Output uses the label, never the matched text. */
export const PLACE_VOCAB = [
  { key: "summerlin", label: "Summerlin", re: /\bsummerlin\b/i },
  { key: "henderson", label: "Henderson", re: /\bhenderson\b/i },
  { key: "southwest-las-vegas", label: "Southwest Las Vegas", re: /\bsouth\s?west\b/i },
  { key: "spring-valley", label: "Spring Valley", re: /\bspring\s+valley\b/i },
  { key: "enterprise", label: "Enterprise", re: /\benterprise\b/i },
  { key: "north-las-vegas", label: "North Las Vegas", re: /\bnorth\s+las\s+vegas\b|\bnlv\b/i },
  { key: "downtown", label: "Downtown / Arts District", re: /\bdowntown\b|\barts\s+district\b/i },
  { key: "green-valley", label: "Green Valley", re: /\bgreen\s+valley\b/i },
  { key: "lake-las-vegas", label: "Lake Las Vegas", re: /\blake\s+las\s+vegas\b/i },
  { key: "inspirada", label: "Inspirada", re: /\binspirada\b/i },
  { key: "cadence", label: "Cadence", re: /\bcadence\b/i },
  { key: "skye-canyon", label: "Skye Canyon", re: /\bskye\s+canyon\b/i },
  { key: "mountains-edge", label: "Mountain's Edge", re: /\bmountains?\s?'?s?\s+edge\b/i },
  { key: "southern-highlands", label: "Southern Highlands", re: /\bsouthern\s+highlands\b/i },
  { key: "uncommons", label: "UnCommons", re: /\buncommons\b/i },
  { key: "las-vegas", label: "Las Vegas", re: /\blas\s+vegas\b|\bvegas\b/i },
];

export const CLUSTER_LABELS = {
  "area-comparison": "Area comparison",
  relocation: "Relocation",
  "rent-vs-buy": "Rent vs. buy",
  "new-vs-resale": "New construction vs. resale",
  "commute-access": "Commute and access",
  "cost-of-housing": "Cost of housing",
  development: "Development",
  "neighborhood-orientation": "Neighborhood orientation",
  general: "General",
};

export const TYPE_LABELS = {
  "quick-win": "Quick win",
  "ctr-opportunity": "Clickthrough opportunity",
  "emerging-query": "Emerging search",
  "page-gaining-momentum": "Page gaining momentum",
  "page-losing-momentum": "Page losing momentum",
  "content-gap": "Content gap",
  "query-page-mismatch": "Query / page mismatch",
  cannibalization: "Possible cannibalization",
  "internal-link": "Internal-link opportunity",
};

const ADDRESS_RE =
  /\b(?!(?:19|20)\d{2}\b)\d{2,6}\s+(?:[nsew]\.?\s+)?[a-z0-9]+(?:\s+[a-z0-9]+){0,4}\s+(?:st|street|ave|avenue|rd|road|dr|drive|ln|lane|ct|court|blvd|boulevard|way|pl|place|cir|circle|pkwy|parkway|ter|terrace|trl|trail|hwy|highway|loop|row|pass|run)\b/i;
const UNIT_RE = /\b(?:apt|apartment|unit|suite|ste|#)\s*\d+/i;
const PHONE_RE = /\d[\d\s().-]{8,}\d/;
const EMAIL_RE = /[^\s@]+@[^\s@]+\.[a-z]{2,}/i;
const LONG_NUMBER_RE = /\d{7,}/;

/** True when a query could identify a property or a person. */
export function looksPersonal(query) {
  const q = String(query ?? "");
  return ADDRESS_RE.test(q) || UNIT_RE.test(q) || PHONE_RE.test(q) || EMAIL_RE.test(q) || LONG_NUMBER_RE.test(q);
}

export function placesIn(query) {
  const q = String(query ?? "");
  const found = PLACE_VOCAB.filter((p) => p.re.test(q));
  // "Las Vegas" is implied by every other place; only keep it alone.
  return found.length > 1 ? found.filter((p) => p.key !== "las-vegas") : found;
}

const CONFIDENCE = { low: "low", medium: "medium", high: "high" };
const round = (n, d = 1) => (Number.isFinite(n) ? Math.round(n * 10 ** d) / 10 ** d : null);

/**
 * One finding → one sanitized item, or { omit: reason }.
 */
export function sanitizeOpportunity(opp) {
  const query = opp.query ?? null;
  if (query && looksPersonal(query)) return { omit: "addressLike" };
  if (query && checkFairHousing(query).blocked) return { omit: "fairHousing" };

  const cluster = CLUSTER_LABELS[opp.editorial?.topicCluster] ? opp.editorial.topicCluster : null;
  const priorities = (opp.editorial?.matchedPriorities ?? []).filter((k) => /^[a-z-]+$/.test(k));
  const places = query ? placesIn(query) : [];
  const page = typeof opp.landingPage === "string" && opp.landingPage.startsWith("/") ? opp.landingPage : null;
  const ownsPage = Boolean(page) && opp.landingPageExists !== false && opp.type !== "content-gap";

  const hasVocabTopic = (cluster && cluster !== "general") || places.length > 0;
  if (query && !ownsPage && !hasVocabTopic) return { omit: "notRepresentable" };

  const labelParts = [];
  if (cluster && cluster !== "general") labelParts.push(CLUSTER_LABELS[cluster]);
  if (places.length) labelParts.push(places.map((p) => p.label).join(", "));
  if (!labelParts.length) labelParts.push(TYPE_LABELS[opp.type] ?? "Search opportunity");
  if (ownsPage && !places.length) labelParts.push(page);

  const m = opp.metrics ?? {};
  return {
    item: {
      id: String(opp.id),
      opportunityType: String(opp.type),
      page,
      pageRole: page ? (opp.type === "content-gap" ? "current-fallback" : "affected-page") : null,
      pageExists: Boolean(page) && opp.landingPageExists !== false,
      topic: {
        label: labelParts.join(" · "),
        cluster: cluster ?? "general",
        places: places.map((p) => p.key),
        priorities,
        intent: typeof opp.editorial?.intent === "string" ? opp.editorial.intent : null,
      },
      impressions: Number.isFinite(m.impressions) ? m.impressions : 0,
      clicks: Number.isFinite(m.clicks) ? m.clicks : 0,
      position: round(m.position),
      positionChange: round(m.positionChange),
      score: Number.isFinite(opp.score) ? opp.score : 0,
      confidence: CONFIDENCE[String(opp.confidence?.level ?? opp.confidence ?? "").toLowerCase()] ?? "low",
      recommendedAction: String(opp.recommendationKind ?? "monitor-only"),
      querySuppressed: Boolean(query),
    },
  };
}

/** Every raw query string anywhere in a full GSC report. */
export function collectRawQueries(report) {
  const out = new Set();
  const add = (q) => {
    if (typeof q === "string" && q.trim()) out.add(q.trim().toLowerCase());
  };
  for (const o of report?.opportunities ?? []) add(o.query);
  for (const x of report?.fairHousing?.excluded ?? []) add(x.query);
  for (const w of [report?.searchDemand?.current, report?.searchDemand?.previous]) {
    for (const r of w?.queries?.rows ?? []) add(r.query);
    for (const r of w?.pairs?.rows ?? []) add(r.query);
  }
  return out;
}


/** Words the handoff is allowed to use on its own account — fixed, never taken from the output. */
export function staticVocabulary(extra = []) {
  const words = [
    ...PLACE_VOCAB.flatMap((p) => [p.key, p.label]),
    ...Object.entries(CLUSTER_LABELS).flat(),
    ...Object.entries(TYPE_LABELS).flat(),
    ...EDITORIAL_SIGNALS.map((x) => x.key),
    ...extra,
  ];
  return new Set(tokenize(words.join(" ")));
}

const ROUTE_KEYS = new Set(["page", "route", "target", "proposedRoute"]);

/** Our own site routes in the output (their words are ours, not the searcher's). */
function routeTokens(value, out = new Set()) {
  if (Array.isArray(value)) value.forEach((v) => routeTokens(v, out));
  else if (value && typeof value === "object") {
    for (const [k, v] of Object.entries(value)) {
      if (ROUTE_KEYS.has(k) && typeof v === "string" && v.startsWith("/")) tokenize(v).forEach((t) => out.add(t));
      else routeTokens(v, out);
    }
  }
  return out;
}

/**
 * Refuse if any raw query survives into the output, or any query-bearing key
 * does. A query made entirely of fixed vocabulary (a bare place name such as
 * "summerlin") is not a leak — those are our own labels. Every other query
 * must not appear anywhere in the serialized output.
 *
 * @param {object} output
 * @param {Set<string>} rawQueries  lowercased
 * @param {{extraVocabulary?: string[]}} opts  more fixed labels (e.g. Brief entities)
 */
export function assertNoRawQueries(output, rawQueries, { extraVocabulary = [] } = {}) {
  const keyHits = findForbiddenKeys(output);
  if (keyHits.length) throw new Error(`handoff refused: query-bearing key(s) ${keyHits.join(", ")}`);

  const vocab = staticVocabulary(extraVocabulary);
  for (const t of routeTokens(output)) vocab.add(t);
  const serialized = JSON.stringify(output).toLowerCase();
  const leaks = [];
  for (const q of rawQueries) {
    if (q.length < 3) continue;
    const tokens = tokenize(q);
    if (tokens.length && tokens.every((t) => vocab.has(t))) continue;
    const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const re = new RegExp(`(^|[^a-z0-9])${escaped}([^a-z0-9]|$)`);
    if (re.test(serialized)) leaks.push(q);
  }
  if (leaks.length) throw new Error(`handoff refused: ${leaks.length} raw query string(s) would be published`);
}

/**
 * Full report → public handoff document. Throws rather than leak.
 * @param {object} report  gsc-opportunities-YYYY-MM-DD.json
 * @param {{generatedAt?: string}} opts
 */
export function buildGscPublisherInput(report, { generatedAt = new Date().toISOString() } = {}) {
  if (!report || typeof report !== "object") throw new Error("no GSC report to build from");
  const fixture = Boolean(report.fixtureData) || report.dataSource === "fixture";

  const items = [];
  const omitted = { addressLike: 0, fairHousing: 0, notRepresentable: 0 };
  for (const opp of report.opportunities ?? []) {
    const r = sanitizeOpportunity(opp);
    if (r.omit) omitted[r.omit] += 1;
    else items.push(r.item);
  }

  const dq = report.dataQuality ?? {};
  const totals = report.totals ?? {};
  const doc = {
    schema_version: HANDOFF_SCHEMA_VERSION,
    agent: INPUTS.gsc.agent,
    generatedAt,
    reportDate: report.reportDate ?? null,
    sourceGeneratedAt: report.generatedAt ?? null,
    sourceSchemaVersion: report.schemaVersion ?? null,
    fixture,
    status: fixture ? "fixture" : items.length ? "ok" : "empty",
    window: report.windows?.current ? { start: report.windows.current.start, end: report.windows.current.end } : null,
    dataQuality: {
      lowVolume: Boolean(dq.lowVolume),
      lowVolumeThreshold: dq.lowVolumeThreshold ?? null,
      currentImpressions: totals.currentImpressions ?? null,
      currentClicks: totals.currentClicks ?? null,
      reportedFindings: dq.reportedFindings ?? (report.opportunities ?? []).length,
      interpretation: dq.lowVolume
        ? "Low-volume data: an early signal, not definitive search demand. Never the sole reason for a decision."
        : "Search Console measurements. Search demand only — never publish these numbers as editorial facts.",
    },
    privacy: {
      rawQueriesIncluded: false,
      policy:
        "This file is public. Raw Search Console queries stay in the private workflow artifact (gsc-opportunities). Topics here use fixed vocabulary only.",
      omitted,
    },
    items,
  };

  assertNoRawQueries(doc, collectRawQueries(report));
  const { valid, problems } = validateHandoff("gsc", doc);
  if (!valid) throw new Error(`GSC handoff failed its own schema: ${problems.join("; ")}`);
  return doc;
}
