// ---------------------------------------------------------------------------
// COLLECTION — Development Watch's own sources, on top of the shared pass
//
// The Local Trend Agent already reads the shared feeds and ~40 Google News
// searches every morning; Development Watch reuses that collection instead of
// polling the same URLs again. This module reads only what the trend agent
// does not:
//
//   rss / wp-json   developer and project channels, with conditional GETs
//                   (ETag / Last-Modified) and per-source cadence
//   legistar        Clark County Commission / Planning / Zoning agendas, one
//                   request per meeting, skipped when the meeting record has
//                   not changed since the last run
//   google-news     development-specific searches, plus a rotating query for
//                   each tracked project that is not finished yet
//   manual          never fetched — reported as SOURCE_CHECK_REQUIRED
//
// A failing source is recorded and the run continues. Nothing is invented
// for a source that could not be read.
// ---------------------------------------------------------------------------

import { parseFeed, cleanGoogleNewsItem, googleNewsUrl, stripHtml, decodeEntities } from "../../lib/feeds.mjs";
import { sourcesFor } from "../../sources.mjs";
import { DEV_QUERIES, VALLEY_PLANNING_AREAS, OUTLYING_PLANNING_AREAS, PLANNING_AREA_TO_AREA } from "../config.mjs";
import { extractUnits, extractAcres } from "./detect.mjs";
import { legistarApplicant, legistarPlanningArea } from "./entity.mjs";
import { aliasRegex } from "./coverage.mjs";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function hostOf(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

/** GET with timeout and optional conditional headers. Never throws. */
export async function fetchConditional(url, { fetchImpl = fetch, config, etag = null, lastModified = null, accept = "application/rss+xml, application/xml, application/json, text/xml, */*;q=0.5" }) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), config.sources.timeoutMs);
  const headers = { "User-Agent": config.sources.userAgent, Accept: accept };
  if (etag) headers["If-None-Match"] = etag;
  if (lastModified) headers["If-Modified-Since"] = lastModified;
  try {
    const res = await fetchImpl(url, { headers, redirect: "follow", signal: controller.signal });
    const h = (k) => (typeof res.headers?.get === "function" ? res.headers.get(k) : null);
    if (res.status === 304) return { ok: true, notModified: true, status: 304, text: "", etag, lastModified };
    const text = await res.text();
    return { ok: res.ok, status: res.status, text, etag: h("etag"), lastModified: h("last-modified") };
  } catch (error) {
    return { ok: false, status: 0, text: "", error: error.name === "AbortError" ? "timeout" : String(error.message ?? error) };
  } finally {
    clearTimeout(timer);
  }
}

/** Weekly sources are polled once a week; daily ones every run. */
export function isDue(source, sourcesState, today) {
  if (source.cadence !== "weekly") return true;
  const last = sourcesState.sources?.[source.id]?.last_success;
  if (!last) return true;
  return (Date.parse(today) - Date.parse(last)) / 86_400_000 >= 6;
}

// --- Clark County Legistar ---------------------------------------------------

function isoDay(today, deltaDays) {
  return new Date(Date.parse(`${today}T12:00:00Z`) + deltaDays * 86_400_000).toISOString().slice(0, 10);
}

const ENTITLEMENT = /\b(ZONE CHANGES?|TENTATIVE MAP|PLANNED UNIT DEVELOPMENT|PLAN AMENDMENT|DEVELOPMENT AGREEMENT|USE PERMITS? for (a |the )?(proposed )?(resort|mixed-use|hotel)|MAJOR PROJECT|SPECIFIC PLAN)\b/i;

const LEAD_ORDER = ["TM", "PUD", "ZC", "PA", "ORD", "UC", "DR", "WS", "VS", "ET", "SDR"];

function summarize(titles) {
  const all = titles.join(" ");
  const u = extractUnits(all);
  const acres = extractAcres(all);
  let kind = "land use change";
  if (/multi-?family|apartment/i.test(all)) kind = "multi-family development";
  else if (/single-family|single family|residential lots/i.test(all)) kind = "single-family subdivision";
  else if (/mixed[- ]use/i.test(all)) kind = "mixed-use development";
  else if (/resort hotel|gaming enterprise/i.test(all)) kind = "resort hotel";
  else if (/shopping center|retail|commercial/i.test(all)) kind = "commercial development";
  else if (/industrial|warehouse|distribution/i.test(all)) kind = "industrial development";
  const size = u.units ? `${u.units.toLocaleString("en-US")}-unit/lot` : acres ? `${acres}-acre` : "";
  return { summary: `${size ? `${size} ` : ""}${kind}`.trim(), units: u.units, acres, kind };
}

/**
 * Materiality gate for one applicant's bundle of agenda items. Almost every
 * agenda item is a driveway waiver or a sign review; only a few are the
 * kind of change that could alter a neighborhood.
 */
export function agendaMaterial(bundleTitles, { config, knownEntities }) {
  const all = bundleTitles.join(" ");
  const { units, acres, kind } = summarize(bundleTitles);
  const area = legistarPlanningArea(bundleTitles.find((t) => /within /.test(t)) ?? all);
  if (area && OUTLYING_PLANNING_AREAS.some((a) => area.startsWith(a))) return { material: false, reason: `outside the valley (${area})` };
  if (/\b(mining|extraction|gravel pit|rock crushing|communication tower|cell tower|billboard|sign design review)\b/i.test(all) && !units) return { material: false, reason: "routine or industrial-extraction item" };
  const tracked = (knownEntities ?? []).find((e) => (e.aliases ?? []).some((a) => a.length >= 6 && aliasRegex(a).test(all)));
  if (tracked) return { material: true, reason: `names tracked project ${tracked.name}`, area, units, acres, kind };
  const g = config.gate;
  // Size alone is not enough: a design review on a big parcel is routine. It
  // takes an entitlement action — a zone change, tentative map, PUD, plan
  // amendment, development agreement, or a use permit for a resort/mixed use.
  if (!ENTITLEMENT.test(all)) return { material: false, reason: "no entitlement action (design review, waiver, extension or sign item)" };
  if (units && units >= g.agendaMinUnits) return { material: true, reason: `${units} units/lots`, area, units, acres, kind };
  if (acres && acres >= g.agendaMinAcres && /residential|mixed-use|commercial|resort/.test(kind)) return { material: true, reason: `${acres} acres (${kind})`, area, units, acres, kind };
  return { material: false, reason: "below the materiality threshold (routine agenda item)" };
}

export async function collectLegistar(source, { config, sourcesState, today, fetchImpl, delay, knownEntities }) {
  const { client, bodies, lookbackDays, lookaheadDays } = source.legistar;
  const base = `https://webapi.legistar.com/v1/${client}`;
  const filter = `EventDate ge datetime'${isoDay(today, -lookbackDays)}' and EventDate le datetime'${isoDay(today, lookaheadDays)}'`;
  const res = await fetchConditional(`${base}/events?$filter=${encodeURIComponent(filter)}&$orderby=EventDate`, { fetchImpl, config, accept: "application/json" });
  const health = { id: source.id, name: source.name, authority: source.authority, method: "legistar" };
  if (!res.ok) return { items: [], health: { ...health, ok: false, status: res.status, error: res.error ?? `HTTP ${res.status}` }, versions: {}, suppressed: [] };
  let events;
  try {
    events = JSON.parse(res.text);
  } catch {
    return { items: [], health: { ...health, ok: false, status: res.status, error: "malformed JSON from the agenda API" }, versions: {}, suppressed: [] };
  }
  const seenVersions = sourcesState.legistar?.events ?? {};
  const versions = {};
  const items = [];
  const suppressed = [];
  let meetingsRead = 0;
  let meetingsUnchanged = 0;
  for (const ev of events.filter((e) => bodies.includes(e.EventBodyId))) {
    const version = ev.EventLastModifiedUtc ?? ev.EventRowVersion ?? "";
    versions[ev.EventId] = version;
    if (seenVersions[ev.EventId] && seenVersions[ev.EventId] === version) {
      meetingsUnchanged += 1;
      continue;
    }
    await delay(config.sources.politeDelayMs);
    const r = await fetchConditional(`${base}/events/${ev.EventId}/eventitems`, { fetchImpl, config, accept: "application/json" });
    if (!r.ok) {
      delete versions[ev.EventId]; // retry next run
      continue;
    }
    let rows;
    try {
      rows = JSON.parse(r.text);
    } catch {
      delete versions[ev.EventId];
      continue;
    }
    meetingsRead += 1;
    const date = String(ev.EventDate ?? "").slice(0, 10);
    const past = date < today;
    const bundles = new Map();
    for (const row of rows) {
      const title = String(row.EventItemTitle ?? "").replace(/\s+/g, " ").trim();
      const applicant = legistarApplicant(title);
      if (!applicant) continue;
      const b = bundles.get(applicant) ?? [];
      b.push({ ...row, title });
      bundles.set(applicant, b);
    }
    for (const [applicant, rowsForApplicant] of bundles) {
      const titles = rowsForApplicant.map((x) => x.title);
      const m = agendaMaterial(titles, { config, knownEntities });
      if (!m.material) {
        suppressed.push({ title: titles[0].slice(0, 160), reason: m.reason, meeting: `${ev.EventBodyName?.trim()} ${date}` });
        continue;
      }
      const lead = [...rowsForApplicant].sort((a, b) => LEAD_ORDER.indexOf(a.title.slice(0, a.title.indexOf("-"))) - LEAD_ORDER.indexOf(b.title.slice(0, b.title.indexOf("-"))))[0];
      const action = rowsForApplicant.map((x) => x.EventItemActionName).find(Boolean) ?? null;
      const passed = rowsForApplicant.map((x) => x.EventItemPassedFlagName).find(Boolean) ?? null;
      const actionText = action ? `${action}${passed ? ` (${passed})` : ""}` : past ? "no action recorded yet" : "scheduled for public hearing";
      const area = m.area ?? legistarPlanningArea(lead.title);
      items.push({
        title: lead.title,
        url: ev.EventInSiteURL || `https://clarkcountynv.gov/agendas#${ev.EventId}`,
        published: `${date}T12:00:00.000Z`,
        snippet: `Clark County ${String(ev.EventBodyName ?? "").trim()} agenda, ${date}: ${actionText}. Matter files: ${rowsForApplicant.map((x) => x.EventItemMatterFile || x.title.slice(0, x.title.indexOf(":"))).filter(Boolean).join(", ")}.`,
        sourceName: `Clark County ${String(ev.EventBodyName ?? "").trim()} (Legistar)`,
        sourceDomain: "clarkcountynv.gov",
        via: "legistar",
        tier: "official",
        authority: 2,
        // Outlying towns were dropped by the materiality gate; what is left is in the valley.
        valleyByConstruction: !area || VALLEY_PLANNING_AREAS.some((a) => area.startsWith(a)) || !OUTLYING_PLANNING_AREAS.some((a) => area.startsWith(a)),
        presetAreas: [PLANNING_AREA_TO_AREA[area] ?? "clark-county"],
        legistar: { applicant, planningArea: area, action: actionText, meeting: `${String(ev.EventBodyName ?? "").trim()} ${date}`, summary: m.summary ?? summarize(titles).summary, materiality: m.reason, files: rowsForApplicant.map((x) => x.EventItemMatterFile).filter(Boolean) },
      });
    }
  }
  return {
    items,
    versions,
    suppressed,
    health: { ...health, ok: true, status: 200, items: items.length, note: `${meetingsRead} meeting(s) read, ${meetingsUnchanged} unchanged since last run, ${suppressed.length} routine applicant bundle(s) suppressed` },
  };
}

// --- Feeds and WordPress ----------------------------------------------------

async function collectFeedLike(source, { config, sourcesState, fetchImpl }) {
  const prev = sourcesState.sources?.[source.id] ?? {};
  const res = await fetchConditional(source.url, { fetchImpl, config, etag: prev.etag, lastModified: prev.last_modified, accept: source.method === "wp-json" ? "application/json" : undefined });
  const health = { id: source.id, name: source.name, authority: source.authority, method: source.method, etag: res.etag ?? null, lastModified: res.lastModified ?? null };
  if (res.notModified) return { items: [], health: { ...health, ok: true, status: 304, items: 0, note: "not modified since last check" } };
  if (!res.ok) return { items: [], health: { ...health, ok: false, status: res.status, error: res.error ?? `HTTP ${res.status}` } };
  let parsed = [];
  if (source.method === "wp-json") {
    try {
      parsed = JSON.parse(res.text).map((p) => ({
        title: stripHtml(decodeEntities(p.title?.rendered ?? "")),
        url: p.link,
        published: p.date ? new Date(`${p.date}Z`).toISOString() : null,
        snippet: stripHtml(decodeEntities(p.excerpt?.rendered ?? "")).slice(0, 600),
      }));
    } catch {
      return { items: [], health: { ...health, ok: false, status: res.status, error: "malformed JSON" } };
    }
  } else {
    parsed = parseFeed(res.text);
    if (!parsed.length) return { items: [], health: { ...health, ok: false, status: res.status, error: "no items parsed (malformed or empty feed)" } };
  }
  const items = parsed.filter((p) => p.title && p.url).map((p) => ({ ...p, via: source.id, sourceName: source.name, sourceDomain: hostOf(p.url), tier: source.tier, authority: source.authority }));
  return { items, health: { ...health, ok: true, status: res.status, items: items.length } };
}

// --- Google News ------------------------------------------------------------

/** Tracked projects still worth a daily search, oldest-queried first. */
export function entityQueryPlan(entities, sourcesState, max) {
  const last = sourcesState.entityQueries ?? {};
  return entities
    .filter((e) => !e.provisional && e.origin !== "legistar" && !["open", "cancelled"].includes(e.currentStatus ?? e.baseline?.status))
    .map((e) => ({ e, alias: [...(e.aliases ?? [])].filter((a) => a.length >= 6).sort((a, b) => b.length - a.length)[0] }))
    .filter((x) => x.alias)
    .sort((a, b) => String(last[a.e.id] ?? "").localeCompare(String(last[b.e.id] ?? "")) || a.e.id.localeCompare(b.e.id))
    .slice(0, max);
}

async function collectGoogleDev(source, { config, fetchImpl, delay, plan }) {
  const trends = { ...config.trends, sources: { ...config.trends.sources, googleNews: { ...config.trends.sources.googleNews, window: config.sources.googleWindow } } };
  const queries = [...DEV_QUERIES.map((q) => ({ q, entityId: null })), ...plan.map((p) => ({ q: `"${p.alias}" (Las Vegas OR Henderson OR Nevada)`, entityId: p.e.id }))];
  const items = [];
  let ok = 0;
  const queried = [];
  for (const { q, entityId } of queries) {
    const res = await fetchConditional(googleNewsUrl(trends, q), { fetchImpl, config });
    if (res.ok) {
      ok += 1;
      if (entityId) queried.push(entityId);
      for (const raw of parseFeed(res.text)) {
        const it = cleanGoogleNewsItem(raw);
        items.push({ ...it, via: "google-news-dev", query: q, sourceDomain: hostOf(it.sourceUrl) });
      }
    }
    await delay(config.sources.politeDelayMs);
  }
  return {
    items,
    queried,
    health: { id: source.id, name: `${source.name} (${queries.length} queries: ${DEV_QUERIES.length} development + ${plan.length} tracked-project)`, authority: source.authority, method: "google-news", ok: ok > 0, status: ok === queries.length ? 200 : 207, items: items.length, error: ok === queries.length ? null : `${queries.length - ok} of ${queries.length} queries failed` },
  };
}

/**
 * Everything Development Watch reads beyond the shared trend collection.
 * @returns {{items, health, legistarVersions, entityQueried, suppressedAgenda}}
 */
export async function collectDevSources({ config, sourcesState, today, fetchImpl = fetch, delay = sleep, log = () => {}, knownEntities = [] }) {
  const items = [];
  const health = [];
  let legistarVersions = null;
  let entityQueried = [];
  let suppressedAgenda = [];
  for (const source of sourcesFor("development-watch")) {
    if (source.usedBy.includes("local-trends")) continue; // shared: already collected by the trend pass
    if (source.method === "manual") {
      health.push({ id: source.id, name: source.name, authority: source.authority, method: "manual", ok: false, manual: true, status: "SOURCE_CHECK_REQUIRED", error: source.notes });
      continue;
    }
    if (!isDue(source, sourcesState, today)) {
      health.push({ id: source.id, name: source.name, authority: source.authority, method: source.method, skipped: `${source.cadence} cadence — last success ${sourcesState.sources?.[source.id]?.last_success}` });
      continue;
    }
    if (source.method === "legistar") {
      const r = await collectLegistar(source, { config, sourcesState, today, fetchImpl, delay, knownEntities });
      items.push(...r.items);
      health.push(r.health);
      legistarVersions = r.versions;
      suppressedAgenda = r.suppressed;
    } else if (source.method === "google-news") {
      const plan = entityQueryPlan(knownEntities, sourcesState, config.sources.maxEntityQueries);
      const r = await collectGoogleDev(source, { config, fetchImpl, delay, plan });
      items.push(...r.items);
      health.push(r.health);
      entityQueried = r.queried;
    } else {
      const r = await collectFeedLike(source, { config, sourcesState, fetchImpl });
      items.push(...r.items);
      health.push(r.health);
    }
    const last = health.at(-1);
    log(`  devwatch ${source.id.padEnd(20)} ${last.ok ? `${last.items ?? 0} items${last.note ? ` (${last.note})` : ""}` : `FAILED (${last.error ?? last.status})`}`);
    await delay(config.sources.politeDelayMs);
  }
  return { items, health, legistarVersions, entityQueried, suppressedAgenda };
}
