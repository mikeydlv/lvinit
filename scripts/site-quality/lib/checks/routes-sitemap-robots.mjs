// ---------------------------------------------------------------------------
// ROUTES, SITEMAP, ROBOTS
//
// The route inventory is the filesystem: every app/**/page.tsx. The sitemap and
// robots are judged on their RENDERED output (what Google fetches), and the
// sitemap source file is only consulted to say where a fix would go.
// ---------------------------------------------------------------------------

import { instance } from "../findings.mjs";
import { classifyHref, isDevHost, normalizePath } from "../urls.mjs";

/** Is this route one that should be indexed and listed? */
export function isIndexable(route, inv, config) {
  const page = inv.rendered.get(route);
  if (!page) return true; // unknown: do not excuse it
  const robots = page.robots.join(",").toLowerCase();
  return !robots.includes("noindex");
}

export function checkRoutes(inv, config) {
  const out = [];

  // Duplicates: two files mapping to the same URL, or URLs that differ only by case.
  const byLower = new Map();
  for (const r of inv.routes) {
    const key = r.route.toLowerCase();
    byLower.set(key, [...(byLower.get(key) ?? []), r]);
  }
  for (const [key, list] of byLower) {
    if (list.length < 2) continue;
    out.push(
      instance({
        type: "route-duplicate",
        route: list[0].route,
        field: "app route",
        failure: key,
        detail: `${list.map((r) => r.file).join(" and ")} both resolve to ${key} (letter case aside). Only one can be served.`,
        evidence: { files: list.map((r) => r.file) },
      })
    );
  }

  for (const r of inv.routes) {
    if (/[A-Z]/.test(r.route)) {
      out.push(
        instance({
          type: "route-casing",
          route: r.route,
          field: "app route",
          failure: r.route,
          detail: `The route ${r.route} contains uppercase letters. LVINIT URLs are lowercase; renaming the folder changes a live URL, so this is report-only.`,
          source: { file: r.file },
        })
      );
    }
    if (!r.dynamic && inv.build.present && inv.build.fresh && !inv.rendered.has(r.route) && !inv.isServerRendered(r.route)) {
      out.push(
        instance({
          type: "route-not-rendered",
          route: r.route,
          field: "build output",
          failure: "no prerendered html",
          detail: `${r.file} exists, but the production build produced no page for ${r.route}.`,
          source: { file: r.file },
        })
      );
    }
  }
  return out;
}

export function checkSitemap(inv, config) {
  const out = [];
  const origin = config.site.origin;
  const locs = inv.sitemap.locs;
  if (!inv.build.present) return out;
  if (!locs) {
    out.push(
      instance({
        type: "sitemap-unavailable",
        route: null,
        field: "sitemap.xml",
        failure: inv.sitemap.xml === null ? "missing" : "unparseable",
        detail:
          inv.sitemap.xml === null
            ? "The build produced no sitemap.xml."
            : "sitemap.xml was produced but has no <urlset>, so no crawler can read it.",
      })
    );
    return out;
  }

  const listed = new Map(); // route -> count
  for (const loc of locs) {
    const c = classifyHref(loc, config);
    let problem = null;
    if (c.kind !== "internal" || !c.absolute) problem = "not an absolute URL on the LVINIT origin";
    else if (c.problems.length) problem = c.problems.join("; ");
    else if (c.url.search || c.url.hash) problem = "carries a query string or fragment";
    else if (/[A-Z]/.test(c.path)) problem = "contains uppercase letters";
    else if (c.path !== "/" && c.path.endsWith("/")) problem = "has a trailing slash";
    if (c.url && isDevHost(c.url.hostname, config)) problem = "points at a development or staging host";

    if (problem) {
      out.push(
        instance({
          type: "sitemap-malformed-url",
          route: c.path ? normalizePath(c.path) : null,
          field: "sitemap <loc>",
          failure: `${loc} ${problem}`,
          detail: `The sitemap entry ${loc} ${problem}.`,
          source: { file: config.site.sitemapSource },
        })
      );
    }
    if (c.kind === "internal") {
      const route = normalizePath(c.path);
      listed.set(route, (listed.get(route) ?? 0) + 1);
    }
  }

  for (const [route, count] of listed) {
    if (count > 1) {
      out.push(
        instance({
          type: "sitemap-duplicate",
          route,
          field: "sitemap <loc>",
          failure: `${route} x${count}`,
          detail: `${origin}${route === "/" ? "/" : route} is listed ${count} times.`,
          source: { file: config.site.sitemapSource },
        })
      );
    }
    if (!inv.routeSet.has(route)) {
      out.push(
        instance({
          type: "sitemap-stale-route",
          route,
          field: "sitemap <loc>",
          failure: route,
          detail: `The sitemap lists ${route}, but no page file serves it — Google is being sent to a 404.`,
          source: { file: config.site.sitemapSource },
        })
      );
      continue;
    }
    const page = inv.rendered.get(route);
    if (page && !isIndexable(route, inv, config)) {
      out.push(
        instance({
          type: "sitemap-noindex-conflict",
          route,
          field: "sitemap vs robots meta",
          failure: route,
          detail: `${route} is in the sitemap but tells crawlers noindex. One of the two is wrong.`,
        })
      );
    }
    if (page && page.canonicals.length === 1) {
      const cc = classifyHref(page.canonicals[0], config);
      if (cc.kind === "internal" && normalizePath(cc.path) !== route) {
        out.push(
          instance({
            type: "sitemap-canonical-conflict",
            route,
            field: "sitemap vs canonical",
            failure: `${route} -> ${normalizePath(cc.path)}`,
            detail: `${route} is in the sitemap but canonicalizes to ${normalizePath(cc.path)}.`,
            groupBy: `canonical-target:${normalizePath(cc.path)}`,
          })
        );
      }
    }
  }

  const excluded = new Set(config.site.sitemapExcludedRoutes);
  for (const r of inv.routes) {
    if (r.dynamic || excluded.has(r.route) || listed.has(r.route)) continue;
    if (!isIndexable(r.route, inv, config)) continue;
    out.push(
      instance({
        type: "sitemap-missing-route",
        route: r.route,
        field: "sitemap",
        failure: r.route,
        detail: `${r.route} is a published, indexable page but is not in the sitemap.`,
        evidence: { section: r.section, file: r.file },
        source: { file: config.site.sitemapSource },
      })
    );
  }
  return out;
}

/** Does a robots path pattern match a route? Supports * and $ as Google does. */
export function robotsPatternMatches(pattern, route) {
  if (!pattern) return false;
  const anchored = pattern.endsWith("$");
  const body = anchored ? pattern.slice(0, -1) : pattern;
  const re = new RegExp(`^${body.split("*").map((s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join(".*")}${anchored ? "$" : ""}`);
  return re.test(route);
}

/** Longest-match allow/disallow decision for one route, as Google applies it. */
export function robotsAllows(group, route) {
  let best = { len: -1, allow: true };
  for (const [kind, list] of [["allow", group.allow], ["disallow", group.disallow]]) {
    for (const p of list) {
      if (p === "") continue; // "Disallow:" with no value allows everything
      if (!robotsPatternMatches(p, route)) continue;
      const len = p.length;
      if (len > best.len || (len === best.len && kind === "allow")) best = { len, allow: kind === "allow" };
    }
  }
  return best.allow;
}

export function checkRobots(inv, config) {
  const out = [];
  if (!inv.build.present) return out;
  const parsed = inv.robots.parsed;
  if (!parsed) {
    out.push(
      instance({
        type: "robots-unavailable",
        route: null,
        field: "robots.txt",
        failure: "missing",
        detail: "The build produced no robots.txt.",
        source: { file: config.site.robotsSource },
      })
    );
    return out;
  }

  for (const m of parsed.malformed) {
    out.push(
      instance({
        type: "robots-malformed",
        route: null,
        field: "robots.txt",
        failure: m.text.trim(),
        detail: `robots.txt line ${m.line} ("${m.text.trim()}") is not a directive crawlers understand.`,
        source: { file: config.site.robotsSource },
      })
    );
  }

  // The groups that govern Google: a googlebot group if there is one, else "*".
  const google = parsed.groups.find((g) => g.agents.includes("googlebot")) ?? parsed.groups.find((g) => g.agents.includes("*"));
  if (google) {
    if (!robotsAllows(google, "/")) {
      out.push(
        instance({
          type: "robots-blocks-site",
          route: "/",
          field: "robots.txt",
          failure: `disallow / for ${google.agents.join(",")}`,
          detail: "robots.txt disallows the homepage for Google — that blocks indexing of the whole site.",
          source: { file: config.site.robotsSource },
        })
      );
    } else {
      const listed = new Set((inv.sitemap.locs ?? []).map((l) => {
        const c = classifyHref(l, config);
        return c.kind === "internal" ? normalizePath(c.path) : null;
      }).filter(Boolean));
      for (const route of listed) {
        if (!robotsAllows(google, route)) {
          out.push(
            instance({
              type: "robots-blocks-route",
              route,
              field: "robots.txt",
              failure: route,
              detail: `${route} is in the sitemap but robots.txt disallows it.`,
              groupBy: "robots-disallow",
              source: { file: config.site.robotsSource },
            })
          );
        }
      }
    }
  }

  const expected = `${config.site.origin}/sitemap.xml`;
  if (parsed.sitemaps.length === 0) {
    out.push(
      instance({
        type: "robots-missing-sitemap",
        route: null,
        field: "robots.txt Sitemap",
        failure: "missing",
        detail: `robots.txt has no Sitemap line; LVINIT's convention is "Sitemap: ${expected}".`,
        source: { file: config.site.robotsSource },
      })
    );
  } else if (!parsed.sitemaps.includes(expected)) {
    out.push(
      instance({
        type: "robots-sitemap-mismatch",
        route: null,
        field: "robots.txt Sitemap",
        failure: parsed.sitemaps.join(","),
        detail: `robots.txt points at ${parsed.sitemaps.join(", ")} instead of ${expected}.`,
        source: { file: config.site.robotsSource },
      })
    );
  }
  for (const s of [...parsed.sitemaps, ...parsed.hosts]) {
    const c = classifyHref(s, config);
    if (c.url && isDevHost(c.url.hostname, config)) {
      out.push(
        instance({
          type: "dev-url",
          route: null,
          field: "robots.txt",
          failure: s,
          detail: `robots.txt references ${s}, a development or staging host.`,
          source: { file: config.site.robotsSource },
        })
      );
    }
  }
  return out;
}
