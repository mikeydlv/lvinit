// ---------------------------------------------------------------------------
// BRIEF — what Mikey reads on Monday
//
//   email   the two-minute version, in the exact shape Mikey asked for:
//           title, hook, why it should work, existing B-roll, new filming
//           YES/NO, recording time, per priority, then a link to the sheets
//   sheets  the full production sheet for each priority: script beats with
//           timing and B-roll, talking points with their source page,
//           packaging (thumbnail, carousel, Story, YouTube, lead-gen), the
//           scorecard, and anything to double-check before recording
//   json    the machine record (also the history the next run reads)
// ---------------------------------------------------------------------------

import { AGENT, SCHEMA_VERSION } from "../config.mjs";

const MODE_LABEL = {
  live: "",
  rules: "RULES-ONLY WEEK: no ANTHROPIC_API_KEY (or the call failed). Hooks are your published headlines; the angles need you.",
  sample: "SAMPLE BRIEF: real LVINIT pages and real footage; the judgment was written in-session by Claude to show the format. Monday runs generate it live.",
  fixture: "FIXTURE BRIEF: synthetic test data.",
};

export function prettyDate(iso) {
  const d = new Date(`${iso}T12:00:00Z`);
  return new Intl.DateTimeFormat("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" }).format(d);
}

function secs(n) {
  if (!n) return "";
  return n >= 60 ? `${Math.floor(n / 60)}m${String(Math.round(n % 60)).padStart(2, "0")}s` : `${Math.round(n)}s`;
}

export function clipLabel(c) {
  const bits = [c.place ?? c.area ?? "clip", c.camera === "drone" ? "drone" : c.camera === "handheld" ? "handheld" : c.camera, c.orientation === "vertical" ? "vertical" : null, secs(c.durationSec), c.timeOfDay === "golden-hour" ? "golden hour" : null];
  return bits.filter(Boolean).join(" · ");
}

function brollFor(pick, n = 3) {
  const used = pick.script.map((s) => s.clip).filter(Boolean);
  const list = used.length ? used : pick.footage.clips;
  const seen = new Set();
  return list.filter((c) => (seen.has(c.id) ? false : seen.add(c.id))).slice(0, n);
}

function whyItWorks(pick) {
  if (pick.rulesOnly) return pick.youtube || "Strong rules signal (format + category); needs your angle.";
  return pick.spouseTest;
}

// --- email (short) --------------------------------------------------------------

export function buildEmailText({ date, mode, picks, minutes, budgetNote, sheetsUrl }) {
  const L = [];
  L.push("LVINIT EXECUTIVE PRODUCER");
  L.push(`THIS WEEK · ${prettyDate(date)}`);
  if (MODE_LABEL[mode]) L.push("", MODE_LABEL[mode]);
  picks.forEach((p, i) => {
    L.push("", `PRIORITY ${i + 1}`);
    L.push(p.title);
    L.push(`Hook: "${p.hook}"`);
    L.push(`Why it should work: ${whyItWorks(p)}`);
    const clips = brollFor(p);
    L.push(`Existing B-roll: ${clips.length ? clips.map((c) => clipLabel(c)).join("; ") : "none matched: talking head only"}`);
    if (p.footage.readyShorts.length) L.push(`Already cut: ${p.footage.readyShorts.length} Short(s) you can post as-is, if not posted yet`);
    L.push(`New filming required: ${p.newFilming.required ? "YES" : "NO"}`);
    L.push(`Recording time: ~${p.recordingMinutes} min`);
    if (p.unverifiedNumbers?.length) L.push(`Check before recording: ${p.unverifiedNumbers.join(", ")}`);
  });
  L.push("", `TOTAL: ${budgetNote}`);
  L.push("", `Full production sheets (scripts, B-roll files, thumbnails, carousels): ${sheetsUrl}`);
  return L.join("\n") + "\n";
}

export function buildEmailMarkdown({ date, mode, picks, budgetNote, sheetsUrl }) {
  const L = [];
  L.push(`# LVINIT Executive Producer`);
  L.push(`**This week · ${prettyDate(date)}**`);
  if (MODE_LABEL[mode]) L.push("", `> ${MODE_LABEL[mode]}`);
  picks.forEach((p, i) => {
    const clips = brollFor(p);
    L.push("", `## Priority ${i + 1}: ${p.title}`);
    L.push(`**Hook:** "${p.hook}"  `);
    L.push(`**Why it should work:** ${whyItWorks(p)}  `);
    L.push(`**Existing B-roll:** ${clips.length ? clips.map((c) => clipLabel(c)).join("; ") : "none matched: talking head only"}  `);
    if (p.footage.readyShorts.length) L.push(`**Already cut:** ${p.footage.readyShorts.length} Short(s) you can post as-is, if not posted yet  `);
    L.push(`**New filming required:** ${p.newFilming.required ? "YES" : "NO"}  `);
    L.push(`**Recording time:** ~${p.recordingMinutes} min`);
    if (p.unverifiedNumbers?.length) L.push(`  \n⚠ **Check before recording:** ${p.unverifiedNumbers.join(", ")}`);
  });
  L.push("", `**Total:** ${budgetNote}`);
  L.push("", `[Full production sheets →](${sheetsUrl})`);
  return L.join("\n") + "\n";
}

// --- full production sheets --------------------------------------------------------

const SCORE_ROWS = [
  ["scroll_stop", "Scroll-stopping"],
  ["comment", "Comment potential"],
  ["share", "Share potential"],
  ["save", "Save potential"],
  ["follow", "Follow potential"],
  ["dm_lead", "DM / lead potential"],
  ["trust", "Trust building"],
  ["ease", "Ease of production"],
  ["reuse", "Reuse of existing footage"],
];

function sheet(p, i) {
  const L = [];
  L.push(`## Priority ${i + 1}: ${p.title}`);
  L.push("");
  L.push(`**Format:** ${p.format} · **Source:** ${p.sourceRoutes.length ? p.sourceRoutes.map((r) => `\`${r}\``).join(", ") : p.sourceTitle}${p.total !== null ? ` · **Score:** ${p.total}/100` : ""}`);
  L.push("");
  L.push(`**Hook (say this first):** "${p.hook}"`);
  if (p.onScreenText) L.push(`**On-screen text:** ${p.onScreenText}`);
  L.push("");
  L.push(`### Script, ${p.spokenSeconds ? `about ${p.spokenSeconds}s spoken` : "45–60s"}`);
  L.push("");
  L.push("| When | Beat | Say | B-roll |");
  L.push("| --- | --- | --- | --- |");
  for (const b of p.script) {
    L.push(`| ${b.seconds || ""} | ${b.beat} | ${b.say.replace(/\|/g, "\\|")} | ${b.clip ? `${clipLabel(b.clip)}<br>\`${b.clip.path}\`` : "Mikey on camera"} |`);
  }
  L.push("");
  L.push("### Talking points");
  for (const t of p.talkingPoints) L.push(`- ${t.point}${t.sourceRoute ? ` (from \`${t.sourceRoute}\`)` : " (your opinion)"}`);
  L.push("");
  L.push("### Why people will care");
  L.push(`- **Spouse test:** ${p.spouseTest}`);
  if (p.emotionalAngle) L.push(`- **Emotional angle:** ${p.emotionalAngle}`);
  if (p.audience) L.push(`- **Audience:** ${p.audience}`);
  L.push(`- **Why they'll comment:** ${p.whyComment}`);
  L.push(`- **Why they'll share:** ${p.whyShare}`);
  L.push(`- **Why they'll save:** ${p.whySave}`);
  if (p.commentPrompt) L.push(`- **Comment prompt:** "${p.commentPrompt}"`);
  L.push("");
  L.push("### Existing footage to use");
  for (const c of p.footage.clips.slice(0, 6)) L.push(`- ${clipLabel(c)}: \`${c.path}\`${c.why ? ` (${c.why})` : ""}${c.caution ? ` ⚠ ${c.caution}` : ""}`);
  if (!p.footage.clips.length) L.push("- Nothing in the catalog matched. Talking head only, or text-on-screen.");
  if (p.footage.readyShorts.length) {
    L.push("");
    L.push(`**Already cut and ready (post as-is if they haven't gone out yet):**`);
    for (const s of p.footage.readyShorts) L.push(`- \`${s}\``);
  }
  L.push("");
  L.push(`**New filming required:** ${p.newFilming.required ? "YES" : "NO"}${p.newFilming.why ? `. ${p.newFilming.why}` : ""}`);
  if (p.newFilming.shots?.length) for (const s of p.newFilming.shots) L.push(`- ${s}`);
  L.push(`**Recording time:** ~${p.recordingMinutes} min of A-roll`);
  L.push("");
  L.push("### Packaging");
  if (p.thumbnail) L.push(`- **Thumbnail:** ${p.thumbnail}`);
  if (p.captionFirstLine) L.push(`- **Caption, first line:** ${p.captionFirstLine}`);
  if (p.carousel) L.push(`- **Carousel:** ${p.carousel}${p.footage.carousel.length ? ` (graphics already made: ${p.footage.carousel.map((g) => `\`${g.split("/").pop()}\``).join(", ")})` : ""}`);
  if (p.story) L.push(`- **Story:** ${p.story}`);
  if (p.youtube) L.push(`- **YouTube:** ${p.youtube}`);
  if (p.leadGen) L.push(`- **Lead generation:** ${p.leadGen}`);
  L.push("");
  if (p.scores && p.total !== null) {
    L.push("### Scorecard");
    L.push("| | /5 |");
    L.push("| --- | --- |");
    for (const [k, label] of SCORE_ROWS) L.push(`| ${label} | ${p.scores[k] ?? "–"} |`);
    L.push(`| **Overall** | **${p.total}/100** |`);
    L.push("");
  }
  if (p.flags.length) {
    L.push("### Check before recording");
    for (const f of p.flags) L.push(`- ${f}`);
    L.push("");
  }
  return L.join("\n");
}

export function buildFullMarkdown({ date, mode, picks, minutes, budgetNote, runnersUp, dropped, notes, inputsSummary, sheetsUrl }) {
  const L = [];
  L.push(buildEmailMarkdown({ date, mode, picks, budgetNote, sheetsUrl }).replace(/\n\[Full production sheets →\]\([^)]*\)\n$/, "\n"));
  L.push("---", "", "# Production sheets", "");
  L.push(`Record all ${picks.length} in one sitting: same shirt, same light, same framing. ${budgetNote}`, "");
  picks.forEach((p, i) => L.push(sheet(p, i), "---", ""));
  if (runnersUp.length || dropped.length) {
    L.push("## Also considered");
    for (const r of runnersUp) L.push(`- ${r.title}${r.total !== null ? ` (${r.total}/100)` : ""}. Runner-up.`);
    for (const d of dropped) L.push(`- ${d.title}. Dropped, ${d.reason}`);
    L.push("");
  }
  L.push("## This week's inputs");
  for (const s of inputsSummary) L.push(`- ${s}`);
  if (notes.length) {
    L.push("", "## Validation notes");
    for (const n of notes) L.push(`- ${n}`);
  }
  return L.join("\n") + "\n";
}

export function buildJson({ date, mode, picks, minutes, runnersUp, dropped, notes, usage, model }) {
  const slim = (p) => ({
    candidateId: p.candidateId,
    title: p.title,
    format: p.format,
    hook: p.hook,
    sourceRoutes: p.sourceRoutes,
    total: p.total,
    scores: p.scores,
    newFilming: p.newFilming.required,
    recordingMinutes: p.recordingMinutes,
    clips: brollFor(p, 6).map((c) => c.id),
    unverifiedNumbers: p.unverifiedNumbers,
  });
  return {
    schema_version: SCHEMA_VERSION,
    agent: AGENT,
    kind: "weekly-brief",
    date,
    mode,
    sample: mode === "sample",
    fixture: mode === "fixture",
    model: model ?? null,
    usage: usage ?? null,
    totalRecordingMinutes: minutes,
    picks: picks.map(slim),
    runnersUp: runnersUp.map(slim),
    dropped,
    notes,
  };
}
