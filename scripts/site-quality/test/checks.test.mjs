// Every audit area, against small synthetic sites. Each test builds a healthy
// site, breaks exactly one thing, and asserts that exactly that is reported.

import test from "node:test";
import assert from "node:assert/strict";

import { audit, healthySite, healthyPage, storyJsonLd, ofType, ORIGIN } from "./helpers.mjs";
import { parseRobots, parseSitemapXml, routeFromPageFile } from "../lib/inventory.mjs";
import { robotsAllows } from "../lib/checks/routes-sitemap-robots.mjs";
import { validMailto, validTel } from "../lib/checks/links.mjs";
import { youtubeIdFromUrl } from "../lib/checks/registry-video.mjs";
import { parsePage } from "../lib/html.mjs";
import { renderHtml } from "../fixtures/fixture-site.mjs";

test("a healthy site produces no findings at all", async () => {
  const r = await audit(healthySite());
  assert.deepEqual(r.findings.map((f) => `${f.type} ${f.route}`), []);
  assert.equal(r.health.site, 100);
});

// --- routes -----------------------------------------------------------------

test("route inventory: route groups vanish, private folders and api are skipped", () => {
  assert.equal(routeFromPageFile("app/page.tsx"), "/");
  assert.equal(routeFromPageFile("app/(marketing)/guides/x/page.tsx"), "/guides/x");
  assert.equal(routeFromPageFile("app/_drafts/x/page.tsx"), null);
});

test("route inventory lists every page file and flags two files serving one URL", async () => {
  const spec = healthySite(["alpha"]);
  // A route group serves the same URL as a plain folder. (Two folders that
  // differ only by case cannot coexist on Windows, where this also runs.)
  spec.sources = {
    "app/(site)/guides/alpha/page.tsx": "export default function P() { return null; }\n",
    "app/guides/Zeta/page.tsx": "export default function P() { return null; }\n",
  };
  const r = await audit(spec);
  assert.equal(r.stats.routes, 5); // /, /guides, /guides/alpha twice, /guides/Zeta
  assert.equal(ofType(r, "route-duplicate").length, 1);
  assert.equal(ofType(r, "route-casing").length, 1);
});

test("a page file with no prerendered HTML in a fresh build is reported", async () => {
  const spec = healthySite(["alpha"]);
  spec.pages["/guides/alpha"] = null;
  spec.sitemap = spec.sitemap.filter((e) => e.route !== "/guides/alpha");
  const r = await audit(spec);
  assert.equal(ofType(r, "route-not-rendered")[0].route, "/guides/alpha");
});

// --- sitemap ----------------------------------------------------------------

test("sitemap: a published page missing from it is HIGH", async () => {
  const spec = healthySite();
  spec.sitemap = spec.sitemap.filter((e) => e.route !== "/guides/beta");
  const r = await audit(spec);
  const f = ofType(r, "sitemap-missing-route");
  assert.equal(f.length, 1);
  assert.equal(f[0].route, "/guides/beta");
  assert.equal(f[0].severity, "HIGH");
});

test("sitemap: a stale entry for a route with no page is HIGH", async () => {
  const spec = healthySite();
  spec.sitemap = [...spec.sitemap, { route: "/guides/deleted" }];
  const r = await audit(spec);
  assert.equal(ofType(r, "sitemap-stale-route")[0].route, "/guides/deleted");
});

test("sitemap: duplicates and malformed URLs are reported; intentional exclusions are respected", async () => {
  const spec = healthySite();
  spec.sitemapXmlRoutes = ["/", "/guides", "/guides/alpha", "/guides/alpha", "/guides/beta/", "http://lvinit.com/guides/gamma"];
  const r = await audit(spec, {});
  assert.equal(ofType(r, "sitemap-duplicate").length, 1);
  assert.equal(ofType(r, "sitemap-malformed-url").length, 2);

  const excluded = healthySite();
  excluded.sitemap = excluded.sitemap.filter((e) => e.route !== "/guides/gamma");
  const { testConfig } = await import("./helpers.mjs");
  const r2 = await audit(excluded, { config: testConfig({ site: { sitemapExcludedRoutes: ["/guides/gamma"] } }) });
  assert.equal(ofType(r2, "sitemap-missing-route").length, 0);
});

test("sitemap.xml parsing handles &amp; and returns null for a non-sitemap", () => {
  assert.deepEqual(parseSitemapXml("<urlset><url><loc>https://x.com/a?b=1&amp;c=2</loc></url></urlset>"), ["https://x.com/a?b=1&c=2"]);
  assert.equal(parseSitemapXml("<html></html>"), null);
});

test("sitemap missing entirely is CRITICAL", async () => {
  const spec = healthySite();
  spec.sitemapXml = null;
  const r = await audit(spec);
  assert.equal(ofType(r, "sitemap-unavailable")[0].severity, "CRITICAL");
});

// --- robots -----------------------------------------------------------------

test("robots: parse, longest-match allow/disallow, and a site-wide block is CRITICAL", async () => {
  const parsed = parseRobots("User-agent: *\nDisallow: /private\nAllow: /private/ok\nSitemap: https://x/s.xml\nnonsense line\n");
  assert.equal(parsed.groups.length, 1);
  assert.equal(parsed.malformed.length, 1);
  assert.equal(robotsAllows(parsed.groups[0], "/private/x"), false);
  assert.equal(robotsAllows(parsed.groups[0], "/private/ok/y"), true);
  assert.equal(robotsAllows(parseRobots("User-agent: *\nDisallow:\n").groups[0], "/"), true, "an empty Disallow allows everything");

  const spec = healthySite();
  spec.robots = `User-agent: *\nDisallow: /\nSitemap: ${ORIGIN}/sitemap.xml\n`;
  const r = await audit(spec);
  assert.equal(ofType(r, "robots-blocks-site")[0].severity, "CRITICAL");
});

test("robots: blocking one sitemap route is HIGH; a missing Sitemap line is MEDIUM", async () => {
  const spec = healthySite();
  spec.robots = "User-agent: *\nDisallow: /guides/alpha\n";
  const r = await audit(spec);
  assert.equal(ofType(r, "robots-blocks-route")[0].route, "/guides/alpha");
  assert.equal(ofType(r, "robots-missing-sitemap")[0].severity, "MEDIUM");
});

// --- metadata / canonical -----------------------------------------------------

test("metadata: missing title and description are MEDIUM Publisher handoffs", async () => {
  const spec = healthySite();
  spec.pages["/guides/alpha"].title = null;
  spec.pages["/guides/beta"].description = "";
  const r = await audit(spec);
  const t = ofType(r, "title-missing")[0];
  assert.equal(t.severity, "MEDIUM");
  assert.equal(t.owner, "Publisher");
  assert.ok(t.publisherHandoff);
  assert.equal(ofType(r, "description-missing")[0].route, "/guides/beta");
});

test("metadata: duplicate titles and descriptions become ONE finding naming every page", async () => {
  const spec = healthySite();
  spec.pages["/guides/alpha"].title = "Same | LVINIT";
  spec.pages["/guides/beta"].title = "Same | LVINIT";
  spec.pages["/guides/beta"].description = "Shared.";
  spec.pages["/guides/gamma"].description = "Shared.";
  const r = await audit(spec);
  const t = ofType(r, "title-duplicate");
  assert.equal(t.length, 1);
  assert.deepEqual(t[0].routes, ["/guides/alpha", "/guides/beta"]);
  assert.equal(ofType(r, "description-duplicate")[0].routes.length, 2);
});

test("canonical: pointing at another page is HIGH; many pages inheriting '/' is systemic CRITICAL", async () => {
  const one = healthySite();
  one.pages["/guides/alpha"].canonical = `${ORIGIN}/guides/beta`;
  const r1 = await audit(one);
  const m = ofType(r1, "canonical-mismatch")[0];
  assert.equal(m.severity, "HIGH");
  assert.equal(m.fixability, "never", "which page is canonical is an SEO decision");

  const many = healthySite(["a", "b", "c", "d", "e"]);
  for (const s of ["a", "b", "c", "d", "e"]) many.pages[`/guides/${s}`].canonical = ORIGIN;
  const r2 = await audit(many);
  const sys = ofType(r2, "canonical-mismatch");
  assert.equal(sys.length, 1, "one root cause, one finding");
  assert.equal(sys[0].severity, "CRITICAL");
  assert.equal(sys[0].routes.length, 5);
});

test("canonical: letter case, trailing slash and wrong host are malformed; two canonicals is HIGH", async () => {
  const spec = healthySite();
  spec.pages["/guides/alpha"].canonical = `${ORIGIN}/Guides/Alpha`;
  spec.pages["/guides/beta"].canonical = `http://lvinit.com/guides/beta/`;
  spec.pages["/guides/gamma"].canonicals = [`${ORIGIN}/guides/gamma`, `${ORIGIN}/guides/other`];
  const r = await audit(spec);
  assert.equal(ofType(r, "canonical-malformed").length, 2);
  assert.equal(ofType(r, "canonical-multiple")[0].severity, "HIGH");
});

test("noindex on a published page is HIGH, on the homepage CRITICAL; intentional noindex is allowed", async () => {
  const spec = healthySite();
  spec.pages["/guides/alpha"].robots = "noindex, follow";
  const r = await audit(spec);
  assert.equal(ofType(r, "noindex-unexpected")[0].severity, "HIGH");

  const home = healthySite();
  home.pages["/"].robots = "noindex";
  assert.equal(ofType(await audit(home), "noindex-unexpected")[0].severity, "CRITICAL");

  const { testConfig } = await import("./helpers.mjs");
  const ok = healthySite();
  ok.pages["/guides/alpha"].robots = "noindex";
  ok.sitemap = ok.sitemap.filter((e) => e.route !== "/guides/alpha");
  const r3 = await audit(ok, { config: testConfig({ site: { intentionalNoindexRoutes: ["/guides/alpha"] } }) });
  assert.equal(ofType(r3, "noindex-unexpected").length, 0);
  assert.equal(ofType(r3, "sitemap-missing-route").length, 0, "a noindex page does not belong in the sitemap");
});

test("localhost / staging URLs anywhere in output or source are HIGH", async () => {
  const spec = healthySite();
  spec.pages["/guides/alpha"].body += `<a href="http://localhost:3000/guides/beta">local</a>`;
  spec.sources = { "lib/api.ts": `export const API = "https://lvinit-git-main.vercel.app/api";\n// "http://localhost:3000" in a comment is fine\n` };
  const r = await audit(spec);
  const dev = ofType(r, "dev-url");
  assert.equal(dev.length, 2);
  assert.ok(dev.every((f) => f.severity === "HIGH"));
});

// --- structured data ----------------------------------------------------------

test("schema: unparseable JSON-LD is HIGH; a URL mismatch and duplicate Article are MEDIUM", async () => {
  const spec = healthySite();
  spec.pages["/guides/alpha"].jsonLd = ['{"@context":"https://schema.org", broken'];
  spec.pages["/guides/beta"].jsonLd = [storyJsonLd("/guides/other", { name: "beta" })];
  spec.pages["/guides/gamma"].jsonLd = [storyJsonLd("/guides/gamma"), storyJsonLd("/guides/gamma", { name: "second" })];
  const r = await audit(spec);
  assert.equal(ofType(r, "schema-parse-error")[0].severity, "HIGH");
  const url = ofType(r, "schema-url-mismatch").filter((f) => f.route === "/guides/beta");
  assert.ok(url.length >= 1);
  assert.ok(ofType(r, "schema-duplicate-entity").some((f) => f.route === "/guides/gamma"));
});

test("schema: bad dates and a missing datePublished on a guide are MEDIUM handoffs", async () => {
  const spec = healthySite();
  spec.pages["/guides/alpha"].jsonLd = [storyJsonLd("/guides/alpha", { datePublished: "2026-02-30" })];
  spec.pages["/guides/beta"].jsonLd = [storyJsonLd("/guides/beta", { datePublished: null })];
  spec.pages["/guides/gamma"].jsonLd = [storyJsonLd("/guides/gamma", { datePublished: "2027-01-01" })];
  const r = await audit(spec);
  const bad = ofType(r, "schema-bad-date");
  assert.deepEqual([...new Set(bad.map((f) => f.route))].sort(), ["/guides/alpha", "/guides/gamma"]);
  assert.ok(bad.some((f) => /future/.test(f.failure)));
  assert.equal(ofType(r, "schema-missing-date")[0].route, "/guides/beta");
});

test("schema: a page lacking Article when its peers have one is flagged; a breadcrumb to nowhere too", async () => {
  const spec = healthySite(["a", "b", "c"]);
  spec.pages["/guides/a"].jsonLd = [];
  const bc = storyJsonLd("/guides/b");
  bc["@graph"][1].itemListElement.splice(1, 0, { "@type": "ListItem", position: 2, name: "Gone", item: `${ORIGIN}/neighborhoods/gone` });
  spec.pages["/guides/b"].jsonLd = [bc];
  const r = await audit(spec);
  assert.equal(ofType(r, "schema-missing-article")[0].route, "/guides/a");
  assert.equal(ofType(r, "schema-breadcrumb-broken")[0].failure, "/neighborhoods/gone");
});

test("schema: an image named in schema that is not in public/ is HIGH", async () => {
  const spec = healthySite();
  spec.pages["/guides/alpha"].jsonLd = [storyJsonLd("/guides/alpha", { image: "/images/missing.webp" })];
  const r = await audit(spec);
  assert.equal(ofType(r, "schema-asset-missing")[0].severity, "HIGH");
});

// --- images -----------------------------------------------------------------

test("images: missing file, case-only mismatch and missing alt are reported; decorative empty alt is not", async () => {
  const spec = healthySite();
  spec.public = ["/images/Real-Photo.webp", "/images/poster.jpg", "/images/ok.webp"];
  spec.pages["/guides/alpha"].body += `<img src="/images/gone.webp" alt="x"/>`;
  spec.pages["/guides/beta"].body += `<img src="/_next/image?url=%2Fimages%2Freal-photo.webp&amp;w=640&amp;q=75" alt="A photo"/>`;
  spec.pages["/guides/gamma"].body +=
    `<img src="/images/ok.webp"/>` + // no alt at all
    `<img src="/images/poster.jpg" alt="" aria-hidden="true"/>` + // decorative
    `<div role="img" aria-label="Label"><img src="/images/ok.webp" alt=""/></div>`; // labelled wrapper
  const r = await audit(spec);
  assert.equal(ofType(r, "image-missing-file")[0].failure, "/images/gone.webp");
  const kase = ofType(r, "image-path-case")[0];
  assert.deepEqual(kase.evidence[0].actual, ["/images/Real-Photo.webp"]);
  assert.equal(ofType(r, "image-alt-missing").length, 1);
  assert.equal(r.stats.emptyAltIntentional, 2);
});

test("images: empty alt on a registered PHOTO is flagged; on an editorial cover it is not", async () => {
  const spec = healthySite();
  spec.public = ["/images/photo.webp", "/images/cover.webp"];
  spec.registry.guides[0].image = "/images/photo.webp";
  spec.registry.guides[0].imageAlt = "A real photo";
  spec.registry.guides[1].image = "/images/cover.webp";
  spec.registry.guides[1].imageMode = "editorial-cover";
  spec.pages["/guides"].body += `<img src="/images/photo.webp" alt=""/><img src="/images/cover.webp" alt=""/>`;
  const r = await audit(spec);
  const f = ofType(r, "image-alt-empty-photo");
  assert.equal(f.length, 1);
  assert.equal(f[0].failure, "/images/photo.webp");
});

test("images: an external hotlink is flagged unless its host is allowlisted", async () => {
  const spec = healthySite();
  spec.pages["/guides/alpha"].body += `<img src="https://cdn.example.com/stock.jpg" alt="stock"/>`;
  assert.equal(ofType(await audit(spec), "image-hotlink").length, 1);
  const { testConfig } = await import("./helpers.mjs");
  const r = await audit(spec, { config: testConfig({ urls: { allowedImageHosts: ["cdn.example.com"] } }) });
  assert.equal(ofType(r, "image-hotlink").length, 0);
});

test("images: /images literals in source are resolved too, ignoring comments", async () => {
  const spec = healthySite();
  spec.sources = {
    "components/Card.tsx": `// old: "/images/deleted.webp"\nexport const IMG = "/images/nope.webp";\n`,
  };
  const r = await audit(spec);
  const missing = ofType(r, "image-missing-file");
  assert.equal(missing.length, 1);
  assert.equal(missing[0].failure, "/images/nope.webp");
  assert.equal(missing[0].sources[0].file, "components/Card.tsx");
});

// --- headings -----------------------------------------------------------------

test("headings: missing, duplicate and empty H1s; a level skip is LOW", async () => {
  const spec = healthySite();
  spec.pages["/guides/alpha"].body = "<p>No heading</p>";
  spec.pages["/guides/beta"].body = "<h1>One</h1><h1>Two</h1>";
  spec.pages["/guides/gamma"].body = "<h1>Title</h1><h2>Sec</h2><h4>Skipped</h4>";
  spec.pages["/guides"].body = spec.pages["/guides"].body.replace(/<h1>[^<]*<\/h1>/, "<h1> </h1>");
  const r = await audit(spec);
  assert.equal(ofType(r, "h1-missing")[0].route, "/guides/alpha");
  assert.equal(ofType(r, "h1-multiple")[0].route, "/guides/beta");
  assert.equal(ofType(r, "h1-empty")[0].route, "/guides");
  assert.equal(ofType(r, "heading-skip")[0].severity, "LOW");
});

test("the RSC payload is not mistaken for markup (no phantom H1s or links)", () => {
  const html = renderHtml({ title: "T", body: "<h1>Real</h1>", payload: '["$","h1",null,{"children":"Phantom"}] <a href=\\"/x\\">' });
  const page = parsePage(html);
  assert.equal(page.headings.filter((h) => h.level === 1).length, 1);
  assert.equal(page.links.filter((l) => l.href === "/x").length, 0);
});

// --- links ------------------------------------------------------------------

test("links: a broken internal link is HIGH and names a unique slug match without fixing it", async () => {
  const spec = healthySite();
  spec.pages["/guides/alpha"].body += `<a href="/neighborhoods/beta">beta</a>`;
  const r = await audit(spec);
  const f = ofType(r, "link-broken-internal")[0];
  assert.equal(f.severity, "HIGH");
  assert.match(f.detail, /The only route with that slug is \/guides\/beta/);
  assert.equal(f.disposition, "REVIEW_REQUIRED");
});

test("links: a missing anchor is MEDIUM; an existing one (same or other page) is fine", async () => {
  const spec = healthySite();
  spec.pages["/guides/beta"].body += `<h2 id="costs">Costs</h2>`;
  spec.pages["/guides/alpha"].body += `<a href="#nope">x</a><a href="#main-content">skip</a><a href="/guides/beta#costs">ok</a><a href="/guides/beta#gone">bad</a>`;
  const r = await audit(spec);
  const anchors = ofType(r, "link-broken-anchor");
  assert.deepEqual(anchors.map((f) => f.failure).sort(), ["#nope", "/guides/beta#gone"]);
});

test("links: the same broken anchor in a shared component is ONE finding across pages", async () => {
  const spec = healthySite();
  for (const p of Object.values(spec.pages)) p.body += `<nav><a href="#compare">Compare</a></nav>`;
  spec.pages["/"].body += `<section id="compare"></section>`;
  spec.sources = { "components/Navbar.tsx": `const links = [\n  { label: "Compare", href: "#compare" },\n];\n` };
  const r = await audit(spec);
  const f = ofType(r, "link-broken-anchor");
  assert.equal(f.length, 1, "noise grouping: one root cause");
  assert.equal(f[0].routes.length, 4);
  assert.equal(f[0].severity, "MEDIUM", "breadth alone never raises severity");
  assert.equal(f[0].sources[0].file, "components/Navbar.tsx");
});

test("links: mailto / tel validation", () => {
  assert.equal(validMailto("mailto:mikey@lvinit.com"), true);
  assert.equal(validMailto("mailto:?subject=Hi"), true);
  assert.equal(validMailto("mailto:mikey@lvinit"), false);
  assert.equal(validMailto("mailto:not an email"), false);
  assert.equal(validTel("tel:+1 (702) 555-0100"), true);
  assert.equal(validTel("tel:call-me"), false);
});

test("links: malformed mailto/tel and placeholder hrefs are reported", async () => {
  const spec = healthySite();
  spec.pages["/guides/alpha"].body += `<a href="mailto:mikey@">mail</a><a href="tel:12">call</a><a href="#">Privacy Policy</a>`;
  const r = await audit(spec);
  assert.equal(ofType(r, "link-mailto-malformed").length, 1);
  assert.equal(ofType(r, "link-tel-malformed").length, 1);
  assert.equal(ofType(r, "link-placeholder").length, 1);
});

test("links: a page nothing links to (only the sitemap) is a technical orphan", async () => {
  const spec = healthySite();
  spec.pages["/guides"].body = spec.pages["/guides"].body.replace(`<a href="/guides/gamma">gamma</a>`, "");
  const r = await audit(spec);
  assert.deepEqual(ofType(r, "page-unreachable").map((f) => f.route), ["/guides/gamma"]);
  assert.equal(ofType(r, "page-unreachable")[0].owner, "Internal Linking Agent");
});

test("links: casing, trailing slash and double slash resolve to real routes and are fixable types", async () => {
  const spec = healthySite();
  spec.pages["/guides/alpha"].body += `<a href="/Guides/Beta">b</a><a href="/guides/gamma/">g</a><a href="/guides//beta">d</a>`;
  const r = await audit(spec);
  assert.equal(ofType(r, "link-casing")[0].severity, "HIGH");
  assert.equal(ofType(r, "link-trailing-slash")[0].severity, "LOW");
  assert.equal(ofType(r, "link-double-slash").length, 1);
  assert.equal(ofType(r, "link-broken-internal").length, 0, "none of them is a plain broken link");
});

// --- registry -----------------------------------------------------------------

test("registry: date mismatch with the page, broken href, missing entry and missing photo alt", async () => {
  const spec = healthySite(["alpha", "beta", "gamma", "delta"]);
  spec.public = ["/images/p.webp"];
  spec.registry.guides[0].publishedAt = "2026-08-01"; // page says 2026-09-01
  spec.registry.guides[1].href = "/guides/renamed";
  spec.registry.guides[2].image = "/images/p.webp"; // photo mode, no imageAlt
  spec.registry.guides.pop(); // delta has no entry
  const r = await audit(spec);
  assert.equal(ofType(r, "registry-date-mismatch")[0].route, "/guides/alpha");
  assert.equal(ofType(r, "registry-href-broken")[0].route, "/guides/renamed");
  assert.ok(ofType(r, "registry-missing-entry").some((f) => f.route === "/guides/delta"));
  assert.equal(ofType(r, "registry-photo-alt-missing")[0].route, "/guides/gamma");
  assert.ok(r.findings.filter((f) => f.area === "registry").every((f) => f.fixability === "never"), "registry data is never auto-edited");
});

test("registry: an unreadable registry is reported as a system problem, not a crash", async () => {
  const spec = healthySite();
  spec.registry = null;
  spec.sources = { "lib/content.ts": `import x from "./other";\nexport const guides = [];\n` };
  const r = await audit(spec);
  assert.equal(ofType(r, "registry-unavailable").length, 1);
  assert.ok(r.system.some((s) => s.check === "content registry" && !s.ok));
});

// --- video ------------------------------------------------------------------

test("video: YouTube id extraction and format", () => {
  assert.equal(youtubeIdFromUrl("https://www.youtube.com/embed/2w-zkNv5Ta4"), "2w-zkNv5Ta4");
  assert.equal(youtubeIdFromUrl("https://www.youtube.com/watch?v=2w-zkNv5Ta4"), "2w-zkNv5Ta4");
  assert.equal(youtubeIdFromUrl("https://youtu.be/2w-zkNv5Ta4"), "2w-zkNv5Ta4");
  assert.equal(youtubeIdFromUrl("https://example.com/embed/x"), null);
});

test("video: malformed id, missing poster and a VideoObject for a video the page does not show", async () => {
  const spec = healthySite();
  spec.pages["/guides/alpha"].body += `<iframe src="https://www.youtube-nocookie.com/embed/short"></iframe>`;
  spec.pages["/guides/beta"].payload = '{"youtubeId":"2w-zkNv5Ta4","poster":"/images/no-poster.jpg"}';
  spec.pages["/guides/gamma"].jsonLd = [
    storyJsonLd("/guides/gamma", {
      extraGraph: [{ "@type": "VideoObject", name: "V", embedUrl: "https://www.youtube.com/embed/ZAU9hPQ_1Hk", uploadDate: "2026-09-01" }],
    }),
  ];
  const r = await audit(spec);
  assert.ok(ofType(r, "video-id-malformed").some((f) => f.route === "/guides/alpha"));
  assert.equal(ofType(r, "video-poster-missing")[0].failure, "/images/no-poster.jpg");
  assert.equal(ofType(r, "video-schema-mismatch")[0].route, "/guides/gamma");
});

test("video: homepage video registry needs /images/video-<id>.jpg", async () => {
  const spec = healthySite();
  spec.registry.videos = [{ id: "tour", youtubeId: "2w-zkNv5Ta4" }];
  const r = await audit(spec);
  assert.equal(ofType(r, "video-poster-missing")[0].failure, "/images/video-tour.jpg");
});

// --- placeholder copy -------------------------------------------------------

test("placeholder copy and a self-declared placeholder module are reported, never fixed", async () => {
  const spec = healthySite();
  spec.pages["/guides/alpha"].body += "<p>Median price is TBD and lorem ipsum dolor.</p>";
  spec.sources = {
    "lib/fake.ts": "// PLACEHOLDER CONTENT\nexport const n = 1;\n",
    "app/page.tsx": 'import { n } from "@/lib/fake";\nexport default function P() { return n; }\n',
  };
  const r = await audit(spec);
  assert.equal(ofType(r, "placeholder-copy").length, 2);
  const decl = ofType(r, "source-declared-placeholder")[0];
  assert.deepEqual(decl.routes, ["/"]);
  assert.equal(decl.fixability, "never");
});
