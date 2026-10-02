// ---------------------------------------------------------------------------
// AUDIT — run every check against an inventory and turn the result into
// grouped, identified, prioritized, scored findings with fix plans.
//
// Pure with respect to the repository: it reads the inventory it is given and
// writes nothing. Everything with side effects lives in run.mjs / execute.mjs.
// ---------------------------------------------------------------------------

import { checkRoutes, checkSitemap, checkRobots } from "./checks/routes-sitemap-robots.mjs";
import { checkMetadata } from "./checks/metadata.mjs";
import { checkSchema } from "./checks/schema.mjs";
import { checkImages, checkHeadings, checkPlaceholderCopy, checkDeclaredPlaceholders } from "./checks/images-headings-copy.mjs";
import { checkLinks } from "./checks/links.mjs";
import { checkRegistry, checkVideos } from "./checks/registry-video.mjs";
import { groupInstances, prioritize, scoreHealth, countBySeverity, instance } from "./findings.mjs";
import { applyLifecycle, resolvedSince, dispositionOf } from "./history.mjs";
import { planFixes } from "./fixes.mjs";

/** Every check, with the audit area it reports under. */
export function runChecks(inv, config, { today }) {
  const instances = [];
  const system = [];
  const stats = {
    routes: inv.routes.length,
    pagesAudited: inv.rendered.size,
    sitemapEntries: inv.sitemap.locs?.length ?? 0,
    metadataChecks: 0,
    schemaBlocks: 0,
    imagesChecked: 0,
    linksChecked: 0,
  };

  const guard = (name, fn) => {
    try {
      const r = fn();
      if (Array.isArray(r)) instances.push(...r);
      else if (r) {
        instances.push(...r.instances);
        return r;
      }
    } catch (err) {
      system.push({ check: name, ok: false, note: `the ${name} check crashed and was skipped: ${err.message}` });
    }
    return null;
  };

  if (!inv.build.present) {
    system.push({ check: "rendered output", ok: false, note: `${inv.build.reason}. Every rendered check (metadata, canonical, schema, images, headings, links, video) was skipped — run with --build.` });
  } else if (!inv.build.fresh) {
    system.push({ check: "rendered output", ok: false, note: inv.build.reason });
  } else {
    system.push({ check: "rendered output", ok: true, note: `${inv.rendered.size} prerendered pages read from ${config.site.renderedDir} (build ${inv.build.buildId})` });
  }
  for (const e of inv.renderErrors) system.push({ check: "rendered output", ok: false, note: `${e.route} could not be parsed: ${e.error}` });
  system.push(
    inv.registry.ok
      ? { check: "content registry", ok: true, note: `${inv.registry.guides.length} guides and ${inv.registry.videos.length} videos read from ${config.site.registryFile}` }
      : { check: "content registry", ok: false, note: inv.registry.reason }
  );
  system.push(
    inv.assets.tracked
      ? { check: "committed assets", ok: true, note: `${inv.assets.files.size} public assets indexed; git tracking known` }
      : { check: "committed assets", ok: false, note: "git ls-files failed, so untracked-asset detection was skipped" }
  );
  const dynamic = inv.routes.filter((r) => r.dynamic);
  if (dynamic.length) system.push({ check: "route inventory", ok: false, note: `${dynamic.length} dynamic route(s) cannot be enumerated statically and were only checked in source: ${dynamic.map((r) => r.route).join(", ")}` });

  guard("routes", () => checkRoutes(inv, config));
  guard("sitemap", () => checkSitemap(inv, config));
  guard("robots", () => checkRobots(inv, config));
  guard("metadata", () => checkMetadata(inv, config));
  guard("schema", () => checkSchema(inv, config, { today }));
  const images = guard("images", () => checkImages(inv, config));
  guard("headings", () => checkHeadings(inv, config));
  const links = guard("links", () => checkLinks(inv, config));
  const registry = guard("registry", () => checkRegistry(inv, config));
  const video = guard("video", () => checkVideos(inv, config));
  guard("placeholder copy", () => checkPlaceholderCopy(inv, config));
  guard("declared placeholders", () => checkDeclaredPlaceholders(inv, config));

  stats.metadataChecks = inv.rendered.size * 6; // title, description, canonical, og:url, robots, share image
  stats.schemaBlocks = [...inv.rendered.values()].reduce((n, p) => n + p.jsonLd.length, 0);
  stats.imagesChecked = images?.stats?.rendered ?? 0;
  stats.imageSourceLiterals = images?.stats?.sourceLiterals ?? 0;
  stats.emptyAltIntentional = images?.stats?.emptyAltIntentional ?? 0;
  stats.linksChecked = links?.stats?.total ?? 0;
  stats.links = links?.stats ?? null;
  stats.reachableFromHome = links?.reachable ?? null;
  stats.registryGuides = registry?.stats?.guides ?? 0;
  stats.registryVideos = registry?.stats?.videos ?? 0;
  stats.videoEmbeds = video?.stats?.embeds ?? 0;
  return { instances, system, stats };
}

/** Validation / build results become findings (build regressions detectable in CI). */
export function validationInstances(results) {
  const out = [];
  for (const r of results ?? []) {
    if (r.ok) continue;
    const type = r.key === "build" ? "build-failed" : r.key === "typecheck" ? "typecheck-failed" : r.key === "lint" ? "lint-failed" : null;
    if (!type) continue;
    out.push(instance({ type, route: null, field: r.command, failure: `exit ${r.code}`, detail: `\`${r.command}\` exited ${r.code}.`, evidence: { tail: r.tail } }));
  }
  return out;
}

/**
 * The whole analysis.
 *
 * @returns {{findings:Array, resolved:Array, system:Array, stats:object, health:object, counts:object, fixPlan:object}}
 */
export function analyze({ inv, config, today, gscSignal, history, extraInstances = [] }) {
  const { instances, system, stats } = runChecks(inv, config, { today });
  const findings = groupInstances([...instances, ...extraInstances], config);
  prioritize(findings, gscSignal, config);
  applyLifecycle(findings, { history, reportDate: today, config });
  const fixPlan = planFixes(findings, { inv, config, history });
  for (const f of findings) {
    f.disposition = dispositionOf(f);
    if (f.disposition === "REVIEW_REQUIRED" && !f.reviewReason) {
      f.reviewReason = f.fix && !f.fix.ok ? `auto-fix blocked (${f.fix.blockedBy}): ${f.fix.reason}` : "this issue type is always report-only";
    }
  }
  const health = scoreHealth(findings, inv.routes.filter((r) => inv.rendered.has(r.route)).map((r) => r.route), config);
  return {
    findings,
    resolved: resolvedSince(findings, history, today),
    system,
    stats,
    health,
    counts: countBySeverity(findings),
    fixPlan,
  };
}
