// ---------------------------------------------------------------------------
// RENDER — the plan JSON becomes ONE markdown file Mikey reads Monday morning
//
// The order is fixed on purpose: START HERE, then the day-by-day schedule, then
// strategy, website, video/social, what Claude can build. Agent diagnostics go
// last. validatePlan() refuses a plan that would render with holes in it, so a
// half-finished plan becomes a visible failure instead of a quiet gap.
// ---------------------------------------------------------------------------

import { weekDays, longDate, addDays } from "./week.mjs";

export const STATUSES = ["READY", "NEEDS MIKEY TO FILM", "NEEDS CLAUDE TO BUILD", "ALREADY CREATED", "OPTIONAL"];
const WEBSITE_KEYS = [
  ["publish", "Article to publish this week"],
  ["update", "Article to update"],
  ["research", "Article opportunity to research"],
  ["internalLink", "Internal-link opportunity"],
  ["gsc", "GSC opportunity worth acting on"],
  ["localTrend", "Local Trend finding worth acting on"],
];

export const planFileName = (weekOf) => `${weekOf}-weekly-content-plan.md`;
export const failureFileName = (weekOf) => `${weekOf}-weekly-content-plan-FAILED.md`;

const str = (v) => (typeof v === "string" ? v.trim() : "");
const list = (v) => (Array.isArray(v) ? v : []);

/** Returns a list of problems; empty means the plan is complete enough to publish. */
export function validatePlan(plan, weekOf) {
  const problems = [];
  if (!plan || typeof plan !== "object") return ["plan is not an object"];
  const start = plan.mondayStart ?? {};
  for (const k of ["postToday", "claudeReady", "mikeyShootToday", "mostImportantTask"]) if (!str(start[k])) problems.push(`mondayStart.${k} is empty`);
  const days = list(plan.days);
  const expected = weekDays(weekOf);
  if (days.length !== 7) problems.push(`expected 7 days, got ${days.length}`);
  days.forEach((d, i) => {
    const want = expected[i];
    if (want && d.date !== want.date) problems.push(`day ${i + 1} has date ${d.date}, expected ${want.date}`);
    if (!STATUSES.includes(d.status)) problems.push(`${d.date}: status "${d.status}" is not one of ${STATUSES.join(" / ")}`);
    const p = d.primary ?? {};
    for (const k of ["what", "platform", "topic", "format", "time"]) if (!str(p[k])) problems.push(`${d.date}: primary.${k} is empty`);
    for (const k of ["hook", "cta", "why"]) if (!str(d[k])) problems.push(`${d.date}: ${k} is empty`);
  });
  // Consecutive days must not reuse the same CTA.
  for (let i = 1; i < days.length; i++) {
    if (str(days[i].cta) && str(days[i].cta).toLowerCase() === str(days[i - 1].cta).toLowerCase()) problems.push(`${days[i].date}: same CTA as the day before`);
  }
  if (list(plan.priorities).length !== 3) problems.push(`expected exactly 3 priorities, got ${list(plan.priorities).length}`);
  for (const [k] of WEBSITE_KEYS) if (!str(plan.website?.[k])) problems.push(`website.${k} is empty (write NONE if no action is warranted)`);
  return problems;
}

function bullets(items) {
  return items.length ? items.map((x) => `- ${x}`).join("\n") : "- NONE";
}

function block(text) {
  // Captions keep their line breaks; quote them so they paste cleanly.
  return str(text)
    .split(/\r?\n/)
    .map((l) => `> ${l}`)
    .join("\n");
}

export function renderPlan(plan, { weekOf, generatedAt, mode = "automatic", pipeline = [] }) {
  const out = [];
  const end = addDays(weekOf, 6);
  out.push("# LVINIT — THIS WEEK", "");
  out.push(`Week of: ${longDate(weekOf)} – ${longDate(end)}`, "");
  out.push(`_Generated ${generatedAt} by the LVINIT Weekly Publisher (${mode}). Plans only: nothing here has been posted or published._`, "");
  if (plan.degraded) out.push(`> **Note:** ${plan.degraded}`, "");

  const s = plan.mondayStart;
  out.push("## MONDAY MORNING — START HERE", "");
  out.push(`1. **Post today:** ${str(s.postToday)}`);
  out.push(`2. **Claude already has ready:** ${str(s.claudeReady)}`);
  out.push(`3. **You need to shoot today:** ${str(s.mikeyShootToday)}`);
  out.push(`4. **Most important content task this week:** ${str(s.mostImportantTask)}`, "");

  out.push("## WHAT TO POST THIS WEEK", "");
  const labels = weekDays(weekOf);
  plan.days.forEach((d, i) => {
    const p = d.primary;
    out.push(`### ${labels[i].day.toUpperCase()} / ${labels[i].label.replace(/^\w+, /, "").toUpperCase()}`, "");
    out.push(`**STATUS:** ${d.status}`, "");
    out.push("**PRIMARY CONTENT:**");
    out.push(`- What: ${str(p.what)}`, `- Platform: ${str(p.platform)}`, `- Topic: ${str(p.topic)}`, `- Format: ${str(p.format)}`, `- Post at: ${str(p.time)}`, "");
    out.push("**SUPPORTING CONTENT:**", bullets(list(d.supporting).map(str).filter(Boolean)), "");
    out.push(`**ASSET:** ${str(d.asset) || "None yet"}`, "");
    out.push(`**HOOK / ANGLE:** ${str(d.hook)}`, "");
    if (str(d.caption)) out.push("**CAPTION / TITLE:**", "", block(d.caption), "");
    out.push(`**CTA:** ${str(d.cta)}`, "");
    out.push(`**WHY THIS WEEK:** ${str(d.why)}`, "");
    out.push("---", "");
  });

  out.push("## THE 3 PRIORITIES THIS WEEK", "");
  plan.priorities.forEach((p, i) => out.push(`${i + 1}. **${str(p.title)}** — ${str(p.why)}`));
  out.push("");

  out.push("## WEBSITE CONTENT", "");
  for (const [k, label] of WEBSITE_KEYS) out.push(`- **${label}:** ${str(plan.website[k])}`);
  out.push("");

  const vs = plan.videoSocial ?? {};
  out.push("## VIDEO + SOCIAL", "");
  if (list(vs.notes).length) out.push(bullets(list(vs.notes).map(str)), "");
  out.push("### Repurpose from existing footage", "");
  out.push(bullets(list(vs.repurpose).map((r) => `**${str(r.footage)}** → ${str(r.becomes)}`)), "");
  out.push("### MIKEY NEEDS TO FILM:", "");
  const film = list(vs.mikeyFilm);
  if (!film.length) out.push("NOTHING this week. Everything above comes from footage and photos you already have.", "");
  for (const f of film) out.push(`- **${str(f.shot)}** (${str(f.duration)}, for ${str(f.forDay)}): ${str(f.talkingPoints)}`);
  if (film.length) out.push("");

  out.push("## CLAUDE CAN BUILD THIS WEEK", "");
  out.push("_No camera needed. Ask Claude for any of these by name._", "");
  out.push(bullets(list(plan.claudeCanBuild).map((c) => `**${str(c.item)}**${str(c.forDay) ? ` (${str(c.forDay)})` : ""}: ${str(c.detail)}`)), "");

  if (list(plan.sources).length) {
    out.push("## SOURCES", "");
    out.push(bullets(list(plan.sources).map((x) => `${str(x.claim)} — ${str(x.url)}`)), "");
  }

  if (pipeline.length || list(plan.signalNotes).length) {
    out.push("## PIPELINE STATUS", "");
    out.push("_What each specialist agent handed the Weekly Publisher this week._", "");
    for (const p of pipeline) out.push(`- **${p.name}:** ${p.ok ? "" : "⚠ "}${p.summary}`);
    for (const n of list(plan.signalNotes)) out.push(`- ${str(n)}`);
    out.push("");
  }
  return out.join("\n");
}

export function renderFailure({ weekOf, generatedAt, step, error, pipeline = [], logPath }) {
  return [
    "# LVINIT — THIS WEEK",
    "",
    `Week of: ${longDate(weekOf)} – ${longDate(addDays(weekOf, 6))}`,
    "",
    "## ⚠ FAILED — THIS WEEK'S CONTENT PLAN WAS NOT CREATED",
    "",
    `The LVINIT Weekly Publisher stopped at **${step}** on ${generatedAt}.`,
    "",
    `> ${String(error).replace(/\r?\n/g, " ").slice(0, 900)}`,
    "",
    "Nothing was posted or published.",
    "",
    "## What to do",
    "",
    "1. Open Claude Code in the LVINIT repo and say: **\"The weekly content plan failed — fix it and produce this week's plan.\"**",
    "2. Or re-run it yourself: `npm run publisher:week` from the repo folder.",
    logPath ? `3. Full log: \`${logPath}\`` : "",
    "",
    pipeline.length ? "## What each agent handed over before it stopped\n\n" + pipeline.map((p) => `- **${p.name}:** ${p.ok ? "" : "⚠ "}${p.summary}`).join("\n") : "",
    "",
  ].join("\n");
}

export function renderLatest({ weekOf, fileName, ok, generatedAt, startHere }) {
  return [
    "# LVINIT — LATEST WEEKLY CONTENT PLAN",
    "",
    ok ? `**Week of ${longDate(weekOf)}** — created ${generatedAt}.` : `**⚠ FAILED — week of ${longDate(weekOf)}.** The plan was not created (${generatedAt}).`,
    "",
    `Open: [${fileName}](./${fileName})`,
    "",
    startHere ? `## MONDAY MORNING — START HERE\n\n${startHere}\n` : "",
    "Earlier weeks are in this folder, named by the Monday each week starts.",
    "",
  ].join("\n");
}

/** The START HERE block as plain lines (for LATEST.md and the email). */
export function startHereText(plan) {
  const s = plan.mondayStart;
  return [
    `1. Post today: ${str(s.postToday)}`,
    `2. Claude already has ready: ${str(s.claudeReady)}`,
    `3. You need to shoot today: ${str(s.mikeyShootToday)}`,
    `4. Most important this week: ${str(s.mostImportantTask)}`,
  ].join("\n");
}
