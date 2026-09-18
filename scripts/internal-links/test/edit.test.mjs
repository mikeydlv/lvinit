// The edit mechanism, and the invariant the whole agent rests on:
// wrapping words in a <Link> is the ONLY thing it can do to a page, and it can
// never change one character of published copy.

import test from "node:test";
import assert from "node:assert/strict";

import {
  applyLinkEdit,
  copyChecksum,
  renderedText,
  protectedRanges,
  protectionFor,
  matchDelimiter,
  localLinkClass,
  hasLinkImport,
  looksLikeCompliance,
  extractLinks,
} from "../lib/source.mjs";
import { verifyEditedSource, classAttrFor } from "../lib/apply.mjs";
import { textNodeAt, containerAt, findPhraseOccurrences } from "../lib/opportunities.mjs";
import { testConfig, storyPage, section } from "./helpers.mjs";

const SOURCE = storyPage(
  [
    section(
      "Housing stock",
      "Green Valley is the original master-planned community. The Water Street District is the historic downtown, with older bones than any of it."
    ),
    section("About this coverage", "Mikey Del Rosario, The Scofield Group, Nevada License S.0175577. Equal Housing Opportunity."),
  ].join("\n\n")
);

const anchorSpan = (source, phrase) => {
  const hit = findPhraseOccurrences(source, phrase)[0];
  assert.ok(hit, `"${phrase}" is in the fixture`);
  return hit;
};

test("an edit wraps existing words and changes nothing else", () => {
  const hit = anchorSpan(SOURCE, "Water Street District");
  const result = applyLinkEdit(SOURCE, {
    start: hit.start,
    end: hit.end,
    anchor: hit.text,
    href: "/guides/water-street-district-henderson",
    classAttr: "className={linkCls}",
  });
  assert.equal(result.ok, true, result.reason);
  assert.ok(
    result.source.includes(
      '<Link href="/guides/water-street-district-henderson" className={linkCls}>Water Street District</Link>'
    )
  );
  // The only difference between the two files is the added markup.
  assert.equal(
    result.source.replace(/<\/?Link[^>]*>/g, ""),
    SOURCE,
    "removing the added tags gives back the original file byte for byte"
  );
});

test("published copy is identical before and after", () => {
  const hit = anchorSpan(SOURCE, "Water Street District");
  const result = applyLinkEdit(SOURCE, {
    start: hit.start,
    end: hit.end,
    anchor: hit.text,
    href: "/guides/water-street-district-henderson",
    classAttr: "className={linkCls}",
  });
  assert.equal(copyChecksum(SOURCE), copyChecksum(result.source));
});

test("an edit whose anchor sits next to punctuation still preserves the copy", () => {
  const source = storyPage(
    section("Where", "Everything about that street runs through Summerlin. That is the whole point of the place.")
  );
  const hit = anchorSpan(source, "Summerlin");
  const result = applyLinkEdit(source, {
    start: hit.start,
    end: hit.end,
    anchor: hit.text,
    href: "/neighborhoods/summerlin",
    classAttr: "className={linkCls}",
  });
  assert.equal(result.ok, true, result.reason);
  assert.equal(copyChecksum(source), copyChecksum(result.source));
});

test("an edit is refused when the text at that position moved", () => {
  const hit = anchorSpan(SOURCE, "Water Street District");
  const result = applyLinkEdit(SOURCE, {
    start: hit.start + 3,
    end: hit.end + 3,
    anchor: "Water Street District",
    href: "/guides/x",
    classAttr: "className={linkCls}",
  });
  assert.equal(result.ok, false);
  assert.match(result.reason, /no longer the expected anchor/);
});

test("an edit is refused when the span contains markup or a line break", () => {
  const source = "<p>alpha <span>beta</span> gamma</p>";
  const start = source.indexOf("alpha");
  const result = applyLinkEdit(source, {
    start,
    end: source.indexOf("gamma") + 5,
    anchor: source.slice(start, source.indexOf("gamma") + 5),
    href: "/x",
    classAttr: 'className="c"',
  });
  assert.equal(result.ok, false);
  assert.match(result.reason, /markup, an entity or a line break/);
});

test("protected ranges cover props, components, attributes and existing links", () => {
  const code = `
const meta = { title: "Summerlin | LVINIT" };
export default function P() {
  return (
    <StoryPage meta={meta} hero={{ headline: "Summerlin", imageAlt: "Summerlin at dusk" }}>
      <StorySection heading="Where">
        <p>Plain body prose about Summerlin goes here.</p>
      </StorySection>
      <StoryCTAs heading="Talk to me">
        <p>Summerlin again, but inside the conversion block.</p>
      </StoryCTAs>
      <p>Then <Link href="/x" className="c">Summerlin inside a link</Link> and after it.</p>
    </StoryPage>
  );
}`;
  const ranges = protectedRanges(code);
  const at = (needle) => {
    const i = code.indexOf(needle);
    return protectionFor(ranges, i, i + needle.length);
  };
  assert.equal(at("Plain body prose"), null, "body prose is editable");
  assert.ok(at("imageAlt"), "the hero prop is protected");
  assert.ok(at("inside the conversion block"), "StoryCTAs is protected");
  assert.ok(at("Summerlin inside a link"), "an existing link is protected");
  assert.ok(at("Summerlin | LVINIT"), "the meta declaration is protected");
});

test("compliance copy is recognized", () => {
  assert.equal(looksLikeCompliance("Nevada License S.0175577. Equal Housing Opportunity."), true);
  assert.equal(looksLikeCompliance("The Scofield Group"), true);
  assert.equal(looksLikeCompliance("About this coverage"), true);
  assert.equal(looksLikeCompliance("Green Valley is the original master-planned community."), false);
});

test("matchDelimiter skips braces that live inside strings", () => {
  const code = 'x={ a: "not } the end", b: 1 } tail';
  const open = code.indexOf("{");
  const close = matchDelimiter(code, open);
  assert.equal(code.slice(open, close + 1), '{ a: "not } the end", b: 1 }');
});

test("a text node stops at every JSX delimiter", () => {
  const code = '<p>alpha{" "}beta</p>';
  const node = textNodeAt(code, code.indexOf("alpha"));
  assert.equal(code.slice(node.start, node.end), "alpha");
});

test("the container a paragraph sits in is the last one opened before it", () => {
  const code = `<StoryLede lead="x"><p>one</p></StoryLede><StorySection heading="y"><p>two</p></StorySection>`;
  assert.equal(containerAt(code, code.indexOf("one")).tag, "StoryLede");
  assert.equal(containerAt(code, code.indexOf("two")).tag, "StorySection");
});

test("the page's own link class is reused when it has one", () => {
  assert.deepEqual(localLinkClass("const linkCls = 'x';", ["linkCls", "linkClass"]), { expression: "linkCls" });
  assert.deepEqual(localLinkClass("const other = 'x';", ["linkCls", "linkClass"]), null);
  const config = testConfig();
  assert.equal(classAttrFor({ linkClass: { expression: "linkClass" } }, config), "className={linkClass}");
  assert.match(classAttrFor({ linkClass: null }, config), /^className="text-lvinit-blue/);
});

test("next/link import detection", () => {
  assert.equal(hasLinkImport(SOURCE), true);
  assert.equal(hasLinkImport(storyPage(section("x", "y"), { withLinkImport: false })), false);
});

test("post-edit verification rejects a duplicate link", () => {
  const before = storyPage(
    section("x", 'Already <Link href="/guides/a" className={linkCls}>linked</Link> once and Alpha Ridge again here.')
  );
  const hit = anchorSpan(before, "Alpha Ridge");
  const edited = applyLinkEdit(before, {
    start: hit.start,
    end: hit.end,
    anchor: hit.text,
    href: "/guides/a",
    classAttr: "className={linkCls}",
  });
  assert.equal(edited.ok, true);
  const check = verifyEditedSource({
    before,
    after: edited.source,
    originalChecksum: copyChecksum(before),
    candidates: [{ to: "/guides/a", file: "app/x/page.tsx", fingerprint: "f" }],
    existingRoutes: new Set(["/guides/a"]),
  });
  assert.equal(check.ok, false);
  assert.match(check.reason, /already linked/);
});

test("post-edit verification rejects a destination that does not exist", () => {
  const hit = anchorSpan(SOURCE, "Water Street District");
  const edited = applyLinkEdit(SOURCE, {
    start: hit.start,
    end: hit.end,
    anchor: hit.text,
    href: "/guides/nope",
    classAttr: "className={linkCls}",
  });
  const check = verifyEditedSource({
    before: SOURCE,
    after: edited.source,
    originalChecksum: copyChecksum(SOURCE),
    candidates: [{ to: "/guides/nope", file: "app/x/page.tsx", fingerprint: "f" }],
    existingRoutes: new Set(["/guides/water-street-district-henderson"]),
  });
  assert.equal(check.ok, false);
  assert.match(check.reason, /does not resolve/);
});

test("post-edit verification passes a clean single edit and records the checks", () => {
  const hit = anchorSpan(SOURCE, "Water Street District");
  const edited = applyLinkEdit(SOURCE, {
    start: hit.start,
    end: hit.end,
    anchor: hit.text,
    href: "/guides/water-street-district-henderson",
    classAttr: "className={linkCls}",
  });
  const check = verifyEditedSource({
    before: SOURCE,
    after: edited.source,
    originalChecksum: copyChecksum(SOURCE),
    candidates: [
      { to: "/guides/water-street-district-henderson", file: "app/x/page.tsx", fingerprint: "f" },
    ],
    existingRoutes: new Set(["/guides/water-street-district-henderson"]),
  });
  assert.equal(check.ok, true, check.reason);
  const record = check.perCandidate.get("f");
  assert.equal(record.destinationResolves, true);
  assert.equal(record.duplicateCreated, false);
  assert.equal(record.copyUnchanged, true);
  assert.equal(record.renderedAnchor, "Water Street District");
});

test("post-edit verification rejects a change to an existing link", () => {
  const before = storyPage(
    section("x", 'See the <Link href="/guides/a" className={linkCls}>first guide</Link> for more on all of this.')
  );
  const after = before.replace("/guides/a", "/guides/b");
  const check = verifyEditedSource({
    before,
    after,
    originalChecksum: copyChecksum(before),
    candidates: [],
    existingRoutes: new Set(["/guides/a", "/guides/b"]),
  });
  assert.equal(check.ok, false);
  assert.match(check.reason, /existing link on the page changed/);
});

test("renderedText survives entities and ignores markup", () => {
  const text = renderedText("<p>It&rsquo;s <em>fine</em>.</p>");
  assert.match(text, /It’s/);
  assert.ok(!text.includes("<em>"));
});

test("extractLinks finds hrefs written as data, without an anchor", () => {
  const links = extractLinks('const stories = [{ name: "A", href: "/guides/a" }];');
  assert.equal(links.length, 1);
  assert.equal(links[0].href, "/guides/a");
  assert.equal(links[0].element, false);
  assert.equal(links[0].anchor, null);
});
