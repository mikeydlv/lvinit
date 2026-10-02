// ---------------------------------------------------------------------------
// SPOKEN CLAIMS — what the video asserts, and what has to be checked
//
// Every transcript sentence is sorted with the Fact-Decay Agent's own
// sentence classifier (reused unchanged), then labelled for the Publisher:
//
//   fact        a time-sensitive factual assertion. Never published on the
//               transcript's word alone: it goes on the verification checklist
//   unclear     a sweeping or superlative statement with no figure and no
//               named source ("everybody", "the cheapest", "always"). Not a
//               fact LVINIT can print as stated
//   opinion     Mikey's judgement, advice or first-person experience. It may be
//               published AS HIS OPINION, attributed — never restated as fact
//   narrative   connective speech, durable description, settled history
//
// Separately, every sentence that touches a fast-decaying subject (prices,
// rates, HOA amounts, incentives, development status, market statistics, laws,
// commute claims, builder availability, construction timelines) is flagged,
// even when it is phrased as an opinion: "rates are around 7% right now, and I
// think that's fine" still contains a rate.
//
// No language model is used here. Detection is not verification.
// ---------------------------------------------------------------------------

import { classifySentence } from "../../fact-decay/lib/claims.mjs";
import { loadConfig as loadFactDecayConfig } from "../../fact-decay/config.mjs";

const FACT_CONFIG = loadFactDecayConfig({ gsc: { enabled: false } });

/**
 * The decay families Mikey listed, mapped from the Fact-Decay categories.
 * `source` is the preferred source type the Publisher should check against.
 */
export const DECAY_FAMILIES = {
  price: { label: "Prices", source: "Las Vegas Realtors monthly report, or the builder's current price sheet", categories: ["home-prices", "rents", "price-figure"] },
  rate: { label: "Mortgage rates", source: "Freddie Mac PMMS (weekly), dated", categories: ["mortgage-rates", "fee-or-rate-figure"] },
  hoa: { label: "HOA amounts and assessments", source: "the HOA's current budget or the community's disclosure documents", categories: ["hoa-fees", "sid-lid-and-assessments"] },
  incentive: { label: "Builder incentives", source: "the builder's current offer page, dated", categories: ["builder-incentives"] },
  "development-status": { label: "Development status", source: "the city/county agenda, permit record, or the developer's own release", categories: ["project-status", "development-approval-and-zoning", "planned-community-scope", "retail-and-resort-opening", "parks-and-amenities"] },
  "market-stat": { label: "Market statistics", source: "Las Vegas Realtors, Home Builders Research, or the named data publisher", categories: ["inventory-and-days-on-market", "resale-market-conditions"] },
  law: { label: "Laws, taxes and rules", source: "the statute, ordinance, or the agency's own page", categories: ["law-and-regulation", "rental-and-str-rules", "licensing-requirements", "tax-rules", "property-tax"] },
  commute: { label: "Commute and access", source: "a mapped drive at a stated time of day, or RTC/NDOT", categories: ["travel-access-claim", "road-closure", "transit-service"] },
  "builder-availability": { label: "Builder availability", source: "the builder's community page (homes and lots currently released)", categories: ["new-home-availability", "builder-and-community-status"] },
  "construction-timeline": { label: "Construction timelines", source: "the agency or developer's current schedule", categories: ["construction-timeline", "road-and-freeway-project"] },
  program: { label: "Programs, eligibility and deadlines", source: "the program administrator's current page", categories: ["down-payment-and-financing", "assistance-programs", "government-program", "eligibility-rule", "deadline-or-application-period"] },
  schools: { label: "School facts", source: "CCSD or the Nevada Department of Education — facts only, never rankings", categories: ["schools-factual"] },
};

const FAMILY_BY_CATEGORY = new Map(Object.entries(DECAY_FAMILIES).flatMap(([family, f]) => f.categories.map((c) => [c, family])));

/**
 * Spoken-language cues the page-oriented Fact-Decay patterns miss, because
 * speech rarely carries a formatted figure: "builders are throwing incentives
 * at people right now". Each only counts with present-tense framing or a number.
 */
const SPOKEN_CUES = [
  { family: "rate", pattern: /\b(rates?|interest)\b[^.?!]{0,40}\b(\d|percent|high|low|down|up|dropp|com(e|ing) down)/i },
  { family: "price", pattern: /\b(prices?|median|cost(s)?|expensive|cheaper|afford\w*)\b[^.?!]{0,40}\$?\d|\$\s?\d/i },
  { family: "hoa", pattern: /\b(hoa|homeowners? association|sid|lid|special assessment)s?\b/i },
  { family: "incentive", pattern: /\b(incentives?|concessions?|buy-?downs?|closing cost credits?)\b/i },
  { family: "market-stat", pattern: /\b(inventory|days on market|months? of supply|listings?|homes? (for sale|on the market)|sales (are|were) (up|down))\b/i },
  { family: "commute", pattern: /\b\d+\s*(-|to)?\s*\d*\s*minutes?\b[^.?!]{0,40}\b(drive|commute|strip|airport|from|to)\b|\b(commute|drive time|traffic)\b/i },
  { family: "builder-availability", pattern: /\b(sold out|selling out|lots? (left|available|released)|now selling|close-?out|quick move-?in)\b/i },
  { family: "construction-timeline", pattern: /\b(break(s|ing)? ground|under construction|(should|will|expected to) (open|be done|finish|complete)|by (spring|summer|fall|winter|next year|20\d\d))\b/i },
  { family: "development-status", pattern: /\b(approved|planned|proposed|zon(ed|ing)|entitle\w*|coming (soon|to))\b/i },
  { family: "law", pattern: /\b(law|legal|illegal|ordinance|tax(es)?|abatement|permit|license)\b/i },
];

/** Explicit opinion framing: the sentence is offered as Mikey's view, not as fact. */
const OPINION_FRAME = /\bi (?:also |really |just |still |honestly )?(?:think|believe|feel)\b|\bi don'?t (?:think|believe)\b|\b(i'?d|i would|in my opinion|my take|my advice|if i were|honestly|personally|to me)\b/i;

/** Hedged speech is offered as judgement, not as a checkable fact. */
const HEDGE = /\b(probably|maybe|might|could be|kind of|sort of)\b/i;

/** A made-up example: "Maybe you're 80% sure…", "Let's say you're moving for a job…". */
const HYPOTHETICAL = /^(?:and |but |so )?(maybe|let'?s say|say|imagine|suppose|pretend|if you)\b/i;

/** Market subjects whose figure must be checked even inside a hypothetical. */
const HARD_FAMILIES = new Set(["rate", "price", "hoa", "incentive", "market-stat"]);

/** Clock times are advice about WHEN to look, not measurements ("drive it at 5:00 on a Tuesday"). */
const CLOCK = /\b\d{1,2}:\d{2}\s*(?:a\.?m\.?|p\.?m\.?)?|\b\d{1,2}\s*(?:a\.?m\.?|p\.?m\.?)(?=\W|$)/gi;

/** Words that make a development category real: there is a project in the sentence. */
const DEV_NOUN = /\b(project|community|communities|development|construction|built|building|opening|opened|plan(?:ned)?|site|parcel|acres|approved|zoning|builder)\b/i;

const PRESENT = /\b(right now|currently|today|these days|this year|at the moment|now|lately|recently)\b/i;
const HAS_NUMBER = /\d|\b(percent|thousand|million|hundred)\b/i;

/**
 * Sweeping or superlative language that a transcript alone cannot support.
 * "always" / "never" are left out on purpose: in speech they are rhythm far more
 * often than a claim.
 */
const SWEEPING = /\b(everybody|everyone|nobody|no one|every single|most people|the cheapest|the best|the biggest|the safest|the fastest|the worst|the only|number one|guaranteed)\b/i;

/** First-person experience — Mikey's, publishable only as his. */
const FIRST_PERSON_EXPERIENCE = /\b(i'?ve (seen|had|watched|helped|worked)|my clients?|when i (moved|bought|was)|i (would|'d) (rent|buy|tell|do|recommend|look|start)|if i were|i always tell|what i tell|i recommend)\b/i;

/** Decay families a sentence touches, from Fact-Decay categories and spoken cues. */
export function decayFamilies(text, categories = []) {
  const families = new Set();
  for (const c of categories) {
    const f = FAMILY_BY_CATEGORY.get(c.key ?? c);
    if (f) families.add(f);
  }
  const value = String(text ?? "");
  for (const cue of SPOKEN_CUES) {
    if (!cue.pattern.test(value)) continue;
    // Only a present-tense or numeric statement is a claim about a value that
    // can decay; "HOAs exist" is not.
    if (PRESENT.test(value) || HAS_NUMBER.test(value) || ["hoa", "incentive", "builder-availability", "construction-timeline", "development-status"].includes(cue.family)) {
      if (cue.family === "law" && !(PRESENT.test(value) || HAS_NUMBER.test(value))) continue;
      if (cue.family === "development-status" && !PRESENT.test(value) && !HAS_NUMBER.test(value)) continue;
      families.add(cue.family);
    }
  }
  return [...families];
}

/**
 * Classify one spoken sentence.
 * @returns {{kind, reason, families, categories, figures, needsVerification, transcriptSufficient}}
 */
export function classifySpokenSentence(text, { today }) {
  const original = String(text ?? "").trim();
  // Analyze with clock times masked; report the sentence as spoken.
  const value = original.replace(CLOCK, " a set time ");
  const base = classifySentence(value, { config: FACT_CONFIG, today });
  let categories = (base.categories ?? []).map((c) => c.key);
  // A development category with no project in the sentence ("putting your
  // life on hold") is a pattern accident, not a status claim.
  const devOnly = categories.length > 0 && categories.every((k) => FAMILY_BY_CATEGORY.get(k) === "development-status" || FAMILY_BY_CATEGORY.get(k) === "construction-timeline");
  if (devOnly && !DEV_NOUN.test(value)) categories = [];
  const families = decayFamilies(value, categories);
  const figures = base.figures ? [...base.figures.dollars, ...base.figures.percents] : [];
  const hypothetical = HYPOTHETICAL.test(value) && !/\$\s?\d/.test(value);
  const hedged = HEDGE.test(value) && !/\$\s?\d|%/.test(value);

  let kind;
  let reason;
  if (hypothetical && !families.some((f) => HARD_FAMILIES.has(f))) {
    kind = "opinion";
    reason = "a hypothetical example Mikey uses to explain the decision";
  } else if (base.kind === "claim" && categories.length > 0 && !(hedged && OPINION_FRAME.test(value))) {
    kind = "fact";
    reason = `a time-sensitive factual assertion (${categories[0] ?? "uncategorized"})`;
  } else if (SWEEPING.test(value) && !HAS_NUMBER.test(value) && !FIRST_PERSON_EXPERIENCE.test(value) && !OPINION_FRAME.test(value) && !HEDGE.test(value)) {
    kind = "unclear";
    reason = "a sweeping or superlative statement with no figure or named source";
  } else if (base.kind === "opinion" || FIRST_PERSON_EXPERIENCE.test(value) || OPINION_FRAME.test(value) || hedged) {
    kind = "opinion";
    reason = FIRST_PERSON_EXPERIENCE.test(value) ? "Mikey's own experience or recommendation" : base.reason;
  } else if (families.length && (PRESENT.test(value) || HAS_NUMBER.test(value))) {
    kind = "fact";
    reason = "a spoken statement about a value that changes";
  } else {
    kind = "narrative";
    reason = base.reason ?? "connective or descriptive speech";
  }

  // Anything touching a decaying subject is checked, whatever its kind — an
  // opinion wrapped around a rate still contains the rate.
  const decaying = hypothetical ? families.filter((f) => HARD_FAMILIES.has(f)) : families;
  const needsVerification = kind === "fact" || kind === "unclear" || (decaying.length > 0 && (PRESENT.test(value) || HAS_NUMBER.test(value)));
  return {
    kind,
    reason,
    families,
    categories,
    figures,
    needsVerification,
    // The transcript is enough only for what is Mikey's own: his opinion or
    // experience, with no decaying value inside it.
    transcriptSufficient: !needsVerification && (kind === "opinion" || kind === "narrative"),
  };
}

/** Classify every sentence of a transcript. */
export function analyzeClaims(sentences, { today }) {
  const out = sentences.map((s) => ({ ...s, ...classifySpokenSentence(s.text, { today }) }));
  const counts = { fact: 0, unclear: 0, opinion: 0, narrative: 0 };
  for (const s of out) counts[s.kind] += 1;
  const familyCounts = {};
  for (const s of out) for (const f of s.families) familyCounts[f] = (familyCounts[f] ?? 0) + 1;
  return { sentences: out, counts, familyCounts, verificationRequired: out.filter((s) => s.needsVerification).length };
}

/**
 * The fact-verification checklist: one item per sentence that must be checked,
 * with why, against what, and whether the transcript alone is enough (never, for
 * anything on this list).
 */
export function verificationChecklist(claimSentences) {
  const seen = new Set();
  return claimSentences
    .filter((s) => s.needsVerification)
    .filter((s) => {
      // Said twice on camera is still one claim to check.
      const key = s.text.toLowerCase().replace(/[^a-z0-9$%]+/g, " ").trim();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .map((s) => {
      const family = s.families[0] ?? null;
      const spec = family ? DECAY_FAMILIES[family] : null;
      const reason =
        s.kind === "unclear"
          ? "Sweeping or superlative — needs a source, or rewording as Mikey's opinion, before it can appear"
          : spec
            ? `${spec.label} change over time; the figure or status said on camera may already be out of date`
            : "A factual assertion made on camera; confirm it before it is published as fact";
      return {
        timecode: s.timecode,
        claim: s.text,
        kind: s.kind,
        family,
        families: s.families,
        categories: s.categories,
        figures: s.figures,
        reason,
        preferredSourceType: spec?.source ?? (s.kind === "unclear" ? "a named, citable source — or attribute it to Mikey as opinion" : "a primary source for the specific claim"),
        transcriptSufficient: false,
        blocking: Boolean(family) || s.figures.length > 0,
      };
    });
}
