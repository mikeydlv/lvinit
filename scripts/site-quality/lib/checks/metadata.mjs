// ---------------------------------------------------------------------------
// METADATA AND CANONICALS — judged on the rendered <head>
//
// LVINIT's root layout sets `alternates.canonical: "/"`. Any page that forgets
// its own `alternates` (or `buildStoryMetadata`) silently inherits the
// homepage's canonical. Reading the rendered <head> is what catches that.
// ---------------------------------------------------------------------------

import { instance } from "../findings.mjs";
import { classifyHref, isDevHost, normalizePath } from "../urls.mjs";
import { resolveAsset } from "../inventory.mjs";

function pageFile(inv, route) {
  return inv.routes.find((r) => r.route === route)?.file ?? null;
}

export function checkMetadata(inv, config) {
  const out = [];
  const titles = new Map();
  const descriptions = new Map();
  const intentionalNoindex = new Set(config.site.intentionalNoindexRoutes);

  for (const [route, page] of inv.rendered) {
    const file = pageFile(inv, route);
    const title = (page.titles[0] ?? "").trim();
    const description = (page.descriptions[0] ?? "").trim();

    if (!title) {
      out.push(
        instance({
          type: "title-missing",
          route,
          field: "<title>",
          failure: "missing",
          detail: `${route} renders no <title>.`,
          source: file ? { file } : null,
          reviewReason: "a title is editorial and SEO strategy; the agent never writes one",
          publisherHandoff: { route, need: "write a page title" },
        })
      );
    } else {
      titles.set(title, [...(titles.get(title) ?? []), route]);
    }
    if (!description) {
      out.push(
        instance({
          type: "description-missing",
          route,
          field: "meta description",
          failure: "missing",
          detail: `${route} renders no meta description.`,
          source: file ? { file } : null,
          reviewReason: "no trusted canonical source for the description exists in the repo; writing one is editorial",
          publisherHandoff: { route, need: "write a meta description" },
        })
      );
    } else {
      descriptions.set(description, [...(descriptions.get(description) ?? []), route]);
    }

    // --- canonical ---------------------------------------------------------
    const distinct = [...new Set(page.canonicals)];
    if (distinct.length === 0) {
      out.push(
        instance({
          type: "canonical-missing",
          route,
          field: "canonical",
          failure: "missing",
          detail: `${route} renders no canonical link. Every LVINIT page is expected to carry one.`,
          source: file ? { file } : null,
        })
      );
    } else if (distinct.length > 1) {
      out.push(
        instance({
          type: "canonical-multiple",
          route,
          field: "canonical",
          failure: distinct.join(" | "),
          detail: `${route} renders ${distinct.length} different canonicals (${distinct.join(", ")}).`,
          source: file ? { file } : null,
        })
      );
    } else {
      const href = distinct[0];
      const c = classifyHref(href, config);
      const path = c.path ? normalizePath(c.path) : null;
      if (c.url && isDevHost(c.url.hostname, config)) {
        out.push(
          instance({
            type: "dev-url",
            route,
            field: "canonical",
            failure: href,
            detail: `${route}'s canonical points at ${href}, a development or staging host.`,
            source: file ? { file } : null,
          })
        );
      } else if (c.kind !== "internal" || !c.absolute) {
        out.push(
          instance({
            type: "canonical-malformed",
            route,
            field: "canonical",
            failure: href,
            detail: `${route}'s canonical "${href}" is not an absolute URL on ${config.site.origin}.`,
            source: file ? { file } : null,
          })
        );
      } else {
        const problems = [...c.problems];
        if (c.url.search) problems.push("carries a query string");
        if (c.url.hash) problems.push("carries a fragment");
        if (c.path !== "/" && c.path.endsWith("/")) problems.push("has a trailing slash");
        if (/\/\//.test(c.path)) problems.push("has a double slash");
        const caseOnly = path !== route && path?.toLowerCase() === route.toLowerCase();
        if (caseOnly) problems.push(`differs from the route ${route} only by letter case`);
        if (problems.length) {
          out.push(
            instance({
              type: "canonical-malformed",
              route,
              field: "canonical",
              failure: href,
              detail: `${route}'s canonical ${href} ${problems.join("; ")}.`,
              evidence: { canonical: href, expected: `${config.site.origin}${route === "/" ? "" : route}`, problems },
              source: file ? { file } : null,
            })
          );
        } else if (path !== route) {
          out.push(
            instance({
              type: "canonical-mismatch",
              route,
              field: "canonical",
              failure: `-> ${path}`,
              detail: `${route}'s canonical points at ${path}${inv.routeSet.has(path) ? "" : " (which does not exist)"}, so Google is told to index a different URL.`,
              groupBy: `canonical-target:${path}`,
              evidence: { canonical: href, target: path, targetExists: inv.routeSet.has(path) },
              source: file ? { file } : null,
              reviewReason: inv.routeSet.has(path)
                ? "a canonical that points at another real page may be a deliberate consolidation; that is an SEO decision"
                : null,
            })
          );
        }
      }

      if (page.ogUrl) {
        const o = classifyHref(page.ogUrl, config);
        if (o.kind === "internal" && path && normalizePath(o.path) !== path) {
          out.push(
            instance({
              type: "og-url-mismatch",
              route,
              field: "og:url",
              failure: `${normalizePath(o.path)} vs ${path}`,
              detail: `${route}'s og:url (${page.ogUrl}) disagrees with its canonical (${href}).`,
              groupBy: `og-url:${normalizePath(o.path)}`,
              groupDetail: `These pages set their own canonical but not openGraph.url, so they inherit og:url ${page.ogUrl} from a parent layout; shares are attributed to the wrong URL.`,
              source: file ? { file } : null,
            })
          );
        }
      }
    }

    // --- robots meta -------------------------------------------------------
    const robots = page.robots.join(",").toLowerCase();
    if (robots.includes("noindex") && !intentionalNoindex.has(route)) {
      out.push(
        instance({
          type: "noindex-unexpected",
          route,
          field: "robots meta",
          failure: "noindex",
          detail: `${route} tells search engines not to index it (robots: "${page.robots.join(", ")}").`,
          severity: route === "/" ? "CRITICAL" : null,
          groupBy: "noindex",
          source: file ? { file } : null,
        })
      );
    }
    if (robots.includes("nofollow") && !intentionalNoindex.has(route)) {
      out.push(
        instance({
          type: "nofollow-unexpected",
          route,
          field: "robots meta",
          failure: "nofollow",
          detail: `${route} tells search engines not to follow its links.`,
          groupBy: "nofollow",
          source: file ? { file } : null,
        })
      );
    }

    // --- social images ------------------------------------------------------
    for (const img of new Set([...page.ogImages, ...page.twitterImages])) {
      const c = classifyHref(img, config);
      if (c.url && isDevHost(c.url.hostname, config)) {
        out.push(
          instance({ type: "dev-url", route, field: "og:image", failure: img, detail: `${route}'s share image is on a development host (${img}).` })
        );
        continue;
      }
      if (c.kind !== "internal") continue;
      const res = resolveAsset(inv.assets, c.path);
      if (res.status === "missing") {
        out.push(
          instance({
            type: "og-image-missing",
            route,
            field: "og:image",
            failure: res.path,
            detail: `${route}'s share image ${res.path} does not exist in public/.`,
            groupBy: `og-image:${res.path}`,
            source: file ? { file } : null,
          })
        );
      } else if (res.status === "ok" && res.bytes > config.severity.ogImageMaxBytes) {
        out.push(
          instance({
            type: "og-image-oversized",
            route,
            field: "og:image",
            failure: res.exact,
            detail: `${route}'s share image ${res.exact} is ${(res.bytes / 1e6).toFixed(1)} MB; social crawlers commonly reject images over 5 MB.`,
            groupBy: `oversized:${res.exact}`,
          })
        );
      }
    }
  }

  for (const [title, routes] of titles) {
    if (routes.length < 2) continue;
    for (const route of routes) {
      out.push(
        instance({
          type: "title-duplicate",
          route,
          field: "<title>",
          failure: title,
          detail: `${routes.length} pages share the title "${title}": ${routes.join(", ")}.`,
          groupBy: `title:${title}`,
          reviewReason: "choosing which page keeps the title is editorial",
          publisherHandoff: { route, need: `differentiate the duplicated title "${title}"` },
        })
      );
    }
  }
  for (const [description, routes] of descriptions) {
    if (routes.length < 2) continue;
    for (const route of routes) {
      out.push(
        instance({
          type: "description-duplicate",
          route,
          field: "meta description",
          failure: description,
          detail: `${routes.length} pages share one meta description: ${routes.join(", ")}.`,
          groupBy: `description:${description}`,
          reviewReason: "rewriting a description is editorial",
          publisherHandoff: { route, need: "differentiate a duplicated meta description" },
        })
      );
    }
  }
  return out;
}
