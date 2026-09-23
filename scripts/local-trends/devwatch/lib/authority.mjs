// ---------------------------------------------------------------------------
// SOURCE AUTHORITY — where an item sits in the source hierarchy
//
// A feed item takes its registry source's authority. A Google News item takes
// its PUBLISHER's authority (by domain, else by name) — Google itself proves
// nothing. Legistar items are planning records (2).
//
//   primary     authority 1–7   can verify a status on its own
//   secondary   authority 8     reputable local reporting: supports, corroborates
//   other       authority 9     context only
//   lead        authority 10    community discussion: never evidence
// ---------------------------------------------------------------------------

import { sourceById, authorityForDomain, isPressWire, PRIMARY_MAX_AUTHORITY, AUTHORITY } from "../../sources.mjs";

/** Publisher names Google News reports without a usable domain. */
const NAME_AUTHORITY = [
  [/review-journal|reviewjournal/i, 8],
  [/las vegas sun|vegas inc/i, 8],
  [/ktnv|13 action news|channel 13/i, 8],
  [/8 ?news ?now|klas/i, 8],
  [/news ?3|ksnv/i, 8],
  [/fox ?5/i, 8],
  [/nevada current/i, 8],
  [/nevada independent/i, 8],
  [/knpr|nevada public radio/i, 8],
  [/nevada business/i, 8],
  [/city of henderson|city of las vegas|city of north las vegas|clark county/i, 1],
  [/\bndot\b|nevada department of transportation/i, 3],
  [/\brtc\b|regional transportation commission/i, 4],
  [/pr newswire|business wire|globenewswire/i, 5],
  [/reddit|facebook|nextdoor|tiktok|instagram/i, 10],
];

export function authorityOf(item) {
  if (item.authority) return item.authority;
  if (item.via === "legistar") return 2;
  if (item.via && item.via !== "google-news" && item.via !== "google-news-dev") {
    const src = sourceById(item.via);
    if (src) return src.authority;
  }
  const byDomain = authorityForDomain(item.sourceDomain);
  if (byDomain !== 9) return byDomain;
  for (const [re, a] of NAME_AUTHORITY) if (re.test(item.sourceName ?? "")) return a;
  return 9;
}

export function authorityClass(authority) {
  if (authority <= PRIMARY_MAX_AUTHORITY) return "primary";
  if (authority === 8) return "secondary";
  if (authority === 9) return "other";
  return "lead";
}

export function authorityLabel(authority) {
  return AUTHORITY[authority] ?? "unknown";
}

/** Attach authority, class and press-wire flag to every item. Pure. */
export function withAuthority(items) {
  return items.map((it) => {
    const authority = authorityOf(it);
    return { ...it, authority, authorityClass: authorityClass(authority), pressWire: isPressWire(it.sourceDomain) || /pr newswire|business wire|globenewswire/i.test(it.sourceName ?? "") };
  });
}
