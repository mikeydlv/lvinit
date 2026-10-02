// ---------------------------------------------------------------------------
// CONTENT REGISTRY and VIDEO / EMBEDS
//
// lib/content.ts documents its own contract, and these checks enforce exactly
// that contract — nothing more:
//
//   * every published piece has one `guides` entry, whose `href` is the real
//     route and whose `publishedAt` MATCHES the page's StoryMeta.datePublished
//   * a card image is either a real photo WITH imageAlt, or an editorial cover
//     WITHOUT one
//   * every `videos` entry needs a poster at /public/images/video-<id>.jpg
//
// Video checks are structural: a YouTube id is 11 characters of [A-Za-z0-9_-],
// a poster file exists, and a page's VideoObject schema names a video the page
// actually shows. Nothing is fetched from YouTube.
// ---------------------------------------------------------------------------

import { instance } from "../findings.mjs";
import { classifyHref, findLiteral, normalizePath } from "../urls.mjs";
import { resolveAsset } from "../inventory.mjs";
import { isValidIsoDate, readPageSchema } from "./schema.mjs";

export const YOUTUBE_ID = /^[A-Za-z0-9_-]{11}$/;

/** The id in a YouTube embed/watch/short URL, or null. */
export function youtubeIdFromUrl(value) {
  if (!value) return null;
  let url;
  try {
    url = new URL(value);
  } catch {
    return null;
  }
  if (!/(^|\.)youtube(-nocookie)?\.com$|(^|\.)youtu\.be$/.test(url.hostname)) return null;
  if (url.hostname.endsWith("youtu.be")) return url.pathname.slice(1).split("/")[0] || "";
  const embed = /^\/(?:embed|shorts|live|v)\/([^/?#]*)/.exec(url.pathname);
  if (embed) return embed[1];
  return url.searchParams.get("v") ?? "";
}

function registryLine(inv, config, slug) {
  const hits = findLiteral(inv.sources, slug).filter((h) => h.file === config.site.registryFile);
  return hits[0] ? { file: config.site.registryFile, line: hits[0].line } : { file: config.site.registryFile };
}

function articleDate(page) {
  const { nodes } = readPageSchema(page);
  const article = nodes.find((n) => [].concat(n?.["@type"]).some((t) => ["Article", "NewsArticle", "BlogPosting"].includes(t)));
  return article?.datePublished ?? null;
}

export function checkRegistry(inv, config) {
  const out = [];
  if (!inv.registry.ok) {
    out.push(
      instance({
        type: "registry-unavailable",
        route: null,
        field: config.site.registryFile,
        failure: "unreadable",
        detail: `The content registry could not be read: ${inv.registry.reason}. Registry checks were skipped.`,
      })
    );
    return { instances: out, stats: { guides: 0, videos: 0 } };
  }
  const { guides, videos } = inv.registry;
  const sitemapRoutes = new Set(
    (inv.sitemap.locs ?? []).map((l) => classifyHref(l, config)).filter((c) => c.kind === "internal").map((c) => normalizePath(c.path))
  );

  const bySlug = new Map();
  const byHref = new Map();
  for (const g of guides) {
    bySlug.set(g.slug, [...(bySlug.get(g.slug) ?? []), g]);
    if (g.href) byHref.set(normalizePath(g.href), [...(byHref.get(normalizePath(g.href)) ?? []), g]);
  }
  for (const [slug, list] of bySlug) {
    if (list.length > 1) {
      out.push(instance({ type: "registry-duplicate", route: null, field: "guides[].slug", failure: slug, detail: `${list.length} registry entries share the slug "${slug}".`, source: registryLine(inv, config, slug) }));
    }
  }
  for (const [href, list] of byHref) {
    if (list.length > 1) {
      out.push(
        instance({
          type: "registry-duplicate",
          route: href,
          field: "guides[].href",
          failure: href,
          detail: `${list.length} registry entries (${list.map((g) => g.slug).join(", ")}) link to ${href}, so it can appear twice in a feed.`,
          source: registryLine(inv, config, list[1].slug),
        })
      );
    }
  }

  for (const g of guides) {
    const src = registryLine(inv, config, g.slug);
    const draft = g.status === "draft";
    const route = g.href ? normalizePath(classifyHref(g.href, config).path ?? g.href) : null;

    if (route && !draft && !inv.routeSet.has(route)) {
      out.push(
        instance({
          type: "registry-href-broken",
          route,
          field: `guides["${g.slug}"].href`,
          failure: g.href,
          detail: `The registry card "${g.slug}" links to ${g.href}, which does not exist — its card on /guides and the homepage goes to a 404.`,
          source: src,
        })
      );
    }
    if (draft && route && sitemapRoutes.has(route) && inv.routeSet.has(route)) {
      out.push(
        instance({
          type: "registry-draft-live",
          route,
          field: `guides["${g.slug}"].status`,
          failure: "draft but live",
          detail: `"${g.slug}" is marked draft in the registry, but ${route} is live and in the sitemap.`,
          source: src,
          reviewReason: "whether the piece is published is an editorial decision",
        })
      );
    }

    if (!draft && g.href) {
      if (!g.publishedAt) {
        out.push(
          instance({
            type: "registry-missing-date",
            route,
            field: `guides["${g.slug}"].publishedAt`,
            failure: "missing",
            detail: `"${g.slug}" has no publishedAt, so publishedGuides drops it from /guides and the homepage feed.`,
            source: src,
            reviewReason: "a publication date must be real; the agent never supplies one",
            publisherHandoff: { route, need: "confirm the real publication date and set publishedAt" },
          })
        );
      } else if (!isValidIsoDate(g.publishedAt) || g.publishedAt.length !== 10) {
        out.push(instance({ type: "registry-date-invalid", route, field: `guides["${g.slug}"].publishedAt`, failure: g.publishedAt, detail: `"${g.slug}" has publishedAt "${g.publishedAt}", which is not a valid YYYY-MM-DD date.`, source: src }));
      } else if (route && inv.rendered.has(route)) {
        const pageDate = articleDate(inv.rendered.get(route));
        if (pageDate && pageDate.slice(0, 10) !== g.publishedAt) {
          out.push(
            instance({
              type: "registry-date-mismatch",
              route,
              field: `guides["${g.slug}"].publishedAt`,
              failure: `${g.publishedAt} vs ${pageDate}`,
              detail: `The registry says "${g.slug}" was published ${g.publishedAt}; the page's Article schema says ${pageDate}. lib/content.ts requires them to match.`,
              evidence: { registry: g.publishedAt, page: pageDate },
              source: src,
              reviewReason: "which date is the real one is an editorial fact; the agent never changes a date",
              publisherHandoff: { route, need: `reconcile publishedAt (${g.publishedAt}) with datePublished (${pageDate})` },
            })
          );
        }
      }
    }

    if (g.image) {
      const res = resolveAsset(inv.assets, g.image);
      if (res.status === "missing") {
        out.push(instance({ type: "registry-image-missing", route, field: `guides["${g.slug}"].image`, failure: res.path, detail: `The card image for "${g.slug}" (${g.image}) does not exist.`, groupBy: `missing:${res.path}`, source: src }));
      } else if (res.status === "case") {
        out.push(instance({ type: "image-path-case", route, field: `guides["${g.slug}"].image`, failure: res.path, detail: `The card image for "${g.slug}" is ${g.image}; the file is ${res.candidates.join(" / ")}.`, groupBy: `case:${res.path}`, source: src, evidence: { referenced: res.path, actual: res.candidates } }));
      } else if (res.status === "untracked") {
        out.push(instance({ type: "image-untracked", route, field: `guides["${g.slug}"].image`, failure: res.exact, detail: `${res.exact} exists locally but is not committed.`, groupBy: `untracked:${res.exact}`, source: src }));
      }
      const mode = g.imageMode ?? "photo";
      if (mode === "photo" && !(g.imageAlt ?? "").trim()) {
        out.push(
          instance({
            type: "registry-photo-alt-missing",
            route,
            field: `guides["${g.slug}"].imageAlt`,
            failure: "missing",
            detail: `"${g.slug}"'s card image is a photograph (imageMode photo) but has no imageAlt; the registry requires one.`,
            source: src,
            reviewReason: "alt text is editorial; the agent never writes it",
            publisherHandoff: { route, need: `write imageAlt for the "${g.slug}" card photo` },
          })
        );
      } else if (mode === "editorial-cover" && (g.imageAlt ?? "").trim()) {
        out.push(instance({ type: "registry-cover-has-alt", route, field: `guides["${g.slug}"].imageAlt`, failure: "present", detail: `"${g.slug}" is an editorial cover but carries imageAlt; the registry convention treats covers as decorative.`, source: src }));
      }
    }
  }

  const registered = new Set([...byHref.keys()]);
  for (const r of inv.routes) {
    if (r.dynamic || !inv.rendered.has(r.route)) continue;
    if (!config.site.registryRequiredPrefixes.some((p) => r.route.startsWith(p))) continue;
    if (registered.has(r.route)) continue;
    const robots = inv.rendered.get(r.route).robots.join(",").toLowerCase();
    if (robots.includes("noindex")) continue;
    out.push(
      instance({
        type: "registry-missing-entry",
        route: r.route,
        field: "guides[]",
        failure: "no entry",
        detail: `${r.route} is live but has no lib/content.ts entry, so it never appears on /guides or in the homepage feed.`,
        source: { file: r.file },
        reviewReason: "a registry entry needs a dek, category, date and card image — all editorial",
        publisherHandoff: { route: r.route, need: "add the lib/content.ts registry entry" },
      })
    );
  }

  // --- videos registry ----------------------------------------------------
  const ids = new Map();
  for (const v of videos) {
    ids.set(v.id, (ids.get(v.id) ?? 0) + 1);
    const src = registryLine(inv, config, v.id);
    if (v.youtubeId !== undefined && !YOUTUBE_ID.test(v.youtubeId)) {
      out.push(instance({ type: "video-id-malformed", route: "/", field: `videos["${v.id}"].youtubeId`, failure: String(v.youtubeId), detail: `The homepage video "${v.id}" has youtubeId "${v.youtubeId}", which is not an 11-character YouTube id.`, source: src }));
    }
    const poster = `/images/video-${v.id}.jpg`;
    const res = resolveAsset(inv.assets, poster);
    if (res.status !== "ok") {
      out.push(
        instance({
          type: res.status === "case" ? "image-path-case" : res.status === "untracked" ? "image-untracked" : "video-poster-missing",
          route: "/",
          field: `videos["${v.id}"] poster`,
          failure: poster,
          detail: `The homepage video "${v.id}" needs its poster at ${poster} (components/Videos.tsx builds that path), and it is ${res.status === "case" ? `only there as ${res.candidates.join(" / ")}` : res.status === "untracked" ? "not committed" : "missing"}.`,
          groupBy: `${res.status === "case" ? "case" : res.status === "untracked" ? "untracked" : "poster"}:${poster}`,
          source: src,
        })
      );
    }
  }
  for (const [id, count] of ids) {
    if (count > 1) out.push(instance({ type: "registry-duplicate", route: "/", field: "videos[].id", failure: id, detail: `${count} homepage video entries share the id "${id}".` }));
  }

  return { instances: out, stats: { guides: guides.length, videos: videos.length } };
}

export function checkVideos(inv, config) {
  const out = [];
  let embeds = 0;
  for (const [route, page] of inv.rendered) {
    const file = inv.routes.find((r) => r.route === route)?.file ?? null;
    const shown = new Set();
    for (const f of page.iframes) {
      const id = youtubeIdFromUrl(f.src);
      if (id === null) continue;
      embeds += 1;
      shown.add(id);
      if (!YOUTUBE_ID.test(id)) {
        out.push(instance({ type: "video-id-malformed", route, field: "iframe[src]", failure: f.src, detail: `${route} embeds ${f.src}; "${id}" is not a YouTube video id.`, source: file ? { file } : null }));
      }
    }
    for (const id of page.videoProps) {
      embeds += 1;
      shown.add(id);
      if (!YOUTUBE_ID.test(id)) {
        out.push(instance({ type: "video-id-malformed", route, field: "youtubeId", failure: id, detail: `${route} renders a video facade with youtubeId "${id}", which is not a YouTube video id.`, source: file ? { file } : null }));
      }
    }
    for (const poster of page.posterProps) {
      const c = classifyHref(poster, config);
      if (c.kind !== "internal") continue;
      const res = resolveAsset(inv.assets, c.path);
      if (res.status === "missing") {
        out.push(instance({ type: "video-poster-missing", route, field: "poster", failure: res.path, detail: `${route}'s video poster ${res.path} does not exist.`, groupBy: `poster:${res.path}`, source: file ? { file } : null }));
      }
    }

    const { nodes } = readPageSchema(page);
    for (const v of nodes.filter((n) => [].concat(n?.["@type"]).includes("VideoObject"))) {
      const refs = [v.embedUrl, v.contentUrl, v.url].filter(Boolean);
      const idsInSchema = new Set();
      for (const u of refs) {
        const id = youtubeIdFromUrl(u);
        if (id === null) continue;
        if (!YOUTUBE_ID.test(id)) {
          out.push(instance({ type: "video-id-malformed", route, field: "VideoObject", failure: u, detail: `${route}'s VideoObject URL ${u} carries no valid YouTube id.`, source: file ? { file } : null }));
        } else idsInSchema.add(id);
      }
      if (idsInSchema.size > 1) {
        out.push(instance({ type: "video-schema-mismatch", route, field: "VideoObject", failure: [...idsInSchema].join(" vs "), detail: `${route}'s VideoObject embedUrl and contentUrl name different videos (${[...idsInSchema].join(" vs ")}).`, source: file ? { file } : null }));
      }
      for (const id of idsInSchema) {
        if (!shown.has(id)) {
          out.push(
            instance({
              type: "video-schema-mismatch",
              route,
              field: "VideoObject",
              failure: id,
              detail: shown.size
                ? `${route}'s VideoObject schema describes video ${id}, but the page shows ${[...shown].join(", ")}.`
                : `${route}'s VideoObject schema describes video ${id}, but the page renders no video.`,
              source: file ? { file } : null,
              reviewReason: "which video belongs on the page is editorial",
            })
          );
        }
      }
    }
  }

  // Source-level: a malformed id in a component or data module that is not rendered yet.
  for (const src of inv.sources) {
    src.lines.forEach((line, i) => {
      if (/^\s*(\/\/|\*)/.test(line)) return;
      for (const m of line.matchAll(/youtubeId\s*[:=]\s*\{?\s*["'`]([^"'`]*)["'`]/g)) {
        if (!YOUTUBE_ID.test(m[1])) {
          out.push(instance({ type: "video-id-malformed", route: null, field: "youtubeId literal", failure: m[1], detail: `${src.file}:${i + 1} sets youtubeId "${m[1]}", which is not an 11-character YouTube id.`, groupBy: `yt-literal:${m[1]}`, source: { file: src.file, line: i + 1 } }));
        }
      }
    });
  }
  return { instances: out, stats: { embeds } };
}
