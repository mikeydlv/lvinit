// ---------------------------------------------------------------------------
// RULES-ONLY JUDGMENT — the fallback when there is no model
//
// Used when ANTHROPIC_API_KEY is missing, the call fails, the model declines,
// or --no-llm is passed. It scores from what the rules can see (area tier,
// category, source tier, how many outlets carried it, Reddit chatter,
// existing coverage) and takes its status evidence verbatim from the source.
//
// What it deliberately does NOT do: write hooks or angles. A template hook
// is exactly the "New development coming to Las Vegas!" content LVINIT is
// trying to avoid, so those fields say plainly that they need Mikey's angle.
// Rules-only topics are capped at P2 (lib/score.mjs) — never CREATE NOW.
// ---------------------------------------------------------------------------

import { NOT_A_PROJECT, detectStatus } from "./status.mjs";
import { bestAreaTier, titleSimilarity } from "./classify.mjs";
import { relatedPages } from "./inventory.mjs";
import { sourceRecord, slug } from "./judge.mjs";

const CATEGORY_LETTER = {
  "real-estate-development": "A. Real estate development",
  "neighborhood-change": "B. Neighborhood changes",
  "major-development": "C. Major development / redevelopment",
  transportation: "D. Transportation / infrastructure",
  "builder-activity": "E. Builder activity",
  "relocation-cost": "F. Relocation / cost of living",
  lifestyle: "G. Local lifestyle",
};

/** Per-category defaults: [relocation, visual, evergreen, real-estate, format]. */
const PROFILE = {
  "real-estate-development": [4, 4, 3, 5, "field-report Reel"],
  "neighborhood-change": [4, 4, 3, 3, "Reel / TikTok / Short"],
  "major-development": [3, 4, 3, 3, "field-report Reel"],
  transportation: [4, 3, 4, 3, "Instagram carousel"],
  "builder-activity": [3, 3, 2, 5, "Instagram carousel"],
  "relocation-cost": [5, 2, 4, 4, "talking-head Reel"],
  lifestyle: [4, 4, 4, 2, "Reel / TikTok / Short"],
};

const clamp = (n) => Math.min(5, Math.max(1, Math.round(n)));

export function judgeWithRules({ candidates, signals, inventory, watchlist, config }) {
  const topics = [];
  const groups = [];
  // Group same-story candidates the dedupe pass did not already merge.
  for (const c of candidates) {
    const g = groups.find((grp) => (c.watchMatch && grp[0].watchMatch === c.watchMatch) || titleSimilarity(grp[0].title, c.title) >= 0.5);
    if (g) g.push(c);
    else groups.push([c]);
  }

  for (const group of groups) {
    const lead = group[0];
    const cat = lead.categories[0];
    const [reloc, visual, evergreen, re, format] = PROFILE[cat] ?? [3, 3, 3, 3, "Instagram carousel"];
    const areaTier = bestAreaTier(lead.areas, config);
    const chatter = signals.filter((s) => titleSimilarity(s.title, lead.title) >= 0.4 || s.areas.some((a) => lead.areas.includes(a) && s.categories.some((x) => lead.categories.includes(x))));
    const outlets = group.length + group.reduce((n, g) => n + (g.alsoReportedBy?.length ?? 0), 0);
    const related = relatedPages(inventory, { text: lead.title, areas: lead.areas });

    const scores = {
      local_relevance: clamp({ 1: 5, 2: 4, 3: 3 }[areaTier] ?? 2),
      relocation_value: reloc,
      conversation_potential: clamp(2 + Math.min(chatter.length, 2) + (outlets >= 3 ? 1 : 0)),
      visual_potential: visual,
      evergreen_value: evergreen,
      real_estate_connection: re,
      novelty: related.length ? 2 : 4,
      lvinit_fit: clamp(areaTier === 1 ? 4 : 3),
    };

    const best = group.map((g) => ({ g, s: detectStatus(g) })).sort((a, b) => (b.s.evidence ? 1 : 0) - (a.s.evidence ? 1 : 0))[0];
    const areaLabel = lead.areas.map((k) => config.areas.find((a) => a.key === k)?.label).filter(Boolean)[0] ?? "Las Vegas";
    const watched = (watchlist.projects ?? []).find((p) => p.key === lead.watchMatch);

    topics.push({
      key: watched?.key ?? slug(`${areaLabel} ${lead.title}`).slice(0, 60),
      isExisting: Boolean(watched),
      name: lead.title,
      kind: "project",
      area: areaLabel,
      category: CATEGORY_LETTER[cat] ?? "A. Real estate development",
      status: best.s.status,
      statusEvidence: best.s.evidence,
      statusEvidenceId: best.s.evidence ? best.g.id : null,
      statusNote: null,
      materialNewInfo: Boolean(watched) && best.s.status !== watched.status,
      whatChanged: "",
      scores,
      whyItMatters: `Rules-only mode — source summary: ${lead.snippet || lead.title}`,
      whyPeopleCare: "Needs Mikey's angle (rules-only mode cannot judge audience).",
      hook: "Needs Mikey's angle (rules-only mode does not write hooks).",
      bestFormat: format,
      secondaryFormats: format === "LVINIT article" ? [] : ["LVINIT article"],
      flywheel: [],
      fieldShoot: {
        recommended: visual >= 4,
        locationType: visual >= 4 ? `The site itself in ${areaLabel} — confirm the location from the source before driving out.` : "",
        shots: [],
        drone: "",
        aRoll: "",
        urgency: visual >= 4 ? "shoot this month" : "no shoot needed",
      },
      articleOpportunity: related.length ? `Possible update to ${related[0].route}` : "Possible new article — needs Mikey's angle.",
      existingContent: related.map((p) => ({ route: p.route, action: "internal link", note: "Related by area/topic (rules match)." })),
      missingConfirmation: best.s.evidence ? "" : "No source text states the project's status.",
      promotionTrigger: "",
      sources: group.map(sourceRecord),
      signals: chatter.slice(0, 3).map((s) => ({ title: s.title, url: s.url, sourceName: s.sourceName, published: s.published })),
    });
  }
  // Non-project signals never become topics in rules-only mode: without a
  // model there is no way to tell a real audience question from chatter.
  return { topics: topics.map((t) => (t.kind === "project" ? t : { ...t, status: NOT_A_PROJECT })), rejected: [], unassessed: [], warnings: [] };
}
