// ---------------------------------------------------------------------------
// VISION — Claude looks at each candidate frame and decides if it is usable
//
// What leaves the PC: one ~1024px JPEG per candidate frame from APPROVED
// footage, plus the folder name, the file name and the documented place hint.
// Never GPS, never footage from held or excluded folders.
//
// Claude answers per frame: keep or reject (with reasons), what is actually
// visible, the honest location (only from evidence), category, topics, alt
// text, a filename, keywords and article uses. The code then re-checks the
// filename and location against the evidence (lib/naming.mjs).
// ---------------------------------------------------------------------------

import { readFileSync } from "node:fs";

import { TOPICS, CATEGORIES } from "../config.mjs";

// USD per million tokens (Claude Opus 5.5 list price, 2026-09). Raw token
// counts are logged too, so the log stays useful if pricing changes.
export const PRICE = { input: 4, output: 20, cacheRead: 0.2, cacheWrite: 5 };

export function costOf(u) {
  if (!u) return 0;
  return ((u.input_tokens ?? 0) * PRICE.input + (u.output_tokens ?? 0) * PRICE.output + (u.cache_read_input_tokens ?? 0) * PRICE.cacheRead + (u.cache_creation_input_tokens ?? 0) * PRICE.cacheWrite) / 1_000_000;
}

const FRAME = {
  type: "object",
  additionalProperties: false,
  required: ["n", "keep", "rejectReasons", "quality", "articleValue", "subject", "description", "category", "location", "locationEvidence", "signageText", "topics", "altText", "filename", "keywords", "possibleArticleUses", "existingArticleSlugs", "privacyIssues"],
  properties: {
    n: { type: "integer" },
    keep: { type: "boolean" },
    rejectReasons: { type: "array", items: { type: "string" } },
    quality: { type: "integer", description: "1-10 photographic quality at article-hero size" },
    articleValue: { type: "integer", description: "1-10 how well it answers a searcher's visual question about Las Vegas living" },
    subject: { type: "string" },
    description: { type: "string" },
    category: { type: "string", enum: CATEGORIES },
    location: { type: "string", description: "Honest location, or empty string when not established" },
    locationEvidence: { type: "string", enum: ["folder", "signage", "landmark", "none"] },
    signageText: { type: "array", items: { type: "string" } },
    topics: { type: "array", items: { type: "string", enum: Object.keys(TOPICS) } },
    altText: { type: "string" },
    filename: { type: "string" },
    keywords: { type: "array", items: { type: "string" } },
    possibleArticleUses: { type: "array", items: { type: "string" } },
    existingArticleSlugs: { type: "array", items: { type: "string" } },
    privacyIssues: { type: "array", items: { type: "string" } },
  },
};

export const SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["frames"],
  properties: { frames: { type: "array", items: FRAME } },
};

export const SYSTEM = `You are the photo editor for LVINIT, Mikey Del Rosario's Las Vegas living, relocation and neighborhood media site. You review still frames pulled from Mikey's own LVINIT footage and decide which ones become reusable editorial images for articles. You are strict: a rejected frame costs nothing, a bad or misleading image on the site costs trust.

KEEP a frame only when ALL of these hold:
- sharp at article-hero size (no motion smear, no soft focus), properly exposed, level enough, uncluttered;
- it shows something a Las Vegas article could genuinely use: neighborhoods, community entrances/signage, home exteriors, model homes, streetscapes, parks, trails, mountain views, amenities, retail/commercial areas, construction or development, aerials, roads/interchanges in context, skyline or Strip views, master-planned communities, lifestyle or environmental context;
- it answers a searcher's visual question (e.g. "What does Summerlin look like?", "What kind of homes are being built in Henderson?", "What does new construction in Las Vegas look like?").

REJECT (and say why) when the frame is: blurry or motion blurred; badly exposed; blocked by objects; dominated by a car dashboard, windshield frame or vehicle interior; an awkward freeze-frame of a person or Mikey mid-expression; a transition, dissolve or fade; a title card, CapCut/editor graphic, lower third, map, chart or chapter card; covered by subtitles/captions/burned-in text; low-information (empty sky, blank wall, pavement); a selfie/talking-head shot; or unlikely to ever help an article.

PRIVACY — reject (and list in privacyIssues) when any of these is readable or identifiable: a house number, a license plate, a private person's face in focus, the inside of an occupied home, a document, a screen, a phone number or a person's name. Builder and community signs, street names, storefronts and public art are fine.

LOCATION — accuracy beats keywords. Use the documented place for the source folder ("folder"), a place you can READ on visible signage ("signage"), or an unmistakable landmark such as the Las Vegas Strip ("landmark"). Otherwise set location to "" and locationEvidence to "none" and describe the visible scene without naming a place. Never guess a neighborhood from how homes look.

FILENAME — lowercase, hyphen-separated plain English, 4–9 words, describes what is ACTUALLY visible, may include the evidenced place, no extension, no IDs or camera names, no sales words ("best", "buy", "homes for sale", "real estate", "luxury" unless it is visibly a luxury estate), no repeated words. Good: "summerlin-west-new-construction-homes-aerial", "henderson-inspirada-community-entrance-sign", "southwest-las-vegas-neighborhood-streetscape".

ALT TEXT — one factual sentence, under 150 characters, what a blind reader needs; no "image of".
TOPICS — the 2–5 ids from the list that the frame most directly supports (not every topic it loosely touches).
existingArticleSlugs — at most 4 slugs from the provided article list that this exact image could honestly illustrate; none is fine.
quality / articleValue — be calibrated: 8+ means hero-worthy.`;

const imagePart = (path) => ({ type: "image", source: { type: "base64", media_type: "image/jpeg", data: readFileSync(path).toString("base64") } });

async function client() {
  const { default: Anthropic } = await import("@anthropic-ai/sdk");
  // Always the public API with Mikey's key, never a proxy inherited from the shell.
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY, baseURL: "https://api.anthropic.com" });
}

/**
 * Review one batch. `items` = [{ reviewPath, sourceRel, folderPlace, timestamp, project }].
 * Returns { frames: [...], usage, usd }.
 */
export async function reviewBatch(items, { config, articles, priorities, anthropic } = {}) {
  const api = anthropic ?? (await client());
  const articleList = articles.map((a) => `${a.slug} — ${a.title}`).join("\n");
  const topicList = Object.entries(TOPICS).map(([id, t]) => `${id} (${t.label})`).join(", ");
  const content = [];
  items.forEach((it, i) => {
    content.push({ type: "text", text: `Frame ${i}: source "${it.sourceRel}" at ${it.timestamp}. Documented place for this folder: ${it.folderPlace ? `"${it.folderPlace}"` : "NONE (location not established)"}.` });
    content.push(imagePart(it.reviewPath));
  });
  content.push({
    type: "text",
    text: `Topic ids: ${topicList}.\n\nTopics the library needs most right now (prefer keeping frames that serve them, but never keep a weak frame for that reason): ${priorities.slice(0, 8).map((p) => p.topic).join(", ")}.\n\nExisting LVINIT articles (slug — title):\n${articleList}\n\nReview frames 0–${items.length - 1}. Return one entry per frame with n = its number.`,
  });
  const stream = api.beta.messages.stream({
    model: config.vision.model,
    max_tokens: 32000,
    betas: ["server-side-fallback-2026-07-01"],
    fallbacks: "default",
    thinking: { type: "adaptive" },
    output_config: { effort: config.vision.effort, format: { type: "json_schema", schema: SCHEMA } },
    system: [{ type: "text", text: SYSTEM, cache_control: { type: "ephemeral" } }],
    messages: [{ role: "user", content }],
  });
  const message = await stream.finalMessage();
  if (message.stop_reason === "refusal") throw Object.assign(new Error(`vision review declined (${message.stop_details?.category ?? "no category"})`), { usage: message.usage, usd: costOf(message.usage) });
  if (message.stop_reason === "max_tokens") throw Object.assign(new Error("vision review hit max_tokens"), { usage: message.usage, usd: costOf(message.usage) });
  const text = message.content.filter((b) => b.type === "text").map((b) => b.text).join("");
  const json = JSON.parse(text);
  return { frames: json.frames ?? [], usage: message.usage, usd: costOf(message.usage), model: message.model };
}
