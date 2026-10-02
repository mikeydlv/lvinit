// ---------------------------------------------------------------------------
// LINKS — every rendered <a href>, plus dev URLs anywhere in source
//
// This is technical link integrity only: does the target resolve, is the anchor
// on the page, is the mailto/tel well-formed, is anything pointing at localhost.
// It never judges whether a link SHOULD exist or which words should carry it —
// that is the Internal Linking Agent's job.
//
// A broken link that lives in a shared component (the Navbar, the Footer) is
// one root cause however many pages render it, so it is grouped by the source
// file(s) that hold the literal.
// ---------------------------------------------------------------------------

import { existsSync } from "node:fs";
import { join } from "node:path";

import { instance } from "../findings.mjs";
import { classifyHref, findLiteral, isDevHost, normalizePath } from "../urls.mjs";
import { resolveAsset } from "../inventory.mjs";

const EMAIL = /^[^\s@,;<>()]+@[^\s@,;<>()]+\.[a-z]{2,}$/i;

export function validMailto(href) {
  const rest = href.replace(/^mailto:/i, "");
  const [addrPart, query] = rest.split("?");
  let addrs;
  try {
    addrs = decodeURIComponent(addrPart).split(",").map((s) => s.trim()).filter(Boolean);
  } catch {
    return false;
  }
  if (addrs.length === 0) return Boolean(query); // mailto:?subject=… is a valid share link
  return addrs.every((a) => EMAIL.test(a));
}

export function validTel(href) {
  const digits = href.replace(/^tel:/i, "").replace(/[\s().-]/g, "");
  return /^\+?\d{7,15}$/.test(digits);
}

/**
 * Where does a rendered href come from? Returns the source files that hold it as
 * a literal. When every hit is in a shared component, the link is chrome.
 */
function sourceOf(inv, href, text) {
  const hits = findLiteral(inv.sources, href);
  if (!hits.length) return { hits, files: [], shared: false };
  // Prefer lines that also carry the link's label, when that narrows it.
  const labelled = text ? hits.filter((h) => h.text.includes(text) || h.text.includes(text.replace(/&/g, "&amp;"))) : [];
  const chosen = labelled.length ? labelled : hits;
  const files = [...new Set(chosen.map((h) => h.file))].sort();
  return { hits: chosen, files, shared: files.every((f) => f.startsWith("components/")) };
}

export function checkLinks(inv, config) {
  const out = [];
  const stats = { total: 0, internal: 0, anchors: 0, external: 0, mailto: 0, tel: 0 };
  const lowerRoutes = new Map();
  for (const r of inv.routeSet) lowerRoutes.set(r.toLowerCase(), [...(lowerRoutes.get(r.toLowerCase()) ?? []), r]);
  const reachableEdges = new Map();

  for (const [route, page] of inv.rendered) {
    const edges = new Set();
    reachableEdges.set(route, edges);

    for (const link of page.links) {
      if (link.href === null) continue;
      stats.total += 1;
      const c = classifyHref(link.href, config);
      const where = () => sourceOf(inv, link.href, link.text);
      const groupFor = (kind) => {
        const s = where();
        return {
          groupBy: s.shared ? `${kind}:shared-components` : null,
          source: s.hits[0] ? { file: s.hits[0].file, line: s.hits[0].line } : null,
          extraSources: s.hits.slice(1).map((h) => ({ file: h.file, line: h.line })),
          files: s.files,
        };
      };

      if (c.kind === "empty" || c.kind === "javascript") {
        const g = groupFor("placeholder-link");
        out.push(
          instance({
            type: "link-placeholder",
            route,
            field: "a[href]",
            failure: `${link.href || "(empty)"} "${link.text}"`,
            detail: `"${link.text || "(no text)"}" links to ${link.href === "" ? "an empty href" : `"${link.href}"`}, which goes nowhere.`,
            groupBy: g.groupBy,
            source: g.source,
            extraSources: g.extraSources,
            groupDetail: `Shared site components (${g.files.join(", ")}) render links that go nowhere (href="#" or empty) on every page.`,
            evidence: { href: link.href, text: link.text },
            reviewReason: "what the link should point at (a real page that may not exist yet) is a human decision",
          })
        );
        continue;
      }

      if (c.kind === "anchor") {
        stats.anchors += 1;
        if (!page.ids.has(c.hash)) {
          const g = groupFor("broken-anchor");
          out.push(
            instance({
              type: "link-broken-anchor",
              route,
              field: "a[href]",
              failure: `#${c.hash}`,
              detail: `"${link.text}" links to #${c.hash}, but no element on ${route} has that id — the click does nothing.`,
              groupBy: g.groupBy,
              source: g.source,
              extraSources: g.extraSources,
              groupDetail: `Site navigation (${g.files.join(", ")}) links to in-page anchors that exist only on some pages. Everywhere else the click does nothing.`,
              evidence: { href: link.href, text: link.text },
              reviewReason: g.groupBy
                ? "this is site navigation; changing where nav links point is a navigation decision"
                : "the anchor target or the link has to change, and which one is not mechanical",
            })
          );
        }
        continue;
      }

      if (c.kind === "mailto") {
        stats.mailto += 1;
        if (!validMailto(link.href)) {
          out.push(instance({ type: "link-mailto-malformed", route, field: "a[href]", failure: link.href, detail: `"${link.href}" is not a valid mailto: link.`, groupBy: `mailto:${link.href}` }));
        }
        continue;
      }
      if (c.kind === "tel") {
        stats.tel += 1;
        if (!validTel(link.href)) {
          out.push(instance({ type: "link-tel-malformed", route, field: "a[href]", failure: link.href, detail: `"${link.href}" is not a dialable tel: link.`, groupBy: `tel:${link.href}` }));
        }
        continue;
      }
      if (c.kind === "malformed") {
        out.push(instance({ type: "link-external-malformed", route, field: "a[href]", failure: link.href, detail: `"${link.href}" (${c.problems.join("; ")}) is not a valid URL.`, groupBy: `malformed:${link.href}` }));
        continue;
      }
      if (c.kind === "external" || c.kind === "other") {
        stats.external += 1;
        if (c.url && isDevHost(c.url.hostname, config)) {
          const g = groupFor("dev-url");
          out.push(instance({ type: "dev-url", route, field: "a[href]", failure: link.href, detail: `"${link.text}" links to ${link.href}, a development or staging URL.`, groupBy: `dev-url:${link.href}`, source: g.source }));
        }
        continue;
      }

      // ----- internal -----
      stats.internal += 1;
      const raw = c.path;
      const normalized = normalizePath(raw);
      const g = () => groupFor("internal");

      if (c.problems?.length) {
        const s = g();
        out.push(
          instance({
            type: "link-origin-malformed",
            route,
            field: "a[href]",
            failure: link.href,
            detail: `"${link.text}" links to ${link.href}, which ${c.problems.join(" and ")}.`,
            groupBy: `origin:${link.href}`,
            source: s.source,
            evidence: { href: link.href, expected: `${config.site.origin}${normalized === "/" ? "/" : normalized}${c.hash ? `#${c.hash}` : ""}` },
          })
        );
      }

      if (inv.routeSet.has(normalized)) {
        edges.add(normalized);
        if (raw !== normalized && /\/\//.test(raw)) {
          const s = g();
          out.push(instance({ type: "link-double-slash", route, field: "a[href]", failure: link.href, detail: `"${link.text}" links to ${link.href}; the route is ${normalized}.`, groupBy: `double-slash:${link.href}`, source: s.source, evidence: { href: link.href, target: normalized } }));
        } else if (raw !== normalized && raw.endsWith("/")) {
          const s = g();
          out.push(instance({ type: "link-trailing-slash", route, field: "a[href]", failure: link.href, detail: `"${link.text}" links to ${link.href}; the route is ${normalized} (the slash costs a redirect).`, groupBy: `trailing-slash:${link.href}`, source: s.source, evidence: { href: link.href, target: normalized } }));
        }
        if (c.hash) {
          const target = inv.rendered.get(normalized);
          if (target && !target.ids.has(c.hash)) {
            const s = g();
            out.push(
              instance({
                type: "link-broken-anchor",
                route,
                field: "a[href]",
                failure: `${normalized}#${c.hash}`,
                detail: `"${link.text}" links to ${normalized}#${c.hash}, but ${normalized} has no element with id "${c.hash}".`,
                groupBy: s.shared ? `broken-anchor:${s.files.join(",")}` : null,
                source: s.source,
                evidence: { href: link.href, text: link.text },
              })
            );
          }
        }
        continue;
      }

      // A file in public/ (a PDF, an image) or an app/ route handler.
      if (/\.[a-z0-9]{2,5}$/i.test(normalized) || existsSync(join(inv.repoRoot, "app", normalized.slice(1), "route.ts"))) {
        if (/\.[a-z0-9]{2,5}$/i.test(normalized)) {
          const res = resolveAsset(inv.assets, normalized);
          if (res.status === "missing") {
            const s = g();
            out.push(instance({ type: "link-asset-missing", route, field: "a[href]", failure: normalized, detail: `"${link.text}" links to ${normalized}, which does not exist in public/.`, groupBy: `asset:${normalized}`, source: s.source }));
          } else if (res.status === "case") {
            const s = g();
            out.push(instance({ type: "image-path-case", route, field: "a[href]", failure: normalized, detail: `"${link.text}" links to ${normalized}; the file is ${res.candidates.join(" / ")}.`, groupBy: `case:${normalized}`, source: s.source, evidence: { referenced: normalized, actual: res.candidates } }));
          }
        }
        continue;
      }

      const caseMatches = lowerRoutes.get(normalized.toLowerCase()) ?? [];
      if (caseMatches.length === 1) {
        edges.add(caseMatches[0]);
        const s = g();
        out.push(
          instance({
            type: "link-casing",
            route,
            field: "a[href]",
            failure: link.href,
            detail: `"${link.text}" links to ${link.href}, which 404s; the real route is ${caseMatches[0]} (differs only by letter case).`,
            groupBy: `casing:${link.href}`,
            source: s.source,
            evidence: { href: link.href, target: caseMatches[0] },
          })
        );
        continue;
      }

      const slug = normalized.split("/").filter(Boolean).pop();
      const suggestions = [...inv.routeSet].filter((r) => slug && r.split("/").pop() === slug);
      const s = g();
      out.push(
        instance({
          type: "link-broken-internal",
          route,
          field: "a[href]",
          failure: normalized,
          detail:
            `"${link.text}" links to ${normalized}, which does not exist.` +
            (suggestions.length === 1 ? ` The only route with that slug is ${suggestions[0]}.` : ""),
          groupBy: `broken:${normalized}`,
          source: s.source,
          evidence: { href: link.href, text: link.text, suggestions },
          reviewReason:
            suggestions.length === 1
              ? "a slug match is a likely target, not a certain one — pointing a reader somewhere new is an editorial call"
              : "there is no single unambiguous target",
        })
      );
    }
  }

  // --- technical reachability: can a crawler get there from the homepage? -----
  const reachable = new Set();
  if (inv.rendered.has("/")) {
    const queue = ["/"];
    reachable.add("/");
    while (queue.length) {
      const r = queue.shift();
      for (const next of reachableEdges.get(r) ?? []) {
        if (!reachable.has(next)) {
          reachable.add(next);
          queue.push(next);
        }
      }
    }
    for (const r of inv.routes) {
      if (r.dynamic || !inv.rendered.has(r.route) || reachable.has(r.route)) continue;
      const robots = inv.rendered.get(r.route).robots.join(",").toLowerCase();
      if (robots.includes("noindex")) continue;
      out.push(
        instance({
          type: "page-unreachable",
          route: r.route,
          field: "link graph",
          failure: "unreachable from /",
          detail: `No chain of links from the homepage — nav, footer, cards or prose — reaches ${r.route}. Only the sitemap does.`,
          reviewReason: "the fix is a real link from a related page or a registry card, which is editorial (Internal Linking Agent / Publisher)",
        })
      );
    }
  }

  // --- dev / staging URLs anywhere in source ----------------------------------
  for (const src of inv.sources) {
    let inBlock = false;
    src.lines.forEach((line, i) => {
      let code = line;
      if (inBlock) {
        const end = code.indexOf("*/");
        if (end < 0) return;
        code = code.slice(end + 2);
        inBlock = false;
      }
      if (code.includes("/*") && !code.includes("*/")) {
        inBlock = true;
        code = code.slice(0, code.indexOf("/*"));
      }
      const t = code.trimStart();
      if (t.startsWith("//") || t.startsWith("*")) return;
      for (const m of code.matchAll(/["'`](https?:\/\/[^"'`\s]+)["'`]/g)) {
        let url;
        try {
          url = new URL(m[1]);
        } catch {
          continue;
        }
        if (isDevHost(url.hostname, config)) {
          out.push(
            instance({
              type: "dev-url",
              route: null,
              field: "source literal",
              failure: m[1],
              detail: `${src.file}:${i + 1} contains the development URL ${m[1]}.`,
              groupBy: `dev-url:${m[1]}`,
              source: { file: src.file, line: i + 1 },
            })
          );
        }
      }
    });
  }

  return { instances: out, stats, reachable: reachable.size };
}
