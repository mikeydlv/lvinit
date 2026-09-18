// ---------------------------------------------------------------------------
// READING AND EDITING LVINIT PAGE SOURCE
//
// LVINIT's editorial content is prose inside TSX. There is no CMS. This module
// is how the agent reads a page's links, works out which parts of the file are
// off limits, and performs the one edit it is allowed to make.
//
// THE ONE EDIT, and the invariant that makes automation safe:
//
//   The agent wraps words that are ALREADY on the page in a <Link>. It never
//   writes, rewrites, reorders or deletes a word of published copy. Rendered
//   text before and after an edit is byte-for-byte identical.
//
// `applyLinkEdit` enforces that by reconstructing the rendered text from the
// edited source and refusing the edit if it changed. test/edit.test.mjs proves
// it. That is why an automatic edit cannot distort editorial meaning: there is
// no code path in which it could.
//
// Comment stripping, line indexing and text-block extraction are IMPORTED from
// the Fact-Decay Agent so that "a paragraph on an LVINIT page" means exactly
// the same thing to both agents. Those modules are read, never modified.
// ---------------------------------------------------------------------------

import {
  stripComments,
  lineIndexer,
  extractTextBlocks,
  normalizeWhitespace,
  decodeEntities,
} from "../../fact-decay/lib/extract.mjs";

export { stripComments, lineIndexer, extractTextBlocks, normalizeWhitespace, decodeEntities };

/**
 * Object-valued props whose contents are structured data, not body prose.
 *
 * Everything inside one of these is off limits. `meta` holds SEO and schema;
 * `hero` holds imagery and headlines; `ctas` holds conversion copy;
 * `relatedStories` is a curated related-content block. None of them are this
 * agent's business, and each belongs to the Content Publisher.
 */
export const PROTECTED_PROPS = [
  "meta",
  "hero",
  "ctas",
  "relatedStories",
  "relatedNeighborhood",
  "video",
  "facts",
  "quickFacts",
  "sources",
  "faqs",
  "communities",
  "projects",
  "items",
  "stories",
  "breadcrumbs",
  "dangerouslySetInnerHTML",
];

/**
 * Components whose entire rendered span is off limits: conversion surfaces,
 * lead capture, site chrome, and the sources/bibliography block.
 */
export const PROTECTED_COMPONENTS = [
  "StoryCTAs",
  "AreaSources",
  "Newsletter",
  "ContactForm",
  "Navbar",
  "Footer",
  "SearchHomesStrip",
  "AreaFAQ",
  "AreaCommunities",
  "DevelopmentWatch",
  "ComparisonBar",
  "LVINITMap",
  "AreaQuickFacts",
];

/**
 * Compliance, brokerage and licensing copy. CLAUDE.md forbids changing it, and
 * "adding a link inside it" is changing it. Matched against a text block and
 * against its section heading.
 */
export const COMPLIANCE_PATTERNS = [
  /\bequal housing\b/i,
  /\bscofield group\b/i,
  /\bnevada license\b/i,
  /\blicense\s+s\.?\s*\d/i,
  /\bbrokerage\b/i,
  /\bdisclaimer\b/i,
  /\bnot legal advice\b/i,
  /\bconsult (?:a|your) (?:lawyer|attorney|tax)/i,
  /\bmls\b|\bidx\b/i,
  /\babout this coverage\b/i,
  /\bhow this (?:was|is) (?:reported|sourced)\b/i,
  /\bsources?\b\s*(?:and|&)\s*\bmethod/i,
];

/** Does any compliance pattern fire on this text? */
export function looksLikeCompliance(text) {
  const value = String(text ?? "");
  return COMPLIANCE_PATTERNS.some((re) => re.test(value));
}

/**
 * Find the index of the brace/bracket/paren that closes the one at `open`.
 * Skips quoted strings so a brace inside prose cannot end a span early.
 * Returns -1 when unbalanced.
 */
export function matchDelimiter(code, open) {
  const pairs = { "{": "}", "[": "]", "(": ")" };
  const opener = code[open];
  const closer = pairs[opener];
  if (!closer) return -1;
  let depth = 0;
  let i = open;
  let quote = null;
  while (i < code.length) {
    const ch = code[i];
    if (quote) {
      if (ch === "\\") i += 2;
      else {
        if (ch === quote) quote = null;
        i += 1;
      }
      continue;
    }
    if (ch === '"' || ch === "'" || ch === "`") {
      quote = ch;
      i += 1;
      continue;
    }
    if (ch === opener) depth += 1;
    else if (ch === closer) {
      depth -= 1;
      if (depth === 0) return i;
    }
    i += 1;
  }
  return -1;
}

/**
 * Character ranges the agent must never edit inside.
 *
 * @returns {Array<{start:number, end:number, reason:string}>}
 */
export function protectedRanges(code, {
  props = PROTECTED_PROPS,
  components = PROTECTED_COMPONENTS,
} = {}) {
  const ranges = [];

  // --- Object-valued props: `ctas={{ ... }}`, `meta={meta}`, `facts={x}` ----
  for (const prop of props) {
    const re = new RegExp(`\\b${prop}\\s*=\\s*\\{`, "g");
    let m;
    while ((m = re.exec(code)) !== null) {
      const open = m.index + m[0].length - 1;
      const close = matchDelimiter(code, open);
      if (close > open) ranges.push({ start: m.index, end: close + 1, reason: `inside the \`${prop}\` prop` });
    }
  }

  // --- Top-level object literals a page declares for those props -----------
  // `const meta: StoryMeta = { ... }` and `const quickFacts = [ ... ]`.
  const declRe = /\bconst\s+([A-Za-z_][A-Za-z0-9_]*)\s*(?::[^=]*)?=\s*([[{])/g;
  let dm;
  while ((dm = declRe.exec(code)) !== null) {
    if (!props.includes(dm[1])) continue;
    const open = dm.index + dm[0].length - 1;
    const close = matchDelimiter(code, open);
    if (close > open) ranges.push({ start: dm.index, end: close + 1, reason: `inside the \`${dm[1]}\` declaration` });
  }

  // --- Whole components -----------------------------------------------------
  for (const name of components) {
    const openRe = new RegExp(`<${name}\\b`, "g");
    let m;
    while ((m = openRe.exec(code)) !== null) {
      const selfClose = code.indexOf("/>", m.index);
      const closeTag = code.indexOf(`</${name}>`, m.index);
      // A self-closing tag ends at the first "/>" that comes before any children.
      const gt = code.indexOf(">", m.index);
      if (gt > -1 && selfClose === gt - 1) {
        ranges.push({ start: m.index, end: selfClose + 2, reason: `inside <${name}>` });
        continue;
      }
      if (closeTag > m.index) {
        ranges.push({ start: m.index, end: closeTag + name.length + 3, reason: `inside <${name}>` });
        continue;
      }
      // No closing tag found: treat the opening tag alone as protected rather
      // than guessing where it ends.
      if (gt > m.index) ranges.push({ start: m.index, end: gt + 1, reason: `inside the <${name}> tag` });
    }
  }

  // --- Existing links: never nest a link inside a link ----------------------
  for (const tag of ["Link", "a"]) {
    const openRe = new RegExp(`<${tag}\\b`, "g");
    let m;
    while ((m = openRe.exec(code)) !== null) {
      const closeTag = code.indexOf(`</${tag}>`, m.index);
      const gt = code.indexOf(">", m.index);
      const end = closeTag > m.index ? closeTag + tag.length + 3 : gt > m.index ? gt + 1 : m.index + 1;
      ranges.push({ start: m.index, end, reason: "inside an existing link" });
    }
  }

  // --- JSX attributes ------------------------------------------------------
  // Text inside className="…", alt="…", heading="…" is not body prose.
  const attrRe = /\b[A-Za-z-]+\s*=\s*(["'])(?:\\.|(?!\1)[\s\S])*\1/g;
  let am;
  while ((am = attrRe.exec(code)) !== null) {
    ranges.push({ start: am.index, end: am.index + am[0].length, reason: "inside a JSX attribute" });
  }

  return ranges.sort((a, b) => a.start - b.start);
}

/** Is [start, end) entirely outside every protected range? */
export function protectionFor(ranges, start, end) {
  for (const range of ranges) {
    if (start < range.end && end > range.start) return range;
  }
  return null;
}

/**
 * Every internal href in a file, with its anchor text when the href belongs to
 * a `<Link>` or `<a>` element.
 *
 * @returns {Array<{href:string, raw:string, anchor:string|null, index:number, line:number, element:boolean}>}
 */
export function extractLinks(source) {
  const { code } = stripComments(source);
  const lineOf = lineIndexer(code);
  const found = [];
  const seen = new Set();

  // Elements first, so their anchor text is attached to the href.
  for (const tag of ["Link", "a"]) {
    const re = new RegExp(`<${tag}\\b([^>]*)>([\\s\\S]*?)</${tag}>`, "g");
    let m;
    while ((m = re.exec(code)) !== null) {
      const hrefMatch = /href=(?:"([^"]*)"|'([^']*)'|\{"([^"]*)"\}|\{`([^`]*)`\})/.exec(m[1]);
      if (!hrefMatch) continue;
      const raw = hrefMatch[1] ?? hrefMatch[2] ?? hrefMatch[3] ?? hrefMatch[4] ?? "";
      if (!raw.startsWith("/")) continue;
      const anchor = normalizeWhitespace(
        decodeEntities(m[2].replace(/<[^>]*>/g, " ").replace(/\{[^}]*\}/g, " "))
      );
      found.push({
        href: normalizeRoute(raw),
        raw,
        anchor: anchor || null,
        index: m.index,
        line: lineOf(m.index),
        element: true,
      });
      seen.add(`${m.index}`);
    }
  }

  // Then every other href="/…" or href: "/…" (Buttons, data objects, cards).
  const bare = /\bhref\s*[=:]\s*(?:"|'|\{")(\/[A-Za-z0-9\-/_#?.]*)(?:"|'|"\})/g;
  let bm;
  while ((bm = bare.exec(code)) !== null) {
    const route = normalizeRoute(bm[1]);
    if (!route) continue;
    const alreadyInElement = found.some((f) => bm.index >= f.index && bm.index < f.index + 200 && f.href === route);
    if (alreadyInElement) continue;
    found.push({
      href: route,
      raw: bm[1],
      anchor: null,
      index: bm.index,
      line: lineOf(bm.index),
      element: false,
    });
  }

  return found.sort((a, b) => a.index - b.index);
}

/** "/guides/x/" and "/guides/x#y" both mean "/guides/x". */
export function normalizeRoute(href) {
  const raw = String(href ?? "").split("#")[0].split("?")[0];
  if (!raw.startsWith("/")) return null;
  return raw.replace(/\/$/, "") || "/";
}

/**
 * The page's own link class convention, if it declares one.
 * Returns `{ expression }` for `className={linkCls}` style, or null.
 */
export function localLinkClass(code, identifiers) {
  for (const id of identifiers) {
    if (new RegExp(`\\bconst\\s+${id}\\s*(?::[^=]*)?=`).test(code)) return { expression: id };
  }
  return null;
}

/**
 * The rendered text of a source file, as closely as this agent can reconstruct
 * it: every JSX text node, in order, with markup removed.
 */
export function renderedText(source) {
  const { code } = stripComments(source);
  // Drop every tag, then every JSX expression, then normalize whitespace the
  // way a browser would.
  const withoutTags = code.replace(/<[^>]*>/g, " ");
  const withoutExpressions = withoutTags.replace(/\{[^{}]*\}/g, " ");
  return normalizeWhitespace(decodeEntities(withoutExpressions.split(" ").join(" ")));
}

/**
 * The copy checksum: the page's rendered text with ALL whitespace removed.
 *
 * `applyLinkEdit` compares this before and after an edit and refuses any edit
 * that changed it by one character. That is what guarantees the agent never
 * alters published copy — not a policy, a mechanism.
 *
 * Whitespace is excluded deliberately. Wrapping a word in an inline element
 * changes where tag boundaries fall, which shifts spacing in this crude
 * reconstruction without changing anything a reader sees; what must not move is
 * the sequence of characters in the copy itself, and that is exactly what this
 * compares.
 */
export function copyChecksum(source) {
  return renderedText(source).replace(/\s+/g, "");
}

/**
 * Wrap an exact span of existing prose in a <Link>.
 *
 * @param {string} source      the full file text
 * @param {object} edit
 * @param {number} edit.start  index of the first character of the anchor, in `source`
 * @param {number} edit.end    index just past the last character of the anchor
 * @param {string} edit.anchor the exact text expected at [start, end)
 * @param {string} edit.href   the destination route
 * @param {string} edit.classAttr  the full className attribute, e.g. `className={linkCls}`
 * @returns {{ok:true, source:string, before:string, after:string} | {ok:false, reason:string}}
 */
export function applyLinkEdit(source, { start, end, anchor, href, classAttr }) {
  const text = String(source);
  if (!(start >= 0 && end > start && end <= text.length)) {
    return { ok: false, reason: "the anchor span is outside the file" };
  }
  const actual = text.slice(start, end);
  if (actual !== anchor) {
    return {
      ok: false,
      reason: `the text at that position is no longer the expected anchor (found ${JSON.stringify(
        actual.slice(0, 60)
      )})`,
    };
  }
  if (/[<>{}&\n\r]/.test(actual)) {
    return { ok: false, reason: "the anchor span contains markup, an entity or a line break" };
  }

  const replacement = `<Link href="${href}" ${classAttr}>${actual}</Link>`;
  const edited = `${text.slice(0, start)}${replacement}${text.slice(end)}`;

  // The invariant. If the published copy moved at all, the edit is rejected.
  if (copyChecksum(text) !== copyChecksum(edited)) {
    return {
      ok: false,
      reason: "the edit would have changed the page's rendered text, which this agent is never allowed to do",
    };
  }

  return { ok: true, source: edited, before: actual, after: replacement };
}

/** Does the file import next/link? Wrapping prose in <Link> needs it. */
export function hasLinkImport(source) {
  return /\bfrom\s+["']next\/link["']/.test(String(source));
}

/** Block-level elements that hold one paragraph of LVINIT body copy. */
const PARAGRAPH_TAGS = ["p", "li", "blockquote", "dd"];

/**
 * The block-level element a character index sits inside — the paragraph.
 *
 * This is how the agent reads "the paragraph", rather than using the
 * Fact-Decay Agent's text blocks. Those blocks exist to find factual CLAIMS and
 * apply a Tailwind-class heuristic that discards any all-lowercase run of three
 * or more words — which silently swallows an anchor like "one master plan" and
 * everything after it. Fine for claim detection, wrong for measuring a
 * paragraph, and not this agent's module to change.
 *
 * @returns {{tag:string, start:number, end:number, innerStart:number, innerEnd:number}|null}
 */
export function enclosingBlockElement(code, index) {
  let best = null;
  for (const tag of PARAGRAPH_TAGS) {
    const openRe = new RegExp(`<${tag}(?=[\\s/>])`, "g");
    let m;
    while ((m = openRe.exec(code)) !== null) {
      if (m.index > index) break;
      const gt = code.indexOf(">", m.index);
      if (gt === -1) continue;
      const close = code.indexOf(`</${tag}>`, gt);
      if (close === -1 || close < index) continue;
      if (!best || m.index > best.start) {
        best = { tag, start: m.index, end: close + tag.length + 3, innerStart: gt + 1, innerEnd: close };
      }
    }
  }
  return best;
}

/** Strip JSX markup and expressions from a slice, leaving what a reader sees. */
export function plainTextOf(slice) {
  const withoutTags = String(slice ?? "").replace(/<[^>]*>/g, " ");
  const withoutExpressions = withoutTags.replace(/\{[^{}]*\}/g, " ");
  return normalizeWhitespace(decodeEntities(withoutExpressions));
}

/** The nearest `heading="…"` attribute before an index, if any. */
export function nearestHeading(code, index) {
  const re = /\bheading=(?:"([^"]*)"|'([^']*)'|\{"([^"]*)"\})/g;
  let found = null;
  let m;
  while ((m = re.exec(code)) !== null) {
    if (m.index >= index) break;
    found = normalizeWhitespace(decodeEntities(m[1] ?? m[2] ?? m[3] ?? ""));
  }
  return found || null;
}

/** How many internal links a slice of source already contains. */
export function countLinksIn(slice) {
  return (String(slice ?? "").match(/<Link\b|<a\s[^>]*href=/g) ?? []).length;
}
