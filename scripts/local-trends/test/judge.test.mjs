import test from "node:test";
import assert from "node:assert/strict";

import { loadConfig } from "../config.mjs";
import { validateJudgment, buildUserMessage, JUDGMENT_SCHEMA, SYSTEM_PROMPT, callClaude } from "../lib/judge.mjs";
import { judgeWithRules } from "../lib/heuristic.mjs";
import { inventoryFrom } from "../lib/inventory.mjs";
import { cleanScores, prioritize, bandFor } from "../lib/score.mjs";
import { RUMORED } from "../lib/status.mjs";

const config = loadConfig();
const inventory = inventoryFrom({
  pages: [{ route: "/guides/summerlin-vs-henderson", title: "Summerlin vs Henderson" }],
  videos: [{ id: "v", title: "Summerlin vs Henderson vs Southwest", url: null }],
});
const candidates = [
  { id: "c-1", tier: "official", title: "Council approves Fixture Ridge in West Henderson", snippet: "The council approved the plan.", url: "https://example.com/1", sourceName: "City", published: "2026-09-16T00:00:00Z", areas: ["west-henderson"], categories: ["real-estate-development"] },
  { id: "c-2", tier: "news", title: "National prices tick up", snippet: "", url: "https://example.com/2", sourceName: "Wire", published: "2026-09-16T00:00:00Z", areas: ["las-vegas"], categories: ["relocation-cost"] },
];
const signals = [{ id: "s-1", tier: "social", title: "Is Henderson cheaper?", url: "https://example.com/r", sourceName: "Reddit r/henderson", areas: ["henderson"], categories: [] }];
const ctx = { candidates, signals, inventory, watchlist: { projects: [] } };

const topic = (over = {}) => ({
  candidate_ids: ["c-1"], signal_ids: [], project_key: "Fixture Ridge!", name: "Fixture Ridge", kind: "project", area: "West Henderson",
  category: "A. Real estate development", status: "APPROVED", status_evidence: "The council approved the plan", status_evidence_id: "c-1",
  material_new_info: false, what_changed: "", scores: { local_relevance: 9, relocation_value: 0, conversation_potential: 4, visual_potential: 4, evergreen_value: 4, real_estate_connection: 5, novelty: 4, lvinit_fit: 5 },
  why_it_matters: "x", why_people_will_care: "x", best_hook: "x", best_format: "field-report Reel", secondary_formats: ["field-report Reel", "LVINIT article"],
  content_flywheel: [], field_shoot: { recommended: true, location_type: "", shots: [], drone: "", a_roll_vs_voiceover: "", urgency: "shoot this week" },
  article_opportunity: "", existing_content: [{ route: "/guides/made-up", action: "internal link", note: "" }, { route: "/guides/summerlin-vs-henderson", action: "internal link", note: "" }],
  missing_confirmation: "", promotion_trigger: "", ...over,
});

test("validation drops unknown ids and routes, clamps scores, keeps sources from fetched data", () => {
  const r = validateJudgment({ topics: [topic({ candidate_ids: ["c-1", "c-999"] })], rejected: [{ candidate_id: "c-2", reason: "national story with weak Vegas angle", note: "" }] }, ctx);
  const t = r.topics[0];
  assert.equal(t.key, "fixture-ridge");
  assert.equal(t.status, "APPROVED");
  assert.deepEqual(t.existingContent.map((e) => e.route), ["/guides/summerlin-vs-henderson"]);
  assert.equal(t.scores.local_relevance, 5);
  assert.equal(t.scores.relocation_value, 1);
  assert.deepEqual(t.sources.map((s) => s.url), ["https://example.com/1"]);
  assert.deepEqual(t.secondaryFormats, ["LVINIT article"], "best format is not repeated as secondary");
  assert.equal(r.rejected.length, 1);
  assert.equal(r.unassessed.length, 0);
  assert.ok(r.warnings.some((w) => w.includes("c-999")));
  assert.ok(r.warnings.some((w) => w.includes("/guides/made-up")));
});

test("a candidate cannot be claimed by two topics", () => {
  const r = validateJudgment({ topics: [topic(), topic({ project_key: "dupe", name: "Dupe" })], rejected: [] }, ctx);
  assert.equal(r.topics.length, 1);
});

test("an unassessed candidate is reported, not silently lost", () => {
  const r = validateJudgment({ topics: [topic()], rejected: [] }, ctx);
  assert.deepEqual(r.unassessed.map((c) => c.id), ["c-2"]);
});

test("a question topic may rest on signals alone; its sources are demand-only", () => {
  const r = validateJudgment({ topics: [topic({ candidate_ids: [], signal_ids: ["s-1"], kind: "question", status: "NOT A PROJECT", project_key: "q" })], rejected: [] }, ctx);
  assert.equal(r.topics.length, 1);
  assert.equal(r.topics[0].sources.length, 0);
  assert.equal(r.topics[0].signals.length, 1);
});

test("priority bands and caps", () => {
  assert.equal(bandFor(34, config.scoring.bands), "P1");
  assert.equal(bandFor(33, config.scoring.bands), "P2");
  assert.equal(bandFor(22, config.scoring.bands), "P3");
  assert.equal(bandFor(21, config.scoring.bands), "IGNORE");
  const five = cleanScores(Object.fromEntries(Object.keys(cleanScores()).map((k) => [k, 5])));
  assert.equal(prioritize({ scores: five, status: "APPROVED", kind: "project" }, config).priority, "P1");
  assert.equal(prioritize({ scores: five, status: RUMORED, kind: "project" }, config).priority, "P2");
  assert.equal(prioritize({ scores: five, status: "APPROVED", kind: "project" }, config, { rulesOnly: true }).priority, "P2");
});

test("schema: every object is closed and every property required", () => {
  const walk = (s) => {
    if (s.type === "object") {
      assert.equal(s.additionalProperties, false);
      assert.deepEqual([...s.required].sort(), Object.keys(s.properties).sort());
      Object.values(s.properties).forEach(walk);
    }
    if (s.type === "array") walk(s.items);
  };
  walk(JUDGMENT_SCHEMA);
});

test("the stable system prompt carries no date or run data (prompt cache)", () => {
  assert.doesNotMatch(SYSTEM_PROMPT, /20\d\d-\d\d-\d\d/);
  const msg = buildUserMessage({ today: "2026-09-17", ...ctx });
  assert.match(msg, /\[c-1\]/);
  assert.match(msg, /\/guides\/summerlin-vs-henderson/);
});

test("callClaude: refusal and truncation fall back instead of throwing", async () => {
  const fake = (message) => ({ beta: { messages: { stream: () => ({ finalMessage: async () => message }) } } });
  const refused = await callClaude({ config, userMessage: "x", client: fake({ stop_reason: "refusal", stop_details: { category: null }, content: [] }) });
  assert.equal(refused.ok, false);
  const cut = await callClaude({ config, userMessage: "x", client: fake({ stop_reason: "max_tokens", content: [] }) });
  assert.equal(cut.ok, false);
  const good = await callClaude({ config, userMessage: "x", client: fake({ stop_reason: "end_turn", model: "m", usage: {}, content: [{ type: "text", text: '{"topics":[],"rejected":[]}' }] }) });
  assert.equal(good.ok, true);
  assert.deepEqual(good.raw, { topics: [], rejected: [] });
});

test("callClaude sends the fallback beta, adaptive thinking and the schema", async () => {
  let sent;
  const client = { beta: { messages: { stream: (p) => ((sent = p), { finalMessage: async () => ({ stop_reason: "end_turn", content: [{ type: "text", text: "{}" }] }) }) } } };
  await callClaude({ config, userMessage: "x", client });
  assert.equal(sent.model, "claude-opus-5");
  assert.deepEqual(sent.betas, ["server-side-fallback-2026-07-01"]);
  assert.equal(sent.fallbacks, "default");
  assert.deepEqual(sent.thinking, { type: "adaptive" });
  assert.equal(sent.output_config.format.type, "json_schema");
});

test("rules-only judgment never writes a hook", () => {
  const r = judgeWithRules({ ...ctx, config });
  assert.ok(r.topics.length >= 1);
  for (const t of r.topics) assert.match(t.hook, /Needs Mikey's angle/);
});
