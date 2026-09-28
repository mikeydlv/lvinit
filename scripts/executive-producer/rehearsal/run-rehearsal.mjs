#!/usr/bin/env node
// ---------------------------------------------------------------------------
// REHEARSAL — the full unattended Monday chain with the three paid services
// SIMULATED (Apify, Anthropic, Resend). Real footage, real catalog, real
// rendering, real YouTube refresh, real Windows notification.
//
// It proves the plumbing: research → plan → verify → automatic frames →
// render → visual review with an automatic repair → package → notify, with
// nothing supplied by hand during the run. It does NOT prove Claude's
// editorial quality or real costs; the acceptance test with real keys does.
//
//   node scripts/executive-producer/rehearsal/run-rehearsal.mjs
// ---------------------------------------------------------------------------

import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

import { runWeek } from "../weekly.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const mockPlan = JSON.parse(readFileSync(join(HERE, "mock-plan.json"), "utf8"));
const calls = { plan: 0, verify: 0, revise: 0, pick: 0, review: 0, apify: 0, resend: 0 };

const reply = (obj, inTok = 2000, outTok = 800) => ({
  content: [{ type: "text", text: JSON.stringify(obj) }],
  stop_reason: "end_turn",
  usage: { input_tokens: inTok, output_tokens: outTok },
});

// Simulated Claude. Recognizes each call by its instructions.
const anthropic = {
  messages: {
    async create(req) {
      const parts = Array.isArray(req.messages[0].content) ? req.messages[0].content : [{ type: "text", text: req.messages[0].content }];
      const text = parts.filter((p) => p.type === "text").map((p) => p.text).join("\n");
      if (text.includes('Return JSON { "posts": [7]')) {
        calls.plan++;
        return reply({ posts: mockPlan.posts, backups: mockPlan.backups }, 60000, 12000);
      }
      if (text.startsWith("Verify every factual claim")) {
        calls.verify++;
        return reply({ posts: mockPlan.posts.map((p) => ({ day: p.day, ok: true, problems: [] })), sameLesson: [] }, 40000, 1500);
      }
      if (text.startsWith("Fix these posts")) {
        calls.revise++;
        return reply({ posts: [] });
      }
      if (text.includes("Tiles are numbered")) {
        calls.pick++;
        return reply({ pick: 0, reason: "simulated" }, 1500, 60);
      }
      if (text.includes("finished slides")) {
        calls.review++;
        // First look at Tuesday only: ask for a text move, so the repair loop runs and then passes.
        const tue = text.includes("monthly costs") && !calls.tueFlagged;
        if (tue) calls.tueFlagged = true;
        const n = (text.match(/numbered 1–(\d+)/) ?? [])[1] ?? 6;
        return reply({ slides: Array.from({ length: Number(n) }, (_, i) => (tue && i === 1 ? { n: 2, ok: false, issues: ["simulated: text crosses a busy area"], fix: "move_text_bottom" } : { n: i + 1, ok: true, issues: [], fix: "none" })) }, 3000, 300);
      }
      throw new Error(`rehearsal: unrecognized Claude call: ${text.slice(0, 80)}`);
    },
  },
};

// Real reference posts observed 2026-09-21, returned in Apify's own item shapes.
const TIKTOK = [
  { webVideoUrl: "https://www.tiktok.com/@isackrockyyy/video/7652567606733425951", authorMeta: { name: "isackrockyyy" }, createTimeISO: "2026-06-18T00:00:00Z", text: "POV you walked into a hidden gem in Las Vegas Art District", playCount: 333300, diggCount: 19800, commentCount: 103, shareCount: 1260, collectCount: 3446, videoMeta: { duration: 80 } },
  { webVideoUrl: "https://www.tiktok.com/@buyingwbri/video/7663283423598923038", authorMeta: { name: "buyingwbri" }, createTimeISO: "2026-07-17T00:00:00Z", text: "Here is a look into the beautiful Inspirada neighborhood in Henderson, NV", playCount: 18300, diggCount: 1238, commentCount: 50, shareCount: 178, collectCount: 173, videoMeta: { duration: 54 } },
];
// Mikey's own recent Instagram posts (from the live-session snapshot), in Apify's shape.
const seed = JSON.parse(readFileSync(join(process.env.USERPROFILE ?? "", ".lvinit", "executive-producer", "ledger-seed.json"), "utf8"));
const OWN = seed.items.filter((i) => i.source === "instagram").map((i) => ({ url: i.url, ownerUsername: "mikey_del_rosario", timestamp: `${i.date}T12:00:00Z`, type: "Video", caption: i.text, likesCount: null, commentsCount: null }));
const INSTAGRAM = [{ url: "https://www.instagram.com/p/DbmI5KDD6Ir/", ownerUsername: "vegasthisweekend", timestamp: "2026-08-03T00:00:00Z", type: "Sidecar", caption: "Discover one of the most unique neighborhoods in Las Vegas.", likesCount: 1622, commentsCount: 106 }];

const fetchImpl = async (url, init = {}) => {
  const u = String(url);
  const json = (o) => ({ ok: true, status: 200, json: async () => o, text: async () => JSON.stringify(o) });
  if (u.startsWith("https://api.apify.com/v2/acts/")) {
    calls.apify++;
    const actor = String(init.body ?? "").includes("directUrls") ? "own" : u.includes("tiktok") ? "tt" : "ig";
    return json({ data: { id: `sim-${actor}-${calls.apify}`, status: "SUCCEEDED", defaultDatasetId: actor, usageTotalUsd: 0 } });
  }
  if (u.startsWith("https://api.apify.com/v2/datasets/")) return json(u.includes("/own/") ? OWN : u.includes("/tt/") ? TIKTOK : INSTAGRAM);
  if (u.startsWith("https://api.resend.com/")) {
    calls.resend++;
    return json({ id: "simulated-email" });
  }
  return fetch(url, init); // YouTube refresh stays live.
};

const env = { APIFY_TOKEN: "simulated", ANTHROPIC_API_KEY: "simulated", LVINIT_INSTAGRAM: "mikey_del_rosario", RESEND_API_KEY: "simulated", LVINIT_NOTIFY_EMAIL: "simulated@example.com" };

const r = await runWeek(["--week=2026-09-28", "--suffix=(rehearsal)", "--no-env", "--force"], { services: { anthropic, fetchImpl, env } });
console.log("\nSimulated service calls:", JSON.stringify(calls));
console.log("Steps:", r.report.steps.map((s) => `${s.name} ${s.ok ? "ok" : "FAILED"} ${s.secs}s${s.note ? ` (${s.note})` : ""}`).join("\n       "));
console.log("Manual:", r.report.manual, "\nNot configured:", r.report.notConfigured, "\nExceptions:", JSON.stringify(r.report.exceptions));
process.exit(r.exitCode);
