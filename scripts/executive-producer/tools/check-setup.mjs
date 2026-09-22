#!/usr/bin/env node
// ---------------------------------------------------------------------------
// One-time setup check for the Monday run. Reads ~/.lvinit/executive-producer/.env
// and tests each credential against its service. Prints OK / problem only:
// never a key, never part of a key.
//
//   node scripts/executive-producer/tools/check-setup.mjs            check
//   node scripts/executive-producer/tools/check-setup.mjs --email    also send a test email
// ---------------------------------------------------------------------------

import { join } from "node:path";
import { homedir } from "node:os";
import { existsSync } from "node:fs";

import { loadEnv } from "../weekly.mjs";

const ENV_FILE = join(homedir(), ".lvinit", "executive-producer", ".env");
const sendTest = process.argv.includes("--email");
const results = [];
const ok = (name, detail) => results.push({ name, ok: true, detail });
const bad = (name, detail) => results.push({ name, ok: false, detail });

async function main() {
  if (!existsSync(ENV_FILE)) {
    console.log(`No setup file at ${ENV_FILE}`);
    process.exit(1);
  }
  loadEnv(ENV_FILE);
  const env = process.env;

  // Anthropic: listing models is free.
  if (!env.ANTHROPIC_API_KEY) bad("Anthropic", "ANTHROPIC_API_KEY is empty");
  else {
    const r = await fetch("https://api.anthropic.com/v1/models?limit=100", { headers: { "x-api-key": env.ANTHROPIC_API_KEY, "anthropic-version": "2023-06-01" } });
    if (!r.ok) bad("Anthropic", `key rejected (HTTP ${r.status})`);
    else {
      const ids = (await r.json()).data.map((m) => m.id);
      const model = env.LVINIT_MODEL ?? "claude-opus-5";
      ids.includes(model) ? ok("Anthropic", `key works, ${model} available`) : bad("Anthropic", `key works but ${model} is not available on this account`);
    }
  }

  // Apify: account and remaining monthly credit.
  if (!env.APIFY_TOKEN) bad("Apify", "APIFY_TOKEN is empty");
  else {
    const r = await fetch("https://api.apify.com/v2/users/me/limits", { headers: { authorization: `Bearer ${env.APIFY_TOKEN}` } });
    if (!r.ok) bad("Apify", `token rejected (HTTP ${r.status})`);
    else {
      const d = (await r.json()).data;
      const used = d?.current?.monthlyUsageUsd ?? 0;
      const cap = d?.limits?.maxMonthlyUsageUsd ?? 0;
      ok("Apify", `token works, $${used.toFixed(2)} of $${cap.toFixed(2)} used this month`);
    }
  }
  env.LVINIT_INSTAGRAM ? ok("Instagram handle", `@${env.LVINIT_INSTAGRAM}`) : bad("Instagram handle", "LVINIT_INSTAGRAM is empty");

  // Resend: key, sender domain, optional test email.
  if (!env.RESEND_API_KEY) bad("Resend", "RESEND_API_KEY is empty");
  else if (!env.LVINIT_NOTIFY_EMAIL) bad("Resend", "LVINIT_NOTIFY_EMAIL is empty");
  else {
    const from = env.LVINIT_NOTIFY_FROM ?? "LVINIT <hello@lvinit.com>";
    const domain = from.match(/@([^>\s]+)/)?.[1];
    const r = await fetch("https://api.resend.com/domains", { headers: { authorization: `Bearer ${env.RESEND_API_KEY}` } });
    if (r.status === 401 || r.status === 403) {
      // "Sending access" keys can't list domains; the test email is the real check.
      if (!sendTest) ok("Resend", "key accepted for sending (run with --email to confirm delivery)");
    } else if (!r.ok) bad("Resend", `key rejected (HTTP ${r.status})`);
    else {
      const verified = ((await r.json()).data ?? []).filter((d) => d.status === "verified").map((d) => d.name);
      if (domain === "resend.dev" || verified.includes(domain)) ok("Resend", `key works, sender ${from}`);
      else bad("Resend", `sender domain ${domain} isn't verified in Resend. Verify it, or set LVINIT_NOTIFY_FROM=LVINIT <onboarding@resend.dev> (then LVINIT_NOTIFY_EMAIL must be the address you signed up to Resend with)`);
    }
    if (sendTest) {
      const s = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { authorization: `Bearer ${env.RESEND_API_KEY}`, "content-type": "application/json" },
        body: JSON.stringify({ from, to: [env.LVINIT_NOTIFY_EMAIL], subject: "LVINIT Executive Producer: test email", text: "Setup check. Monday notifications will arrive like this." }),
      });
      s.ok ? ok("Test email", `sent to ${env.LVINIT_NOTIFY_EMAIL}`) : bad("Test email", `Resend HTTP ${s.status}: ${(await s.text()).slice(0, 200)}`);
    }
  }

  for (const r of results) console.log(`${r.ok ? "OK  " : "FIX "} ${r.name}: ${r.detail}`);
  process.exit(results.every((r) => r.ok) ? 0 : 1);
}

main().catch((e) => {
  console.log(`Setup check failed: ${e.message}`);
  process.exit(1);
});
