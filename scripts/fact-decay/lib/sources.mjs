// ---------------------------------------------------------------------------
// SOURCE RECORDS AND THE SOURCE HIERARCHY
//
// LVINIT already has a source-tracking convention, and this agent reuses it
// rather than inventing a second one:
//
//   * `AreaSource` — { label, url, used } — the page's own bibliography,
//     rendered in the collapsed "Sources & updates" block.
//   * Each Development Watch project carries its own required `source`
//     { label, url }.
//
// So the audit trail this agent produces is: the source the PAGE already cites,
// beside the source the AGENT checked, beside what the check found and when.
// Nothing new has to be maintained by hand.
//
// THE PREFERENCE ORDER is the brief's, encoded once, here:
//
//   1. Official government sources
//   2. Primary sources
//   3. Developers / program administrators
//   4. MLS-supported or authoritative housing data
//   5. Reputable local reporting
//   6. Other credible sources, only when nothing better exists
//
// And the disallowed list — scraped SEO sites, anonymous blogs, AI-generated
// summaries, stale aggregators, forum claims — is encoded as `not-acceptable`.
// That list is deliberately SHORT and explicit. Guessing that an unknown domain
// is a content farm would be exactly the kind of unearned confidence this whole
// agent exists to avoid, so an unrecognised domain is "other credible", flagged
// as thinly sourced, and left to a human.
// ---------------------------------------------------------------------------

/** Domain rules, most specific first. */
const DOMAIN_RULES = [
  // --- 1. Official government ----------------------------------------------
  { tier: "official-government", test: (h) => h.endsWith(".gov") || h === "gov" },
  { tier: "official-government", test: (h) => /(^|\.)clarkcountynv\.gov$/.test(h) },
  { tier: "official-government", test: (h) => /(^|\.)lasvegasnevada\.gov$/.test(h) },
  { tier: "official-government", test: (h) => /(^|\.)cityofhenderson\.com$/.test(h) },
  { tier: "official-government", test: (h) => /(^|\.)cityofnorthlasvegas\.com$/.test(h) },
  { tier: "official-government", test: (h) => /(^|\.)(rtcsnv|nvfastforward|dot\.nv)\.(com|gov|org)$/.test(h) },
  { tier: "official-government", test: (h) => /(^|\.)ccsd\.net$/.test(h) },

  // --- 2/3. Program administrators and developers ---------------------------
  { tier: "developer-or-administrator", test: (h) => /(^|\.)homeispossiblenv\.org$/.test(h) },
  { tier: "developer-or-administrator", test: (h) => /(^|\.)(summerlin|howardhughes|communities\.howardhughes)\.com$/.test(h) },
  { tier: "developer-or-administrator", test: (h) => /(^|\.)(lennar|kbhome|pulte|richmondamerican|tollbrothers|drhorton|century communities)\.com$/.test(h) },

  // --- 4. Authoritative housing data ---------------------------------------
  { tier: "authoritative-housing-data", test: (h) => /(^|\.)(lasvegasrealtor|lasvegasrealtors)\.com$/.test(h) },
  { tier: "authoritative-housing-data", test: (h) => /(^|\.)(freddiemac|fanniemae|nar\.realtor|census)\.(com|org|gov)$/.test(h) },
  { tier: "authoritative-housing-data", test: (h) => /(^|\.)(homebuildersresearch|zillow|redfin|realtor)\.com$/.test(h) },

  // --- 5. Reputable local reporting ----------------------------------------
  { tier: "reputable-local-reporting", test: (h) => /(^|\.)(reviewjournal|lasvegassun|8newsnow|ktnv|fox5vegas|news3lv|vegasinc|nevadabusiness|nevadacurrent|thenevadaindependent)\.com$/.test(h) },
  { tier: "reputable-local-reporting", test: (h) => /(^|\.)(ap|apnews|reuters|npr|bloomberg|wsj|nytimes)\.(com|org)$/.test(h) },

  // --- Never acceptable -----------------------------------------------------
  { tier: "not-acceptable", test: (h) => /(^|\.)(reddit|quora|answers|blogspot|wordpress\.com|medium)\.(com|org)$/.test(h) },
  { tier: "not-acceptable", test: (h) => /(^|\.)(city-data|niche|areavibes|neighborhoodscout)\.com$/.test(h) },
  { tier: "not-acceptable", test: (h) => /forum/.test(h) },
];

/** Hostname of a URL, lowercased and de-www'd. Null for anything unparseable. */
export function hostOf(url) {
  try {
    return new URL(String(url)).hostname.toLowerCase().replace(/^www\./, "");
  } catch {
    return null;
  }
}

/**
 * Classify one source into the hierarchy.
 *
 * @returns {{tier:string, rank:number, label:string, weight:number,
 *            host:string|null, acceptable:boolean, thin:boolean}}
 */
export function classifySource(url, config) {
  const host = hostOf(url);
  const tierKey = host ? (DOMAIN_RULES.find((rule) => rule.test(host))?.tier ?? "other-credible") : "other-credible";
  const tier = config.sources.tiers.find((t) => t.key === tierKey) ?? config.sources.tiers.at(-1);
  return {
    tier: tier.key,
    rank: tier.rank,
    label: tier.label,
    weight: tier.weight,
    host,
    acceptable: tier.key !== "not-acceptable",
    thin: tier.weight <= config.sources.thinSourceWeight,
  };
}

/**
 * The best source the PAGE already offers for a claim.
 *
 * Preference:
 *   1. the claim's own attached source (Development Watch entries have one)
 *   2. the page's declared source whose `used` text overlaps the claim
 *   3. the highest-ranked declared source on the page
 *
 * Returns null when the page cites nothing at all, which is itself a finding:
 * an unsourced time-sensitive claim.
 */
export function supportingSourceFor(claim, page, config) {
  if (claim.structured?.source?.url) {
    return {
      ...claim.structured.source,
      origin: "attached to the claim",
      classification: classifySource(claim.structured.source.url, config),
    };
  }

  const declared = page.declaredSources ?? [];
  if (declared.length === 0) return null;

  const claimTokens = tokenSet(claim.text);
  let best = null;
  for (const source of declared) {
    const overlap = jaccard(claimTokens, tokenSet(`${source.used ?? ""} ${source.label ?? ""}`));
    const classification = classifySource(source.url, config);
    const score = overlap * 2 + classification.weight;
    if (!best || score > best.score) best = { source, overlap, classification, score };
  }
  if (!best) return null;
  return {
    label: best.source.label,
    url: best.source.url,
    used: best.source.used,
    origin: best.overlap > 0.08 ? "matched from the page's source list" : "the page's strongest listed source",
    topicalOverlap: Number(best.overlap.toFixed(3)),
    classification: best.classification,
  };
}

function tokenSet(text) {
  return new Set(
    String(text ?? "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, " ")
      .split(" ")
      .filter((w) => w.length > 3)
  );
}

function jaccard(a, b) {
  if (a.size === 0 || b.size === 0) return 0;
  let shared = 0;
  for (const token of a) if (b.has(token)) shared += 1;
  return shared / (a.size + b.size - shared);
}

/**
 * The record kept for every source the agent looked at. This is the audit
 * trail: what the page said, what supported it, what the source says now, and
 * when we looked.
 */
export function buildSourceRecord({
  title = null,
  url,
  type,
  publishedOrUpdated = null,
  accessedAt,
  verification,
  notes = [],
}) {
  return {
    sourceTitle: title,
    sourceUrl: url ?? null,
    sourceType: type,
    datePublishedOrUpdated: publishedOrUpdated,
    dateAccessed: accessedAt,
    verificationResult: verification,
    notes,
  };
}

/** The hierarchy, rendered for the report. */
export function describeHierarchy(config) {
  return config.sources.tiers
    .filter((t) => t.key !== "not-acceptable")
    .sort((a, b) => a.rank - b.rank)
    .map((t) => ({ rank: t.rank, label: t.label, weight: t.weight }));
}
