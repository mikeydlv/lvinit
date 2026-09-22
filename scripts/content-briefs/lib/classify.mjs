// ---------------------------------------------------------------------------
// CLASSIFICATION — UPDATE vs NEW vs NOTHING
//
// Every intent group gets exactly one action, and the tree is ordered so that
// NEW CONTENT IS THE LAST RESORT:
//
//   0. Fair Housing (hard gate, before anything)      -> excluded, never an opportunity
//   1. Off-topic / navigational / transactional /
//      generic listicle / too little LVINIT relevance -> REJECT_LOW_VALUE
//   2. Below the minimum demand to consider at all    -> dropped (counted)
//   3. Two existing pages already compete for it      -> never new: UPDATE the
//                                                        clear owner, or MONITOR
//   4. Google ranks the wrong existing page, and the
//      right one already answers it                   -> INTERNAL_LINK_ONLY
//   5. An existing page answers the SAME intent:
//        ranks well, nothing missing                  -> REJECT_DUPLICATE
//        a facet of the question is missing           -> EXPAND_EXISTING
//        covered but ranking/clickthrough is weak     -> UPDATE_EXISTING
//   6. SUBSTANTIAL overlap (most of it is covered)    -> EXPAND_EXISTING
//      (only dated records overlap?  the monthly series answers it -> MONITOR)
//   7. Adjacent / distinct, enough demand             -> NEW_COMPARISON / NEW_ARTICLE
//   8. Adjacent / distinct, not enough demand yet     -> MONITOR_ONLY
//
// UPDATE_EXISTING and EXPAND_EXISTING are different jobs:
//   UPDATE  the page already covers the question; sharpen how it answers it
//           (headline/intro/section alignment, freshness) — no new section
//   EXPAND  a specific part of the question is not on the page; add it
// ---------------------------------------------------------------------------

import { checkFairHousingForLinks } from "../../internal-links/lib/fair-housing.mjs";
import { isGenericFiller } from "../../gsc/lib/fair-housing.mjs";

import { ACTIONS } from "../config.mjs";
import { missingFacets, relevantSection } from "./coverage.mjs";

/**
 * Fair Housing, reusing the shared GSC rules through the Internal Linking
 * Agent's ONE narrow exemption: "single-family" as an objective property type.
 * No rule is loosened; the shared module is unchanged.
 */
export function fairHousingCheck(text) {
  return checkFairHousingForLinks(text);
}

/**
 * LVINIT is not a listicle site. These are the generic, un-LVINIT topics Mikey
 * named — refused as NEW content no matter the demand. The GSC agent's own
 * generic-filler guard runs first; this list adds the ones it does not catch.
 */
const GENERIC_TOPIC_PATTERNS = [
  /\b(best|top|greatest|coolest|nicest)\b[^.?!]{0,30}\b(places?|neighbou?rhoods?|areas?|suburbs?|cities|towns|communities|zip\s*codes?)\b/i,
  /\bhidden\s+gems?\b/i,
  /\bwhy\s+(las\s+)?vegas\s+is\s+(amazing|great|the\s+best)\b/i,
  /\b(reasons?\s+to\s+(move|live))\b/i,
  /\beverything\s+(you\s+need\s+to\s+know|about)\b/i,
  /\b(ultimate|complete|definitive)\s+guide\b/i,
  /\btop\s*\d+\b|\b\d+\s+(best|reasons|things)\b/i,
];

export function isGenericTopic(text) {
  const value = String(text ?? "");
  return isGenericFiller(value) || GENERIC_TOPIC_PATTERNS.some((re) => re.test(value));
}

/**
 * Hard gates that run before classification. Returns null when the group may
 * proceed, or { exclusion | rejection } when it may not.
 */
export function gateGroup(group, config) {
  // Fair Housing: any grouped query tripping the shared rules excludes the
  // WHOLE group — the intent is framed around a protected class or proxy.
  for (const q of group.queries) {
    // The GSC export's own `fairHousingBlocked` flag is the raw shared rule,
    // which trips on "single-family". This agent re-checks with the one narrow
    // property-type exemption; every other rule is identical.
    const verdict = fairHousingCheck(q.query);
    if (verdict.blocked) {
      return {
        exclusion: {
          key: group.key,
          query: q.query,
          impressions: group.metrics.impressions,
          category: verdict.category,
          matched: verdict.matched ?? null,
          reason: verdict.reason,
        },
      };
    }
  }

  const reject = (reason) => ({ rejection: { action: ACTIONS.REJECT_LOW_VALUE, reason } });
  if (group.offTopic) return reject("Las Vegas, but not LVINIT's job (gaming, entertainment, jobs, events).");
  if (group.intent === "navigational") return reject("Someone looking for LVINIT itself — there is nothing to write.");
  if (group.intent === "transactional") {
    return reject("Actively looking at listings. That intent belongs to the IDX search at /search, not to an article — and the Matrix embed is not modified.");
  }
  if (group.queries.some((q) => isGenericTopic(q.query))) {
    return reject("A generic superlative round-up (best places / top N / ultimate guide). LVINIT does not publish those, whatever the demand.");
  }
  if (group.relevance < config.editorial.minRelevance) {
    return reject(`Too little to do with what LVINIT covers (editorial relevance ${group.relevance.toFixed(2)} < ${config.editorial.minRelevance}).`);
  }
  if (group.key.startsWith("topic:term:") || group.key.endsWith(":empty")) {
    return reject("No specific place, project or housing decision in the query — nothing for an LVINIT angle to stand on.");
  }
  return null;
}

/**
 * Classify one group that passed the gates.
 *
 * @returns {{action:string, reason:string, target:string|null, missingFacets:string[],
 *            relevantSection:string|null, targetPosition:number|null, flags:string[]}}
 */
export function classifyGroup({ group, coverage, inventory, config }) {
  const d = config.demand;
  const imp = group.metrics.impressions;
  const flags = [];
  if (group.development) flags.push("CURRENT_RESEARCH_REQUIRED");

  const out = (action, reason, extra = {}) => ({
    action,
    reason,
    target: null,
    missingFacets: [],
    relevantSection: null,
    targetPosition: null,
    flags,
    ...extra,
  });
  const positionOn = (route) => group.rankingPages.find((p) => p.route === route)?.position ?? null;

  // 3. Existing pages already compete.
  if (coverage.cannibalization.status !== "none") {
    flags.push("CANNIBALIZATION");
    const owner = coverage.best;
    const rankedOwner = group.rankingPages[0]?.route === owner?.route;
    if (owner?.relation === "same" && rankedOwner && imp >= d.minUpdateImpressions) {
      const page = inventory.byRoute.get(owner.route);
      return out(
        ACTIONS.UPDATE_EXISTING,
        `${coverage.cannibalization.reason} ${owner.route} is both the closest match and the page Google ranks, so it should own the intent; the others should defer to it rather than compete. No new page.`,
        { target: owner.route, relevantSection: page ? relevantSection(group, page) : null, targetPosition: positionOn(owner.route) }
      );
    }
    return out(
      ACTIONS.MONITOR_ONLY,
      `${coverage.cannibalization.reason} Which page should own it is a human decision, so nothing is proposed — and certainly not another page.`,
      { target: owner?.route ?? null }
    );
  }

  // 4. Google ranks the wrong page, and the right one exists.
  if (coverage.mismatch && coverage.best.relation === "same") {
    return out(
      ACTIONS.INTERNAL_LINK_ONLY,
      `Google is showing ${coverage.mismatch.rankingRoute} (overlap ${coverage.mismatch.rankingOverlap}) for this, but ${coverage.mismatch.betterRoute} already answers it (overlap ${coverage.mismatch.betterOverlap}). That is a linking and signalling problem for the Internal Linking Agent, not a writing job.`,
      { target: coverage.mismatch.betterRoute }
    );
  }

  const best = coverage.best;
  const bestPage = best ? inventory.byRoute.get(best.route) : null;

  // 5. The same intent is already answered.
  if (best?.relation === "same" && bestPage) {
    const pos = positionOn(best.route);
    const missing = missingFacets(group, bestPage, config);
    const section = relevantSection(group, bestPage);
    if (missing.length && imp >= d.minUpdateImpressions) {
      return out(ACTIONS.EXPAND_EXISTING, `${best.route} already answers this intent, but not the ${missing.map(facetLabel).join(" / ")} part of the question people are asking.`, {
        target: best.route, missingFacets: missing, relevantSection: section, targetPosition: pos,
      });
    }
    // UPDATE only when there is a concrete reason the owning page is not
    // serving the demand: it is on page two or worse, it is on page one but not
    // being chosen, or Google shows a different page instead of it.
    const shownElsewhere = pos === null && group.rankingPages.length > 0;
    const pageTwo = Number.isFinite(pos) && pos > d.updatePosition;
    const notChosen = Number.isFinite(pos) && pos <= d.updatePosition && group.metrics.ctr <= d.weakCtr && imp >= d.weakCtrMinImpressions;
    if (imp >= d.minUpdateImpressions && (shownElsewhere || pageTwo || notChosen)) {
      const why = shownElsewhere
        ? `but Google is showing ${group.rankingPages[0].route} for these queries instead`
        : pageTwo
          ? `but sits at position ${pos}`
          : `and ranks at position ${pos}, but only ${(group.metrics.ctr * 100).toFixed(1)}% of searchers choose it`;
      return out(ACTIONS.UPDATE_EXISTING, `${best.route} already covers this, ${why}. Sharpen how it answers the question — a new page would compete with it.`, {
        target: best.route, relevantSection: section, targetPosition: pos,
      });
    }
    return out(
      ACTIONS.REJECT_DUPLICATE,
      `${best.route} already answers this intent${pos !== null ? ` (position ${pos})` : ""}. A new page would duplicate it${imp < d.minUpdateImpressions ? ", and there is not yet enough demand to justify touching it" : ""}.`,
      { target: best.route, targetPosition: pos }
    );
  }

  // 6. Substantial overlap.
  if (best?.relation === "substantial") {
    const evergreen = coverage.strong.filter((s) => !s.datedRecord);
    if (evergreen.length === 0) {
      return out(
        ACTIONS.MONITOR_ONLY,
        `Only dated Market Watch records cover this (${coverage.strong.map((s) => s.route).join(", ")}). Their period is part of what they are — the next piece in the monthly series answers new demand, not a rewrite.`,
        { target: best.route }
      );
    }
    const owner = evergreen[0];
    const ownerPage = inventory.byRoute.get(owner.route);
    if (imp >= d.minUpdateImpressions && ownerPage) {
      const missing = missingFacets(group, ownerPage, config);
      return out(
        ACTIONS.EXPAND_EXISTING,
        `${owner.route} substantially covers this (overlap ${owner.overlap}) — ${owner.reasons.join("; ") || "most of the intent is already there"}. Expanding it serves the searcher and avoids a competing page.`,
        { target: owner.route, missingFacets: missing, relevantSection: relevantSection(group, ownerPage), targetPosition: positionOn(owner.route) }
      );
    }
    return out(ACTIONS.MONITOR_ONLY, `${owner.route} substantially covers this; demand (${imp} impressions) is not yet enough to justify an expansion.`, { target: owner.route });
  }

  // 7 / 8. Genuinely new.
  const isComparison = group.shape === "comparison";
  if (imp >= d.minNewImpressions) {
    return out(
      isComparison ? ACTIONS.NEW_COMPARISON : ACTIONS.NEW_ARTICLE,
      best?.relation === "adjacent"
        ? `No LVINIT page answers this. The closest, ${best.route} (overlap ${best.overlap}), is adjacent — it should link to the new piece, and the new piece must not repeat it.`
        : "No LVINIT page answers this, or anything close to it.",
      { target: null }
    );
  }
  return out(
    ACTIONS.MONITOR_ONLY,
    `A real gap (${best ? `closest page ${best.route}, overlap ${best.overlap}` : "nothing close"}), but ${imp} impressions is below the ${d.minNewImpressions} needed before new content is proposed. Watching for it to persist.`
  );
}

export function facetLabel(key) {
  return {
    "facet:cost": "cost",
    "facet:commute": "commute and access",
    "facet:daily-life": "day-to-day life",
    "facet:housing-stock": "housing stock and lots",
    "facet:timing": "timing",
  }[key] ?? key;
}
