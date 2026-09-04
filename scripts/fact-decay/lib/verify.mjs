// ---------------------------------------------------------------------------
// SOURCE VERIFICATION
//
// THE MOST IMPORTANT RULE IN THIS AGENT LIVES HERE:
//
//   Detection is analysis. Verification is evidence. They are never the same
//   thing, and nothing in this file will ever report a claim as checked because
//   a pattern matched. A verification result requires an external source that
//   was actually fetched, and every result records the URL and the timestamp so
//   the check can be repeated by hand.
//
// WHAT THIS CAN HONESTLY DO
//
//   Re-fetch a source the page ALREADY cites and establish four things:
//     * is it still reachable at all
//     * when does it say it was last modified
//     * do the figures this sentence states still appear in it
//     * for a project-status claim, does it still use the same status wording
//
// WHAT IT CANNOT DO
//
//   Search the web for a better or newer source. There is no search API wired
//   to this agent, and inventing one would mean inventing results. A claim that
//   needs a source nobody has cited yet is marked
//
//       MANUAL_SOURCE_CHECK_REQUIRED
//
//   with the reason attached, and a human goes and looks. The same marker is
//   used when a fetch is blocked by bot protection, a paywall, authentication,
//   a rate limit, or JavaScript-only rendering.
//
// A FIGURE-PRESENCE CHECK IS NOT COMPREHENSION. "Every figure still appears on
// the cited page" is real evidence and it is weaker than a human reading the
// page. Results say which they are, and confidence is capped accordingly.
//
// Verification is OFF unless the run asks for it (`--verify`). A default run
// does no network I/O at all.
// ---------------------------------------------------------------------------

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { dirname } from "node:path";

import { classifySource, hostOf, buildSourceRecord } from "./sources.mjs";
import { daysBetween } from "./dates.mjs";

export const MANUAL_MARKER = "MANUAL_SOURCE_CHECK_REQUIRED";

/**
 * Every verification outcome the agent can produce. Nothing else is valid.
 *
 * THE CRITICAL DISTINCTION, and the reason `value-not-found` exists:
 *
 *   A figure DISAPPEARING from a source is not the source disagreeing with the
 *   page. Pages get restructured, figures move behind a tab, tables get
 *   rebuilt, a stat moves to a linked PDF. "I could not find the number" and
 *   "the source states a different number" are completely different pieces of
 *   evidence, and only the second one is a contradiction.
 *
 * So `contradicts` is reserved for cases where the current source EXPLICITLY
 * provides conflicting information:
 *
 *   * it states a different value for the same measure, anchored to the same
 *     subject (see findConflictingValues), or
 *   * it describes a project at a different stage than the page claims.
 *
 * Everything softer is `value-not-found` or `cannot-verify`, and neither of
 * those is ever reported as evidence that the page is wrong.
 */
export const VERIFICATION_RESULTS = [
  "confirms",
  "contradicts",
  "partially-confirms",
  "value-not-found",
  "cannot-verify",
  "source-unreachable",
  "manual-check-required",
  "not-attempted",
];

/**
 * Words a source uses to state a project's status, with the stage each one
 * implies. The stage numbers matter: a source can legitimately mention several
 * of these at once ("commissioners approved the project, and crews have since
 * broken ground"), so what counts is the FURTHEST ALONG stage the source
 * describes, not whichever pattern happens to match first.
 *
 * Comparing the stated stage against the source's furthest stage is what makes
 * "the page says planned, the source says construction is underway" come out as
 * a contradiction instead of a false confirmation.
 */
const STATUS_WORDS = {
  planned: { stage: 0, pattern: /\b(planned|proposed|approved|would be|has proposed|is seeking|conceptual)\b/i },
  "under-construction": {
    stage: 1,
    pattern: /\b(under construction|construction (?:is )?(?:began|started|underway)|broke ground|breaking ground|building (?:is )?underway)\b/i,
  },
  open: { stage: 2, pattern: /\b(now open|opened|is open|officially open|grand opening)\b/i },
};

/** Strip HTML down to readable text, well enough to search it for figures. */
export function htmlToText(html) {
  return String(html ?? "")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&#(\d+);/g, (_, c) => String.fromCharCode(Number(c)))
    .replace(/\s+/g, " ")
    .trim();
}

/** The <title> of a fetched page, when it has one. */
export function titleFromHtml(html) {
  const m = /<title[^>]*>([\s\S]{0,300}?)<\/title>/i.exec(String(html ?? ""));
  return m ? htmlToText(m[1]).slice(0, 200) : null;
}

/**
 * A published/updated date declared by the page itself, in the shapes that are
 * actually common: an article schema field, or an OpenGraph meta tag.
 */
export function declaredDateFromHtml(html) {
  const text = String(html ?? "");
  const patterns = [
    /"dateModified"\s*:\s*"(\d{4}-\d{2}-\d{2})/i,
    /"datePublished"\s*:\s*"(\d{4}-\d{2}-\d{2})/i,
    /property=["']article:modified_time["'][^>]*content=["'](\d{4}-\d{2}-\d{2})/i,
    /property=["']article:published_time["'][^>]*content=["'](\d{4}-\d{2}-\d{2})/i,
  ];
  for (const re of patterns) {
    const m = re.exec(text);
    if (m) return m[1];
  }
  return null;
}

/** Numbers as they might be written on another site: 480,000 / 480000 / $480,000. */
function figureVariants(figure) {
  const raw = String(figure).trim();
  const bare = raw.replace(/[$,\s]/g, "").replace(/percent$/i, "%");
  const variants = new Set([raw, bare]);
  const numeric = bare.replace(/[%]/g, "");
  if (/^\d+$/.test(numeric)) {
    variants.add(Number(numeric).toLocaleString("en-US"));
    variants.add(numeric);
  }
  if (/%$/.test(bare)) {
    variants.add(`${numeric} percent`);
    variants.add(`${numeric}%`);
  }
  return [...variants].filter((v) => v.length >= 2);
}

/** The unit a figure is measured in. Only like is ever compared with like. */
function unitOf(figure) {
  return String(figure).trim().startsWith("$") ? "dollar" : "percent";
}

const UNIT_PATTERNS = {
  dollar: /\$\s?\d[\d,]*(?:\.\d+)?(?:\s?(?:million|billion|thousand|k\b))?/gi,
  percent: /\b\d+(?:\.\d+)?\s?(?:%|\bpercent\b)/gi,
};

/** Compare two figures ignoring formatting: "$25,000" vs "$25000" vs "25,000". */
function sameValue(a, b) {
  const norm = (v) =>
    String(v)
      .toLowerCase()
      .replace(/[\s,$]/g, "")
      .replace(/percent$/, "%");
  return norm(a) === norm(b);
}

/** Common words that carry no meaning about WHAT is being measured. */
const LABEL_STOP_WORDS = new Set([
  "this", "that", "with", "from", "they", "than", "then", "when", "which", "what",
  "been", "have", "will", "into", "over", "more", "most", "only", "also", "each",
  "some", "such", "very", "just", "like", "both", "same", "other", "about",
  "after", "before", "under", "above", "their", "there", "these", "those",
  "would", "could", "should", "were", "was", "are", "and", "the", "for",
]);

/**
 * The words immediately around a figure — the label that says what it measures.
 *
 * This is the whole basis of the contradiction test, and it is deliberately
 * NARROW. Comparing the wider paragraph does not work: a down-payment programme
 * page says "assistance", "programme", "income" and "payment" in every
 * paragraph, so any two numbers on it look related. Comparing only the words
 * touching each figure asks the right question instead — is this the same
 * MEASURE, not merely the same topic?
 *
 * "household income must be at or below $147,300" and "qualifying income up to
 * $165,000" share only "income", so they are not compared. "the 30-year fixed
 * averaged 6.69% for the week" and "the 30-year fixed-rate mortgage averaged
 * 6.71% for the week ending" share several, so they are.
 */
function localLabel(text, index, length, { wordsBefore, wordsAfter }) {
  // Fold simple inflections so "averaged" and "average", "rates" and "rate"
  // count as the same label word.
  const stem = (w) => {
    let out = w;
    while (out.length > 4 && (out.endsWith("s") || out.endsWith("d"))) out = out.slice(0, -1);
    return out;
  };
  const clean = (words) =>
    new Set(
      words
        .map((w) => w.toLowerCase().replace(/[^a-z]/g, ""))
        .filter((w) => w.length > 3 && !LABEL_STOP_WORDS.has(w))
        .map(stem)
    );

  return {
    before: clean(String(text).slice(0, index).split(/\s+/).filter(Boolean).slice(-wordsBefore)),
    after: clean(String(text).slice(index + length).split(/\s+/).filter(Boolean).slice(0, wordsAfter)),
  };
}

/**
 * Look for EXPLICIT conflicting information: a different value for the same
 * measure, stated near enough to the same subject that the two are genuinely
 * comparable.
 *
 * This is what separates "the source says $25,000 where the page says $20,000"
 * — a real contradiction — from "the $20,000 is not on the page any more",
 * which is only an absence.
 *
 * The anchoring is what makes it honest. A source page can carry a dozen dollar
 * figures about a dozen different things; finding *a* different number proves
 * nothing. A candidate only counts when the text immediately around it shares
 * at least `minSharedTerms` distinctive words with the claim, so "household
 * income must be at or below $151,900 in Fixture County" is compared against
 * "household income must be at or below $147,300 in Clark County", and a
 * closing-cost figure elsewhere on the same page is not.
 *
 * @returns {Array<{pageValue:string, sourceValue:string, sharedTerms:string[], quote:string}>}
 */
export function findConflictingValues({
  missing,
  sourceText,
  claimText,
  minSharedTerms = 2,
  wordsBefore = 6,
  wordsAfter = 4,
  quoteChars = 160,
}) {
  const haystack = String(sourceText ?? "");
  const claim = String(claimText ?? "");
  const window = { wordsBefore, wordsAfter };
  const conflicts = [];

  for (const figure of missing) {
    // The figure has to be locatable in the claim, or there is no label to
    // compare against — and without a label there is no basis for calling
    // anything a contradiction.
    const at = claim.indexOf(figure);
    if (at < 0) continue;
    const claimLabel = localLabel(claim, at, figure.length, window);
    // Both sides are required, so a figure at the very start or end of a
    // sentence cannot support a contradiction. That is deliberate: without a
    // label on both sides there is no way to establish what it measures.
    if (claimLabel.before.size === 0 || claimLabel.after.size === 0) continue;

    const pattern = new RegExp(UNIT_PATTERNS[unitOf(figure)].source, "gi");
    let m;
    while ((m = pattern.exec(haystack)) !== null) {
      const candidate = m[0].replace(/[.,]+$/, "");
      if (sameValue(candidate, figure)) continue;

      const sourceLabel = localLabel(haystack, m.index, candidate.length, window);
      const sharedBefore = [...claimLabel.before].filter((t) => sourceLabel.before.has(t));
      const sharedAfter = [...claimLabel.after].filter((t) => sourceLabel.after.has(t));

      // The label must line up on BOTH sides of the number. One side alone is
      // not enough: "the down payment on a $500K home" and "providing $20,000
      // in down payment assistance" share the phrase "down payment", which is
      // in every other sentence of a down-payment article, and they measure
      // completely different things.
      if (sharedBefore.length === 0 || sharedAfter.length === 0) continue;
      const shared = [...sharedBefore, ...sharedAfter];
      if (shared.length < minSharedTerms) continue;

      const start = Math.max(0, m.index - quoteChars);
      const end = Math.min(haystack.length, m.index + candidate.length + quoteChars);
      conflicts.push({
        pageValue: figure,
        sourceValue: candidate,
        sharedTerms: shared.slice(0, 6),
        quote: haystack.slice(start, end).replace(/\s+/g, " ").trim(),
      });
      break; // one conflicting value per figure is enough to make the point
    }
  }
  return conflicts;
}

/** Which of a claim's figures still appear in the source text. */
export function matchFigures(figures, sourceText) {
  const haystack = String(sourceText ?? "").toLowerCase();
  const wanted = [...(figures.dollars ?? []), ...(figures.percents ?? [])];
  const found = [];
  const missing = [];
  for (const figure of wanted) {
    const hit = figureVariants(figure).some((v) => haystack.includes(v.toLowerCase()));
    (hit ? found : missing).push(figure);
  }
  return { wanted, found, missing };
}

// ---------------------------------------------------------------------------
// Cache
// ---------------------------------------------------------------------------

export function loadCache(path) {
  if (!path || !existsSync(path)) return { version: 1, entries: {} };
  try {
    const parsed = JSON.parse(readFileSync(path, "utf8"));
    return parsed && typeof parsed === "object" && parsed.entries ? parsed : { version: 1, entries: {} };
  } catch {
    return { version: 1, entries: {} };
  }
}

export function saveCache(path, cache) {
  if (!path) return;
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(cache, null, 2)}\n`, "utf8");
}

const sleep = (ms) => (ms > 0 ? new Promise((r) => setTimeout(r, ms)) : Promise.resolve());

// ---------------------------------------------------------------------------
// The verifier
// ---------------------------------------------------------------------------

/**
 * @param {object} opts
 * @param {object} opts.config
 * @param {string} opts.today
 * @param {Function} [opts.fetchImpl]  injected in tests; defaults to global fetch
 * @param {object}  [opts.cache]
 */
export function createVerifier({ config, today, fetchImpl = globalThis.fetch, cache = { version: 1, entries: {} } }) {
  const lastHostFetch = new Map();
  let fetches = 0;
  const log = [];

  /** Fetch one URL, honouring the cache, the budget, and the politeness delay. */
  async function fetchSource(url) {
    const cached = cache.entries[url];
    if (cached && daysBetween(cached.fetchedAt.slice(0, 10), today) <= config.verification.cacheTtlDays) {
      return { ...cached, fromCache: true };
    }
    if (fetches >= config.verification.maxSourceFetches) {
      return {
        url,
        ok: false,
        blocked: true,
        reason: `the per-run fetch budget of ${config.verification.maxSourceFetches} was already spent`,
        fetchedAt: new Date().toISOString(),
        fromCache: false,
      };
    }

    const host = hostOf(url) ?? "unknown";
    const since = Date.now() - (lastHostFetch.get(host) ?? 0);
    if (since < config.verification.perHostDelayMs) {
      await sleep(config.verification.perHostDelayMs - since);
    }
    lastHostFetch.set(host, Date.now());
    fetches += 1;

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), config.verification.timeoutMs);
    try {
      const response = await fetchImpl(url, {
        signal: controller.signal,
        redirect: "follow",
        headers: { "user-agent": config.verification.userAgent, accept: "text/html,*/*" },
      });
      const status = response.status ?? 0;
      const body = response.ok ? String(await response.text()).slice(0, config.verification.maxBytes) : "";
      const entry = {
        url,
        ok: Boolean(response.ok),
        status,
        lastModified: response.headers?.get?.("last-modified") ?? null,
        title: response.ok ? titleFromHtml(body) : null,
        declaredDate: response.ok ? declaredDateFromHtml(body) : null,
        text: response.ok ? htmlToText(body) : "",
        fetchedAt: new Date().toISOString(),
      };
      cache.entries[url] = { ...entry, text: entry.text.slice(0, 200_000) };
      return { ...entry, fromCache: false };
    } catch (err) {
      return {
        url,
        ok: false,
        error: err?.name === "AbortError" ? "timed out" : String(err?.message ?? err),
        fetchedAt: new Date().toISOString(),
        fromCache: false,
      };
    } finally {
      clearTimeout(timer);
    }
  }

  /** Turn an unreachable response into an honest, specific reason. */
  function unreachableResult({ claim, supporting, response }) {
    const accessedAt = response.fetchedAt;
    const status = response.status;
    let result = "source-unreachable";
    let marker = null;
    let reason;

    if (response.blocked) {
      result = "not-attempted";
      reason = response.reason;
    } else if (status === 401 || status === 403) {
      result = "manual-check-required";
      marker = MANUAL_MARKER;
      reason = `the source returned ${status}, which usually means bot protection or authentication. A person with a browser can read it; this agent cannot.`;
    } else if (status === 429) {
      result = "manual-check-required";
      marker = MANUAL_MARKER;
      reason = "the source rate-limited the request. Retrying harder would be rude; check it by hand or run again later.";
    } else if (status === 404 || status === 410) {
      // A source that has been removed says nothing at all, so it cannot
      // contradict anything. What is definitely wrong is the citation: the page
      // points a reader at something that is no longer there.
      result = "source-unreachable";
      reason =
        `the cited source is gone (HTTP ${status}). That says nothing about whether the claim is still true — but the ` +
        "page can no longer point a reader at anything, so the citation needs replacing.";
    } else if (response.error) {
      result = "manual-check-required";
      marker = MANUAL_MARKER;
      reason = `the request failed (${response.error}).`;
    } else {
      reason = `the source returned HTTP ${status}.`;
    }

    return {
      result,
      marker,
      confidence: result === "contradicts" ? "high" : "low",
      reason,
      evidence: [],
      record: buildSourceRecord({
        title: null,
        url: supporting?.url ?? null,
        type: supporting?.classification?.label ?? "unknown",
        accessedAt,
        verification: result,
        notes: [reason],
      }),
    };
  }

  /**
   * Verify one claim against the source the page already cites.
   * Never throws — a verification problem is a reportable result, not a crash.
   */
  async function verifyClaim({ claim, supporting, priority }) {
    const nowISO = new Date().toISOString();

    if (!config.verification.enabled) {
      return {
        result: "not-attempted",
        marker: null,
        confidence: "low",
        reason:
          "external verification was not enabled for this run. Detection is analysis only — nothing below has been checked against a source.",
        evidence: [],
        record: buildSourceRecord({
          url: supporting?.url ?? null,
          type: supporting?.classification?.label ?? "none cited",
          accessedAt: null,
          verification: "not-attempted",
          notes: ["run with --verify to check cited sources over the network"],
        }),
      };
    }

    if (priority < config.verification.minPriorityToVerify) {
      return {
        result: "not-attempted",
        marker: null,
        confidence: "low",
        reason: `below the verification threshold of ${config.verification.minPriorityToVerify} — the run spends its requests on higher-priority claims first.`,
        evidence: [],
        record: buildSourceRecord({
          url: supporting?.url ?? null,
          type: supporting?.classification?.label ?? "none cited",
          accessedAt: null,
          verification: "not-attempted",
          notes: [],
        }),
      };
    }

    if (!supporting?.url) {
      return {
        result: "manual-check-required",
        marker: MANUAL_MARKER,
        confidence: "low",
        reason:
          "the page cites no source for this claim, and this agent has no web-search capability. Finding the current authority is a human step.",
        evidence: [],
        record: buildSourceRecord({
          url: null,
          type: "none cited",
          accessedAt: nowISO,
          verification: "manual-check-required",
          notes: ["unsourced time-sensitive claim"],
        }),
      };
    }

    const classification = supporting.classification ?? classifySource(supporting.url, config);
    if (!classification.acceptable) {
      return {
        result: "manual-check-required",
        marker: MANUAL_MARKER,
        confidence: "low",
        reason: `the cited source (${classification.host}) is not an acceptable authority for this kind of claim. It needs replacing with a primary or official source before the claim can be trusted.`,
        evidence: [],
        record: buildSourceRecord({
          url: supporting.url,
          type: classification.label,
          accessedAt: nowISO,
          verification: "manual-check-required",
          notes: ["source is on the not-acceptable list"],
        }),
      };
    }

    const response = await fetchSource(supporting.url);
    log.push({ url: supporting.url, ok: Boolean(response.ok), fromCache: Boolean(response.fromCache) });

    if (!response.ok) return unreachableResult({ claim, supporting, response });

    const sourceText = response.text ?? "";
    const notes = [];
    if (response.fromCache) notes.push(`served from the source cache (fetched ${response.fetchedAt.slice(0, 10)})`);
    const sourceDate = response.declaredDate ?? normalizeLastModified(response.lastModified);
    if (sourceDate) notes.push(`the source states it was last updated ${sourceDate}`);

    // A very short body almost always means the content is rendered by
    // JavaScript. Saying "the figure is gone" from an empty shell would be a
    // fabricated result.
    if (sourceText.length < 400) {
      return {
        result: "manual-check-required",
        marker: MANUAL_MARKER,
        confidence: "low",
        reason:
          "the source returned almost no readable text, which normally means the content is rendered in the browser by JavaScript. Nothing can be concluded from it without opening it in a browser.",
        evidence: [],
        record: buildSourceRecord({
          title: response.title,
          url: supporting.url,
          type: classification.label,
          publishedOrUpdated: sourceDate,
          accessedAt: response.fetchedAt,
          verification: "manual-check-required",
          notes: [...notes, `only ${sourceText.length} characters of readable text`],
        }),
      };
    }

    // --- Project-status claims: compare the status wording -------------------
    if (claim.structured?.kind === "development-project") {
      const stated = claim.structured.status;
      const statedStage = STATUS_WORDS[stated]?.stage ?? 0;
      const matched = Object.entries(STATUS_WORDS)
        .filter(([, def]) => def.pattern.test(sourceText))
        .map(([key, def]) => ({ key, stage: def.stage }));

      if (matched.length === 0) {
        return finish({
          result: "cannot-verify",
          confidence: "low",
          reason: "the cited source is reachable but no longer states this project's status in words this agent can match.",
          evidence: [],
        });
      }

      const furthest = matched.reduce((a, b) => (b.stage > a.stage ? b : a));
      const readable = (s) => s.replace("-", " ");

      if (furthest.stage === statedStage) {
        return finish({
          result: "confirms",
          confidence: "medium",
          reason: `the cited source still describes this project in ${readable(stated)} terms.`,
          evidence: [`source still uses "${readable(stated)}" language`],
        });
      }
      const direction = furthest.stage > statedStage ? "further along than" : "less far along than";
      return finish({
        result: "contradicts",
        confidence: "medium",
        reason:
          `the page lists this project as ${readable(stated)}, but the cited source now describes it as ` +
          `${readable(furthest.key)} — ${direction} the page says. A human should read the source and decide which is right.`,
        evidence: matched.map((m) => `source uses "${readable(m.key)}" language`),
      });
    }

    // --- Figure-presence check ------------------------------------------------
    const { wanted, found, missing } = matchFigures(claim.figures ?? {}, sourceText);

    if (wanted.length === 0) {
      return finish({
        result: "cannot-verify",
        confidence: "low",
        reason:
          "this claim states no dollar figure or percentage, so there is nothing for an automated presence check to match. Verifying it means reading the source.",
        evidence: [],
      });
    }

    if (missing.length === 0) {
      return finish({
        result: "confirms",
        confidence: "medium",
        reason: `every figure this sentence states (${found.join(", ")}) still appears on the cited source. That is a presence check, not a reading of the source — it is evidence the claim has not been superseded, not proof it is correct.`,
        evidence: found.map((f) => `${f} still appears on the source`),
      });
    }

    // Something is missing. Before anything else, look for EXPLICIT conflicting
    // information: a different value for the same measure, anchored to the same
    // subject. That — and only that — is a contradiction.
    const conflicts = findConflictingValues({
      missing,
      sourceText,
      claimText: claim.text,
      minSharedTerms: config.verification.conflictMinSharedTerms,
      wordsBefore: config.verification.conflictLabelWordsBefore,
      wordsAfter: config.verification.conflictLabelWordsAfter,
    });

    if (conflicts.length > 0) {
      const pairs = conflicts.map((c) => `the page says ${c.pageValue}, the source says ${c.sourceValue}`);
      return finish({
        result: "contradicts",
        // A conflicting value on a primary or official source, cited directly
        // against this claim, is the strongest evidence this agent can gather.
        confidence: classification.rank <= 3 && supporting.origin === "attached to the claim" ? "high" : "medium",
        reason: `the cited source states a different figure for the same thing — ${pairs.join("; ")}.`,
        evidence: conflicts.map((c) => `source states ${c.sourceValue} where the page states ${c.pageValue}: “${c.quote}”`),
        conflicts,
      });
    }

    if (found.length > 0) {
      return finish({
        result: "partially-confirms",
        confidence: "medium",
        reason:
          `${found.length} of ${wanted.length} figures still appear on the cited source (${found.join(", ")}), but ` +
          `${missing.join(", ")} could not be found on it. The source does not state a different figure either, so this ` +
          "is an absence, not a disagreement — the page may have been restructured, or the figure may have moved.",
        evidence: [
          ...found.map((f) => `${f} still appears`),
          ...missing.map((f) => `${f} could not be found`),
        ],
      });
    }

    // Nothing matched, and the source states no conflicting value. This is NOT
    // evidence the page is wrong — it is evidence the check could not be
    // completed, and it is reported as exactly that.
    const onTopic = topicallyRelated(claim, sourceText);
    if (onTopic) {
      return finish({
        result: "value-not-found",
        confidence: "medium",
        reason:
          `the figures this sentence states (${missing.join(", ")}) could not be found on the cited source, which is ` +
          "still about the same subject. **The source does not state a different figure**, so this does not show the " +
          "page is wrong — only that the claim can no longer be confirmed from what it cites. A person needs to read " +
          "the source and decide whether the figure moved or simply moved elsewhere on the page.",
        evidence: missing.map((f) => `${f} could not be found on the source`),
      });
    }
    return finish({
      result: "cannot-verify",
      confidence: "low",
      reason:
        "the cited source is reachable, but neither the figures nor the subject of this claim could be found on it. The source page may have been restructured.",
      evidence: [],
    });

    function finish({ result, confidence, reason, evidence, conflicts = [] }) {
      return {
        result,
        marker: null,
        confidence,
        reason,
        evidence,
        // Present only when the source EXPLICITLY states a different value.
        // Its emptiness is what tells a reader that a missing figure was an
        // absence rather than a disagreement.
        conflicts,
        record: buildSourceRecord({
          title: response.title,
          url: supporting.url,
          type: classification.label,
          publishedOrUpdated: sourceDate,
          accessedAt: response.fetchedAt,
          verification: result,
          notes,
        }),
      };
    }
  }

  return {
    verifyClaim,
    get stats() {
      return { fetches, cacheEntries: Object.keys(cache.entries).length, log };
    },
    cache,
  };
}

/** "Tue, 12 Aug 2026 09:00:00 GMT" -> "2026-08-12". */
export function normalizeLastModified(header) {
  if (!header) return null;
  const time = Date.parse(header);
  return Number.isFinite(time) ? new Date(time).toISOString().slice(0, 10) : null;
}

/** Is the fetched source still about the same subject as the claim? */
function topicallyRelated(claim, sourceText) {
  const haystack = sourceText.toLowerCase();
  const terms = new Set(
    `${claim.text} ${claim.heading ?? ""}`
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, " ")
      .split(" ")
      .filter((w) => w.length > 5)
  );
  if (terms.size === 0) return false;
  let hits = 0;
  for (const term of terms) if (haystack.includes(term)) hits += 1;
  return hits / terms.size >= 0.3;
}
