// ---------------------------------------------------------------------------
// REVIEW — the local, human-readable catalog report
//
// Written to the LOCAL home directory only (it names held folders, so it never
// leaves the PC). Answers three questions in order:
//   1. Does anything need Mikey's decision?  (unclassified folders, flagged files)
//   2. What will leave the PC?               (folder summary)
//   3. What videos exist, and what's already cut for them?
// ---------------------------------------------------------------------------

function table(rows, header) {
  if (!rows.length) return "_None._\n";
  const line = (cells) => `| ${cells.map((c) => String(c ?? "").replace(/\|/g, "\\|")).join(" | ")} |`;
  return [line(header), line(header.map(() => "---")), ...rows.map(line)].join("\n") + "\n";
}

export function buildReviewMarkdown({ entries, catalog, inventory, privacy, excludedFolders, generatedAt }) {
  const held = entries.filter((e) => e.privacy.status === "local-only");
  const pendingFolders = new Map();
  const flagged = [];
  const holds = [];
  for (const e of held) {
    if (e.privacy.pendingFolder) pendingFolders.set(e.privacy.pendingFolder, (pendingFolders.get(e.privacy.pendingFolder) ?? 0) + 1);
    else if (e.privacy.pendingFile) flagged.push(e);
    else holds.push(e);
  }

  const out = [];
  out.push(`# Footage catalog review (LOCAL ONLY)`);
  out.push("");
  out.push(`Generated ${generatedAt}. This file stays on your PC. Only the sanitized catalog is ever pushed.`);
  out.push("");
  out.push(`- **Public (may leave the PC):** ${catalog.totals.public} files, ${catalog.totals.videoMinutes} minutes of unique video`);
  out.push(`- **Held local-only:** ${held.length} files`);
  out.push(`- **Excluded folders (never read):** ${excludedFolders} (${privacy.excluded.length} name${privacy.excluded.length === 1 ? "" : "s"} on the exclude list)`);
  out.push("");

  out.push(`## 1. Needs your decision`);
  out.push("");
  out.push(`### Folders not classified yet`);
  out.push("");
  out.push("New folders stay local-only until you approve them. Approve general B-roll, exclude anything with clients, addresses or private shoots.");
  out.push("");
  out.push(
    table(
      [...pendingFolders.entries()].sort().map(([f, n]) => [f, n, `\`--approve="${f}"\` or \`--exclude="${f.split("/").pop()}"\``]),
      ["Folder", "Files", "Decide with"],
    ),
  );
  out.push(`### Files held because of their name`);
  out.push("");
  out.push(table(flagged.map((e) => [e.path, e.privacy.reason.replace(/^file name /, ""), `\`--approve="${e.path}"\``]), ["File", "Why", "Release with"]));
  out.push(`### Held on purpose`);
  out.push("");
  out.push(table(holds.map((e) => [e.path, e.privacy.reason]), ["File", "Reason"]));

  out.push(`## 2. What leaves the PC (sanitized catalog)`);
  out.push("");
  out.push(
    table(
      catalog.folders.map((f) => [f.folder, f.area ?? "", f.videos, f.minutes, f.drone, f.handheld, f.vertical, f.photos + f.graphics, f.dateRange ? f.dateRange.join(" → ") : ""]),
      ["Folder", "Area", "Clips", "Min", "Drone", "Handheld", "Vertical", "Stills", "Shot"],
    ),
  );

  out.push(`## 3. Video inventory`);
  out.push("");
  out.push(
    table(
      inventory.videos.map((v) => [
        v.title ?? v.youtubeId,
        v.onHomepage ? "yes" : "embed only",
        v.embeddedOn.join(", "),
        v.localProject ?? "—",
        v.localAssets ? `${v.localAssets.shorts} shorts · ${v.localAssets.aRoll} A-roll · ${v.localAssets.thumbnails} thumbs` : "—",
      ]),
      ["Video", "Homepage", "Embedded on", "Local project", "Already cut"],
    ),
  );
  return out.join("\n");
}
