// ---------------------------------------------------------------------------
// PRIVACY — what may leave the PC
//
// Every file the cataloger sees gets exactly one status:
//
//   excluded     inside a folder named in the local `excluded` list, at any
//                depth. Never cataloged at all, not even in the local catalog.
//   local-only   kept in the local catalog on this PC, never pushed. Either the
//                folder hasn't been approved yet, the path is held on purpose,
//                or the file name looks private (a document, a screenshot, an
//                address, a drive past individual homes).
//   public       inside an explicitly approved folder and nothing flagged it.
//                Only these entries go into the sanitized catalog.
//
// Approval is per EXACT folder. A new subfolder under an approved folder is
// still held local-only until approved, so nothing new leaks by inheritance.
//
// The rules file lives in the local home directory (config.privacy.file) and
// is never committed or pushed: it is the one place client and address names
// are allowed to exist.
// ---------------------------------------------------------------------------

import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";

import { SCHEMA_VERSION, AGENT } from "../config.mjs";

export function norm(p) {
  return String(p).replace(/\\/g, "/").replace(/\/+$/, "").replace(/^\.\//, "");
}

const key = (p) => norm(p).toLowerCase();

export function defaultPrivacy(config) {
  return {
    schema_version: SCHEMA_VERSION,
    agent: AGENT,
    note: "LOCAL ONLY. Never commit or push this file. Folder paths are relative to the media root.",
    excluded: [],
    approved: [...config.privacy.approvedSeed],
    approvedFiles: [],
    localOnly: [],
  };
}

export function loadPrivacy(config) {
  const file = config.privacy.file;
  if (!existsSync(file)) return { privacy: defaultPrivacy(config), created: true };
  const raw = JSON.parse(readFileSync(file, "utf8"));
  return {
    privacy: {
      ...defaultPrivacy(config),
      ...raw,
      excluded: raw.excluded ?? [],
      approved: raw.approved ?? [],
      approvedFiles: raw.approvedFiles ?? [],
      localOnly: raw.localOnly ?? [],
    },
    created: false,
  };
}

export function savePrivacy(config, privacy) {
  mkdirSync(dirname(config.privacy.file), { recursive: true });
  writeFileSync(config.privacy.file, JSON.stringify(privacy, null, 2) + "\n");
}

/** Apply --exclude / --approve / --hold edits. Returns a list of what changed. */
export function editPrivacy(privacy, { exclude = [], approve = [], hold = [] }) {
  const changes = [];
  const has = (list, v) => list.some((x) => key(typeof x === "string" ? x : x.path) === key(v));
  for (const name of exclude) {
    if (!has(privacy.excluded, name)) {
      privacy.excluded.push(name);
      changes.push(`excluded "${name}"`);
    }
  }
  for (const p of approve) {
    const path = norm(p);
    // A path with an extension is a single file; anything else is a folder.
    const list = /\.[a-z0-9]{2,5}$/i.test(path) ? privacy.approvedFiles : privacy.approved;
    if (!has(list, path)) {
      list.push(path);
      changes.push(`approved "${path}"`);
    }
    const before = privacy.localOnly.length;
    privacy.localOnly = privacy.localOnly.filter((x) => key(x.path) !== key(path));
    if (privacy.localOnly.length !== before) changes.push(`released hold on "${path}"`);
  }
  for (const h of hold) {
    const [path, reason = "held by Mikey"] = String(h).split("|");
    if (!has(privacy.localOnly, path)) {
      privacy.localOnly.push({ path: norm(path), reason });
      changes.push(`holding "${norm(path)}" local-only`);
    }
  }
  return changes;
}

function basename(p) {
  const parts = norm(p).split("/");
  return parts[parts.length - 1];
}

function parent(p) {
  const parts = norm(p).split("/");
  return parts.slice(0, -1).join("/");
}

/** Is any folder segment of this path in the excluded list? */
export function isExcluded(relPath, privacy) {
  const names = new Set(privacy.excluded.map((n) => String(n).toLowerCase()));
  return norm(relPath)
    .split("/")
    .some((seg) => names.has(seg.toLowerCase()));
}

/**
 * Classify one FILE path (relative to the media root).
 * Returns { status: "excluded" | "local-only" | "public", reason }.
 */
export function classifyFile(relPath, privacy, config) {
  const path = norm(relPath);
  if (isExcluded(path, privacy)) return { status: "excluded", reason: "inside an excluded folder" };

  const held = privacy.localOnly.find((h) => {
    const k = key(h.path);
    return key(path) === k || key(path).startsWith(k + "/");
  });
  if (held) return { status: "local-only", reason: held.reason || "held by Mikey" };

  const folder = parent(path);
  const approved = new Set(privacy.approved.map(key));
  if (!approved.has(key(folder))) {
    return { status: "local-only", reason: `folder not classified yet: "${folder}"`, pendingFolder: folder };
  }

  const fileApproved = privacy.approvedFiles.some((f) => key(f) === key(path));
  if (!fileApproved) {
    const name = basename(path);
    for (const { re, why } of config.privacy.flagPatterns) {
      if (re.test(name)) return { status: "local-only", reason: `file name ${why}`, pendingFile: path };
    }
  }
  return { status: "public", reason: "approved folder" };
}
