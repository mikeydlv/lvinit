// ---------------------------------------------------------------------------
// REPORTS — the daily trend report and the weekly summary
//
//   reports/social-trends/YYYY-MM-DD-local-trends.md    daily, human
//   reports/social-trends/YYYY-MM-DD-local-trends.json  daily, machine (feeds
//                                                       the weekly summary and
//                                                       any future agent)
//   reports/social-trends/weekly.md                     latest weekly summary
//   reports/social-trends/weekly/YYYY-MM-DD-weekly.md   weekly archive
//
// The layout follows Mikey's brief section for section. An empty section says
// so plainly instead of being padded: a quiet day is a real answer.
// ---------------------------------------------------------------------------

import { PRIORITY_LABEL } from "./score.mjs";
import { NOT_A_PROJECT } from "./status.mjs";
import { titleSimilarity } from "./classify.mjs";

const dash = (s) => (s && String(s).trim() ? String(s).trim() : "—");

function sourceLines(t) {
  const lines = [];
  for (const s of t.sources ?? []) {
    lines.push(`- ${s.sourceName} — "${s.title}"`);
    lines.push(`  - ${s.url}`);
    lines.push(`  - Published: ${s.published ?? "date not given"}${s.tier === "official" ? " · official source" : ""}`);
  }
  for (const s of t.signals ?? []) {
    lines.push(`- ${s.sourceName} (demand signal only, not a fact source) — "${s.title}"`);
    lines.push(`  - ${s.url}`);
  }
  return lines.length ? lines : ["- (no sources)"];
}

function statusBlock(t) {
  if (t.status === NOT_A_PROJECT) return [t.kind === "question" ? "Not a development — audience question" : "Not a development — trend"];
  const out = [t.status];
  if (t.statusEvidence) out.push(`> Evidence: "${t.statusEvidence}"${t.statusEvidenceUrl ? ` — ${t.statusEvidenceUrl}` : ""}`);
  else out.push("> No source text confirms a status. Treat as unconfirmed — verify before saying anything on camera.");
  if (t.statusNote) out.push(`> Checked: ${t.statusNote}`);
  return out;
}

function fieldShootBlock(fs) {
  if (!fs.recommended) return ["No", "", "FIELD SHOOT IDEA:", "No shoot needed — this works without new footage."];
  const lines = ["Yes", "", "FIELD SHOOT IDEA:"];
  if (fs.locationType) lines.push(`- Location: ${fs.locationType}`);
  if (fs.shots.length) lines.push(`- Shots: ${fs.shots.join("; ")}`);
  if (fs.drone) lines.push(`- Drone: ${fs.drone}`);
  if (fs.aRoll) lines.push(`- A-roll vs voiceover: ${fs.aRoll}`);
  if (fs.urgency) lines.push(`- Urgency: ${fs.urgency}`);
  return lines;
}

function existingBlock(t) {
  const lines = (t.existingContent ?? []).map((e) => `- ${e.route} — ${e.action}${e.note ? `: ${e.note}` : ""}`);
  if (t.contentCreated?.length) lines.push(`- Already made from this topic: ${t.contentCreated.join("; ")}`);
  return lines.length ? lines : ["- Nothing yet — this would be new ground for LVINIT."];
}

export function topicBlock(t, n) {
  const lines = [];
  lines.push(`### ${n}. ${t.name}`);
  lines.push("");
  lines.push(`Score: ${t.total}/40${t.capped ? ` (scores as ${t.band}; held at ${t.priority} — ${t.capped})` : ""}`);
  if (t.surfaceReasons?.length && !t.surfaceReasons.includes("new")) lines.push(`Back on the list because: ${t.surfaceReasons.join("; ")}`);
  lines.push(`Area: ${dash(t.area)} · Category: ${dash(t.category)}`);
  lines.push("");
  lines.push("STATUS:");
  lines.push(...statusBlock(t));
  lines.push("");
  lines.push("WHY IT MATTERS:");
  lines.push(dash(t.whyItMatters));
  lines.push("");
  lines.push("WHY PEOPLE WILL CARE:");
  lines.push(dash(t.whyPeopleCare));
  lines.push("");
  lines.push("BEST HOOK:");
  lines.push(dash(t.hook));
  lines.push("");
  lines.push("BEST FORMAT:");
  lines.push(dash(t.bestFormat));
  lines.push("");
  lines.push("SECONDARY FORMAT:");
  lines.push(t.secondaryFormats?.length ? t.secondaryFormats.join(", ") : "—");
  if (t.flywheel?.length) {
    lines.push("");
    lines.push("CONTENT FLYWHEEL:");
    t.flywheel.forEach((f, i) => lines.push(`${i + 1}. ${f}`));
  }
  lines.push("");
  lines.push("FIELD SHOOT:");
  lines.push(...fieldShootBlock(t.fieldShoot));
  lines.push("");
  lines.push("ARTICLE OPPORTUNITY:");
  lines.push(dash(t.articleOpportunity));
  lines.push("");
  lines.push("EXISTING LVINIT CONTENT TO CONNECT:");
  lines.push(...existingBlock(t));
  if (t.missingConfirmation || t.promotionTrigger) {
    lines.push("");
    if (t.missingConfirmation) lines.push(`STILL UNCONFIRMED: ${t.missingConfirmation}`);
    if (t.promotionTrigger) lines.push(`WHAT WOULD MAKE IT STRONGER: ${t.promotionTrigger}`);
  }
  lines.push("");
  lines.push("SOURCES:");
  lines.push(...sourceLines(t));
  return lines.join("\n");
}

function watchBlock(t, n) {
  const lines = [];
  lines.push(`### ${n}. ${t.name}`);
  lines.push("");
  lines.push(`Score: ${t.total}/40 · ${t.status === NOT_A_PROJECT ? "not a development" : t.status} · ${dash(t.area)}`);
  lines.push("");
  lines.push(`- What changed: ${t.surfaceReasons?.includes("new") ? "First time on the watchlist." : ""}${t.whatChanged || t.surfaceReasons?.filter((r) => r !== "new").join("; ") || ""}`.replace(/: $/, ": —"));
  lines.push(`- Why it's worth watching: ${dash(t.whyItMatters)}`);
  lines.push(`- Confirmation missing: ${dash(t.missingConfirmation || (t.statusEvidence ? "" : "Status not confirmed by any source text."))}`);
  lines.push(`- Would move to P1/P2 when: ${dash(t.promotionTrigger)}`);
  lines.push(`- Sources: ${(t.sources ?? []).map((s) => `${s.sourceName} (${s.published ?? "undated"}) ${s.url}`).join(" · ") || "—"}`);
  return lines.join("\n");
}

export function buildDailyMarkdown(run) {
  const { today, mode, topics, rejected, filtered, quiet, health, warnings, usage, counts } = run;
  const surfaced = topics.filter((t) => t.surface);
  const p1 = surfaced.filter((t) => t.priority === "P1").sort((a, b) => b.total - a.total);
  const p2 = surfaced.filter((t) => t.priority === "P2").sort((a, b) => b.total - a.total);
  const p3 = surfaced.filter((t) => t.priority === "P3").sort((a, b) => b.total - a.total);
  const ignored = topics.filter((t) => t.priority === "IGNORE");

  const L = [];
  L.push("# LVINIT Local Trend Report");
  L.push(`DATE: ${today}`);
  L.push("");
  L.push(`_${counts.read} stories read from ${counts.sourcesOk} source${counts.sourcesOk === 1 ? "" : "s"} · ${counts.fresh} new since last run · ${counts.judged} judged · ${surfaced.length} surfaced · ${counts.alreadyReviewed} already reviewed on earlier days (skipped)._`);
  L.push(mode === "claude" ? `_Judgment: Claude (${run.model}). Every status below was re-checked against the source text in code._` : `_Judgment: **RULES-ONLY MODE** — ${run.modeReason}. Hooks and angles are not written in this mode, and nothing is marked CREATE NOW._`);
  if (run.fixture) L.push("_**FIXTURE RUN — synthetic stories, not real news.**_");
  L.push("");
  L.push("Discovery only. Nothing here has been published, posted, or sent to anyone. Check every fact against its source before it goes on camera or on the site.");
  L.push("");

  L.push("## 🔥 CREATE NOW");
  L.push("");
  if (!p1.length) L.push("Nothing cleared 34/40 today. That's a real answer — no need to force content from thin news.");
  p1.forEach((t, i) => L.push(topicBlock(t, i + 1), ""));
  L.push("");
  L.push("---");
  L.push("");
  L.push("## 🟡 STRONG OPPORTUNITIES");
  L.push("");
  if (!p2.length) L.push("None today.");
  p2.forEach((t, i) => L.push(topicBlock(t, i + 1), ""));
  L.push("");
  L.push("---");
  L.push("");
  L.push("## 👀 WATCH LIST");
  L.push("");
  L.push("Worth monitoring, not worth publishing yet.");
  L.push("");
  if (!p3.length) L.push("Nothing new to watch today.");
  p3.forEach((t, i) => L.push(watchBlock(t, i + 1), ""));
  L.push("");
  L.push("---");
  L.push("");
  L.push("## ❌ SKIPPED NOISE");
  L.push("");
  L.push("Reviewed and rejected. These are remembered and won't be analyzed again.");
  L.push("");
  const noiseLines = [];
  for (const r of rejected) noiseLines.push(`- **${r.title}** (${r.sourceName}) — ${r.reason}${r.note ? `. ${r.note}` : ""}`);
  for (const t of ignored) noiseLines.push(`- **${t.name}** — scored ${t.total}/40, below the 22 bar${t.whyItMatters && !t.whyItMatters.startsWith("Rules-only") ? `. ${t.whyItMatters.split(/(?<=\.)\s/)[0]}` : ""}`);
  if (noiseLines.length) L.push(...noiseLines);
  else L.push("- No judged stories were rejected today.");
  L.push("");
  const byReason = new Map();
  for (const f of filtered) byReason.set(f.reason, [...(byReason.get(f.reason) ?? []), f]);
  if (byReason.size) {
    L.push("Filtered by rules before judgment:");
    L.push("");
    for (const [reason, list] of [...byReason.entries()].sort((a, b) => b[1].length - a[1].length)) {
      // Name the ones that looked most like housing stories, so a real miss is visible.
      const examples = list.filter((f) => f.areas?.length || f.categories?.length).slice(0, 3).map((f) => `"${f.title}"`);
      L.push(`- ${reason}: ${list.length}${examples.length ? ` — e.g. ${examples.join(", ")}` : ""}`);
    }
    L.push("");
  }

  if (quiet.length) {
    L.push("---");
    L.push("");
    L.push("## Checked, no material change");
    L.push("");
    L.push("Already on the watchlist. New coverage appeared, but nothing that changes the story — not resurfaced.");
    L.push("");
    for (const t of quiet) L.push(`- ${t.name} — ${t.status === NOT_A_PROJECT ? "not a development" : t.status}, ${t.total}/40`);
    L.push("");
  }

  L.push("---");
  L.push("");
  L.push("## Run details");
  L.push("");
  L.push("| Source | Tier | Items | Status |");
  L.push("|---|---|---|---|");
  for (const h of health) L.push(`| ${h.name} | ${h.tier} | ${h.items} | ${h.ok ? "ok" : `**failed** (${h.error ?? h.status})`} |`);
  L.push("");
  if (usage) L.push(`Model usage: ${usage.input_tokens ?? 0} input tokens (${usage.cache_read_input_tokens ?? 0} from cache), ${usage.output_tokens ?? 0} output tokens.`);
  if (counts.deferred) L.push(`${counts.deferred} lower-ranked candidates were over today's judgment budget and stay eligible tomorrow.`);
  if (warnings.length) {
    L.push("");
    L.push("Validation notes (what the code corrected or dropped):");
    for (const w of warnings) L.push(`- ${w}`);
  }
  L.push("");
  return L.join("\n");
}

// ---------------------------------------------------------------------------
// WEEKLY
// ---------------------------------------------------------------------------

const has = (t, re) => re.test(t.bestFormat ?? "") || (t.secondaryFormats ?? []).some((f) => re.test(f));

const RANK = { P1: 0, P2: 1, P3: 2, IGNORE: 3 };
const byStrength = (a, b) => RANK[a.priority] - RANK[b.priority] || b.total - a.total;

/** Best topic for a slot — preferring one not already picked for another slot. */
function pick(list, filter, used = new Set()) {
  const fits = list.filter(filter).sort(byStrength);
  const choice = fits.find((t) => !used.has(t.key)) ?? fits[0] ?? null;
  if (choice) used.add(choice.key);
  return choice;
}

function pickLine(t, days, extra = "") {
  if (!t) return "Nothing this week earned this slot.";
  const day = days.get(t.key);
  const parts = [`**${t.name}** — ${t.total}/40, ${PRIORITY_LABEL[t.priority]}${t.status && t.status !== NOT_A_PROJECT ? `, ${t.status}` : ""}`];
  if (t.hook && !/^Needs Mikey/.test(t.hook)) parts.push(`Hook: "${t.hook}"`);
  if (extra) parts.push(extra);
  if (day) parts.push(`Full write-up: ${day}-local-trends.md`);
  return parts.join("  \n");
}

/**
 * @param {object[]} dailies  parsed daily JSON sidecars from the last 7 days
 */
export function buildWeeklyMarkdown({ today, dailies, watchlist }) {
  const days = new Map();
  const byKey = new Map();
  const rejected = [];
  for (const d of [...dailies].sort((a, b) => a.date.localeCompare(b.date))) {
    for (const t of d.topics.filter((x) => x.surface && x.priority !== "IGNORE")) {
      byKey.set(t.key, t); // latest day wins
      days.set(t.key, d.date);
    }
    rejected.push(...(d.rejected ?? []).map((r) => ({ ...r, date: d.date })));
  }
  const topics = [...byKey.values()];
  const strong = topics.filter((t) => ["P1", "P2"].includes(t.priority));
  const pool = strong.length ? strong : topics;

  const L = [];
  L.push("# LVINIT Weekly Trend Summary");
  L.push(`WEEK ENDING: ${today}`);
  L.push("");
  L.push(`_Built from ${dailies.length} daily report${dailies.length === 1 ? "" : "s"}: ${dailies.map((d) => d.date).sort().join(", ") || "none"}. Discovery only — nothing has been published._`);
  L.push("");

  L.push("# BEST CONTENT OPPORTUNITIES THIS WEEK");
  L.push("");
  const top = [...pool].sort(byStrength).slice(0, 3);
  const used = new Set();
  for (let i = 0; i < 3; i += 1) L.push(`${i + 1}. ${top[i] ? pickLine(top[i], days) : "—"}`, "");

  L.push("# BEST FIELD SHOOT");
  L.push("");
  const shoot = pick(pool, (t) => t.fieldShoot?.recommended, used);
  L.push(pickLine(shoot, days, shoot?.fieldShoot?.locationType ? `Where: ${shoot.fieldShoot.locationType}` : ""), "");

  L.push("# BEST CAROUSEL");
  L.push("");
  L.push(pickLine(pick(pool, (t) => has(t, /carousel/i), used), days), "");

  L.push("# BEST SHORT-FORM VIDEO");
  L.push("");
  L.push(pickLine(pick(pool, (t) => has(t, /reel|short|tiktok/i), used), days), "");

  L.push("# BEST LONG-FORM VIDEO");
  L.push("");
  L.push(pickLine(pick(pool, (t) => has(t, /youtube long-form|walkthrough/i), used), days), "");

  L.push("# BEST LVINIT ARTICLE");
  L.push("");
  const article = pick(pool, (t) => has(t, /article/i), used);
  L.push(pickLine(article, days, article?.articleOpportunity ? `Angle: ${article.articleOpportunity}` : ""), "");

  L.push("# TOP EMERGING NEIGHBORHOOD");
  L.push("");
  const areaScore = new Map();
  for (const t of topics) {
    if (!t.area || /valley-wide|^las vegas$/i.test(t.area)) continue;
    const a = areaScore.get(t.area) ?? { sum: 0, n: 0, names: [] };
    a.sum += t.total;
    a.n += 1;
    a.names.push(t.name);
    areaScore.set(t.area, a);
  }
  const area = [...areaScore.entries()].sort((a, b) => b[1].sum - a[1].sum)[0];
  L.push(area ? `**${area[0]}** — ${area[1].n} topic${area[1].n === 1 ? "" : "s"} this week: ${area[1].names.slice(0, 4).join("; ")}` : "No neighborhood stood out this week.", "");

  L.push("# TOP AUDIENCE QUESTION");
  L.push("");
  const q = pick(topics, (t) => t.kind === "question");
  L.push(q ? pickLine(q, days, q.whyPeopleCare ? `Who's asking: ${q.whyPeopleCare}` : "") : "No clear, recurring audience question surfaced this week.", "");

  L.push("# TOP DEVELOPMENT TO WATCH");
  L.push("");
  const watched = (watchlist.projects ?? [])
    .filter((p) => p.kind === "project" && p.last_checked && p.last_checked >= dailies.map((d) => d.date).sort()[0])
    .sort((a, b) => b.score - a.score)[0];
  L.push(watched ? `**${watched.name}** — ${watched.status}, ${watched.score}/40, ${watched.area}. First seen ${watched.first_seen}; last change ${watched.last_change}.${watched.last_summary ? `  \n${watched.last_summary}` : ""}` : "Nothing on the watchlist was checked this week.", "");

  L.push("# ONE THING MIKEY SHOULD NOT WASTE TIME ON");
  L.push("");
  L.push(notWorthIt(rejected), "");
  return L.join("\n");
}

/** The most widely covered story that was still rejected — the obvious trap. */
function notWorthIt(rejected) {
  if (!rejected.length) return "Nothing was rejected this week — no trap to flag.";
  const groups = [];
  for (const r of rejected) {
    const g = groups.find((x) => titleSimilarity(x[0].title, r.title) >= 0.5);
    if (g) g.push(r);
    else groups.push([r]);
  }
  groups.sort((a, b) => b.length - a.length);
  const g = groups[0];
  return `**${g[0].title}**${g.length > 1 ? ` (came up ${g.length} times this week)` : ""} — ${g[0].reason}${g[0].note ? `. ${g[0].note}` : ""}`;
}
