// ---------------------------------------------------------------------------
// TOPIC + EXISTING-CONTENT OVERLAP
//
// The video's reader question is built from its title (what it promises) and
// confirmed against its transcript (what it actually covers), in the Content
// Brief Generator's own entity vocabulary. The duplicate / cannibalization
// check is then the Brief Generator's, reused unchanged, against the same
// inventory every other agent uses (Internal Linking graph + Fact-Decay text):
//
//   SAME         a page already answers this question
//   SUBSTANTIAL  a page covers most of it — update or embed, never a new URL
//   ADJACENT     related; a new piece only if its reader question is distinct
//   DISTINCT     unrelated to anything published
//
// Two video-specific signals sit on top, because the shared vocabulary has no
// word for a parade or a home tour:
//
//   * a page that already EMBEDS this video is a direct relationship
//   * a page whose title/route shares most of the video title's distinctive
//     words is the same piece (title similarity)
// ---------------------------------------------------------------------------

import { analyzeQuery, extractEntities, normalizeQuery, entityInfo } from "../../content-briefs/lib/intent.mjs";
import { checkCoverage, coreEntities, entityCoverage, missingFacets, pageOverlap, relationFor, relevantSection } from "../../content-briefs/lib/coverage.mjs";
import { distinctiveTokens } from "../../internal-links/lib/topics.mjs";

export const OVERLAP_LABEL = { same: "SAME", substantial: "SUBSTANTIAL", adjacent: "ADJACENT", distinct: "DISTINCT" };
const ORDER = { same: 3, substantial: 2, adjacent: 1, distinct: 0 };

/** A video title as a question: emoji, pipes and shouting removed. */
export function cleanTitle(title) {
  return String(title ?? "")
    .replace(/[\u{1F000}-\u{1FFFF}\u{2600}-\u{27BF}\u{FE0F}]/gu, "")
    .replace(/\s*[|]\s*/g, ": ")
    .replace(/\b([A-Z]{3,})\b/g, (w) => (/^(HOA|SID|LID|FHA|USDA|LVR|RTC|NDOT|CCSD|LVINIT)$/.test(w) ? w : w.charAt(0) + w.slice(1).toLowerCase()))
    .replace(/\s+/g, " ")
    .replace(/[:\s]+$/, "")
    .trim();
}

/** How often each vocabulary entity is named in the transcript. */
export function transcriptEntityCounts(sentences) {
  const counts = {};
  for (const s of sentences) {
    // "downtown Summerlin" / "downtown Henderson" name that place's core, not
    // the Downtown Las Vegas the shared vocabulary means by "downtown".
    const text = normalizeQuery(s.text).text.replace(/\bdowntown\s+(summerlin|henderson)\b/g, "$1");
    const { entities } = extractEntities(text);
    for (const k of entities) counts[k] = (counts[k] ?? 0) + 1;
  }
  return counts;
}

/**
 * The intent group for one video — the same shape the Brief Generator builds
 * from search queries, so its coverage check can be reused as-is.
 */
export function videoIntent(video, sentences = []) {
  const titleText = cleanTitle(video.targetTopic ?? video.title ?? "");
  const q = analyzeQuery(titleText);
  const counts = transcriptEntityCounts(sentences);
  const n = Math.max(1, sentences.length);
  const minMentions = Math.max(2, Math.ceil(n * 0.015));
  const dominant = Object.entries(counts)
    .filter(([, c]) => c >= minMentions)
    .sort((a, b) => b[1] - a[1])
    .map(([k]) => k);

  const facets = [...new Set([...q.facets, ...dominant.filter((k) => k.startsWith("facet:"))])];
  const core = coreEntities({ ...q, facets });
  // Clarity: how much of what the title promises the transcript actually talks
  // about. Without a transcript it cannot be measured, so it is held at 0.5.
  const intentClarity = sentences.length
    ? core.length
      ? core.filter((k) => (counts[k] ?? 0) >= 1).length / core.length
      : 0.3
    : 0.5;

  return {
    ...q,
    leadQuery: titleText,
    facets,
    rankingPages: [],
    transcriptEntities: Object.fromEntries(Object.entries(counts).sort((a, b) => b[1] - a[1])),
    dominantEntities: dominant,
    intentClarity: Number(intentClarity.toFixed(2)),
  };
}

/** Distinctive-token similarity between the video title and a page (0-1). */
export function titleSimilarity(videoTitle, page) {
  const ordinals = (s) => s.replace(/\b4th\b/g, "fourth").replace(/\b1st\b/g, "first");
  const a = new Set(distinctiveTokens(ordinals(cleanTitle(videoTitle).toLowerCase())));
  if (a.size === 0) return 0;
  const b = new Set(distinctiveTokens(ordinals(`${page.title ?? ""} ${page.h1 ?? ""} ${String(page.route).replace(/[/-]/g, " ")}`.toLowerCase())));
  if (b.size === 0) return 0;
  const shared = [...a].filter((t) => b.has(t)).length;
  // One shared word ("right", "first") is coincidence, not the same piece.
  if (shared < 2) return 0;
  return Number((shared / Math.min(a.size, b.size)).toFixed(3));
}

const hasFaq = (page) => (page.headings ?? []).some((h) => /\b(faq|frequently asked|questions)\b/i.test(h));

/**
 * The full overlap picture for one video.
 */
export function videoOverlap(video, group, inventory, { briefConfig, config }) {
  const coverage = checkCoverage(group, inventory, briefConfig);
  const embedded = new Set(video.embeddedOn ?? []);

  const scored = inventory.pages.map((page) => {
    const base = pageOverlap(group, page, briefConfig);
    const sim = titleSimilarity(video.title, page);
    const overlap = base.overlap;
    let relation = relationFor(overlap, briefConfig);
    const reasons = [...base.reasons];
    // Title similarity names the same TOPIC piece (a parade, a tour). For a
    // comparison the shared check's shape logic decides — "Summerlin vs
    // Henderson" shares words with a three-way comparison without being it.
    if (group.shape !== "comparison" && sim >= config.classify.titleSame && ORDER[relation] < ORDER.same && !page.datedRecord) {
      relation = "same";
      reasons.push(`its title and route share ${Math.round(sim * 100)}% of the video title's distinctive words`);
    }
    if (embedded.has(page.route)) reasons.push("already embeds this video");
    return {
      route: page.route,
      title: page.title,
      overlap,
      titleSimilarity: sim,
      relation,
      label: OVERLAP_LABEL[relation],
      embedsVideo: embedded.has(page.route),
      datedRecord: Boolean(page.datedRecord),
      section: page.section,
      hasFaq: hasFaq(page),
      missingFacets: missingFacets(group, page, briefConfig),
      relevantSection: relevantSection(group, page),
      reasons,
    };
  });

  scored.sort((a, b) => ORDER[b.relation] - ORDER[a.relation] || b.overlap - a.overlap || b.titleSimilarity - a.titleSimilarity || a.route.localeCompare(b.route));
  const best = scored[0] ?? null;

  // Does any page commit (route / title / H1) to everything the video is about?
  const core = coreEntities(group);
  const committedBy = inventory.pages
    .filter((p) => core.length > 0 && core.every((k) => entityCoverage(p, k, briefConfig).value >= 1))
    .map((p) => p.route);

  const manifestTarget = video.relatedRoute ? scored.find((s) => s.route === video.relatedRoute) ?? null : null;

  return {
    verdict: best ? best.label : "DISTINCT",
    best,
    embeddedPages: scored.filter((s) => s.embedsVideo),
    topMatches: scored.slice(0, 6),
    cannibalization: coverage.cannibalization,
    ambiguous: coverage.ambiguous,
    distinctQuestion: committedBy.length === 0,
    committedBy,
    manifestTarget,
    coreEntities: core.map((k) => ({ key: k, label: entityInfo(k)?.label ?? k })),
    comparedAgainst: inventory.pages.length,
  };
}
