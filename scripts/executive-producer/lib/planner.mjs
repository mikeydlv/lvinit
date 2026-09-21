// ---------------------------------------------------------------------------
// PLANNER — the editorial decisions, made by Claude, checked by code
//
// Two calls, both through the Anthropic API:
//
//   1. plan (text only). Sends: the week's research digest (other creators'
//      posts: URLs, captions, metrics), the duplicate ledger, LVINIT page
//      excerpts, and footage-catalog METADATA (folder, place, duration, file
//      name). Returns 7 posts + 3 backups: topic, copy, slide text, sources,
//      references, and which clips/stills each slide should come from.
//
//   2. frames (vision, OPTIONAL: config.production.visionFrameReview). For each
//      slide, a small contact sheet of candidate frames from the named clip is
//      rendered locally and SENT to the API as a low-resolution JPEG so Claude
//      can pick the moment. This is the only step where images from the
//      library leave the PC. With it off, frames are chosen locally from
//      metadata (evenly spaced, sharpness-ranked), which is weaker.
//
// STATUS: implemented, NOT yet run live (no ANTHROPIC_API_KEY on this PC).
// ---------------------------------------------------------------------------

import { readFileSync } from "node:fs";

// Opus-class pricing used for the cost report (USD per million tokens).
// Keep in step with Anthropic's published pricing.
export const PRICE = { input: 5, output: 25, cacheRead: 0.5, cacheWrite: 6.25 };

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

Produce SEVEN posts (Monday–Sunday) plus THREE backups. Mix across: neighborhood tradeoffs, relocation mistakes, lifestyle differences, local knowledge, practical buying decisions. Never seven versions of one topic.

Every post must be something a person moving to Las Vegas would send to their partner. Give one clear takeaway and a concrete Las Vegas angle: named places, real daily-life consequences, specific tradeoffs.

HARD RULES (a code gate enforces them; failing posts are replaced):
- No topic Mikey published, scheduled, or received in a batch within 21 days (see ledger).
- No superlatives or absolutes ("best", "only", "closest", "any official map") unless a cited source sentence says exactly that. Prefer specific, checkable claims.
- Money, rates, programs, taxes, laws: cite an OFFICIAL source (government/statute) checked this week, plus LVINIT's article if relevant. Never imply a program is currently available. No figures older than 6 months.
- No generic Realtor advice ("get pre-approved", "work with an agent"). Every post needs Las Vegas-specific detail on the images.
- Never invent statistics, quotes, or testimonials. Quotes only if you have the original source.
- CTAs may only point to things that exist (LVINIT guides, a manual DM). Never promise automated delivery.
- Carousels by default (5–7 slides, one idea per slide, short white text). Use a montage only when the footage is clearly stronger as motion.
- Images: only the approved catalog. Distinct images within a post and across the week. Don't show house numbers, builder signage, license plates, or people's faces up close.

REFERENCES: for each post give 1–3 reference posts from OTHER creators (from the research digest only, with their exact observed metrics and date), labeled "recent example" / "older example" unless the digest gives a creator baseline. Separate topic evidence from format evidence. Your "why it works" is judgment; say so. If nothing relevant exists, say the post is an editorial call on a verified evergreen topic.

VOICE: Mikey's — direct, local, honest, a little opinionated. Not hype, not corporate.`;

export function buildPlanPrompt({ weekOf, research, ledger, pages, catalogSummary }) {
  return [
    `Week of ${weekOf}.`,
    `DUPLICATE LEDGER (recent posts, scheduled items, earlier batches):\n${JSON.stringify(ledger.slice(0, 80))}`,
    `RESEARCH DIGEST (other creators, observed ${weekOf}):\n${JSON.stringify(research.slice(0, 120))}`,
    `LVINIT PAGES (route, title, excerpt):\n${JSON.stringify(pages.map((p) => ({ route: p.route, title: p.title, excerpt: p.excerpt })))}`,
    `FOOTAGE CATALOG (approved, metadata only):\n${JSON.stringify(catalogSummary)}`,
    `Return JSON: { "posts": [7 post objects], "backups": [3 post objects] }. Each post: day, slug, title, category, topics[], format ("carousel"|"montage"), takeaway, cta, caption, hashtags[], slides[{ clip: catalog path, stillOrClip: "still"|"clip", want: what the frame should show, headline, body?, position: "top"|"bottom" }] or segments[{ clip, want, dur, headline, body? }], sources[{ claim, url, authority: "official"|"news"|"lvinit", quote }], references[{ evidence: "Topic"|"Format", label, platform, creator, url, date, format, metrics, why }].`,
  ].join("\n\n");
}

async function client() {
  const { default: Anthropic } = await import("@anthropic-ai/sdk");
  return new Anthropic();
}

export async function planWeek(input, { model = "claude-opus-5", anthropic } = {}) {
  const api = anthropic ?? (await client());
  const msg = await api.messages.create({
    model,
    max_tokens: 32000,
    thinking: { type: "adaptive" },
    system: [{ type: "text", text: EDITORIAL_STANDARD, cache_control: { type: "ephemeral" } }],
    messages: [{ role: "user", content: buildPlanPrompt(input) }],
  });
  const text = msg.content.filter((b) => b.type === "text").map((b) => b.text).join("");
  const json = JSON.parse(text.slice(text.indexOf("{"), text.lastIndexOf("}") + 1));
  return { plan: json, usage: msg.usage, usd: costOf(msg.usage) };
}

/** Vision frame pick: sends ONE low-res contact sheet per slide. Returns the chosen candidate index. */
export async function pickFrame({ sheetPath, want, candidates }, { model = "claude-opus-5", anthropic } = {}) {
  const api = anthropic ?? (await client());
  const msg = await api.messages.create({
    model,
    max_tokens: 400,
    messages: [
      {
        role: "user",
        content: [
          { type: "image", source: { type: "base64", media_type: "image/jpeg", data: readFileSync(sheetPath).toString("base64") } },
          { type: "text", text: `Tiles are numbered 0–${candidates.length - 1}. Pick the tile that best shows: "${want}". Reject tiles with house numbers, builder signs, license plates, close-up faces, or motion blur, and tiles where white text would be unreadable at the top. Answer JSON {"pick": n, "reason": "..."}; pick -1 if none work.` },
        ],
      },
    ],
  });
  const text = msg.content.filter((b) => b.type === "text").map((b) => b.text).join("");
  const j = JSON.parse(text.slice(text.indexOf("{"), text.lastIndexOf("}") + 1));
  return { pick: j.pick, reason: j.reason, usage: msg.usage, usd: costOf(msg.usage) };
}
