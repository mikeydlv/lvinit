import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, existsSync, readdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { run, todayPacific } from "../run.mjs";
import { loadConfig } from "../config.mjs";
import { mergeTopics } from "../lib/state.mjs";

const quiet = () => {};
const tmp = () => mkdtempSync(join(tmpdir(), "lvinit-trends-"));
const fixtureDir = (s) => join(s, "reports", "social-trends", "fixtures");

test("fixture run writes the daily report, JSON, weekly and state — and nothing outside its fixture dir", async () => {
  const s = tmp();
  const r = await run(["--fixtures", "--mode=both", "--today=2026-09-17", `--state-dir=${s}`], { log: quiet });
  assert.equal(r.exitCode, 0);
  const dir = fixtureDir(s);
  const md = readFileSync(join(dir, "2026-09-17-local-trends.md"), "utf8");
  for (const heading of ["# LVINIT Local Trend Report", "DATE: 2026-09-17", "## 🔥 CREATE NOW", "## 🟡 STRONG OPPORTUNITIES", "## 👀 WATCH LIST", "## ❌ SKIPPED NOISE"]) {
    assert.ok(md.includes(heading), heading);
  }
  for (const field of ["Score:", "STATUS:", "WHY IT MATTERS:", "WHY PEOPLE WILL CARE:", "BEST HOOK:", "BEST FORMAT:", "SECONDARY FORMAT:", "FIELD SHOOT:", "FIELD SHOOT IDEA:", "ARTICLE OPPORTUNITY:", "EXISTING LVINIT CONTENT TO CONNECT:", "SOURCES:"]) {
    assert.ok(md.includes(field), field);
  }
  assert.ok(md.includes("FIXTURE RUN"));
  assert.ok(!md.includes("- /guides/this-route-does-not-exist —"), "an invented route is never offered as content to connect");
  assert.ok(md.includes("dropped unknown LVINIT route /guides/this-route-does-not-exist"), "…and the drop is disclosed");
  const weekly = readFileSync(join(dir, "weekly.md"), "utf8");
  for (const h of ["# BEST CONTENT OPPORTUNITIES THIS WEEK", "# BEST FIELD SHOOT", "# BEST CAROUSEL", "# BEST SHORT-FORM VIDEO", "# BEST LONG-FORM VIDEO", "# BEST LVINIT ARTICLE", "# TOP EMERGING NEIGHBORHOOD", "# TOP AUDIENCE QUESTION", "# TOP DEVELOPMENT TO WATCH", "# ONE THING MIKEY SHOULD NOT WASTE TIME ON"]) {
    assert.ok(weekly.includes(h), h);
  }
  const watchlist = JSON.parse(readFileSync(join(dir, "data", "watchlist.json"), "utf8"));
  const ridge = watchlist.projects.find((p) => p.key === "fixture-ridge-west-henderson");
  for (const k of ["name", "area", "category", "status", "first_seen", "last_checked", "last_change", "sources", "score", "content_created", "notes"]) assert.ok(k in ridge, k);
  assert.equal(ridge.status, "APPROVED", "OPEN was claimed; only APPROVED is in the text");
  assert.ok(ridge.sources.every((src) => src.url && src.date_checked && "publication_date" in src));
  // Fixture runs never touch real state.
  assert.equal(existsSync(join(s, "data")), false);
});

test("a second run the next day re-analyzes nothing", async () => {
  const s = tmp();
  await run(["--fixtures", "--today=2026-09-17", `--state-dir=${s}`], { log: quiet });
  const r = await run(["--fixtures", "--today=2026-09-18", `--state-dir=${s}`], { log: quiet });
  assert.equal(r.exitCode, 0);
  assert.equal(r.daily.run.counts.judged, 0);
  assert.equal(r.daily.run.topics.filter((t) => t.surface).length, 0);
  assert.match(r.daily.markdown, /Nothing cleared 34\/40 today/);
});

test("dry run writes nothing", async () => {
  const s = tmp();
  const r = await run(["--fixtures", "--dry-run", "--today=2026-09-17", `--state-dir=${s}`], { log: quiet });
  assert.equal(r.exitCode, 0);
  assert.equal(existsSync(join(s, "reports")), false);
});

test("rules-only mode says so and never marks CREATE NOW", async () => {
  const s = tmp();
  const r = await run(["--fixtures", "--no-llm", "--today=2026-09-17", `--state-dir=${s}`], { log: quiet });
  assert.match(r.daily.markdown, /RULES-ONLY MODE/);
  assert.equal(r.daily.run.topics.filter((t) => t.priority === "P1").length, 0);
});

test("stories only rules-judged are re-judged once a model is available", async () => {
  const s = tmp();
  await run(["--fixtures", "--no-llm", "--today=2026-09-17", `--state-dir=${s}`], { log: quiet });
  const again = await run(["--fixtures", "--no-llm", "--today=2026-09-18", `--state-dir=${s}`], { log: quiet });
  assert.equal(again.daily.run.counts.judged, 0, "rules-only does not re-judge its own work");
  const withModel = await run(["--fixtures", "--today=2026-09-18", `--state-dir=${s}`], { log: quiet });
  assert.ok(withModel.daily.run.counts.judged > 0, "the model gets the stories rules-only judged");
});

test("all sources failing is a failed run, not a quiet day", async () => {
  const s = tmp();
  const fetchImpl = async (url) => ({ ok: false, status: 503, url, text: async () => "" });
  const r = await run(["--no-llm", "--today=2026-09-17", `--state-dir=${s}`], { log: quiet, fetchImpl, delay: async () => {} });
  assert.equal(r.exitCode, 1);
  assert.equal(existsSync(join(s, "reports")), false);
});

test("a live run with a mocked model: statuses re-proven, sources from fetched data", async () => {
  const s = tmp();
  const rss = `<rss><channel><item><title>Henderson council approves Fixture Ridge in West Henderson</title>
<link>https://example.com/ridge</link><pubDate>Wed, 16 Sep 2026 10:00:00 GMT</pubDate>
<description>The council approved Fixture Ridge, a master-planned community.</description></item></channel></rss>`;
  const fetchImpl = async (url) => (url.includes("example.com/ridge") ? { ok: false, status: 404, url, text: async () => "" } : { ok: true, status: 200, url, text: async () => (url.includes("cityofhenderson") ? rss : "<rss></rss>") });
  let prompt;
  const claudeClient = {
    beta: {
      messages: {
        stream: (p) => {
          prompt = p.messages[0].content;
          const id = prompt.match(/\[(c-[0-9a-f]+)\]/)[1];
          const body = {
            topics: [{
              candidate_ids: [id], signal_ids: [], project_key: "fixture-ridge", name: "Fixture Ridge", kind: "project", area: "West Henderson", category: "A. Real estate development",
              status: "UNDER CONSTRUCTION", status_evidence: "Crews broke ground today", status_evidence_id: id, material_new_info: false, what_changed: "",
              scores: { local_relevance: 5, relocation_value: 5, conversation_potential: 4, visual_potential: 4, evergreen_value: 4, real_estate_connection: 5, novelty: 4, lvinit_fit: 5 },
              why_it_matters: "m", why_people_will_care: "c", best_hook: "h", best_format: "field-report Reel", secondary_formats: [], content_flywheel: [],
              field_shoot: { recommended: false, location_type: "", shots: [], drone: "", a_roll_vs_voiceover: "", urgency: "no shoot needed" },
              article_opportunity: "", existing_content: [], missing_confirmation: "", promotion_trigger: "",
            }],
            rejected: [],
          };
          return { finalMessage: async () => ({ stop_reason: "end_turn", model: "claude-opus-5", usage: { input_tokens: 10, output_tokens: 5 }, content: [{ type: "text", text: JSON.stringify(body) }] }) };
        },
      },
    },
  };
  const r = await run(["--today=2026-09-17", `--state-dir=${s}`], { log: quiet, fetchImpl, claudeClient, delay: async () => {} });
  assert.equal(r.exitCode, 0);
  const t = r.daily.run.topics[0];
  assert.equal(t.status, "APPROVED", "UNDER CONSTRUCTION had no quote in the text; the headline supports APPROVED");
  assert.equal(t.sources[0].url, "https://example.com/ridge");
  assert.equal(t.priority, "P1");
  assert.ok(existsSync(join(s, "data", "social-trends", "watchlist.json")));
  assert.ok(readdirSync(join(s, "reports", "social-trends")).includes("2026-09-17-local-trends.md"));
  assert.ok(!prompt.includes("2026-09-17") || prompt.startsWith("TODAY: 2026-09-17"), "the date lives in the user turn, not the system prompt");
});

test("resurfacing: quiet re-check vs status change vs score jump", () => {
  const config = loadConfig();
  const base = { key: "p", name: "P", area: "Summerlin", category: "A", kind: "project", status: "APPROVED", score: 30, sources: [{ url: "https://example.com/old" }], connected_routes: [], status_history: [{ evidence: "approved it", source_url: "https://example.com/old" }] };
  const topic = (over) => ({ key: "p", name: "P", kind: "project", status: "APPROVED", total: 30, priority: "P2", materialNewInfo: false, whatChanged: "", existingContent: [], sources: [{ id: "c-1", url: "https://example.com/new" }], statusEvidenceId: "c-1", ...over });
  const wl = { projects: [base] };

  const same = mergeTopics(wl, [topic({})], { today: "2026-09-18", config });
  assert.equal(same.topics[0].surface, false);
  assert.equal(same.watchlist.projects[0].last_checked, "2026-09-18");

  const lower = mergeTopics(wl, [topic({ status: "PROPOSED" })], { today: "2026-09-18", config });
  assert.equal(lower.topics[0].surface, false);
  assert.equal(lower.watchlist.projects[0].status, "APPROVED", "never downgraded");

  const up = mergeTopics(wl, [topic({ status: "UNDER CONSTRUCTION", statusEvidence: "broke ground" })], { today: "2026-09-18", config });
  assert.equal(up.topics[0].surface, true);
  assert.match(up.topics[0].surfaceReasons[0], /APPROVED → UNDER CONSTRUCTION/);
  assert.equal(up.watchlist.projects[0].status_history.at(-1).source_url, "https://example.com/new");

  const jump = mergeTopics(wl, [topic({ total: 35 })], { today: "2026-09-18", config });
  assert.equal(jump.topics[0].surface, true);

  const newInfoOldSource = mergeTopics(wl, [topic({ materialNewInfo: true, sources: [{ id: "c-1", url: "https://example.com/old" }] })], { today: "2026-09-18", config });
  assert.equal(newInfoOldSource.topics[0].surface, false, "new info needs a new source");
});

test("today is computed in Las Vegas time", () => {
  assert.equal(todayPacific(new Date("2026-09-18T05:00:00Z")), "2026-09-17");
  assert.equal(todayPacific(new Date("2026-09-18T13:30:00Z")), "2026-09-18");
});
