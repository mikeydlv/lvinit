// ---------------------------------------------------------------------------
// FIXTURE SITE — a synthetic Next.js repository + build output, for tests and
// for `--fixtures` demos. Nothing here describes LVINIT's real content.
//
// `writeSite(dir, spec)` writes:
//   app/<route>/page.tsx          source, holding whatever literals the spec gives
//   app/sitemap.ts                in LVINIT's exact entry format
//   components/, lib/             any extra source files
//   public/<path>                 assets (tiny placeholder bytes)
//   .next/server/app/*.html       prerendered pages, in React's serializer style
//   .next/server/app/sitemap.xml.body, robots.txt.body
//   .next/BUILD_ID                written last, dated after every source file
// ---------------------------------------------------------------------------

import { mkdirSync, writeFileSync, utimesSync } from "node:fs";
import { dirname, join } from "node:path";

export const ORIGIN = "https://www.lvinit.com";

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");

/** Render one page the way `next build` does. */
export function renderHtml(p) {
  const head = [
    '<meta charSet="utf-8"/>',
    p.title !== null && p.title !== undefined ? `<title>${esc(p.title)}</title>` : "",
    p.description ? `<meta name="description" content="${esc(p.description)}"/>` : "",
    ...(p.robots ? [`<meta name="robots" content="${esc(p.robots)}"/>`] : []),
    ...(p.canonicals ?? (p.canonical ? [p.canonical] : [])).map((c) => `<link rel="canonical" href="${esc(c)}"/>`),
    p.ogUrl ? `<meta property="og:url" content="${esc(p.ogUrl)}"/>` : "",
    p.ogImage ? `<meta property="og:image" content="${esc(p.ogImage)}"/>` : "",
  ].join("");
  const ld = (p.jsonLd ?? [])
    .map((j) => `<script type="application/ld+json">${typeof j === "string" ? j : JSON.stringify(j)}</script>`)
    .join("");
  const payload = p.payload ? `<script>self.__next_f.push([1,${JSON.stringify(p.payload)}])</script>` : "";
  return `<!DOCTYPE html><html lang="en"><head>${head}</head><body><a href="#main-content" class="skip-link">Skip to content</a><main id="main-content">${p.body ?? ""}</main>${ld}${payload}</body></html>`;
}

export function sitemapTs(entries) {
  const body = entries
    .map(
      (e) => `    {
      url: \`\${BASE_URL}${e.route === "/" ? "/" : e.route}\`,
      changeFrequency: "${e.changeFrequency ?? "monthly"}",
      priority: ${e.priority ?? 0.7},
    },`
    )
    .join("\n");
  return `import type { MetadataRoute } from "next";

const BASE_URL = "${ORIGIN}";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
${body}
  ];
}
`;
}

export function sitemapXml(routes) {
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${routes
    .map((r) => `<url>\n<loc>${r.startsWith("http") ? r : `${ORIGIN}${r === "/" ? "/" : r}`}</loc>\n</url>`)
    .join("\n")}\n</urlset>`;
}

export const DEFAULT_ROBOTS = `User-Agent: *\nAllow: /\n\nHost: ${ORIGIN}\nSitemap: ${ORIGIN}/sitemap.xml\n`;

/** An Article + BreadcrumbList graph like lib/story.ts builds. */
export function storyJsonLd(route, { datePublished = "2026-09-01", image = null, extraGraph = [], name = "Page" } = {}) {
  const article = {
    "@type": "Article",
    headline: name,
    author: { "@type": "Person", name: "Mikey Del Rosario" },
    mainEntityOfPage: `${ORIGIN}${route}`,
    ...(datePublished ? { datePublished, dateModified: datePublished } : {}),
    ...(image ? { image: `${ORIGIN}${image}` } : {}),
  };
  return {
    "@context": "https://schema.org",
    "@graph": [
      article,
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: `${ORIGIN}/` },
          { "@type": "ListItem", position: 2, name, item: `${ORIGIN}${route}` },
        ],
      },
      ...extraGraph,
    ],
  };
}

/** A standard healthy page for `route`. */
export function healthyPage(route, name = route) {
  return {
    title: `${name} | LVINIT`,
    description: `A description unique to ${name}.`,
    canonical: `${ORIGIN}${route === "/" ? "" : route}`,
    ogUrl: `${ORIGIN}${route === "/" ? "" : route}`,
    body: `<h1>${esc(name)}</h1><p>Body copy for ${esc(name)}.</p><a href="/">Home</a>`,
    jsonLd: route.startsWith("/guides/") || route.startsWith("/neighborhoods/") ? [storyJsonLd(route, { name })] : [],
  };
}

export function registryTs({ guides = [], videos = [] } = {}) {
  return `export type Guide = { slug: string; href?: string; publishedAt?: string; image?: string; imageAlt?: string; imageMode?: string; status?: string };
export const neighborhoods = [];
export const videos = ${JSON.stringify(videos, null, 2)};
export const guides: Guide[] = [
${guides.map((g) => `  {\n${Object.entries(g).map(([k, v]) => `    ${k}: ${JSON.stringify(v)},`).join("\n")}\n  },`).join("\n")}
];
`;
}

/**
 * Write a site.
 *
 * spec.pages:    { [route]: page | null }  — null = page file exists but no HTML
 * spec.sitemap:  [{route, changeFrequency, priority}]  (source AND rendered, unless sitemapXmlRoutes given)
 * spec.sitemapXmlRoutes: override what the rendered sitemap lists
 * spec.robots:   robots.txt text (null = none)
 * spec.sources:  { [path]: text }  extra source files; page.tsx files can be overridden here
 * spec.public:   [webPath] or { [webPath]: bytes }
 * spec.registry: { guides, videos }  -> lib/content.ts
 * spec.build:    false = no .next at all
 */
export function writeSite(dir, spec) {
  const write = (rel, text) => {
    const abs = join(dir, rel);
    mkdirSync(dirname(abs), { recursive: true });
    writeFileSync(abs, text);
  };
  const pages = spec.pages ?? {};
  for (const route of Object.keys(pages)) {
    const rel = route === "/" ? "app/page.tsx" : `app${route}/page.tsx`;
    write(rel, `export default function Page() { return null; }\nconst PATH = "${route}";\n`);
  }
  write("app/sitemap.ts", sitemapTs(spec.sitemap ?? Object.keys(pages).map((route) => ({ route }))));
  write("app/robots.ts", "export default function robots() { return {}; }\n");
  if (spec.registry) write("lib/content.ts", registryTs(spec.registry));
  for (const [rel, text] of Object.entries(spec.sources ?? {})) write(rel, text);
  const pub = Array.isArray(spec.public) ? Object.fromEntries(spec.public.map((p) => [p, 10])) : spec.public ?? {};
  for (const [web, bytes] of Object.entries(pub)) write(`public${web}`, Buffer.alloc(bytes, 1));

  if (spec.build === false) return dir;
  for (const [route, page] of Object.entries(pages)) {
    if (!page) continue;
    write(route === "/" ? ".next/server/app/index.html" : `.next/server/app${route}.html`, renderHtml(page));
  }
  const xmlRoutes = spec.sitemapXmlRoutes ?? (spec.sitemap ?? Object.keys(pages).map((route) => ({ route }))).map((e) => e.route);
  if (spec.sitemapXml !== null) write(".next/server/app/sitemap.xml.body", spec.sitemapXml ?? sitemapXml(xmlRoutes));
  if (spec.robots !== null) write(".next/server/app/robots.txt.body", spec.robots ?? DEFAULT_ROBOTS);
  write(".next/BUILD_ID", "fixture-build\n");
  const future = new Date(Date.now() + 60_000);
  utimesSync(join(dir, ".next/BUILD_ID"), future, future);
  return dir;
}

/**
 * The `--fixtures` demo site: five pages, one of each outcome.
 *   /guides/beta         links to "/Guides/Alpha" (letter case) — auto-fix candidate
 *   /guides/delta        live but missing from the sitemap      — auto-fix candidate
 *   /guides/alpha        image with no alt attribute            — Publisher handoff
 *   footer               href="#" legal links                   — report-only
 */
export function writeFixtureSite(dir) {
  const alpha = healthyPage("/guides/alpha", "Alpha Guide");
  alpha.body += `<img src="/images/alpha.webp"/>`;
  const beta = healthyPage("/guides/beta", "Beta Guide");
  beta.body += `<p>See <a href="/Guides/Alpha">the alpha guide</a>.</p>`;
  const footer = `<footer><a href="#">Privacy Policy</a></footer>`;
  const pages = {
    "/": healthyPage("/", "Home"),
    "/guides": healthyPage("/guides", "Guides"),
    "/guides/alpha": alpha,
    "/guides/beta": beta,
    "/guides/gamma": healthyPage("/guides/gamma", "Gamma Guide"),
    "/guides/delta": healthyPage("/guides/delta", "Delta Guide"),
  };
  pages["/"].body += `<a href="/guides">Guides</a>`;
  pages["/guides"].body += ["alpha", "beta", "gamma", "delta"].map((s) => `<a href="/guides/${s}">${s}</a>`).join("");
  for (const p of Object.values(pages)) p.body += footer;
  writeSite(dir, {
    pages,
    sitemap: [
      { route: "/", changeFrequency: "weekly", priority: 1 },
      { route: "/guides", changeFrequency: "weekly", priority: 0.8 },
      { route: "/guides/alpha" },
      { route: "/guides/beta" },
      { route: "/guides/gamma" },
    ],
    sources: {
      "app/guides/beta/page.tsx": `import Link from "next/link";\nconst PATH = "/guides/beta";\nexport default function Page() {\n  return <p>See <Link href="/Guides/Alpha">the alpha guide</Link>.</p>;\n}\n`,
      "components/Footer.tsx": `const legal = [\n  { label: "Privacy Policy", href: "#" },\n];\nexport default legal;\n`,
    },
    public: ["/images/alpha.webp"],
    registry: {
      guides: ["alpha", "beta", "gamma", "delta"].map((s) => ({ slug: s, href: `/guides/${s}`, publishedAt: "2026-09-01" })),
    },
  });
  return dir;
}
