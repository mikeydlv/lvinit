#!/usr/bin/env node
// ---------------------------------------------------------------------------
// LVINIT EXECUTIVE PRODUCER — FOOTAGE CATALOGER (runs on Mikey's PC)
//
//   npm run producer:catalog                  scan, probe, write local + sanitized catalog
//   npm run producer:catalog -- --push        …and push the sanitized catalog to lvinit-agent-state
//   npm run producer:catalog -- --dry-run     scan and summarize, write nothing
//   npm run producer:catalog -- --help
//
// In order:
//   1. load the LOCAL privacy file (created on first run; never leaves the PC)
//   2. walk C:\LVINIT\{Media,Videos,Images,Graphics}, pruning excluded folders
//   3. ffprobe new/changed files (whitelisted fields only, cached)
//   4. describe each file, classify it public / local-only
//   5. build the complete video inventory from the site source
//   6. sanitize, run the leak guard, write
//   7. optionally push the two sanitized JSON files to lvinit-agent-state
//
// It never modifies, moves, renames or uploads media. Only metadata JSON about
// PUBLIC items can leave the PC, and only with --push.
// ---------------------------------------------------------------------------

import { mkdirSync, writeFileSync, existsSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

import { loadConfig } from "./config.mjs";
import { loadPrivacy, savePrivacy, editPrivacy, classifyFile } from "./lib/privacy.mjs";
import { scanMedia, mediaType } from "./lib/scan.mjs";
import { loadProbeCache, saveProbeCache, probeAll } from "./lib/probe.mjs";
import { describe, markDuplicates } from "./lib/describe.mjs";
import { buildPublicCatalog, assertNoLeaks, privateTermsFor } from "./lib/sanitize.mjs";
import { buildVideoInventory } from "./lib/videos.mjs";
import { pushToStateBranch } from "./lib/publish.mjs";
import { buildReviewMarkdown } from "./lib/review.mjs";

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");

const HELP = `
LVINIT Footage Cataloger (Executive Producer, phase 1)

  npm run producer:catalog -- [options]

Reads C:\\LVINIT (never modifies it) and writes:
  LOCAL ONLY   ~/.lvinit/executive-producer/footage-catalog.local.json
               ~/.lvinit/executive-producer/catalog-review.md   <- read this
  SANITIZED    data/executive-producer/footage-catalog.json      (gitignored locally)
               data/executive-producer/video-inventory.json

Options
  --push                 Push the two sanitized files to lvinit-agent-state.
  --dry-run              Scan and summarize. Write nothing, push nothing.
  --exclude="Folder"     Never catalog folders with this name, at any depth. Repeatable.
  --approve="Path"       Approve a folder (or one file) as public-safe. Repeatable.
                         Paths are relative to the media root, e.g. "Media/Summerlin/Red Rock".
  --hold="Path|reason"   Keep a folder or file local-only. Repeatable.
  --no-probe             Skip ffprobe (faster; no durations/dimensions for new files).
  --no-oembed            Don't ask YouTube for live video titles.
  --media-root=DIR       Default C:\\LVINIT (or LVINIT_MEDIA_ROOT).
  --state-dir=DIR        Where sanitized files go (default: repo root).
  --help                 This message.
`;

export function parseArgs(argv) {
  const args = {};
  for (const raw of argv) {
    if (!raw.startsWith("--")) continue;
    const [flag, ...rest] = raw.slice(2).split("=");
    const value = rest.length ? rest.join("=").replace(/^"|"$/g, "") : true;
    if (["exclude", "approve", "hold"].includes(flag)) (args[flag] ??= []).push(String(value));
    else args[flag] = value;
  }
  return args;
}

export async function run(argv = process.argv.slice(2), { log = console.log, repoRoot = REPO_ROOT, fetchImpl = fetch, probe, now = new Date() } = {}) {
  const args = parseArgs(argv);
  if (args.help) {
    log(HELP);
    return { exitCode: 0 };
  }
  const overrides = { media: {}, inventory: {} };
  if (args["media-root"]) overrides.media.root = String(args["media-root"]);
  if (args["no-oembed"]) overrides.inventory.oembed = false;
  const config = loadConfig(overrides);
  const dryRun = Boolean(args["dry-run"]);
  const generatedAt = now.toISOString();

  if (!existsSync(config.media.root)) {
    log(`Media root not found: ${config.media.root}`);
    return { exitCode: 2 };
  }

  // 1. privacy rules (local)
  const { privacy, created } = loadPrivacy(config);
  const changes = editPrivacy(privacy, { exclude: args.exclude ?? [], approve: args.approve ?? [], hold: args.hold ?? [] });
  if (!dryRun && (created || changes.length)) savePrivacy(config, privacy);
  if (created) log(`Created the local privacy file: ${config.privacy.file}`);
  for (const c of changes) log(`Privacy: ${c}`);

  // 2. scan
  const { files, excludedFolders } = scanMedia(config, privacy);
  const known = files.filter((f) => mediaType(f.ext, config));
  log(`Scanned ${known.length} media files (${excludedFolders} excluded folder${excludedFolders === 1 ? "" : "s"} skipped unread).`);

  // 3. probe
  const cache = loadProbeCache(config.local.probeCache);
  let probeResults = new Map();
  if (!args["no-probe"]) {
    const probeable = known.filter((f) => ["video", "image"].includes(mediaType(f.ext, config)));
    const { results, probed } = await probeAll(probeable, {
      ffprobe: config.media.ffprobe,
      cache,
      probe,
      onProgress: (d, t) => log(`  probed ${d}/${t}`),
    });
    probeResults = results;
    log(`Probed ${probed} new or changed file(s); ${probeable.length - probed} from cache.`);
    if (!dryRun) saveProbeCache(config.local.probeCache, cache);
  }

  // 4. describe + classify
  const entries = markDuplicates(
    known.map((f) => describe(f, probeResults.get(f.rel) ?? null, classifyFile(f.rel, privacy, config), config)),
  );
  for (const e of entries) delete e._dupKey;
  const pub = entries.filter((e) => e.privacy.status === "public");
  const held = entries.filter((e) => e.privacy.status === "local-only");

  // 5–6. sanitize + inventory + leak guard
  const catalog = buildPublicCatalog(entries, { generatedAt, excludedFolders });
  const inventory = await buildVideoInventory({ repoRoot, config, publicItems: catalog.items, generatedAt, fetchImpl });
  const catalogJson = JSON.stringify(catalog, null, 2) + "\n";
  const inventoryJson = JSON.stringify(inventory, null, 2) + "\n";
  const terms = privateTermsFor(entries, privacy);
  try {
    assertNoLeaks(catalogJson, terms);
    assertNoLeaks(inventoryJson, terms);
  } catch (err) {
    log(err.message);
    log("Nothing was written or pushed.");
    return { exitCode: 3, error: err.message };
  }

  const review = buildReviewMarkdown({ entries, catalog, inventory, privacy, excludedFolders, generatedAt, config });
  log("");
  log(`Public (may leave the PC): ${pub.length} files · ${catalog.totals.videoMinutes} min of video across ${catalog.folders.length} folders`);
  log(`Held local-only:           ${held.length} files`);
  log(`Videos in inventory:       ${inventory.totals.videos} (${inventory.totals.onHomepage} on homepage, ${inventory.totals.embedOnly} embed-only)`);

  if (dryRun) {
    log("\nDry run: nothing written.");
    return { exitCode: 0, catalog, inventory, entries, review };
  }

  // Local-only outputs.
  mkdirSync(config.local.home, { recursive: true });
  writeFileSync(
    config.local.catalog,
    JSON.stringify({ note: "LOCAL ONLY. Includes held items. Never push this file.", generatedAt, excludedFolders, entries }, null, 2) + "\n",
  );
  writeFileSync(config.local.review, review);

  // Sanitized copies in the repo (gitignored).
  const stateDir = resolve(repoRoot, String(args["state-dir"] ?? "."));
  const dataDir = join(stateDir, config.state.dataDir);
  mkdirSync(dataDir, { recursive: true });
  writeFileSync(join(dataDir, "footage-catalog.json"), catalogJson);
  writeFileSync(join(dataDir, "video-inventory.json"), inventoryJson);
  log(`\nReview:    ${config.local.review}`);
  log(`Sanitized: ${dataDir}`);

  let pushed = null;
  if (args.push) {
    pushed = pushToStateBranch({
      repoRoot,
      config,
      log,
      message: `executive-producer: footage catalog (${catalog.totals.public} items) + video inventory (${inventory.totals.videos} videos)`,
      files: [
        { rel: `data/executive-producer/footage-catalog.json`, content: catalogJson },
        { rel: `data/executive-producer/video-inventory.json`, content: inventoryJson },
      ],
    });
  } else {
    log("Not pushed. Re-run with --push once the review looks right.");
  }
  return { exitCode: 0, catalog, inventory, entries, pushed };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  run().then(
    (r) => process.exit(r.exitCode),
    (err) => {
      console.error(err?.stack ?? err);
      process.exit(1);
    },
  );
}
