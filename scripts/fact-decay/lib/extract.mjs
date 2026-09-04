// ---------------------------------------------------------------------------
// TEXT + STRUCTURE EXTRACTION FROM LVINIT PAGES
//
// LVINIT's editorial content is prose inside TSX. There is no CMS and no
// markdown layer, so this module is how the agent reads an article.
//
// It pulls four different things out of a .tsx file:
//
//   1. PROSE      — JSX text nodes ("<p>Median price slipped to $480,000.</p>")
//   2. DATA PROSE — sentences that live in data objects (the `what:` and
//                   `caveat:` fields of a Development Watch entry, a guide's
//                   `dek:`, an FAQ answer). These are just as published as the
//                   JSX is, and they hold the most source-backed claims on the
//                   site.
//   3. STRUCTURE  — Development Watch projects (name + status + source) and
//                   declared `AreaSource` lists, which come with their own
//                   citations already attached.
//   4. DATES      — StoryMeta datePublished/dateModified, and the visible
//                   "Checked 20 August 2026" freshness stamps.
//
// THIS IS HEURISTIC, AND THE REPORT SAYS SO. It is regex over source, not a
// TypeScript parser. That is a deliberate tradeoff: zero dependencies, and every
// extracted claim carries its file, line number and surrounding context so a
// human can check the machine in two seconds. Where it is uncertain it prefers
// to extract too little rather than to invent structure that is not there.
//
// Nothing in this module writes. It only reads repository files.
// ---------------------------------------------------------------------------

/** Named HTML entities that actually appear in LVINIT copy. */
const ENTITIES = {
  "&rsquo;": "’",
  "&lsquo;": "‘",
  "&rdquo;": "”",
  "&ldquo;": "“",
  "&mdash;": "—",
  "&ndash;": "–",
  "&hellip;": "…",
  "&middot;": "·",
  "&rsaquo;": "›",
  "&lsaquo;": "‹",
  "&nbsp;": " ",
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": '"',
  "&apos;": "'",
  "&deg;": "°",
  "&times;": "×",
};

/** Turn the entities LVINIT writes into the characters they mean. */
export function decodeEntities(text) {
  let out = String(text ?? "");
  for (const [entity, char] of Object.entries(ENTITIES)) {
    out = out.split(entity).join(char);
  }
  return out.replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)));
}

/** Collapse whitespace the way a browser would render it. */
export function normalizeWhitespace(text) {
  return String(text ?? "").replace(/\s+/g, " ").trim();
}

/**
 * Replace every comment with the same number of spaces and newlines.
 *
 * Blanking rather than deleting keeps every later index — and therefore every
 * reported line number — pointing at the real line in the real file.
 *
 * The comments themselves are returned separately: LVINIT's market and finance
 * guides carry long "FACT DISCIPLINE" headers recording how each figure was
 * verified, which is genuinely useful provenance and should not be thrown away.
 */
export function stripComments(source) {
  const text = String(source ?? "");
  const out = text.split("");
  const comments = [];
  let i = 0;
  let state = "code"; // code | line-comment | block-comment | single | double | template

  const blankFrom = (start, end) => {
    for (let k = start; k < end; k += 1) {
      if (out[k] !== "\n") out[k] = " ";
    }
  };

  let commentStart = -1;
  while (i < text.length) {
    const two = text.slice(i, i + 2);
    if (state === "code") {
      if (two === "//") {
        state = "line-comment";
        commentStart = i;
        i += 2;
        continue;
      }
      if (two === "/*") {
        state = "block-comment";
        commentStart = i;
        i += 2;
        continue;
      }
      if (text[i] === "'") state = "single";
      else if (text[i] === '"') state = "double";
      else if (text[i] === "`") state = "template";
      i += 1;
      continue;
    }
    if (state === "line-comment") {
      if (text[i] === "\n") {
        comments.push({ index: commentStart, text: text.slice(commentStart, i) });
        blankFrom(commentStart, i);
        state = "code";
      }
      i += 1;
      continue;
    }
    if (state === "block-comment") {
      if (two === "*/") {
        comments.push({ index: commentStart, text: text.slice(commentStart, i + 2) });
        blankFrom(commentStart, i + 2);
        state = "code";
        i += 2;
        continue;
      }
      i += 1;
      continue;
    }
    // Inside a string of some kind.
    if (text[i] === "\\") {
      i += 2;
      continue;
    }
    if (
      (state === "single" && text[i] === "'") ||
      (state === "double" && text[i] === '"') ||
      (state === "template" && text[i] === "`")
    ) {
      state = "code";
    }
    i += 1;
  }
  if (state === "line-comment" || state === "block-comment") {
    comments.push({ index: commentStart, text: text.slice(commentStart) });
    blankFrom(commentStart, text.length);
  }

  return { code: out.join(""), comments };
}

/** Build a line-number lookup for a source string. */
export function lineIndexer(source) {
  const offsets = [0];
  const text = String(source ?? "");
  for (let i = 0; i < text.length; i += 1) {
    if (text[i] === "\n") offsets.push(i + 1);
  }
  return (index) => {
    let lo = 0;
    let hi = offsets.length - 1;
    while (lo < hi) {
      const mid = Math.ceil((lo + hi) / 2);
      if (offsets[mid] <= index) lo = mid;
      else hi = mid - 1;
    }
    return lo + 1;
  };
}

/**
 * Data-object keys whose string values are published prose, not configuration.
 *
 * Deliberately EXCLUDES identifier-ish keys — `title`, `headline`, `label`,
 * `name`, `value` — because a title is a label for a thing, not an assertion
 * about it, and treating one as a claim produces findings like "the page says
 * 'Las Vegas Home Prices July 2026'", which is not a fact anyone can check.
 *
 * It also excludes `used`, the "what this source was used for" note on an
 * AreaSource. That text describes the bibliography rather than making a claim,
 * and it restates figures that are already extracted from the body — leaving it
 * in produced a duplicate finding for every sourced number on the page.
 */
const PROSE_KEYS = new Set([
  "what", "caveat", "distinct", "worthExploring", "dek", "description",
  "blurb", "intro", "text", "answer", "summary", "body", "lede",
  "where", "detail",
]);

/**
 * Tags that start or end a block of text. Anything else between two text
 * fragments — <span>, <em>, <strong>, <Link>, <a> — is inline decoration, and
 * the text on either side of it is still one sentence.
 */
const BLOCK_LEVEL_TAG =
  /<\/?(p|div|section|article|main|ul|ol|li|h[1-6]|blockquote|table|thead|tbody|tr|td|th|dl|dt|dd|figure|figcaption|br|hr|Story[A-Za-z]*|Area[A-Za-z]*|Container|Development[A-Za-z]*)\b/;

/**
 * Stitch adjacent text fragments back together when only inline markup
 * separates them.
 *
 * Two fragments merge when the source between them contains no block-level tag
 * and is short enough to be plausible inline markup. The merged fragment keeps
 * the FIRST fragment's position, so the reported line number still points at
 * where the sentence starts.
 */
export function mergeInlineFragments(fragments, code) {
  const merged = [];
  for (const fragment of fragments) {
    const previous = merged[merged.length - 1];
    if (previous) {
      const gap = code.slice(previous.end, fragment.start - 1);
      const inlineOnly = gap.length <= 400 && !BLOCK_LEVEL_TAG.test(gap);
      if (inlineOnly) {
        const joiner = /[([“"'$]$/.test(previous.text) || /^[,.;:!?)\]”%]/.test(fragment.text) ? "" : " ";
        previous.text = normalizeWhitespace(`${previous.text}${joiner}${fragment.text}`);
        previous.end = fragment.end;
        continue;
      }
    }
    merged.push({ ...fragment });
  }
  return merged;
}

/**
 * Source code that slipped through the JSX-text pattern.
 *
 * Allowing a fragment to start after "}" (needed for `{" "}` mid-sentence) also
 * lets it start after the closing brace of an import or an object literal, so
 * lines of real code arrive here looking like text. Keyword and "=" tests
 * separate them: LVINIT prose never contains `const`, `export` or `=>`.
 */
const CODE_FRAGMENT = /\b(import|export|const|let|var|function|interface|typeof|return|className)\b|=>|=|\$\{/;

/** Values that are obviously code, not prose. */
function looksLikeCode(value) {
  const v = String(value);
  if (!v.trim()) return true;
  if (/^https?:\/\//i.test(v)) return true;
  if (/^[/@.#]/.test(v)) return true; // routes, imports, anchors
  if (/^[A-Za-z0-9_-]+\.(tsx?|jsx?|mjs|json|webp|jpe?g|png|svg|pdf)$/i.test(v)) return true;
  // Tailwind class lists: many tokens, all lowercase-with-dashes/colons/slashes.
  const tokens = v.trim().split(/\s+/);
  if (tokens.length > 2 && tokens.every((t) => /^[a-z0-9:[\]/.%()-]+$/.test(t))) return true;
  if (/\b(text-|bg-|border-|px-|py-|mt-|mb-|flex|grid|rounded|hover:|sm:|md:|lg:)/.test(v) && !/[.!?]/.test(v)) {
    return true;
  }
  return false;
}

/**
 * Every readable block of published text in a source file.
 *
 * @returns {Array<{text:string, line:number, index:number, origin:string,
 *                  field:string|null, heading:string|null}>}
 *   origin: "prose"   — a JSX text node
 *           "data"    — a string value on a prose-carrying data key
 *           "heading" — a section heading attribute
 */
export function extractTextBlocks(source, { minWords = 3 } = {}) {
  const { code } = stripComments(source);
  const lineOf = lineIndexer(code);
  const blocks = [];

  // --- Headings, collected first so prose can be attributed to one ----------
  const headings = [];
  const headingRe = /\bheading=(?:"([^"]*)"|'([^']*)'|\{"([^"]*)"\})/g;
  let hm;
  while ((hm = headingRe.exec(code)) !== null) {
    const value = decodeEntities(hm[1] ?? hm[2] ?? hm[3] ?? "");
    if (!value.trim()) continue;
    headings.push({ index: hm.index, text: normalizeWhitespace(value) });
    blocks.push({
      text: normalizeWhitespace(value),
      index: hm.index,
      line: lineOf(hm.index),
      origin: "heading",
      field: "heading",
      heading: null,
    });
  }
  const headingAt = (index) => {
    let current = null;
    for (const h of headings) {
      if (h.index <= index) current = h.text;
      else break;
    }
    return current;
  };

  // --- JSX text nodes -------------------------------------------------------
  // Text sitting between a closing ">" and the next "<", with no braces in it.
  // Braces mean an expression, and an expression is not something that can be
  // read as a sentence without evaluating it.
  //
  // A fragment also ends at "{" and may start after "}", because LVINIT uses
  // `{" "}` to hold a space across a line break mid-sentence. Anchoring only on
  // "<" made every fragment ending in one of those fail to match at all, which
  // silently dropped whole clauses out of the middle of paragraphs.
  const proseRe = /[>}]([^<>{}]+)(?=[<{])/g;
  const fragments = [];
  let pm;
  while ((pm = proseRe.exec(code)) !== null) {
    const raw = pm[1];
    if (!raw.trim()) continue;
    const text = normalizeWhitespace(decodeEntities(raw));
    // No letter test here: "$490,000" on its own is a <span> in the middle of a
    // sentence and has to survive to be merged back into it. The letter and
    // length tests happen after merging.
    if (!text || looksLikeCode(text) || CODE_FRAGMENT.test(text)) continue;
    fragments.push({ text, start: pm.index + 1, end: pm.index + 1 + raw.length });
  }

  // LVINIT emphasises figures with inline <span>s and links mid-sentence, so a
  // single paragraph arrives here as several fragments. Splitting a claim down
  // the middle of a sentence produces findings like ", and sales actually
  // jumped" — so fragments separated only by inline markup are stitched back
  // into the paragraph they came from.
  for (const merged of mergeInlineFragments(fragments, code)) {
    if (!/[A-Za-z]/.test(merged.text)) continue;
    if (merged.text.split(/\s+/).length < minWords) continue;
    blocks.push({
      text: merged.text,
      index: merged.start,
      line: lineOf(merged.start),
      origin: "prose",
      field: null,
      heading: headingAt(merged.start),
    });
  }

  // --- Prose living in data objects ----------------------------------------
  const dataRe = /\b([A-Za-z_][A-Za-z0-9_]*)\s*:\s*(["'])((?:\\.|(?!\2)[\s\S])*)\2/g;
  let dm;
  while ((dm = dataRe.exec(code)) !== null) {
    const key = dm[1];
    if (!PROSE_KEYS.has(key)) continue;
    const raw = dm[3].replace(/\\n/g, " ").replace(/\\"/g, '"').replace(/\\'/g, "'");
    const text = normalizeWhitespace(decodeEntities(raw));
    if (!text || text.split(/\s+/).length < minWords) continue;
    if (looksLikeCode(text)) continue;
    blocks.push({
      text,
      index: dm.index,
      line: lineOf(dm.index),
      origin: "data",
      field: key,
      heading: headingAt(dm.index),
    });
  }

  // Deduplicate identical text at the same line (a value can match twice).
  const seen = new Set();
  const unique = [];
  for (const block of blocks.sort((a, b) => a.index - b.index)) {
    const key = `${block.line}|${block.text}`;
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push(block);
  }
  return unique;
}

/**
 * The text of the object literal that `index` sits inside, from `index` to its
 * closing brace.
 *
 * This exists because reading "the next 4000 characters" is not the same thing
 * as reading "this object". A Development Watch entry with no `caveat` would
 * otherwise pick up the caveat belonging to the NEXT project in the array — and
 * a caveat is exactly where a "scheduled to be considered on <date>" lives, so
 * that bled a passed-deadline finding onto a completely unrelated project.
 *
 * Brace depth starts at 1 because the caller is already inside the object.
 * Quoted strings are skipped so a brace inside prose cannot end it early.
 */
export function objectSliceFrom(code, index, maxLen = 8000) {
  const end = Math.min(code.length, index + maxLen);
  let depth = 1;
  let state = "code";
  for (let i = index; i < end; i += 1) {
    const ch = code[i];
    if (state === "code") {
      if (ch === '"' || ch === "'" || ch === "`") state = ch;
      else if (ch === "{" || ch === "[") depth += 1;
      else if (ch === "}" || ch === "]") {
        depth -= 1;
        if (depth === 0) return code.slice(index, i);
      }
    } else {
      if (ch === "\\") {
        i += 1;
        continue;
      }
      if (ch === state) state = "code";
    }
  }
  return code.slice(index, end);
}

/**
 * StoryMeta fields, read straight out of the page source.
 * Only what is actually written — never a default, never a guess.
 */
export function extractStoryMeta(source) {
  const { code } = stripComments(source);
  const read = (key) => {
    const m = new RegExp(`\\b${key}:\\s*(["'\`])([\\s\\S]*?)\\1`).exec(code);
    return m ? normalizeWhitespace(decodeEntities(m[2])) : null;
  };
  return {
    title: read("title"),
    headline: read("headline"),
    description: read("description"),
    path: read("path"),
    datePublished: read("datePublished"),
    dateModified: read("dateModified"),
    author: read("author"),
  };
}

/**
 * The visible freshness stamps: `checked="Checked 20 August 2026"` on
 * AreaSources and `updated="Updated August 2026"` on Development Watch.
 * Returned as raw strings; dates.mjs turns them into dates.
 */
export function extractFreshnessStamps(source) {
  const { code } = stripComments(source);
  const stamps = [];
  const re = /\b(checked|updated)=(?:"([^"]*)"|'([^']*)'|\{"([^"]*)"\})/gi;
  let m;
  while ((m = re.exec(code)) !== null) {
    const value = normalizeWhitespace(m[2] ?? m[3] ?? m[4] ?? "");
    if (value) stamps.push({ kind: m[1].toLowerCase(), text: value });
  }
  return stamps;
}

/**
 * Declared `AreaSource` entries: the page's own bibliography.
 *
 * This is the audit trail LVINIT already keeps — a label, a URL, and what the
 * source was actually used for. The agent reuses it rather than inventing a
 * parallel source-tracking convention.
 */
export function extractDeclaredSources(source) {
  const { code } = stripComments(source);
  const lineOf = lineIndexer(code);
  const found = [];
  // label / url / used, in that order, as the repository writes them.
  const re =
    /label:\s*(["'])((?:\\.|(?!\1)[\s\S])*)\1\s*,\s*url:\s*(["'])((?:\\.|(?!\3)[\s\S])*)\3(?:\s*,\s*used:\s*(["'])((?:\\.|(?!\5)[\s\S])*)\5)?/g;
  let m;
  while ((m = re.exec(code)) !== null) {
    found.push({
      label: normalizeWhitespace(decodeEntities(m[2])),
      url: m[4].trim(),
      used: m[6] ? normalizeWhitespace(decodeEntities(m[6])) : null,
      line: lineOf(m.index),
    });
  }
  return found;
}

/**
 * External links used as citations in the page body.
 *
 * The neighborhood pages keep a structured `AreaSource[]`; the guides instead
 * write a "Sources" section as prose with inline <a href> links. Both are the
 * page's bibliography, and only reading the structured one made every sourced
 * figure in every guide look unsourced.
 *
 * The label is the anchor text, and `used` is the text of the enclosing list
 * item when there is one — which is where the guides actually say what each
 * source supports.
 */
export function extractExternalLinks(source) {
  const { code } = stripComments(source);
  const lineOf = lineIndexer(code);
  const found = [];
  const linkRe = /<a\b([^>]*?)href=(["'])(https?:\/\/[^"']+)\2([^>]*)>([\s\S]{0,300}?)<\/a>/gi;
  let m;
  while ((m = linkRe.exec(code)) !== null) {
    const url = m[3].trim();
    const label = normalizeWhitespace(decodeEntities(m[5].replace(/<[^>]+>/g, " ")));
    if (!label) continue;

    // The enclosing <li>, when there is one: that is where the guides describe
    // what the source was used for.
    const before = code.lastIndexOf("<li", m.index);
    const after = code.indexOf("</li>", m.index);
    let used = null;
    if (before >= 0 && after > before && after - before < 2000) {
      used = normalizeWhitespace(
        decodeEntities(code.slice(before, after).replace(/<[^>]+>/g, " ").replace(/\{[^}]*\}/g, " "))
      );
    }
    found.push({ label, url, used, line: lineOf(m.index), origin: "prose link" });
  }
  return found;
}

/**
 * Development Watch entries, with their status and their own source.
 *
 * These are the highest-value claims on the site: each one is an explicit,
 * sourced assertion that a named project is open, under construction, or
 * planned — exactly the thing the brief asks the agent to watch.
 */
export function extractDevelopmentProjects(source) {
  const { code } = stripComments(source);
  const lineOf = lineIndexer(code);
  const projects = [];
  const nameRe = /\bname:\s*(["'])((?:\\.|(?!\1)[\s\S])*)\1\s*,\s*status:\s*(["'])(open|under-construction|planned)\3/g;
  let m;
  while ((m = nameRe.exec(code)) !== null) {
    // Read exactly this object literal — not a fixed window, which would spill
    // into the next project's fields whenever this one omits a key.
    const start = m.index;
    const slice = objectSliceFrom(code, start);
    const read = (key) => {
      const km = new RegExp(`\\b${key}:\\s*(["'])((?:\\\\.|(?!\\1)[\\s\\S])*)\\1`).exec(slice);
      return km ? normalizeWhitespace(decodeEntities(km[2])) : null;
    };
    const sourceBlock = /source:\s*\{([\s\S]{0,400}?)\}/.exec(slice);
    let projectSource = null;
    if (sourceBlock) {
      const label = /label:\s*(["'])((?:\\.|(?!\1)[\s\S])*)\1/.exec(sourceBlock[1]);
      const url = /url:\s*(["'])((?:\\.|(?!\1)[\s\S])*)\1/.exec(sourceBlock[1]);
      if (label || url) {
        projectSource = {
          label: label ? normalizeWhitespace(decodeEntities(label[2])) : null,
          url: url ? url[2].trim() : null,
        };
      }
    }
    projects.push({
      name: normalizeWhitespace(decodeEntities(m[2])),
      status: m[4],
      where: read("where"),
      what: read("what"),
      caveat: read("caveat"),
      source: projectSource,
      line: lineOf(start),
    });
  }
  return projects;
}

/**
 * Flat data rows that carry a figure and its own period/source note.
 *
 * LVINIT's market guides put their headline numbers in a small typed array —
 *
 *   type Stat = { value: string; label: string; note: string };
 *   { value: "$490,000", label: "Median existing single-family price",
 *     note: "June 2026 record high, +1% YoY · Las Vegas Realtors" }
 *
 * — and the down-payment guide uses the same shape with different key names
 * (`loan` / `down` / `note`). These are the fastest-decaying, most prominent
 * figures on the site, and reading only the `note` would flag the caption while
 * ignoring the number it captions.
 *
 * Matched as a FLAT object of string fields only, so nothing nested is picked up
 * by accident. A row must carry a `note` to qualify — that is what marks it as
 * a published figure with its own provenance rather than component config.
 */
export function extractDataRows(source) {
  const { code } = stripComments(source);
  const lineOf = lineIndexer(code);
  const rows = [];
  const objectRe = /\{\s*((?:[A-Za-z_][A-Za-z0-9_]*\s*:\s*(["'])(?:\\.|(?!\2)[\s\S])*\2\s*,?\s*){2,6})\}/g;
  let m;
  while ((m = objectRe.exec(code)) !== null) {
    const fields = {};
    const fieldRe = /([A-Za-z_][A-Za-z0-9_]*)\s*:\s*(["'])((?:\\.|(?!\2)[\s\S])*)\2/g;
    let fm;
    while ((fm = fieldRe.exec(m[1])) !== null) {
      fields[fm[1]] = normalizeWhitespace(decodeEntities(fm[3]));
    }
    if (!fields.note) continue;
    const otherKeys = Object.keys(fields).filter((k) => k !== "note");
    if (otherKeys.length === 0) continue;
    rows.push({ fields, keys: otherKeys, line: lineOf(m.index) });
  }
  return rows;
}

/**
 * Which local data modules a page pulls its content from, e.g.
 * `import { developmentProjects } from "@/lib/areas/summerlin"`.
 */
export function extractLocalImports(source, { prefixes = ["@/lib/"] } = {}) {
  const { code } = stripComments(source);
  const specifiers = new Set();
  const re = /\bfrom\s+(["'])([^"']+)\1/g;
  let m;
  while ((m = re.exec(code)) !== null) {
    const spec = m[2];
    if (prefixes.some((p) => spec.startsWith(p))) specifiers.add(spec);
  }
  return [...specifiers];
}
