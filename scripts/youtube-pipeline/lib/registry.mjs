// ---------------------------------------------------------------------------
// VIDEO REGISTRY — what the repository already knows about each video
//
// Mikey never re-enters what the site already says. For every YouTube id this
// reads, from source and without executing anything:
//
//   * the homepage `videos` entry in lib/content.ts (title, duration, poster id)
//   * every page that embeds it (StoryVideo / areaVideo / iframes / JSON-LD),
//     reusing the Executive Producer's read-only scanners unchanged
//   * VideoObject facts already published for it (uploadDate, duration,
//     thumbnailUrl) — only from a page that is about that one video
//   * a local poster in /public/images, if one exists
//
// and merges the approved-video manifest on top. A manifest value always wins
// (it was written deliberately), and any disagreement with the site source is
// recorded so the Publisher can resolve it. Nothing is fetched from YouTube.
// ---------------------------------------------------------------------------

import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join, relative } from "node:path";

import { readEmbeds, readHomepageVideos, routeForFile } from "../../executive-producer/lib/videos.mjs";

import { clockToSeconds, extractVideoId, isoDurationToSeconds, secondsToClock, videoUrls, YOUTUBE_ID } from "./youtube.mjs";

const ID_SRC = "[A-Za-z0-9_-]{11}";

function listSourceFiles(dir) {
  const out = [];
  if (!existsSync(dir)) return out;
  for (const ent of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, ent.name);
    if (ent.isDirectory()) out.push(...listSourceFiles(p));
    else if (/\.(tsx?|mjs|jsx?)$/.test(ent.name)) out.push(p);
  }
  return out;
}

/**
 * Video ids a source file refers to through a named constant, e.g.
 *   const YOUTUBE_ID = "aMeXy1frj-o";   …   youtubeId={YOUTUBE_ID}
 * The Executive Producer's scanner only sees string literals at the prop.
 */
export function readIdConstants(source) {
  const out = [];
  for (const m of String(source).matchAll(new RegExp(`const\\s+([A-Z0-9_]*(?:YOUTUBE|VIDEO)[A-Z0-9_]*)\\s*=\\s*"(${ID_SRC})"`, "g"))) {
    if (new RegExp(`\\b${m[1]}\\b`).test(String(source).slice(m.index + m[0].length))) out.push(m[2]);
  }
  return [...new Set(out)];
}

/** VideoObject facts written in a page's source. */
export function readVideoObjectFacts(source) {
  const src = String(source);
  const at = src.search(/video\s*:\s*\{|"@type"\s*:\s*"VideoObject"/);
  if (at < 0) return null;
  const block = src.slice(at, at + 2000);
  const pick = (re) => (block.match(re) ?? [])[1] ?? null;
  const facts = {
    uploadDate: pick(/uploadDate\s*:\s*"([^"]+)"/),
    duration: pick(/\bduration\s*:\s*"(PT[^"]+)"/),
    thumbnailUrl: pick(/thumbnailUrl\s*:\s*[`"]([^`"]+)[`"]/),
    name: pick(/\bname\s*:\s*"([^"]{8,})"/),
  };
  return Object.values(facts).some(Boolean) ? facts : null;
}

/** Local poster for a homepage video id, if one exists on disk. */
export function findPoster(repoRoot, homepageId) {
  if (!homepageId) return null;
  for (const ext of ["webp", "jpg", "png"]) {
    const rel = `/images/video-${homepageId}.${ext}`;
    if (existsSync(join(repoRoot, "public", rel))) return rel;
  }
  return null;
}

/**
 * Everything the repository says about every video it references.
 * @returns {Map<string, object>} youtubeId -> site record
 */
export function readSiteVideos(repoRoot) {
  const videos = new Map();
  const touch = (id) => {
    if (!videos.has(id)) {
      videos.set(id, { youtubeId: id, titles: [], homepage: null, embeddedOn: new Set(), posters: new Set(), videoObject: null, videoObjectRoute: null });
    }
    return videos.get(id);
  };

  const contentPath = join(repoRoot, "lib", "content.ts");
  if (existsSync(contentPath)) {
    for (const v of readHomepageVideos(readFileSync(contentPath, "utf8"))) {
      const rec = touch(v.youtubeId);
      rec.homepage = { id: v.homepageId, duration: v.duration ?? null };
      if (v.title) rec.titles.push(v.title);
      const poster = findPoster(repoRoot, v.homepageId);
      if (poster) rec.posters.add(poster);
    }
  }

  for (const file of [...listSourceFiles(join(repoRoot, "app")), ...listSourceFiles(join(repoRoot, "lib"))]) {
    const rel = relative(repoRoot, file).replace(/\\/g, "/");
    if (rel === "lib/content.ts") continue; // homepage list above; guide hrefs and comments are not embeds
    const route = routeForFile(rel);
    const source = readFileSync(file, "utf8");
    const ids = new Set();
    for (const e of readEmbeds(source)) {
      ids.add(e.youtubeId);
      if (e.title) touch(e.youtubeId).titles.push(e.title);
    }
    for (const id of readIdConstants(source)) ids.add(id);
    for (const id of ids) {
      const rec = touch(id);
      if (route) rec.embeddedOn.add(route);
      for (const m of source.matchAll(/poster[=:]\s*\{?\s*"(\/images\/[^"]+)"/g)) {
        if (existsSync(join(repoRoot, "public", m[1])) && ids.size === 1) rec.posters.add(m[1]);
      }
    }
    // A VideoObject is attributed only when the page is about exactly one video.
    if (ids.size === 1) {
      const facts = readVideoObjectFacts(source);
      const [id] = ids;
      if (facts && !videos.get(id).videoObject) {
        videos.get(id).videoObject = facts;
        videos.get(id).videoObjectRoute = route;
      }
    }
  }

  return videos;
}

/** One manifest entry, validated. Returns { entry, problems }. */
export function normalizeManifestEntry(raw, index = 0) {
  const problems = [];
  const id = extractVideoId(raw?.youtubeId ?? raw?.url);
  if (!id) problems.push(`videos[${index}]: no valid YouTube id or URL`);
  if (raw?.url && raw?.youtubeId && extractVideoId(raw.url) !== raw.youtubeId) problems.push(`videos[${index}]: url and youtubeId disagree`);
  if (raw?.durationSeconds !== undefined && !(Number(raw.durationSeconds) > 0)) problems.push(`videos[${index}]: durationSeconds must be a positive number`);
  const t = raw?.transcript ?? null;
  return {
    problems,
    entry: {
      youtubeId: id,
      approved: raw?.approved === true,
      title: raw?.title ?? null,
      uploadDate: raw?.uploadDate ?? null,
      durationSeconds: raw?.durationSeconds !== undefined ? Number(raw.durationSeconds) : null,
      description: raw?.description ?? null,
      thumbnail: raw?.thumbnail ?? null,
      chapters: Array.isArray(raw?.chapters) ? raw.chapters : [],
      sourceNotes: raw?.sourceNotes ?? null,
      targetTopic: raw?.targetTopic ?? null,
      relatedRoute: raw?.relatedRoute ?? null,
      metadataSource: raw?.metadataSource ?? null,
      transcript: t
        ? {
            path: t.path ?? null,
            format: t.format ?? null,
            source: t.source ?? null,
            verified: t.verified === true,
            verifiedBy: t.verifiedBy ?? null,
            note: t.note ?? null,
          }
        : null,
    },
  };
}

/** Read and validate the manifest file. A missing manifest is an empty one. */
export function readManifest(repoRoot, manifestPath) {
  const full = join(repoRoot, manifestPath);
  if (!existsSync(full)) return { available: false, path: manifestPath, videos: [], problems: [`${manifestPath} not found`] };
  let doc;
  try {
    doc = JSON.parse(readFileSync(full, "utf8"));
  } catch (err) {
    return { available: false, path: manifestPath, videos: [], problems: [`${manifestPath} is not valid JSON: ${err.message}`] };
  }
  const problems = [];
  const videos = [];
  (Array.isArray(doc.videos) ? doc.videos : []).forEach((raw, i) => {
    const { entry, problems: p } = normalizeManifestEntry(raw, i);
    problems.push(...p);
    if (entry.youtubeId) videos.push(entry);
  });
  const seen = new Set();
  for (const v of videos) {
    if (seen.has(v.youtubeId)) problems.push(`${v.youtubeId} is listed more than once`);
    seen.add(v.youtubeId);
  }
  return { available: true, path: manifestPath, videos, problems };
}

/**
 * One video record: the manifest entry merged over what the site knows.
 * Nothing is filled in that neither source states.
 */
export function mergeVideo(entry, site) {
  const urls = videoUrls(entry.youtubeId);
  const conflicts = [];
  const siteTitle = site?.titles?.[0] ?? null;
  const siteDurationSec =
    clockToSeconds(site?.homepage?.duration) ?? isoDurationToSeconds(site?.videoObject?.duration) ?? null;
  const siteUpload = site?.videoObject?.uploadDate ?? null;

  if (entry.durationSeconds && siteDurationSec && Math.abs(entry.durationSeconds - siteDurationSec) > 1) {
    conflicts.push({ field: "duration", manifest: secondsToClock(entry.durationSeconds), site: secondsToClock(siteDurationSec) });
  }
  if (entry.uploadDate && siteUpload && entry.uploadDate.slice(0, 10) !== siteUpload.slice(0, 10)) {
    conflicts.push({ field: "uploadDate", manifest: entry.uploadDate, site: siteUpload });
  }

  const durationSeconds = entry.durationSeconds ?? siteDurationSec ?? null;
  const posters = [...(site?.posters ?? [])];
  return {
    youtubeId: entry.youtubeId,
    approved: entry.approved,
    urls,
    title: entry.title ?? siteTitle,
    titleSource: entry.title ? "manifest" : siteTitle ? "site-source" : null,
    siteTitles: [...new Set(site?.titles ?? [])],
    uploadDate: entry.uploadDate ?? siteUpload ?? null,
    uploadDateSource: entry.uploadDate ? "manifest" : siteUpload ? `site VideoObject (${site.videoObjectRoute})` : null,
    durationSeconds,
    durationSource: entry.durationSeconds ? "manifest" : siteDurationSec ? "site source" : null,
    description: entry.description,
    thumbnail: entry.thumbnail ?? posters[0] ?? null,
    thumbnailSource: entry.thumbnail ? "manifest" : posters[0] ? "local poster" : null,
    chapters: entry.chapters,
    sourceNotes: entry.sourceNotes,
    targetTopic: entry.targetTopic,
    relatedRoute: entry.relatedRoute,
    metadataSource: entry.metadataSource,
    transcript: entry.transcript,
    onHomepage: Boolean(site?.homepage),
    homepageId: site?.homepage?.id ?? null,
    embeddedOn: [...(site?.embeddedOn ?? [])].sort(),
    siteVideoObject: site?.videoObject ?? null,
    siteVideoObjectRoute: site?.videoObjectRoute ?? null,
    conflicts,
  };
}

/** Site videos the manifest does not list — reported, never processed. */
export function unlistedSiteVideos(siteVideos, manifestVideos) {
  const listed = new Set(manifestVideos.map((v) => v.youtubeId));
  return [...siteVideos.values()]
    .filter((v) => YOUTUBE_ID.test(v.youtubeId) && !listed.has(v.youtubeId))
    .map((v) => ({ youtubeId: v.youtubeId, title: v.titles[0] ?? null, onHomepage: Boolean(v.homepage), embeddedOn: [...v.embeddedOn].sort() }))
    .sort((a, b) => String(a.title).localeCompare(String(b.title)));
}
