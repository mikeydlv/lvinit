// ---------------------------------------------------------------------------
// PUBLISHER-READY DRAFT — built from the transcript, never beyond it
//
// The draft is a structured starting point for the Content Publisher, not final
// copy. Every sentence in the body draft is one Mikey said on camera, cleaned
// of filler and nothing else, so the voice is his and nothing is invented. Each
// carries a marker the Publisher acts on:
//
//   (no marker)                    his opinion / guidance — publishable as his
//   [VERIFY m:ss]                  a fact that must be checked before it ships
//   [FAIR HOUSING — removed …]     spoken framing that must not be carried over
//
// Sections follow the video: its chapters when the manifest has them, else
// the questions Mikey asks on camera (each one opens a section, and those
// questions are also the FAQ candidates). Titles and meta lines come from the
// video's real title and YouTube description, then pass the Fair Housing and
// voice gates. No section heading, title or answer is made up.
// ---------------------------------------------------------------------------

import { proposeSlug } from "../../content-briefs/lib/brief.mjs";
import { entityInfo } from "../../content-briefs/lib/intent.mjs";

import { NEW_URL_ACTIONS } from "../config.mjs";
import { fairHousing } from "./compliance.mjs";
import { isUsableQuestion, readerQuestion } from "./faq.mjs";
import { cleanTitle } from "./overlap.mjs";
import { stamp, toSeconds } from "./transcript.mjs";

/** Trim to a word boundary under `max` characters. */
export function trimTo(text, max) {
  const t = String(text ?? "").replace(/\s+/g, " ").trim();
  if (t.length <= max) return t;
  // End on a whole sentence when one fits in a useful length.
  const sentenceEnd = Math.max(...[...t.slice(0, max).matchAll(/[.?!](?=\s|$)/g)].map((m) => m.index + 1), -1);
  if (sentenceEnd >= Math.min(90, max * 0.6)) return t.slice(0, sentenceEnd);
  const cut = t.slice(0, max - 1);
  return `${cut.slice(0, cut.lastIndexOf(" ")).replace(/[,;:\s]+$/, "")}…`;
}

/** Proposed route. The homepage registry id is reused when it is free — the repo already chose it. */
export function proposeRoute({ video, group, inventory }) {
  if (video.homepageId) {
    const route = `/guides/${video.homepageId}`;
    if (!inventory.existingRoutes.has(route)) return { slug: video.homepageId, route, source: "the video's homepage registry id in lib/content.ts" };
  }
  const p = proposeSlug(group, inventory.existingRoutes);
  return { ...p, source: "built from the video's topic in LVINIT's slug style" };
}

/** Title / meta / H1 / dek from the real title and description. */
export function proposeHeadlines({ video, sentences, config }) {
  const title = cleanTitle(video.title);
  const metaTitle = `${title} | LVINIT`.length <= config.draft.metaTitleMax ? `${title} | LVINIT` : trimTo(title, config.draft.metaTitleMax);
  const descParas = String(video.description ?? "")
    .split(/\n\s*\n/)
    .map((p) => p.replace(/\s+/g, " ").trim())
    .filter((p) => p && !/^[•\-*#]/.test(p) && !/#\w/.test(p) && !/\bsubscribe\b|@\w+|comments?\b/i.test(p))
    // Video-speak ("In this video, I break down…") never becomes article copy.
    .filter((p) => !/\b(this video|we['’]?ll talk about|watch (until|to) the end)\b/i.test(p))
    .filter((p) => !/^LVINIT\b/.test(p));
  const fromDescription = descParas.join(" ");
  // A meta description carries no figure: figures decay and the meta line is
  // the last place anyone re-checks.
  const opening = sentences.filter((s) => (s.kind === "opinion" || s.kind === "narrative") && !s.needsVerification && !/\d/.test(s.text)).slice(0, 2).map((s) => s.text).join(" ");
  const metaSource = fromDescription && !/\d/.test(fromDescription) ? fromDescription : opening;
  return {
    title,
    titleSource: "the video's published title",
    metaTitle,
    metaDescription: metaSource ? trimTo(metaSource, config.draft.metaDescriptionMax) : null,
    metaDescriptionSource: metaSource === fromDescription ? "the video's YouTube description" : metaSource ? "the video's opening (Mikey's words)" : null,
    h1: title,
    dek: fromDescription ? trimTo(fromDescription, 260) : opening ? trimTo(opening, 260) : null,
    dekSource: fromDescription ? "the video's YouTube description — the Publisher rewrites it as an article dek" : opening ? "the video's opening (Mikey's words)" : null,
  };
}

function markSentence(s, fhFlagged) {
  if (fhFlagged.has(s.index)) {
    const f = fhFlagged.get(s.index);
    return `[FAIR HOUSING — removed: ${f.category} language${s.timecode ? ` at ${s.timecode}` : ""}]`;
  }
  if (s.kind === "fact" || s.kind === "unclear" || s.needsVerification) return `[VERIFY${s.timecode ? ` ${s.timecode}` : ""}] ${s.text}`;
  return s.text;
}

function paragraphs(list, size = 4) {
  const out = [];
  for (let i = 0; i < list.length; i += size) out.push(list.slice(i, i + size).join(" "));
  return out;
}

/** Split classified sentences into sections. */
export function segmentSections(sentences, { chapters = [], maxSections = 7, minSentences = 4 } = {}) {
  let bounds = [];
  if (chapters.length) {
    const starts = chapters
      .map((c) => ({ title: c.title, start: toSeconds(c.start) }))
      .filter((c) => c.title && c.start !== null)
      .sort((a, b) => a.start - b.start);
    for (const c of starts) {
      const idx = sentences.findIndex((s) => (s.start ?? -1) >= c.start - 0.5);
      if (idx >= 0 && !bounds.some((b) => b.index === idx)) bounds.push({ index: idx, heading: c.title, headingSource: "chapter" });
    }
  } else {
    sentences.forEach((s, i) => {
      if (i > 0 && isUsableQuestion(s.text)) bounds.push({ index: i, heading: readerQuestion(s.text), headingSource: "question Mikey asks on camera" });
    });
  }

  let sections = [];
  const firstIdx = bounds[0]?.index ?? sentences.length;
  if (firstIdx > 0) sections.push({ heading: null, headingSource: "opening", sentences: sentences.slice(0, firstIdx) });
  bounds.forEach((b, i) => {
    const end = bounds[i + 1]?.index ?? sentences.length;
    sections.push({ heading: b.heading, headingSource: b.headingSource, sentences: sentences.slice(b.index, end) });
  });

  // Fold slivers into the section before them.
  const merged = [];
  for (const sec of sections) {
    const prev = merged[merged.length - 1];
    if (prev && sec.sentences.length < minSentences && sec.headingSource !== "chapter") prev.sentences.push(...sec.sentences);
    else merged.push({ ...sec, sentences: [...sec.sentences] });
  }
  sections = merged;

  // No questions and no chapters: even time slices, headings left to the Publisher.
  if (sections.length <= 1 && sentences.length > 12) {
    const n = Math.min(maxSections, Math.max(3, Math.round(sentences.length / 15)));
    const size = Math.ceil(sentences.length / n);
    sections = [];
    for (let i = 0; i < sentences.length; i += size) sections.push({ heading: null, headingSource: "time slice", sentences: sentences.slice(i, i + size) });
  }

  // Too many: merge the smallest neighbouring pair (never the opening into a chapter).
  while (sections.length > maxSections) {
    let best = 1;
    for (let i = 2; i < sections.length; i++) {
      if (sections[i].sentences.length + sections[i - 1].sentences.length < sections[best].sentences.length + sections[best - 1].sentences.length) best = i;
    }
    sections[best - 1].sentences.push(...sections[best].sentences);
    sections.splice(best, 1);
  }
  return sections;
}

/** Sections with their body draft, points and verification markers. */
export function draftSections(sentences, transcriptFlags, { chapters = [], maxSections = 7 } = {}) {
  const fhFlagged = new Map();
  for (const f of transcriptFlags) {
    const s = sentences.find((x) => x.text === f.sentence);
    if (s) fhFlagged.set(s.index, f);
  }
  return segmentSections(sentences, { chapters, maxSections }).map((sec, i) => {
    const first = sec.sentences[0];
    const last = sec.sentences[sec.sentences.length - 1];
    const range = first?.timecode && last?.timecode ? `${first.timecode}–${last.timecode}` : "untimed — the transcript has no timestamps";
    // The heading question itself is not repeated as the first body sentence.
    const bodySentences = sec.headingSource === "question Mikey asks on camera" ? sec.sentences.slice(1) : sec.sentences;
    return {
      order: i + 1,
      heading:
        sec.heading ??
        (sec.headingSource === "opening" ? "Opening (becomes the article intro, not an H2)" : `Untitled section (${range}) — the Publisher writes this heading`),
      headingSource: sec.headingSource,
      timeRange: range,
      startSeconds: first?.start ?? null,
      mikeyTake: bodySentences.filter((s) => s.kind === "opinion" && !s.needsVerification && !fhFlagged.has(s.index)).slice(0, 3).map((s) => ({ timecode: s.timecode, text: s.text })),
      factsToVerify: bodySentences.filter((s) => s.needsVerification && !fhFlagged.has(s.index)).map((s) => ({ timecode: s.timecode, text: s.text, families: s.families })),
      fairHousingRemoved: bodySentences.filter((s) => fhFlagged.has(s.index)).map((s) => ({ timecode: s.timecode, category: fhFlagged.get(s.index).category })),
      bodyDraft: paragraphs(bodySentences.map((s) => markSentence(s, fhFlagged))),
      entities: [...new Set(bodySentences.flatMap((s) => s.entities ?? []))],
    };
  });
}

/** Where the video goes on the page. */
export function embedPlacement({ action, targetPage, video }) {
  const component = video.thumbnail?.startsWith("/images/")
    ? `<StoryVideo youtubeId="${video.youtubeId}" poster="${video.thumbnail}" … /> — click-to-play facade on the local poster`
    : `<StoryVideo youtubeId="${video.youtubeId}" … /> — direct lazy youtube-nocookie embed (no local poster exists; YouTube's own thumbnail, as on /guides/is-las-vegas-a-buyers-market)`;
  if (NEW_URL_ACTIONS.has(action)) {
    return { component, anchorId: "watch", placement: "directly after the lede, before the first H2 — the article is the video's companion, so the video leads", startAt: "0:00" };
  }
  if (!targetPage) return { component, anchorId: "watch", placement: "on the related page, after its intro", startAt: "0:00" };
  if (targetPage.embedsVideo) return { component: null, anchorId: null, placement: `already embedded on ${targetPage.route} — no second embed`, startAt: null };
  return {
    component,
    anchorId: "watch",
    placement: targetPage.relevantSection ? `inside "${targetPage.relevantSection}" on ${targetPage.route}, after its opening paragraph` : `after the intro of ${targetPage.route}`,
    startAt: "0:00",
    note: "if the page already features another video in StoryMeta.video, keep that VideoObject and add this one as a visible embed only",
  };
}

/** Closing CTA, using the site's standing pair (StoryCTAs). */
export function ctaRecommendation(group) {
  const pillar = (group.places ?? [])[0] ? entityInfo(group.places[0]) : null;
  const buttons = [
    { label: "Get in touch", href: "/contact", variant: "primary" },
    { label: "Search homes", href: "/search", variant: "secondary" },
  ];
  return {
    component: "StoryCTAs (default Contact + Search Homes pair)",
    buttons,
    tone: "an offer to help with the reader's own decision — never a hard sell, never urgency",
    note: pillar ? `consider a tertiary link to the ${pillar.label} guide if it exists` : null,
  };
}

/** Reject any generated line that is not clean. Used by the analyzer. */
export function generatedFields(draft) {
  const fields = [];
  const push = (field, text) => text && fields.push({ field, text });
  push("title", draft.headlines?.title);
  push("metaTitle", draft.headlines?.metaTitle);
  push("metaDescription", draft.headlines?.metaDescription);
  push("dek", draft.headlines?.dek);
  for (const s of draft.sections ?? []) if (s.headingSource !== "opening") push(`section ${s.order} heading`, s.heading);
  for (const f of draft.faq ?? []) {
    if (f.status === "blocked") continue;
    push(`faq "${trimTo(f.question, 40)}"`, f.question);
  }
  for (const l of draft.internalLinks?.outbound ?? []) push(`link anchor → ${l.route}`, l.anchorSuggestion);
  return fields;
}

export function topicFairHousing(video) {
  return fairHousing(cleanTitle(video.targetTopic ?? video.title ?? ""));
}

export { stamp };
