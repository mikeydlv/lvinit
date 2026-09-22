#!/usr/bin/env node
// ---------------------------------------------------------------------------
// LVINIT EXECUTIVE PRODUCER — WEEKLY PRODUCTION (runs on Mikey's PC)
//
//   node scripts/executive-producer/produce.mjs --spec=<week.json> [--out=DIR] [--media-root=C:\LVINIT]
//
// Turns one week's post spec (7 posts, Monday–Sunday) into the finished batch:
//
//   <out>/<week>/
//     preview.html                one visual review, Monday–Sunday, lead first
//     LVINIT-week-<date>.zip       every finished post
//     1-Mon-<slug>/
//       01.jpg … 0N.jpg            ordered carousel slides (1080x1350)   or
//       reel.mp4 + reel-cover.jpg  a short montage (1080x1920, silent)
//       caption.txt                caption + hashtags, ready to paste
//       notes.md                   takeaway, CTA, sources, reference posts
//                                  (observed metrics + dates), asset provenance
//
// It never publishes anything. Media is read from the approved library and only
// the finished posts are written.
// ---------------------------------------------------------------------------

import { readFileSync, writeFileSync, mkdirSync, existsSync, rmSync, readdirSync } from "node:fs";
import { join, resolve, dirname, isAbsolute } from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

import { renderSlide, renderMontage } from "./lib/render.mjs";

const { default: sharp } = await import("sharp");

function parseArgs(argv) {
  const a = {};
  for (const r of argv) if (r.startsWith("--")) {
    const [k, ...v] = r.slice(2).split("=");
    a[k] = v.length ? v.join("=") : true;
  }
  return a;
}

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const DAY_NAMES = { Mon: "Monday", Tue: "Tuesday", Wed: "Wednesday", Thu: "Thursday", Fri: "Friday", Sat: "Saturday", Sun: "Sunday" };
const esc = (s) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const fmt = (n) => (typeof n === "number" ? n.toLocaleString("en-US") : n);

function mmss(t) {
  if (t === undefined || t === null) return null;
  return `${Math.floor(t / 60)}:${String(Math.round(t % 60)).padStart(2, "0")}`;
}

function captionText(p) {
  return `${p.caption.trim()}\n\n${p.hashtags.map((h) => (h.startsWith("#") ? h : `#${h}`)).join(" ")}\n`;
}

function notesMd(p, week) {
  const L = [];
  L.push(`# ${DAY_NAMES[p.day]}: ${p.title}`, "");
  L.push(`**Format:** ${p.format === "montage" ? "Reel (short montage)" : `Carousel, ${p.slides.length} slides`}  `);
  L.push(`**Category:** ${p.category}  `);
  L.push(`**Takeaway:** ${p.takeaway}  `);
  L.push(`**CTA:** ${p.cta}`, "");
  if (p.ctaNote) L.push(`> ${p.ctaNote}`, "");
  L.push("## Sources for every factual claim", "");
  for (const s of p.sources) L.push(`- ${s.claim} (${s.url}${s.authority ? `; ${s.authority}` : ""}${s.checked ? `, checked ${s.checked}` : ""})${s.quote ? `
  > "${s.quote}"` : ""}`);
  L.push("", "## Reference posts from other creators", "");
  L.push(`Metrics are exactly what the platform displayed on ${week.researchChecked}. "Why it works" is my judgment, not a measurement.`, "");
  for (const r of p.references ?? []) {
    const m = Object.entries(r.metrics ?? {}).map(([k, v]) => `${fmt(v)} ${k}`).join(", ");
    L.push(`- **${r.evidence} evidence, ${r.label}** · ${r.platform} · ${r.creator} · posted ${r.date} · ${r.format}`);
    L.push(`  ${r.url}`);
    L.push(`  Observed: ${m || "not available"}`);
    L.push(`  Why it's useful (judgment): ${r.why}`);
  }
  if (!p.references?.length) L.push("- No relevant reference found this week. This post is an editorial recommendation on a verified evergreen topic.");
  if (p.formatNote) L.push("", `**Format note:** ${p.formatNote}`);
  L.push("", "## Asset provenance", "");
  L.push("Every image is an original photo or a frame extracted from Mikey's own footage. Cropped and scaled only; nothing regenerated.", "");
  if (p.format === "montage") {
    p.segments.forEach((s, i) => L.push(`${i + 1}. \`${s.path}\` ${mmss(s.start)}–${mmss(s.start + s.dur)}${s.headline ? ` · "${s.headline}"` : ""}`));
  } else {
    p.slides.forEach((s, i) => L.push(`${String(i + 1).padStart(2, "0")}.jpg ← \`${s.src.path}\`${s.src.t !== undefined ? ` @ ${mmss(s.src.t)}` : ""}${s.note ? ` (${s.note})` : ""}`));
  }
  if (p.cautions?.length) {
    L.push("", "## Before posting");
    for (const c of p.cautions) L.push(`- ${c}`);
  }
  return L.join("\n") + "\n";
}

async function thumb(path, w = 360) {
  const b = await sharp(path).resize(w).jpeg({ quality: 72 }).toBuffer();
  return `data:image/jpeg;base64,${b.toString("base64")}`;
}

async function previewHtml(week, posts) {
  const lead = posts.find((p) => p.lead) ?? posts[0];
  const card = async (p, big = false) => {
    const imgs = [];
    for (const f of p.files.slice(0, big ? 10 : 10)) imgs.push(`<img src="${await thumb(f, big ? 300 : 220)}" alt="">`);
    const badge = p.format === "montage" ? `Reel · ${Math.round(p.duration)}s` : `Carousel · ${p.slides.length}`;
    return `<section class="post${big ? " lead" : ""}">
  <header><span class="day">${DAY_NAMES[p.day]}</span><span class="badge">${badge}</span>${p.lead ? '<span class="badge gold">Strongest this week</span>' : ""}</header>
  <h2>${esc(p.title)}</h2>
  <p class="take">${esc(p.takeaway)}</p>
  <div class="strip">${imgs.join("")}</div>
  <details><summary>Caption</summary><pre>${esc(captionText(p))}</pre></details>
  <p class="folder">Folder: ${esc(p.folder)}</p>
</section>`;
  };
  const body = [await card(lead, true)];
  for (const p of posts) body.push(await card(p));
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>LVINIT Week of ${esc(week.weekOf)}</title>
<style>
:root{--bg:#FAFAF8;--ink:#111;--muted:#6E6A63;--line:#E8E6E1;--gold:#C8A46A;--blue:#2B6CB0;--card:#fff}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]){--bg:#121212;--ink:#F2F0EC;--muted:#A8A39A;--line:#2A2A2A;--card:#1A1A1A}}
:root[data-theme="dark"]{--bg:#121212;--ink:#F2F0EC;--muted:#A8A39A;--line:#2A2A2A;--card:#1A1A1A}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--ink);font:15px/1.5 Inter,system-ui,-apple-system,Segoe UI,Arial,sans-serif}
main{max-width:1100px;margin:0 auto;padding:24px 16px 64px}
h1{font:700 30px/1.2 "Playfair Display",Georgia,serif;margin:0 0 4px}.sub{color:var(--muted);margin:0 0 24px}
.post{background:var(--card);border:1px solid var(--line);border-radius:12px;padding:16px;margin:0 0 16px}
.post.lead{border-color:var(--gold)}.post.exceptions{border-color:#B45309}
header{display:flex;gap:8px;align-items:center;flex-wrap:wrap}.day{font-weight:700}
.badge{font-size:12px;border:1px solid var(--line);border-radius:99px;padding:2px 8px;color:var(--muted)}.badge.gold{border-color:var(--gold);color:var(--gold)}
h2{font-size:18px;margin:8px 0 4px}.take{margin:0 0 10px;color:var(--muted)}
.strip{display:flex;gap:6px;overflow-x:auto;padding-bottom:6px}.strip img{height:220px;width:auto;border-radius:6px;flex:none}
.lead .strip img{height:300px}
details{margin-top:8px}summary{cursor:pointer;color:var(--blue)}pre{white-space:pre-wrap;font:14px/1.5 inherit;background:transparent;margin:8px 0 0}
.folder{font-size:12px;color:var(--muted);margin:8px 0 0}
</style></head><body><main>
<h1>LVINIT · Week of ${esc(week.weekOf)}</h1>
<p class="sub">${posts.length} finished posts, Monday–Sunday. Drafts only; nothing has been published. ${esc(week.note ?? "")}</p>
${(week.exceptions ?? []).length ? `<section class="post exceptions"><h2>Needs your decision</h2>${week.exceptions.map((x) => `<p><b>${esc(DAY_NAMES[x.day] ?? x.day)}: ${esc(x.title ?? "")}</b><br>${x.issues.map((i) => esc(i.message)).join("<br>")}<br><i>${esc(x.resolution)}</i></p>`).join("")}</section>` : ""}
${body.join("\n")}
${(week.gaps ?? []).length ? `<p class="folder">${week.gaps.map((g) => esc(g)).join("<br>")}</p>` : ""}
</main></body></html>`;
}

/** Render one post into its folder. Used for the whole week and for repairs. */
export async function renderPost(p, i, { weekDir, week, mediaRoot }) {
  const media = (x) => (isAbsolute(x) ? x : join(mediaRoot, x));
  const folder = `${i + 1}-${p.day}-${p.slug}`;
  const dir = join(weekDir, folder);
  rmSync(dir, { recursive: true, force: true });
  mkdirSync(dir, { recursive: true });
  const files = [];
  let duration = 0;
  if (p.format === "montage") {
    const mp4 = join(dir, "reel.mp4");
    await renderMontage(p.segments.map((s) => ({ ...s, path: media(s.path) })), mp4);
    duration = p.segments.reduce((n, s) => n + s.dur, 0);
    // Preview/review frames: one per segment.
    p.segments.forEach((s, k) => {
      const f = join(dir, `.frame-${k}.jpg`);
      const t = p.segments.slice(0, k).reduce((n, x) => n + x.dur, 0) + Math.min(1, s.dur / 2);
      execFileSync("ffmpeg", ["-loglevel", "error", "-y", "-ss", String(t), "-i", mp4, "-frames:v", "1", "-q:v", "4", f]);
      files.push(f);
    });
  } else {
    for (const [k, s] of p.slides.entries()) {
      const f = join(dir, `${String(k + 1).padStart(2, "0")}.jpg`);
      await renderSlide({ ...s, src: { ...s.src, path: media(s.src.path) } }, f, { counter: `${k + 1}/${p.slides.length}` });
      files.push(f);
    }
  }
  writeFileSync(join(dir, "caption.txt"), captionText(p));
  writeFileSync(join(dir, "notes.md"), notesMd(p, week));
  return { ...p, folder, dir, files, duration };
}

/** preview.html + ZIP for rendered posts. */
export async function packageWeek(week, weekDir, posts, log = () => {}) {
  writeFileSync(join(weekDir, "preview.html"), await previewHtml(week, posts));
  for (const p of posts) for (const f of readdirSync(p.dir)) if (f.startsWith(".frame-")) rmSync(join(p.dir, f));
  const zip = join(weekDir, `LVINIT-week-${week.weekOf}.zip`);
  rmSync(zip, { force: true });
  const tar = process.platform === "win32" ? join(process.env.SystemRoot ?? "C:\\Windows", "System32", "tar.exe") : "tar";
  execFileSync(tar, ["-a", "-c", "-f", zip, "-C", weekDir, ...posts.map((p) => p.folder), "preview.html"]);
  log(`Preview: ${join(weekDir, "preview.html")}\nZIP: ${zip}`);
  return zip;
}

export async function produce({ spec, out, mediaRoot, log = console.log }) {
  const week = JSON.parse(readFileSync(spec, "utf8"));
  const weekDir = join(out, week.folderName ?? `Week of ${week.weekOf}`);
  mkdirSync(weekDir, { recursive: true });
  const posts = [];
  for (const [i, p] of week.posts.entries()) {
    const r = await renderPost(p, i, { weekDir, week, mediaRoot });
    posts.push(r);
    log(`✓ ${r.folder} (${p.format === "montage" ? `reel ${r.duration}s` : `${p.slides.length} slides`})`);
  }
  const zip = await packageWeek(week, weekDir, posts, log);
  return { weekDir, zip, posts };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const a = parseArgs(process.argv.slice(2));
  if (!a.spec) {
    console.log("usage: node scripts/executive-producer/produce.mjs --spec=<week.json> [--out=DIR] [--media-root=C:\\LVINIT]");
    process.exit(2);
  }
  const out = a.out ?? join(process.env.USERPROFILE ?? ".", "OneDrive", "Documents", "LVINIT", "Weekly Posts");
  produce({ spec: resolve(a.spec), out, mediaRoot: a["media-root"] ?? "C:\\LVINIT" }).catch((e) => {
    console.error(e?.stack ?? e);
    process.exit(1);
  });
}
