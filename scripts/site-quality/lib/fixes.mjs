// ---------------------------------------------------------------------------
// SAFE AUTO-FIX PLANNING
//
// A fix is planned only for a finding whose type is marked "conditional" in the
// catalog, and only as one of two mechanical edit shapes:
//
//   1. LITERAL REPLACEMENT — one URL/path string literal in code becomes another
//      URL/path that already exists in the repository (a real route or a real
//      file). Letter case, a trailing or doubled slash, a wrong protocol/host on
//      an LVINIT URL. The replacement text is always derived from the repo,
//      never written.
//   2. SITEMAP ENTRY — add one entry for a published page, copying the exact
//      changeFrequency/priority its section already uses; or remove one entry
//      for a route that provably has no page.
//
// Every one of the twelve safe-auto-fix conditions is recorded as a gate. The
// last three (validation, build, diff scope) can only be proven by applying
// the fix, so a plan carries them as "pending" and lib/execute.mjs settles them.
// A single failed gate makes the finding report-only, with the reason printed.
// ---------------------------------------------------------------------------

import { findLiteral, normalizePath, classifyHref } from "./urls.mjs";

export const GATES = [
  ["deterministic", "The problem is deterministic"],
  ["unambiguous", "The correct fix is unambiguous"],
  ["no-editorial", "No editorial judgment is required"],
  ["no-new-copy", "No new factual copy is required"],
  ["no-seo-strategy", "No SEO strategy decision is required"],
  ["no-compliance", "No Fair Housing / compliance judgment is required"],
  ["no-design", "No design / layout decision is required"],
  ["meaning-unchanged", "The change does not alter article meaning"],
  ["tightly-scoped", "The change is tightly scoped"],
  ["mechanically-validated", "The fix is validated mechanically (re-audit clears it, adds nothing)"],
  ["build-passes", "Tests, typecheck, lint and the production build pass"],
  ["diff-scoped", "The diff contains only the expected repair"],
];

/** A line is a code context for a URL/path literal when it assigns one of these. */
const URL_CONTEXT = /\b(href|src|path|url|image|poster|thumbnailUrl|canonical|mainEntityOfPage|item|contentUrl|embedUrl|logo)\s*[:=]|\bconst\s+[A-Z][A-Z0-9_]*\s*=|^\s*\{?\s*["'`][^"'`]*["'`]\s*,?\s*$/;

function isCommentLine(text) {
  const t = text.trimStart();
  return t.startsWith("//") || t.startsWith("*") || t.startsWith("/*") || t.startsWith("{/*");
}

function protectedLine(text, config) {
  return config.autoFix.protectedLinePatterns.find((p) => new RegExp(p).test(text)) ?? null;
}

function pathAllowed(file, config) {
  if (!config.autoFix.allowedPathPrefixes.some((p) => file.startsWith(p))) return `${file} is outside the allowed paths (${config.autoFix.allowedPathPrefixes.join(", ")})`;
  const prot = config.autoFix.protectedPaths.find((p) => file === p || file.startsWith(p));
  if (prot) return `${file} is a protected path (${prot})`;
  return null;
}

/** Build a gate record; the three execution gates start pending. */
function gateSheet(results) {
  return GATES.map(([key, label]) => {
    const r = results[key];
    if (r === undefined) return { key, label, status: "pending", note: "settled only by applying the fix (trial or apply)" };
    return { key, label, status: r.ok ? "pass" : "fail", note: r.note };
  });
}

const pass = (note) => ({ ok: true, note });
const fail = (note) => ({ ok: false, note });

/** The same eight static gates hold for every mechanical edit shape. */
function staticGates(extra = {}) {
  return {
    "no-editorial": pass("the replacement is a URL/path that already exists in the repository; no words are chosen"),
    "no-new-copy": pass("no copy is written — the new value is an existing route or file path"),
    "no-seo-strategy": pass("the target is where the page or file already is; nothing is re-targeted"),
    "no-compliance": pass("no compliance or protected line is touched"),
    "no-design": pass("no component, class or layout changes"),
    "meaning-unchanged": pass("only a URL/path literal in code changes; rendered prose is identical"),
    ...extra,
  };
}

/**
 * Plan a literal replacement. Every code occurrence of the `from` literal is
 * replaced; every occurrence must sit in a URL-ish code context in an allowed,
 * unprotected file, or the fix is refused (the literal is being used for
 * something we do not understand).
 */
export function planLiteralReplacement({ from, to, inv, config, why, restrictToFile = null }) {
  const results = {};
  if (!from || !to || from === to) {
    results.deterministic = fail("no distinct replacement value could be derived");
    return { ok: false, gates: gateSheet(results), edits: [] };
  }
  let hits = findLiteral(inv.sources, from);
  if (restrictToFile) hits = hits.filter((h) => h.file === restrictToFile);
  const code = hits.filter((h) => !isCommentLine(h.text));
  if (!code.length) {
    results.deterministic = fail(`the literal "${from}" was not found in code${restrictToFile ? ` in ${restrictToFile}` : ""}, so its source cannot be pinned`);
    return { ok: false, gates: gateSheet(results), edits: [] };
  }
  results.deterministic = pass(why);
  results.unambiguous = pass(`exactly one target: "${to}"`);

  const problems = [];
  for (const h of code) {
    const bad = pathAllowed(h.file, config);
    if (bad) problems.push(bad);
    const prot = protectedLine(h.text, config);
    if (prot) problems.push(`${h.file}:${h.line} matches the protected pattern "${prot}"`);
    if (!URL_CONTEXT.test(h.text)) problems.push(`${h.file}:${h.line} uses the literal outside a URL/path context`);
  }
  const files = [...new Set(code.map((h) => h.file))];
  const staticResults = staticGates();
  if (problems.some((p) => /protected/.test(p))) staticResults["no-compliance"] = fail(problems.filter((p) => /protected/.test(p)).join("; "));
  if (problems.some((p) => /outside a URL/.test(p))) staticResults["meaning-unchanged"] = fail(problems.filter((p) => /outside a URL/.test(p)).join("; "));
  Object.assign(results, staticResults);
  if (problems.some((p) => /outside the allowed|protected path/.test(p)) || code.length > 10 || files.length > 3) {
    results["tightly-scoped"] = fail(
      problems.filter((p) => /outside the allowed|protected path/.test(p)).join("; ") ||
        `${code.length} occurrences in ${files.length} files is too broad for an unattended edit`
    );
  } else {
    results["tightly-scoped"] = pass(`${code.length} occurrence(s) in ${files.length} file(s)`);
  }

  const q = (h) => h.quoted[0];
  const edits = code.map((h) => ({
    kind: "replace",
    file: h.file,
    line: h.line,
    column: h.column,
    before: h.quoted,
    after: `${q(h)}${to}${q(h)}`,
  }));
  const ok = Object.values(results).every((r) => r.ok);
  return { ok, gates: gateSheet(results), edits, files, shared: files.some((f) => config.autoFix.sharedPathPrefixes.some((p) => f.startsWith(p))) };
}

// --- sitemap ----------------------------------------------------------------

/** Every entry object in app/sitemap.ts, with its line span and fields. */
export function parseSitemapEntries(source) {
  const lines = source.split("\n").map((l) => l.replace(/\r$/, ""));
  const entries = [];
  for (let i = 0; i < lines.length; i++) {
    const one = /^(\s*)\{\s*url:\s*`\$\{BASE_URL\}([^`]*)`\s*,\s*changeFrequency:\s*"([a-z]+)"\s*,\s*priority:\s*([\d.]+)\s*\},?\s*$/.exec(lines[i]);
    if (one) {
      entries.push({ route: normalizePath(one[2] || "/"), start: i, end: i, indent: one[1], changeFrequency: one[3], priority: one[4], form: "inline" });
      continue;
    }
    if (/^\s*\{\s*$/.test(lines[i])) {
      const url = /^\s*url:\s*`\$\{BASE_URL\}([^`]*)`,\s*$/.exec(lines[i + 1] ?? "");
      const freq = /^\s*changeFrequency:\s*"([a-z]+)",\s*$/.exec(lines[i + 2] ?? "");
      const prio = /^\s*priority:\s*([\d.]+),\s*$/.exec(lines[i + 3] ?? "");
      const close = /^\s*\},\s*$/.test(lines[i + 4] ?? "");
      if (url && freq && prio && close) {
        entries.push({
          route: normalizePath(url[1] || "/"),
          start: i,
          end: i + 4,
          indent: /^(\s*)/.exec(lines[i])[1],
          changeFrequency: freq[1],
          priority: prio[1],
          form: "block",
        });
        i += 4;
      }
    }
  }
  return entries;
}

function sectionOf(route) {
  const parts = route.split("/").filter(Boolean);
  if (parts[0] === "neighborhoods") return parts.length === 2 ? "neighborhood" : "neighborhood-child";
  if (parts[0] === "guides" && parts.length > 1) return "guide";
  return null;
}

export function planSitemapAdd({ finding, inv, config }) {
  const route = finding.route;
  const results = {};
  const file = config.site.sitemapSource;
  const source = inv.sitemap.source;
  const blocked = (key, note) => {
    results[key] = fail(note);
    return { ok: false, gates: gateSheet(results), edits: [] };
  };
  if (!source) return blocked("deterministic", `${file} could not be read`);
  const section = sectionOf(route);
  if (!section) return blocked("no-seo-strategy", `${route} is not a guide or neighborhood page, so whether it belongs in the sitemap is a decision, not a convention`);

  const page = inv.rendered.get(route);
  if (!page) return blocked("deterministic", `${route} has no rendered page, so it cannot be confirmed as published`);
  const canonical = page.canonicals.length === 1 ? classifyHref(page.canonicals[0], config) : null;
  if (!canonical || canonical.kind !== "internal" || normalizePath(canonical.path) !== route) {
    return blocked("no-seo-strategy", `${route} does not canonicalize to itself, so listing it would contradict the page`);
  }
  if (inv.registry.ok && inv.registry.guides.some((g) => g.href && normalizePath(g.href) === route && g.status === "draft")) {
    return blocked("no-editorial", `${route} is a draft in the registry — publishing it is an editorial decision`);
  }

  const entries = parseSitemapEntries(source);
  const peers = entries.filter((e) => sectionOf(e.route) === section);
  if (peers.length < 3) return blocked("deterministic", `only ${peers.length} existing ${section} entries — too few to call their format a convention`);
  const tally = new Map();
  for (const e of peers) {
    const k = `${e.changeFrequency}|${e.priority}`;
    tally.set(k, (tally.get(k) ?? 0) + 1);
  }
  const [bestKey, bestCount] = [...tally.entries()].sort((a, b) => b[1] - a[1])[0];
  const share = bestCount / peers.length;
  if (share < 0.6) return blocked("unambiguous", `${section} entries disagree on changeFrequency/priority (best is ${Math.round(share * 100)}%), so there is no single convention to copy`);
  const [changeFrequency, priority] = bestKey.split("|");
  const template = peers.filter((e) => e.changeFrequency === changeFrequency && e.priority === priority && e.form === "block").pop() ?? null;
  if (!template) return blocked("deterministic", `no multi-line ${section} entry to copy the layout from`);

  const lastPeer = peers[peers.length - 1];
  const ind = template.indent;
  const inner = `${ind}  `;
  const block = [
    `${ind}{`,
    `${inner}url: \`\${BASE_URL}${route}\`,`,
    `${inner}changeFrequency: "${changeFrequency}",`,
    `${inner}priority: ${priority},`,
    `${ind}},`,
  ];
  Object.assign(
    results,
    staticGates({
      "no-editorial": pass("no words are chosen: the entry is the page's own URL plus its section's existing values"),
      "no-new-copy": pass("no copy is written"),
      "no-seo-strategy": pass(`copies the ${section} convention used by ${bestCount} of ${peers.length} entries: changeFrequency "${changeFrequency}", priority ${priority}`),
      "meaning-unchanged": pass("only app/sitemap.ts changes; no page is touched"),
    }),
    {
      deterministic: pass(`${route} is live, indexable, canonical to itself and not a draft, and it is not listed`),
      unambiguous: pass(`one convention (${Math.round(share * 100)}% of ${section} entries) and one insertion point (after ${lastPeer.route})`),
      "tightly-scoped": pass(`one ${block.length}-line entry added to ${file}`),
    }
  );
  return {
    ok: true,
    gates: gateSheet(results),
    edits: [{ kind: "insert", file, afterLine: lastPeer.end + 1, lines: block }],
    files: [file],
    shared: true,
  };
}

export function planSitemapRemove({ finding, inv, config }) {
  const route = finding.route;
  const results = {};
  const file = config.site.sitemapSource;
  const blocked = (key, note) => {
    results[key] = fail(note);
    return { ok: false, gates: gateSheet(results), edits: [] };
  };
  const source = inv.sitemap.source;
  if (!source) return blocked("deterministic", `${file} could not be read`);
  if ([...inv.routeSet].some((r) => r.toLowerCase() === route.toLowerCase())) {
    return blocked("unambiguous", `a page exists at ${route} with different letter case — that is a casing problem, not a stale entry`);
  }
  if ((inv.nextConfigText ?? "").includes(route)) {
    return blocked("no-seo-strategy", `next.config mentions ${route} (probably a redirect); removing it from the sitemap is an SEO decision`);
  }
  const matches = parseSitemapEntries(source).filter((e) => e.route === route);
  if (matches.length !== 1) return blocked("deterministic", `${route} appears in ${matches.length} parseable entries of ${file}, not exactly one`);
  const e = matches[0];
  Object.assign(results, staticGates({
    "no-editorial": pass("nothing is written; one entry is removed"),
    "no-new-copy": pass("no copy is written"),
    "no-seo-strategy": pass("the route has no page file, so the entry can only send crawlers to a 404"),
    "meaning-unchanged": pass("only app/sitemap.ts changes; no page is touched"),
  }), {
    deterministic: pass(`${route} has no page file and no redirect`),
    unambiguous: pass(`exactly one sitemap entry (lines ${e.start + 1}-${e.end + 1})`),
    "tightly-scoped": pass(`${e.end - e.start + 1} line(s) removed from ${file}`),
  });
  const lines = source.split("\n").slice(e.start, e.end + 1).map((l) => l.replace(/\r$/, ""));
  return { ok: true, gates: gateSheet(results), edits: [{ kind: "remove", file, startLine: e.start + 1, lines }], files: [file], shared: true };
}

/** Plan a fix for one finding. Returns null when the type is never fixable. */
export function planFix(finding, { inv, config }) {
  if (finding.fixability !== "conditional") return null;
  const ev = finding.grouped ? finding.evidence?.[0] ?? {} : finding.evidence ?? {};
  switch (finding.type) {
    case "sitemap-missing-route":
      return planSitemapAdd({ finding, inv, config });
    case "sitemap-stale-route":
      return planSitemapRemove({ finding, inv, config });
    case "link-casing":
    case "link-trailing-slash":
    case "link-double-slash": {
      const href = ev.href;
      const c = href ? classifyHref(href, config) : null;
      if (!c || c.url?.search || (c.raw && c.raw.includes("?"))) {
        return { ok: false, gates: gateSheet({ deterministic: fail("the link carries a query string or could not be read; left for review") }), edits: [] };
      }
      const to = `${ev.target}${c.hash ? `#${c.hash}` : ""}`;
      return planLiteralReplacement({ from: href, to, inv, config, why: `${href} resolves to exactly one real route, ${ev.target}` });
    }
    case "link-origin-malformed":
      return planLiteralReplacement({ from: ev.href, to: ev.expected, inv, config, why: `${ev.href} is an LVINIT URL with the wrong protocol/host; the canonical origin is ${config.site.origin}` });
    case "image-path-case": {
      const actual = ev.actual ?? [];
      if (actual.length !== 1) {
        return { ok: false, gates: gateSheet({ deterministic: pass("the file exists under different case"), unambiguous: fail(`${actual.length} files match case-insensitively: ${actual.join(", ")}`) }), edits: [] };
      }
      return planLiteralReplacement({ from: ev.referenced, to: actual[0], inv, config, why: `${ev.referenced} and ${actual[0]} differ only by letter case, and only one such file exists` });
    }
    case "canonical-malformed":
    case "schema-url-mismatch": {
      const route = finding.route;
      const page = inv.routes.find((r) => r.route === route);
      const value = ev.canonical ?? ev.value;
      if (!page || !value) return { ok: false, gates: gateSheet({ deterministic: fail("no page file or value to anchor the fix") }), edits: [] };
      const c = classifyHref(value, config);
      const path = c.path ? normalizePath(c.path) : null;
      if (!path || path.toLowerCase() !== route.toLowerCase()) {
        return {
          ok: false,
          gates: gateSheet({ deterministic: pass(`${value} is wrong`), "no-seo-strategy": fail(`${value} points at ${path ?? "an unknown path"}, a different page than ${route} — which page should be canonical is an SEO decision`) }),
          edits: [],
        };
      }
      // Try the full URL literal first, then the bare path (StoryMeta.path / PATH).
      const full = planLiteralReplacement({ from: value, to: `${config.site.origin}${route}`, inv, config, why: `${value} names this page with wrong case/slashes/host; the route is ${route}`, restrictToFile: page.file });
      if (full.ok || full.edits.length) return full;
      return planLiteralReplacement({ from: c.path, to: route, inv, config, why: `${c.path} names this page with wrong case/slashes; the route is ${route}`, restrictToFile: page.file });
    }
    default:
      return { ok: false, gates: gateSheet({ deterministic: fail(`no mechanical fix is defined for ${finding.type}`) }), edits: [] };
  }
}

/**
 * Plan fixes for every eligible finding, then apply the run limits in priority
 * order: at most N fixes, M files, and one shared-infrastructure root cause.
 */
export function planFixes(findings, { inv, config, history }) {
  const planned = [];
  const files = new Set();
  let shared = 0;
  for (const f of findings) {
    if (f.fixability !== "conditional" || f.status === "IGNORED") continue;
    if (history?.previouslyAutoFixed?.has(f.fingerprint)) {
      f.fix = { ok: false, blockedBy: "PREVIOUSLY_AUTO_FIXED", reason: "this agent fixed this exact issue before and it came back — a person or the Publisher changed it, so it is never re-applied", gates: [], edits: [] };
      continue;
    }
    const plan = planFix(f, { inv, config });
    if (!plan) continue;
    f.fix = { ...plan, blockedBy: plan.ok ? null : plan.gates.find((g) => g.status === "fail")?.key ?? "unknown", reason: plan.ok ? null : plan.gates.find((g) => g.status === "fail")?.note ?? "a gate failed" };
    if (!plan.ok) continue;
    const newFiles = plan.files.filter((x) => !files.has(x));
    if (planned.length >= config.autoFix.maxFixesPerRun) {
      f.fix = { ...f.fix, ok: false, blockedBy: "RUN_LIMIT", reason: `the run limit of ${config.autoFix.maxFixesPerRun} fixes was reached; it will be picked up next run` };
      continue;
    }
    if (files.size + newFiles.length > config.autoFix.maxFilesPerRun) {
      f.fix = { ...f.fix, ok: false, blockedBy: "RUN_LIMIT", reason: `the run limit of ${config.autoFix.maxFilesPerRun} modified files was reached` };
      continue;
    }
    if (plan.shared && shared >= config.autoFix.maxSharedRootCauseFixesPerRun && !plan.files.every((x) => files.has(x))) {
      f.fix = { ...f.fix, ok: false, blockedBy: "RUN_LIMIT", reason: "one shared-infrastructure fix per run" };
      continue;
    }
    if (plan.shared && !plan.files.every((x) => files.has(x))) shared += 1;
    newFiles.forEach((x) => files.add(x));
    planned.push(f);
  }
  return { planned, files: [...files] };
}
