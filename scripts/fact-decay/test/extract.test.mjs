import test from "node:test";
import assert from "node:assert/strict";

import {
  decodeEntities,
  normalizeWhitespace,
  stripComments,
  lineIndexer,
  mergeInlineFragments,
  objectSliceFrom,
  extractTextBlocks,
  extractStoryMeta,
  extractFreshnessStamps,
  extractDeclaredSources,
  extractExternalLinks,
  extractDevelopmentProjects,
  extractDataRows,
  extractLocalImports,
} from "../lib/extract.mjs";

test("entities LVINIT actually writes are decoded", () => {
  assert.equal(decodeEntities("here&rsquo;s a &ldquo;quote&rdquo; &mdash; done"), "here’s a “quote” — done");
  assert.equal(decodeEntities("a &amp; b &#8212; c"), "a & b — c");
});

test("comments are blanked, not deleted, so line numbers stay true", () => {
  const source = ["const a = 1; // trailing", "/* block", "   comment */", "const b = 2;"].join("\n");
  const { code, comments } = stripComments(source);
  assert.equal(code.split("\n").length, 4, "line count is preserved");
  assert.match(code.split("\n")[3], /const b = 2;/);
  assert.equal(comments.length, 2);
  assert.match(comments[1].text, /block/);
});

test("a // inside a string is not treated as a comment", () => {
  const { code } = stripComments('const url = "https://example.com/path"; // real comment');
  assert.match(code, /https:\/\/example\.com\/path/);
  assert.doesNotMatch(code, /real comment/);
});

test("line numbers are reported from the real file offsets", () => {
  const lineOf = lineIndexer("a\nbb\nccc\n");
  assert.equal(lineOf(0), 1);
  assert.equal(lineOf(2), 2);
  assert.equal(lineOf(5), 3);
});

test("an object slice stops at its own closing brace, not a fixed window", () => {
  const code = `name: "A", status: "open" }, { name: "B", caveat: "belongs to B" }`;
  const slice = objectSliceFrom(code, 0);
  assert.match(slice, /name: "A"/);
  assert.doesNotMatch(slice, /belongs to B/, "must not bleed into the next object");
});

test("fragments split by inline markup are stitched back into one sentence", () => {
  const code = `<p>Supply sat at <span className="x">3.5 months</span>, and sales jumped.</p>`;
  const fragments = [
    { text: "Supply sat at", start: 3, end: 3 + "Supply sat at ".length },
    { text: ", and sales jumped.", start: code.indexOf(", and"), end: code.indexOf("</p>") },
  ];
  const merged = mergeInlineFragments(fragments, code);
  assert.equal(merged.length, 1);
  assert.equal(merged[0].text, "Supply sat at, and sales jumped.");
});

test("fragments split by a block-level tag are NOT merged", () => {
  const code = `<p>First sentence.</p><p>Second sentence.</p>`;
  const fragments = [
    { text: "First sentence.", start: 3, end: 18 },
    { text: "Second sentence.", start: code.indexOf("Second"), end: code.length - 4 },
  ];
  assert.equal(mergeInlineFragments(fragments, code).length, 2);
});

const PAGE = `
import { StoryPage } from "@/components/story";
import { sources } from "@/lib/areas/example";

// Checked 20 August 2026 during a research pass.
const meta = {
  title: "Example Guide | LVINIT",
  headline: "Example Guide",
  description: "A page used to exercise the extractor.",
  path: "/guides/example",
  datePublished: "2026-08-01",
  dateModified: "2026-08-19",
};

const SNAPSHOT = [
  { value: "$490,000", label: "Median price", note: "June 2026 · Las Vegas Realtors" },
];

export default function Page() {
  return (
    <StoryPage>
      <StorySection heading="The numbers">
        <p>
          The median price reached{" "}
          <span className="text-lvinit-black">$490,000</span> in June, up 1% from
          a year earlier.
        </p>
        <ul>
          <li>
            Las Vegas Realtors, June 2026 report.{" "}
            <a href="https://www.lasvegasrealtor.com/report" className="link">LVR report</a>
          </li>
        </ul>
      </StorySection>
      <AreaSources checked="Checked 20 August 2026" sources={sources} />
    </StoryPage>
  );
}

export const sources = [
  { label: "Clark County", url: "https://www.clarkcountynv.gov/projects", used: "Project statuses." },
];

export const developmentProjects = [
  {
    name: "Alpha Park",
    status: "planned",
    where: "First Street",
    what: "A proposed park.",
    source: { label: "Review-Journal, 14 August 2026", url: "https://www.reviewjournal.com/alpha" },
    caveat: "Commissioners were scheduled to consider it on 2 September 2026.",
  },
  {
    name: "Beta Center",
    status: "open",
    where: "Second Street",
    what: "A shopping centre that opened in March 2026.",
    source: { label: "Review-Journal", url: "https://www.reviewjournal.com/beta" },
  },
];
`;

test("StoryMeta is read exactly as written, with no defaults invented", () => {
  const meta = extractStoryMeta(PAGE);
  assert.equal(meta.headline, "Example Guide");
  assert.equal(meta.path, "/guides/example");
  assert.equal(meta.datePublished, "2026-08-01");
  assert.equal(meta.dateModified, "2026-08-19");
});

test("visible freshness stamps are found", () => {
  const stamps = extractFreshnessStamps(PAGE);
  assert.ok(stamps.some((s) => s.kind === "checked" && /20 August 2026/.test(s.text)));
});

test("a sentence broken by a span and a {' '} expression comes back whole", () => {
  const blocks = extractTextBlocks(PAGE, { minWords: 4 });
  const prose = blocks.find((b) => b.origin === "prose" && b.text.includes("490,000"));
  assert.ok(prose, "the price sentence should be extracted");
  assert.match(prose.text, /The median price reached \$490,000 in June, up 1% from a year earlier\./);
});

test("headings are captured and attached to the prose beneath them", () => {
  const blocks = extractTextBlocks(PAGE, { minWords: 3 });
  const prose = blocks.find((b) => b.origin === "prose" && b.text.includes("490,000"));
  assert.equal(prose.heading, "The numbers");
});

test("class name strings are not mistaken for prose", () => {
  const blocks = extractTextBlocks(PAGE, { minWords: 3 });
  assert.ok(!blocks.some((b) => /text-lvinit-black/.test(b.text)));
});

test("structured AreaSource entries are read", () => {
  const sources = extractDeclaredSources(PAGE);
  assert.ok(sources.some((s) => s.url === "https://www.clarkcountynv.gov/projects" && s.used === "Project statuses."));
});

test("prose citation links are read, with their list-item context", () => {
  const links = extractExternalLinks(PAGE);
  const lvr = links.find((l) => l.url === "https://www.lasvegasrealtor.com/report");
  assert.ok(lvr, "the inline citation link should be found");
  assert.equal(lvr.label, "LVR report");
  assert.match(lvr.used, /Las Vegas Realtors, June 2026 report/);
});

test("development projects keep their own status, source and caveat", () => {
  const projects = extractDevelopmentProjects(PAGE);
  assert.equal(projects.length, 2);
  const alpha = projects.find((p) => p.name === "Alpha Park");
  assert.equal(alpha.status, "planned");
  assert.equal(alpha.source.url, "https://www.reviewjournal.com/alpha");
  assert.match(alpha.caveat, /2 September 2026/);
});

test("a project with no caveat does not inherit the next project's caveat", () => {
  const beta = extractDevelopmentProjects(PAGE).find((p) => p.name === "Beta Center");
  assert.equal(beta.caveat, null, "this is the bug that produced false passed-deadline findings");
  assert.equal(beta.where, "Second Street");
});

test("figure-panel rows are read as value + label + note", () => {
  const rows = extractDataRows(PAGE);
  const stat = rows.find((r) => r.fields.value === "$490,000");
  assert.ok(stat);
  assert.equal(stat.fields.label, "Median price");
  assert.equal(stat.fields.note, "June 2026 · Las Vegas Realtors");
});

test("only local data-module imports are followed", () => {
  const imports = extractLocalImports(PAGE, { prefixes: ["@/lib/"] });
  assert.deepEqual(imports, ["@/lib/areas/example"]);
});

test("an empty page extracts nothing and throws nothing", () => {
  const empty = "export default function Page() {\n  return null;\n}\n";
  assert.deepEqual(extractTextBlocks(empty, { minWords: 3 }), []);
  assert.deepEqual(extractDevelopmentProjects(empty), []);
  assert.deepEqual(extractDataRows(empty), []);
  assert.deepEqual(extractDeclaredSources(empty), []);
  assert.equal(normalizeWhitespace(""), "");
});
