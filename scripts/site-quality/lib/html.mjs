// ---------------------------------------------------------------------------
// RENDERED HTML — a small, dependency-free reader for Next's prerendered pages
//
// Every LVINIT route is statically prerendered by `next build`, so the file in
// .next/server/app/<route>.html is byte-for-byte what a crawler receives. This
// reads the parts a site audit needs: the <head> metadata, the JSON-LD blocks,
// headings, images, links, element ids, iframes and visible text.
//
// It is a tokenizer, not a full HTML parser. That is safe here because the
// input is React's own serializer output — always quoted attributes, always
// closed tags. The React Server Component payload (the `self.__next_f.push`
// scripts) is stripped before anything is read, so copies of props inside it
// are never mistaken for rendered markup; the few things that only exist in
// that payload (client-component props such as a video facade's youtubeId) are
// read from it separately and labelled as such.
// ---------------------------------------------------------------------------

const ENTITY = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ", rsquo: "’", lsquo: "‘", rdquo: "”", ldquo: "“", mdash: "—", ndash: "–", hellip: "…" };

export function decodeEntities(text) {
  return String(text ?? "").replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (m, code) => {
    if (code[0] === "#") {
      const n = code[1] === "x" || code[1] === "X" ? Number.parseInt(code.slice(2), 16) : Number.parseInt(code.slice(1), 10);
      return Number.isFinite(n) ? String.fromCodePoint(n) : m;
    }
    return ENTITY[code.toLowerCase()] ?? m;
  });
}

const ATTR_RE = /([^\s=/>"']+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>"']+)))?/g;
const TAG_RE = /<([a-zA-Z][\w:-]*)((?:\s+[^\s=/>"']+(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>"']+))?)*)\s*\/?>/g;

export function parseAttributes(raw) {
  const attrs = {};
  ATTR_RE.lastIndex = 0;
  let m;
  while ((m = ATTR_RE.exec(raw ?? "")) !== null) {
    const name = m[1].toLowerCase();
    const value = m[2] ?? m[3] ?? m[4];
    attrs[name] = value === undefined ? "" : decodeEntities(value);
  }
  return attrs;
}

export function stripTags(html) {
  return decodeEntities(String(html ?? "").replace(/<[^>]*>/g, " ")).replace(/\s+/g, " ").trim();
}

/** Every opening tag, in document order, with its attributes and offset. */
export function scanTags(html) {
  const tags = [];
  TAG_RE.lastIndex = 0;
  let m;
  while ((m = TAG_RE.exec(html)) !== null) {
    tags.push({ name: m[1].toLowerCase(), attrs: parseAttributes(m[2]), index: m.index });
  }
  return tags;
}

/**
 * Split raw prerendered HTML into the markup a crawler parses and the RSC
 * payload. JSON-LD blocks are captured before scripts are removed.
 */
export function separate(raw) {
  const jsonLd = [];
  const withoutLd = raw.replace(
    /<script\b([^>]*)>([\s\S]*?)<\/script>/gi,
    (whole, attrs, body) => {
      const a = parseAttributes(attrs);
      if ((a.type ?? "").toLowerCase() === "application/ld+json") {
        jsonLd.push(body);
        return "";
      }
      return a.src ? whole.replace(body, "") : "";
    }
  );
  const markup = withoutLd
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<noscript\b[^>]*>[\s\S]*?<\/noscript>/gi, "")
    .replace(/<template\b[^>]*>[\s\S]*?<\/template>/gi, "");
  const payload = [...raw.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)]
    .map((m) => m[1])
    .filter((body) => body.includes("__next_f"))
    .join("\n");
  return { markup, jsonLd, payload };
}

/** Parse one prerendered page into everything the checks read. */
export function parsePage(raw) {
  const { markup, jsonLd, payload } = separate(raw);
  const headEnd = markup.search(/<\/head>/i);
  const head = headEnd >= 0 ? markup.slice(0, headEnd) : "";
  const body = headEnd >= 0 ? markup.slice(headEnd) : markup;

  const titles = [...head.matchAll(/<title[^>]*>([\s\S]*?)<\/title>/gi)].map((m) => stripTags(m[1]));
  const headTags = scanTags(head);
  const metas = headTags.filter((t) => t.name === "meta");
  const metaNamed = (name) =>
    metas.filter((t) => (t.attrs.name ?? "").toLowerCase() === name).map((t) => t.attrs.content ?? "");
  const metaProp = (prop) =>
    metas.filter((t) => (t.attrs.property ?? "").toLowerCase() === prop).map((t) => t.attrs.content ?? "");
  const canonicals = headTags
    .filter((t) => t.name === "link" && (t.attrs.rel ?? "").toLowerCase().split(/\s+/).includes("canonical"))
    .map((t) => t.attrs.href ?? "");

  const bodyTags = scanTags(body);

  const headings = [...body.matchAll(/<h([1-6])\b[^>]*>([\s\S]*?)<\/h\1>/gi)].map((m) => ({
    level: Number(m[1]),
    text: stripTags(m[2]),
    index: m.index,
  }));

  // Resolve whether an <img> sits inside a role="img" wrapper with an
  // aria-label (ImagePlaceholder's pattern): then an empty alt is correct.
  const images = [];
  const labelledWrappers = bodyTags.filter((t) => t.attrs.role === "img" && t.attrs["aria-label"]);
  for (const tag of bodyTags) {
    if (tag.name !== "img") continue;
    const wrapped = labelledWrappers.some((w) => w.index < tag.index && tag.index - w.index < 400);
    images.push({
      src: tag.attrs.src ?? null,
      srcset: tag.attrs.srcset ?? null,
      alt: Object.hasOwn(tag.attrs, "alt") ? tag.attrs.alt : null,
      ariaHidden: tag.attrs["aria-hidden"] === "true",
      role: tag.attrs.role ?? null,
      decorativeWrapper: wrapped,
      optimized: /^\/_next\/image\?/.test(tag.attrs.src ?? ""),
    });
  }

  const links = [];
  for (const m of body.matchAll(/<a\b((?:\s+[^\s=/>"']+(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>"']+))?)*)\s*>([\s\S]*?)<\/a>/gi)) {
    const attrs = parseAttributes(m[1]);
    links.push({ href: Object.hasOwn(attrs, "href") ? attrs.href : null, text: stripTags(m[2]).slice(0, 120) });
  }

  const ids = new Set(bodyTags.map((t) => t.attrs.id).filter(Boolean));
  const iframes = bodyTags.filter((t) => t.name === "iframe").map((t) => ({ src: t.attrs.src ?? "", title: t.attrs.title ?? null }));

  // Client-component props that only exist in the RSC payload.
  const payloadText = payload.replace(/\\"/g, '"').replace(/\\\\/g, "\\");
  const videoProps = [...payloadText.matchAll(/"youtubeId":"([^"]*)"/g)].map((m) => m[1]);
  const posterProps = [...payloadText.matchAll(/"poster":"([^"]*)"/g)].map((m) => m[1]);

  const visibleText = stripTags(
    body.replace(/<(svg|script|style)\b[\s\S]*?<\/\1>/gi, " ")
  );

  return {
    titles,
    descriptions: metaNamed("description"),
    robots: metaNamed("robots").concat(metaNamed("googlebot")),
    canonicals,
    ogUrl: metaProp("og:url")[0] ?? null,
    ogImages: metaProp("og:image"),
    twitterImages: metaNamed("twitter:image"),
    jsonLd,
    headings,
    images,
    links,
    ids,
    iframes,
    videoProps,
    posterProps,
    visibleText,
  };
}
