// ---------------------------------------------------------------------------
// LEDGER — what Mikey has drafted, approved, scheduled and published
//
// Four separate states. Only the last three count as history for duplicate
// checks; a generated batch is a DRAFT until something says otherwise.
//
//   draft       every post a batch generates (week folder status.json)
//   approved    Mikey sets it in status.json (optional)
//   scheduled   Mikey sets it in status.json, or lists it in scheduled.json
//   published   detected automatically: a post on Mikey's Instagram, TikTok or
//               YouTube whose caption/title matches a batch post, or any post
//               of his at all (it's history whether or not a batch made it)
//
// VISIBILITY GAP: posts scheduled inside Instagram/Meta Business Suite or
// TikTok are not visible publicly or through Apify. Unless they appear in
// status.json or scheduled.json, the system cannot know about them. Every
// run reports this.
// ---------------------------------------------------------------------------

import { readFileSync, readdirSync, existsSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import { tagsFor } from "./gate.mjs";

const readJson = (p) => {
  try {
    return JSON.parse(readFileSync(p, "utf8"));
  } catch {
    return null;
  }
};

export const STATUSES = ["draft", "approved", "scheduled", "published"];

export function weekFolders(outRoot) {
  if (!existsSync(outRoot)) return [];
  return readdirSync(outRoot, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => ({ dir: join(outRoot, d.name), week: readJson(join(outRoot, d.name, "week.json")), status: readJson(join(outRoot, d.name, "status.json")) }))
    .filter((w) => w.week?.weekOf);
}

export function previousWeeks(outRoot, currentWeekOf) {
  return weekFolders(outRoot)
    .map((w) => w.week)
    .filter((w) => w.weekOf !== currentWeekOf)
    .sort((a, b) => b.weekOf.localeCompare(a.weekOf));
}

/** status.json for a new batch: every post starts as a draft. */
export function initialStatus(week) {
  return { note: "Change a post to approved, scheduled or published if you like. Published is also detected automatically.", posts: Object.fromEntries(week.posts.map((p) => [p.day, { title: p.title, status: "draft" }])) };
}

// Words every LVINIT post shares; they say nothing about which post it is.
const GENERIC = new Set("las vegas lvinit nevada home homes house houses what your you this that with from here there about just like really".split(" "));
const words = (s) => new Set(String(s ?? "").toLowerCase().replace(/[^a-z0-9 ]+/g, " ").split(/\s+/).filter((w) => w.length > 3 && !GENERIC.has(w)));

/** Jaccard overlap of distinctive words (0–1). */
export function similarity(a, b) {
  const A = words(a);
  const B = words(b);
  if (A.size < 3 || B.size < 3) return 0;
  const inter = [...A].filter((w) => B.has(w)).length;
  return inter / new Set([...A, ...B]).size;
}

/**
 * Mark batch posts published when one of Mikey's own posts, dated on or after
 * that batch's week, matches the draft's caption opening or title closely.
 */
export function reconcilePublished(outRoot, ownPosts) {
  const changes = [];
  for (const w of weekFolders(outRoot)) {
    if (!w.status) continue;
    let dirty = false;
    for (const p of w.week.posts ?? []) {
      const s = w.status.posts?.[p.day];
      if (!s || s.status === "published") continue;
      const opening = String(p.caption ?? "").slice(0, 280);
      const hit = ownPosts.find((o) => !o.dateApprox && o.date >= w.week.weekOf && (similarity(o.text, opening) >= 0.45 || similarity(o.text, p.title) >= 0.6));
      if (hit) {
        s.status = "published";
        s.publishedUrl = hit.url;
        s.detected = new Date().toISOString().slice(0, 10);
        dirty = true;
        changes.push(`${w.week.weekOf} ${p.day} "${p.title}" → published (${hit.url})`);
      }
    }
    if (dirty) writeFileSync(join(w.dir, "status.json"), JSON.stringify(w.status, null, 2));
  }
  return changes;
}

/**
 * Ledger entries: { date, source, status, text, url?, tags }.
 * `ownPosts` come from the automatic refresh (Apify + YouTube).
 */
export function buildLedger({ outRoot, currentWeekOf, ownPosts = [], seedFile }) {
  const entries = [];
  for (const w of weekFolders(outRoot)) {
    if (w.week.weekOf === currentWeekOf) continue;
    for (const p of w.week.posts ?? []) {
      const status = w.status?.posts?.[p.day]?.status ?? "draft";
      entries.push({ date: w.week.weekOf, source: "batch", status, text: `${p.title}. ${p.takeaway ?? ""}`, tags: p.topics });
    }
  }
  for (const p of ownPosts) entries.push({ date: p.date, source: p.platform.toLowerCase(), status: "published", text: p.text, url: p.url });
  const scheduled = readJson(join(outRoot, "scheduled.json"));
  for (const s of scheduled?.items ?? []) entries.push({ date: s.date, source: "scheduled", status: "scheduled", text: s.text ?? s.title, tags: s.tags });
  // The live-session snapshot fills in only for platforms the automatic
  // refresh didn't cover this run (e.g. Instagram until Apify is configured).
  const covered = new Set(ownPosts.map((p) => p.platform.toLowerCase()));
  const seed = seedFile ? readJson(seedFile) : null;
  for (const s of seed?.items ?? []) {
    if (!covered.has(String(s.source).toLowerCase())) entries.push({ date: s.date, source: s.source, status: "published", text: s.text, url: s.url });
  }
  return entries.map((e) => ({ ...e, tags: e.tags?.length ? e.tags : tagsFor(e.text) }));
}

// --- YouTube refresh (public channel pages; no key needed) ------------------------

const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36";

function walk(o, k, out = []) {
  if (o && typeof o === "object") {
    if (o[k]) out.push(o[k]);
    for (const v of Object.values(o)) walk(v, k, out);
  }
  return out;
}

/** "3 days ago" → a date. Returns null when it can't tell. */
export function approxDate(rel, today) {
  const m = String(rel ?? "").match(/(\d+)\s+(minute|hour|day|week|month|year)/);
  if (!m) return null;
  const days = { minute: 0, hour: 0, day: 1, week: 7, month: 30, year: 365 }[m[2]] * Number(m[1]);
  return new Date(Date.parse(today) - days * 86_400_000).toISOString().slice(0, 10);
}

export async function youtubeRecent(channelId, today, { fetchImpl = fetch } = {}) {
  const out = [];
  for (const tab of ["videos", "shorts"]) {
    const html = await (await fetchImpl(`https://www.youtube.com/channel/${channelId}/${tab}`, { headers: { "user-agent": UA, "accept-language": "en-US" } })).text();
    const m = html.match(/var ytInitialData = (\{.*?\});<\/script>/s);
    if (!m) throw new Error(`YouTube ${tab} page had no data`);
    const d = JSON.parse(m[1]);
    for (const v of walk(d, "videoRenderer")) {
      out.push({ platform: "YouTube", url: `https://www.youtube.com/watch?v=${v.videoId}`, text: v.title?.runs?.[0]?.text ?? "", date: approxDate(v.publishedTimeText?.simpleText, today), dateApprox: true });
    }
    for (const v of walk(d, "shortsLockupViewModel")) {
      const id = v.onTap?.innertubeCommand?.reelWatchEndpoint?.videoId;
      // The Shorts tab shows no dates; newest first. Treat as recent.
      if (id) out.push({ platform: "YouTube", url: `https://www.youtube.com/shorts/${id}`, text: v.overlayMetadata?.primaryText?.content ?? "", date: today, dateApprox: true });
    }
  }
  return out.slice(0, 40);
}
