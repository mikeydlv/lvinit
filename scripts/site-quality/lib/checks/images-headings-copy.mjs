// ---------------------------------------------------------------------------
// IMAGES, HEADINGS, PLACEHOLDER COPY
//
// Images are checked twice: every <img> the build rendered (src, srcset, alt),
// and every "/images/..." literal in source (which also covers client-only and
// conditional images that never appear in static HTML). Both feed the same
// root-cause key, so one missing file is one finding however many places use it.
//
// Empty alt is NOT an issue by itself. LVINIT deliberately renders decorative
// images with alt="" (video posters behind a labelled play button, editorial
// covers, ImagePlaceholder inside a role="img" wrapper). Empty alt is only
// flagged when the registry says the image is a real photograph.
// ---------------------------------------------------------------------------

import { dirname, posix as pathPosix } from "node:path";

import { instance } from "../findings.mjs";
import { classifyHref, isDevHost } from "../urls.mjs";
import { resolveAsset } from "../inventory.mjs";

/** "/_next/image?url=%2Fimages%2Fx.webp&w=..." -> "/images/x.webp" */
export function imagePathFromSrc(src) {
  if (!src) return null;
  if (/^\/_next\/image\?/.test(src)) {
    const q = new URLSearchParams(src.slice(src.indexOf("?") + 1));
    return q.get("url");
  }
  return src;
}

function assetFindings(out, inv, config, { route, field, path, source }) {
  const res = resolveAsset(inv.assets, path);
  if (res.status === "missing") {
    out.push(
      instance({
        type: "image-missing-file",
        route,
        field,
        failure: res.path,
        detail: `${res.path} is referenced but does not exist in public/.`,
        groupBy: `missing:${res.path}`,
        source,
        publisherHandoff: { route, need: `supply or re-point the missing image ${res.path}` },
      })
    );
  } else if (res.status === "case") {
    out.push(
      instance({
        type: "image-path-case",
        route,
        field,
        failure: res.path,
        detail: `${res.path} is referenced, but the file is ${res.candidates.join(" / ")}. It works on Windows and 404s on Vercel's case-sensitive filesystem.`,
        groupBy: `case:${res.path}`,
        evidence: { referenced: res.path, actual: res.candidates },
        source,
      })
    );
  } else if (res.status === "untracked") {
    out.push(
      instance({
        type: "image-untracked",
        route,
        field,
        failure: res.exact,
        detail: `${res.exact} exists locally but is not committed, so the production deploy will not have it.`,
        groupBy: `untracked:${res.exact}`,
        source,
      })
    );
  }
  return res;
}

/** Strip // and block comments from one line well enough to ignore commented-out paths. */
function codePart(line, state) {
  let text = line;
  if (state.inBlock) {
    const end = text.indexOf("*/");
    if (end < 0) return "";
    text = text.slice(end + 2);
    state.inBlock = false;
  }
  text = text.replace(/\{?\/\*[\s\S]*?\*\/\}?/g, "");
  const open = text.indexOf("/*");
  if (open >= 0) {
    state.inBlock = true;
    text = text.slice(0, open);
  }
  const trimmed = text.trimStart();
  if (trimmed.startsWith("//") || trimmed.startsWith("*")) return "";
  // A trailing // comment — only when it is not inside a string (http:// etc.).
  const m = /(^|[^:"'`])\/\/ /.exec(text);
  if (m) text = text.slice(0, m.index + m[1].length);
  return text;
}

/** Every "/images/..." (or other public asset) literal in source, outside comments. */
export function sourceAssetLiterals(sources) {
  const hits = [];
  for (const src of sources) {
    const state = { inBlock: false };
    src.lines.forEach((line, i) => {
      const code = codePart(line, state);
      if (!code) return;
      for (const m of code.matchAll(/(["'`])(\/(?:images|email-assets)\/[^"'`$]+?\.(?:png|jpe?g|webp|gif|svg|avif|ico))\1/gi)) {
        hits.push({ file: src.file, line: i + 1, path: m[2] });
      }
    });
  }
  return hits;
}

export function checkImages(inv, config) {
  const out = [];
  const photoImages = new Set();
  if (inv.registry.ok) {
    for (const g of inv.registry.guides) {
      if (g.image && (g.imageMode ?? "photo") === "photo") photoImages.add(g.image);
    }
  }
  const stats = { rendered: 0, optimized: 0, raw: 0, emptyAltIntentional: 0, sourceLiterals: 0 };

  for (const [route, page] of inv.rendered) {
    for (const img of page.images) {
      stats.rendered += 1;
      const path = imagePathFromSrc(img.src);
      if (img.optimized) stats.optimized += 1;
      else stats.raw += 1;
      if (!path) continue;
      const c = classifyHref(path, config);

      if (c.kind === "external") {
        if (isDevHost(c.url.hostname, config)) {
          out.push(instance({ type: "dev-url", route, field: "img[src]", failure: path, detail: `${route} loads an image from a development host (${path}).` }));
        } else if (!config.urls.allowedImageHosts.includes(c.url.hostname)) {
          out.push(
            instance({
              type: "image-hotlink",
              route,
              field: "img[src]",
              failure: c.url.hostname,
              detail: `${route} hotlinks an image from ${c.url.hostname}. LVINIT serves only local images (CLAUDE.md).`,
              groupBy: `hotlink:${c.url.hostname}${c.url.pathname}`,
              publisherHandoff: { route, need: `replace the hotlinked image from ${c.url.hostname} with a local, owned file` },
            })
          );
        }
        continue;
      }
      if (c.kind !== "internal") continue;

      const res = assetFindings(out, inv, config, { route, field: "img[src]", path: c.path });
      if (res.status === "ok" && !img.optimized && res.bytes > config.severity.rawImageMaxBytes) {
        out.push(
          instance({
            type: "image-oversized",
            route,
            field: "img[src]",
            failure: res.exact,
            detail: `${res.exact} is ${(res.bytes / 1e6).toFixed(1)} MB and is served raw (not through next/image), so every visitor downloads the full file.`,
            groupBy: `oversized:${res.exact}`,
          })
        );
      }

      if (img.alt === null) {
        out.push(
          instance({
            type: "image-alt-missing",
            route,
            field: "img[alt]",
            failure: c.path,
            detail: `An image (${c.path}) on ${route} has no alt attribute at all, so screen readers announce its filename.`,
            groupBy: `alt-missing:${c.path}`,
            reviewReason: "alt text is editorial; the agent never writes it",
            publisherHandoff: { route, need: `write alt text for ${c.path}` },
          })
        );
      } else if (img.alt.trim() === "") {
        const decorative = img.ariaHidden || img.role === "presentation" || img.role === "none" || img.decorativeWrapper;
        let decoded = c.path;
        try {
          decoded = decodeURIComponent(c.path);
        } catch {
          /* keep raw */
        }
        if (!decorative && photoImages.has(decoded)) {
          out.push(
            instance({
              type: "image-alt-empty-photo",
              route,
              field: "img[alt]",
              failure: decoded,
              detail: `${decoded} is registered as a real photograph (lib/content.ts), but renders on ${route} with alt="".`,
              groupBy: `alt-empty-photo:${decoded}`,
              reviewReason: "alt text is editorial; the agent never writes it",
              publisherHandoff: { route, need: `confirm alt text for the photograph ${decoded}` },
            })
          );
        } else {
          stats.emptyAltIntentional += 1;
        }
      }
    }
  }

  const literals = sourceAssetLiterals(inv.sources);
  stats.sourceLiterals = literals.length;
  for (const hit of literals) {
    assetFindings(out, inv, config, {
      route: null,
      field: "source literal",
      path: hit.path,
      source: { file: hit.file, line: hit.line },
    });
  }
  return { instances: out, stats };
}

export function checkHeadings(inv, config) {
  const out = [];
  for (const [route, page] of inv.rendered) {
    const file = inv.routes.find((r) => r.route === route)?.file ?? null;
    const h1s = page.headings.filter((h) => h.level === 1);
    if (h1s.length === 0) {
      out.push(instance({ type: "h1-missing", route, field: "h1", failure: "none", detail: `${route} renders no H1.`, source: file ? { file } : null }));
    } else if (h1s.length > 1) {
      out.push(
        instance({
          type: "h1-multiple",
          route,
          field: "h1",
          failure: `${h1s.length} h1`,
          detail: `${route} renders ${h1s.length} H1s: ${h1s.map((h) => `"${h.text.slice(0, 60)}"`).join(", ")}.`,
          source: file ? { file } : null,
        })
      );
    }
    for (const h of h1s) {
      if (!h.text) {
        out.push(instance({ type: "h1-empty", route, field: "h1", failure: "empty", detail: `${route} renders an empty H1.`, source: file ? { file } : null }));
      }
    }
    let prev = null;
    for (const h of page.headings) {
      if (prev !== null && h.level > prev.level + 1) {
        out.push(
          instance({
            type: "heading-skip",
            route,
            field: `h${prev.level} -> h${h.level}`,
            failure: `h${prev.level}->h${h.level} "${h.text.slice(0, 60)}"`,
            detail: `Heading levels jump from H${prev.level} to H${h.level} at "${h.text.slice(0, 80)}".`,
            groupBy: `skip:h${prev.level}->h${h.level}:${h.text.slice(0, 60).toLowerCase()}`,
          })
        );
      }
      prev = h;
    }
  }
  return out;
}

const PLACEHOLDER_PATTERNS = [
  { re: /lorem ipsum/i, label: "lorem ipsum" },
  { re: /\bTODO\b/, label: "TODO" },
  { re: /\bFIXME\b/, label: "FIXME" },
  { re: /\bTBD\b/, label: "TBD" },
  { re: /\[(?:insert|placeholder|tk|todo|add)\b[^\]]{0,60}\]/i, label: "[insert …]" },
  { re: /\{\{\s*[\w.]+\s*\}\}/, label: "unrendered {{template}}" },
  { re: /\[object Object\]/, label: "[object Object]" },
  { re: /(^|[\s(>])(undefined|NaN)([\s.,)<]|$)/, label: "undefined / NaN rendered as text" },
];

export function checkPlaceholderCopy(inv, config) {
  const out = [];
  for (const [route, page] of inv.rendered) {
    for (const p of PLACEHOLDER_PATTERNS) {
      const m = p.re.exec(page.visibleText);
      if (!m) continue;
      const at = m.index;
      const snippet = page.visibleText.slice(Math.max(0, at - 50), at + 70).trim();
      out.push(
        instance({
          type: "placeholder-copy",
          route,
          field: "visible text",
          failure: `${p.label}: ${snippet}`,
          detail: `${route} shows "${p.label}" in published text: “…${snippet}…”`,
          groupBy: `placeholder:${p.label}:${snippet.toLowerCase()}`,
          reviewReason: "replacing placeholder copy needs real content",
          publisherHandoff: { route, need: `replace placeholder copy (${p.label})` },
        })
      );
    }
  }
  return out;
}

/** Resolve an import specifier to a repo-relative source file, if it is local. */
function resolveImport(fromFile, spec, fileSet) {
  let base;
  if (spec.startsWith("@/")) base = spec.slice(2);
  else if (spec.startsWith(".")) base = pathPosix.normalize(pathPosix.join(dirname(fromFile).split("\\").join("/"), spec));
  else return null;
  for (const ext of ["", ".ts", ".tsx", ".js", ".mjs", "/index.ts", "/index.tsx"]) {
    if (fileSet.has(base + ext)) return base + ext;
  }
  return null;
}

/**
 * A module whose own header says it is placeholder scaffolding, imported
 * (directly or through components) by a page that is live.
 */
export function checkDeclaredPlaceholders(inv, config) {
  const out = [];
  const byFile = new Map(inv.sources.map((s) => [s.file, s]));
  const fileSet = new Set(byFile.keys());
  const declared = inv.sources.filter((s) => /\bPLACEHOLDER CONTENT\b/.test(s.lines.slice(0, 15).join("\n")));
  if (!declared.length) return out;

  const imports = new Map();
  for (const s of inv.sources) {
    const deps = [];
    for (const m of s.text.matchAll(/(?:^|\n)\s*import\s+(?!type\b)[^;]*?from\s+["']([^"']+)["']/g)) {
      const r = resolveImport(s.file, m[1], fileSet);
      if (r) deps.push(r);
    }
    imports.set(s.file, deps);
  }

  for (const target of declared) {
    const routes = [];
    const via = new Set();
    for (const r of inv.routes) {
      if (!inv.rendered.has(r.route)) continue;
      // Every file this page pulls in, transitively; the ones that import the
      // placeholder module directly are what put its data on the page.
      const seen = new Set([r.file]);
      const queue = [r.file];
      const importers = [];
      while (queue.length) {
        const f = queue.shift();
        for (const d of imports.get(f) ?? []) {
          if (d === target.file) {
            if (!importers.includes(f)) importers.push(f);
            continue;
          }
          if (seen.has(d)) continue;
          seen.add(d);
          queue.push(d);
        }
      }
      if (importers.length) {
        routes.push(r.route);
        importers.forEach((f) => via.add(f));
      }
    }
    for (const route of routes) {
      out.push(
        instance({
          type: "source-declared-placeholder",
          route,
          field: "module header",
          failure: target.file,
          detail:
            `${target.file} opens with a "PLACEHOLDER CONTENT" header saying its strings and figures are illustrative ` +
            `and must not ship as-is, and it is rendered on live pages (imported by ${[...via].join(", ")}). ` +
            "Either the placeholder data is still live, or the header is stale — which one is a human call.",
          groupBy: `declared-placeholder:${target.file}`,
          source: { file: target.file, line: 1 },
          reviewReason: "deciding what is real content is editorial; the agent never edits copy or data",
        })
      );
    }
  }
  return out;
}
