// ---------------------------------------------------------------------------
// STRUCTURED DATA — every rendered <script type="application/ld+json">
//
// LVINIT's schema comes from one helper (lib/story.ts buildStoryJsonLd):
// Article + BreadcrumbList, plus a VideoObject when a story has a video. The
// checks validate that shape mechanically. They never judge whether a schema
// CLAIM is true — that is the Publisher's and Fact-Decay's territory — and they
// never propose adding a claim.
// ---------------------------------------------------------------------------

import { instance } from "../findings.mjs";
import { classifyHref, isDevHost, normalizePath } from "../urls.mjs";
import { resolveAsset } from "../inventory.mjs";

const ARTICLE_TYPES = new Set(["Article", "NewsArticle", "BlogPosting", "Report"]);
const ISO_DATE = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}(:\d{2}(\.\d+)?)?(Z|[+-]\d{2}:?\d{2})?)?$/;

export function isValidIsoDate(value) {
  if (typeof value !== "string" || !ISO_DATE.test(value)) return false;
  const d = new Date(value.length === 10 ? `${value}T00:00:00Z` : value);
  if (Number.isNaN(d.getTime())) return false;
  // Reject rollovers like 2026-02-30.
  return value.length !== 10 || d.toISOString().slice(0, 10) === value;
}

const typesOf = (node) => (Array.isArray(node?.["@type"]) ? node["@type"] : [node?.["@type"]]).filter(Boolean);

/** Flatten a parsed JSON-LD block into its entity nodes. */
export function schemaNodes(parsed) {
  const roots = Array.isArray(parsed) ? parsed : [parsed];
  const nodes = [];
  for (const root of roots) {
    if (root && Array.isArray(root["@graph"])) nodes.push(...root["@graph"]);
    else if (root && typeof root === "object") nodes.push(root);
  }
  return nodes;
}

function urlOf(value) {
  if (!value) return null;
  if (typeof value === "string") return value;
  if (typeof value === "object") return value["@id"] ?? value.url ?? null;
  return null;
}

/** Parse and index a page's JSON-LD. Exposed for the video check. */
export function readPageSchema(page) {
  const blocks = [];
  const errors = [];
  page.jsonLd.forEach((text, i) => {
    try {
      blocks.push({ index: i, text: text.trim(), parsed: JSON.parse(text) });
    } catch (err) {
      errors.push({ index: i, error: err.message, excerpt: text.trim().slice(0, 120) });
    }
  });
  const nodes = blocks.flatMap((b) => schemaNodes(b.parsed));
  return { blocks, errors, nodes };
}

export function checkSchema(inv, config, { today }) {
  const out = [];
  const origin = config.site.origin;

  const assetCheck = (route, field, url, file) => {
    const c = classifyHref(url, config);
    if (c.url && isDevHost(c.url.hostname, config)) {
      out.push(instance({ type: "dev-url", route, field, failure: url, detail: `${route}'s ${field} points at ${url}, a development host.`, source: file ? { file } : null }));
      return;
    }
    if (c.kind !== "internal") return;
    const res = resolveAsset(inv.assets, c.path);
    if (res.status === "missing") {
      out.push(
        instance({
          type: "schema-asset-missing",
          route,
          field,
          failure: res.path,
          detail: `${route}'s ${field} names ${res.path}, which does not exist in public/.`,
          groupBy: `schema-asset:${res.path}`,
          source: file ? { file } : null,
        })
      );
    } else if (res.status === "case") {
      out.push(
        instance({
          type: "image-path-case",
          route,
          field,
          failure: res.path,
          detail: `${route}'s ${field} names ${res.path}; the file on disk is ${res.candidates.join(" / ")}. Works on Windows, 404s on Vercel.`,
          groupBy: `case:${res.path}`,
          evidence: { referenced: res.path, actual: res.candidates },
        })
      );
    }
  };

  // Which rendered pages carry an Article, by page kind (prefix + depth).
  const hasArticle = new Map();
  for (const [route, page] of inv.rendered) {
    hasArticle.set(route, readPageSchema(page).nodes.some((n) => typesOf(n).some((t) => ARTICLE_TYPES.has(t))));
  }
  const kindOf = (route) => {
    const prefix = config.site.articleSchemaPrefixes.find((p) => route.startsWith(p));
    return prefix ? `${prefix}|${route.split("/").filter(Boolean).length}` : null;
  };
  const peerArticleShare = (route) => {
    const kind = kindOf(route);
    if (!kind) return null;
    const others = [...hasArticle.keys()].filter((r) => r !== route && kindOf(r) === kind);
    if (others.length < 2) return null;
    const withArticle = others.filter((r) => hasArticle.get(r)).length;
    return { total: others.length, with: withArticle, share: withArticle / others.length, label: kind.split("|")[0].replace(/\//g, "") };
  };

  for (const [route, page] of inv.rendered) {
    const file = inv.routes.find((r) => r.route === route)?.file ?? null;
    const { blocks, errors, nodes } = readPageSchema(page);

    for (const e of errors) {
      out.push(
        instance({
          type: "schema-parse-error",
          route,
          field: `ld+json #${e.index + 1}`,
          failure: e.error,
          detail: `${route}'s JSON-LD block ${e.index + 1} does not parse (${e.error}).`,
          source: file ? { file } : null,
        })
      );
    }
    for (const b of blocks) {
      const roots = Array.isArray(b.parsed) ? b.parsed : [b.parsed];
      if (roots.some((r) => !/schema\.org/i.test(String(r?.["@context"] ?? "")))) {
        out.push(
          instance({
            type: "schema-missing-context",
            route,
            field: `ld+json #${b.index + 1}`,
            failure: "no schema.org @context",
            detail: `${route}'s JSON-LD block ${b.index + 1} has no schema.org @context, so parsers cannot read its types.`,
            source: file ? { file } : null,
          })
        );
      }
    }
    const texts = blocks.map((b) => b.text);
    if (new Set(texts).size < texts.length) {
      out.push(
        instance({
          type: "schema-duplicate-entity",
          route,
          field: "ld+json",
          failure: "identical block rendered twice",
          detail: `${route} renders the same JSON-LD block more than once.`,
          source: file ? { file } : null,
        })
      );
    }

    const articles = nodes.filter((n) => typesOf(n).some((t) => ARTICLE_TYPES.has(t)));
    const crumbs = nodes.filter((n) => typesOf(n).includes("BreadcrumbList"));
    for (const [label, list] of [["Article", articles], ["BreadcrumbList", crumbs]]) {
      if (list.length > 1) {
        out.push(
          instance({
            type: "schema-duplicate-entity",
            route,
            field: label,
            failure: `${list.length} ${label} entities`,
            detail: `${route} declares ${list.length} ${label} entities; one page should describe itself once.`,
            source: file ? { file } : null,
          })
        );
      }
    }

    // "Schema type matches page pattern" is decided by the page's peers, not a
    // hardcoded rule: a story page lacks Article only when most pages of the
    // same kind carry one.
    const peers = peerArticleShare(route);
    if (peers && peers.share >= 0.5 && articles.length === 0) {
      out.push(
        instance({
          type: "schema-missing-article",
          route,
          field: "Article",
          failure: "none",
          detail: `${route} renders no Article schema, while ${peers.with} of ${peers.total} other ${peers.label} pages do (StoryPage / buildStoryJsonLd emits it).`,
          source: file ? { file } : null,
          reviewReason: "adding schema means asserting a headline, author and dates — that is the Publisher's content",
          publisherHandoff: { route, need: "add Article schema via StoryMeta/StoryPage" },
        })
      );
    }

    for (const a of articles) {
      for (const field of ["mainEntityOfPage", "url"]) {
        const u = urlOf(a[field]);
        if (!u) continue;
        const c = classifyHref(u, config);
        if (c.url && isDevHost(c.url.hostname, config)) {
          out.push(instance({ type: "dev-url", route, field: `Article.${field}`, failure: u, detail: `${route}'s Article.${field} is on a development host (${u}).`, source: file ? { file } : null }));
          continue;
        }
        const path = c.path ? normalizePath(c.path) : null;
        if (c.kind !== "internal" || !c.absolute || c.problems.length || path !== route) {
          out.push(
            instance({
              type: "schema-url-mismatch",
              route,
              field: `Article.${field}`,
              failure: u,
              detail: `${route}'s Article.${field} is ${u}, not ${origin}${route}.`,
              evidence: { value: u, expected: `${origin}${route}`, path },
              source: file ? { file } : null,
            })
          );
        }
      }

      const published = a.datePublished;
      const modified = a.dateModified;
      if (published !== undefined && !isValidIsoDate(published)) {
        out.push(instance({ type: "schema-bad-date", route, field: "Article.datePublished", failure: String(published), detail: `${route}'s datePublished "${published}" is not a valid ISO date.`, source: file ? { file } : null }));
      } else if (published && today && published.slice(0, 10) > today) {
        out.push(instance({ type: "schema-bad-date", route, field: "Article.datePublished", failure: `future ${published}`, detail: `${route}'s datePublished (${published}) is after today (${today}).`, source: file ? { file } : null }));
      }
      if (modified !== undefined && !isValidIsoDate(modified)) {
        out.push(instance({ type: "schema-bad-date", route, field: "Article.dateModified", failure: String(modified), detail: `${route}'s dateModified "${modified}" is not a valid ISO date.`, source: file ? { file } : null }));
      } else if (published && modified && isValidIsoDate(published) && modified.slice(0, 10) < published.slice(0, 10)) {
        out.push(instance({ type: "schema-bad-date", route, field: "Article.dateModified", failure: `${modified} < ${published}`, detail: `${route}'s dateModified (${modified}) is before its datePublished (${published}).`, source: file ? { file } : null }));
      }
      const needsDate = config.site.datePublishedRequiredPrefixes.some((p) => route.startsWith(p));
      if (needsDate && !published) {
        out.push(
          instance({
            type: "schema-missing-date",
            route,
            field: "Article.datePublished",
            failure: "missing",
            detail: `${route}'s Article has no datePublished. The registry contract requires one matching lib/content.ts publishedAt.`,
            source: file ? { file } : null,
            reviewReason: "a publication date must be real; the agent never supplies one",
            publisherHandoff: { route, need: "confirm the real publication date and set StoryMeta.datePublished" },
          })
        );
      }

      const image = urlOf(a.image) ?? (Array.isArray(a.image) ? urlOf(a.image[0]) : null);
      if (image) assetCheck(route, "Article.image", image, file);
      const logo = urlOf(a.publisher?.logo);
      if (logo) assetCheck(route, "Article.publisher.logo", logo, file);
    }

    for (const bl of crumbs) {
      const items = Array.isArray(bl.itemListElement) ? bl.itemListElement : [];
      items.forEach((item, i) => {
        const u = urlOf(item?.item);
        if (!u) return;
        const c = classifyHref(u, config);
        if (c.kind !== "internal") return;
        const path = normalizePath(c.path);
        if (!inv.routeSet.has(path)) {
          out.push(
            instance({
              type: "schema-breadcrumb-broken",
              route,
              field: `BreadcrumbList[${i + 1}]`,
              failure: path,
              detail: `${route}'s breadcrumb "${item.name ?? ""}" points at ${path}, which does not exist.`,
              groupBy: `breadcrumb:${path}`,
              source: file ? { file } : null,
            })
          );
        }
        if (i === items.length - 1 && path !== route) {
          out.push(
            instance({
              type: "schema-url-mismatch",
              route,
              field: "BreadcrumbList last item",
              failure: u,
              detail: `${route}'s last breadcrumb is ${u}; the last crumb should be the page itself.`,
              evidence: { value: u, expected: `${origin}${route}`, path },
              source: file ? { file } : null,
            })
          );
        }
      });
    }

    for (const v of nodes.filter((n) => typesOf(n).includes("VideoObject"))) {
      const thumb = urlOf(v.thumbnailUrl) ?? (Array.isArray(v.thumbnailUrl) ? v.thumbnailUrl[0] : null);
      if (thumb) assetCheck(route, "VideoObject.thumbnailUrl", thumb, file);
      if (v.uploadDate !== undefined && !isValidIsoDate(v.uploadDate)) {
        out.push(instance({ type: "schema-bad-date", route, field: "VideoObject.uploadDate", failure: String(v.uploadDate), detail: `${route}'s VideoObject uploadDate "${v.uploadDate}" is not a valid ISO date.`, source: file ? { file } : null }));
      }
    }
  }
  return out;
}
