// ---------------------------------------------------------------------------
// FINDING, SCORING AND CLASSIFYING INTERNAL-LINK OPPORTUNITIES
//
// One opportunity is: "this exact phrase, in this exact paragraph, on this
// page, should link to that page."
//
// The detection is anchor-first, and that is the whole safety argument. The
// agent does not decide two pages are related and then go looking for somewhere
// to put a link. It finds a place where the source page ALREADY names the
// destination's subject in its own words, and offers to make those words a
// link. The anchor is therefore never invented, never negotiated, and never a
// rewrite — see `applyLinkEdit` in source.mjs for the mechanism that enforces
// it.
//
// Everything that cannot clear every gate becomes a report-only finding with a
// named reason. Nothing is silently dropped except pairs that were never a
// candidate (self-links, existing links, utility routes, unrelated pages).
// ---------------------------------------------------------------------------

import { createHash } from "node:crypto";

import { pageRelatedness } from "../../gsc/lib/text.mjs";
import { checkFairHousingForLinks } from "./fair-housing.mjs";

import {
  stripComments,
  lineIndexer,
  protectedRanges,
  protectionFor,
  localLinkClass,
  hasLinkImport,
  looksLikeCompliance,
  normalizeWhitespace,
  enclosingBlockElement,
  plainTextOf,
  nearestHeading,
  countLinksIn,
} from "./source.mjs";
import {
  destinationPhrases,
  distinctiveTokens,
  anchorQuality,
  topicAffinity,
} from "./topics.mjs";
import { anchorTextsFor } from "./graph.mjs";

/** Why an opportunity was not auto-executed. Every one is reported. */
export const REVIEW_REASONS = {
  LOW_CONFIDENCE: "LOW_CONFIDENCE",
  DESTINATION_REQUIRES_REFRESH: "DESTINATION_REQUIRES_REFRESH",
  FAIR_HOUSING_REVIEW: "FAIR_HOUSING_REVIEW",
  COMPLIANCE_COPY: "COMPLIANCE_COPY",
  COMPETING_DESTINATIONS: "COMPETING_DESTINATIONS",
  ANCHOR_REPETITION: "ANCHOR_REPETITION",
  PAGE_ALREADY_WELL_LINKED: "PAGE_ALREADY_WELL_LINKED",
  PARAGRAPH_ALREADY_LINKED: "PARAGRAPH_ALREADY_LINKED",
  NO_LINK_IMPORT: "NO_LINK_IMPORT",
  POSSIBLE_INTENT_OVERLAP: "POSSIBLE_INTENT_OVERLAP",
  BRIDGE_SENTENCE_REQUIRED: "BRIDGE_SENTENCE_REQUIRED",
  RUN_LIMIT_REACHED: "RUN_LIMIT_REACHED",
};

export const REVIEW_REASON_LABELS = {
  LOW_CONFIDENCE: "Relevance is not high enough to act without a person looking",
  DESTINATION_REQUIRES_REFRESH: "The destination has an unresolved factual problem",
  FAIR_HOUSING_REVIEW: "Fair Housing / advertising compliance review needed",
  COMPLIANCE_COPY: "The paragraph is compliance, brokerage or sourcing copy",
  COMPETING_DESTINATIONS: "More than one page could reasonably be the destination",
  ANCHOR_REPETITION: "That anchor text is already used this much across the site",
  PAGE_ALREADY_WELL_LINKED: "The source page already carries plenty of contextual links",
  PARAGRAPH_ALREADY_LINKED: "That paragraph already carries an internal link",
  NO_LINK_IMPORT: "The page does not import next/link, so a link cannot be added safely",
  POSSIBLE_INTENT_OVERLAP: "These two pages may be competing for the same search intent",
  BRIDGE_SENTENCE_REQUIRED: "A natural link would need a new sentence written for it",
  RUN_LIMIT_REACHED: "Held back by this run's change ceiling",
};

/** Editorial containers a contextual link may be added inside, and how well each fits. */
export const ALLOWED_CONTAINERS = {
  StorySection: 1,
  StoryLede: 0.9,
  LocalsNote: 0.85,
};

/**
 * Every container tag the agent recognizes. Used to work out which container a
 * piece of prose sits in — the last one opened before it wins.
 */
const CONTAINER_TAGS = [
  ...Object.keys(ALLOWED_CONTAINERS),
  "StoryPage",
  "StoryHero",
  "StoryPullQuote",
  "StoryGallery",
  "StoryVideo",
  "StoryVideoFacade",
  "StoryBreadcrumbs",
  "StoryCTAs",
  "RelatedStories",
  "RelatedNeighborhood",
  "AreaQuickFacts",
  "AreaCommunities",
  "AreaFAQ",
  "AreaSources",
  "AreaVideoSlot",
  "DevelopmentWatch",
  "ComparisonBar",
  "LVINITMap",
  "Newsletter",
  "ContactForm",
];

const round = (n, places = 3) => (Number.isFinite(n) ? Number(n.toFixed(places)) : null);

/** A stable identity for an opportunity, so the same one is recognisable next week. */
export function fingerprint({ from, to, anchor }) {
  const normalized = String(anchor ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
  return createHash("sha1").update(`${from}|${to}|${normalized}`).digest("hex").slice(0, 12);
}

/** Stable, human-quotable id: LINK-2026-09-17-001 */
export function makeIdFactory(reportDate) {
  let n = 0;
  return () => {
    n += 1;
    return `LINK-${reportDate}-${String(n).padStart(3, "0")}`;
  };
}

/**
 * The maximal run of plain text around `index` — bounded by the JSX delimiters
 * `<`, `>`, `{`, `}`. A phrase is only editable when it lies inside one of
 * these, because that is exactly the text a JSX text node renders.
 */
export function textNodeAt(code, index) {
  let start = index;
  while (start > 0 && !"<>{}".includes(code[start - 1])) start -= 1;
  let end = index;
  while (end < code.length && !"<>{}".includes(code[end])) end += 1;
  return { start, end };
}

/** The last recognized container tag opened before `index`, if any. */
export function containerAt(code, index, tags = CONTAINER_TAGS) {
  let best = null;
  for (const tag of tags) {
    const re = new RegExp(`<${tag}\\b`, "g");
    let m;
    while ((m = re.exec(code)) !== null) {
      if (m.index >= index) break;
      if (!best || m.index > best.index) best = { tag, index: m.index };
    }
  }
  return best;
}

/** Case-insensitive, whole-word occurrences of `phrase` in `code`. */
export function findPhraseOccurrences(code, phrase) {
  const escaped = phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/\s+/g, "\\s+");
  const re = new RegExp(`(?<![A-Za-z0-9])(${escaped})(?![A-Za-z0-9])`, "gi");
  const out = [];
  let m;
  while ((m = re.exec(code)) !== null) {
    out.push({ start: m.index, end: m.index + m[0].length, text: m[0] });
  }
  return out;
}

/**
 * Everything the agent knows about one page's editable prose, computed once.
 */
export function readPageProse(page, config) {
  const document = page.documents.find((d) => d.role === "page") ?? page.documents[0];
  const { code } = stripComments(document.source);
  const lineOf = lineIndexer(code);
  const ranges = protectedRanges(code);
  const linkClass = localLinkClass(code, config.anchor.localClassIdentifiers);
  return {
    file: document.file,
    absolute: document.absolute,
    source: document.source,
    code,
    lineOf,
    ranges,
    linkClass,
    hasLinkImport: hasLinkImport(document.source),
  };
}

/**
 * Score one candidate.
 *
 * Every component is 0-1 and every one is returned, so a confidence figure in
 * the report can always be taken apart. Traffic is deliberately absent: how
 * useful a link is to a reader cannot depend on how many people saw the page.
 */
export function scoreCandidate({ source, destination, anchor, paragraphText, structuralFit, config }) {
  const anchorTokens = new Set(distinctiveTokens(anchor));
  const paraTokens = new Set(distinctiveTokens(paragraphText));
  const core = new Set(destination.coreTokens ?? []);
  const wide = new Set(destination.tokens ?? []);

  const anchorScore = anchorQuality(anchor, [...core]);

  // Supporting tokens: the destination's own vocabulary present in the
  // paragraph BEYOND the anchor. This is the generic-word guard — a paragraph
  // that shares only the anchor phrase is a mention, not a subject. It is a
  // HARD GATE, not a score: scoring it would punish a richer anchor for
  // carrying more of the destination's words itself.
  const supporting = [...wide].filter((t) => paraTokens.has(t) && !anchorTokens.has(t));

  // The score is coverage of the destination's vocabulary by the paragraph as a
  // whole, anchor included. Two measures: its slug (what the page committed to
  // being about) and its wider route-plus-headline vocabulary.
  let coreCovered = 0;
  for (const token of core) if (paraTokens.has(token)) coreCovered += 1;
  const coreCoverage = core.size ? coreCovered / core.size : 0;
  let wideCovered = 0;
  for (const token of wide) if (paraTokens.has(token)) wideCovered += 1;
  const wideCoverage = wide.size ? wideCovered / wide.size : 0;
  const paragraphScore = Math.min(1, (coreCoverage + wideCoverage) / 2);

  const related = pageRelatedness(source, destination);
  const affinity = topicAffinity(source.topics, destination.topics);

  const w = config.relevance.weights;
  const confidence =
    w.anchor * anchorScore +
    w.paragraph * paragraphScore +
    w.page * related +
    w.topic * affinity +
    w.structure * structuralFit;

  return {
    confidence: round(Math.min(1, confidence)),
    components: {
      anchorQuality: round(anchorScore),
      paragraphSupport: round(paragraphScore),
      pageRelatedness: round(related),
      topicAffinity: round(affinity),
      structuralFit: round(structuralFit),
    },
    supportingTokens: supporting.sort(),
    coreCoverage: round(coreCoverage),
    wideCoverage: round(wideCoverage),
  };
}

/**
 * Find every candidate link on the site.
 *
 * Returns candidates in no particular order; ranking, gating and the run limits
 * are applied by `classifyAndRank`.
 */
export function findCandidates({ graph, config }) {
  const candidates = [];
  const proseCache = new Map();
  const nonEditorial = new Set(config.graph.nonEditorialTargets);

  const proseFor = (page) => {
    if (!proseCache.has(page.route)) proseCache.set(page.route, readPageProse(page, config));
    return proseCache.get(page.route);
  };

  const destinations = [...graph.pages.values()].filter((p) => !nonEditorial.has(p.route));

  for (const source of graph.pages.values()) {
    const alreadyLinks = new Set(source.outgoing.map((e) => e.to));
    const prose = proseFor(source);

    for (const destination of destinations) {
      if (destination.route === source.route) continue;
      if (alreadyLinks.has(destination.route)) continue;

      const related = pageRelatedness(source, destination);
      if (related < config.relevance.minPageRelatedness) continue;

      const phrases = destinationPhrases(destination, { maxWords: config.anchor.maxWords });
      let bestForPair = null;

      for (const phrase of phrases) {
        if (config.anchor.banned.includes(phrase.key)) continue;
        const words = phrase.phrase.split(/\s+/).length;
        if (words < config.anchor.minWords || words > config.anchor.maxWords) continue;
        if (words === 1 && config.anchor.singleWordRequiresProperName && !phrase.properName) continue;
        if (
          words === 1 &&
          anchorQuality(phrase.phrase, destination.coreTokens ?? []) < config.anchor.minSingleWordQuality
        ) {
          continue;
        }

        for (const hit of findPhraseOccurrences(prose.code, phrase.phrase)) {
          if (/[\n\r<>{}&]/.test(hit.text)) continue;

          const node = textNodeAt(prose.code, hit.start);
          if (hit.start < node.start || hit.end > node.end) continue;

          const protection = protectionFor(prose.ranges, hit.start, hit.end);
          if (protection) continue;

          const container = containerAt(prose.code, hit.start);
          const structuralFit = container ? ALLOWED_CONTAINERS[container.tag] ?? 0 : 0;
          if (!structuralFit) continue;

          // The paragraph itself: the <p>/<li> the anchor sits in. Prose loose
          // in a container, outside any block element, is not a paragraph and
          // is left alone.
          const element = enclosingBlockElement(prose.code, hit.start);
          if (!element) continue;
          const paragraphText = plainTextOf(prose.code.slice(element.innerStart, element.innerEnd));
          if (paragraphText.split(/\s+/).length < config.density.minParagraphWords) continue;

          const scored = scoreCandidate({
            source,
            destination,
            anchor: hit.text,
            paragraphText,
            structuralFit,
            config,
          });

          // HARD GATE: the paragraph has to show the destination's subject
          // beyond the anchor itself, unless the anchor is a proper name that
          // IS the subject and the two pages are genuinely close.
          const properNameRoute =
            phrase.properName && related >= config.relevance.minPageRelatednessForProperName;
          if (
            scored.supportingTokens.length < config.relevance.minSupportingTokens &&
            !properNameRoute
          ) {
            continue;
          }

          if (scored.confidence < config.relevance.reportMinConfidence) continue;

          const candidate = {
            from: source.route,
            to: destination.route,
            source,
            destination,
            anchor: hit.text,
            anchorPhraseSources: phrase.sources,
            anchorIsProperName: phrase.properName,
            file: prose.file,
            absolute: prose.absolute,
            start: hit.start,
            end: hit.end,
            line: prose.lineOf(hit.start),
            container: container.tag,
            heading: nearestHeading(prose.code, element.start),
            paragraph: paragraphText,
            paragraphLinks: countLinksIn(prose.code.slice(element.start, element.end)),
            hasLinkImport: prose.hasLinkImport,
            linkClass: prose.linkClass,
            ...scored,
            relatedness: round(related),
            direction: directionOf(source, destination),
            fingerprint: fingerprint({ from: source.route, to: destination.route, anchor: hit.text }),
          };

          if (!bestForPair || candidate.confidence > bestForPair.confidence) bestForPair = candidate;
        }
      }

      // One link per source/destination pair, at the single best position. More
      // than one link to the same page from the same article is link stuffing.
      if (bestForPair) candidates.push(bestForPair);
    }
  }

  return candidates;
}

/** Is this link pointing forward to newer coverage, back to older, or sideways? */
export function directionOf(source, destination) {
  if (!source.publishedAt || !destination.publishedAt) return "unknown";
  if (destination.publishedAt > source.publishedAt) return "forward-to-newer";
  if (destination.publishedAt < source.publishedAt) return "back-to-older";
  return "lateral";
}

/**
 * Apply every safety gate, work out priority, and split the candidates into
 * what may be executed and what must be reported.
 */
export function classifyAndRank({ graph, candidates, config, gscSignal, factDecaySignal, reportDate }) {
  const byPair = new Map();
  for (const candidate of candidates) {
    const key = `${candidate.from}|${candidate.to}`;
    if (!byPair.has(key)) byPair.set(key, candidate);
  }

  // Competing destinations: the same anchor occurrence on the same page could
  // reasonably point at more than one page. That is an editorial choice, so
  // neither is automated.
  const byAnchorPosition = new Map();
  for (const candidate of byPair.values()) {
    const key = `${candidate.from}|${candidate.start}|${candidate.end}`;
    if (!byAnchorPosition.has(key)) byAnchorPosition.set(key, []);
    byAnchorPosition.get(key).push(candidate);
  }

  const evaluated = [];
  for (const candidate of byPair.values()) {
    const blockers = [];
    const source = candidate.source;
    const destination = candidate.destination;

    // --- Destination eligibility (Fact-Decay) -------------------------------
    const eligibility = factDecaySignal.eligibilityFor(destination.route);
    if (!eligibility.eligible) {
      blockers.push({ code: REVIEW_REASONS.DESTINATION_REQUIRES_REFRESH, detail: eligibility.reason });
    }

    // --- Fair Housing / compliance -----------------------------------------
    const fairHousingTargets = [
      { what: "the anchor text", text: candidate.anchor },
      { what: "the paragraph the link would sit in", text: candidate.paragraph },
      { what: "the section heading", text: candidate.heading ?? "" },
      { what: "the destination's headline", text: destination.title ?? "" },
    ];
    let fairHousing = null;
    for (const target of fairHousingTargets) {
      const verdict = checkFairHousingForLinks(target.text);
      if (verdict.blocked) {
        fairHousing = { ...verdict, where: target.what };
        break;
      }
    }
    if (fairHousing) {
      blockers.push({
        code: REVIEW_REASONS.FAIR_HOUSING_REVIEW,
        detail:
          `${fairHousing.where} matched the Fair Housing filter on “${fairHousing.matched}” ` +
          `(${fairHousing.category}). ${fairHousing.reason} This agent does not create or strengthen ` +
          "links around protected-class framing, so it is left for a person.",
      });
    }

    if (looksLikeCompliance(candidate.paragraph) || looksLikeCompliance(candidate.heading ?? "")) {
      blockers.push({
        code: REVIEW_REASONS.COMPLIANCE_COPY,
        detail:
          "the paragraph reads as brokerage, licensing, sourcing or disclaimer copy. CLAUDE.md forbids changing that " +
          "copy, and adding a link inside it is changing it.",
      });
    }

    // --- Structural safety --------------------------------------------------
    if (!candidate.hasLinkImport) {
      blockers.push({
        code: REVIEW_REASONS.NO_LINK_IMPORT,
        detail: "the page does not import next/link, and adding an import is outside this agent's change surface.",
      });
    }
    if (candidate.paragraphLinks >= config.density.maxLinksPerParagraph) {
      blockers.push({
        code: REVIEW_REASONS.PARAGRAPH_ALREADY_LINKED,
        detail:
          `that paragraph already carries ${candidate.paragraphLinks} internal link` +
          `${candidate.paragraphLinks === 1 ? "" : "s"}, at the configured ceiling of ` +
          `${config.density.maxLinksPerParagraph}. A second one in one paragraph reads as stuffing.`,
      });
    }
    if (source.outgoingEditorialCount >= config.density.maxEditorialLinksPerPage) {
      blockers.push({
        code: REVIEW_REASONS.PAGE_ALREADY_WELL_LINKED,
        detail:
          `${source.route} already carries ${source.outgoingEditorialCount} editorial internal links, at or above the ` +
          `${config.density.maxEditorialLinksPerPage} the configuration calls healthy. A well-linked page is left alone.`,
      });
    }

    // --- Anchor variety -----------------------------------------------------
    const existingAnchors = anchorTextsFor(graph, destination.route).map((a) => a.toLowerCase());
    const sameAnchorUses = existingAnchors.filter((a) => a === candidate.anchor.toLowerCase()).length;
    if (sameAnchorUses >= config.anchor.maxSameAnchorSiteWide) {
      blockers.push({
        code: REVIEW_REASONS.ANCHOR_REPETITION,
        detail:
          `“${candidate.anchor}” already points at ${destination.route} from ${sameAnchorUses} place` +
          `${sameAnchorUses === 1 ? "" : "s"} on the site. Repeating one exact-match anchor everywhere is the ` +
          "pattern this agent is supposed to avoid.",
      });
    }

    // --- Competing destinations ---------------------------------------------
    const competing = byAnchorPosition.get(`${candidate.from}|${candidate.start}|${candidate.end}`) ?? [];
    if (competing.length > 1) {
      blockers.push({
        code: REVIEW_REASONS.COMPETING_DESTINATIONS,
        detail:
          `those words could reasonably link to ${competing.map((c) => c.to).join(" or ")}. ` +
          "Choosing between them is an editorial judgement, not a mechanical one.",
      });
    }

    // --- Search-intent overlap ----------------------------------------------
    if (
      candidate.relatedness >= config.relevance.intentOverlapThreshold &&
      sameTopicSet(source.topics, destination.topics)
    ) {
      blockers.push({
        code: REVIEW_REASONS.POSSIBLE_INTENT_OVERLAP,
        detail:
          `${source.route} and ${destination.route} are ${Math.round(candidate.relatedness * 100)}% related and cover ` +
          "the same subjects. When two pages overlap this much, the real question is usually whether they should be " +
          "one page, and a link does not answer it.",
      });
    }

    // --- Confidence ---------------------------------------------------------
    if (candidate.confidence < config.relevance.autoExecuteMinConfidence) {
      blockers.push({
        code: REVIEW_REASONS.LOW_CONFIDENCE,
        detail:
          `confidence ${candidate.confidence} is below the ${config.relevance.autoExecuteMinConfidence} auto-execution ` +
          "line. It is a plausible link, not an obvious one.",
      });
    }

    // --- Priority -----------------------------------------------------------
    const traffic = gscSignal.multiplierFor(destination.route);
    const discovery = discoveryMultiplier(destination, candidate.direction, config);
    const priority = Math.round(100 * candidate.confidence * traffic.value * discovery.value);

    evaluated.push({
      ...candidate,
      blockers,
      eligibility,
      fairHousing,
      traffic,
      discovery,
      priority,
      autoExecutable: blockers.length === 0,
    });
  }

  evaluated.sort(
    (a, b) =>
      b.priority - a.priority ||
      b.confidence - a.confidence ||
      a.fingerprint.localeCompare(b.fingerprint)
  );

  // --- Run limits ----------------------------------------------------------
  const autoExecuted = [];
  const perPage = new Map();
  const pagesTouched = new Set();
  const deferred = [];

  for (const candidate of evaluated) {
    if (!candidate.autoExecutable) continue;
    if (!config.autoExecute.enabled) {
      deferred.push({ candidate, reason: "auto-execution is switched off for this run" });
      continue;
    }
    const used = perPage.get(candidate.from) ?? 0;
    if (autoExecuted.length >= config.limits.maxLinksAddedPerRun) {
      deferred.push({ candidate, reason: `this run's ceiling of ${config.limits.maxLinksAddedPerRun} links was reached` });
      continue;
    }
    if (used >= config.limits.maxLinksAddedPerPage) {
      deferred.push({ candidate, reason: `${candidate.from} already has ${used} link(s) queued, at this run's per-page ceiling` });
      continue;
    }
    if (!pagesTouched.has(candidate.from) && pagesTouched.size >= config.limits.maxPagesModifiedPerRun) {
      deferred.push({ candidate, reason: `this run's ceiling of ${config.limits.maxPagesModifiedPerRun} modified pages was reached` });
      continue;
    }
    const toDestination = autoExecuted.filter((c) => c.from === candidate.from && c.to === candidate.to).length;
    if (toDestination >= config.density.maxLinksPerDestinationPerPage) {
      deferred.push({ candidate, reason: "that page already links to that destination in this run" });
      continue;
    }

    perPage.set(candidate.from, used + 1);
    pagesTouched.add(candidate.from);
    autoExecuted.push(candidate);
  }

  for (const { candidate, reason } of deferred) {
    candidate.blockers = [...candidate.blockers, { code: REVIEW_REASONS.RUN_LIMIT_REACHED, detail: reason }];
    candidate.autoExecutable = false;
  }

  const needsReview = evaluated.filter((c) => !autoExecuted.includes(c));

  // --- Stable IDs, assigned in report order --------------------------------
  const nextId = makeIdFactory(reportDate);
  for (const candidate of [...autoExecuted, ...needsReview]) candidate.id = nextId();

  return { evaluated, autoExecuted, needsReview };
}

/** Do two pages carry exactly the same topic set? */
function sameTopicSet(a = [], b = []) {
  if (a.length === 0 || b.length === 0) return false;
  const setA = new Set(a);
  const setB = new Set(b);
  if (setA.size !== setB.size) return false;
  for (const key of setA) if (!setB.has(key)) return false;
  return true;
}

/**
 * How much a destination's discovery need moves it up the queue.
 *
 * Ordering only. An orphan is never a reason to manufacture a link — it is a
 * reason to do a genuine one FIRST.
 */
export function discoveryMultiplier(destination, direction, config) {
  const reasons = [];
  let value = 1;
  if (destination.isOrphan) {
    value *= config.discovery.orphanMultiplier;
    reasons.push("no editorial page links to it yet");
  } else if (destination.isWeaklyLinked) {
    value *= config.discovery.weaklyLinkedMultiplier;
    reasons.push(
      `only ${destination.uniqueReferrers.length} editorial page links to it (${destination.uniqueReferrers.join(", ")})`
    );
  }
  if (destination.isNewlyPublished) {
    value *= config.discovery.newlyPublishedMultiplier;
    reasons.push(`published ${destination.ageDays} days ago, so it is still being found`);
  }
  if (direction === "forward-to-newer" && reasons.length === 0) {
    reasons.push("this points an older piece forward to newer coverage");
  }
  return {
    value: Number(value.toFixed(3)),
    basis: reasons.length ? reasons.join("; ") : "the destination is already reachable from several pages",
  };
}

/**
 * Pages that are genuinely related but where no honest anchor exists in the
 * source's own words. These are the cases that would need a bridge sentence,
 * which this agent does not write — they become Content Publisher handoffs.
 */
export function findBridgeSentenceOpportunities({ graph, candidates, config }) {
  const covered = new Set(candidates.map((c) => `${c.from}|${c.to}`));
  const nonEditorial = new Set(config.graph.nonEditorialTargets);
  const out = [];

  // Orphans only, deliberately. A weakly-linked page already has a way in; an
  // orphan has none, and "write a sentence" is an expensive ask. Widening this
  // to weakly-linked pages produced twelve rows of 0.09-relatedness pairs on the
  // first real run, which is exactly the weekly homework this agent exists to
  // avoid.
  const needy = [...graph.pages.values()].filter((p) => !nonEditorial.has(p.route) && p.isOrphan);

  for (const destination of needy) {
    for (const source of graph.pages.values()) {
      if (source.route === destination.route) continue;
      if (source.outgoing.some((e) => e.to === destination.route)) continue;
      if (covered.has(`${source.route}|${destination.route}`)) continue;
      const related = pageRelatedness(source, destination);
      const affinity = topicAffinity(source.topics, destination.topics);
      // Either genuinely close on route and headline, or on the same subject
      // AND not merely brushing past each other.
      if (related < 0.3 && !(affinity >= 0.9 && related >= 0.18)) continue;
      out.push({
        from: source.route,
        to: destination.route,
        sourceTitle: source.title,
        destinationTitle: destination.title,
        relatedness: round(related),
        topicAffinity: round(affinity),
        fingerprint: fingerprint({ from: source.route, to: destination.route, anchor: "bridge" }),
        reason:
          `${source.route} and ${destination.route} are closely related, but ${source.route} never names ` +
          `${destination.title} in its own words, so there is nothing honest to wrap in a link. Making this ` +
          "connection means writing a sentence, which is editorial work.",
        recommendation:
          `Have the Content Publisher decide whether ${source.route} should introduce ${destination.route}, and if so ` +
          "write the sentence that does it in Mikey's voice.",
      });
    }
  }

  return out
    .sort((a, b) => b.relatedness - a.relatedness || a.from.localeCompare(b.from))
    .slice(0, config.output.maxBridgeHandoffs);
}

/** Read earlier reports so an opportunity keeps its identity across weeks. */
export function buildHistory(previousReports) {
  const byFingerprint = new Map();
  for (const report of previousReports) {
    const all = [...(report.autoExecuted ?? []), ...(report.needsReview ?? [])];
    for (const item of all) {
      const key = item.fingerprint;
      if (!key) continue;
      const existing = byFingerprint.get(key);
      const outcome = (report.autoExecuted ?? []).some((a) => a.fingerprint === key) ? "auto-fixed" : "reported";
      if (!existing) {
        byFingerprint.set(key, {
          firstSeen: report.reportDate,
          firstId: item.id,
          lastSeen: report.reportDate,
          lastId: item.id,
          lastOutcome: outcome,
          timesSeen: 1,
          previousIds: [item.id],
        });
        continue;
      }
      existing.timesSeen += 1;
      if (report.reportDate < existing.firstSeen) {
        existing.firstSeen = report.reportDate;
        existing.firstId = item.id;
      }
      if (report.reportDate >= existing.lastSeen) {
        existing.lastSeen = report.reportDate;
        existing.lastId = item.id;
        existing.lastOutcome = outcome;
      }
      if (!existing.previousIds.includes(item.id)) existing.previousIds.push(item.id);
    }
  }
  return byFingerprint;
}

/**
 * new / persisting / resolved / auto-fixed, for one opportunity.
 *
 * `resolved` is computed by the caller from the previous report's findings that
 * no longer appear in this one.
 */
export function statusFor(candidate, history) {
  const record = history.get(candidate.fingerprint);
  if (!record) return { status: "new", history: null };
  if (record.lastOutcome === "auto-fixed") return { status: "auto-fixed-previously", history: record };
  return { status: "persisting", history: record };
}

/** Opportunities that were reported before and are gone now. */
export function resolvedSince(previousReports, currentFingerprints) {
  if (previousReports.length === 0) return [];
  const last = previousReports[previousReports.length - 1];
  const seen = new Set(currentFingerprints);
  return (last.needsReview ?? [])
    .filter((item) => item.fingerprint && !seen.has(item.fingerprint))
    .map((item) => ({
      id: item.id,
      fingerprint: item.fingerprint,
      from: item.from,
      to: item.to,
      anchor: item.anchor ?? null,
      reportedOn: last.reportDate,
    }));
}

/** Convenience for the report: the exact sentence an anchor sits in. */
export function sentenceAround(paragraph, anchor) {
  const text = normalizeWhitespace(paragraph);
  const sentences = text.split(/(?<=[.!?])\s+(?=[A-Z“(])/);
  const found = sentences.find((s) => s.toLowerCase().includes(String(anchor).toLowerCase()));
  return found ?? text;
}
