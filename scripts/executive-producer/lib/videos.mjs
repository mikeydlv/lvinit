// ---------------------------------------------------------------------------
// VIDEO INVENTORY — every published LVINIT video, not just the homepage five
//
// lib/content.ts `videos` is a curated homepage list (deliberately five). Other
// published videos only exist as embeds inside pages: <StoryVideo youtubeId>,
// raw youtube(-nocookie) iframes, and area-pillar `areaVideo` slots. This reads
// all of them from source, without executing anything, and joins each video to:
//
//   * the routes it's embedded on
//   * its local project folder under C:\LVINIT\Videos (from config.projects)
//   * the Shorts, A-roll, thumbnails and graphics already cut for it
//     (from the PUBLIC footage catalog)
//
// Titles come from YouTube's public oEmbed endpoint when reachable (no key, no
// personal data sent), else from the title written in the site source.
// ---------------------------------------------------------------------------

import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join, relative } from "node:path";

import { AGENT, SCHEMA_VERSION } from "../config.mjs";

const ID = "[A-Za-z0-9_-]{11}";

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

/** app/guides/foo/page.tsx → /guides/foo ; lib/content.ts → "/" (homepage list) ; lib/areas/x.tsx → the area page. */
export function routeForFile(relPath) {
  const p = relPath.replace(/\\/g, "/");
  const m = p.match(/^app\/(.*)\/page\.tsx$/);
  if (m) return "/" + m[1].replace(/\([^)]+\)\//g, "");
  if (p === "app/page.tsx" || p === "lib/content.ts") return "/";
  const area = p.match(/^lib\/areas\/([^/.]+)\.tsx$/);
  if (area) return `/neighborhoods/${area[1]}`;
  return null;
}

/** The homepage `videos` array in lib/content.ts. */
export function readHomepageVideos(source) {
  const block = (String(source).match(/export const videos[^=]*=\s*\[([\s\S]*?)\n\];/) ?? [])[1] ?? "";
  const out = [];
  for (const obj of block.match(/\{[\s\S]*?\n\s{2}\}/g) ?? []) {
    const id = (obj.match(/\bid:\s*"([^"]+)"/) ?? [])[1];
    const youtubeId = (obj.match(new RegExp(`\\byoutubeId:\\s*"(${ID})"`)) ?? [])[1];
    const title = (obj.match(/\btitle:\s*"([^"]+)"/) ?? obj.match(/\btitle:\s*\n\s*"([^"]+)"/) ?? [])[1];
    const duration = (obj.match(/\bduration:\s*"([^"]+)"/) ?? [])[1];
    if (youtubeId) out.push({ homepageId: id, youtubeId, title, duration });
  }
  return out;
}

/** Embeds in one source file: StoryVideo/areaVideo youtubeId props and iframe/watch URLs. */
export function readEmbeds(source) {
  const src = String(source);
  const found = new Map();
  const add = (id, title) => {
    if (!found.has(id)) found.set(id, { youtubeId: id, title: title ?? null });
    else if (title && !found.get(id).title) found.get(id).title = title;
  };
  // <StoryVideo youtubeId="…" title="…" …/>  and  youtubeId: "…", title: "…"
  const prop = new RegExp(`youtubeId\\s*[=:]\\s*\\{?\\s*"(${ID})"`, "g");
  for (const m of src.matchAll(prop)) {
    const window = src.slice(Math.max(0, m.index - 400), m.index + 600);
    const t = window.slice(400).match(/\btitle\s*[=:]\s*\{?\s*"([^"]{8,})"/) ?? window.match(/\btitle\s*[=:]\s*\{?\s*"([^"]{8,})"/);
    add(m[1], t?.[1]);
  }
  // <iframe src="https://www.youtube-nocookie.com/embed/…" title="…">
  for (const m of src.matchAll(new RegExp(`youtube(?:-nocookie)?\\.com/embed/(${ID})`, "g"))) {
    const after = src.slice(m.index, m.index + 600);
    const t = after.match(/\btitle\s*=\s*"([^"]{8,})"/);
    add(m[1], t?.[1]);
  }
  // Watch URLs in JSON-LD / links count as references too.
  for (const m of src.matchAll(new RegExp(`(?:youtube\\.com/watch\\?v=|youtu\\.be/)(${ID})`, "g"))) add(m[1], null);
  return [...found.values()];
}

async function oembedTitle(youtubeId, fetchImpl) {
  try {
    const url = `https://www.youtube.com/oembed?format=json&url=${encodeURIComponent(`https://www.youtube.com/watch?v=${youtubeId}`)}`;
    const res = await fetchImpl(url, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) return null;
    const j = await res.json();
    return typeof j.title === "string" ? j.title : null;
  } catch {
    return null;
  }
}

export async function buildVideoInventory({ repoRoot, config, publicItems = [], generatedAt, fetchImpl = fetch, oembed = config.inventory.oembed }) {
  const videos = new Map();
  const touch = (id) => {
    if (!videos.has(id)) videos.set(id, { youtubeId: id, url: `https://www.youtube.com/watch?v=${id}`, titles: [], embeddedOn: new Set(), homepage: null });
    return videos.get(id);
  };

  const contentPath = join(repoRoot, "lib", "content.ts");
  if (existsSync(contentPath)) {
    for (const v of readHomepageVideos(readFileSync(contentPath, "utf8"))) {
      const rec = touch(v.youtubeId);
      rec.homepage = { id: v.homepageId, duration: v.duration ?? null };
      if (v.title) rec.titles.push(v.title);
    }
  }

  for (const file of [...listSourceFiles(join(repoRoot, "app")), ...listSourceFiles(join(repoRoot, "lib"))]) {
    const rel = relative(repoRoot, file).replace(/\\/g, "/");
    if (rel === "lib/content.ts") continue; // homepage list handled above; guide `href`s aren't embeds
    const route = routeForFile(rel);
    for (const e of readEmbeds(readFileSync(file, "utf8"))) {
      const rec = touch(e.youtubeId);
      if (route) rec.embeddedOn.add(route);
      if (e.title) rec.titles.push(e.title);
    }
  }

  const projectByVideo = new Map(Object.entries(config.projects).map(([folder, p]) => [p.youtubeId, { folder, ...p }]));

  const out = [];
  for (const rec of videos.values()) {
    const project = projectByVideo.get(rec.youtubeId) ?? null;
    const assets = project ? publicItems.filter((e) => e.project?.youtubeId === rec.youtubeId && !e.duplicateOf) : [];
    const count = (role) => assets.filter((e) => e.role === role).length;
    const liveTitle = oembed ? await oembedTitle(rec.youtubeId, fetchImpl) : null;
    const longForm = assets.filter((e) => e.role === "long-form").sort((a, b) => (b.durationSec ?? 0) - (a.durationSec ?? 0))[0];
    out.push({
      youtubeId: rec.youtubeId,
      url: rec.url,
      title: liveTitle ?? rec.titles[0] ?? null,
      titleSource: liveTitle ? "youtube-oembed" : rec.titles.length ? "site-source" : "unknown",
      onHomepage: Boolean(rec.homepage),
      homepageId: rec.homepage?.id ?? null,
      duration: rec.homepage?.duration ?? (longForm?.durationSec ? mmss(longForm.durationSec) : null),
      embeddedOn: [...rec.embeddedOn].sort(),
      area: project?.area ?? null,
      localProject: project?.folder ?? null,
      localAssets: project
        ? {
            longForm: count("long-form"),
            shorts: count("short"),
            cuts: count("cut"),
            aRoll: count("a-roll"),
            bRoll: count("b-roll"),
            thumbnails: count("thumbnail"),
            graphics: count("graphic"),
            scripts: count("script"),
            shortPaths: assets.filter((e) => e.role === "short").map((e) => e.path).slice(0, 30),
          }
        : null,
    });
  }
  out.sort((a, b) => (b.onHomepage - a.onHomepage) || String(a.title).localeCompare(String(b.title)));

  return {
    schema_version: SCHEMA_VERSION,
    agent: AGENT,
    kind: "video-inventory",
    generatedAt,
    totals: {
      videos: out.length,
      onHomepage: out.filter((v) => v.onHomepage).length,
      embedOnly: out.filter((v) => !v.onHomepage).length,
      withLocalProject: out.filter((v) => v.localProject).length,
      shortsAlreadyCut: out.reduce((s, v) => s + (v.localAssets?.shorts ?? 0), 0),
    },
    videos: out,
  };
}

function mmss(sec) {
  const s = Math.round(sec);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}
