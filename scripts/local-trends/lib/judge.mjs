// ---------------------------------------------------------------------------
// JUDGMENT — Claude reads the short list and finds the human angle
//
// One call per run. The model sees ONLY what the agent fetched (headline,
// snippet, article excerpt, publisher, date), the social titles as demand
// signals, what LVINIT already has, and the watchlist. It has no tools and no
// web access: it cannot go and find something to fill a gap.
//
// It proposes; code decides. After the call, validateJudgment():
//   * drops any candidate/signal id or LVINIT route the model did not get
//   * re-checks every status claim against the fetched text (lib/status.mjs)
//   * clamps scores, then computes total and priority itself (lib/score.mjs)
//   * builds every SOURCE line from the fetched items — the model never
//     writes a URL, a publisher or a date
//
// If there is no API key, the call fails, or the model declines, the run
// falls back to rules-only judgment (lib/heuristic.mjs) and says so.
// ---------------------------------------------------------------------------

import { ALL_STATUSES, RUMORED, NOT_A_PROJECT, validateStatus } from "./status.mjs";
import { CRITERIA, cleanScores } from "./score.mjs";

export const FORMATS = [
  "Instagram carousel",
  "Reel / TikTok / Short",
  "talking-head Reel",
  "field-report Reel",
  "YouTube long-form",
  "LVINIT article",
  "article + embedded video",
  "Story poll",
  "comparison carousel",
  "neighborhood walkthrough",
];

export const REJECT_REASONS = [
  "too generic",
  "irrelevant to housing",
  "low audience interest",
  "weak visual potential",
  "duplicate",
  "speculation",
  "national story with weak Vegas angle",
  "outside coverage area",
];

export const CONTENT_ACTIONS = ["update existing article", "add video to article", "write article for video", "internal link", "follow-up piece"];

const CATEGORY_LABELS = [
  "A. Real estate development",
  "B. Neighborhood changes",
  "C. Major development / redevelopment",
  "D. Transportation / infrastructure",
  "E. Builder activity",
  "F. Relocation / cost of living",
  "G. Local lifestyle",
  "H. Social / conversation signal",
];

const str = { type: "string" };
const strArr = { type: "array", items: str };

export const JUDGMENT_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["topics", "rejected"],
  properties: {
    topics: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: [
          "candidate_ids", "signal_ids", "project_key", "name", "kind", "area", "category",
          "status", "status_evidence", "status_evidence_id", "material_new_info", "what_changed",
          "scores", "why_it_matters", "why_people_will_care", "best_hook", "best_format",
          "secondary_formats", "content_flywheel", "field_shoot", "article_opportunity",
          "existing_content", "missing_confirmation", "promotion_trigger",
        ],
        properties: {
          candidate_ids: strArr,
          signal_ids: strArr,
          project_key: str,
          name: str,
          kind: { type: "string", enum: ["project", "question", "trend"] },
          area: str,
          category: { type: "string", enum: CATEGORY_LABELS },
          status: { type: "string", enum: ALL_STATUSES },
          status_evidence: str,
          status_evidence_id: str,
          material_new_info: { type: "boolean" },
          what_changed: str,
          scores: {
            type: "object",
            additionalProperties: false,
            required: CRITERIA.map((c) => c.key),
            properties: Object.fromEntries(CRITERIA.map((c) => [c.key, { type: "integer" }])),
          },
          why_it_matters: str,
          why_people_will_care: str,
          best_hook: str,
          best_format: { type: "string", enum: FORMATS },
          secondary_formats: { type: "array", items: { type: "string", enum: FORMATS } },
          content_flywheel: strArr,
          field_shoot: {
            type: "object",
            additionalProperties: false,
            required: ["recommended", "location_type", "shots", "drone", "a_roll_vs_voiceover", "urgency"],
            properties: {
              recommended: { type: "boolean" },
              location_type: str,
              shots: strArr,
              drone: str,
              a_roll_vs_voiceover: str,
              urgency: { type: "string", enum: ["shoot this week", "shoot this month", "before it changes", "any time (evergreen)", "no shoot needed"] },
            },
          },
          article_opportunity: str,
          existing_content: {
            type: "array",
            items: {
              type: "object",
              additionalProperties: false,
              required: ["route", "action", "note"],
              properties: { route: str, action: { type: "string", enum: CONTENT_ACTIONS }, note: str },
            },
          },
          missing_confirmation: str,
          promotion_trigger: str,
        },
      },
    },
    rejected: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["candidate_id", "reason", "note"],
        properties: { candidate_id: str, reason: { type: "string", enum: REJECT_REASONS }, note: str },
      },
    },
  },
};

/** Stable instructions. Kept free of dates and per-run data so it caches. */
export const SYSTEM_PROMPT = `You are the LVINIT Local Trend Agent: a discovery and prioritization editor for LVINIT, a Las Vegas living, relocation, neighborhood and real estate media platform run by Mikey, a local real estate advisor (brokerage: The Scofield Group). Positioning: "Living Las Vegas From The Inside."

Your one question: what should Mikey talk about next that Las Vegas locals, buyers, sellers, investors, luxury buyers, relocators and people comparing neighborhoods will actually care about? You are not a news aggregator. Recency alone is never a reason to recommend something.

Voice for hooks and angles: a knowledgeable Vegas local and real estate advisor who knows the valley. Neighborhood-first, lifestyle-first, practical, conversational. Not corporate, not salesy, not generic Realtor content, not hype, not fake luxury. Find the human angle. Bad: "New community announced in Henderson." Better: "West Henderson is about to look very different." Bad: "New road project approved." Better: "This could change the commute for thousands of Henderson homeowners."

Geographic priority, highest first: Summerlin, Henderson, Southwest Las Vegas, West Henderson, Green Valley, Inspirada, Centennial Hills, Skye Canyon, Southern Highlands, Mountains Edge, Lake Las Vegas, Tule Springs, Sunstone, Northwest Las Vegas. Also relevant: Downtown, the Arts District, the Strip when it affects residential life, Clark County, the cities of Las Vegas and Henderson, and North Las Vegas for significant developments.

What you receive:
- CANDIDATES: news items with an id, headline, publisher, publication date, source tier and whatever text was fetched. This text is ALL you know about each story. Do not add facts from memory: no invented numbers, prices, dates, unit counts, builders, openings, quotes or claims. If a detail is not in the text, it is unknown. Say what is unknown instead of filling it in.
- SIGNALS: Reddit post titles. They show what residents are asking or debating. They are never evidence of any fact. You may cite them in signal_ids to support conversation potential, or build a "question" topic around a recurring audience question.
- LVINIT CONTENT: the pages and videos LVINIT has already published. Only reference routes from this list.
- WATCHLIST: projects already being monitored, with their key and recorded status.

What to do:
1. Group candidates that describe the same project or story into one topic. List every candidate you used in candidate_ids.
2. For a project already on the watchlist, reuse its exact project_key. Set material_new_info to true only if these candidates add information that is actually new compared with the watchlist entry (a status change, new scale, a new date, a new builder), and describe it in what_changed. For a new topic, create a short lowercase-hyphenated project_key and set what_changed to "".
3. Status, for kind "project": choose from PROPOSED, FILED, APPROVED, UNDER CONSTRUCTION, OPEN or "RUMORED / UNCONFIRMED". Put an EXACT, contiguous, verbatim quote (no ellipses, no paraphrase, at least a few words) from one candidate's text in status_evidence, and that candidate's id in status_evidence_id. The quote must itself say the status (for example "approved", "broke ground", "now open"). A future opening ("set to open in 2027") is not OPEN. If no text supports a status, use "RUMORED / UNCONFIRMED" with empty evidence. Never upgrade a watchlist status without such a quote. For "question" and "trend" topics, use "NOT A PROJECT" with empty evidence.
4. Score each topic from 1 to 5 on: local_relevance (would Vegas residents or movers care?), relocation_value (does it help someone decide where to live?), conversation_potential (will people have opinions?), visual_potential (can a one-person crew film something useful?), evergreen_value (useful after the news cycle?), real_estate_connection (does it connect naturally to homes, neighborhoods, development or lifestyle?), novelty (are other Vegas real estate creators NOT already repeating it?) and lvinit_fit. Be strict: most news scores in the middle. Only a genuinely strong topic should reach 34/40 or more. The code computes the total and priority itself.
5. Reject what does not deserve Mikey's time, using one reason per candidate: too generic, irrelevant to housing, low audience interest, weak visual potential, duplicate (of existing LVINIT content with nothing new), speculation, national story with weak Vegas angle, outside coverage area. Every candidate id must end up in exactly one topic's candidate_ids or in rejected.
6. For each topic, write:
   - why_it_matters: 2 to 4 sentences, grounded only in the text you were given.
   - why_people_will_care: name the specific audience and the reason.
   - best_hook: one strong hook in Mikey's voice. A hook may ask a question or frame the stakes. It must not state as fact anything the sources do not say.
   - best_format and secondary_formats, plus a content_flywheel when one topic can feed several assets (for example "30-sec field Reel", "YouTube long-form breakdown", "LVINIT article", "Story poll", "3 Shorts cut from the long-form").
   - field_shoot: Mikey is a one-person production team. Prefer drive-up locations, minimal walking, one-camera setups and reusable B-roll. Give the kind of location (never an invented street address), 3 to 5 concrete shots, whether a drone helps (and a reminder that airspace near the airport and the Strip is restricted when that applies), A-roll versus voiceover, and urgency.
   - article_opportunity: new article, update, or follow-up, and its angle.
   - existing_content: LVINIT routes from the list that should be updated, need a video, need an article to support a video, or should be internally linked. Use an empty list if none apply.
   - missing_confirmation and promotion_trigger: what is still unconfirmed, and what event (a vote, a filing, a groundbreaking, an opening date) would make this topic stronger. Use "" if nothing is missing.
7. Avoid pitching what LVINIT already covers unless there is meaningful new information, a follow-up is justified, or a new format would materially improve distribution. When that is the case, say so in existing_content.

Output only the JSON object required by the schema.`;

/** Rough token estimate (≈4 chars/token) — used only as a spending guard. */
export const estimateTokens = (text) => Math.ceil(String(text).length / 4);

export function buildUserMessage({ today, candidates, signals, inventory, watchlist }) {
  const lines = [];
  lines.push(`TODAY: ${today}`);
  lines.push("");
  lines.push("=== CANDIDATES ===");
  for (const c of candidates) {
    lines.push(`[${c.id}] ${c.title}`);
    lines.push(`  publisher: ${c.sourceName || c.sourceDomain || "unknown"} | tier: ${c.tier} | published: ${c.published ? c.published.slice(0, 10) : "unknown"}${c.watchMatch ? ` | may match watchlist: ${c.watchMatch}` : ""}`);
    if (c.alsoReportedBy?.length) lines.push(`  also reported by: ${c.alsoReportedBy.map((r) => r.sourceName).filter(Boolean).join(", ")}`);
    if (c.snippet) lines.push(`  snippet: ${c.snippet}`);
    if (c.excerpt) lines.push(`  article text: ${c.excerpt}`);
  }
  lines.push("");
  lines.push("=== SIGNALS (Reddit titles — demand only, never evidence) ===");
  if (!signals.length) lines.push("(none this run)");
  for (const s of signals) lines.push(`[${s.id}] ${s.sourceName}: ${s.title}`);
  lines.push("");
  lines.push("=== LVINIT CONTENT ===");
  for (const p of inventory.pages) lines.push(`${p.route} | ${p.title}${p.category ? ` | ${p.category}` : ""}${p.publishedAt ? ` | ${p.publishedAt}` : ""}`);
  lines.push("Videos:");
  for (const v of inventory.videos) lines.push(`- ${v.title}`);
  lines.push("");
  lines.push("=== WATCHLIST ===");
  const projects = watchlist.projects ?? [];
  if (!projects.length) lines.push("(empty)");
  for (const p of projects.slice(0, 200)) {
    lines.push(`${p.key} | ${p.name} | ${p.area} | ${p.status} | score ${p.score}${p.content_created?.length ? ` | content made: ${p.content_created.join("; ")}` : ""}${p.notes ? ` | ${p.notes.slice(0, 160)}` : ""}`);
  }
  return lines.join("\n");
}

/**
 * Call Claude. Returns { ok, raw, usage, error }.
 * `client` is injectable for tests; production builds one from the SDK.
 */
export async function callClaude({ config, userMessage, client }) {
  let anthropic = client;
  if (!anthropic) {
    const { default: Anthropic } = await import("@anthropic-ai/sdk");
    anthropic = new Anthropic();
  }
  try {
    const stream = anthropic.beta.messages.stream({
      model: config.llm.model,
      max_tokens: config.llm.maxTokens,
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      thinking: { type: "adaptive" },
      output_config: { effort: config.llm.effort, format: { type: "json_schema", schema: JUDGMENT_SCHEMA } },
      system: [{ type: "text", text: SYSTEM_PROMPT, cache_control: { type: "ephemeral" } }],
      messages: [{ role: "user", content: userMessage }],
    });
    const message = await stream.finalMessage();
    if (message.stop_reason === "refusal") {
      return { ok: false, error: `model declined (${message.stop_details?.category ?? "no category"})`, usage: message.usage };
    }
    if (message.stop_reason === "max_tokens") {
      return { ok: false, error: "response hit max_tokens before finishing", usage: message.usage };
    }
    const text = message.content.filter((b) => b.type === "text").map((b) => b.text).join("");
    return { ok: true, raw: JSON.parse(text), usage: message.usage, model: message.model };
  } catch (error) {
    return { ok: false, error: `${error.name ?? "Error"}: ${error.message ?? error}` };
  }
}

const clean = (s) => String(s ?? "").trim();

/**
 * Turn the model's proposal into trusted topics. Anything it could not have
 * known is dropped, and every status is re-proven.
 */
export function validateJudgment(raw, { candidates, signals, inventory, watchlist }) {
  const byId = new Map(candidates.map((c) => [c.id, c]));
  const signalIds = new Set(signals.map((s) => s.id));
  const watchKeys = new Set((watchlist.projects ?? []).map((p) => p.key));
  const used = new Set();
  const topics = [];
  const warnings = [];

  for (const t of raw?.topics ?? []) {
    const ids = (t.candidate_ids ?? []).filter((id) => byId.has(id) && !used.has(id));
    const sigs = (t.signal_ids ?? []).filter((id) => signalIds.has(id));
    const bogus = (t.candidate_ids ?? []).filter((id) => !byId.has(id));
    if (bogus.length) warnings.push(`topic "${t.name}": dropped unknown candidate ids ${bogus.join(", ")}`);
    if (!ids.length && !(t.kind === "question" && sigs.length)) {
      warnings.push(`topic "${t.name}": no valid sources — dropped`);
      continue;
    }
    ids.forEach((id) => used.add(id));

    const kind = ["project", "question", "trend"].includes(t.kind) ? t.kind : "trend";
    const status =
      kind === "project"
        ? validateStatus({ status: t.status === NOT_A_PROJECT ? RUMORED : t.status, evidence: t.status_evidence, evidenceId: t.status_evidence_id }, byId, ids.map((id) => byId.get(id)))
        : { status: NOT_A_PROJECT, evidence: null, evidenceId: null, note: null };
    if (status.note) warnings.push(`topic "${t.name}": ${status.note}`);

    const existing = (t.existing_content ?? []).filter((e) => {
      const ok = inventory.routes.has(e.route);
      if (!ok) warnings.push(`topic "${t.name}": dropped unknown LVINIT route ${e.route}`);
      return ok;
    });

    const key = slug(t.project_key || t.name);
    topics.push({
      key,
      isExisting: watchKeys.has(key),
      name: clean(t.name),
      kind,
      area: clean(t.area),
      category: clean(t.category),
      status: status.status,
      statusEvidence: status.evidence,
      statusEvidenceId: status.evidenceId,
      statusNote: status.note,
      materialNewInfo: Boolean(t.material_new_info),
      whatChanged: clean(t.what_changed),
      scores: cleanScores(t.scores),
      whyItMatters: clean(t.why_it_matters),
      whyPeopleCare: clean(t.why_people_will_care),
      hook: clean(t.best_hook),
      bestFormat: clean(t.best_format),
      secondaryFormats: (t.secondary_formats ?? []).filter((f) => FORMATS.includes(f) && f !== t.best_format),
      flywheel: (t.content_flywheel ?? []).map(clean).filter(Boolean),
      fieldShoot: {
        recommended: Boolean(t.field_shoot?.recommended),
        locationType: clean(t.field_shoot?.location_type),
        shots: (t.field_shoot?.shots ?? []).map(clean).filter(Boolean),
        drone: clean(t.field_shoot?.drone),
        aRoll: clean(t.field_shoot?.a_roll_vs_voiceover),
        urgency: clean(t.field_shoot?.urgency),
      },
      articleOpportunity: clean(t.article_opportunity),
      existingContent: existing,
      missingConfirmation: clean(t.missing_confirmation),
      promotionTrigger: clean(t.promotion_trigger),
      sources: ids.map((id) => sourceRecord(byId.get(id))),
      signals: sigs.map((id) => signals.find((s) => s.id === id)).map((s) => ({ title: s.title, url: s.url, sourceName: s.sourceName, published: s.published })),
    });
  }

  const rejected = [];
  for (const r of raw?.rejected ?? []) {
    if (!byId.has(r.candidate_id) || used.has(r.candidate_id)) continue;
    used.add(r.candidate_id);
    const c = byId.get(r.candidate_id);
    rejected.push({ id: c.id, title: c.title, url: c.url, sourceName: c.sourceName, reason: REJECT_REASONS.includes(r.reason) ? r.reason : "low audience interest", note: clean(r.note) });
  }
  const unassessed = candidates.filter((c) => !used.has(c.id));
  if (unassessed.length) warnings.push(`${unassessed.length} candidate(s) were not assessed by the model and stay eligible next run`);
  return { topics, rejected, unassessed, warnings };
}

/** A SOURCE line, built from what was fetched — never from model output. */
export function sourceRecord(item) {
  return {
    id: item.id,
    title: item.title,
    sourceName: item.sourceName || item.sourceDomain || "unknown",
    url: item.url,
    published: item.published ? item.published.slice(0, 10) : null,
    tier: item.tier,
    via: item.via,
  };
}

export function slug(text) {
  return String(text ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "untitled";
}
