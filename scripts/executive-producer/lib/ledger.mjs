// ---------------------------------------------------------------------------
// LEDGER — what Mikey has already published, scheduled, or been handed
//
// Duplicate checks read this. Sources, newest first:
//   1. earlier batches (every week folder keeps its week.json)
//   2. Mikey's own recent public posts (Apify, when configured)
//   3. an optional hand-kept `scheduled.json` in the Weekly Posts folder for
//      anything scheduled outside this system — never required
//   4. a seeded snapshot (ledger-seed.json) taken in a live session, so the
//      first unattended weeks aren't blind
// ---------------------------------------------------------------------------

import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";

import { tagsFor } from "./gate.mjs";

const readJson = (p) => {
  try {
    return JSON.parse(readFileSync(p, "utf8"));
  } catch {
    return null;
  }
};

export function previousWeeks(outRoot, currentWeekOf) {
  if (!existsSync(outRoot)) return [];
  return readdirSync(outRoot, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => readJson(join(outRoot, d.name, "week.json")))
    .filter((w) => w && w.weekOf && w.weekOf !== currentWeekOf)
    .sort((a, b) => b.weekOf.localeCompare(a.weekOf));
}

export function buildLedger({ outRoot, currentWeekOf, ownPosts = [], seedFile }) {
  const entries = [];
  for (const w of previousWeeks(outRoot, currentWeekOf)) {
    for (const p of w.posts ?? []) entries.push({ date: w.weekOf, source: "batch", text: `${p.title}. ${p.takeaway ?? ""}`, tags: p.topics });
  }
  for (const p of ownPosts) entries.push({ date: p.date, source: p.platform.toLowerCase(), text: p.text, url: p.url });
  const scheduled = readJson(join(outRoot, "scheduled.json"));
  for (const s of scheduled?.items ?? []) entries.push({ date: s.date, source: "scheduled", text: s.text ?? s.title, tags: s.tags });
  const seed = seedFile ? readJson(seedFile) : null;
  for (const s of seed?.items ?? []) entries.push({ date: s.date, source: s.source, text: s.text, url: s.url });
  return entries.map((e) => ({ ...e, tags: e.tags?.length ? e.tags : tagsFor(e.text) }));
}
