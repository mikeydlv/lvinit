// ---------------------------------------------------------------------------
// FINDINGS — identity, grouping, severity, scoring and search priority
//
// Checks emit INSTANCES: one broken thing at one place. This module turns them
// into FINDINGS:
//
//   * grouping — instances that share a root cause (the same component, the
//     same shared value) become ONE finding listing every affected route.
//     Twenty pages broken by one Navbar line is one issue, not twenty.
//   * identity — a fingerprint from (issue type, route or root cause, field,
//     normalized failure). It survives re-numbering, re-ordering and new pages
//     joining an existing root cause.
//   * severity — the catalog's base severity, adjusted only by a check's
//     documented context rule (noindex on the homepage is CRITICAL) or a
//     type's own systemic severity (canonical or noindex across many pages).
//     Breadth alone never raises a severity: thirty pages sharing one footer
//     bug is ONE finding at its normal severity that names thirty pages.
//     Search traffic never changes a severity either.
//   * scoring — a per-page and a site health score that subtract only for
//     real findings.
//   * priority — GSC impressions reorder findings of the SAME severity and tag
//     search-visible pages. Absence from GSC is neutral.
// ---------------------------------------------------------------------------

import { createHash } from "node:crypto";

import { issueType, SEVERITY_RANK } from "./catalog.mjs";

/** Normalize a failure string so cosmetic differences do not create a new identity. */
export function normalizeFailure(value) {
  return String(value ?? "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/https?:\/\/(www\.)?lvinit\.com/g, "")
    .trim()
    .slice(0, 300);
}

export function fingerprintOf({ type, scope, field, failure }) {
  return createHash("sha1")
    .update([type, scope ?? "", field ?? "", normalizeFailure(failure)].join("|"))
    .digest("hex")
    .slice(0, 12);
}

/**
 * One broken thing at one place.
 *
 * @param {object} o
 * @param {string} o.type       a key of ISSUE_TYPES
 * @param {string|null} o.route the affected route, or null for a site-level issue
 * @param {string} o.field      what was checked ("canonical", "img[src]", "sitemap", ...)
 * @param {string} o.failure    the normalized failure — the identity-bearing part
 * @param {string} o.detail     one plain-English sentence
 * @param {string} [o.groupBy]  root-cause key; instances sharing type+groupBy merge
 * @param {string} [o.groupDetail] the sentence to print when the group spans several pages
 * @param {string} [o.severity] a documented, context-specific override
 */
export function instance(o) {
  issueType(o.type); // throws on an unknown type
  return {
    type: o.type,
    route: o.route ?? null,
    field: o.field ?? "",
    failure: o.failure ?? "",
    detail: o.detail ?? "",
    groupDetail: o.groupDetail ?? null,
    groupBy: o.groupBy ?? null,
    severity: o.severity ?? null,
    evidence: o.evidence ?? {},
    source: o.source ?? null,
    reviewReason: o.reviewReason ?? null,
    publisherHandoff: o.publisherHandoff ?? null,
    extraSources: o.extraSources ?? [],
  };
}

/** Merge instances into findings. */
export function groupInstances(instances, config) {
  const groups = new Map();
  for (const inst of instances) {
    const key = inst.groupBy
      ? `${inst.type}::group::${inst.groupBy}`
      : `${inst.type}::${inst.route ?? "site"}::${inst.field}::${normalizeFailure(inst.failure)}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(inst);
  }

  const findings = [];
  for (const members of groups.values()) {
    const first = members[0];
    const def = issueType(first.type);
    const routes = [...new Set(members.map((m) => m.route).filter(Boolean))].sort();
    const grouped = Boolean(first.groupBy);
    const scope = grouped ? `group:${first.groupBy}` : first.route ?? "site";

    // Severity: explicit override > type systemic > base.
    const overrides = members.map((m) => m.severity).filter(Boolean);
    let severity = overrides.length
      ? overrides.sort((a, b) => SEVERITY_RANK[b] - SEVERITY_RANK[a])[0]
      : def.severity;
    let severityBasis = overrides.length ? "context-specific rule in the check" : "base severity for this issue type";
    if (!overrides.length && def.systemicSeverity && routes.length >= def.systemicRoutes) {
      severity = def.systemicSeverity;
      severityBasis = `systemic: one root cause affects ${routes.length} routes (threshold ${def.systemicRoutes})`;
    }

    const sources = [];
    const seenSource = new Set();
    for (const m of members) {
      for (const s of [m.source, ...(m.extraSources ?? [])]) {
        if (!s) continue;
        const k = `${s.file}:${s.line ?? ""}`;
        if (seenSource.has(k)) continue;
        seenSource.add(k);
        sources.push(s);
      }
    }

    findings.push({
      type: first.type,
      area: def.area,
      title: def.title,
      severity,
      baseSeverity: def.severity,
      severityBasis,
      owner: def.owner,
      fixability: def.fix,
      route: routes.length === 1 ? routes[0] : null,
      routes,
      grouped,
      rootCause: first.groupBy,
      field: first.field,
      failure: first.failure,
      detail: grouped && routes.length > 1 && first.groupDetail ? first.groupDetail : first.detail,
      instances: members.length,
      evidence: grouped ? members.slice(0, 25).map((m) => ({ route: m.route, ...m.evidence })) : first.evidence,
      sources,
      reviewReason: first.reviewReason,
      publisherHandoff: members.find((m) => m.publisherHandoff)?.publisherHandoff ?? null,
      fingerprint: fingerprintOf({ type: first.type, scope, field: first.field, failure: grouped ? first.groupBy : first.failure }),
    });
  }
  return findings;
}

/** Attach GSC context and sort: severity first, then search visibility, then breadth. */
export function prioritize(findings, gscSignal, config) {
  for (const f of findings) {
    let best = null;
    for (const route of f.routes) {
      const m = gscSignal?.multiplierFor ? gscSignal.multiplierFor(route) : null;
      if (m && m.impressions !== null && m.impressions !== undefined && (!best || m.impressions > best.impressions)) {
        best = { route, ...m };
      }
    }
    f.search = best
      ? {
          route: best.route,
          impressions: best.impressions,
          clicks: best.clicks,
          multiplier: best.value,
          searchVisible: best.impressions >= config.gsc.urgentImpressions,
        }
      : { route: null, impressions: null, clicks: null, multiplier: 1, searchVisible: false };
    f.priority = Number(
      ((SEVERITY_RANK[f.severity] + 1) * 100 * f.search.multiplier + Math.min(f.routes.length, 50)).toFixed(1)
    );
  }
  return findings.sort(
    (a, b) =>
      SEVERITY_RANK[b.severity] - SEVERITY_RANK[a.severity] ||
      Number(b.search.searchVisible) - Number(a.search.searchVisible) ||
      b.priority - a.priority ||
      a.type.localeCompare(b.type) ||
      String(a.route ?? a.rootCause).localeCompare(String(b.route ?? b.rootCause))
  );
}

/**
 * Health scores. A page starts at 100 and loses the severity weight of every
 * open finding that names it. The site starts at 100 and loses each finding's
 * weight ONCE — a root cause shared by thirty pages costs the site once, not
 * thirty times. Ignored findings and INFO cost nothing. Floors at 0.
 */
export function scoreHealth(findings, routes, config) {
  const w = config.severity.weights;
  const pages = new Map(routes.map((r) => [r, 100]));
  let site = 100;
  for (const f of findings) {
    if (f.status === "IGNORED" || f.status === "RESOLVED" || f.status === "AUTO_FIXED") continue;
    const weight = w[f.severity] ?? 0;
    site -= weight;
    for (const r of f.routes) if (pages.has(r)) pages.set(r, pages.get(r) - weight);
  }
  const pageScores = [...pages.entries()]
    .map(([route, score]) => ({ route, score: Math.max(0, score) }))
    .sort((a, b) => a.score - b.score || a.route.localeCompare(b.route));
  return { site: Math.max(0, site), pages: pageScores, weights: w };
}

export function countBySeverity(findings) {
  const counts = { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0, INFO: 0 };
  for (const f of findings) if (!["IGNORED", "RESOLVED", "AUTO_FIXED"].includes(f.status)) counts[f.severity] += 1;
  return counts;
}
