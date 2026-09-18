// ---------------------------------------------------------------------------
// COLLECTION — targeted RSS/Atom reads, no crawling
//
// Two kinds of input:
//   1. direct feeds from config.sources.feeds (city newsrooms, local outlets,
//      one combined Reddit feed)
//   2. Google News RSS searches built from the area / builder / topic lists
//
// Every request is a plain GET with a timeout and a polite delay. A feed that
// fails is recorded in `health` and the run continues — one dead newsroom must
// never cost Mikey the whole morning report.
//
// Zero dependencies: the XML is simple enough that a small tolerant parser is
// safer than pulling in a library for it.
// ---------------------------------------------------------------------------

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** Decode the handful of entities feeds actually use. */
export function decodeEntities(text) {
  return String(text ?? "")
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(Number.parseInt(n, 16)))
    .replace(/&nbsp;/g, " ")
    .replace(/&quot;/g, '"')
    .replace(/&apos;|&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");
}

/** Strip tags and collapse whitespace. Run AFTER decoding (descriptions are escaped HTML). */
export function stripHtml(html) {
  return String(html ?? "")
    .replace(/<(script|style|noscript)[\s\S]*?<\/\1>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\{[^{}]*\}/g, " ") // inline CSS some CMS feeds leak into descriptions
    .replace(/\s+/g, " ")
    .trim();
}

function tag(block, name) {
  const m = block.match(new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)</${name}>`, "i"));
  return m ? decodeEntities(m[1]).trim() : "";
}

function attr(block, name, attribute) {
  const m = block.match(new RegExp(`<${name}\\b[^>]*\\b${attribute}="([^"]*)"`, "i"));
  return m ? decodeEntities(m[1]) : "";
}

function toIso(dateText) {
  if (!dateText) return null;
  const d = new Date(dateText);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

/**
 * Parse RSS 2.0 or Atom into flat items.
 * @returns {{title:string,url:string,published:string|null,snippet:string,sourceName:string,sourceUrl:string}[]}
 */
export function parseFeed(xml) {
  const text = String(xml ?? "");
  const isAtom = /<feed[\s>]/i.test(text) && !/<rss[\s>]/i.test(text);
  const blocks = text.match(isAtom ? /<entry[\s>][\s\S]*?<\/entry>/gi : /<item[\s>][\s\S]*?<\/item>/gi) ?? [];
  return blocks.map((block) => {
    const title = stripHtml(tag(block, "title"));
    let url = isAtom ? attr(block, "link", "href") : tag(block, "link");
    if (!url) url = tag(block, "guid");
    const published = toIso(tag(block, "pubDate") || tag(block, "published") || tag(block, "updated") || tag(block, "dc:date"));
    const rawBody = tag(block, "description") || tag(block, "summary") || tag(block, "content") || tag(block, "content:encoded");
    const snippet = stripHtml(decodeEntities(rawBody)).slice(0, 600);
    return {
      title,
      url: url.trim(),
      published,
      snippet,
      sourceName: stripHtml(tag(block, "source")),
      sourceUrl: attr(block, "source", "url"),
    };
  });
}

/**
 * Google News titles end in " - Publisher". Split it off so the headline is
 * clean and the publisher is known even though the link is a Google redirect.
 */
export function cleanGoogleNewsItem(item) {
  let title = item.title;
  let publisher = item.sourceName;
  // Greedy head, so "… - Las Vegas Review-Journal" splits at the LAST " - ".
  const m = title.match(/^(.*\S)\s+-\s+(.{2,80})$/);
  if (m && (!publisher || m[2].trim() === publisher || m[2].length <= 60)) {
    title = m[1];
    publisher = publisher || m[2].trim();
  }
  // Section labels some publishers append: "Headline | New Homes | Homes".
  const head = title.split(/\s+\|\s+/)[0];
  if (head.length >= 20) title = head;
  // Google's description is just the headline again plus the publisher.
  const snippet = item.snippet && !item.snippet.startsWith(title.slice(0, 30)) ? item.snippet : "";
  return { ...item, title, snippet, sourceName: publisher };
}

/**
 * The targeted search list. Every query carries Vegas context so a quoted
 * area name cannot pull in a same-named place elsewhere.
 */
export function buildGoogleQueries(config) {
  const tier1 = config.areas.filter((a) => a.tier === 1).map((a) => a.label);
  const q = [];
  for (const area of tier1) {
    const place = area.includes("Las Vegas") || area.includes("Henderson") ? `"${area}"` : `"${area}" Las Vegas`;
    q.push(`${place} (homes OR development OR construction OR builder OR "new community")`);
    q.push(`${place} (opening OR park OR school OR retail OR grocery OR road)`);
  }
  // Builders, a few per query to keep the count down.
  for (let i = 0; i < config.builders.length; i += 5) {
    const names = config.builders.slice(i, i + 5).map((b) => `"${b}"`).join(" OR ");
    q.push(`(${names}) ("Las Vegas" OR Henderson Nevada) homes`);
  }
  q.push(`"Las Vegas" (redevelopment OR "mixed-use" OR demolition OR implosion) project`);
  q.push(`"Las Vegas" (casino OR resort) site plans approved`);
  q.push(`"Clark County" commission approves (homes OR development OR project)`);
  q.push(`"Henderson" city council approves (homes OR development OR project) Nevada`);
  q.push(`"Las Vegas" (freeway OR interchange OR "road widening" OR NDOT OR RTC) project`);
  q.push(`"Harry Reid" airport (terminal OR expansion OR changes)`);
  q.push(`Nevada ("property tax" OR "special improvement district" OR HOA) homeowners Las Vegas`);
  q.push(`"Las Vegas" (housing affordability OR "home prices" OR "home insurance") homeowners`);
  q.push(`"Las Vegas" ("master-planned community" OR "build-to-rent" OR "land auction" OR BLM land)`);
  q.push(`"Las Vegas" ("Red Rock" OR "Lake Mead" OR trail OR park) (new OR plan OR project)`);
  return q;
}

export function googleNewsUrl(config, query) {
  const g = config.sources.googleNews;
  const params = new URLSearchParams({ q: `${query} when:${g.window}`, hl: "en-US", gl: "US", ceid: "US:en" });
  return `${g.base}?${params}`;
}

/** GET with timeout. Returns { ok, status, text, error }. */
export async function fetchText(url, config, { fetchImpl = fetch, accept = "application/rss+xml, application/atom+xml, application/xml, text/xml, text/html;q=0.8, */*;q=0.5" } = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), config.sources.timeoutMs);
  try {
    const res = await fetchImpl(url, {
      headers: { "User-Agent": config.sources.userAgent, Accept: accept },
      redirect: "follow",
      signal: controller.signal,
    });
    const text = await res.text();
    return { ok: res.ok, status: res.status, text, finalUrl: res.url || url };
  } catch (error) {
    return { ok: false, status: 0, text: "", error: error.name === "AbortError" ? "timeout" : String(error.message ?? error) };
  } finally {
    clearTimeout(timer);
  }
}

function hostOf(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

/** Which tier a publisher domain earns. */
export function tierForDomain(domain, config, fallback = "news") {
  const d = String(domain ?? "").toLowerCase();
  const matches = (list) => list.some((x) => d === x || d.endsWith(`.${x}`));
  if (matches(config.sources.officialDomains) || /\.gov$/.test(d)) return "official";
  if (matches(config.sources.builderDomains)) return "builder";
  if (/reddit\.com$/.test(d)) return "social";
  return fallback;
}

/**
 * Collect everything. Sequential on purpose: ~50 small requests, a polite
 * delay between them, about a minute in total.
 */
export async function collect(config, { fetchImpl = fetch, log = () => {}, delay = sleep } = {}) {
  const items = [];
  const health = [];

  for (const feed of config.sources.feeds) {
    let res = await fetchText(feed.url, config, { fetchImpl });
    if (res.status === 429 && feed.tier === "social") {
      // Reddit: one patient retry, then give up quietly — it is only a signal.
      await delay(8000);
      res = await fetchText(feed.url, config, { fetchImpl });
    }
    const parsed = res.ok ? parseFeed(res.text) : [];
    health.push({ id: feed.id, name: feed.name, tier: feed.tier, ok: res.ok && parsed.length > 0, status: res.status, items: parsed.length, error: res.error ?? (res.ok && !parsed.length ? "no items parsed" : null) });
    for (const p of parsed) {
      const domain = hostOf(p.url);
      items.push({
        ...p,
        via: feed.id,
        sourceName: feed.tier === "social" ? `Reddit ${subredditOf(p.url)}`.trim() : feed.name,
        sourceDomain: domain,
        tier: feed.tier === "social" ? "social" : tierForDomain(domain, config, feed.tier),
      });
    }
    log(`  feed ${feed.id.padEnd(16)} ${res.ok ? `${parsed.length} items` : `FAILED (${res.status || res.error})`}`);
    await delay(config.sources.politeDelayMs);
  }

  if (config.sources.googleNews.enabled) {
    const queries = buildGoogleQueries(config);
    let ok = 0;
    let count = 0;
    for (const query of queries) {
      const res = await fetchText(googleNewsUrl(config, query), config, { fetchImpl });
      if (res.ok) {
        ok += 1;
        for (const raw of parseFeed(res.text)) {
          const it = cleanGoogleNewsItem(raw);
          const domain = hostOf(it.sourceUrl) || "";
          count += 1;
          items.push({
            ...it,
            via: "google-news",
            query,
            sourceDomain: domain,
            tier: tierForDomain(domain, config, "news"),
          });
        }
      }
      await delay(config.sources.politeDelayMs);
    }
    health.push({ id: "google-news", name: `Google News search (${queries.length} targeted queries)`, tier: "news", ok: ok > 0, status: ok === queries.length ? 200 : 207, items: count, error: ok === queries.length ? null : `${queries.length - ok} of ${queries.length} queries failed` });
    log(`  google news      ${ok}/${queries.length} queries, ${count} items`);
  }

  return { items, health };
}

function subredditOf(url) {
  const m = String(url).match(/reddit\.com\/r\/([^/]+)/i);
  return m ? `r/${m[1]}` : "";
}

/**
 * Pull a short excerpt of the article itself for a shortlisted item: the meta
 * description plus the first paragraphs. Only for direct publisher URLs —
 * Google News links are redirects that need a browser, and Reddit is signal.
 */
export async function fetchExcerpt(url, config, { fetchImpl = fetch } = {}) {
  const res = await fetchText(url, config, { fetchImpl, accept: "text/html,application/xhtml+xml" });
  if (!res.ok) return { ok: false, error: res.error ?? `HTTP ${res.status}` };
  const html = res.text;
  const meta =
    decodeEntities((html.match(/<meta[^>]+(?:name|property)="(?:og:)?description"[^>]+content="([^"]*)"/i) ?? [])[1] ?? "");
  const paras = (html.match(/<p[\s>][\s\S]*?<\/p>/gi) ?? [])
    .map((p) => stripHtml(decodeEntities(p)))
    .filter((p) => p.split(" ").length >= 8);
  const published = (html.match(/"datePublished"\s*:\s*"([^"]+)"/) ?? html.match(/<meta[^>]+property="article:published_time"[^>]+content="([^"]+)"/i) ?? [])[1] ?? null;
  const text = [meta, ...paras].join(" ").replace(/\s+/g, " ").trim().slice(0, config.sources.maxExcerptChars);
  return { ok: text.length > 0, text, published: toIso(published) };
}
