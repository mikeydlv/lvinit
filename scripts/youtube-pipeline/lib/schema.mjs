// ---------------------------------------------------------------------------
// STRUCTURED DATA — VideoObject / Article in LVINIT's own shape
//
// The site's single source of truth is lib/story.ts: a `StoryMeta.video`
// (StoryVideoMeta) becomes a VideoObject in the page's @graph next to Article
// and BreadcrumbList. This module proposes that exact object and validates it.
//
// It never creates a value. A field nobody has stated (manifest, site source)
// is BLOCKED with the reason, and the Publisher fills it from YouTube Studio or
// the watch page at publish time. viewCount / ratings / interactionStatistic
// are never proposed at all.
// ---------------------------------------------------------------------------

import { isValidUploadDate, isoDurationToSeconds, secondsToIsoDuration, YOUTUBE_ID } from "./youtube.mjs";

export const SITE_URL = "https://www.lvinit.com";

/**
 * Propose StoryMeta.video for one video. Returns { video, blocked }.
 */
export function proposeVideoMeta(video) {
  const blocked = [];
  const ok = YOUTUBE_ID.test(String(video.youtubeId ?? ""));
  if (!ok) blocked.push({ field: "youtubeId", reason: "no valid YouTube id" });

  const name = video.title ?? null;
  if (!name) blocked.push({ field: "name", reason: "no title in the manifest or the site source" });

  // The description is YouTube's own, trimmed to its opening paragraph. It is
  // never written from the transcript.
  const description = video.description ? firstParagraph(video.description) : null;
  if (!description) blocked.push({ field: "description", reason: "no video description in the manifest — copy it from YouTube, do not write one from the transcript" });

  let thumbnailUrl = null;
  let thumbnailSource = null;
  if (video.thumbnail) {
    thumbnailUrl = video.thumbnail;
    thumbnailSource = video.thumbnailSource;
  } else if (ok) {
    // Established LVINIT pattern when there is no local poster: YouTube's own
    // thumbnail in the VideoObject (see /guides/is-las-vegas-a-buyers-market).
    thumbnailUrl = video.urls.youtubeThumbnail;
    thumbnailSource = "YouTube's own thumbnail (site precedent; no local poster exists)";
  }

  const uploadDate = video.uploadDate && isValidUploadDate(video.uploadDate) ? video.uploadDate : null;
  if (!uploadDate) {
    blocked.push({
      field: "uploadDate",
      reason: video.uploadDate ? `"${video.uploadDate}" is not a valid ISO date` : "upload date is not recorded in the manifest or on any LVINIT page — take it from YouTube, never estimate it",
    });
  }

  const duration = video.durationSeconds ? secondsToIsoDuration(video.durationSeconds) : null;
  if (!duration) blocked.push({ field: "duration", reason: "duration is not recorded — omit it (StoryVideoMeta allows that) or take it from YouTube; never estimate" });

  const meta = ok
    ? {
        name,
        description,
        thumbnailUrl,
        uploadDate,
        ...(duration ? { duration } : {}),
        embedUrl: video.urls.embed,
        contentUrl: video.urls.watch,
      }
    : null;
  return { video: meta, thumbnailSource, blocked };
}

function firstParagraph(text) {
  const para = String(text).split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
  // YouTube descriptions often open with a one-line hook; take paragraphs until
  // there is a full sentence or two, stopping before lists and hashtags.
  const out = [];
  for (const p of para) {
    if (/^[•\-*#]/.test(p) || /#\w/.test(p)) break;
    out.push(p.replace(/\s+/g, " "));
    if (out.join(" ").length > 160) break;
  }
  return out.join(" ").trim() || null;
}

/** The JSON-LD node lib/story.ts would emit for a StoryVideoMeta. */
export function videoObjectNode(meta) {
  if (!meta) return null;
  const node = {
    "@type": "VideoObject",
    name: meta.name,
    description: meta.description,
    thumbnailUrl: String(meta.thumbnailUrl ?? "").startsWith("http") ? meta.thumbnailUrl : `${SITE_URL}${meta.thumbnailUrl}`,
    uploadDate: meta.uploadDate,
  };
  if (meta.duration) node.duration = meta.duration;
  if (meta.embedUrl) node.embedUrl = meta.embedUrl;
  if (meta.contentUrl) {
    node.contentUrl = meta.contentUrl;
    node.url = meta.contentUrl;
  }
  return node;
}

/**
 * Validate a VideoObject node — the checks the Site Quality Agent runs, plus
 * the ones Google requires for a video rich result.
 */
export function validateVideoObject(node, { expectedId = null, articleUrl = null } = {}) {
  const errors = [];
  const warnings = [];
  if (!node) return { valid: false, errors: ["no VideoObject"], warnings };
  if (node["@type"] !== "VideoObject") errors.push("@type must be VideoObject");
  for (const f of ["name", "description", "thumbnailUrl", "uploadDate"]) if (!node[f]) errors.push(`${f} is required`);
  if (node.uploadDate && !isValidUploadDate(node.uploadDate)) errors.push(`uploadDate "${node.uploadDate}" is not a valid ISO date`);
  if (node.duration && isoDurationToSeconds(node.duration) === null) errors.push(`duration "${node.duration}" is not ISO 8601 (PT#M#S)`);
  if (node.thumbnailUrl && !/^https:\/\//.test(node.thumbnailUrl)) errors.push("thumbnailUrl must be an absolute https URL");
  for (const f of ["embedUrl", "contentUrl"]) {
    if (node[f] && expectedId && !String(node[f]).includes(expectedId)) errors.push(`${f} does not name video ${expectedId}`);
  }
  if (!node.duration) warnings.push("no duration — allowed, but recommended for video results");
  if (!node.embedUrl && !node.contentUrl) errors.push("embedUrl or contentUrl is required");
  for (const f of ["interactionStatistic", "aggregateRating", "viewCount"]) if (node[f] !== undefined) errors.push(`${f} must never be asserted`);
  if (articleUrl && !/^https:\/\/www\.lvinit\.com\//.test(articleUrl)) errors.push("article URL must be on https://www.lvinit.com");
  return { valid: errors.length === 0, errors, warnings };
}

/** The Article / page-level schema facts the Publisher must supply. */
export function articleSchemaPlan({ route, title, action, existingRoute }) {
  const path = route ?? existingRoute ?? null;
  return {
    pattern: "StoryMeta → buildStoryMetadata + buildStoryJsonLd (lib/story.ts): Article + BreadcrumbList + VideoObject",
    canonical: path ? `${SITE_URL}${path}` : null,
    headline: title ?? null,
    author: "Mikey Del Rosario",
    datePublished: existingRoute ? "keep the page's existing value" : "BLOCKED — set to the real publish date when the Publisher ships it",
    dateModified: existingRoute ? "set to the real date of this update" : "same as datePublished",
    relationships: [
      "VideoObject sits in the same @graph as the Article; the Article's mainEntityOfPage is the canonical URL",
      action === "ADD_VIDEO_TO_EXISTING_ARTICLE" || action === "UPDATE_EXISTING_ARTICLE" || action === "CREATE_FAQ_SECTION"
        ? "if the page already features a different video in StoryMeta.video, keep it — a page carries one VideoObject"
        : "this video becomes the page's StoryMeta.video",
    ],
  };
}
