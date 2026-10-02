// ---------------------------------------------------------------------------
// URLS — classifying an href, and finding where a literal lives in source
// ---------------------------------------------------------------------------

/** Is this hostname one that must never appear in published output? */
export function isDevHost(hostname, config) {
  const host = String(hostname ?? "").toLowerCase();
  return config.urls.devHostPatterns.some((p) => new RegExp(p).test(host));
}

/**
 * Classify an href as a browser would resolve it on an LVINIT page.
 *
 * @returns {{kind:string, raw:string, path?:string, hash?:string, url?:URL, problems:string[]}}
 *   kind: "internal" | "anchor" | "external" | "mailto" | "tel" | "empty" | "javascript" | "malformed" | "other"
 */
export function classifyHref(href, config) {
  const raw = href ?? "";
  const trimmed = raw.trim();
  const origin = new URL(config.site.origin);
  if (trimmed === "" || trimmed === "#") return { kind: "empty", raw, problems: [] };
  if (trimmed.startsWith("#")) return { kind: "anchor", raw, hash: trimmed.slice(1), problems: [] };
  if (/^mailto:/i.test(trimmed)) return { kind: "mailto", raw, problems: [] };
  if (/^tel:/i.test(trimmed)) return { kind: "tel", raw, problems: [] };
  if (/^javascript:/i.test(trimmed)) return { kind: "javascript", raw, problems: [] };

  if (trimmed.startsWith("/") && !trimmed.startsWith("//")) {
    const [beforeHash, hash] = splitOnce(trimmed, "#");
    const [path] = splitOnce(beforeHash, "?");
    return { kind: "internal", raw, path, hash: hash ?? null, problems: [] };
  }

  let url;
  try {
    url = new URL(trimmed.startsWith("//") ? `https:${trimmed}` : trimmed);
  } catch {
    return { kind: "malformed", raw, problems: ["not a parseable URL"] };
  }
  if (!/^https?:$/.test(url.protocol)) return { kind: "other", raw, url, problems: [] };
  if (/\s/.test(trimmed)) return { kind: "malformed", raw, url, problems: ["contains whitespace"] };

  const bare = (h) => h.toLowerCase().replace(/^www\./, "");
  if (bare(url.hostname) === bare(origin.hostname)) {
    const problems = [];
    if (url.protocol !== origin.protocol) problems.push(`uses ${url.protocol.replace(":", "")} instead of ${origin.protocol.replace(":", "")}`);
    if (url.hostname.toLowerCase() !== origin.hostname) problems.push(`uses host ${url.hostname} instead of ${origin.hostname}`);
    return {
      kind: "internal",
      raw,
      absolute: true,
      path: url.pathname || "/",
      hash: url.hash ? url.hash.slice(1) : null,
      url,
      problems,
    };
  }
  return { kind: "external", raw, url, problems: [] };
}

function splitOnce(s, ch) {
  const i = s.indexOf(ch);
  return i < 0 ? [s, undefined] : [s.slice(0, i), s.slice(i + 1)];
}

/** Collapse a path to the route form the inventory uses: no trailing slash, no double slashes. */
export function normalizePath(path) {
  const collapsed = String(path ?? "").replace(/\/{2,}/g, "/");
  return collapsed.length > 1 ? collapsed.replace(/\/+$/, "") : collapsed || "/";
}

/**
 * Every place a string literal occurs in source, as `"x"`, `'x'` or `` `x` ``.
 * Template interpolation (`${...}`) is never matched as a literal.
 */
export function findLiteral(sources, literal) {
  const hits = [];
  if (!literal) return hits;
  const quoted = [`"${literal}"`, `'${literal}'`, `\`${literal}\``];
  for (const src of sources) {
    if (!quoted.some((q) => src.text.includes(q))) continue;
    src.lines.forEach((line, i) => {
      for (const q of quoted) {
        let from = 0;
        let idx;
        while ((idx = line.indexOf(q, from)) !== -1) {
          hits.push({ file: src.file, line: i + 1, column: idx + 1, quoted: q, text: line });
          from = idx + q.length;
        }
      }
    });
  }
  return hits;
}

/** A source location for a value, if exactly one or a few places hold it. */
export function locate(sources, literal) {
  const hits = findLiteral(sources, literal);
  return hits.length ? { file: hits[0].file, line: hits[0].line, occurrences: hits.length } : null;
}
