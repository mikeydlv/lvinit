import test from "node:test";
import assert from "node:assert/strict";
import { mkdirSync, writeFileSync, readFileSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";

import { run } from "../run.mjs";
import { tempDir, writeJson, gscReport, qrow, prow, TODAY } from "./helpers.mjs";

/** A throwaway repository: two pages, a registry, and a GSC report. Synthetic. */
function tinyRepo({ withGsc = true } = {}) {
  const dir = tempDir();
  const pageTsx = (route, headline) =>
    `const meta = { title: "${headline} | LVINIT", headline: "${headline}", path: "${route}", datePublished: "2026-09-01" };\nexport default function Page() { return (<StorySection heading="Daily life"><p>Summerlin is on the west side of the valley and the drive east takes a while in traffic.</p></StorySection>); }\n`;
  for (const [route, headline] of [["/neighborhoods/summerlin", "Summerlin: The Honest Guide"], ["/guides/first-summer-in-vegas", "Surviving Your First Las Vegas Summer"]]) {
    mkdirSync(join(dir, "app", route), { recursive: true });
    writeFileSync(join(dir, "app", route, "page.tsx"), pageTsx(route, headline));
  }
  mkdirSync(join(dir, "app/search"), { recursive: true });
  writeFileSync(join(dir, "app/search/page.tsx"), "export default function S() { return null; }\n");
  mkdirSync(join(dir, "lib"), { recursive: true });
  writeFileSync(join(dir, "lib/content.ts"), "export const guides = [];\n");
  if (withGsc) {
    writeJson(
      dir,
      "reports/gsc/run-1/gsc-opportunities-2026-09-21.json",
      gscReport({
        queries: [qrow("rent first or buy when moving to las vegas", 120, 1, 22), qrow("should i rent or buy in las vegas", 60, 0, 25), qrow("best family neighborhoods las vegas", 90)],
        pairs: [prow("rent first or buy when moving to las vegas", "/neighborhoods/summerlin", 120, 1, 22)],
      })
    );
  }
  return dir;
}

const quiet = { log: () => {} };

test("queue/handoff dry run: a real-shaped run writes reports, brief files and a DRY-RUN queue — and nothing else", async () => {
  const dir = tinyRepo();
  const result = await run([`--today=${TODAY}`, "--no-git"], { ...quiet, repoRoot: dir });
  assert.equal(result.exitCode, 0);
  const out = join(dir, "reports/content-briefs");
  assert.ok(existsSync(join(out, `content-opportunities-${TODAY}.md`)));
  const json = JSON.parse(readFileSync(join(out, `content-opportunities-${TODAY}.json`), "utf8"));
  assert.equal(json.agent, "content-brief-generator");
  const queue = JSON.parse(readFileSync(join(out, "handoff-queue.json"), "utf8"));
  assert.equal(queue.mode, "dry-run");
  assert.match(queue.modeReason, /dry-run only/);
  const briefs = readdirSync(join(out, "briefs"));
  assert.ok(briefs.length >= 1 && briefs.every((b) => b.startsWith(`BRIEF-${TODAY}-`)));
  assert.equal(json.fairHousing.excluded.length, 1);
  // Nothing outside the report directory was written.
  assert.deepEqual(readdirSync(join(dir, "app")).sort(), ["guides", "neighborhoods", "search"]);
});

test("--no-git leaves Publisher status unverified, which blocks handoff", async () => {
  const dir = tinyRepo();
  const { analysis } = await run([`--today=${TODAY}`, "--no-git", "--dry-run"], { ...quiet, repoRoot: dir });
  assert.equal(analysis.queue.queue.length, 0);
  const briefed = analysis.opportunities.filter((o) => o.brief);
  assert.ok(briefed.length >= 1);
  assert.ok(briefed.every((o) => o.handoff.blockers.includes("PUBLISHER_STATUS_UNVERIFIED")));
});

test("no GSC artifact: the run succeeds and reports 'No high-confidence content briefs this week.'", async () => {
  const dir = tinyRepo({ withGsc: false });
  const { markdown, exitCode } = await run([`--today=${TODAY}`, "--no-git", "--dry-run"], { ...quiet, repoRoot: dir });
  assert.equal(exitCode, 0);
  assert.match(markdown, /No high-confidence content briefs this week\./);
});

test("--dry-run writes nothing at all", async () => {
  const dir = tinyRepo();
  await run([`--today=${TODAY}`, "--no-git", "--dry-run"], { ...quiet, repoRoot: dir });
  assert.equal(existsSync(join(dir, "reports/content-briefs")), false);
});
