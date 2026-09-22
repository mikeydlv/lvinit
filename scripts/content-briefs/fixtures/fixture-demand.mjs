// ---------------------------------------------------------------------------
// ⚠️  FIXTURE DATA — SYNTHETIC. NOT LVINIT'S REAL SEARCH CONSOLE DATA.  ⚠️
//
// Every number here was INVENTED to exercise the Brief Generator end to end
// before real query rows exist. None of it describes LVINIT's search
// performance, and a fixture run can never hand anything to the Publisher.
//
// It reuses the GSC agent's own synthetic dataset and adds rows that exercise
// this agent specifically:
//
//   grouping          four phrasings of Summerlin vs Southwest -> one intent
//   substantial       ...which the three-way comparison already mostly covers
//   duplicate         "monument hills las vegas" -> a page that answers it
//   new content       "new build incentives las vegas"
//   objective housing "single family homes henderson" -> allowed
//   generic           "best places to live in las vegas" -> rejected
//   Fair Housing      the GSC fixture's "best family…" / "safest…" -> excluded
//
// The report is built by the REAL GSC pipeline (analyze + buildJsonReport)
// against the REAL site inventory, so the fixture exercises the actual
// schema-1.1.0 contract rather than a hand-written imitation of it.
// ---------------------------------------------------------------------------

import { FIXTURE_DATASET } from "../../gsc/fixtures/fixture-dataset.mjs";
import { analyze as gscAnalyze } from "../../gsc/lib/analyze.mjs";
import { buildJsonReport as gscJson } from "../../gsc/lib/report.mjs";
import { buildSiteInventory } from "../../gsc/lib/site-inventory.mjs";
import { normalizeRows } from "../../gsc/lib/client.mjs";
import { buildWindows } from "../../gsc/lib/windows.mjs";
import { loadConfig as loadGscConfig } from "../../gsc/config.mjs";

const ORIGIN = "https://www.lvinit.com";
const q = (query, clicks, impressions, position) => ({ keys: [query], clicks, impressions, ctr: impressions ? Number((clicks / impressions).toFixed(4)) : 0, position });
const qp = (query, route, clicks, impressions, position) => ({ keys: [query, `${ORIGIN}${route}`], clicks, impressions, ctr: impressions ? Number((clicks / impressions).toFixed(4)) : 0, position });

export const EXTRA_CURRENT_QUERIES = [
  q("summerlin vs southwest", 0, 22, 14.1),
  q("southwest vs summerlin", 0, 9, 16.0),
  q("is southwest cheaper than summerlin", 0, 14, 18.3),
  q("summerlin or southwest las vegas", 1, 11, 12.9),
  q("new build incentives las vegas", 0, 48, 19.5),
  q("builder incentives las vegas", 0, 17, 22.0),
  q("monument hills las vegas", 2, 30, 3.1),
  q("single family homes henderson", 0, 26, 24.0),
  q("best places to live in las vegas", 0, 60, 38.0),
];

export const EXTRA_PREVIOUS_QUERIES = [
  q("summerlin vs southwest", 0, 6, 20.2),
  q("new build incentives las vegas", 0, 20, 24.0),
];

export const EXTRA_CURRENT_PAIRS = [
  qp("summerlin vs southwest", "/guides/summerlin-vs-henderson-vs-southwest-las-vegas", 0, 22, 14.1),
  qp("southwest vs summerlin", "/guides/summerlin-vs-henderson-vs-southwest-las-vegas", 0, 9, 16.0),
  qp("is southwest cheaper than summerlin", "/neighborhoods/southwest-las-vegas", 0, 14, 18.3),
  qp("summerlin or southwest las vegas", "/guides/summerlin-vs-henderson-vs-southwest-las-vegas", 1, 11, 12.9),
  qp("new build incentives las vegas", "/guides/new-build-vs-resale-las-vegas", 0, 48, 19.5),
  qp("builder incentives las vegas", "/guides/las-vegas-new-home-sales-july-2026", 0, 17, 22.0),
  qp("monument hills las vegas", "/guides/monument-hills-northwest-las-vegas", 2, 30, 3.1),
  qp("single family homes henderson", "/neighborhoods/henderson", 0, 26, 24.0),
  qp("best places to live in las vegas", "/", 0, 60, 38.0),
];

/** The GSC fixture dataset plus this agent's extra rows. Raw-row shaped. */
export function fixtureDataset() {
  const d = FIXTURE_DATASET;
  return {
    current: { queries: [...d.current.queries, ...EXTRA_CURRENT_QUERIES], pages: d.current.pages, pairs: [...d.current.pairs, ...EXTRA_CURRENT_PAIRS] },
    previous: { queries: [...d.previous.queries, ...EXTRA_PREVIOUS_QUERIES], pages: d.previous.pages, pairs: d.previous.pairs },
  };
}

/**
 * Build a schema-1.1.0 GSC report from the fixture dataset, in memory, with the
 * real GSC pipeline. Stamped fixtureData: true.
 */
export function buildFixtureGscReport({ repoRoot, today }) {
  const config = loadGscConfig();
  const windows = buildWindows({ periodDays: config.windows.periodDays, lagDays: config.windows.lagDays, comparisonDays: config.windows.comparisonDays, today });
  const dataset = fixtureDataset();
  const norm = (w) => ({ queries: normalizeRows(w.queries, ["query"]), pages: normalizeRows(w.pages, ["page"]), pairs: normalizeRows(w.pairs, ["query", "page"]) });
  const data = { current: norm(dataset.current), previous: norm(dataset.previous) };
  const inventory = buildSiteInventory({ repoRoot, origin: ORIGIN });
  const analysis = gscAnalyze({ data, inventory, config, reportDate: windows.today, windows });
  return gscJson({ analysis, config, meta: { reportDate: windows.today, dataSource: "fixture", property: "fixture" }, data });
}
