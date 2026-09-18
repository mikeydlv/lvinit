// ---------------------------------------------------------------------------
// APPLYING THE EDITS, AND CHECKING THEM AFTERWARDS
//
// The whole write surface of this agent is here: `writeFileSync` on a page file
// whose only change is an added <Link> around words that were already there.
//
// Every edit is applied through `applyLinkEdit`, which refuses any change that
// would move the page's published copy by one character. Every edit is then
// re-read off disk and re-checked: the link is there, it points where it should,
// it did not duplicate an existing link, and the copy checksum is unchanged.
//
// If anything fails, the file is restored from the snapshot taken before the
// run touched it. There is no half-applied state.
// ---------------------------------------------------------------------------

import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import { applyLinkEdit, copyChecksum, extractLinks, normalizeRoute } from "./source.mjs";

/** The className attribute a new link should carry on this page. */
export function classAttrFor(candidate, config) {
  if (candidate.linkClass?.expression) return `className={${candidate.linkClass.expression}}`;
  return `className="${config.anchor.defaultClassName}"`;
}

/**
 * Apply a set of approved link edits.
 *
 * @returns {{applied:Array, failed:Array, files:Map<string,{before:string, after:string}>}}
 */
export function applyEdits({ repoRoot, candidates, config, existingRoutes }) {
  const applied = [];
  const failed = [];
  const snapshots = new Map(); // relative file -> original text
  const files = new Map(); // relative file -> { before, after }

  // Group by file, then apply from the END of the file backwards so that every
  // earlier edit's character offsets stay valid.
  const byFile = new Map();
  for (const candidate of candidates) {
    if (!byFile.has(candidate.file)) byFile.set(candidate.file, []);
    byFile.get(candidate.file).push(candidate);
  }

  for (const [file, edits] of byFile) {
    const absolute = join(repoRoot, file);
    let text;
    try {
      text = readFileSync(absolute, "utf8");
    } catch (err) {
      for (const edit of edits) failed.push({ candidate: edit, reason: `could not read ${file}: ${err.message}` });
      continue;
    }
    snapshots.set(file, text);
    const originalChecksum = copyChecksum(text);

    let working = text;
    const appliedHere = [];
    let aborted = null;

    for (const candidate of [...edits].sort((a, b) => b.start - a.start)) {
      // Destination existence is re-checked at the moment of the edit, not just
      // when the opportunity was found. LVINIT never ships a dead internal link.
      const route = normalizeRoute(candidate.to);
      if (!route || !existingRoutes.has(route)) {
        aborted = { candidate, reason: `the destination ${candidate.to} does not resolve to a page on disk` };
        break;
      }

      const result = applyLinkEdit(working, {
        start: candidate.start,
        end: candidate.end,
        anchor: candidate.anchor,
        href: route,
        classAttr: classAttrFor(candidate, config),
      });
      if (!result.ok) {
        aborted = { candidate, reason: result.reason };
        break;
      }
      working = result.source;
      appliedHere.push({ candidate, before: result.before, after: result.after });
    }

    if (aborted) {
      // Nothing from this file ships. A page is edited completely or not at all.
      for (const edit of edits) {
        failed.push({
          candidate: edit,
          reason:
            edit === aborted.candidate
              ? aborted.reason
              : `another edit on ${file} failed (${aborted.reason}), so this one was not applied either`,
        });
      }
      continue;
    }

    // --- Post-edit checks, before anything reaches disk ---------------------
    const check = verifyEditedSource({
      before: text,
      after: working,
      originalChecksum,
      candidates: edits,
      existingRoutes,
    });
    if (!check.ok) {
      for (const edit of edits) {
        failed.push({ candidate: edit, reason: `post-edit validation failed on ${file}: ${check.reason}` });
      }
      continue;
    }

    try {
      writeFileSync(absolute, working, "utf8");
    } catch (err) {
      for (const edit of edits) failed.push({ candidate: edit, reason: `could not write ${file}: ${err.message}` });
      continue;
    }

    files.set(file, { before: text, after: working });
    for (const item of appliedHere) {
      applied.push({
        ...item.candidate,
        edit: { before: item.before, after: item.after, file, line: item.candidate.line },
        validation: check.perCandidate.get(item.candidate.fingerprint) ?? null,
      });
    }
  }

  return { applied, failed, files, snapshots };
}

/**
 * Everything that has to be true about an edited file before it is written.
 */
export function verifyEditedSource({ before, after, originalChecksum, candidates, existingRoutes }) {
  const perCandidate = new Map();

  if (copyChecksum(after) !== originalChecksum) {
    return { ok: false, reason: "the page's published copy changed, which is never allowed", perCandidate };
  }

  const linksBefore = extractLinks(before);
  const linksAfter = extractLinks(after);

  const countFor = (links, route) => links.filter((l) => l.href === route).length;

  for (const candidate of candidates) {
    const route = normalizeRoute(candidate.to);
    const wasLinked = countFor(linksBefore, route);
    const nowLinked = countFor(linksAfter, route);

    if (wasLinked !== 0) {
      return {
        ok: false,
        reason: `${candidate.file} already linked to ${route} before the edit, so adding another would duplicate it`,
        perCandidate,
      };
    }
    if (nowLinked !== 1) {
      return {
        ok: false,
        reason: `after the edit ${candidate.file} links to ${route} ${nowLinked} times; exactly one was expected`,
        perCandidate,
      };
    }
    if (!existingRoutes.has(route)) {
      return { ok: false, reason: `${route} does not resolve to a page on disk`, perCandidate };
    }

    const added = linksAfter.find((l) => l.href === route);
    perCandidate.set(candidate.fingerprint, {
      destinationResolves: true,
      duplicateCreated: false,
      copyUnchanged: true,
      renderedAnchor: added?.anchor ?? null,
      line: added?.line ?? null,
    });
  }

  // No link anywhere else in the file may have moved.
  const signature = (links) => links.map((l) => `${l.href}|${l.anchor ?? ""}`).sort().join("\n");
  const addedRoutes = new Set(candidates.map((c) => normalizeRoute(c.to)));
  const filteredAfter = linksAfter.filter((l) => !addedRoutes.has(l.href) || countFor(linksBefore, l.href) > 0);
  if (signature(filteredAfter) !== signature(linksBefore)) {
    return { ok: false, reason: "an existing link on the page changed, which is never allowed", perCandidate };
  }

  return { ok: true, perCandidate };
}

/** Put every touched file back exactly as it was. */
export function restore(repoRoot, snapshots) {
  const restored = [];
  for (const [file, text] of snapshots) {
    try {
      writeFileSync(join(repoRoot, file), text, "utf8");
      restored.push(file);
    } catch {
      // Reported by the caller; there is nothing more this can do.
    }
  }
  return restored;
}
