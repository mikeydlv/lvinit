// ---------------------------------------------------------------------------
// SCAN — list what's in the media library, read-only
//
// Walks the configured roots under the media root. Excluded folders are pruned
// before they are entered, so nothing inside them is ever read, probed or
// listed. Editor caches, proxies (.LRF), raw stills that duplicate a JPG
// (.DNG) and loose audio are skipped.
//
// Nothing here writes, renames, or opens a file for writing.
// ---------------------------------------------------------------------------

import { readdirSync, statSync, existsSync } from "node:fs";
import { join, extname } from "node:path";

import { isExcluded, norm } from "./privacy.mjs";

export function scanMedia(config, privacy) {
  const { root, roots, ignoreDirs, ignoreExtensions } = config.media;
  const ignoreDir = new Set(ignoreDirs.map((d) => d.toLowerCase()));
  const ignoreExt = new Set(ignoreExtensions.map((e) => e.toLowerCase()));
  const files = [];
  let excludedFolders = 0;

  const walk = (abs, rel) => {
    let entries;
    try {
      entries = readdirSync(abs, { withFileTypes: true });
    } catch {
      return;
    }
    for (const ent of entries) {
      const childRel = rel ? `${rel}/${ent.name}` : ent.name;
      const childAbs = join(abs, ent.name);
      if (ent.isDirectory()) {
        if (ignoreDir.has(ent.name.toLowerCase())) continue;
        if (isExcluded(childRel, privacy)) {
          excludedFolders += 1;
          continue;
        }
        walk(childAbs, childRel);
      } else if (ent.isFile()) {
        const ext = extname(ent.name).slice(1).toLowerCase();
        if (!ext || ignoreExt.has(ext)) continue;
        // Extension-less editor artifacts and timestamp-named cache files.
        if (/^\d{10,}$/.test(ext)) continue;
        let st;
        try {
          st = statSync(childAbs);
        } catch {
          continue;
        }
        files.push({ rel: norm(childRel), abs: childAbs, ext, size: st.size, mtimeMs: Math.round(st.mtimeMs) });
      }
    }
  };

  for (const top of roots) {
    const abs = join(root, top);
    if (existsSync(abs)) walk(abs, top);
  }
  files.sort((a, b) => a.rel.localeCompare(b.rel));
  return { files, excludedFolders };
}

export function mediaType(ext, config) {
  if (config.media.video.includes(ext)) return "video";
  if (config.media.image.includes(ext)) return "image";
  if (config.media.document.includes(ext)) return "document";
  return null;
}
