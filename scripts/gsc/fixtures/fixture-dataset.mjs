// ---------------------------------------------------------------------------
// ⚠️  FIXTURE DATA — SYNTHETIC. NOT LVINIT'S REAL SEARCH CONSOLE DATA.  ⚠️
//
// Every number in this file was INVENTED to exercise the opportunity detectors
// before Search Console access exists. None of it describes LVINIT's actual
// search performance, and nothing here should ever be quoted as if it did.
//
// It is shaped exactly like a raw Search Console `searchAnalytics.query`
// response row ({ keys, clicks, impressions, ctr, position }) so the analysis
// path is identical whether the rows come from Google or from here.
//
// The dataset is designed so that each detector has something to find:
//
//   quick-win              "summerlin vs henderson" — position 8.2, 180 impressions
//   ctr-opportunity        "what 500k buys in las vegas" — 210 impressions, 0.5% CTR
//   emerging-query         "moving to las vegas from california 2026" — 1 → 95
//   page-gaining-momentum  /neighborhoods/southwest-las-vegas — 4 → 14 clicks
//   page-losing-momentum   /guides/will-las-vegas-home-prices-drop — 30 → 11 clicks
//   content-gap            "rent first or buy when moving to las vegas"
//   query-page-mismatch    "henderson vs southwest las vegas" ranking the wrong page
//   cannibalization        two URLs both ranking "summerlin vs henderson"
//   internal-link          a page with visibility that related pages don't link to
//
//   Fair Housing gate      "best family neighborhoods…", "safest neighborhoods…"
//   Off-topic rejection    "las vegas casino jobs"
//
// The ROUTES referenced are real LVINIT routes, because the site inventory is
// read from the real repository even in fixture mode — only the Search Console
// numbers are synthetic.
// ---------------------------------------------------------------------------

const ORIGIN = "https://www.lvinit.com";

/** Build a raw-shaped query row. */
const q = (query, clicks, impressions, position) => ({
  keys: [query],
  clicks,
  impressions,
  ctr: impressions > 0 ? Number((clicks / impressions).toFixed(4)) : 0,
  position,
});

/** Build a raw-shaped page row. */
const p = (route, clicks, impressions, position) => ({
  keys: [`${ORIGIN}${route}`],
  clicks,
  impressions,
  ctr: impressions > 0 ? Number((clicks / impressions).toFixed(4)) : 0,
  position,
});

/** Build a raw-shaped query+page row. */
const qp = (query, route, clicks, impressions, position) => ({
  keys: [query, `${ORIGIN}${route}`],
  clicks,
  impressions,
  ctr: impressions > 0 ? Number((clicks / impressions).toFixed(4)) : 0,
  position,
});

const currentQueries = [
  q("summerlin vs henderson", 14, 180, 8.2),
  q("what 500k buys in las vegas", 1, 210, 8.5),
  q("las vegas starter home prices", 9, 120, 7.4),
  q("will las vegas home prices drop", 11, 145, 9.1),
  q("henderson nv neighborhoods", 6, 88, 7.8),
  q("summerlin las vegas", 12, 165, 9.6),
  q("las vegas down payment assistance", 5, 70, 8.9),
  q("moving to las vegas from california 2026", 3, 95, 15.4),
  q("rent first or buy when moving to las vegas", 0, 62, 34.2),
  q("henderson vs southwest las vegas", 2, 74, 11.8),
  q("new construction vs resale las vegas", 1, 58, 22.6),
  q("commute from summerlin to the strip", 2, 41, 17.9),
  q("nevada property tax abatement", 4, 90, 12.3),
  q("southwest las vegas neighborhood", 5, 66, 10.9),
  q("first summer in las vegas heat", 3, 37, 13.1),
  q("four seasons private residences las vegas", 2, 31, 6.2),
  q("lvinit", 8, 22, 1.4),
  // --- these two exist to prove the Fair Housing gate fires -----------------
  q("best family neighborhoods in las vegas", 3, 130, 18.2),
  q("safest neighborhoods in henderson nv", 1, 96, 21.5),
  // --- this one exists to prove off-topic queries are rejected --------------
  q("las vegas casino jobs", 0, 44, 41.0),
];

const previousQueries = [
  q("summerlin vs henderson", 11, 158, 9.4),
  q("what 500k buys in las vegas", 2, 188, 8.9),
  q("las vegas starter home prices", 8, 111, 7.9),
  q("will las vegas home prices drop", 26, 240, 6.8),
  q("henderson nv neighborhoods", 5, 81, 8.1),
  q("summerlin las vegas", 13, 171, 9.2),
  q("las vegas down payment assistance", 4, 66, 9.2),
  q("moving to las vegas from california 2026", 0, 1, 41.0),
  q("rent first or buy when moving to las vegas", 0, 18, 38.5),
  q("henderson vs southwest las vegas", 1, 52, 13.6),
  q("new construction vs resale las vegas", 0, 12, 27.4),
  q("commute from summerlin to the strip", 1, 33, 19.2),
  q("nevada property tax abatement", 3, 84, 12.9),
  q("southwest las vegas neighborhood", 2, 31, 15.8),
  q("first summer in las vegas heat", 4, 44, 12.4),
  q("four seasons private residences las vegas", 1, 24, 7.1),
  q("lvinit", 6, 17, 1.5),
  q("best family neighborhoods in las vegas", 2, 118, 19.0),
  q("safest neighborhoods in henderson nv", 1, 88, 22.1),
  q("las vegas casino jobs", 0, 39, 42.2),
];

const currentPages = [
  p("/guides/summerlin-vs-henderson", 18, 240, 9.1),
  p("/neighborhoods/summerlin", 15, 205, 11.6),
  p("/guides/what-500k-buys-in-las-vegas", 2, 225, 9.0),
  p("/guides/will-las-vegas-home-prices-drop", 11, 150, 9.4),
  p("/neighborhoods/henderson", 9, 178, 10.8),
  p("/neighborhoods/southwest-las-vegas", 14, 132, 12.4),
  p("/guides/nevada-property-tax-abatement-resale-buyers", 4, 92, 12.3),
  p("/guides/las-vegas-starter-home-prices-2026", 9, 124, 7.6),
  p("/guides/las-vegas-down-payment-assistance-programs-2026", 5, 72, 8.9),
  p("/guides/henderson-vs-southwest-las-vegas", 1, 28, 19.4),
  p("/neighborhoods/henderson/four-seasons-private-residences", 2, 33, 6.4),
  p("/guides/first-summer-in-vegas", 3, 39, 13.0),
  p("/", 10, 58, 6.8),
];

const previousPages = [
  p("/guides/summerlin-vs-henderson", 15, 214, 9.8),
  p("/neighborhoods/summerlin", 16, 212, 11.1),
  p("/guides/what-500k-buys-in-las-vegas", 3, 206, 9.3),
  p("/guides/will-las-vegas-home-prices-drop", 30, 262, 6.9),
  p("/neighborhoods/henderson", 8, 165, 11.2),
  p("/neighborhoods/southwest-las-vegas", 4, 61, 16.8),
  p("/guides/nevada-property-tax-abatement-resale-buyers", 3, 86, 12.9),
  p("/guides/las-vegas-starter-home-prices-2026", 8, 115, 8.0),
  p("/guides/las-vegas-down-payment-assistance-programs-2026", 4, 68, 9.2),
  p("/guides/henderson-vs-southwest-las-vegas", 1, 24, 20.1),
  p("/neighborhoods/henderson/four-seasons-private-residences", 1, 26, 7.0),
  p("/guides/first-summer-in-vegas", 4, 46, 12.3),
  p("/", 9, 51, 7.2),
];

const currentPairs = [
  qp("summerlin vs henderson", "/guides/summerlin-vs-henderson", 14, 150, 8.2),
  // Second URL on the same intent — the cannibalization case.
  qp("summerlin vs henderson", "/neighborhoods/summerlin", 0, 30, 14.6),
  qp("what 500k buys in las vegas", "/guides/what-500k-buys-in-las-vegas", 1, 210, 8.5),
  qp("las vegas starter home prices", "/guides/las-vegas-starter-home-prices-2026", 9, 120, 7.4),
  qp("will las vegas home prices drop", "/guides/will-las-vegas-home-prices-drop", 11, 145, 9.1),
  qp("henderson nv neighborhoods", "/neighborhoods/henderson", 6, 88, 7.8),
  qp("summerlin las vegas", "/neighborhoods/summerlin", 12, 165, 9.6),
  qp("las vegas down payment assistance", "/guides/las-vegas-down-payment-assistance-programs-2026", 5, 70, 8.9),
  qp("moving to las vegas from california 2026", "/", 3, 95, 15.4),
  // Ranking page is only adjacent to the question — the content-gap case.
  qp("rent first or buy when moving to las vegas", "/guides/what-500k-buys-in-las-vegas", 0, 62, 34.2),
  // Google ranks the neighborhood pillar; a dedicated comparison guide exists.
  qp("henderson vs southwest las vegas", "/neighborhoods/henderson", 2, 74, 11.8),
  qp("new construction vs resale las vegas", "/guides/las-vegas-new-home-sales-july-2026", 1, 58, 22.6),
  qp("commute from summerlin to the strip", "/neighborhoods/summerlin", 2, 41, 17.9),
  qp("nevada property tax abatement", "/guides/nevada-property-tax-abatement-resale-buyers", 4, 90, 12.3),
  qp("southwest las vegas neighborhood", "/neighborhoods/southwest-las-vegas", 5, 66, 10.9),
  qp("first summer in las vegas heat", "/guides/first-summer-in-vegas", 3, 37, 13.1),
  qp("four seasons private residences las vegas", "/neighborhoods/henderson/four-seasons-private-residences", 2, 31, 6.2),
  qp("lvinit", "/", 8, 22, 1.4),
  qp("best family neighborhoods in las vegas", "/neighborhoods/summerlin", 3, 130, 18.2),
  qp("safest neighborhoods in henderson nv", "/neighborhoods/henderson", 1, 96, 21.5),
  qp("las vegas casino jobs", "/", 0, 44, 41.0),
];

const previousPairs = [
  qp("summerlin vs henderson", "/guides/summerlin-vs-henderson", 11, 134, 9.4),
  qp("summerlin vs henderson", "/neighborhoods/summerlin", 0, 24, 16.2),
  qp("what 500k buys in las vegas", "/guides/what-500k-buys-in-las-vegas", 2, 188, 8.9),
  qp("las vegas starter home prices", "/guides/las-vegas-starter-home-prices-2026", 8, 111, 7.9),
  qp("will las vegas home prices drop", "/guides/will-las-vegas-home-prices-drop", 26, 240, 6.8),
  qp("henderson nv neighborhoods", "/neighborhoods/henderson", 5, 81, 8.1),
  qp("summerlin las vegas", "/neighborhoods/summerlin", 13, 171, 9.2),
  qp("las vegas down payment assistance", "/guides/las-vegas-down-payment-assistance-programs-2026", 4, 66, 9.2),
  qp("moving to las vegas from california 2026", "/", 0, 1, 41.0),
  qp("rent first or buy when moving to las vegas", "/guides/what-500k-buys-in-las-vegas", 0, 18, 38.5),
  qp("henderson vs southwest las vegas", "/neighborhoods/henderson", 1, 52, 13.6),
  qp("new construction vs resale las vegas", "/guides/las-vegas-new-home-sales-july-2026", 0, 12, 27.4),
  qp("commute from summerlin to the strip", "/neighborhoods/summerlin", 1, 33, 19.2),
  qp("nevada property tax abatement", "/guides/nevada-property-tax-abatement-resale-buyers", 3, 84, 12.9),
  qp("southwest las vegas neighborhood", "/neighborhoods/southwest-las-vegas", 2, 31, 15.8),
  qp("first summer in las vegas heat", "/guides/first-summer-in-vegas", 4, 44, 12.4),
  qp("four seasons private residences las vegas", "/neighborhoods/henderson/four-seasons-private-residences", 1, 24, 7.1),
  qp("lvinit", "/", 6, 17, 1.5),
  qp("best family neighborhoods in las vegas", "/neighborhoods/summerlin", 2, 118, 19.0),
  qp("safest neighborhoods in henderson nv", "/neighborhoods/henderson", 1, 88, 22.1),
  qp("las vegas casino jobs", "/", 0, 39, 42.2),
];

/**
 * The full fixture dataset, in raw Search Console row shape.
 * `__fixture` is checked by the runner so a fixture run can never be mistaken
 * for a live one.
 */
export const FIXTURE_DATASET = {
  __fixture: true,
  label: "SYNTHETIC TEST DATA — invented for LVINIT GSC agent development. Not real Search Console data.",
  origin: ORIGIN,
  current: { queries: currentQueries, pages: currentPages, pairs: currentPairs },
  previous: { queries: previousQueries, pages: previousPages, pairs: previousPairs },
};

/**
 * An intentionally near-empty dataset, for exercising the low-volume and
 * "nothing to report" paths.
 */
export const FIXTURE_EMPTY_DATASET = {
  __fixture: true,
  label: "SYNTHETIC EMPTY DATASET — no search data at all.",
  origin: ORIGIN,
  current: { queries: [], pages: [], pairs: [] },
  previous: { queries: [], pages: [], pairs: [] },
};

/**
 * A tiny dataset: a handful of impressions, well under every threshold. Used to
 * prove the agent says "too little data" rather than inventing a finding.
 */
export const FIXTURE_LOW_VOLUME_DATASET = {
  __fixture: true,
  label: "SYNTHETIC LOW-VOLUME DATASET — a young site with almost no data yet.",
  origin: ORIGIN,
  current: {
    queries: [q("summerlin las vegas", 1, 9, 18.4), q("henderson nv", 0, 4, 27.1)],
    pages: [p("/neighborhoods/summerlin", 1, 9, 18.4), p("/neighborhoods/henderson", 0, 4, 27.1)],
    pairs: [
      qp("summerlin las vegas", "/neighborhoods/summerlin", 1, 9, 18.4),
      qp("henderson nv", "/neighborhoods/henderson", 0, 4, 27.1),
    ],
  },
  previous: {
    queries: [q("summerlin las vegas", 0, 6, 22.0)],
    pages: [p("/neighborhoods/summerlin", 0, 6, 22.0)],
    pairs: [qp("summerlin las vegas", "/neighborhoods/summerlin", 0, 6, 22.0)],
  },
};

/**
 * A dataset containing deliberate duplicate keys across paginated batches, to
 * prove rows are merged rather than double-counted.
 */
export const FIXTURE_DUPLICATE_DATASET = {
  __fixture: true,
  label: "SYNTHETIC DUPLICATE-ROW DATASET — the same key returned twice.",
  origin: ORIGIN,
  current: {
    queries: [q("summerlin vs henderson", 6, 100, 8.0), q("summerlin vs henderson", 4, 100, 12.0)],
    pages: [p("/guides/summerlin-vs-henderson", 6, 100, 8.0), p("/guides/summerlin-vs-henderson", 4, 100, 12.0)],
    pairs: [qp("summerlin vs henderson", "/guides/summerlin-vs-henderson", 10, 200, 10.0)],
  },
  previous: { queries: [], pages: [], pairs: [] },
};
