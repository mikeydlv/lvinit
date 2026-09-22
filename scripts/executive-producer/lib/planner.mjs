// ---------------------------------------------------------------------------
// PLANNER — every Claude call the Monday run makes, and what each one sends
//
//   planWeek      TEXT: research digest, ledger, LVINIT page excerpts, catalog
//                 metadata → 7 posts + 3 backups (copy, sources, and a source
//                 request per slide: clip/still/folder + what it should show)
//   verifyClaims  TEXT: each post's copy + the evidence it cites → every factual
//                 claim judged supported / not; week-level check that no two
//                 takeaways teach the same lesson
//   revisePosts   TEXT: posts that failed verification + the reasons → fixed
//                 posts (one pass; anything still failing is swapped for a backup)
//   pickFrame     IMAGE: one low-res contact sheet of candidate frames from
//                 APPROVED clips → the best candidate (only if vision is on)
//   reviewSlides  IMAGE: one low-res sheet of a post's FINISHED slides →
//                 readability, crop, relevance, repeats, excluded content
//
// Every call returns { …, usage, usd } so run.json shows the real cost.
// ---------------------------------------------------------------------------

import { readFileSync } from "node:fs";

// USD per million tokens for the configured model. Keep in step with
// Anthropic's published pricing; run.json also stores raw token counts.
export const PRICE = { input: 5, output: 25, cacheRead: 0.5, cacheWrite: 6.25 };
export const MODEL = process.env.LVINIT_MODEL ?? "claude-opus-5";

export function costOf(usage) {
  if (!usage) return 0;
  return (
    ((usage.input_tokens ?? 0) * PRICE.input +
      (usage.output_tokens ?? 0) * PRICE.output +
      (usage.cache_read_input_tokens ?? 0) * PRICE.cacheRead +
      (usage.cache_creation_input_tokens ?? 0) * PRICE.cacheWrite) /
    1_000_000
  );
}

export const EDITORIAL_STANDARD = `LVINIT weekly production standard (Mikey Del Rosario, Las Vegas relocation / real estate).

Produce SEVEN posts for the week (Monday–Sunday) plus THREE backups. Mix across: neighborhood tradeoffs, relocation mistakes, lifestyle differences, local knowledge, practical buying decisions. Never several versions of one topic.

DISTINCT TAKEAWAYS: every post teaches a different lesson. Area posts (Henderson, Summerlin, Southwest, etc.) must not all land on "different areas, different routines". Give each a lesson that only that post teaches (e.g. a specific tradeoff, a cost, a rule, a daily-life fact).

SEASON AND DATE: the posts go out the week given. Frame seasonal topics for someone planning a move from that date (e.g. at the end of September: what to check while touring this fall/winter before a first summer), never as if the season were starting now.

Every post must be something a person moving to Las Vegas would send to their partner. One clear takeaway, a concrete Las Vegas angle: named places, real daily consequences.

CLAIMS (verified after you write them; unsupported posts are rewritten or dropped):
- Every factual sentence must be directly supported by an evidence sentence you cite (LVINIT page text or an official source quote). Paraphrase must keep the meaning exactly; do not strengthen, generalize or add a comparison.
- No superlatives or comparisons ("best", "closest", "nearer", "cheaper", "newer", "longer", "more X than") unless an OFFICIAL or NEWS source states that comparison. Swapping "closest" for "nearer" does not fix an unsupported comparison; state the underlying fact instead.
- Money, rates, taxes, programs, laws: cite an official source checked this week. Never imply a program is currently available. No figures older than 6 months.
- No generic Realtor advice. Never invent statistics, quotes or testimonials.
- CTAs only point to things that exist (LVINIT guides, a manual DM). Never promise automated delivery.

DUPLICATES: nothing Mikey published, scheduled or approved in the last 21 days (see ledger). Earlier unapproved drafts don't count as published.

MEDIA: carousels by default (5–7 slides, one idea each, short white text). A montage only when the footage is clearly stronger in motion. For each slide request a source from the approved catalog: { "clip": path } for a specific video, { "still": path }, or { "folder": path } to let the system pick, plus "want": what the frame must show. Distinct images across the week. No house numbers, license plates, builder sales signage, or close-up faces.

REFERENCES: 1–3 posts from OTHER creators per post, from the research digest only, with exact observed metrics and dates, labeled "recent example"/"older example" unless the digest gives a creator baseline. Separate topic evidence from format evidence. "Why it works" is your judgment; say so. If none fit, say it's an editorial call on an evergreen topic.

VOICE: Mikey's: direct, local, honest, a little opinionated. Not hype.`;

async function client() {
  const { default: Anthropic } = await import("@anthropic-ai/sdk");
  // Always the public API with Mikey's key, never a proxy inherited from the shell.
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY, baseURL: "https://api.anthropic.com" });
}

function parseJson(text) {
  return JSON.parse(text.slice(text.indexOf("{"), text.lastIndexOf("}") + 1));
}

async function ask(api, { system, content, maxTokens = 32000, thinking = true }) {
  const params = {
    model: MODEL,
    max_tokens: maxTokens,
    ...(thinking ? { thinking: { type: "adaptive" } } : {}),
    ...(system ? { system: [{ type: "text", text: system, cache_control: { type: "ephemeral" } }] } : {}),
    messages: [{ role: "user", content }],
  };
  // Large answers must stream (the SDK refuses long non-streaming requests).
  const msg = api.messages.stream ? await api.messages.stream(params).finalMessage() : await api.messages.create(params);
  // A failed answer was still billed; carry its cost so run.json reports it.
  const fail = (m) => Object.assign(new Error(m), { usage: msg.usage, usd: costOf(msg.usage) });
  if (msg.stop_reason === "refusal") throw fail("Claude declined the request.");
  if (msg.stop_reason === "max_tokens") throw fail(`Claude's answer was cut off (max_tokens ${maxTokens}).`);
  const text = msg.content.filter((b) => b.type === "text").map((b) => b.text).join("");
  return { json: parseJson(text), usage: msg.usage, usd: costOf(msg.usage) };
}

const POST_SHAPE = `Post shape: { day, slug, title, category, topics[], format: "carousel"|"montage", takeaway, cta, caption, hashtags[], slides: [{ source: {clip|still|folder}, want, headline, body?, position: "top"|"bottom" }] | segments: [{ clip, want, dur, headline, body? }], sources: [{ claim, url, authority: "official"|"news"|"lvinit", checked, quote? }], references: [...], formatNote? }`;

export async function planWeek({ weekOf, research, ledger, pages, catalogSummary }, { anthropic } = {}) {
  const api = anthropic ?? (await client());
  const content = [
    `Week of ${weekOf} (posts go out Monday ${weekOf} through the following Sunday).`,
    `LEDGER (published / scheduled / approved / earlier drafts):\n${JSON.stringify(ledger.slice(0, 100))}`,
    `RESEARCH DIGEST (other creators; metrics observed ${weekOf}):\n${JSON.stringify(research.slice(0, 120))}`,
    `LVINIT PAGES (route, title, excerpt):\n${JSON.stringify(pages.map((p) => ({ route: p.route, title: p.title, excerpt: p.excerpt })))}`,
    `APPROVED FOOTAGE CATALOG (metadata only):\n${JSON.stringify(catalogSummary)}`,
    `Return JSON { "posts": [7], "backups": [3] }. ${POST_SHAPE}`,
  ].join("\n\n");
  const r = await ask(api, { system: EDITORIAL_STANDARD, content, maxTokens: 128000 });
  return { plan: r.json, usage: r.usage, usd: r.usd };
}

/**
 * posts: [{ day, title, takeaway, text: all on-image + caption text, evidence: [{authority, text}] }]
 * Returns { posts: [{ day, ok, problems: [..] }], sameLesson: [[dayA, dayB, why]] }.
 */
export async function verifyClaims(posts, { anthropic } = {}) {
  const api = anthropic ?? (await client());
  const content = [
    "Verify every factual claim in each post against ONLY the evidence given for that post.",
    "A claim is supported only if an evidence sentence states the same thing with the same meaning. Comparisons and superlatives (including 'nearer', 'newer', 'longer', 'closest', 'more than') need an OFFICIAL or NEWS evidence sentence stating that comparison; LVINIT text alone is not enough for them. Opinions and CTAs are not claims.",
    "Then check the week: flag any two posts whose takeaways teach essentially the same lesson.",
    'Return JSON { "posts": [{ "day": "Mon", "ok": true|false, "problems": [{ "claim": "...", "why": "..." }] }], "sameLesson": [["Wed","Sat","both say ..."]] }.',
    JSON.stringify(posts),
  ].join("\n\n");
  const r = await ask(api, { content, maxTokens: 48000 });
  return { ...r.json, usage: r.usage, usd: r.usd };
}

export async function revisePosts({ failures, pages }, { anthropic } = {}) {
  const api = anthropic ?? (await client());
  const content = [
    "Fix these posts. Keep the topic, media requests and structure; rewrite only what the problems name. Remove or restate unsupported claims so each is exactly supported by the cited evidence. If two posts share a lesson, give the named one a different, specific takeaway.",
    `Relevant LVINIT pages:\n${JSON.stringify(pages)}`,
    `Posts and problems:\n${JSON.stringify(failures)}`,
    `Return JSON { "posts": [fixed posts, same days] }. ${POST_SHAPE}`,
  ].join("\n\n");
  const r = await ask(api, { system: EDITORIAL_STANDARD, content, maxTokens: 96000 });
  return { posts: r.json.posts ?? [], usage: r.usage, usd: r.usd };
}

const imagePart = (path) => ({ type: "image", source: { type: "base64", media_type: "image/jpeg", data: readFileSync(path).toString("base64") } });

export async function pickFrame({ sheetPath, want, candidates }, { anthropic } = {}) {
  const api = anthropic ?? (await client());
  const r = await ask(api, {
    thinking: false,
    maxTokens: 400,
    content: [
      imagePart(sheetPath),
      { type: "text", text: `Tiles are numbered 0–${candidates.length - 1}. Pick the tile that best shows: "${want}". Reject tiles with house numbers, license plates, builder sales signs, close-up faces, motion blur, or a busy/bright top third where white text would be unreadable. Answer JSON {"pick": n, "reason": "..."}; pick -1 if none work.` },
    ],
  });
  return { pick: r.json.pick, reason: r.json.reason, usage: r.usage, usd: r.usd };
}

/**
 * Review a post's finished slides. `sheetPath` is one low-res strip of the
 * rendered slides (numbered). Returns { slides: [{ n, ok, issues[], fix }] }.
 * fix ∈ none | move_text_top | move_text_bottom | new_frame.
 */
export async function reviewSlides({ sheetPath, post }, { anthropic } = {}) {
  const api = anthropic ?? (await client());
  const r = await ask(api, {
    thinking: false,
    maxTokens: 2000,
    content: [
      imagePart(sheetPath),
      {
        type: "text",
        text: `These are the finished slides of an Instagram carousel for LVINIT, numbered 1–${post.slides?.length ?? post.segments?.length}, left to right. Post topic: "${post.title}". Slide texts: ${JSON.stringify((post.slides ?? post.segments).map((s) => [s.headline, s.body].filter(Boolean).join(" / ")))}.
Check each slide for: (1) text readable at phone size against its background, (2) crop keeps the subject (nothing important cut off, text not covering the key subject), (3) image relevant to that slide's words, (4) same or near-identical image as another slide, (5) excluded content: readable house numbers, license plates, builder sales signage, close-up identifiable faces, anything private.
Return JSON {"slides":[{"n":1,"ok":true,"issues":[],"fix":"none"}]} with fix one of none|move_text_top|move_text_bottom|new_frame.`,
      },
    ],
  });
  return { slides: r.json.slides ?? [], usage: r.usage, usd: r.usd };
}
