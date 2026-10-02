// ---------------------------------------------------------------------------
// IMAGES AND THUMBNAILS — recommendations, in LVINIT's order of preference
//
//   1. Mikey's approved photography: images already optimized into
//      /public/images, then the first-party library (C:\LVINIT\Images) when this
//      machine can reach it. Read-only — originals are never touched; the
//      Publisher copies out and optimizes a copy.
//   2. The video's own local poster (/public/images/video-<id>.jpg|webp). A
//      title card is a poster, not photography: it is used for the click-to-play
//      facade and, when nothing else fits, as a card image with honest alt text.
//   3. YouTube's own thumbnail, referenced by URL in VideoObject only — the
//      established site precedent. Never downloaded into a hero.
//
// Nothing is generated, and no external stock image is suggested.
// ---------------------------------------------------------------------------

import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

import { entityInfo } from "../../content-briefs/lib/intent.mjs";

const IMAGE_EXT = /\.(webp|jpe?g|png)$/i;

function walk(dir, depth = 3) {
  const out = [];
  if (!existsSync(dir) || depth < 0) return out;
  for (const ent of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, ent.name);
    if (ent.isDirectory()) out.push(...walk(p, depth - 1));
    else if (IMAGE_EXT.test(ent.name)) out.push(p);
  }
  return out;
}

/** Valley-wide topics (no single place) look for valley-wide residential frames. */
export const VALLEY_WIDE_KEYWORDS = ["valley", "residential", "neighborhood"];

/** A filename naming a specific area or community is never a valley-wide hero. */
const AREA_SPECIFIC =
  /summerlin|henderson|southwest|north-las-vegas|arts-district|downtown|mountains-edge|inspirada|lake-las-vegas|the-lakes|green-valley|anthem|cadence|centennial|skye|aliante|tule|sandstone|monument|spring-valley|enterprise|red-rock/;

/**
 * Search words for a video: the places and subjects its TITLE is about. A place
 * Mikey mentions in passing is not what the article is about, and leading with
 * it would make a valley-wide piece look like a piece about that place.
 */
export function imageKeywords(group) {
  const keys = [...(group.places ?? []), ...(group.subjects ?? [])];
  const words = new Set();
  for (const k of keys) {
    const info = entityInfo(k);
    if (!info) continue;
    for (const w of info.slug.split("-")) if (w.length > 3 && !["vegas", "district"].includes(w)) words.add(w);
  }
  return { words: [...words], valleyWide: words.size === 0 };
}

/** How many app/lib source files already reference an image path. */
function usageCount(repoRoot, rel, sourceText) {
  return (sourceText.match(new RegExp(rel.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g")) ?? []).length;
}

export function recommendImages({ repoRoot, video, group, config, sourceText = "" }) {
  const { words, valleyWide } = imageKeywords(group);
  const keywords = valleyWide ? VALLEY_WIDE_KEYWORDS : words;
  const match = (name) => {
    const n = name.toLowerCase().replace(/\\/g, "/");
    // Valley-wide: only real aerial / residential photography, never an area-specific frame.
    if (valleyWide) return /aerial|drone/.test(n) && keywords.some((w) => n.includes(w)) && !AREA_SPECIFIC.test(n);
    return keywords.some((w) => n.includes(w));
  };

  const repoCandidates = walk(join(repoRoot, "public", "images"))
    .map((p) => `/${relative(join(repoRoot, "public"), p).replace(/\\/g, "/")}`)
    .filter((rel) => !/\/(video-|covers\/|logos\/|maps\/|team\/)/.test(rel) && match(rel))
    .map((rel) => ({ path: rel, usedOnPages: usageCount(repoRoot, rel, sourceText) }))
    .sort((a, b) => a.usedOnPages - b.usedOnPages || a.path.localeCompare(b.path))
    .slice(0, 6);

  let library = { reachable: false, path: config.inputs.photoLibrary, candidates: [] };
  try {
    if (existsSync(config.inputs.photoLibrary) && statSync(config.inputs.photoLibrary).isDirectory()) {
      library = {
        reachable: true,
        path: config.inputs.photoLibrary,
        candidates: walk(config.inputs.photoLibrary, 2)
          .filter((p) => match(p))
          .slice(0, 8)
          .map((p) => p),
      };
    }
  } catch {
    // Unreachable library (CI, a cloud session) is reported, never fatal.
  }

  const poster = video.thumbnail?.startsWith("/images/") ? video.thumbnail : null;
  return {
    order: ["approved LVINIT photography", "the video's local poster", "YouTube's own thumbnail (VideoObject only)"],
    keywords,
    scope: valleyWide ? "valley-wide (the title names no single place)" : `place-specific (${words.join(", ")})`,
    hero: repoCandidates[0]
      ? { path: repoCandidates[0].path, why: "approved photography already in /public/images, least reused first", altText: "Write from what the photo actually shows — never from its filename alone" }
      : library.candidates[0]
        ? { path: library.candidates[0], why: "first-party library frame; copy out and optimize to /public/images/hero/<descriptive-name>.webp, original untouched", altText: "Write from what the photo actually shows" }
        : { path: null, why: keywords.length ? "no approved photo matches this topic — use the photoless editorial hero, never a stand-in photo" : "a valley-wide topic: choose from the approved valley-wide aerials the Publisher already uses, or go photoless" },
    repoCandidates,
    photoLibrary: library,
    poster: poster
      ? { path: poster, use: "click-to-play poster (StoryVideo `poster`); card image only if no photo fits", altText: `Title card for the LVINIT video "${video.title}".` }
      : { path: null, use: "no local poster — StoryVideo uses its direct lazy embed; VideoObject uses YouTube's own thumbnail URL" },
    rules: ["never modify originals", "descriptive filenames under /public/images/", "no generated or stock imagery", "alt text describes what is actually in the frame"],
  };
}

/** Concatenated app/ + lib/ source, for reuse counts. */
export function readSiteSourceText(repoRoot) {
  const files = [...walkSource(join(repoRoot, "app")), ...walkSource(join(repoRoot, "lib"))];
  return files.map((f) => readFileSync(f, "utf8")).join("\n");
}

function walkSource(dir) {
  const out = [];
  if (!existsSync(dir)) return out;
  for (const ent of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, ent.name);
    if (ent.isDirectory()) out.push(...walkSource(p));
    else if (/\.(tsx?|mjs)$/.test(ent.name)) out.push(p);
  }
  return out;
}
